import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Exercise } from '../types/exercise';

export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(exercisesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const exerciseRef = doc(db, 'exercises', id);
    const snapshot = await getDoc(exerciseRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Exercise;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error;
  }
};

export const getExercisesByCategory = async (category: string): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const q = query(exercisesRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    console.error('Error fetching exercises by category:', error);
    throw error;
  }
};

export const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const q = query(exercisesRef, where('muscleGroup', '==', muscleGroup));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    console.error('Error fetching exercises by muscle group:', error);
    throw error;
  }
};

export const getExercisesByDifficulty = async (difficulty: string): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const q = query(exercisesRef, where('difficulty', '==', difficulty));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
  } catch (error) {
    console.error('Error fetching exercises by difficulty:', error);
    throw error;
  }
}; 