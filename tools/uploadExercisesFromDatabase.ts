import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { exerciseDatabase } from '../data/exerciseDatabase';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '');
initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

const uploadExercisesFromDatabase = async () => {
  try {
    console.log('Starting to upload exercises from database...');
    console.log('Checking Firebase Admin connection...');
    
    const exercisesRef = db.collection('exercises');
    console.log('Got exercises collection reference');

    // Check if exercises already exist
    console.log('Checking for existing exercises...');
    const snapshot = await exercisesRef.get();
    console.log(`Found ${snapshot.size} existing exercises`);
    
    if (!snapshot.empty) {
      console.log('Exercises already exist in database. Skipping upload.');
      console.log('Existing exercises:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${data.muscleGroup})`);
      });
      return;
    }

    let count = 0;
    const muscleGroups = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'];
    console.log('Will upload exercises for muscle groups:', muscleGroups);

    for (const muscleGroup of muscleGroups) {
      console.log(`\nProcessing ${muscleGroup} exercises...`);
      const exercises = exerciseDatabase.intermediate[muscleGroup as keyof typeof exerciseDatabase.intermediate];
      console.log(`Found ${exercises.length} exercises for ${muscleGroup}`);
      
      for (const exercise of exercises) {
        console.log(`\nUploading ${exercise.name}...`);
        try {
          const docRef = await exercisesRef.add({
            ...exercise,
            muscleGroup: muscleGroup
          });
          console.log(`Successfully added ${exercise.name} with ID: ${docRef.id}`);
          count++;
        } catch (error) {
          console.error(`Failed to upload ${exercise.name}:`, error);
        }
      }
    }

    console.log(`\nUpload complete! Successfully uploaded ${count} exercises to Firestore`);
  } catch (error) {
    console.error('Error in uploadExercisesFromDatabase:', error);
    // Log additional error details if available
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

// Run the upload
console.log('Script started');
uploadExercisesFromDatabase().then(() => {
  console.log('Script finished');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 