import axios from 'axios';
import * as cheerio from 'cheerio';
import { workoutPlans } from '../data/workoutPlans';

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  videoUrl?: string;
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  tips?: string[];
  equipment?: string[];
}

export interface ExerciseDetails {
  name: string;
  videoUrl: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips: string[];
  equipment: string[];
  difficulty: string;
  category: string;
}

export interface DailyWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WeeklySchedule {
  days: DailyWorkout[];
}

export interface WorkoutPlan {
  title: string;
  url: string;
  level: string;
  duration: string;
  goal: string;
  equipment: string;
  description: string;
  imageUrl?: string;
  schedule?: WeeklySchedule;
  splitType?: SplitType;
  showSplitMenu?: boolean;
}

// Exercise database
const exerciseDatabase = {
  intermediate: {
    chest: [
      { name: "Barbell Bench Press", sets: "4", reps: "8-12", notes: "Control the weight throughout" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", notes: "Focus on upper chest" },
      { name: "Decline Bench Press", sets: "3", reps: "10-12", notes: "Focus on lower chest" },
      { name: "Dumbbell Flyes", sets: "3", reps: "12-15", notes: "Feel the stretch" },
      { name: "Machine Chest Press", sets: "3", reps: "12-15", notes: "Focus on contraction" },
      { name: "Push-Ups", sets: "3", reps: "12-15", notes: "Keep body straight" },
      { name: "Cable Flyes", sets: "3", reps: "15-20", notes: "Constant tension" },
      { name: "Dips", sets: "3", reps: "10-15", notes: "Lean forward for chest focus" }
    ],
    back: [
      { name: "Barbell Rows", sets: "4", reps: "8-12", notes: "Keep back straight" },
      { name: "Lat Pulldowns", sets: "3", reps: "10-12", notes: "Wide grip" },
      { name: "Deadlifts", sets: "4", reps: "8-10", notes: "Maintain neutral spine" },
      { name: "Seated Cable Rows", sets: "3", reps: "12-15", notes: "Squeeze shoulder blades" },
      { name: "Face Pulls", sets: "3", reps: "15-20", notes: "Pull to forehead" },
      { name: "Single-Arm Dumbbell Rows", sets: "3", reps: "12-15", notes: "Full range of motion" },
      { name: "Pull-Ups", sets: "3", reps: "8-12", notes: "Use assistance if needed" },
      { name: "T-Bar Rows", sets: "3", reps: "10-12", notes: "Keep elbows close" }
    ],
    legs: [
      { name: "Barbell Squats", sets: "4", reps: "8-12", notes: "Keep chest up" },
      { name: "Romanian Deadlifts", sets: "3", reps: "10-12", notes: "Feel hamstring stretch" },
      { name: "Leg Press", sets: "3", reps: "12-15", notes: "Feet shoulder width" },
      { name: "Walking Lunges", sets: "3", reps: "12 each leg", notes: "Keep torso upright" },
      { name: "Leg Extensions", sets: "3", reps: "15-20", notes: "Focus on quad squeeze" },
      { name: "Leg Curls", sets: "3", reps: "15-20", notes: "Control the movement" },
      { name: "Calf Raises", sets: "4", reps: "15-20", notes: "Full range of motion" },
      { name: "Bulgarian Split Squats", sets: "3", reps: "12 each leg", notes: "Keep front knee stable" }
    ],
    shoulders: [
      { name: "Military Press", sets: "4", reps: "8-12", notes: "Keep core tight" },
      { name: "Lateral Raises", sets: "3", reps: "12-15", notes: "Control the movement" },
      { name: "Front Raises", sets: "3", reps: "12-15", notes: "Alternate arms" },
      { name: "Reverse Flyes", sets: "3", reps: "15-20", notes: "Focus on rear delts" },
      { name: "Arnold Press", sets: "3", reps: "10-12", notes: "Rotate through press" },
      { name: "Upright Rows", sets: "3", reps: "12-15", notes: "Pull to chin level" },
      { name: "Face Pulls", sets: "3", reps: "15-20", notes: "External rotation" },
      { name: "Shrugs", sets: "3", reps: "12-15", notes: "Hold at top" }
    ],
    arms: [
      { name: "Barbell Curls", sets: "4", reps: "8-12", notes: "Keep elbows still" },
      { name: "Skull Crushers", sets: "3", reps: "10-12", notes: "Keep elbows in" },
      { name: "Hammer Curls", sets: "3", reps: "12-15", notes: "Alternate arms" },
      { name: "Tricep Pushdowns", sets: "3", reps: "12-15", notes: "Keep elbows at sides" },
      { name: "Incline Curls", sets: "3", reps: "12-15", notes: "Full range of motion" },
      { name: "Diamond Push-Ups", sets: "3", reps: "12-15", notes: "Elbows close to body" },
      { name: "Preacher Curls", sets: "3", reps: "12-15", notes: "Full extension" },
      { name: "Overhead Tricep Extension", sets: "3", reps: "12-15", notes: "Keep elbows close" }
    ],
    core: [
      { name: "Planks", sets: "3", reps: "45-60 sec", notes: "Keep body straight" },
      { name: "Russian Twists", sets: "3", reps: "20 each side", notes: "Control rotation" },
      { name: "Hanging Leg Raises", sets: "3", reps: "12-15", notes: "No swinging" },
      { name: "Cable Crunches", sets: "3", reps: "15-20", notes: "Round your back" },
      { name: "Side Planks", sets: "3", reps: "30 sec each", notes: "Keep hips high" },
      { name: "Ab Wheel Rollouts", sets: "3", reps: "10-12", notes: "Extend fully" },
      { name: "Dragon Flags", sets: "3", reps: "8-12", notes: "Control descent" },
      { name: "Woodchoppers", sets: "3", reps: "12-15 each side", notes: "Rotate from hips" }
    ]
  }
};

const splitTypes = {
  'bro-split': {
    name: "Bro Split",
    schedule: [
      { 
        day: 'Monday', 
        focus: 'Chest Day', 
        exercises: exerciseDatabase.intermediate.chest
      },
      { 
        day: 'Tuesday', 
        focus: 'Back Day', 
        exercises: exerciseDatabase.intermediate.back
      },
      { 
        day: 'Wednesday', 
        focus: 'Shoulders Day', 
        exercises: exerciseDatabase.intermediate.shoulders
      },
      { 
        day: 'Thursday', 
        focus: 'Arms Day', 
        exercises: exerciseDatabase.intermediate.arms
      },
      { 
        day: 'Friday', 
        focus: 'Legs Day', 
        exercises: exerciseDatabase.intermediate.legs
      },
      { 
        day: 'Saturday', 
        focus: 'Core & Cardio', 
        exercises: exerciseDatabase.intermediate.core
      },
      { day: 'Sunday', focus: 'Rest & Recovery', exercises: [] }
    ]
  },
  'push-pull-legs': {
    name: "Push/Pull/Legs",
    schedule: [
      { 
        day: 'Monday', 
        focus: 'Push Day', 
        exercises: [
          ...exerciseDatabase.intermediate.chest.slice(0, 4),
          ...exerciseDatabase.intermediate.shoulders.slice(0, 2),
          ...exerciseDatabase.intermediate.arms.slice(1, 3)
        ]
      },
      { 
        day: 'Tuesday', 
        focus: 'Pull Day', 
        exercises: [
          ...exerciseDatabase.intermediate.back.slice(0, 5),
          ...exerciseDatabase.intermediate.arms.slice(0, 3)
        ]
      },
      { 
        day: 'Wednesday', 
        focus: 'Legs Day', 
        exercises: exerciseDatabase.intermediate.legs
      },
      { 
        day: 'Thursday', 
        focus: 'Push Day', 
        exercises: [
          ...exerciseDatabase.intermediate.chest.slice(4, 8),
          ...exerciseDatabase.intermediate.shoulders.slice(2, 4),
          ...exerciseDatabase.intermediate.arms.slice(3, 5)
        ]
      },
      { 
        day: 'Friday', 
        focus: 'Pull Day', 
        exercises: [
          ...exerciseDatabase.intermediate.back.slice(3, 8),
          ...exerciseDatabase.intermediate.arms.slice(4, 7)
        ]
      },
      { 
        day: 'Saturday', 
        focus: 'Legs Day', 
        exercises: [
          ...exerciseDatabase.intermediate.legs.slice(0, 6),
          ...exerciseDatabase.intermediate.core.slice(0, 2)
        ]
      },
      { day: 'Sunday', focus: 'Rest & Recovery', exercises: [] }
    ]
  },
  'upper-lower': {
    name: "Upper/Lower",
    schedule: [
      { 
        day: 'Monday', 
        focus: 'Upper Body', 
        exercises: [
          ...exerciseDatabase.intermediate.chest.slice(0, 3),
          ...exerciseDatabase.intermediate.back.slice(0, 2),
          ...exerciseDatabase.intermediate.shoulders.slice(0, 2),
          ...exerciseDatabase.intermediate.arms.slice(0, 1)
        ]
      },
      { 
        day: 'Tuesday', 
        focus: 'Lower Body', 
        exercises: exerciseDatabase.intermediate.legs
      },
      { 
        day: 'Wednesday', 
        focus: 'Upper Body', 
        exercises: [
          ...exerciseDatabase.intermediate.chest.slice(3, 5),
          ...exerciseDatabase.intermediate.back.slice(2, 4),
          ...exerciseDatabase.intermediate.shoulders.slice(2, 4),
          ...exerciseDatabase.intermediate.arms.slice(2, 4)
        ]
      },
      { 
        day: 'Thursday', 
        focus: 'Lower Body', 
        exercises: [
          ...exerciseDatabase.intermediate.legs.slice(0, 6),
          ...exerciseDatabase.intermediate.core.slice(0, 2)
        ]
      },
      { 
        day: 'Friday', 
        focus: 'Upper Body', 
        exercises: [
          ...exerciseDatabase.intermediate.chest.slice(5, 7),
          ...exerciseDatabase.intermediate.back.slice(4, 6),
          ...exerciseDatabase.intermediate.shoulders.slice(4, 6),
          ...exerciseDatabase.intermediate.arms.slice(4, 6)
        ]
      },
      { 
        day: 'Saturday', 
        focus: 'Lower Body', 
        exercises: [
          ...exerciseDatabase.intermediate.legs.slice(2, 8),
          ...exerciseDatabase.intermediate.core.slice(2, 4)
        ]
      },
      { day: 'Sunday', focus: 'Rest & Recovery', exercises: [] }
    ]
  }
};

type SplitType = 'bro-split' | 'push-pull-legs' | 'upper-lower';

export function generateWeeklySchedule(level: string, goal: string, equipment: string, splitType: SplitType = 'bro-split'): DailyWorkout[] {
  // Return the selected split type's schedule, defaulting to bro split if not found
  return splitTypes[splitType]?.schedule || splitTypes['bro-split'].schedule;
}

export function generatePersonalizedWorkoutPlan(profileData: any): WorkoutPlan {
  const { preferences } = profileData;
  const level = preferences?.fitnessLevel || 'beginner';
  const goal = preferences?.goal || 'build muscle';
  const equipment = 'full gym';
  const splitType: SplitType = 'bro-split';

  const schedule = {
    days: generateWeeklySchedule(level, goal, equipment, splitType)
  };

  return {
    title: `${level.charAt(0).toUpperCase() + level.slice(1)} ${goal.charAt(0).toUpperCase() + goal.slice(1)} Program`,
    url: "#",
    level,
    duration: "12 Weeks",
    goal,
    equipment,
    description: `Personalized workout program based on your ${level} fitness level, focused on ${goal}.`,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    schedule,
    splitType
  };
}

// Mock workout data
const mockWorkouts: WorkoutPlan[] = [
  {
    title: "Full Body Muscle Building Workout",
    url: "#",
    level: "Intermediate",
    duration: "8 Weeks",
    goal: "Build Muscle",
    equipment: "Full Gym",
    description: "A comprehensive full-body workout designed to build muscle mass and strength through compound exercises.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    schedule: {
      days: generateWeeklySchedule("intermediate", "build muscle", "full gym")
    }
  },
  {
    title: "Beginner's Fat Loss Program",
    url: "#",
    level: "Beginner",
    duration: "4 Weeks",
    goal: "Lose Fat",
    equipment: "Dumbbells",
    description: "Perfect for beginners looking to lose fat while maintaining muscle mass through a combination of strength training and cardio.",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "Advanced Strength Training",
    url: "#",
    level: "Advanced",
    duration: "12 Weeks",
    goal: "Build Strength",
    equipment: "Full Gym",
    description: "An intensive program focused on building maximum strength through progressive overload and compound movements.",
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "Home Bodyweight Workout",
    url: "#",
    level: "Beginner",
    duration: "4 Weeks",
    goal: "Build Muscle",
    equipment: "Bodyweight",
    description: "A no-equipment workout program that can be done at home using just your body weight.",
    imageUrl: "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "HIIT Fat Burner",
    url: "#",
    level: "Intermediate",
    duration: "6 Weeks",
    goal: "Lose Fat",
    equipment: "Minimal Equipment",
    description: "High-intensity interval training program designed for maximum fat burn and cardiovascular fitness.",
    imageUrl: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "Power Building Program",
    url: "#",
    level: "Advanced",
    duration: "12 Weeks",
    goal: "Build Strength",
    equipment: "Full Gym",
    description: "Combines powerlifting and bodybuilding principles for both strength and muscle gains.",
    imageUrl: "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  }
];

const mockWorkoutDetails = {
  exercises: [
    {
      name: "Barbell Bench Press",
      sets: "4",
      reps: "8-12",
      notes: "Focus on form and controlled movement"
    },
    {
      name: "Squats",
      sets: "4",
      reps: "8-12",
      notes: "Keep core tight throughout the movement"
    },
    {
      name: "Deadlifts",
      sets: "3",
      reps: "8-10",
      notes: "Maintain neutral spine position"
    },
    {
      name: "Pull-ups",
      sets: "3",
      reps: "8-12",
      notes: "Use assisted machine if needed"
    },
    {
      name: "Shoulder Press",
      sets: "3",
      reps: "10-12",
      notes: "Control the negative portion"
    }
  ],
  instructions: [
    "Warm up properly before starting the workout",
    "Rest 60-90 seconds between sets",
    "Focus on proper form rather than weight",
    "Stay hydrated throughout the workout",
    "Complete all sets of one exercise before moving to the next",
    "Cool down with light stretching after workout"
  ]
};

export const scrapeWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
  // Return the predefined workout plans with split types
  return workoutPlans.map(plan => ({
    ...plan,
    splitType: 'bro-split', // Default split type
    showSplitMenu: false, // Initialize menu as closed
    schedule: {
      days: generateWeeklySchedule(plan.level, plan.goal, plan.equipment, 'bro-split')
    }
  }));
};

