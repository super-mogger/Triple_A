import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { exerciseDatabase } from '../data/exerciseDatabase';

export const populateExercises = async () => {
  try {
    const exercisesRef = collection(db, 'exercises');
    const exercises = Object.values(exerciseDatabase.intermediate)
      .flat()
      .map(exercise => ({
        ...exercise,
        // Remove the id as Firestore will generate one
        id: undefined
      }));

    console.log('Starting to populate exercises...');
    
    for (const exercise of exercises) {
      await addDoc(exercisesRef, exercise);
      console.log(`Added exercise: ${exercise.name}`);
    }

    console.log('Successfully populated exercises!');
  } catch (error) {
    console.error('Error populating exercises:', error);
    throw error;
  }
};

// Uncomment and run this function once to populate the database
populateExercises(); 