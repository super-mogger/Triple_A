import { Exercise } from '../types/exercise';

interface ExerciseDatabase {
  intermediate: {
    chest: Exercise[];
    back: Exercise[];
    shoulders: Exercise[];
    legs: Exercise[];
    arms: Exercise[];
    core: Exercise[];
  };
}

export const exerciseDatabase: ExerciseDatabase = {
  intermediate: {
    chest: [
      {
        name: "Barbell Bench Press",
        sets: "4",
        reps: "8-12",
        notes: "Keep shoulders retracted and feet planted",
        targetMuscles: ["Chest", "Front Deltoids", "Triceps"],
        secondaryMuscles: ["Core", "Shoulders"],
        videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
        instructions: [
          "Lie flat on bench with feet planted firmly",
          "Grip barbell slightly wider than shoulder width",
          "Lower bar to mid-chest with control",
          "Press bar up while maintaining shoulder position",
          "Lock out arms at top without losing shoulder position"
        ],
        tips: [
          "Keep wrists straight throughout movement",
          "Drive shoulders into bench",
          "Maintain natural arch in lower back",
          "Breathe out on press up"
        ],
        equipment: ["Barbell", "Bench"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Dumbbell Bench Press",
        sets: "4",
        reps: "8-12",
        notes: "Great for balanced chest development",
        targetMuscles: ["Chest", "Front Deltoids"],
        secondaryMuscles: ["Triceps", "Core"],
        videoUrl: "https://www.youtube.com/embed/VmB1G1K7v94",
        instructions: [
          "Lie on bench holding dumbbells at chest level",
          "Press dumbbells up while maintaining control",
          "Lower weights with controlled movement",
          "Keep elbows at 45-degree angle",
          "Pause briefly at bottom of movement"
        ],
        tips: [
          "Keep core tight throughout",
          "Don't let dumbbells touch at top",
          "Control the descent",
          "Keep back flat on bench"
        ],
        equipment: ["Dumbbells", "Bench"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Incline Dumbbell Press",
        sets: "3",
        reps: "10-12",
        notes: "Targets upper chest development",
        targetMuscles: ["Upper Chest", "Front Deltoids"],
        secondaryMuscles: ["Triceps", "Core"],
        videoUrl: "https://www.youtube.com/embed/8iPEnn-ltC8",
        instructions: [
          "Set bench to 30-45 degree angle",
          "Hold dumbbells at shoulder level",
          "Press weights up and slightly back",
          "Lower with control to starting position",
          "Maintain elbow position throughout"
        ],
        tips: [
          "Keep shoulders down and back",
          "Don't arch back excessively",
          "Control the weights throughout",
          "Focus on upper chest contraction"
        ],
        equipment: ["Dumbbells", "Incline Bench"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Cable Flyes",
        sets: "3",
        reps: "12-15",
        notes: "Great for chest isolation and constant tension",
        targetMuscles: ["Chest", "Front Deltoids"],
        secondaryMuscles: ["Core"],
        videoUrl: "https://www.youtube.com/embed/Iwe6AmxVf7o",
        instructions: [
          "Stand between cable machines",
          "Grip handles with slight bend in elbows",
          "Bring hands together in arc motion",
          "Control return to starting position",
          "Maintain chest height throughout"
        ],
        tips: [
          "Keep slight bend in elbows",
          "Focus on squeezing chest",
          "Don't let hands touch at peak",
          "Maintain posture throughout"
        ],
        equipment: ["Cable Machine"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Decline Bench Press",
        sets: "3",
        reps: "8-12",
        notes: "Targets lower chest development",
        targetMuscles: ["Lower Chest", "Triceps"],
        secondaryMuscles: ["Front Deltoids", "Core"],
        videoUrl: "https://www.youtube.com/embed/LfyQBUKR8SE",
        instructions: [
          "Secure legs on decline bench",
          "Grip barbell slightly wider than shoulders",
          "Lower bar to lower chest",
          "Press up with controlled movement",
          "Lock out arms at top"
        ],
        tips: [
          "Keep head against bench",
          "Maintain control throughout",
          "Focus on lower chest contraction",
          "Don't bounce bar off chest"
        ],
        equipment: ["Barbell", "Decline Bench"],
        difficulty: "Intermediate",
        category: "Push"
      }
    ],
    back: [
      {
        name: "Barbell Rows",
        sets: "4",
        reps: "8-12",
        notes: "Excellent compound movement for back thickness",
        targetMuscles: ["Upper Back", "Lats"],
        secondaryMuscles: ["Biceps", "Core", "Lower Back"],
        videoUrl: "https://www.youtube.com/embed/9efgcAjQe7E",
        instructions: [
          "Bend at hips with slight knee bend",
          "Grip barbell wider than shoulder width",
          "Pull bar to lower chest/upper abs",
          "Squeeze shoulder blades together",
          "Lower with control to starting position"
        ],
        tips: [
          "Keep back straight throughout",
          "Look down to maintain neck position",
          "Drive elbows back",
          "Feel stretch at bottom"
        ],
        equipment: ["Barbell"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Lat Pulldowns",
        sets: "4",
        reps: "10-12",
        notes: "Great for lat development and width",
        targetMuscles: ["Lats", "Upper Back"],
        secondaryMuscles: ["Biceps", "Forearms"],
        videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc",
        instructions: [
          "Grip bar wider than shoulder width",
          "Lean back slightly",
          "Pull bar to upper chest",
          "Control return to start position",
          "Maintain shoulder blade engagement"
        ],
        tips: [
          "Keep chest up throughout",
          "Don't lean back too far",
          "Focus on using lats",
          "Full range of motion"
        ],
        equipment: ["Cable Machine", "Lat Pulldown Bar"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Seated Cable Rows",
        sets: "3",
        reps: "12-15",
        notes: "Builds mid-back thickness and strength",
        targetMuscles: ["Middle Back", "Lats"],
        secondaryMuscles: ["Biceps", "Rear Deltoids"],
        videoUrl: "https://www.youtube.com/embed/GZbfZ033f74",
        instructions: [
          "Sit with feet secured on platform",
          "Grip handle with arms extended",
          "Pull handle to lower chest",
          "Squeeze shoulder blades together",
          "Return to start with control"
        ],
        tips: [
          "Keep chest up and back straight",
          "Don't rock back and forth",
          "Lead with elbows",
          "Full extension at start"
        ],
        equipment: ["Cable Machine", "Row Handle"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Single-Arm Dumbbell Row",
        sets: "3",
        reps: "10-12",
        notes: "Great for unilateral back development",
        targetMuscles: ["Lats", "Upper Back"],
        secondaryMuscles: ["Biceps", "Core"],
        videoUrl: "https://www.youtube.com/embed/pYcpY20QaE8",
        instructions: [
          "Place knee and hand on bench",
          "Hold dumbbell with free hand",
          "Pull dumbbell to hip",
          "Lower with control",
          "Keep back parallel to ground"
        ],
        tips: [
          "Keep back straight",
          "Don't twist torso",
          "Full range of motion",
          "Control the weight"
        ],
        equipment: ["Dumbbell", "Bench"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Pull-Ups",
        sets: "4",
        reps: "6-12",
        notes: "Ultimate back width builder",
        targetMuscles: ["Lats", "Upper Back"],
        secondaryMuscles: ["Biceps", "Core"],
        videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
        instructions: [
          "Grip bar slightly wider than shoulders",
          "Hang with arms fully extended",
          "Pull chest to bar",
          "Lower with control",
          "Maintain shoulder blade engagement"
        ],
        tips: [
          "Keep core tight",
          "Don't swing body",
          "Full range of motion",
          "Focus on lat contraction"
        ],
        equipment: ["Pull-Up Bar"],
        difficulty: "Intermediate",
        category: "Pull"
      }
    ],
    shoulders: [
      {
        name: "Overhead Press",
        sets: "4",
        reps: "8-12",
        notes: "Primary shoulder strength builder",
        targetMuscles: ["Front Deltoids", "Middle Deltoids"],
        secondaryMuscles: ["Triceps", "Upper Chest", "Core"],
        videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
        instructions: [
          "Hold barbell at shoulder height",
          "Press bar overhead",
          "Lock out arms at top",
          "Lower with control",
          "Keep core tight throughout"
        ],
        tips: [
          "Don't lean back excessively",
          "Keep wrists straight",
          "Breathe out on press",
          "Full lockout at top"
        ],
        equipment: ["Barbell"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Dumbbell Lateral Raises",
        sets: "3",
        reps: "12-15",
        notes: "Isolates middle deltoids",
        targetMuscles: ["Middle Deltoids"],
        secondaryMuscles: ["Front Deltoids", "Traps"],
        videoUrl: "https://www.youtube.com/embed/3VcKaXpzqRo",
        instructions: [
          "Stand with dumbbells at sides",
          "Raise arms out to sides",
          "Lift until arms are parallel to ground",
          "Lower with control",
          "Maintain slight bend in elbows"
        ],
        tips: [
          "Don't swing weights",
          "Keep shoulders down",
          "Lead with elbows",
          "Control the descent"
        ],
        equipment: ["Dumbbells"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Front Raises",
        sets: "3",
        reps: "12-15",
        notes: "Targets front deltoids",
        targetMuscles: ["Front Deltoids"],
        secondaryMuscles: ["Upper Chest"],
        videoUrl: "https://www.youtube.com/embed/sxeY7kMYhLc",
        instructions: [
          "Hold weights in front of thighs",
          "Raise arms to shoulder height",
          "Keep slight bend in elbows",
          "Lower with control",
          "Alternate arms if preferred"
        ],
        tips: [
          "Don't swing body",
          "Keep core tight",
          "Control the movement",
          "Don't overextend"
        ],
        equipment: ["Dumbbells", "Barbell", "Plate"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Reverse Flyes",
        sets: "3",
        reps: "12-15",
        notes: "Targets rear deltoids",
        targetMuscles: ["Rear Deltoids"],
        secondaryMuscles: ["Upper Back", "Traps"],
        videoUrl: "https://www.youtube.com/embed/6yMdhi2DVao",
        instructions: [
          "Bend forward at hips",
          "Hold dumbbells below chest",
          "Raise arms out to sides",
          "Squeeze shoulder blades",
          "Lower with control"
        ],
        tips: [
          "Keep back straight",
          "Don't use heavy weights",
          "Focus on rear delts",
          "Control throughout"
        ],
        equipment: ["Dumbbells", "Bench"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Arnold Press",
        sets: "3",
        reps: "10-12",
        notes: "Compound movement for all three heads",
        targetMuscles: ["Front Deltoids", "Middle Deltoids", "Rear Deltoids"],
        secondaryMuscles: ["Triceps", "Upper Chest"],
        videoUrl: "https://www.youtube.com/embed/3ml7BH7mNwQ",
        instructions: [
          "Start with palms facing you",
          "Press and rotate dumbbells",
          "End with palms facing forward",
          "Lower and rotate back",
          "Keep core engaged"
        ],
        tips: [
          "Smooth rotation",
          "Don't lean back",
          "Control the weight",
          "Full range of motion"
        ],
        equipment: ["Dumbbells"],
        difficulty: "Intermediate",
        category: "Push"
      }
    ],
    legs: [
      {
        name: "Barbell Squats",
        sets: "4",
        reps: "8-12",
        notes: "Primary lower body compound movement",
        targetMuscles: ["Quadriceps", "Glutes"],
        secondaryMuscles: ["Hamstrings", "Core", "Lower Back"],
        videoUrl: "https://www.youtube.com/embed/SW_C1A-rejs",
        instructions: [
          "Position bar on upper back",
          "Feet shoulder-width apart",
          "Break at hips and knees",
          "Lower until thighs parallel",
          "Drive through heels to stand"
        ],
        tips: [
          "Keep chest up",
          "Knees in line with toes",
          "Maintain neutral spine",
          "Breathe properly"
        ],
        equipment: ["Barbell", "Squat Rack"],
        difficulty: "Intermediate",
        category: "Legs"
      },
      {
        name: "Bulgarian Split Squats",
        sets: "3",
        reps: "10-12",
        notes: "Great unilateral leg developer",
        targetMuscles: ["Quadriceps", "Glutes"],
        secondaryMuscles: ["Hamstrings", "Core"],
        videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
        instructions: [
          "Place rear foot on bench",
          "Stand on working leg",
          "Lower until rear knee near ground",
          "Push through front heel",
          "Maintain balance throughout"
        ],
        tips: [
          "Keep front knee stable",
          "Stay upright",
          "Control the movement",
          "Equal reps both sides"
        ],
        equipment: ["Dumbbells", "Bench"],
        difficulty: "Intermediate",
        category: "Legs"
      },
      {
        name: "Leg Press",
        sets: "4",
        reps: "10-15",
        notes: "Safe compound leg movement",
        targetMuscles: ["Quadriceps", "Glutes"],
        secondaryMuscles: ["Hamstrings", "Calves"],
        videoUrl: "https://www.youtube.com/embed/IZxyjW7MPJQ",
        instructions: [
          "Position feet shoulder-width",
          "Lower weight with control",
          "Press through full foot",
          "Don't lock knees at top",
          "Keep lower back against pad"
        ],
        tips: [
          "Control the descent",
          "Don't bounce at bottom",
          "Keep feet flat",
          "Maintain form throughout"
        ],
        equipment: ["Leg Press Machine"],
        difficulty: "Intermediate",
        category: "Legs"
      },
      {
        name: "Walking Lunges",
        sets: "3",
        reps: "12-15 each leg",
        notes: "Great for functional leg strength",
        targetMuscles: ["Quadriceps", "Glutes"],
        secondaryMuscles: ["Hamstrings", "Core"],
        videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
        instructions: [
          "Step forward into lunge",
          "Lower back knee toward ground",
          "Push off front foot",
          "Bring rear foot forward",
          "Alternate legs while walking"
        ],
        tips: [
          "Keep torso upright",
          "Control each step",
          "Knee in line with foot",
          "Maintain balance"
        ],
        equipment: ["Dumbbells", "Bodyweight"],
        difficulty: "Intermediate",
        category: "Legs"
      },
      {
        name: "Leg Extensions",
        sets: "3",
        reps: "12-15",
        notes: "Isolation exercise for quadriceps",
        targetMuscles: ["Quadriceps"],
        secondaryMuscles: [],
        videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0",
        instructions: [
          "Sit with back against pad",
          "Hook feet under roller",
          "Extend legs fully",
          "Hold at top briefly",
          "Lower with control"
        ],
        tips: [
          "Don't swing weight",
          "Keep back against pad",
          "Full range of motion",
          "Focus on quad contraction"
        ],
        equipment: ["Leg Extension Machine"],
        difficulty: "Intermediate",
        category: "Legs"
      }
    ],
    arms: [
      {
        name: "EZ Bar Curls",
        sets: "4",
        reps: "10-12",
        notes: "Primary bicep builder",
        targetMuscles: ["Biceps"],
        secondaryMuscles: ["Forearms"],
        videoUrl: "https://www.youtube.com/embed/6LrGSIYAn9c",
        instructions: [
          "Stand with feet shoulder-width",
          "Grip EZ bar at outer curves",
          "Curl bar to shoulder level",
          "Lower with control",
          "Keep elbows at sides"
        ],
        tips: [
          "Don't swing body",
          "Keep wrists straight",
          "Full range of motion",
          "Squeeze at top"
        ],
        equipment: ["EZ Curl Bar"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Tricep Pushdowns",
        sets: "4",
        reps: "12-15",
        notes: "Excellent tricep isolation",
        targetMuscles: ["Triceps"],
        secondaryMuscles: [],
        videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
        instructions: [
          "Face cable machine",
          "Grip bar at shoulder width",
          "Keep elbows at sides",
          "Push down until arms straight",
          "Control return to start"
        ],
        tips: [
          "Don't let elbows rise",
          "Keep core tight",
          "Focus on triceps",
          "Full extension"
        ],
        equipment: ["Cable Machine", "Straight Bar"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Hammer Curls",
        sets: "3",
        reps: "10-12",
        notes: "Targets brachialis and forearms",
        targetMuscles: ["Biceps", "Forearms"],
        secondaryMuscles: [],
        videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4",
        instructions: [
          "Hold dumbbells at sides",
          "Palms facing each other",
          "Curl weights to shoulders",
          "Lower with control",
          "Keep elbows steady"
        ],
        tips: [
          "Don't swing weights",
          "Keep wrists neutral",
          "Control the movement",
          "Equal work both arms"
        ],
        equipment: ["Dumbbells"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Skull Crushers",
        sets: "3",
        reps: "12-15",
        notes: "Great tricep mass builder",
        targetMuscles: ["Triceps"],
        secondaryMuscles: [],
        videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
        instructions: [
          "Lie on bench",
          "Hold weight above face",
          "Lower to forehead",
          "Extend arms fully",
          "Keep elbows pointed up"
        ],
        tips: [
          "Don't flare elbows",
          "Keep upper arms still",
          "Control the weight",
          "Focus on triceps"
        ],
        equipment: ["EZ Curl Bar", "Dumbbells"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Concentration Curls",
        sets: "3",
        reps: "12-15",
        notes: "Strict bicep isolation",
        targetMuscles: ["Biceps"],
        secondaryMuscles: [],
        videoUrl: "https://www.youtube.com/embed/0AUGkch3tzc",
        instructions: [
          "Sit on bench",
          "Rest elbow on inner thigh",
          "Curl weight to shoulder",
          "Lower with control",
          "Keep upper arm still"
        ],
        tips: [
          "No swinging",
          "Keep wrist straight",
          "Full range of motion",
          "Focus on peak contraction"
        ],
        equipment: ["Dumbbell"],
        difficulty: "Intermediate",
        category: "Pull"
      }
    ],
    core: [
      {
        name: "Cable Woodchoppers",
        sets: "3",
        reps: "12-15 each side",
        notes: "Great for rotational core strength",
        targetMuscles: ["Obliques", "Core"],
        secondaryMuscles: ["Shoulders", "Hips"],
        videoUrl: "https://www.youtube.com/embed/RAw6rRz_tHE",
        instructions: [
          "Stand sideways to cable machine",
          "Pull handle diagonally down",
          "Rotate through core",
          "Control return to start",
          "Keep arms straight"
        ],
        tips: [
          "Pivot feet",
          "Keep hips stable",
          "Control the motion",
          "Engage core throughout"
        ],
        equipment: ["Cable Machine"],
        difficulty: "Intermediate",
        category: "Core"
      },
      {
        name: "Hanging Leg Raises",
        sets: "3",
        reps: "12-15",
        notes: "Advanced lower ab movement",
        targetMuscles: ["Lower Abs", "Hip Flexors"],
        secondaryMuscles: ["Upper Abs", "Grip"],
        videoUrl: "https://www.youtube.com/embed/hdng3Nm1x_E",
        instructions: [
          "Hang from pull-up bar",
          "Keep legs straight",
          "Raise legs to horizontal",
          "Lower with control",
          "Minimize swinging"
        ],
        tips: [
          "Don't swing body",
          "Keep core tight",
          "Control the descent",
          "Full range of motion"
        ],
        equipment: ["Pull-Up Bar"],
        difficulty: "Intermediate",
        category: "Core"
      },
      {
        name: "Russian Twists",
        sets: "3",
        reps: "20-30 total touches",
        notes: "Targets obliques and rotational strength",
        targetMuscles: ["Obliques", "Core"],
        secondaryMuscles: ["Hip Flexors"],
        videoUrl: "https://www.youtube.com/embed/wkD8rjkodUI",
        instructions: [
          "Sit with knees bent",
          "Lean back slightly",
          "Hold weight at chest",
          "Rotate side to side",
          "Touch weight to ground"
        ],
        tips: [
          "Keep feet down",
          "Control the motion",
          "Don't round back",
          "Full rotation"
        ],
        equipment: ["Weight Plate", "Dumbbell", "Medicine Ball"],
        difficulty: "Intermediate",
        category: "Core"
      },
      {
        name: "Plank",
        sets: "3",
        reps: "30-60 seconds",
        notes: "Fundamental core stability exercise",
        targetMuscles: ["Core", "Lower Back"],
        secondaryMuscles: ["Shoulders", "Glutes"],
        videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
        instructions: [
          "Forearms on ground",
          "Body straight line",
          "Engage core",
          "Hold position",
          "Keep breathing steady"
        ],
        tips: [
          "Don't sag hips",
          "Keep neck neutral",
          "Squeeze glutes",
          "Breathe normally"
        ],
        equipment: ["Bodyweight"],
        difficulty: "Intermediate",
        category: "Core"
      },
      {
        name: "Cable Crunches",
        sets: "3",
        reps: "15-20",
        notes: "Great weighted ab exercise",
        targetMuscles: ["Upper Abs", "Lower Abs"],
        secondaryMuscles: ["Obliques"],
        videoUrl: "https://www.youtube.com/embed/AV5PvZeJFzs",
        instructions: [
          "Kneel facing cable machine",
          "Hold rope behind head",
          "Crunch down toward floor",
          "Squeeze abs at bottom",
          "Control return to start"
        ],
        tips: [
          "Keep hips still",
          "Round upper back",
          "Focus on abs",
          "Full range of motion"
        ],
        equipment: ["Cable Machine", "Rope Attachment"],
        difficulty: "Intermediate",
        category: "Core"
      }
    ]
  }
}; 