export const scrapeWorkoutDetails = async (url: string): Promise<Partial<WorkoutPlan>> => {
  // Instead of scraping, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a schedule based on the workout's URL or use default
      const schedule: WeeklySchedule = {
        days: generateWeeklySchedule('intermediate', 'build muscle', 'full gym')
      };
      resolve({ schedule });
    }, 500);
  });
};

// Function to get exercise details
export async function getExerciseDetails(exerciseName: string): Promise<ExerciseDetails> {
  // In a real app, this would fetch from an API
  // For now, return mock data
  return {
    name: exerciseName,
    videoUrl: getExerciseVideo(exerciseName),
    targetMuscles: getTargetMuscles(exerciseName),
    secondaryMuscles: getSecondaryMuscles(exerciseName),
    instructions: getExerciseInstructions(exerciseName),
    tips: getExerciseTips(exerciseName),
    equipment: getExerciseEquipment(exerciseName),
    difficulty: getExerciseDifficulty(exerciseName),
    category: getExerciseCategory(exerciseName)
  };
}

function getExerciseVideo(name: string): string {
  const videos: { [key: string]: string } = {
    "Push-Ups": "https://www.youtube.com/embed/IODxDxX7oi4",
    "Bench Press": "https://www.youtube.com/embed/vcBig73ojpE",
    "Squats": "https://www.youtube.com/embed/ultWZbUMPL8",
    "Pull-Ups": "https://www.youtube.com/embed/eGo4IYlbE5g",
    "Deadlifts": "https://www.youtube.com/embed/op9kVnSso6Q",
    "Barbell Bench Press": "https://www.youtube.com/embed/vcBig73ojpE",
    "Incline Dumbbell Press": "https://www.youtube.com/embed/8iPEnn-ltC8",
    "Cable Flyes": "https://www.youtube.com/embed/Iwe6AmxVf7o",
    "Barbell Rows": "https://www.youtube.com/embed/9efgcAjQe7E",
    "Face Pulls": "https://www.youtube.com/embed/rep-qVOkqgk",
    "Barbell Squats": "https://www.youtube.com/embed/ultWZbUMPL8",
    "Romanian Deadlifts": "https://www.youtube.com/embed/JCXUYuzwNrM",
    "Bulgarian Split Squats": "https://www.youtube.com/embed/2C-uNgKwPLE",
    "Military Press": "https://www.youtube.com/embed/2yjwXTZQDDI",
    "Lateral Raises": "https://www.youtube.com/embed/3VcKaXpzqRo",
    "EZ Bar Curls": "https://www.youtube.com/embed/zG2xJ0Q5QtI",
    "Skull Crushers": "https://www.youtube.com/embed/d_KZxkY_0cM",
    "Hammer Curls": "https://www.youtube.com/embed/zC3nLlEvin4",
    "Tricep Pushdowns": "https://www.youtube.com/embed/vB5OHsJ3EME",
    "Dumbbell Curls": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    "Plank": "https://www.youtube.com/embed/ASdvN_XEl_c",
    "Russian Twists": "https://www.youtube.com/embed/wkD8rjkodUI",
    "Hanging Leg Raises": "https://www.youtube.com/embed/Pr1ieGZ5atk"
  };
  return videos[name] || "https://www.youtube.com/embed/IODxDxX7oi4"; // Default to push-ups video
}

