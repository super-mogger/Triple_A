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
import { Profile, Membership } from '../types/profile';
import { auth } from '../config/firebase';

interface FirestoreResponse<T> {
  data: T | null;
  error: string | null;
}

// Profile Operations
export const getProfile = async (userId: string): Promise<FirestoreResponse<Profile>> => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return { data: null, error: 'Profile not found' };
    }

    const data = profileSnap.data();
    const profile: Profile = {
      id: profileSnap.id,
      user_id: userId,
      email: data.email || '',
      username: data.username || '',
      photoURL: data.photoURL,
      avatar_url: data.avatar_url,
      full_name: data.full_name,
      experience_level: data.experience_level,
      personal_info: {
        date_of_birth: data.personal_info?.date_of_birth || '',
        gender: data.personal_info?.gender || 'male',
        height: data.personal_info?.height || 0,
        weight: data.personal_info?.weight || 0,
        contact: data.personal_info?.contact || '',
        blood_type: data.personal_info?.blood_type || ''
      },
      medical_info: {
        conditions: data.medical_info?.conditions || ''
      },
      preferences: {
        activity_level: data.preferences?.activity_level || 'beginner',
        dietary_preferences: data.preferences?.dietary_preferences || [],
        workout_preferences: data.preferences?.workout_preferences || [],
        fitness_goals: data.preferences?.fitness_goals || [],
        fitness_level: data.preferences?.fitness_level,
        dietary: data.preferences?.dietary,
        workout_time: data.preferences?.workout_time,
        workout_days: data.preferences?.workout_days
      },
      stats: data.stats || {
        workouts_completed: 0,
        total_time: 0,
        calories_burned: 0,
        attendance_streak: 0
      },
      created_at: data.created_at || Timestamp.now(),
      updated_at: data.updated_at || Timestamp.now()
    };

    return { data: profile, error: null };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { data: null, error: 'Failed to get profile' };
  }
};

export const updateProfile = async (userId: string, data: Partial<Profile>): Promise<FirestoreResponse<void>> => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    
    // Convert Timestamp objects to Firestore timestamps
    const processedData: Record<string, any> = {
      ...data,
      updated_at: Timestamp.now(),
      personal_info: data.personal_info ? {
        ...data.personal_info,
      } : undefined,
      medical_info: data.medical_info ? {
        ...data.medical_info,
      } : undefined,
      preferences: data.preferences ? {
        ...data.preferences,
      } : undefined,
      stats: data.stats ? {
        ...data.stats,
      } : undefined
    };

    // Remove undefined fields to prevent overwriting with null
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined) {
        delete processedData[key];
      }
    });

    await updateDoc(profileRef, processedData);
    return { data: null, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: 'Failed to update profile' };
  }
};

export const createProfile = async (userId: string, data: Profile): Promise<FirestoreResponse<void>> => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, {
      ...data,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return { data: null, error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { data: null, error: 'Failed to create profile' };
  }
};

// Membership Operations
export async function getMembership(userId: string): Promise<FirestoreResponse<Membership | null>> {
  try {
    const membershipRef = collection(db, 'memberships');
    const q = query(membershipRef, where('userId', '==', userId), orderBy('created_at', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { data: null, error: null };
    }

    const membershipData = querySnapshot.docs[0].data() as Membership;
    return { data: membershipData, error: null };
  } catch (error) {
    console.error('Error getting membership:', error);
    return { data: null, error: 'Failed to get membership data' };
  }
}

export async function checkMembershipStatus(userId: string): Promise<{ 
  isActive: boolean; 
  membership: Membership | null;
  error: string | null;
}> {
  try {
    const { data: membership, error } = await getMembership(userId);
    
    if (error) {
      return { isActive: false, membership: null, error };
    }

    if (!membership) {
      return { isActive: false, membership: null, error: null };
    }

    const now = Timestamp.now();
    const isActive = membership.is_active && 
                    membership.payment_status === 'completed' && 
                    now.toMillis() <= membership.end_date.toMillis();

    // If membership is not active, return null membership to ensure UI updates
    if (!isActive) {
      return { 
        isActive: false, 
        membership: null,
        error: null 
      };
    }

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
      error: 'Failed to check membership status' 
    };
  }
}

export async function createMembership(
  userId: string,
  planId: string,
  planName: string,
  amount?: number,
  duration?: number,
  paymentMethod?: string
): Promise<FirestoreResponse<void>> {
  try {
    const membershipRef = collection(db, 'memberships');
    const now = Timestamp.now();

    const membershipData = {
      userId,
      plan_id: planId,
      plan_name: planName,
      amount: amount || 0,
      duration: duration || 1,
      payment_method: paymentMethod || 'admin',
      payment_status: 'completed',
      is_active: true,
      start_date: now,
      end_date: Timestamp.fromMillis(now.toMillis() + (duration || 1) * 30 * 24 * 60 * 60 * 1000),
      created_at: now,
      updated_at: now
    };

    await addDoc(membershipRef, membershipData);
    return { data: undefined, error: null };
  } catch (error) {
    console.error('Error creating membership:', error);
    return { data: undefined, error: 'Failed to create membership' };
  }
} 