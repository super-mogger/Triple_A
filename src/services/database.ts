import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, WorkoutLog, DietLog } from '../types/database';

// User Profile Functions
export const createUserProfile = async (userProfile: UserProfile) => {
  const userRef = doc(db, 'users', userProfile.uid);
  await setDoc(userRef, {
    ...userProfile,
    joinDate: Timestamp.fromDate(userProfile.joinDate),
    lastUpdated: Timestamp.fromDate(userProfile.lastUpdated)
  });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    lastUpdated: Timestamp.fromDate(new Date())
  });
};

// Workout Functions
export const addWorkoutLog = async (workoutLog: WorkoutLog) => {
  const workoutRef = collection(db, 'workouts');
  return await addDoc(workoutRef, {
    ...workoutLog,
    date: Timestamp.fromDate(workoutLog.date)
  });
};

export const getWorkoutLogs = async (userId: string, limit?: number) => {
  const workoutRef = collection(db, 'workouts');
  const q = query(
    workoutRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit ? limit(limit) : limit(100)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as WorkoutLog[];
};

// Diet Functions
export const addDietLog = async (dietLog: DietLog) => {
  const dietRef = collection(db, 'diets');
  return await addDoc(dietRef, {
    ...dietLog,
    date: Timestamp.fromDate(dietLog.date)
  });
};

export const getDietLogs = async (userId: string, limit?: number) => {
  const dietRef = collection(db, 'diets');
  const q = query(
    dietRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit ? limit(limit) : limit(100)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DietLog[];
};

// Progress Tracking Functions
export const addProgressEntry = async (userId: string, data: {
  weight?: number;
  measurements?: Record<string, number>;
  photos?: string[];
  date: Date;
}) => {
  const progressRef = collection(db, 'progress');
  return await addDoc(progressRef, {
    userId,
    ...data,
    date: Timestamp.fromDate(data.date)
  });
};

export const getProgressHistory = async (userId: string) => {
  const progressRef = collection(db, 'progress');
  const q = query(
    progressRef,
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 