function getTargetMuscles(name: string): string[] {
  const muscles: { [key: string]: string[] } = {
    "Push-Ups": ["Chest", "Anterior Deltoids", "Triceps"],
    "Bench Press": ["Chest", "Anterior Deltoids", "Triceps"],
    "Barbell Bench Press": ["Chest", "Anterior Deltoids", "Triceps"],
    "Incline Dumbbell Press": ["Upper Chest", "Anterior Deltoids", "Triceps"],
    "Cable Flyes": ["Chest", "Anterior Deltoids"],
    "Squats": ["Quadriceps", "Glutes", "Hamstrings"],
    "Barbell Squats": ["Quadriceps", "Glutes", "Hamstrings"],
    "Romanian Deadlifts": ["Hamstrings", "Glutes", "Lower Back"],
    "Bulgarian Split Squats": ["Quadriceps", "Glutes", "Hamstrings"],
    "Pull-Ups": ["Latissimus Dorsi", "Biceps", "Rear Deltoids"],
    "Barbell Rows": ["Latissimus Dorsi", "Rhomboids", "Biceps"],
    "Face Pulls": ["Rear Deltoids", "Upper Traps", "External Rotators"],
    "Deadlifts": ["Lower Back", "Hamstrings", "Glutes"],
    "Military Press": ["Anterior Deltoids", "Triceps", "Upper Chest"],
    "Lateral Raises": ["Lateral Deltoids"],
    "EZ Bar Curls": ["Biceps"],
    "Skull Crushers": ["Triceps"],
    "Hammer Curls": ["Biceps", "Brachialis"],
    "Tricep Pushdowns": ["Triceps"],
    "Dumbbell Curls": ["Biceps"],
    "Plank": ["Core", "Abdominals"],
    "Russian Twists": ["Obliques", "Core"],
    "Hanging Leg Raises": ["Lower Abs", "Hip Flexors"]
  };
  return muscles[name] || ["Not specified"];
}

