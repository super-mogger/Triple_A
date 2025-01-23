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
      return { data: profileSnap.data() as Profile, error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { data: null, error };
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, {
      ...data,
      updated_at: Timestamp.now()
    }, { merge: true });
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
export async function getMembership(userId: string) {
  try {
    const membershipRef = collection(db, 'memberships');
    const q = query(
      membershipRef,
      where('user_id', '==', userId),
      where('is_active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { data: null, error: 'No active membership found' };
    }
    const membership = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as Membership;
    return { data: membership, error: null };
  } catch (error) {
    console.error('Error getting membership:', error);
    return { data: null, error };
  }
}

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