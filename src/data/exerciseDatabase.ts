import { Exercise } from '../types/exercise';

export const exerciseDatabase = {
  intermediate: {
    chest: [
      {
        id: 'barbell-bench-press',
        name: 'Barbell Bench Press',
        category: 'chest',
        equipment: ['barbell', 'bench'],
        difficulty: 3,
        instructions: [
          'Lie on a flat bench with your feet flat on the ground',
          'Grip the barbell slightly wider than shoulder-width',
          'Lower the bar to your chest',
          'Press the bar back up to starting position'
        ],
        muscles_worked: ['chest', 'triceps', 'shoulders'],
        tips: [
          'Keep your wrists straight',
          'Drive your feet into the ground',
          'Keep your core tight'
        ],
        common_mistakes: [
          'Bouncing the bar off your chest',
          'Not maintaining proper form throughout the movement',
          'Using too much weight'
        ],
        variations: ['Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press'],
        targetMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        sets: '3',
        reps: '8-12',
        notes: 'Keep shoulders down and feet planted',
        videoUrl: ''
      },
      {
        id: 'dumbbell-bench-press',
        name: 'Dumbbell Bench Press',
        category: 'chest',
        equipment: ['dumbbells', 'bench'],
        difficulty: 3,
        instructions: [
          'Lie on a flat bench with dumbbells in each hand',
          'Start with dumbbells at chest level',
          'Press dumbbells up until arms are extended',
          'Lower back down with control'
        ],
        muscles_worked: ['chest', 'triceps', 'shoulders'],
        tips: [
          'Keep core engaged',
          'Maintain neutral wrist position',
          'Control the weights throughout'
        ],
        common_mistakes: [
          'Arching back excessively',
          'Uneven pressing',
          'Using momentum'
        ],
        variations: ['Incline Dumbbell Press', 'Decline Dumbbell Press'],
        targetMuscles: ['Chest'],
        secondaryMuscles: ['Triceps', 'Shoulders'],
        sets: '3',
        reps: '8-12',
        notes: 'Great for balanced chest development',
        videoUrl: ''
      },
      {
        id: 'incline-dumbbell-press',
        name: 'Incline Dumbbell Press',
        category: 'chest',
        equipment: ['dumbbells', 'incline bench'],
        difficulty: 3,
        instructions: [
          'Set bench to 30-45 degree angle',
          'Lie on incline bench with dumbbells in hand',
          'Press dumbbells up and slightly inward',
          'Lower weights with control'
        ],
        muscles_worked: ['chest', 'shoulders', 'triceps'],
        tips: [
          'Keep back against bench',
          'Maintain control throughout movement',
          'Focus on upper chest contraction'
        ],
        common_mistakes: [
          'Setting bench too steep',
          'Flaring elbows excessively',
          'Using too heavy weight'
        ],
        variations: ['Barbell Incline Press', 'Low Incline Press'],
        targetMuscles: ['Upper Chest'],
        secondaryMuscles: ['Shoulders', 'Triceps'],
        sets: '3',
        reps: '8-12',
        notes: 'Targets upper chest effectively',
        videoUrl: ''
      }
    ],
    back: [
      {
        id: 'pull-ups',
        name: 'Pull-ups',
        category: 'back',
        equipment: ['pull-up bar'],
        difficulty: 4,
        instructions: [
          'Hang from the pull-up bar with hands slightly wider than shoulder-width',
          'Pull yourself up until your chin is over the bar',
          'Lower yourself back down with control'
        ],
        muscles_worked: ['back', 'biceps', 'shoulders'],
        tips: [
          'Keep your core engaged',
          'Avoid swinging',
          'Focus on squeezing your back muscles'
        ],
        common_mistakes: [
          'Using momentum to swing up',
          'Not going through full range of motion',
          'Poor grip positioning'
        ],
        variations: ['Chin-ups', 'Wide-grip Pull-ups', 'Assisted Pull-ups'],
        targetMuscles: ['Back', 'Biceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        sets: '3',
        reps: '8-12',
        notes: '',
        videoUrl: ''
      }
    ],
    shoulders: [
      {
        id: 'overhead-press',
        name: 'Overhead Press',
        category: 'shoulders',
        equipment: ['barbell'],
        difficulty: 3,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold barbell at shoulder level',
          'Press the bar overhead',
          'Lower back to starting position'
        ],
        muscles_worked: ['shoulders', 'triceps'],
        tips: [
          'Keep core tight',
          'Don\'t lean back excessively',
          'Full range of motion'
        ],
        common_mistakes: [
          'Arching back',
          'Using momentum',
          'Incomplete range of motion'
        ],
        variations: ['Seated Press', 'Dumbbell Press', 'Push Press'],
        targetMuscles: ['Shoulders', 'Triceps'],
        secondaryMuscles: ['Upper Chest', 'Core'],
        sets: '3',
        reps: '8-12',
        notes: 'Focus on strict form',
        videoUrl: ''
      }
    ],
    legs: [
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift',
        category: 'Pull',
        difficulty: 'Intermediate',
        equipment: ['Barbell'],
        instructions: [
          'Start with bar at hip level',
          'Push hips back while lowering bar',
          'Keep slight bend in knees',
          'Lower until stretch in hamstrings',
          'Drive hips forward to return'
        ],
        muscleGroup: 'legs',
        notes: 'Excellent for hamstring development',
        reps: '8-12',
        secondaryMuscles: ['Glutes', 'Upper Back'],
        sets: '4',
        targetMuscles: ['Hamstrings', 'Lower Back'],
        tips: [
          'Keep bar close to legs',
          'Maintain neutral spine',
          'Feel stretch in hamstrings',
          'Don\'t round lower back'
        ],
        videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM',
        muscles_worked: ['hamstrings', 'lower back', 'glutes'],
        common_mistakes: [
          'Rounding the lower back',
          'Bending knees too much',
          'Bar too far from legs',
          'Not hinging at hips'
        ],
        variations: ['Single-leg RDL', 'Dumbbell RDL', 'Banded RDL']
      },
      {
        id: 'barbell-squat',
        name: 'Barbell Squat',
        category: 'legs',
        equipment: ['barbell', 'squat rack'],
        difficulty: 4,
        instructions: [
          'Position bar on upper back',
          'Feet shoulder-width apart',
          'Squat down until thighs are parallel',
          'Drive back up through heels'
        ],
        muscles_worked: ['quadriceps', 'hamstrings', 'glutes'],
        tips: [
          'Keep chest up',
          'Knees in line with toes',
          'Maintain neutral spine'
        ],
        common_mistakes: [
          'Knees caving in',
          'Rising on toes',
          'Rounding back'
        ],
        variations: ['Front Squat', 'Box Squat', 'Goblet Squat'],
        targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes'],
        secondaryMuscles: ['Core', 'Lower Back'],
        sets: '3',
        reps: '8-12',
        notes: 'Foundation leg exercise',
        videoUrl: ''
      }
    ],
    arms: [
      {
        id: 'tricep-pushdown',
        name: 'Tricep Pushdown',
        category: 'arms',
        equipment: ['cable machine'],
        difficulty: 2,
        instructions: [
          'Stand facing cable machine',
          'Grip attachment at chest height',
          'Push down until arms are straight',
          'Control the weight back up'
        ],
        muscles_worked: ['triceps'],
        tips: [
          'Keep elbows at sides',
          'Maintain upright posture',
          'Full range of motion'
        ],
        common_mistakes: [
          'Using momentum',
          'Moving elbows away from body',
          'Incomplete range'
        ],
        variations: ['Rope Pushdown', 'V-Bar Pushdown', 'Single-Arm Pushdown'],
        targetMuscles: ['Triceps'],
        secondaryMuscles: ['Shoulders'],
        sets: '3',
        reps: '12-15',
        notes: 'Great isolation exercise',
        videoUrl: ''
      },
      {
        id: 'barbell-curl',
        name: 'Barbell Curl',
        category: 'arms',
        equipment: ['barbell'],
        difficulty: 2,
        instructions: [
          'Stand with feet shoulder-width',
          'Hold barbell with underhand grip',
          'Curl weight up to shoulders',
          'Lower with control'
        ],
        muscles_worked: ['biceps', 'forearms'],
        tips: [
          'Keep elbows at sides',
          'Minimize body swing',
          'Full range of motion'
        ],
        common_mistakes: [
          'Using momentum',
          'Moving elbows forward',
          'Incomplete range'
        ],
        variations: ['Dumbbell Curls', 'Hammer Curls', 'Preacher Curls'],
        targetMuscles: ['Biceps'],
        secondaryMuscles: ['Forearms'],
        sets: '3',
        reps: '8-12',
        notes: 'Classic bicep exercise',
        videoUrl: ''
      }
    ],
    core: [
      {
        id: 'plank',
        name: 'Plank',
        category: 'core',
        equipment: ['bodyweight'],
        difficulty: 2,
        instructions: [
          'Start in push-up position',
          'Lower onto forearms',
          'Keep body straight',
          'Hold position'
        ],
        muscles_worked: ['abs', 'lower back', 'shoulders'],
        tips: [
          'Keep hips level',
          'Engage core',
          'Breathe steadily'
        ],
        common_mistakes: [
          'Sagging hips',
          'Raised buttocks',
          'Holding breath'
        ],
        variations: ['Side Plank', 'Up-Down Plank', 'Plank with Shoulder Taps'],
        targetMuscles: ['Core'],
        secondaryMuscles: ['Shoulders', 'Lower Back'],
        sets: '3',
        reps: '30-60 seconds',
        notes: 'Great for core stability',
        videoUrl: ''
      }
    ]
  }
}; 