function getSecondaryMuscles(name: string): string[] {
  const muscles: { [key: string]: string[] } = {
    "Push-Ups": ["Core", "Serratus Anterior"],
    "Bench Press": ["Core", "Serratus Anterior"],
    "Barbell Bench Press": ["Core", "Serratus Anterior"],
    "Incline Dumbbell Press": ["Core", "Serratus Anterior"],
    "Cable Flyes": ["Core", "Biceps"],
    "Squats": ["Core", "Lower Back", "Calves"],
    "Barbell Squats": ["Core", "Lower Back", "Calves"],
    "Romanian Deadlifts": ["Core", "Upper Back"],
    "Bulgarian Split Squats": ["Core", "Calves"],
    "Pull-Ups": ["Core", "Forearms", "Trapezius"],
    "Barbell Rows": ["Core", "Rear Deltoids", "Forearms"],
    "Face Pulls": ["Biceps", "Middle Traps"],
    "Deadlifts": ["Upper Back", "Forearms", "Core"],
    "Military Press": ["Core", "Serratus Anterior", "Traps"],
    "Lateral Raises": ["Traps", "Anterior Deltoids"],
    "EZ Bar Curls": ["Anterior Deltoids", "Forearms"],
    "Skull Crushers": ["Anterior Deltoids", "Core"],
    "Hammer Curls": ["Forearms", "Anterior Deltoids"],
    "Tricep Pushdowns": ["Anterior Deltoids", "Core"],
    "Dumbbell Curls": ["Anterior Deltoids", "Forearms"],
    "Plank": ["Lower Back", "Shoulders"],
    "Russian Twists": ["Lower Back", "Hip Flexors"],
    "Hanging Leg Raises": ["Core", "Grip Strength"]
  };
  return muscles[name] || ["Not specified"];
}

