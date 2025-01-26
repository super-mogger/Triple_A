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
  addDoc
} from 'firebase/firestore';
import type { FirestoreProfile, FirestoreMembership, FirestorePayment } from '../types/firestore.types';
import { Profile } from '../types/profile';

// Types
export interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  start_date: Timestamp;
  end_date: Timestamp;
  is_active: boolean;
  amount_paid: number;
  payment_status: 'pending' | 'completed' | 'failed';
  features?: string[];
  description?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  start_time: Timestamp;
  end_time?: Timestamp;
  duration?: number;
  type: string;
  intensity: 'low' | 'medium' | 'high';
  calories_burned?: number;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface DietPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: Timestamp;
  end_date?: Timestamp;
  calories_target?: number;
  protein_target?: number;
  carbs_target?: number;
  fat_target?: number;
  meals: any[];
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Attendance {
  id: string;
  user_id: string;
  check_in: Timestamp;
  check_out?: Timestamp;
  duration?: number;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Profile Operations
export async function getProfile(userId: string) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      // Convert Firestore data to our Profile type with all required fields
      return { 
        data: {
          id: profileSnap.id,
          email: data.email || '',
          username: data.username || '',
          photoURL: data.photoURL || '',
          personal_info: {
            height: data.personal_info?.height || 0,
            weight: data.personal_info?.weight || 0,
            gender: data.personal_info?.gender || 'male',
            date_of_birth: data.personal_info?.date_of_birth || '',
            blood_type: data.personal_info?.blood_type || '',
            contact: data.personal_info?.contact || ''
          },
          medical_info: {
            conditions: data.medical_info?.conditions || ''
          },
          preferences: {
            activity_level: data.preferences?.activity_level || 'beginner',
            dietary_preferences: data.preferences?.dietary_preferences || [],
            workout_preferences: data.preferences?.workout_preferences || [],
            fitness_goals: data.preferences?.fitness_goals || []
          },
          stats: {
            bmi: data.stats?.bmi || '0',
            activity_level: data.stats?.activity_level || 'beginner'
          },
          created_at: data.created_at,
          updated_at: data.updated_at
        } as FirestoreProfile,
        error: null
      };
    }
    return { data: null, error: 'Profile not found' };
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return { data: null, error: error.message };
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const updateData = {
      ...data,
      updated_at: Timestamp.now(),
      // Ensure nested objects are properly merged
      personal_info: data.personal_info ? {
        ...data.personal_info,
        height: Number(data.personal_info.height) || 0,
        weight: Number(data.personal_info.weight) || 0
      } : undefined,
      preferences: data.preferences ? {
        ...data.preferences,
        dietary: Array.isArray(data.preferences.dietary) ? data.preferences.dietary : [],
        workout_days: Array.isArray(data.preferences.workout_days) ? data.preferences.workout_days : [],
        fitness_goals: Array.isArray(data.preferences.fitness_goals) ? data.preferences.fitness_goals : []
      } : undefined
    };
    
    await setDoc(profileRef, updateData, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
}

export async function createProfile(userId: string, data: Profile) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, data);
    return { error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { error };
  }
}

// Membership Operations
export const getMembership = async (userId: string) => {
  try {
    // First try to get from user's membership subcollection
    const userMembershipRef = doc(db, 'users', userId, 'membership', 'current');
    const userMembershipDoc = await getDoc(userMembershipRef);
    
    if (userMembershipDoc.exists()) {
      const membership = {
        id: userMembershipDoc.id,
        ...userMembershipDoc.data()
      } as FirestoreMembership;
      return { data: membership, error: null };
    }

    // If not found in subcollection, try the main memberships collection
    const membershipRef = doc(db, 'memberships', userId);
    const membershipDoc = await getDoc(membershipRef);
    
    if (membershipDoc.exists()) {
      const membership = {
        id: membershipDoc.id,
        ...membershipDoc.data()
      } as FirestoreMembership;
      return { data: membership, error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error getting membership:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Failed to get membership') };
  }
};

export async function createMembership(userId: string, membershipData: Partial<Membership>) {
  try {
    const membershipRef = collection(db, 'memberships');
    const membership = {
      ...membershipData,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    const docRef = await addDoc(membershipRef, membership);
    return { data: { id: docRef.id, ...membership }, error: null };
  } catch (error) {
    console.error('Error creating membership:', error);
    return { data: null, error };
  }
}

export async function updateMembership(userId: string, membershipData: Partial<Membership>) {
  try {
    const membershipRef = doc(db, 'memberships', userId);
    await updateDoc(membershipRef, {
      ...membershipData,
      updated_at: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Error updating membership:', error);
    return { error };
  }
}

// Payment Operations
export async function createPayment(paymentData: Omit<FirestorePayment, 'created_at' | 'updated_at'>) {
  try {
    const paymentRef = doc(db, 'payments', paymentData.id);
    await setDoc(paymentRef, {
      ...paymentData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { error };
  }
}

export async function getPaymentHistory(userId: string) {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const payments: FirestorePayment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as FirestorePayment);
    });
    
    return { data: payments, error: null };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return { data: null, error };
  }
}

export async function updatePaymentStatus(paymentId: string, status: FirestorePayment['status']) {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status,
      updated_at: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { error };
  }
}

// Workout Session Functions
export async function createWorkoutSession(userId: string, sessionData: Partial<WorkoutSession>) {
  try {
    const sessionRef = collection(db, 'workout_sessions');
    const session = {
      ...sessionData,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    const docRef = await addDoc(sessionRef, session);
    return { data: { id: docRef.id, ...session }, error: null };
  } catch (error) {
    console.error('Error creating workout session:', error);
    return { data: null, error };
  }
}

// Diet Plan Functions
export async function createDietPlan(userId: string, planData: Partial<DietPlan>) {
  try {
    const planRef = collection(db, 'diet_plans');
    const plan = {
      ...planData,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    const docRef = await addDoc(planRef, plan);
    return { data: { id: docRef.id, ...plan }, error: null };
  } catch (error) {
    console.error('Error creating diet plan:', error);
    return { data: null, error };
  }
}

// Attendance Functions
export async function markAttendance(userId: string, attendanceData: Partial<Attendance>) {
  try {
    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('user_id', '==', userId),
      where('check_in', '>=', today)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { data: null, error: 'Attendance already marked for today' };
    }

    const attendance = {
      ...attendanceData,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    const docRef = await addDoc(attendanceRef, attendance);
    return { data: { id: docRef.id, ...attendance }, error: null };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { data: null, error };
  }
}

export async function getAttendance(userId: string, startDate: Date, endDate: Date) {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('user_id', '==', userId),
      where('check_in', '>=', startDate),
      where('check_in', '<=', endDate)
    );
    
    const querySnapshot = await getDocs(q);
    const attendance = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Attendance[];
    
    return { data: attendance, error: null };
  } catch (error) {
    console.error('Error getting attendance:', error);
    return { data: null, error };
  }
} 