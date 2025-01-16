import { Exercise } from '../types/exercise';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
  try {
    console.log('Fetching exercises for muscle group:', muscleGroup);
    const exercisesRef = collection(db, 'exercises');
    const q = query(exercisesRef, where('muscleGroup', '==', muscleGroup));
    const querySnapshot = await getDocs(q);
    
    const exercises = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      } as Exercise;
    });

    console.log(`Found ${exercises.length} exercises for ${muscleGroup}:`, exercises);
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const getAllExercises = async (): Promise<Exercise[]> => {
  try {
    console.log('Starting to fetch all exercises...');
    const exercisesRef = collection(db, 'exercises');
    console.log('Collection reference:', exercisesRef);
    
    const querySnapshot = await getDocs(exercisesRef);
    console.log('Query snapshot size:', querySnapshot.size);
    
    const exercises = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Exercise document data:', data);
      return {
        ...data,
        id: doc.id
      } as Exercise;
    });

    console.log(`Successfully fetched ${exercises.length} total exercises:`, exercises);
    return exercises;
  } catch (error) {
    console.error('Error fetching all exercises:', error);
    throw error;
  }
}; 