function getExerciseInstructions(name: string): string[] {
  const instructions: { [key: string]: string[] } = {
    "Push-Ups": [
      "Start in a plank position with hands slightly wider than shoulders",
      "Lower your body until chest nearly touches the ground",
      "Keep your core tight and body in a straight line",
      "Push back up to the starting position",
      "Repeat for desired reps"
    ],
    "Bench Press": [
      "Lie on a flat bench with feet flat on the ground",
      "Grip the bar slightly wider than shoulder width",
      "Unrack the bar and lower it to your chest",
      "Press the bar back up to the starting position",
      "Keep your wrists straight and elbows at about 45 degrees"
    ],
    "Barbell Bench Press": [
      "Lie on a flat bench with feet flat on the ground",
      "Grip the bar slightly wider than shoulder width",
      "Unrack the bar and lower it to your chest",
      "Press the bar back up to the starting position",
      "Keep your wrists straight and elbows at about 45 degrees"
    ],
    "Squats": [
      "Stand with feet shoulder-width apart",
      "Lower your body by bending your knees and hips",
      "Keep your chest up and core tight",
      "Lower until thighs are parallel to ground",
      "Push through your heels to return to starting position"
    ]
  };
  return instructions[name] || [
    "Set up properly with good form",
    "Perform the movement with control",
    "Focus on muscle contraction",
    "Maintain proper breathing throughout",
    "Complete all reps with good form"
  ];
}

