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
      },
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'chest',
        equipment: ['bodyweight'],
        difficulty: 2,
        instructions: [
          'Start in plank position with hands slightly wider than shoulders',
          'Keep body in straight line from head to heels',
          'Lower chest toward floor by bending elbows',
          'Push back up to starting position',
          'Keep core engaged throughout movement'
        ],
        muscles_worked: ['chest', 'triceps', 'shoulders', 'core'],
        tips: [
          'Keep elbows at 45-degree angle from body',
          'Maintain neutral neck position',
          'Breathe in on way down, out on way up',
          'Fully extend arms at top without locking elbows'
        ],
        common_mistakes: [
          'Sagging or raising hips',
          'Flaring elbows too wide',
          'Not going through full range of motion',
          'Holding breath'
        ],
        variations: ['Incline Push-ups', 'Decline Push-ups', 'Diamond Push-ups', 'Wide Push-ups'],
        targetMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        sets: '3-4',
        reps: '10-20',
        notes: 'Fundamental bodyweight exercise for upper body',
        videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4'
      },
      {
        id: 'incline-bench-press',
        name: 'Incline Bench Press',
        category: 'chest',
        equipment: ['barbell', 'incline bench'],
        difficulty: 3,
        instructions: [
          'Set bench to 30-45 degree angle',
          'Lie back on incline bench with feet flat on floor',
          'Grip barbell slightly wider than shoulder width',
          'Lower bar to upper chest with control',
          'Press bar back up to starting position'
        ],
        muscles_worked: ['upper chest', 'shoulders', 'triceps'],
        tips: [
          'Keep wrists straight throughout movement',
          'Maintain back contact with bench',
          'Control the descent',
          'Focus on upper chest contraction'
        ],
        common_mistakes: [
          'Setting bench too steep',
          'Bouncing bar off chest',
          'Arching back excessively',
          'Using too much weight'
        ],
        variations: ['Dumbbell Incline Press', 'Smith Machine Incline Press', 'Close Grip Incline Press'],
        targetMuscles: ['Upper Chest'],
        secondaryMuscles: ['Shoulders', 'Triceps'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Excellent for upper chest development',
        videoUrl: 'https://www.youtube.com/embed/SrqOu55lrYU'
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
      },
      {
        id: 'deadlifts',
        name: 'Deadlifts',
        category: 'back',
        equipment: ['barbell', 'weight plates'],
        difficulty: 4,
        instructions: [
          'Stand with feet hip-width apart, barbell over midfoot',
          'Bend at hips and knees, grasp bar with hands shoulder-width apart',
          'Keep chest up, back flat, and pull bar up along shins',
          'Extend hips and knees to stand upright',
          'Return weight to floor with controlled hip hinge'
        ],
        muscles_worked: ['lower back', 'hamstrings', 'glutes', 'traps', 'forearms'],
        tips: [
          'Keep bar close to body throughout movement',
          'Engage core before lifting',
          'Drive through heels',
          'Maintain neutral spine'
        ],
        common_mistakes: [
          'Rounding the lower back',
          'Starting with the bar too far forward',
          'Lifting with the back instead of driving with legs',
          'Jerking the weight off the floor'
        ],
        variations: ['Sumo Deadlift', 'Romanian Deadlift', 'Trap Bar Deadlift'],
        targetMuscles: ['Lower Back', 'Hamstrings', 'Glutes'],
        secondaryMuscles: ['Traps', 'Forearms', 'Core'],
        sets: '3-5',
        reps: '5-8',
        notes: 'Fundamental compound movement for back strength',
        videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q'
      },
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        category: 'back',
        equipment: ['cable machine', 'lat pulldown bar'],
        difficulty: 2,
        instructions: [
          'Sit at lat pulldown machine with thighs secured under pads',
          'Grasp bar with hands slightly wider than shoulder width',
          'Pull bar down to upper chest while leaning back slightly',
          'Squeeze shoulder blades together at bottom of movement',
          'Slowly return to starting position with arms fully extended'
        ],
        muscles_worked: ['latissimus dorsi', 'rhomboids', 'biceps', 'rear deltoids'],
        tips: [
          'Focus on pulling with back muscles, not arms',
          'Keep chest up throughout movement',
          'Avoid excessive leaning back',
          'Control the weight on return'
        ],
        common_mistakes: [
          'Using momentum to pull the weight down',
          'Pulling the bar behind the neck',
          'Hunching shoulders',
          'Pulling with arms instead of back'
        ],
        variations: ['Close-grip Lat Pulldown', 'V-bar Pulldown', 'Single-arm Pulldown', 'Straight-arm Pulldown'],
        targetMuscles: ['Lats', 'Upper Back'],
        secondaryMuscles: ['Biceps', 'Rear Deltoids'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Great alternative for those who cannot do pull-ups',
        videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc'
      },
      {
        id: 'barbell-rows',
        name: 'Barbell Rows',
        category: 'back',
        equipment: ['barbell'],
        difficulty: 3,
        instructions: [
          'Stand with feet shoulder-width apart, knees slightly bent',
          'Bend at hips until torso is nearly parallel to floor',
          'Grasp barbell with hands shoulder-width apart',
          'Pull barbell to lower ribs while keeping back straight',
          'Lower barbell with control to starting position'
        ],
        muscles_worked: ['latissimus dorsi', 'rhomboids', 'trapezius', 'rear deltoids', 'biceps'],
        tips: [
          'Keep core tight throughout movement',
          'Pull shoulders back and down',
          'Look at floor to maintain neutral neck',
          'Keep elbows close to body'
        ],
        common_mistakes: [
          'Rounding the back',
          'Using momentum to lift weight',
          'Insufficient range of motion',
          'Lifting torso during pull'
        ],
        variations: ['Pendlay Rows', 'Yates Rows', 'Meadows Rows', 'T-bar Rows'],
        targetMuscles: ['Middle Back', 'Lats'],
        secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Forearms'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Fundamental back building exercise',
        videoUrl: 'https://www.youtube.com/embed/T3N-TO4reLQ'
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
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        category: 'shoulders',
        equipment: ['dumbbells'],
        difficulty: 2,
        instructions: [
          'Stand with feet shoulder-width apart holding dumbbells at sides',
          'Keep slight bend in elbows',
          'Raise arms out to sides until parallel with floor',
          'Pause briefly at the top',
          'Lower weights back to starting position with control'
        ],
        muscles_worked: ['deltoids', 'trapezius', 'rotator cuff'],
        tips: [
          'Lead with elbows, not hands',
          'Keep wrists neutral',
          'Maintain upright posture',
          'Use controlled movement throughout'
        ],
        common_mistakes: [
          'Using momentum to swing weights up',
          'Raising arms too high (above shoulder level)',
          'Shrugging shoulders during movement',
          'Using too heavy weight'
        ],
        variations: ['Cable Lateral Raises', 'Bent-Over Lateral Raises', 'Single-Arm Lateral Raises'],
        targetMuscles: ['Side Deltoids'],
        secondaryMuscles: ['Front Deltoids', 'Trapezius'],
        sets: '3',
        reps: '12-15',
        notes: 'Excellent isolation exercise for shoulder width',
        videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo'
      },
      {
        id: 'face-pulls',
        name: 'Face Pulls',
        category: 'shoulders',
        equipment: ['cable machine', 'rope attachment'],
        difficulty: 2,
        instructions: [
          'Set cable pulley to slightly above head height',
          'Attach rope handle and grasp with both hands, palms facing each other',
          'Step back to create tension in cable',
          'Pull rope toward face, separating hands as you pull',
          'Aim for rope to reach either side of face',
          'Return to starting position with control'
        ],
        muscles_worked: ['rear deltoids', 'middle deltoids', 'rotator cuff', 'trapezius'],
        tips: [
          'Keep elbows high throughout movement',
          'Focus on external rotation at end of movement',
          'Use lighter weight for proper form',
          'Maintain slight lean back for stability'
        ],
        common_mistakes: [
          'Using too much weight',
          'Pulling with arms instead of shoulders',
          'Insufficient range of motion',
          'Poor posture during exercise'
        ],
        variations: ['Resistance Band Face Pulls', 'TRX Face Pulls', 'Seated Face Pulls', 'High-to-Low Face Pulls'],
        targetMuscles: ['Rear Deltoids', 'Rotator Cuff'],
        secondaryMuscles: ['Trapezius', 'Rhomboids'],
        sets: '3-4',
        reps: '12-15',
        notes: 'Excellent for shoulder health and posture',
        videoUrl: 'https://www.youtube.com/embed/eIq5CB9JfKE'
      },
      {
        id: 'shoulder-press',
        name: 'Shoulder Press',
        category: 'shoulders',
        equipment: ['dumbbells', 'barbell'],
        difficulty: 3,
        instructions: [
          'Sit on bench with back support or stand with feet shoulder-width apart',
          'Hold weights at shoulder level with palms facing forward',
          'Press weights upward until arms are extended overhead',
          'Briefly hold at top position',
          'Lower weights with control back to shoulder level'
        ],
        muscles_worked: ['deltoids', 'trapezius', 'triceps', 'serratus anterior'],
        tips: [
          'Keep core engaged throughout movement',
          'Avoid arching lower back excessively',
          'Press weights slightly in front of head, not behind',
          'Maintain control at all times'
        ],
        common_mistakes: [
          'Using excess body momentum',
          'Pressing behind the head',
          'Flaring elbows too far out',
          'Incomplete range of motion'
        ],
        variations: ['Seated Dumbbell Press', 'Standing Barbell Press', 'Arnold Press', 'Push Press'],
        targetMuscles: ['Shoulders'],
        secondaryMuscles: ['Triceps', 'Upper Chest', 'Upper Back'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Primary movement for shoulder development',
        videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog'
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
      },
      {
        id: 'squats',
        name: 'Squats',
        category: 'legs',
        equipment: ['barbell', 'squat rack'],
        difficulty: 4,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Position barbell across upper back',
          'Keep chest up and core braced',
          'Bend knees and hips to lower body until thighs are parallel to floor',
          'Drive through heels to return to starting position'
        ],
        muscles_worked: ['quadriceps', 'hamstrings', 'glutes', 'core', 'lower back'],
        tips: [
          'Keep knees in line with toes',
          'Maintain weight on midfoot and heels',
          'Look straight ahead to maintain neutral spine',
          'Breathe in on descent, out on ascent'
        ],
        common_mistakes: [
          'Knees caving inward',
          'Rounding the back',
          'Rising onto toes',
          'Not reaching proper depth',
          'Looking up too much'
        ],
        variations: ['Front Squats', 'Goblet Squats', 'Bulgarian Split Squats', 'Hack Squats'],
        targetMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
        sets: '3-5',
        reps: '8-12',
        notes: 'The king of leg exercises',
        videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8'
      },
      {
        id: 'lunges',
        name: 'Lunges',
        category: 'legs',
        equipment: ['bodyweight', 'dumbbells'],
        difficulty: 2,
        instructions: [
          'Stand upright with feet hip-width apart',
          'Take a large step forward with one leg',
          'Lower body until both knees are bent at 90-degree angles',
          'Front knee should be over ankle, back knee hovering above floor',
          'Push through front heel to return to starting position',
          'Repeat with opposite leg'
        ],
        muscles_worked: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'],
        tips: [
          'Keep torso upright throughout movement',
          'Ensure front knee tracks over foot, not inward',
          'Lower body straight down, not forward',
          'Use controlled movement in both directions'
        ],
        common_mistakes: [
          'Stepping too short or too long',
          'Letting front knee extend past toes',
          'Leaning forward excessively',
          'Not lowering deep enough'
        ],
        variations: ['Walking Lunges', 'Reverse Lunges', 'Side Lunges', 'Bulgarian Split Squats'],
        targetMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
        sets: '3',
        reps: '10-12 (each leg)',
        notes: 'Great unilateral leg exercise',
        videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U'
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        category: 'legs',
        equipment: ['leg press machine'],
        difficulty: 3,
        instructions: [
          'Sit on leg press machine with back against pad',
          'Place feet shoulder-width apart on platform',
          'Release safety locks and lower weight until knees form 90-degree angle',
          'Push through heels until legs are extended (without locking knees)',
          'Lower weight with control and repeat'
        ],
        muscles_worked: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        tips: [
          'Keep lower back pressed against the pad',
          'Don\'t lock out knees at top of movement',
          'Control the weight throughout',
          'Adjust foot position to target different muscles'
        ],
        common_mistakes: [
          'Lifting buttocks off seat',
          'Locking knees at top',
          'Using too much weight',
          'Bringing knees too close to chest'
        ],
        variations: ['Wide Stance Leg Press', 'Narrow Stance Leg Press', 'Single-leg Leg Press', 'High Foot Leg Press'],
        targetMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Calves'],
        sets: '3-4',
        reps: '8-15',
        notes: 'Machine alternative to squats',
        videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ'
      },
      {
        id: 'calf-raises',
        name: 'Calf Raises',
        category: 'legs',
        equipment: ['bodyweight', 'dumbbells', 'calf raise machine'],
        difficulty: 1,
        instructions: [
          'Stand with feet hip-width apart',
          'Lift heels off ground by extending ankles',
          'Rise as high as possible onto toes',
          'Hold contracted position briefly',
          'Lower heels back to floor with control'
        ],
        muscles_worked: ['gastrocnemius', 'soleus'],
        tips: [
          'Balance against stable object if needed',
          'Perform through full range of motion',
          'Hold at top for 1-2 seconds',
          'Try with toes pointed in, out, and straight for full development'
        ],
        common_mistakes: [
          'Lifting too quickly',
          'Not rising high enough',
          'Bouncing at bottom',
          'Using momentum instead of muscle control'
        ],
        variations: ['Seated Calf Raises', 'Single-leg Calf Raises', 'Donkey Calf Raises', 'Barbell Calf Raises'],
        targetMuscles: ['Calves'],
        secondaryMuscles: ['Ankles', 'Feet'],
        sets: '3-4',
        reps: '15-25',
        notes: 'Best with high rep ranges for calf development',
        videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI'
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
      },
      {
        id: 'bicep-curls',
        name: 'Bicep Curls',
        category: 'arms',
        equipment: ['dumbbells'],
        difficulty: 2,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold dumbbells at sides with palms facing forward',
          'Keep elbows close to torso',
          'Curl weights up to shoulder level',
          'Lower with control to starting position'
        ],
        muscles_worked: ['biceps', 'forearms'],
        tips: [
          'Avoid swinging the body',
          'Keep upper arms stationary',
          'Squeeze biceps at the top',
          'Control the descent'
        ],
        common_mistakes: [
          'Using momentum to swing weights',
          'Moving elbows away from torso',
          'Incomplete range of motion',
          'Rushing through the movement'
        ],
        variations: ['Hammer Curls', 'Preacher Curls', 'Concentration Curls', 'Incline Curls'],
        targetMuscles: ['Biceps'],
        secondaryMuscles: ['Forearms'],
        sets: '3',
        reps: '10-15',
        notes: 'Classic exercise for bicep development',
        videoUrl: 'https://www.youtube.com/embed/ykJmrZ5v0Oo'
      },
      {
        id: 'triceps-dips',
        name: 'Triceps Dips',
        category: 'arms',
        equipment: ['dip bars', 'bench'],
        difficulty: 3,
        instructions: [
          'Grip parallel bars with arms fully extended',
          'Keep chest up and shoulders down',
          'Bend elbows to lower body until upper arms are parallel to floor',
          'Push back up to starting position',
          'Keep elbows pointing backward throughout movement'
        ],
        muscles_worked: ['triceps', 'chest', 'shoulders'],
        tips: [
          'Lean forward slightly to target triceps more',
          'Keep core engaged',
          'Control the descent',
          'Avoid shrugging shoulders'
        ],
        common_mistakes: [
          'Flaring elbows outward',
          'Dropping shoulders too low',
          'Using momentum',
          'Insufficient range of motion'
        ],
        variations: ['Bench Dips', 'Ring Dips', 'Assisted Dips', 'Weighted Dips'],
        targetMuscles: ['Triceps'],
        secondaryMuscles: ['Chest', 'Shoulders'],
        sets: '3',
        reps: '8-12',
        notes: 'Compound movement for tricep development',
        videoUrl: 'https://www.youtube.com/embed/6kALZikXxLc'
      },
      {
        id: 'hammer-curls',
        name: 'Hammer Curls',
        category: 'arms',
        equipment: ['dumbbells'],
        difficulty: 2,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold dumbbells at sides with neutral grip (palms facing each other)',
          'Keep elbows close to torso',
          'Curl weights up toward shoulders',
          'Lower with control to starting position'
        ],
        muscles_worked: ['biceps', 'brachialis', 'forearms'],
        tips: [
          'Maintain neutral wrist position throughout',
          'Keep upper arms stationary',
          'Control the movement in both directions',
          'Keep shoulders relaxed'
        ],
        common_mistakes: [
          'Swinging the body for momentum',
          'Moving elbows away from sides',
          'Using too heavy weight',
          'Rushing through repetitions'
        ],
        variations: ['Alternating Hammer Curls', 'Cross-body Hammer Curls', 'Seated Hammer Curls', 'Incline Hammer Curls'],
        targetMuscles: ['Biceps', 'Brachialis'],
        secondaryMuscles: ['Forearms'],
        sets: '3',
        reps: '10-15',
        notes: 'Great for developing arm thickness',
        videoUrl: 'https://www.youtube.com/embed/zC3nLlEvin4'
      },
      {
        id: 'skull-crushers',
        name: 'Skull Crushers',
        category: 'arms',
        equipment: ['barbell', 'EZ bar', 'dumbbells', 'bench'],
        difficulty: 3,
        instructions: [
          'Lie on bench with feet flat on floor',
          'Hold weight with hands shoulder-width apart above chest',
          'Keep upper arms stationary, pointing toward ceiling',
          'Bend elbows to lower weight toward forehead',
          'Extend elbows to return to starting position'
        ],
        muscles_worked: ['triceps'],
        tips: [
          'Keep elbows pointed forward, not outward',
          'Maintain control throughout movement',
          'Keep wrists straight',
          'Focus on triceps contraction'
        ],
        common_mistakes: [
          'Letting elbows flare out',
          'Allowing upper arms to move',
          'Using too much weight',
          'Extending shoulders during lift'
        ],
        variations: ['EZ Bar Skull Crushers', 'Dumbbell Skull Crushers', 'Decline Skull Crushers', 'Single-arm Skull Crushers'],
        targetMuscles: ['Triceps'],
        secondaryMuscles: ['Shoulders'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Excellent triceps isolation exercise',
        videoUrl: 'https://www.youtube.com/embed/d_KZxkY_0cM'
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
      },
      {
        id: 'russian-twists',
        name: 'Russian Twists',
        category: 'core',
        equipment: ['bodyweight', 'weight plate', 'medicine ball'],
        difficulty: 2,
        instructions: [
          'Sit on floor with knees bent and feet elevated slightly',
          'Lean back to create a 45-degree angle with torso',
          'Clasp hands together or hold weight',
          'Twist torso to right, touching hands/weight to floor',
          'Twist to left side and repeat'
        ],
        muscles_worked: ['abs', 'obliques', 'lower back'],
        tips: [
          'Keep chest up throughout movement',
          'Focus on rotating from core, not arms',
          'Maintain elevation of feet',
          'Control the movement'
        ],
        common_mistakes: [
          'Using arms to lead the movement',
          'Hunching shoulders',
          'Moving too quickly',
          'Insufficient rotation'
        ],
        variations: ['Weighted Russian Twists', 'Elevated Russian Twists', 'Stability Ball Russian Twists'],
        targetMuscles: ['Obliques', 'Abs'],
        secondaryMuscles: ['Lower Back', 'Hip Flexors'],
        sets: '3',
        reps: '12-20 (each side)',
        notes: 'Excellent for rotational core strength',
        videoUrl: 'https://www.youtube.com/embed/wkD8rjkodUI'
      },
      {
        id: 'planks',
        name: 'Planks',
        category: 'core',
        equipment: ['bodyweight'],
        difficulty: 2,
        instructions: [
          'Start in push-up position with arms straight',
          'Lower onto forearms with elbows under shoulders',
          'Keep body in straight line from head to heels',
          'Engage core and squeeze glutes',
          'Hold position for desired time'
        ],
        muscles_worked: ['rectus abdominis', 'transverse abdominis', 'obliques', 'lower back'],
        tips: [
          'Keep neck in neutral position',
          'Don\'t allow hips to sag or pike up',
          'Breathe steadily throughout hold',
          'Focus on quality over time'
        ],
        common_mistakes: [
          'Dropping hips too low',
          'Raising hips too high',
          'Holding breath',
          'Looking up (straining neck)'
        ],
        variations: ['Side Planks', 'Plank with Leg Lift', 'Plank with Arm Reach', 'Plank with Shoulder Taps'],
        targetMuscles: ['Core'],
        secondaryMuscles: ['Shoulders', 'Chest', 'Glutes'],
        sets: '3-4',
        reps: '30-60 seconds',
        notes: 'Fundamental core stability exercise',
        videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw'
      },
      {
        id: 'hanging-leg-raises',
        name: 'Hanging Leg Raises',
        category: 'core',
        equipment: ['pull-up bar'],
        difficulty: 4,
        instructions: [
          'Hang from pull-up bar with arms fully extended',
          'Keep shoulders engaged (not fully relaxed)',
          'Raise legs together until they are parallel to floor (or higher)',
          'Pause briefly at top position',
          'Lower legs with control to starting position'
        ],
        muscles_worked: ['lower abs', 'hip flexors', 'obliques', 'rectus abdominis'],
        tips: [
          'Avoid swinging or using momentum',
          'Exhale as you raise legs',
          'Maintain shoulder stability throughout',
          'Keep core engaged at all times'
        ],
        common_mistakes: [
          'Swinging body',
          'Using hip flexors more than abs',
          'Incomplete range of motion',
          'Holding breath'
        ],
        variations: ['Knee Raises', 'Toes-to-Bar', 'Side Knee Raises', 'L-Sit Holds'],
        targetMuscles: ['Lower Abs'],
        secondaryMuscles: ['Hip Flexors', 'Grip', 'Shoulders'],
        sets: '3-4',
        reps: '8-15',
        notes: 'Advanced exercise for lower ab development',
        videoUrl: 'https://www.youtube.com/embed/Pr1ieGZ5atk'
      }
    ],
    fullbody: [
      {
        id: 'burpees',
        name: 'Burpees',
        category: 'cardio',
        equipment: ['bodyweight'],
        difficulty: 4,
        instructions: [
          'Start in standing position',
          'Drop into squat position with hands on ground',
          'Kick feet back into plank position',
          'Perform a push-up (optional)',
          'Jump feet back to squat position',
          'Explosively jump up with arms overhead'
        ],
        muscles_worked: ['quadriceps', 'chest', 'shoulders', 'triceps', 'core', 'hamstrings'],
        tips: [
          'Maintain proper form through fatigue',
          'Land softly on balls of feet',
          'Keep core engaged throughout',
          'Modify by removing push-up or jump if needed'
        ],
        common_mistakes: [
          'Sagging hips in plank position',
          'Poor push-up form',
          'Not fully extending during jump',
          'Landing with straight knees'
        ],
        variations: ['Half Burpees', 'Burpee Pull-ups', 'Single-leg Burpees', 'Box Jump Burpees'],
        targetMuscles: ['Full Body'],
        secondaryMuscles: ['Heart', 'Lungs'],
        sets: '3-5',
        reps: '10-15',
        notes: 'High-intensity full body movement',
        videoUrl: 'https://www.youtube.com/embed/TU8QYVW0gDU'
      }
    ],
    cardio: [
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        equipment: ['bodyweight'],
        difficulty: 1,
        instructions: [
          'Stand with feet together and arms at sides',
          'Jump feet out wider than shoulder-width',
          'Simultaneously raise arms above head',
          'Jump feet back together while lowering arms',
          'Repeat at a steady, brisk pace'
        ],
        muscles_worked: ['shoulders', 'calves', 'core', 'hip abductors'],
        tips: [
          'Land softly on balls of feet',
          'Maintain good posture throughout',
          'Keep movements controlled but rhythmic',
          'Breathe steadily throughout'
        ],
        common_mistakes: [
          'Landing flat-footed or with stiff legs',
          'Poor arm coordination',
          'Hunching shoulders',
          'Insufficient range of motion'
        ],
        variations: ['Low-impact Jumping Jacks', 'Cross Jacks', 'Plyo Jacks', 'Squat Jacks'],
        targetMuscles: ['Cardiovascular System'],
        secondaryMuscles: ['Shoulders', 'Hip Abductors', 'Calves'],
        sets: '2-4',
        reps: '30-60 seconds',
        notes: 'Excellent warm-up exercise and cardio builder',
        videoUrl: 'https://www.youtube.com/embed/c4DAnQ6DtF8'
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        category: 'cardio',
        equipment: ['bodyweight'],
        difficulty: 2,
        instructions: [
          'Start in high plank position with shoulders over wrists',
          'Keep core engaged and back flat',
          'Alternate bringing knees toward chest in running motion',
          'Maintain steady rhythm and breathing',
          'Keep hips stable throughout movement'
        ],
        muscles_worked: ['core', 'shoulders', 'chest', 'quadriceps', 'hip flexors'],
        tips: [
          'Keep pace controlled but brisk',
          'Don\'t let hips rise too high',
          'Maintain steady breathing',
          'Keep shoulders over wrists'
        ],
        common_mistakes: [
          'Raising hips too high',
          'Sagging in middle',
          'Moving too slowly',
          'Not keeping shoulders over wrists'
        ],
        variations: ['Slow Mountain Climbers', 'Cross-body Mountain Climbers', 'Mountain Climbers with Sliders'],
        targetMuscles: ['Core', 'Cardiovascular System'],
        secondaryMuscles: ['Shoulders', 'Chest', 'Hip Flexors'],
        sets: '3-4',
        reps: '30-60 seconds',
        notes: 'Excellent for cardiovascular fitness and core stability',
        videoUrl: 'https://www.youtube.com/embed/nmwgirgXLYM'
      },
      {
        id: 'box-jumps',
        name: 'Box Jumps',
        category: 'cardio',
        equipment: ['plyo box'],
        difficulty: 3,
        instructions: [
          'Stand facing plyo box with feet shoulder-width apart',
          'Lower into quarter squat position',
          'Swing arms back, then forward while jumping onto box',
          'Land softly with knees slightly bent',
          'Step down carefully and repeat'
        ],
        muscles_worked: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'],
        tips: [
          'Start with lower box height',
          'Land softly in middle of box',
          'Use arms for momentum',
          'Always step down, don\'t jump down'
        ],
        common_mistakes: [
          'Landing with straight legs',
          'Not using arm swing',
          'Looking down during jump',
          'Jumping backward off box'
        ],
        variations: ['Step-ups', 'Single-leg Box Jumps', 'Lateral Box Jumps', 'Box Jump-overs'],
        targetMuscles: ['Legs', 'Cardiovascular System'],
        secondaryMuscles: ['Core', 'Lower Back'],
        sets: '3-4',
        reps: '8-12',
        notes: 'Excellent for explosive power and cardiovascular conditioning',
        videoUrl: 'https://www.youtube.com/embed/52r_Ul5k03g'
      }
    ],
    mobility: [
      {
        id: 'hip-bridges',
        name: 'Hip Bridges',
        category: 'mobility',
        equipment: ['bodyweight', 'resistance band'],
        difficulty: 1,
        instructions: [
          'Lie on back with knees bent and feet flat on floor',
          'Place arms at sides with palms facing down',
          'Engage core and squeeze glutes',
          'Lift hips off ground until body forms straight line from shoulders to knees',
          'Hold briefly at top position',
          'Lower hips back to starting position with control'
        ],
        muscles_worked: ['glutes', 'hamstrings', 'lower back', 'core'],
        tips: [
          'Keep weight in heels during lift',
          'Avoid overarching lower back',
          'Squeeze glutes at top of movement',
          'Keep core engaged throughout'
        ],
        common_mistakes: [
          'Using lower back instead of glutes',
          'Lifting too high (hyperextending)',
          'Feet positioned too far from glutes',
          'Not fully engaging glutes'
        ],
        variations: ['Single-leg Hip Bridges', 'Banded Hip Bridges', 'Elevated Hip Bridges', 'Weighted Hip Bridges'],
        targetMuscles: ['Glutes'],
        secondaryMuscles: ['Hamstrings', 'Lower Back', 'Core'],
        sets: '2-3',
        reps: '12-20',
        notes: 'Great for glute activation and hip mobility',
        videoUrl: 'https://www.youtube.com/embed/2T_UcKyNHOs'
      },
      {
        id: 'world-greatest-stretch',
        name: 'World\'s Greatest Stretch',
        category: 'mobility',
        equipment: ['bodyweight'],
        difficulty: 2,
        instructions: [
          'Start in high plank position',
          'Step right foot forward outside right hand',
          'Keep left leg extended behind you',
          'Place right hand inside right foot',
          'Rotate torso and reach right hand toward ceiling',
          'Return to starting position and repeat on other side'
        ],
        muscles_worked: ['hip flexors', 'hamstrings', 'chest', 'shoulders', 'core'],
        tips: [
          'Keep back leg straight for deeper stretch',
          'Open chest fully during rotation',
          'Breathe deeply throughout movement',
          'Move slowly with control'
        ],
        common_mistakes: [
          'Rushing through the movement',
          'Not stepping foot far enough forward',
          'Insufficient torso rotation',
          'Collapsing in chest'
        ],
        variations: ['Static Hold WGS', 'Kneeling WGS', 'WGS with Forward Fold'],
        targetMuscles: ['Hip Flexors', 'Thoracic Spine'],
        secondaryMuscles: ['Hamstrings', 'Chest', 'Shoulders'],
        sets: '2-3',
        reps: '5-8 (each side)',
        notes: 'Excellent full-body mobility exercise',
        videoUrl: 'https://www.youtube.com/embed/G8RP4pqwGxQ'
      },
      {
        id: 'cat-cow-stretch',
        name: 'Cat-Cow Stretch',
        category: 'mobility',
        equipment: ['bodyweight'],
        difficulty: 1,
        instructions: [
          'Start on hands and knees in tabletop position',
          'Inhale, drop belly toward floor, lift chin and chest (Cow)',
          'Exhale, round spine toward ceiling, tuck chin to chest (Cat)',
          'Flow between positions with breath',
          'Keep movements slow and controlled'
        ],
        muscles_worked: ['spine', 'neck', 'shoulders', 'core'],
        tips: [
          'Synchronize movement with breath',
          'Focus on moving each vertebra',
          'Keep arms straight and shoulders relaxed',
          'Move at your own pace'
        ],
        common_mistakes: [
          'Moving too quickly',
          'Not coordinating with breath',
          'Limited spinal movement',
          'Collapsing shoulders'
        ],
        variations: ['Thread the Needle', 'Bird-Dog Cat-Cow', 'Standing Cat-Cow'],
        targetMuscles: ['Spine'],
        secondaryMuscles: ['Core', 'Neck', 'Shoulders'],
        sets: '2-3',
        reps: '8-10 cycles',
        notes: 'Excellent for spinal mobility and relaxation',
        videoUrl: 'https://www.youtube.com/embed/kqnua4rHVVA'
      }
    ]
  }
}; 