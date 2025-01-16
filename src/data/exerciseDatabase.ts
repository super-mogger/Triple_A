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
        name: "Dumbbell Flyes",
        sets: "3",
        reps: "12-15",
        notes: "Keep slight bend in elbows",
        targetMuscles: ["Chest", "Front Deltoids"],
        secondaryMuscles: ["Core", "Biceps"],
        videoUrl: "https://www.youtube.com/embed/eozdVDA78K0",
        instructions: [
          "Lie on bench with dumbbells extended above chest",
          "Lower weights out to sides with slight elbow bend",
          "Maintain arc motion throughout movement",
          "Feel stretch in chest at bottom",
          "Squeeze chest to bring weights back up"
        ],
        tips: [
          "Don't lock elbows at top",
          "Keep core engaged throughout",
          "Focus on chest contraction",
          "Control the eccentric (lowering) phase"
        ],
        equipment: ["Dumbbells", "Bench"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Incline Bench Press",
        sets: "4",
        reps: "8-12",
        notes: "Focus on upper chest development",
        targetMuscles: ["Upper Chest", "Front Deltoids"],
        secondaryMuscles: ["Triceps", "Core"],
        videoUrl: "https://www.youtube.com/embed/SrqOu55lrYU",
        instructions: [
          "Set bench angle between 30-45 degrees",
          "Grip barbell slightly wider than shoulder width",
          "Lower bar to upper chest with control",
          "Press bar up and slightly back",
          "Keep elbows at 45-degree angle"
        ],
        tips: [
          "Keep back flat against bench",
          "Drive through feet for stability",
          "Focus on upper chest contraction",
          "Don't bounce bar off chest"
        ],
        equipment: ["Barbell", "Incline Bench"],
        difficulty: "Intermediate",
        category: "Push"
      }
    ],
    back: [
      {
        name: "Meadows Row",
        sets: "3",
        reps: "10-12",
        notes: "Excellent for lat development",
        targetMuscles: ["Latissimus Dorsi", "Upper Back"],
        secondaryMuscles: ["Biceps", "Rear Deltoids", "Core"],
        videoUrl: "https://www.youtube.com/embed/0I0VyJ8Puuo",
        instructions: [
          "Position barbell in landmine or corner",
          "Stand parallel to bar with feet shoulder-width",
          "Hinge at hips and grip bar with outside hand",
          "Pull bar to hip while keeping elbow high",
          "Lower with control and repeat"
        ],
        tips: [
          "Keep chest up throughout movement",
          "Focus on squeezing lat at top",
          "Allow slight rotation in torso",
          "Maintain stable hip position"
        ],
        equipment: ["Barbell", "Landmine attachment (optional)"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Pendlay Row",
        sets: "4",
        reps: "6-8",
        notes: "Explosive movement for back strength",
        targetMuscles: ["Upper Back", "Lats"],
        secondaryMuscles: ["Biceps", "Core", "Lower Back"],
        videoUrl: "https://www.youtube.com/embed/ZlRrIsoDpKg",
        instructions: [
          "Start with barbell on ground",
          "Bend at hips until torso is parallel to floor",
          "Grip bar wider than shoulder width",
          "Explosively pull bar to lower chest",
          "Lower bar completely to ground between reps"
        ],
        tips: [
          "Keep back straight throughout",
          "Reset position between each rep",
          "Pull with elbows, not biceps",
          "Use leg drive minimally"
        ],
        equipment: ["Barbell"],
        difficulty: "Intermediate",
        category: "Pull"
      }
    ],
    shoulders: [
      {
        name: "Viking Press",
        sets: "4",
        reps: "8-12",
        notes: "Great compound movement",
        targetMuscles: ["Front Deltoids", "Upper Chest"],
        secondaryMuscles: ["Triceps", "Core", "Upper Traps"],
        videoUrl: "https://www.youtube.com/embed/hxjKZcOT17E",
        instructions: [
          "Set up landmine attachment with handles",
          "Stand facing away from pivot point",
          "Grip handles at shoulder height",
          "Press weight overhead while leaning slightly forward",
          "Lower with control to starting position"
        ],
        tips: [
          "Keep core tight throughout movement",
          "Allow natural arc motion of the press",
          "Breathe out on exertion",
          "Maintain stable lower body"
        ],
        equipment: ["Landmine", "Viking Press Attachment"],
        difficulty: "Intermediate",
        category: "Push"
      },
      {
        name: "Face Pulls",
        sets: "3",
        reps: "12-15",
        notes: "Great for rear deltoid development",
        targetMuscles: ["Rear Deltoids", "Upper Back"],
        secondaryMuscles: ["External Rotators", "Traps"],
        videoUrl: "https://www.youtube.com/embed/V8dZ3pyiCBo",
        instructions: [
          "Set cable at head height",
          "Attach rope attachment",
          "Pull rope towards face, separating hands",
          "Focus on external rotation at end",
          "Control return to start position"
        ],
        tips: [
          "Keep elbows high throughout",
          "Pull to nose/forehead level",
          "Focus on rear delt contraction",
          "Don't use momentum"
        ],
        equipment: ["Cable Machine", "Rope Attachment"],
        difficulty: "Intermediate",
        category: "Pull"
      }
    ],
    legs: [
      {
        name: "Hack Squat",
        sets: "4",
        reps: "8-12",
        notes: "Focus on quad development",
        targetMuscles: ["Quadriceps", "Glutes"],
        secondaryMuscles: ["Hamstrings", "Calves"],
        videoUrl: "https://www.youtube.com/embed/0tn7F-oAJ1c",
        instructions: [
          "Position shoulders and back on pads",
          "Place feet shoulder-width apart",
          "Unlock safety bars and control descent",
          "Lower until thighs are parallel",
          "Push through heels to rise"
        ],
        tips: [
          "Keep back flat against pad",
          "Don't let knees cave inward",
          "Control the eccentric phase",
          "Adjust foot position for emphasis"
        ],
        equipment: ["Hack Squat Machine"],
        difficulty: "Intermediate",
        category: "Legs"
      },
      {
        name: "Romanian Deadlift",
        sets: "4",
        reps: "8-12",
        notes: "Excellent for hamstring development",
        targetMuscles: ["Hamstrings", "Lower Back"],
        secondaryMuscles: ["Glutes", "Upper Back"],
        videoUrl: "https://www.youtube.com/embed/JCXUYuzwNrM",
        instructions: [
          "Start with bar at hip level",
          "Push hips back while lowering bar",
          "Keep slight bend in knees",
          "Lower until stretch in hamstrings",
          "Drive hips forward to return"
        ],
        tips: [
          "Keep bar close to legs",
          "Maintain neutral spine",
          "Feel stretch in hamstrings",
          "Don't round lower back"
        ],
        equipment: ["Barbell"],
        difficulty: "Intermediate",
        category: "Pull"
      }
    ],
    arms: [
      { 
        name: "Barbell Curls",
        sets: "4",
        reps: "8-12",
        notes: "Focus on bicep contraction",
        targetMuscles: ["Biceps"],
        secondaryMuscles: ["Forearms", "Front Deltoids"],
        videoUrl: "https://www.youtube.com/embed/kwG2ipFRgfo",
        instructions: [
          "Stand with feet shoulder-width apart",
          "Grip bar at shoulder width, palms up",
          "Keep elbows close to sides",
          "Curl bar up to shoulder level",
          "Lower with control to starting position"
        ],
        tips: [
          "Keep upper arms stationary",
          "Don't swing or use momentum",
          "Squeeze biceps at the top",
          "Control the negative portion"
        ],
        equipment: ["Barbell"],
        difficulty: "Intermediate",
        category: "Pull"
      },
      {
        name: "Skull Crushers",
        sets: "3",
        reps: "10-12",
        notes: "Great tricep isolation",
        targetMuscles: ["Triceps"],
        secondaryMuscles: ["Front Deltoids"],
        videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
        instructions: [
          "Lie on bench with EZ bar held above chest",
          "Keep upper arms vertical and stationary",
          "Lower bar to forehead by bending elbows",
          "Extend arms to return to start",
          "Maintain control throughout"
        ],
        tips: [
          "Keep elbows pointed forward",
          "Don't flare elbows out",
          "Use controlled movement",
          "Focus on tricep contraction"
        ],
        equipment: ["EZ Curl Bar", "Bench"],
        difficulty: "Intermediate",
        category: "Push"
      }
    ],
    core: [
      {
        name: "Dragon Flag",
        sets: "3",
        reps: "8-12",
        notes: "Advanced core movement",
        targetMuscles: ["Core", "Lower Abs"],
        secondaryMuscles: ["Upper Back", "Hip Flexors"],
        videoUrl: "https://www.youtube.com/embed/pvz7k5uQtKs",
        instructions: [
          "Lie on bench and grip behind head",
          "Raise legs and lower back off bench",
          "Keep body straight",
          "Lower legs slowly while maintaining position",
          "Return to starting position"
        ],
        tips: [
          "Start with negative reps",
          "Keep lower back straight",
          "Build up to full movement",
          "Focus on control"
        ],
        equipment: ["Bench"],
        difficulty: "Advanced",
        category: "Core"
      },
      {
        name: "Cable Woodchoppers",
        sets: "3",
        reps: "12-15 each side",
        notes: "Great for rotational core strength",
        targetMuscles: ["Obliques", "Core"],
        secondaryMuscles: ["Shoulders", "Hip Flexors"],
        videoUrl: "https://www.youtube.com/embed/0k5XcLWZECE",
        instructions: [
          "Set cable at high position",
          "Stand sideways to cable",
          "Pull cable down and across body",
          "Rotate through core",
          "Control return to start"
        ],
        tips: [
          "Keep arms straight throughout",
          "Pivot feet as needed",
          "Maintain core tension",
          "Control the movement"
        ],
        equipment: ["Cable Machine"],
        difficulty: "Intermediate",
        category: "Core"
      }
    ]
  }
}; 