function getExerciseTips(name: string): string[] {
  const tips: { [key: string]: string[] } = {
    "Push-Ups": [
      "Keep your core engaged throughout the movement",
      "Don't let your hips sag",
      "Look at a spot on the floor about a foot in front of your hands",
      "Breathe steadily throughout the exercise"
    ],
    "Bench Press": [
      "Keep your shoulder blades retracted",
      "Drive your feet into the ground",
      "Keep your butt on the bench",
      "Control the weight throughout the movement"
    ],
    "Squats": [
      "Keep your weight in your heels",
      "Don't let your knees cave inward",
      "Maintain a neutral spine",
      "Breathe in on the way down, out on the way up"
    ]
  };
  return tips[name] || [
    "Focus on proper form over weight/reps",
    "Maintain controlled breathing throughout",
    "Keep core engaged for stability",
    "If form breaks down, stop the set"
  ];
}

function getExerciseEquipment(name: string): string[] {
  const equipment: { [key: string]: string[] } = {
    "Push-Ups": ["None - Bodyweight only"],
    "Bench Press": ["Barbell", "Bench", "Weight Plates", "Safety Racks"],
    "Barbell Bench Press": ["Barbell", "Bench", "Weight Plates", "Safety Racks"],
    "Incline Dumbbell Press": ["Adjustable Bench", "Dumbbells"],
    "Cable Flyes": ["Cable Machine", "D-Handles"],
    "Squats": ["Barbell", "Squat Rack", "Weight Plates"],
    "Barbell Squats": ["Barbell", "Squat Rack", "Weight Plates"],
    "Romanian Deadlifts": ["Barbell", "Weight Plates"],
    "Bulgarian Split Squats": ["Bench", "Dumbbells (optional)"],
    "Pull-Ups": ["Pull-up Bar"],
    "Deadlifts": ["Barbell", "Weight Plates"],
    "Military Press": ["Barbell", "Weight Plates"],
    "Lateral Raises": ["Dumbbells"],
    "EZ Bar Curls": ["EZ Curl Bar", "Weight Plates"],
    "Skull Crushers": ["EZ Curl Bar", "Bench", "Weight Plates"],
    "Hammer Curls": ["Dumbbells"],
    "Tricep Pushdowns": ["Cable Machine", "Rope Attachment"],
    "Dumbbell Curls": ["Dumbbells"],
    "Plank": ["None - Bodyweight only"],
    "Russian Twists": ["Weight Plate or Dumbbell (optional)"],
    "Hanging Leg Raises": ["Pull-up Bar"]
  };
  return equipment[name] || ["Equipment not specified"];
}

