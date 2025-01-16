import { db } from '../config/firebase-admin';
import { exerciseDatabase } from '../data/exerciseDatabase';

const uploadExercises = async () => {
  let count = 0;

  try {
    // Upload chest exercises
    for (const exercise of exerciseDatabase.intermediate.chest) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'chest'
      });
      count++;
    }

    // Upload back exercises
    for (const exercise of exerciseDatabase.intermediate.back) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'back'
      });
      count++;
    }

    // Upload shoulder exercises
    for (const exercise of exerciseDatabase.intermediate.shoulders) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'shoulders'
      });
      count++;
    }

    // Upload leg exercises
    for (const exercise of exerciseDatabase.intermediate.legs) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'legs'
      });
      count++;
    }

    // Upload arm exercises
    for (const exercise of exerciseDatabase.intermediate.arms) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'arms'
      });
      count++;
    }

    // Upload core exercises
    for (const exercise of exerciseDatabase.intermediate.core) {
      await db.collection('exercises').add({
        ...exercise,
        muscleGroup: 'core'
      });
      count++;
    }

    console.log(`Successfully uploaded ${count} exercises to Firestore`);
  } catch (error) {
    console.error('Error uploading exercises:', error);
  }
};

// Run the upload
uploadExercises(); 