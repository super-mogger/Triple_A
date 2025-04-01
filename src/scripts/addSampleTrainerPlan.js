// Add a sample trainer workout plan to Firestore
// To run this script:
// 1. Update the userId with a valid user ID
// 2. Run with Node.js: node src/scripts/addSampleTrainerPlan.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Replace with the actual user ID you want to create the plan for
const userId = "BbYkrpcPNrarNbXCCpQd1AvUaLu2";

// Sample trainer workout plan
const trainerWorkoutPlan = {
  userId: userId,
  name: "Amit Rawat",
  description: "Custom weekly workout plan designed for your strength and conditioning goals",
  level: "advanced",
  duration: 4, // weeks
  created_at: Timestamp.now(),
  updated_at: Timestamp.now(),
  created_by: "system",
  days: [
    {
      day: "Monday",
      exercises: [
        {
          exerciseId: "FgutcqKnJdijsbggqGwh",
          exerciseName: "Seated Cable Rows",
          reps: "10-12",
          rest: 60,
          sets: 3,
          weight: "Light to moderate"
        },
        {
          exerciseId: "deadlifts",
          exerciseName: "Deadlifts",
          reps: "5-8",
          rest: 120,
          sets: 4,
          weight: "Heavy"
        },
        {
          exerciseId: "barbell-rows",
          exerciseName: "Barbell Rows",
          reps: "8-10",
          rest: 90,
          sets: 3,
          weight: "Moderate to heavy"
        }
      ],
      notes: "Back day focus"
    },
    {
      day: "Tuesday",
      exercises: [
        {
          exerciseId: "incline-bench-press",
          exerciseName: "Incline Bench Press",
          reps: "8-10",
          rest: 90,
          sets: 4,
          weight: "Moderate to heavy"
        },
        {
          exerciseId: "push-ups",
          exerciseName: "Push-ups",
          reps: "15-20",
          rest: 60,
          sets: 3,
          weight: "Bodyweight"
        }
      ],
      notes: "Chest focus"
    },
    {
      day: "Wednesday",
      exercises: [
        {
          exerciseId: "squats",
          exerciseName: "Squats",
          reps: "6-8",
          rest: 120,
          sets: 5,
          weight: "Heavy"
        },
        {
          exerciseId: "lunges",
          exerciseName: "Lunges",
          reps: "10-12 (each leg)",
          rest: 90,
          sets: 3,
          weight: "Moderate"
        },
        {
          exerciseId: "calf-raises",
          exerciseName: "Calf Raises",
          reps: "15-20",
          rest: 60,
          sets: 4,
          weight: "Moderate"
        }
      ],
      notes: "Leg day focus"
    },
    {
      day: "Thursday",
      exercises: [
        {
          exerciseId: "shoulder-press",
          exerciseName: "Shoulder Press",
          reps: "8-10",
          rest: 90,
          sets: 4,
          weight: "Moderate to heavy"
        },
        {
          exerciseId: "lateral-raises",
          exerciseName: "Lateral Raises",
          reps: "12-15",
          rest: 60,
          sets: 3,
          weight: "Light to moderate"
        },
        {
          exerciseId: "face-pulls",
          exerciseName: "Face Pulls",
          reps: "15-20",
          rest: 60,
          sets: 3,
          weight: "Light to moderate"
        }
      ],
      notes: "Shoulder focus"
    },
    {
      day: "Friday",
      exercises: [
        {
          exerciseId: "bicep-curls",
          exerciseName: "Bicep Curls",
          reps: "10-12",
          rest: 60,
          sets: 4,
          weight: "Moderate"
        },
        {
          exerciseId: "hammer-curls",
          exerciseName: "Hammer Curls",
          reps: "10-12",
          rest: 60,
          sets: 3,
          weight: "Moderate"
        },
        {
          exerciseId: "triceps-dips",
          exerciseName: "Triceps Dips",
          reps: "8-12",
          rest: 60,
          sets: 4,
          weight: "Bodyweight"
        },
        {
          exerciseId: "skull-crushers",
          exerciseName: "Skull Crushers",
          reps: "10-12",
          rest: 60,
          sets: 3,
          weight: "Moderate"
        }
      ],
      notes: "Arms focus"
    },
    {
      day: "Saturday",
      exercises: [
        {
          exerciseId: "planks",
          exerciseName: "Planks",
          reps: "30-60 seconds",
          rest: 60,
          sets: 3,
          weight: "Bodyweight"
        },
        {
          exerciseId: "russian-twists",
          exerciseName: "Russian Twists",
          reps: "20 (each side)",
          rest: 60,
          sets: 3,
          weight: "Light to moderate"
        },
        {
          exerciseId: "hanging-leg-raises",
          exerciseName: "Hanging Leg Raises",
          reps: "10-15",
          rest: 60,
          sets: 3,
          weight: "Bodyweight"
        }
      ],
      notes: "Core focus"
    },
    {
      day: "Sunday",
      exercises: [],
      notes: "Rest day - Focus on recovery, hydration, and meal prep for the week"
    }
  ]
};

async function addTrainerWorkoutPlan() {
  try {
    const docRef = await addDoc(collection(db, 'workout_plans'), trainerWorkoutPlan);
    console.log("Trainer workout plan added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding trainer workout plan: ", error);
  }
}

// Run the function
addTrainerWorkoutPlan(); 