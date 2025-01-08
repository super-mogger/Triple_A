export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface WorkoutDay {
  name: string;
  focus: string;
  exercises: Exercise[];
}

export const pplWorkoutPlan = {
  name: "Push Pull Legs (PPL) - 6 Day Split",
  description: "A comprehensive 6-day split focusing on pushing, pulling, and leg movements with one rest day.",
  days: [
    {
      name: "Day 1 - Push A",
      focus: "Chest, Shoulders, Triceps",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "6-8" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8-10" },
        { name: "Overhead Shoulder Press", sets: 4, reps: "8-10", notes: "Barbell or Dumbbell" },
        { name: "Lateral Raises", sets: 3, reps: "12-15" },
        { name: "Triceps Dips", sets: 3, reps: "Until Failure" },
        { name: "Overhead Triceps Extension", sets: 3, reps: "10-12" }
      ]
    },
    {
      name: "Day 2 - Pull A",
      focus: "Back, Biceps",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "5" },
        { name: "Pull-Ups", sets: 3, reps: "Until Failure", notes: "Weighted if possible" },
        { name: "Bent-Over Barbell Rows", sets: 4, reps: "8-10" },
        { name: "Seated Cable Rows", sets: 3, reps: "8-12" },
        { name: "Barbell Bicep Curls", sets: 3, reps: "10-12" },
        { name: "Hammer Curls", sets: 3, reps: "10-12" }
      ]
    },
    {
      name: "Day 3 - Legs A",
      focus: "Quads, Hamstrings, Glutes, Calves",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "6-8" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
        { name: "Walking Lunges", sets: 3, reps: "12 steps each leg", notes: "With Dumbbells" },
        { name: "Leg Press", sets: 3, reps: "10-12" },
        { name: "Calf Raises", sets: 4, reps: "15-20" },
        { name: "Glute Bridge or Hip Thrust", sets: 3, reps: "8-10" }
      ]
    },
    {
      name: "Day 4 - Push B",
      focus: "Chest, Shoulders, Triceps (Variation)",
      exercises: [
        { name: "Incline Barbell Bench Press", sets: 4, reps: "8-10" },
        { name: "Dumbbell Floor Press", sets: 3, reps: "10-12" },
        { name: "Arnold Press", sets: 4, reps: "10-12" },
        { name: "Front Raises", sets: 3, reps: "12-15" },
        { name: "Close-Grip Bench Press", sets: 3, reps: "8-10" },
        { name: "Triceps Rope Pushdowns", sets: 3, reps: "12-15" }
      ]
    },
    {
      name: "Day 5 - Pull B",
      focus: "Back, Biceps (Variation)",
      exercises: [
        { name: "Pendlay Rows", sets: 4, reps: "6-8" },
        { name: "Meadows Rows", sets: 3, reps: "10-12" },
        { name: "Lat Pulldowns", sets: 4, reps: "10-12" },
        { name: "Face Pulls", sets: 3, reps: "15-20", notes: "For rear delts" },
        { name: "Incline Dumbbell Curls", sets: 3, reps: "12-15" },
        { name: "Preacher Curls", sets: 3, reps: "10-12" }
      ]
    },
    {
      name: "Day 6 - Legs B",
      focus: "Legs (Variation)",
      exercises: [
        { name: "Front Squat", sets: 4, reps: "6-8" },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10-12 each leg" },
        { name: "Hack Squat", sets: 3, reps: "8-10" },
        { name: "Leg Extensions", sets: 3, reps: "12-15" },
        { name: "Seated Leg Curls", sets: 3, reps: "12-15" },
        { name: "Standing Calf Raises", sets: 4, reps: "15-20" }
      ]
    }
  ],
  tips: [
    {
      category: "Rest Between Sets",
      items: [
        "Heavy compounds: 2-3 minutes",
        "Isolation exercises: 60-90 seconds"
      ]
    },
    {
      category: "Nutrition",
      items: [
        "Caloric Surplus: 10-15% above maintenance",
        "Protein: 1.6–2.2g per kg of body weight",
        "High carb intake for energy and recovery"
      ]
    },
    {
      category: "Progressive Overload",
      items: [
        "Aim to increase weight or reps weekly",
        "Track your progress for each exercise",
        "Alternate between A and B workouts for variety"
      ]
    },
    {
      category: "Recovery",
      items: [
        "Get 7-9 hours of sleep",
        "Stay hydrated (3-4 liters daily)",
        "Take one full rest day per week"
      ]
    }
  ]
}; 