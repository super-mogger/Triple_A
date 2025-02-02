import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  serverTimestamp,
  addDoc,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import type { FirestoreProfile, FirestoreMembership, FirestorePayment } from '../types/firestore.types';
import { Profile } from '../types/profile';
import { auth } from '../config/firebase';

// Types
export interface Membership {
  id?: string;
  amount: number;
  created_at: Timestamp;
  duration: number;
  end_date: Timestamp;
  is_active: boolean;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  plan_id: string;
  plan_name: string;
  start_date: Timestamp;
  updated_at: Timestamp;
  userId: string;
}

// Profile Operations
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
  try {
    console.log('Fetching profile for user:', userId);
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      console.log('Profile found:', data);
      return { 
        data: {
          id: profileSnap.id,
          user_id: userId,
          email: data.email || '',
          username: data.username || '',
          photoURL: data.photoURL || '',
          personal_info: {
            height: data.personal_info?.height || 170,
            weight: data.personal_info?.weight || 70,
            gender: data.personal_info?.gender || 'male',
            date_of_birth: data.personal_info?.date_of_birth || '',
            blood_type: data.personal_info?.blood_type || '',
            contact: data.personal_info?.contact || ''
          },
          medical_info: {
            conditions: data.medical_info?.conditions || ''
          },
          preferences: {
            dietary: data.preferences?.dietary || [],
            workout_days: data.preferences?.workout_days || [],
            fitness_goals: data.preferences?.fitness_goals || [],
            fitness_level: data.preferences?.fitness_level || 'beginner',
            activity_level: data.preferences?.activity_level || 'moderate'
          },
          created_at: data.created_at || Timestamp.now(),
          updated_at: data.updated_at || Timestamp.now()
        } as Profile,
        error: null
      };
    }
    console.log('Profile not found for user:', userId);
    return { data: null, error: 'Profile not found' };
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return { data: null, error: error.message };
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<{ error: any }> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const updates = {
      ...data,
      email: user.email || data.email,
      username: user.displayName || data.username,
      photoURL: user.photoURL || data.photoURL,
      updated_at: Timestamp.now()
    };

    await updateDoc(doc(db, 'profiles', userId), updates);
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
}

export async function createProfile(userId: string, data: Profile): Promise<{ error: string | null }> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const profileData = {
      id: userId,
      user_id: userId,
      email: user.email || '',
      username: user.displayName || user.email?.split('@')[0] || `user_${userId.substring(0, 6)}`,
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      personal_info: {
        contact: '',
        blood_type: '',
        date_of_birth: '',
        gender: 'male',
        height: 170,
        weight: 70
      },
      medical_info: {
        conditions: ''
      },
      preferences: {
        activity_level: 'moderate',
        dietary: [],
        fitness_goals: [],
        fitness_level: 'beginner',
        workout_days: []
      },
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    await setDoc(doc(db, 'profiles', userId), profileData, { merge: true });
    return { error: null };
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return { error: error.message };
  }
}

// Membership Operations
export const getMembership = async (userId: string): Promise<{ data: Membership | null; error: string | null }> => {
  try {
    console.log('Fetching membership for user:', userId);
    
    // First try to get from global memberships collection
    const membershipRef = collection(db, 'memberships');
    const membershipQuery = query(
      membershipRef,
      where('userId', '==', userId),
      orderBy('created_at', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(membershipQuery);
    
    if (querySnapshot.empty) {
      console.log('No membership found in global collection, checking user subcollection...');
      
      // Try user's membership subcollection as fallback
      const userMembershipRef = doc(collection(db, 'users', userId, 'membership'), 'current');
      const userMembershipDoc = await getDoc(userMembershipRef);
      
      if (!userMembershipDoc.exists()) {
        console.log('No membership found for user:', userId);
        return { data: null, error: null };
      }
      
      const membershipData = userMembershipDoc.data() as Membership;
      return handleMembershipData(membershipData, userMembershipDoc.id);
    }

    // Use the most recent membership from global collection
    const membershipDoc = querySnapshot.docs[0];
    const membershipData = membershipDoc.data() as Membership;
    
    // If found in global but not in user's collection, sync it
    const userMembershipRef = doc(collection(db, 'users', userId, 'membership'), 'current');
    await setDoc(userMembershipRef, {
      ...membershipData,
      updated_at: serverTimestamp()
    });

    return handleMembershipData(membershipData, membershipDoc.id);
  } catch (error) {
    console.error('Error fetching membership:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch membership'
    };
  }
};

// Helper function to handle membership data processing
const handleMembershipData = async (
  membershipData: Membership, 
  docId: string
): Promise<{ data: Membership | null; error: string | null }> => {
  const now = new Date().getTime();
  const endDate = membershipData.end_date instanceof Timestamp ? 
    membershipData.end_date.toDate().getTime() : null;
  
  const shouldBeActive = endDate ? now <= endDate : false;
  
  if (membershipData.is_active !== shouldBeActive) {
    // Update active status if it has changed
    const userMembershipRef = doc(collection(db, 'users', membershipData.userId, 'membership'), 'current');
    await updateDoc(userMembershipRef, {
      is_active: shouldBeActive,
      updated_at: serverTimestamp()
    });
    membershipData.is_active = shouldBeActive;
  }

  return { 
    data: {
      ...membershipData,
      id: docId
    }, 
    error: null 
  };
};

export const checkMembershipStatus = async (userId: string): Promise<{
  isActive: boolean;
  membership: Membership | null;
  error: string | null;
}> => {
  try {
    const { data: membership, error } = await getMembership(userId);
    
    if (error) {
      return {
        isActive: false,
        membership: null,
        error
      };
    }

    if (!membership) {
      return {
        isActive: false,
        membership: null,
        error: null
      };
    }

    const now = new Date().getTime();
    const endDate = membership.end_date.toDate().getTime();
    const isActive = membership.is_active && now <= endDate && membership.payment_status === 'completed';

    return {
      isActive,
      membership,
      error: null
    };
  } catch (error) {
    console.error('Error checking membership status:', error);
    return {
      isActive: false,
      membership: null,
      error: error instanceof Error ? error.message : 'Failed to check membership status'
    };
  }
};

export async function createMembership(
  userId: string, 
  membershipData: Partial<Membership>
): Promise<{ data: Membership | null; error: any }> {
  try {
    const batch = writeBatch(db);
    
    // Prepare membership data
    const now = serverTimestamp();
    const completeData: Membership = {
      ...membershipData,
      userId,
      created_at: now,
      updated_at: now,
      is_active: true,
      payment_status: 'completed'
    } as Membership;

    // Store in user's membership subcollection
    const userMembershipRef = doc(collection(db, 'users', userId, 'membership'), 'current');
    batch.set(userMembershipRef, completeData);

    // Also store in global memberships collection for admin access
    const globalMembershipRef = doc(collection(db, 'memberships'));
    batch.set(globalMembershipRef, {
      ...completeData,
      membershipId: globalMembershipRef.id
    });

    // Update user's profile with membership status
    const profileRef = doc(db, 'profiles', userId);
    batch.update(profileRef, {
      'membership_status': 'active',
      'membership_end_date': membershipData.end_date,
      'membership_plan': membershipData.plan_id,
      'updated_at': now
    });

    await batch.commit();

    return {
      data: {
        ...completeData,
        id: userMembershipRef.id
      },
      error: null
    };
  } catch (error) {
    console.error('Error creating membership:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create membership'
    };
  }
} 