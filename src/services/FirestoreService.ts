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
  limit
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
    const membershipRef = collection(db, 'memberships');
    
    const membershipQuery = query(
      membershipRef,
      where('userId', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(membershipQuery);

    if (querySnapshot.empty) {
      console.log('No membership found for user:', userId);
      return { data: null, error: null };
    }

    let mostRecentMembership: Membership | null = null;
    let mostRecentDate = new Date(0);

    const now = new Date();

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const createdAt = data.created_at?.toDate() || new Date(0);
      const endDate = data.end_date instanceof Timestamp ? data.end_date.toDate() : null;
      const startDate = data.start_date instanceof Timestamp ? data.start_date.toDate() : null;

      if (endDate && startDate && createdAt > mostRecentDate && data.payment_status === 'completed') {
        mostRecentDate = createdAt;
        mostRecentMembership = {
          id: doc.id,
          ...data
        } as Membership;
      }
    }

    if (!mostRecentMembership) {
      console.log('No valid membership found');
      return { data: null, error: null };
    }

    const endDate = mostRecentMembership.end_date instanceof Timestamp ? mostRecentMembership.end_date.toDate() : null;
    const startDate = mostRecentMembership.start_date instanceof Timestamp ? mostRecentMembership.start_date.toDate() : null;

    const shouldBeActive = endDate && startDate 
      ? now >= startDate && now <= endDate
      : false;

    if (mostRecentMembership.is_active !== shouldBeActive) {
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, {
          is_active: doc.id === mostRecentMembership.id ? shouldBeActive : false,
          updated_at: serverTimestamp()
        });
      }
      mostRecentMembership.is_active = shouldBeActive;
    }

    return { data: mostRecentMembership, error: null };
  } catch (error) {
    console.error('Error fetching membership:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch membership' 
    };
  }
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

export async function createMembership(userId: string, membershipData: Partial<Membership>): Promise<{ data: Membership | null; error: any }> {
  try {
    const membershipRef = collection(db, 'memberships');

    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    const duration = membershipData.duration || 1;
    endDate.setMonth(endDate.getMonth() + duration);

    // First deactivate all existing memberships
    const existingMemberships = await getDocs(
      query(
        collection(db, 'memberships'),
        where('userId', '==', userId)
      )
    );

    for (const doc of existingMemberships.docs) {
      await updateDoc(doc.ref, {
        is_active: false,
        updated_at: serverTimestamp()
      });
    }

    const membership = {
      amount: membershipData.amount || 699,
      created_at: serverTimestamp(),
      duration: duration,
      end_date: Timestamp.fromDate(endDate),
      is_active: true,
      payment_method: membershipData.payment_method || 'admin',
      payment_status: 'completed',
      plan_id: membershipData.plan_id || 'MONTHLY',
      plan_name: membershipData.plan_name || 'Monthly Plan',
      start_date: Timestamp.fromDate(startDate),
      updated_at: serverTimestamp(),
      userId: userId
    };
    
    const docRef = await addDoc(membershipRef, membership);
    console.log('Created membership with ID:', docRef.id);
    
    // Return the created membership with its ID
    return { 
      data: { 
        id: docRef.id, 
        ...membership 
      } as Membership, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating membership:', error);
    return { data: null, error };
  }
} 