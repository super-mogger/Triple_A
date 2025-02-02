import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Exercise } from '../types/exercise';

const additionalExercises: Exercise[] = [
  // Pull Exercises
  {
    id: 'bent-over-row',
    name: 'Bent Over Row',
    category: 'pull',
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    instructions: [
      'Hinge at hips, keeping back straight',
      'Grip barbell with hands wider than shoulder width',
      'Pull barbell to lower chest',
      'Lower with control',
      'Maintain stable core throughout'
    ],
    muscleGroup: 'back',
    notes: 'Great compound movement for back development',
    reps: '8-12',
    secondaryMuscles: ['Biceps', 'Core'],
    sets: '4',
    targetMuscles: ['Back', 'Lats'],
    tips: [
      'Keep back straight',
      'Squeeze shoulder blades together',
      'Keep core engaged',
      'Control the weight'
    ],
    muscles_worked: ['back', 'lats', 'biceps'],
    common_mistakes: [
      'Rounding the back',
      'Using too much momentum',
      'Not squeezing shoulder blades'
    ],
    variations: ['Pendlay Row', 'Yates Row', 'Meadows Row'],
    videoUrl: ''
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'pull',
    difficulty: 'Beginner',
    equipment: ['Cable Machine'],
    instructions: [
      'Sit at lat pulldown machine',
      'Grip bar wider than shoulder width',
      'Pull bar down to upper chest',
      'Control the weight back up',
      'Maintain good posture'
    ],
    muscleGroup: 'back',
    notes: 'Excellent for developing back width',
    reps: '10-15',
    secondaryMuscles: ['Biceps', 'Forearms'],
    sets: '3',
    targetMuscles: ['Lats', 'Upper Back'],
    tips: [
      'Keep chest up',
      'Drive elbows down',
      'Full range of motion',
      'Control the negative'
    ],
    muscles_worked: ['lats', 'upper back', 'biceps'],
    common_mistakes: [
      'Leaning back too far',
      'Using momentum',
      'Incomplete range of motion'
    ],
    variations: ['Close Grip', 'Behind Neck', 'Single Arm'],
    videoUrl: ''
  },
  // Push Exercises
  {
    id: 'overhead-dumbbell-press',
    name: 'Overhead Dumbbell Press',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Dumbbells'],
    instructions: [
      'Sit on bench with back support',
      'Hold dumbbells at shoulder level',
      'Press weights overhead',
      'Lower with control',
      'Keep core engaged'
    ],
    muscleGroup: 'shoulders',
    notes: 'Great for shoulder development and stability',
    reps: '8-12',
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    sets: '4',
    targetMuscles: ['Shoulders', 'Deltoids'],
    tips: [
      'Keep core tight',
      'Control the weights',
      'Full range of motion',
      'Neutral wrist position'
    ],
    muscles_worked: ['shoulders', 'triceps', 'upper chest'],
    common_mistakes: [
      'Arching back',
      'Uneven pressing',
      'Using momentum'
    ],
    variations: ['Standing Press', 'Arnold Press', 'Single Arm Press'],
    videoUrl: ''
  },
  // Leg Exercises
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Bench'],
    instructions: [
      'Place rear foot on bench',
      'Stand in split stance',
      'Lower until back knee nearly touches ground',
      'Drive through front foot to stand',
      'Keep torso upright'
    ],
    muscleGroup: 'legs',
    notes: 'Excellent unilateral leg developer',
    reps: '10-12 per leg',
    secondaryMuscles: ['Core', 'Hip Flexors'],
    sets: '3',
    targetMuscles: ['Quadriceps', 'Glutes'],
    tips: [
      'Keep front foot flat',
      'Control the descent',
      'Stay upright',
      'Equal weight distribution'
    ],
    muscles_worked: ['quadriceps', 'glutes', 'hamstrings'],
    common_mistakes: [
      'Leaning too far forward',
      'Front knee caving in',
      'Insufficient range of motion'
    ],
    variations: ['Bodyweight', 'Barbell', 'Elevated Front Foot'],
    videoUrl: ''
  },
  // Core Exercises
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'core',
    difficulty: 'Advanced',
    equipment: ['Pull-up Bar'],
    instructions: [
      'Hang from pull-up bar',
      'Keep shoulders engaged',
      'Raise legs to parallel',
      'Lower with control',
      'Maintain hollow body position'
    ],
    muscleGroup: 'core',
    notes: 'Advanced core exercise for strength and definition',
    reps: '10-15',
    secondaryMuscles: ['Hip Flexors', 'Grip'],
    sets: '3',
    targetMuscles: ['Lower Abs', 'Core'],
    tips: [
      'Avoid swinging',
      'Keep core engaged',
      'Control the movement',
      'Breathe steadily'
    ],
    muscles_worked: ['abs', 'hip flexors', 'obliques'],
    common_mistakes: [
      'Using momentum',
      'Incomplete range of motion',
      'Not controlling descent'
    ],
    variations: ['Knee Raises', 'Toes to Bar', 'L-Sits'],
    videoUrl: ''
  },
  // Additional Push Exercises
  {
    id: 'dips',
    name: 'Dips',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Dip Bars'],
    instructions: [
      'Support yourself on dip bars',
      'Lower body by bending elbows',
      'Keep slight forward lean for chest focus',
      'Push back up to starting position',
      'Maintain control throughout'
    ],
    muscleGroup: 'chest',
    notes: 'Great compound movement for upper body pushing strength',
    reps: '8-12',
    secondaryMuscles: ['Shoulders', 'Core'],
    sets: '3',
    targetMuscles: ['Chest', 'Triceps'],
    tips: [
      'Control the descent',
      'Keep elbows tucked',
      'Maintain tension throughout',
      'Scale with assistance if needed'
    ],
    muscles_worked: ['chest', 'triceps', 'shoulders'],
    common_mistakes: [
      'Swinging for momentum',
      'Going too deep',
      'Flaring elbows excessively'
    ],
    variations: ['Bench Dips', 'Ring Dips', 'Weighted Dips'],
    videoUrl: ''
  },
  // Additional Pull Exercises
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    category: 'pull',
    difficulty: 'Beginner',
    equipment: ['Cable Machine', 'Rope Attachment'],
    instructions: [
      'Set cable at head height',
      'Pull rope to face level',
      'Pull elbows high and wide',
      'Focus on rear deltoids',
      'Control the return'
    ],
    muscleGroup: 'back',
    notes: 'Excellent for shoulder health and posture',
    reps: '12-15',
    secondaryMuscles: ['Rotator Cuff', 'Traps'],
    sets: '3',
    targetMuscles: ['Rear Deltoids', 'Upper Back'],
    tips: [
      'Pull to nose level',
      'Keep elbows high',
      'External rotation at end',
      'Use light weight for form'
    ],
    muscles_worked: ['rear deltoids', 'upper back', 'rotator cuff'],
    common_mistakes: [
      'Using too much weight',
      'Poor elbow position',
      'Insufficient external rotation'
    ],
    variations: ['Band Face Pulls', 'Seated Face Pulls', 'TRX Face Pulls'],
    videoUrl: ''
  }
];

export const populateMoreExercises = async () => {
  try {
    const exercisesRef = collection(db, 'exercises');
    console.log('Starting to populate additional exercises...');
    
    for (const exercise of additionalExercises) {
      const { id, ...exerciseToAdd } = exercise; // Remove the id as Firestore will generate one
      await addDoc(exercisesRef, exerciseToAdd);
      console.log(`Added exercise: ${exercise.name}`);
    }

    console.log('Successfully populated additional exercises!');
  } catch (error) {
    console.error('Error populating additional exercises:', error);
    throw error;
  }
};

// Run this function to add more exercises to the database
populateMoreExercises(); 