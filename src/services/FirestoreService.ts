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
import { updateProfile as updateAuthProfile } from 'firebase/auth';

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
      aadhaarCardFrontURL: data.aadhaarCardFrontURL,
      aadhaarCardBackURL: data.aadhaarCardBackURL,
      isVerified: data.isVerified || false,
      created_at: data.created_at || Timestamp.now(),
      updated_at: data.updated_at || Timestamp.now()
    };

    // Ensure auth profile is in sync with Firestore profile
    // This ensures Firestore is the source of truth
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await syncProfileToAuth(profile);
    }

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

    // Update Firestore first
    await updateDoc(profileRef, processedData);

    // If profile photo is updated, sync to auth immediately
    // This ensures changes from admin app persist
    if (data.photoURL && auth.currentUser && auth.currentUser.uid === userId) {
      await syncProfilePhotoToAuth(userId, data.photoURL);
    } else if (data.username && auth.currentUser && auth.currentUser.uid === userId) {
      // If username is updated, also update displayName in auth
      await updateAuthProfile(auth.currentUser, { 
        displayName: data.username 
      });
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: 'Failed to update profile' };
  }
};

// Helper to sync profile photo to Auth
export const syncProfilePhotoToAuth = async (userId: string, photoURL: string): Promise<void> => {
  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      // Force refresh to avoid caching issues
      await updateAuthProfile(auth.currentUser, { photoURL });
      console.log('Auth profile photo updated successfully');
      
      // Force a reload of the current user to update the auth state
      // This is critical to ensure the new photo URL is available immediately
      await auth.currentUser.reload();
    }
  } catch (error) {
    console.error('Error syncing profile photo to auth:', error);
  }
};

// Helper to sync profile data to Auth
export const syncProfileToAuth = async (profile: Profile): Promise<void> => {
  try {
    if (auth.currentUser && auth.currentUser.uid === profile.user_id) {
      // Check if auth data doesn't match profile data
      const needsUpdate = (
        (profile.photoURL && profile.photoURL !== auth.currentUser.photoURL) ||
        (profile.username && profile.username !== auth.currentUser.displayName)
      );
      
      if (needsUpdate) {
        await updateAuthProfile(auth.currentUser, { 
          photoURL: profile.photoURL || auth.currentUser.photoURL,
          displayName: profile.username || auth.currentUser.displayName
        });
        
        // Force a reload of the current user to update the auth state
        await auth.currentUser.reload();
        
        console.log('Auth profile updated successfully');
      }
    }
  } catch (error) {
    console.error('Error syncing profile to auth:', error);
  }
};

export const createProfile = async (userId: string, data: Profile): Promise<FirestoreResponse<void>> => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    
    // Prepare data with timestamps
    const profileData = {
      ...data,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };
    
    // Create in Firestore
    await setDoc(profileRef, profileData);
    
    // Sync with Auth if applicable
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updateAuthProfile(auth.currentUser, {
        displayName: data.username || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL
      });
    }
    
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

// New function to update verification status (for admin sync)
export async function updateVerificationStatus(
  userId: string, 
  isVerified: boolean
): Promise<FirestoreResponse<void>> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isVerified,
      updated_at: Timestamp.now()
    });
    return { data: undefined, error: null };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { data: undefined, error: 'Failed to update verification status' };
  }
}

// New function to update Aadhaar card images (for admin sync)
export async function updateAadhaarImages(
  userId: string,
  frontURL?: string,
  backURL?: string
): Promise<FirestoreResponse<void>> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const updateData: Record<string, any> = {
      updated_at: Timestamp.now()
    };
    
    if (frontURL) updateData.aadhaarCardFrontURL = frontURL;
    if (backURL) updateData.aadhaarCardBackURL = backURL;
    
    // Auto-verify if both images are present
    if (frontURL && backURL) {
      updateData.isVerified = true;
    }
    
    await updateDoc(profileRef, updateData);
    return { data: undefined, error: null };
  } catch (error) {
    console.error('Error updating Aadhaar images:', error);
    return { data: undefined, error: 'Failed to update Aadhaar images' };
  }
}

// Add this with other interfaces
export interface TrainerWorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  days: {
    day: string;
    exercises: Array<{
      exerciseId: string;
      exerciseName: string;
      sets: number;
      reps: string;
      rest: number;
      weight: string;
    }>;
    notes: string;
  }[];
}

// Add this with other functions
export async function getTrainerWorkoutPlans(userId: string): Promise<FirestoreResponse<TrainerWorkoutPlan[]>> {
  try {
    const workoutPlansRef = collection(db, 'workout_plans');
    const q = query(workoutPlansRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { data: [], error: null };
    }

    const workoutPlans: TrainerWorkoutPlan[] = [];
    querySnapshot.forEach((doc) => {
      const plan = doc.data();
      workoutPlans.push({
        id: doc.id,
        userId: plan.userId,
        name: plan.name,
        description: plan.description || "",
        level: plan.level || "intermediate",
        duration: plan.duration || 0,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
        created_by: plan.created_by || "system",
        days: plan.days || []
      });
    });

    return { data: workoutPlans, error: null };
  } catch (error) {
    console.error('Error getting trainer workout plans:', error);
    return { data: [], error: 'Failed to get trainer workout plans' };
  }
} 