function getExerciseDifficulty(name: string): string {
  const difficulty: { [key: string]: string } = {
    "Push-Ups": "Beginner",
    "Bench Press": "Intermediate",
    "Barbell Bench Press": "Intermediate",
    "Incline Dumbbell Press": "Intermediate",
    "Cable Flyes": "Intermediate",
    "Squats": "Intermediate",
    "Barbell Squats": "Intermediate",
    "Romanian Deadlifts": "Intermediate",
    "Bulgarian Split Squats": "Advanced",
    "Pull-Ups": "Advanced",
    "Deadlifts": "Advanced",
    "Military Press": "Intermediate",
    "Lateral Raises": "Beginner",
    "EZ Bar Curls": "Beginner",
    "Skull Crushers": "Intermediate",
    "Hammer Curls": "Beginner",
    "Tricep Pushdowns": "Beginner",
    "Dumbbell Curls": "Beginner",
    "Plank": "Beginner",
    "Russian Twists": "Beginner",
    "Hanging Leg Raises": "Intermediate"
  };
  return difficulty[name] || "Intermediate";
}

function getExerciseCategory(name: string): string {
  const category: { [key: string]: string } = {
    "Push-Ups": "Push",
    "Bench Press": "Push",
    "Barbell Bench Press": "Push",
    "Incline Dumbbell Press": "Push",
    "Cable Flyes": "Push",
    "Squats": "Legs",
    "Barbell Squats": "Legs",
    "Romanian Deadlifts": "Legs",
    "Bulgarian Split Squats": "Legs",
    "Pull-Ups": "Pull",
    "Barbell Rows": "Pull",
    "Face Pulls": "Pull",
    "Deadlifts": "Pull",
    "Military Press": "Push",
    "Lateral Raises": "Push",
    "EZ Bar Curls": "Pull",
    "Skull Crushers": "Push",
    "Hammer Curls": "Pull",
    "Tricep Pushdowns": "Push",
    "Dumbbell Curls": "Pull",
    "Plank": "Core",
    "Russian Twists": "Core",
    "Hanging Leg Raises": "Core"
  };
  return category[name] || "Other";
} 