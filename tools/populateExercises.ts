import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const exercises = [
  // Push Exercises
  {
    name: 'Bench Press',
    category: 'Push',
    targetMuscles: ['Chest', 'Shoulders'],
    secondaryMuscles: ['Triceps'],
    equipment: ['Barbell', 'Bench'],
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    instructions: [
      'Lie on bench with feet flat on ground',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar up to starting position'
    ],
    tips: [
      'Keep core tight',
      'Drive through feet',
      'Keep shoulders back'
    ],
    difficulty: 'Intermediate',
    notes: 'Focus on form and control'
  },
  {
    name: 'Overhead Press',
    category: 'Push',
    targetMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    equipment: ['Barbell'],
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold barbell at shoulder level',
      'Press bar overhead',
      'Lower with control'
    ],
    tips: [
      'Avoid arching back',
      'Breathe properly',
      'Keep core engaged'
    ],
    difficulty: 'Intermediate',
    notes: 'Keep core tight and maintain straight bar path'
  },
  // Pull Exercises
  {
    name: 'Barbell Rows',
    category: 'Pull',
    targetMuscles: ['Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    equipment: ['Barbell'],
    videoUrl: 'https://www.youtube.com/embed/T3N-TO4reLQ',
    instructions: [
      'Bend at hips, keeping back straight',
      'Grip bar slightly wider than shoulder width',
      'Pull bar to lower chest',
      'Lower with control'
    ],
    tips: [
      'Keep back straight',
      'Squeeze shoulder blades',
      'Control the weight'
    ],
    difficulty: 'Intermediate',
    notes: 'Keep back straight and core engaged'
  },
  {
    name: 'Pull-ups',
    category: 'Pull',
    targetMuscles: ['Back', 'Biceps'],
    secondaryMuscles: ['Shoulders'],
    equipment: ['Pull-up Bar'],
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    instructions: [
      'Grip bar slightly wider than shoulders',
      'Pull body up until chin over bar',
      'Lower with control',
      'Repeat'
    ],
    tips: [
      'Keep core tight',
      'Focus on back muscles',
      'Full range of motion'
    ],
    difficulty: 'Intermediate',
    notes: 'Use assisted machine if needed'
  },
  // Leg Exercises
  {
    name: 'Squats',
    category: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Barbell', 'Rack'],
    videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees',
      'Keep back straight',
      'Push through heels to stand'
    ],
    tips: [
      'Keep chest up',
      'Knees in line with toes',
      'Breathe properly'
    ],
    difficulty: 'Intermediate',
    notes: 'Focus on depth and form'
  },
  {
    name: 'Romanian Deadlifts',
    category: 'Legs',
    targetMuscles: ['Hamstrings', 'Lower Back'],
    secondaryMuscles: ['Glutes'],
    equipment: ['Barbell'],
    videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
    instructions: [
      'Hold bar at hip level',
      'Hinge at hips',
      'Lower bar along legs',
      'Return to starting position'
    ],
    tips: [
      'Keep back straight',
      'Slight knee bend',
      'Feel hamstring stretch'
    ],
    difficulty: 'Intermediate',
    notes: 'Focus on hamstring stretch'
  }
];

const populateExercises = async () => {
  try {
    console.log('Starting to populate exercises...');
    const exercisesRef = collection(db, 'exercises');
    
    for (const exercise of exercises) {
      await addDoc(exercisesRef, exercise);
      console.log(`Added exercise: ${exercise.name}`);
    }
    
    console.log('Successfully populated exercises!');
  } catch (error) {
    console.error('Error populating exercises:', error);
  }
};

// Run the population script
populateExercises(); 