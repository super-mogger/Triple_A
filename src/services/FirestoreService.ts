import { Exercise } from '../types/exercise';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const q = query(exercisesRef, where('muscleGroup', '==', muscleGroup));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      } as Exercise;
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const querySnapshot = await getDocs(exercisesRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      } as Exercise;
    });
  } catch (error) {
    console.error('Error fetching all exercises:', error);
    return [];
  }
}; 