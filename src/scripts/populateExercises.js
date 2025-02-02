const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin with service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../service-account.json');

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

const additionalExercises = [
  // Pull Exercises
  {
    name: 'Deadlift',
    category: 'pull',
    difficulty: 'Advanced',
    equipment: ['Barbell', 'Weight Plates'],
    instructions: [
      'Stand with feet hip-width apart',
      'Bend at hips and knees to grip barbell',
      'Keep back straight, chest up',
      'Drive through heels to stand',
      'Return weight to ground with control'
    ],
    muscleGroup: 'back',
    notes: 'Fundamental compound movement for overall strength',
    reps: '5-8',
    secondaryMuscles: ['Hamstrings', 'Core', 'Forearms'],
    sets: '4',
    targetMuscles: ['Lower Back', 'Glutes'],
    tips: [
      'Keep bar close to body',
      'Engage lats before lifting',
      'Breathe and brace properly',
      'Drive hips forward at top'
    ],
    muscles_worked: ['lower back', 'glutes', 'hamstrings'],
    common_mistakes: [
      'Rounding the back',
      'Starting with hips too high',
      'Letting bar drift forward',
      'Not engaging lats'
    ],
    variations: ['Sumo Deadlift', 'Romanian Deadlift', 'Single-leg Deadlift'],
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q'
  },
  {
    name: 'Pull-ups',
    category: 'pull',
    difficulty: 'Intermediate',
    equipment: ['Pull-up Bar'],
    instructions: [
      'Grip bar slightly wider than shoulders',
      'Hang with arms fully extended',
      'Pull up until chin over bar',
      'Lower with control',
      'Maintain straight body throughout'
    ],
    muscleGroup: 'back',
    notes: 'Excellent for building upper body strength',
    reps: '8-12',
    secondaryMuscles: ['Biceps', 'Core'],
    sets: '3',
    targetMuscles: ['Lats', 'Upper Back'],
    tips: [
      'Engage core throughout',
      'Lead with chest to bar',
      'Control the descent',
      'Keep shoulders down'
    ],
    muscles_worked: ['lats', 'upper back', 'biceps'],
    common_mistakes: [
      'Using momentum',
      'Incomplete range of motion',
      'Poor shoulder position',
      'Swinging body'
    ],
    variations: ['Chin-ups', 'Wide-grip Pull-ups', 'Assisted Pull-ups'],
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  // Push Exercises
  {
    name: 'Bench Press',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Bench', 'Weight Plates'],
    instructions: [
      'Lie on bench with feet flat',
      'Grip bar slightly wider than shoulders',
      'Lower bar to chest with control',
      'Press bar up to starting position',
      'Keep wrists straight throughout'
    ],
    muscleGroup: 'chest',
    notes: 'Classic compound movement for upper body pushing strength',
    reps: '8-12',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    sets: '4',
    targetMuscles: ['Chest', 'Shoulders'],
    tips: [
      'Keep shoulder blades retracted',
      'Drive feet into ground',
      'Control the eccentric',
      'Maintain natural arch'
    ],
    muscles_worked: ['chest', 'triceps', 'shoulders'],
    common_mistakes: [
      'Bouncing bar off chest',
      'Excessive arch',
      'Elbows flaring too much',
      'Not maintaining tension'
    ],
    variations: ['Incline Bench Press', 'Close-grip Bench Press', 'Dumbbell Press'],
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    name: 'Military Press',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Weight Plates'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold bar at upper chest',
      'Press bar overhead',
      'Lower with control',
      'Keep core tight throughout'
    ],
    muscleGroup: 'shoulders',
    notes: 'Fundamental overhead pressing movement',
    reps: '8-12',
    secondaryMuscles: ['Upper Chest', 'Triceps'],
    sets: '4',
    targetMuscles: ['Shoulders', 'Triceps'],
    tips: [
      'Keep core engaged',
      'Avoid excessive back arch',
      'Full range of motion',
      'Breathe properly'
    ],
    muscles_worked: ['shoulders', 'triceps', 'upper chest'],
    common_mistakes: [
      'Leaning back too much',
      'Poor bar path',
      'Not engaging core',
      'Incomplete lockout'
    ],
    variations: ['Push Press', 'Behind the Neck Press', 'Seated Press'],
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  // Leg Exercises
  {
    name: 'Back Squat',
    category: 'legs',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Weight Plates', 'Squat Rack'],
    instructions: [
      'Position bar on upper back',
      'Stand with feet shoulder-width apart',
      'Break at hips and knees',
      'Lower until thighs parallel',
      'Drive through heels to stand'
    ],
    muscleGroup: 'legs',
    notes: 'King of leg exercises',
    reps: '6-10',
    secondaryMuscles: ['Core', 'Lower Back'],
    sets: '4',
    targetMuscles: ['Quadriceps', 'Glutes'],
    tips: [
      'Keep chest up',
      'Knees track over toes',
      'Breathe and brace',
      'Maintain neutral spine'
    ],
    muscles_worked: ['quadriceps', 'glutes', 'hamstrings'],
    common_mistakes: [
      'Knees caving in',
      'Rising too quickly',
      'Losing upper back tightness',
      'Heels coming up'
    ],
    variations: ['Front Squat', 'Box Squat', 'Pause Squat'],
    videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8'
  },
  {
    name: 'Leg Press',
    category: 'legs',
    difficulty: 'Beginner',
    equipment: ['Leg Press Machine'],
    instructions: [
      'Sit in machine with back flat',
      'Place feet shoulder-width apart',
      'Lower weight with control',
      'Press through heels',
      'Dont lock knees at top'
    ],
    muscleGroup: 'legs',
    notes: 'Great machine alternative to squats',
    reps: '10-15',
    secondaryMuscles: ['Calves'],
    sets: '4',
    targetMuscles: ['Quadriceps', 'Glutes'],
    tips: [
      'Keep lower back pressed',
      'Control the movement',
      'Full range of motion',
      'Avoid locking knees'
    ],
    muscles_worked: ['quadriceps', 'glutes', 'hamstrings'],
    common_mistakes: [
      'Lifting hips off seat',
      'Locking knees',
      'Bouncing at bottom',
      'Too narrow foot placement'
    ],
    variations: ['Single Leg Press', 'Wide Stance Press', 'High Foot Placement'],
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ'
  },
  // Core Exercises
  {
    name: 'Plank',
    category: 'core',
    difficulty: 'Beginner',
    equipment: ['None'],
    instructions: [
      'Start in forearm position',
      'Align body in straight line',
      'Engage core muscles',
      'Hold position',
      'Keep breathing steady'
    ],
    muscleGroup: 'core',
    notes: 'Fundamental core stability exercise',
    reps: '30-60 seconds',
    secondaryMuscles: ['Shoulders', 'Lower Back'],
    sets: '3',
    targetMuscles: ['Core', 'Abs'],
    tips: [
      'Keep hips level',
      'Dont sag in middle',
      'Maintain neutral spine',
      'Breathe normally'
    ],
    muscles_worked: ['abs', 'core', 'lower back'],
    common_mistakes: [
      'Sagging hips',
      'Raised hips',
      'Looking up',
      'Holding breath'
    ],
    variations: ['Side Plank', 'Up-Down Plank', 'Long-Lever Plank'],
    videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    name: 'Russian Twists',
    category: 'core',
    difficulty: 'Intermediate',
    equipment: ['Weight Plate', 'Dumbbell', 'Optional'],
    instructions: [
      'Sit with knees bent',
      'Lean back slightly',
      'Lift feet off ground',
      'Rotate torso side to side',
      'Keep core engaged'
    ],
    muscleGroup: 'core',
    notes: 'Excellent for rotational core strength',
    reps: '20 total touches',
    secondaryMuscles: ['Hip Flexors'],
    sets: '3',
    targetMuscles: ['Obliques', 'Abs'],
    tips: [
      'Control the movement',
      'Keep chest up',
      'Touch ground each side',
      'Maintain balance'
    ],
    muscles_worked: ['obliques', 'abs', 'core'],
    common_mistakes: [
      'Rounding lower back',
      'Moving too quickly',
      'Not rotating enough',
      'Poor posture'
    ],
    variations: ['Weighted Twists', 'Feet-Down Variation', 'Medicine Ball Throws'],
    videoUrl: 'https://www.youtube.com/embed/wkD8rjkodUI'
  },
  // Additional Push Exercises
  {
    name: 'Push-ups',
    category: 'push',
    difficulty: 'Beginner',
    equipment: ['None'],
    instructions: [
      'Start in plank position',
      'Lower chest to ground',
      'Keep body straight',
      'Push back up',
      'Maintain core tension'
    ],
    muscleGroup: 'chest',
    notes: 'Classic bodyweight pushing exercise',
    reps: '10-20',
    secondaryMuscles: ['Core', 'Shoulders'],
    sets: '3',
    targetMuscles: ['Chest', 'Triceps'],
    tips: [
      'Keep elbows at 45°',
      'Full range of motion',
      'Maintain straight body',
      'Control the movement'
    ],
    muscles_worked: ['chest', 'triceps', 'shoulders'],
    common_mistakes: [
      'Sagging hips',
      'Flared elbows',
      'Half reps',
      'Poor hand position'
    ],
    variations: ['Diamond Push-ups', 'Decline Push-ups', 'Incline Push-ups'],
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4'
  },
  // Additional Pull Exercises
  {
    name: 'Barbell Rows',
    category: 'pull',
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Weight Plates'],
    instructions: [
      'Bend at hips, back straight',
      'Grip bar shoulder-width',
      'Pull to lower chest',
      'Squeeze shoulder blades',
      'Lower with control'
    ],
    muscleGroup: 'back',
    notes: 'Excellent for back thickness',
    reps: '8-12',
    secondaryMuscles: ['Biceps', 'Core'],
    sets: '4',
    targetMuscles: ['Upper Back', 'Lats'],
    tips: [
      'Keep back straight',
      'Pull to chest',
      'Control descent',
      'Maintain hip hinge'
    ],
    muscles_worked: ['back', 'lats', 'biceps'],
    common_mistakes: [
      'Using momentum',
      'Rounding back',
      'Poor bar path',
      'Standing too upright'
    ],
    variations: ['Pendlay Row', 'Meadows Row', 'T-Bar Row'],
    videoUrl: 'https://www.youtube.com/embed/9efgcAjQe7E'
  },
  {
    name: 'Dumbbell Bicep Curls',
    category: 'arms',
    difficulty: 'Beginner',
    equipment: ['Dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Keep elbows close to body',
      'Curl weights up with palms up',
      'Lower with control',
      'Maintain proper posture'
    ],
    muscleGroup: 'arms',
    notes: 'Classic bicep building exercise',
    reps: '10-15',
    secondaryMuscles: ['Forearms'],
    sets: '3',
    targetMuscles: ['Biceps'],
    tips: [
      'Keep upper arms still',
      'Full range of motion',
      'Control the negative',
      'Avoid swinging'
    ],
    muscles_worked: ['biceps', 'forearms'],
    common_mistakes: [
      'Using momentum',
      'Moving elbows',
      'Incomplete range',
      'Poor posture'
    ],
    variations: ['Hammer Curls', 'Incline Curls', 'Preacher Curls'],
    videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo'
  },
  {
    name: 'Tricep Pushdowns',
    category: 'arms',
    difficulty: 'Beginner',
    equipment: ['Cable Machine', 'Straight Bar'],
    instructions: [
      'Stand facing cable machine',
      'Grip bar with palms down',
      'Keep elbows at sides',
      'Extend arms fully',
      'Control the return'
    ],
    muscleGroup: 'arms',
    notes: 'Effective tricep isolation exercise',
    reps: '12-15',
    secondaryMuscles: ['Shoulders'],
    sets: '3',
    targetMuscles: ['Triceps'],
    tips: [
      'Keep elbows tucked',
      'Full extension',
      'Control movement',
      'Maintain posture'
    ],
    muscles_worked: ['triceps'],
    common_mistakes: [
      'Moving elbows',
      'Using too much weight',
      'Leaning too far forward',
      'Incomplete extension'
    ],
    variations: ['Rope Pushdowns', 'Single-arm Pushdowns', 'Reverse Grip'],
    videoUrl: 'https://www.youtube.com/embed/2-LAMcpzODU'
  },
  {
    name: 'Lateral Raises',
    category: 'shoulders',
    difficulty: 'Beginner',
    equipment: ['Dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides',
      'Keep slight bend in elbows',
      'Lower with control',
      'Maintain neutral wrists'
    ],
    muscleGroup: 'shoulders',
    notes: 'Targets lateral deltoids effectively',
    reps: '12-15',
    secondaryMuscles: ['Traps', 'Upper Back'],
    sets: '3',
    targetMuscles: ['Lateral Deltoids'],
    tips: [
      'Control the movement',
      'Keep chest up',
      'Slight forward lean okay',
      'Lead with elbows'
    ],
    muscles_worked: ['shoulders', 'deltoids'],
    common_mistakes: [
      'Using momentum',
      'Raising too high',
      'Internal rotation',
      'Poor posture'
    ],
    variations: ['Cable Lateral Raises', 'Single-arm Raises', 'Seated Raises'],
    videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo'
  },
  {
    name: 'Calf Raises',
    category: 'legs',
    difficulty: 'Beginner',
    equipment: ['Smith Machine', 'Platform'],
    instructions: [
      'Stand on platform edge',
      'Balls of feet on edge',
      'Lower heels below platform',
      'Rise up onto toes',
      'Hold at top briefly'
    ],
    muscleGroup: 'legs',
    notes: 'Isolates calf muscles effectively',
    reps: '15-20',
    secondaryMuscles: ['Ankle Stabilizers'],
    sets: '4',
    targetMuscles: ['Calves'],
    tips: [
      'Full range of motion',
      'Control movement',
      'Pause at top',
      'Vary foot position'
    ],
    muscles_worked: ['calves'],
    common_mistakes: [
      'Partial reps',
      'Too much speed',
      'Poor balance',
      'Bouncing at bottom'
    ],
    variations: ['Seated Calf Raises', 'Single-leg Raises', 'Donkey Calf Raises'],
    videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI'
  },
  {
    name: 'Dumbbell Lunges',
    category: 'legs',
    difficulty: 'Intermediate',
    equipment: ['Dumbbells'],
    instructions: [
      'Hold dumbbells at sides',
      'Step forward into lunge',
      'Lower back knee toward ground',
      'Push back to start',
      'Alternate legs'
    ],
    muscleGroup: 'legs',
    notes: 'Great for leg development and balance',
    reps: '10-12 per leg',
    secondaryMuscles: ['Core', 'Glutes'],
    sets: '3',
    targetMuscles: ['Quadriceps', 'Hamstrings'],
    tips: [
      'Keep torso upright',
      'Control descent',
      'Knee over ankle',
      'Push through heel'
    ],
    muscles_worked: ['quadriceps', 'hamstrings', 'glutes'],
    common_mistakes: [
      'Front knee past toes',
      'Leaning forward',
      'Poor balance',
      'Uneven steps'
    ],
    variations: ['Walking Lunges', 'Reverse Lunges', 'Bulgarian Split Squats'],
    videoUrl: 'https://www.youtube.com/embed/D7KaRcUTQeE'
  },
  {
    name: 'Face Pulls',
    category: 'shoulders',
    difficulty: 'Intermediate',
    equipment: ['Cable Machine', 'Rope Attachment'],
    instructions: [
      'Set cable at head height',
      'Pull rope to face level',
      'Lead with elbows high',
      'Squeeze shoulder blades',
      'Control return'
    ],
    muscleGroup: 'shoulders',
    notes: 'Great for rear deltoids and posture',
    reps: '12-15',
    secondaryMuscles: ['Upper Back', 'Rotator Cuff'],
    sets: '3',
    targetMuscles: ['Rear Deltoids'],
    tips: [
      'Pull to nose level',
      'External rotation',
      'Keep elbows high',
      'Control movement'
    ],
    muscles_worked: ['rear deltoids', 'upper back', 'rotator cuff'],
    common_mistakes: [
      'Too much weight',
      'Poor elbow position',
      'Insufficient rotation',
      'Using momentum'
    ],
    variations: ['Band Face Pulls', 'Seated Face Pulls', 'High to Low Face Pulls'],
    videoUrl: 'https://www.youtube.com/embed/eIq5CB9JfKE'
  },
  {
    name: 'Leg Extensions',
    category: 'legs',
    difficulty: 'Beginner',
    equipment: ['Leg Extension Machine'],
    instructions: [
      'Sit with back against pad',
      'Hook feet under roller',
      'Extend legs fully',
      'Lower with control',
      'Keep upper body still'
    ],
    muscleGroup: 'legs',
    notes: 'Isolates quadriceps effectively',
    reps: '12-15',
    secondaryMuscles: ['None'],
    sets: '3',
    targetMuscles: ['Quadriceps'],
    tips: [
      'Control movement',
      'Full extension',
      'Squeeze at top',
      'Even pressure'
    ],
    muscles_worked: ['quadriceps'],
    common_mistakes: [
      'Using momentum',
      'Incomplete extension',
      'Lifting hips',
      'Too much weight'
    ],
    variations: ['Single-leg Extensions', 'Pulse Extensions', 'Drop Sets'],
    videoUrl: 'https://www.youtube.com/embed/YyvSfVjQeL0'
  },
  {
    name: 'Hammer Curls',
    category: 'arms',
    difficulty: 'Beginner',
    equipment: ['Dumbbells'],
    instructions: [
      'Stand with dumbbells at sides',
      'Palms facing each other',
      'Curl weights up',
      'Keep elbows steady',
      'Lower with control'
    ],
    muscleGroup: 'arms',
    notes: 'Targets brachialis and forearms',
    reps: '10-12',
    secondaryMuscles: ['Forearms', 'Brachialis'],
    sets: '3',
    targetMuscles: ['Biceps'],
    tips: [
      'Keep elbows still',
      'Neutral grip',
      'Control descent',
      'Full range'
    ],
    muscles_worked: ['biceps', 'forearms', 'brachialis'],
    common_mistakes: [
      'Swinging weights',
      'Moving elbows',
      'Poor posture',
      'Using momentum'
    ],
    variations: ['Alternating Hammer Curls', 'Seated Hammer Curls', 'Cross Body Hammer Curls'],
    videoUrl: 'https://www.youtube.com/embed/zC3nLlEvin4'
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Incline Bench'],
    instructions: [
      'Lie on incline bench',
      'Hold dumbbells at shoulder level',
      'Press weights up',
      'Lower with control',
      'Keep core tight'
    ],
    muscleGroup: 'chest',
    notes: 'Emphasizes upper chest development',
    reps: '8-12',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    sets: '4',
    targetMuscles: ['Upper Chest'],
    tips: [
      'Control the weights',
      'Keep back pressed',
      'Natural arc movement',
      'Stable shoulder blades'
    ],
    muscles_worked: ['chest', 'shoulders', 'triceps'],
    common_mistakes: [
      'Arching back',
      'Uneven pressing',
      'Poor wrist position',
      'Bouncing weights'
    ],
    variations: ['Low Incline Press', 'Alternating Press', 'Neutral Grip Press'],
    videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8'
  },
  {
    name: 'Cable Flyes',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Cable Machine'],
    instructions: [
      'Stand between cable machines',
      'Grab handles at shoulder height',
      'Step forward slightly',
      'Bring hands together in arc',
      'Control return movement'
    ],
    muscleGroup: 'chest',
    notes: 'Great isolation exercise for chest',
    reps: '12-15',
    secondaryMuscles: ['Front Deltoids'],
    sets: '3',
    targetMuscles: ['Chest'],
    tips: [
      'Keep slight elbow bend',
      'Squeeze at peak',
      'Control the weight',
      'Maintain posture'
    ],
    muscles_worked: ['chest', 'shoulders'],
    common_mistakes: [
      'Locking elbows',
      'Using momentum',
      'Poor range of motion',
      'Incorrect cable height'
    ],
    variations: ['Low Cable Flyes', 'High Cable Flyes', 'Single Arm Flyes'],
    videoUrl: 'https://www.youtube.com/embed/Iwe6AmxVf7o'
  },
  {
    name: 'Seated Cable Rows',
    category: 'pull',
    difficulty: 'Beginner',
    equipment: ['Cable Machine', 'V-Bar'],
    instructions: [
      'Sit at rowing machine',
      'Grab handle with both hands',
      'Pull towards lower chest',
      'Squeeze shoulder blades',
      'Return with control'
    ],
    muscleGroup: 'back',
    notes: 'Excellent for mid-back development',
    reps: '10-12',
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    sets: '3',
    targetMuscles: ['Upper Back', 'Lats'],
    tips: [
      'Keep chest up',
      'Drive elbows back',
      'Maintain posture',
      'Full range of motion'
    ],
    muscles_worked: ['back', 'lats', 'biceps'],
    common_mistakes: [
      'Rounding back',
      'Using momentum',
      'Pulling too high',
      'Incomplete extension'
    ],
    variations: ['Wide Grip Rows', 'Single Arm Rows', 'Straight Bar Rows'],
    videoUrl: 'https://www.youtube.com/embed/GZbfZ033f74'
  },
  {
    name: 'Leg Curls',
    category: 'legs',
    difficulty: 'Beginner',
    equipment: ['Leg Curl Machine'],
    instructions: [
      'Lie face down on machine',
      'Hook ankles under pad',
      'Curl legs up fully',
      'Lower with control',
      'Keep hips down'
    ],
    muscleGroup: 'legs',
    notes: 'Isolates hamstrings effectively',
    reps: '12-15',
    secondaryMuscles: ['Calves'],
    sets: '3',
    targetMuscles: ['Hamstrings'],
    tips: [
      'Keep hips down',
      'Full range of motion',
      'Control movement',
      'Squeeze at top'
    ],
    muscles_worked: ['hamstrings', 'calves'],
    common_mistakes: [
      'Using momentum',
      'Lifting hips',
      'Incomplete range',
      'Too much weight'
    ],
    variations: ['Standing Leg Curls', 'Single Leg Curls', 'Swiss Ball Curls'],
    videoUrl: 'https://www.youtube.com/embed/1Tq3QdYUuHs'
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'push',
    difficulty: 'Intermediate',
    equipment: ['Dumbbells'],
    instructions: [
      'Sit with back support',
      'Hold dumbbells at shoulders',
      'Press weights overhead',
      'Lower with control',
      'Keep core engaged'
    ],
    muscleGroup: 'shoulders',
    notes: 'Great compound movement for shoulders',
    reps: '8-12',
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    sets: '4',
    targetMuscles: ['Shoulders'],
    tips: [
      'Keep core tight',
      'Natural arc movement',
      'Full range of motion',
      'Control descent'
    ],
    muscles_worked: ['shoulders', 'triceps'],
    common_mistakes: [
      'Arching back',
      'Uneven pressing',
      'Poor wrist position',
      'Using momentum'
    ],
    variations: ['Standing Press', 'Alternating Press', 'Arnold Press'],
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog'
  },
  {
    name: 'Cable Crunches',
    category: 'core',
    difficulty: 'Intermediate',
    equipment: ['Cable Machine', 'Rope Attachment'],
    instructions: [
      'Kneel facing cable machine',
      'Hold rope behind head',
      'Crunch down towards floor',
      'Control return movement',
      'Keep tension on abs'
    ],
    muscleGroup: 'core',
    notes: 'Excellent weighted ab exercise',
    reps: '15-20',
    secondaryMuscles: ['Hip Flexors'],
    sets: '3',
    targetMuscles: ['Abs'],
    tips: [
      'Round your back',
      'Keep hips still',
      'Focus on abs',
      'Control movement'
    ],
    muscles_worked: ['abs', 'core'],
    common_mistakes: [
      'Using hip flexors',
      'Moving hips',
      'Poor range of motion',
      'Too much weight'
    ],
    variations: ['Standing Crunches', 'Side Bends', 'Wood Chops'],
    videoUrl: 'https://www.youtube.com/embed/AV5PmZJIrrw'
  }
];

const populateExercises = async () => {
  try {
    const exercisesRef = db.collection('exercises');
    console.log('Starting to populate additional exercises...');
    
    for (const exercise of additionalExercises) {
      await exercisesRef.add(exercise);
      console.log(`Added exercise: ${exercise.name}`);
    }

    console.log('Successfully populated additional exercises!');
  } catch (error) {
    console.error('Error populating additional exercises:', error);
    throw error;
  }
};

// Run the population script
populateExercises(); 