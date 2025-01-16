import { Exercise } from '../types/exercise';

export interface DayWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WeeklySchedule {
  days: DayWorkout[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  goal: string;
  level: string;
  equipment: string;
  splitType?: 'bro-split' | 'push-pull-legs' | 'upper-lower';
  showSplitMenu?: boolean;
  schedule?: WeeklySchedule;
}

export interface ExerciseDetails extends Exercise {
  // Additional fields specific to exercise details can be added here
}

export const scrapeWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
  // Return some sample workout plans
  return [
    {
      id: 'strength-1',
      title: 'Strength Builder',
      description: 'A comprehensive program focused on building strength and muscle mass',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      duration: '12 weeks',
      goal: 'Strength',
      level: 'Intermediate',
      equipment: 'Full Gym',
      splitType: 'push-pull-legs'
    },
    {
      id: 'hypertrophy-1',
      title: 'Muscle Builder',
      description: 'Focused on muscle growth through high-volume training',
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
      duration: '8 weeks',
      goal: 'Muscle Growth',
      level: 'Intermediate',
      equipment: 'Full Gym',
      splitType: 'bro-split'
    },
    {
      id: 'beginner-1',
      title: 'Beginner Basics',
      description: 'Perfect for those just starting their fitness journey',
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
      duration: '4 weeks',
      goal: 'General Fitness',
      level: 'Beginner',
      equipment: 'Basic Equipment',
      splitType: 'upper-lower'
    }
  ];
};

export const scrapeWorkoutDetails = async (id: string): Promise<{ schedule: WeeklySchedule }> => {
  // Return a sample weekly schedule based on the workout ID
  const schedule: WeeklySchedule = {
    days: [
      { 
        day: 'Monday', 
        focus: 'Push Day', 
        exercises: [
          {
            name: 'Bench Press',
            sets: '4',
            reps: '8-12',
            notes: 'Focus on form and control',
            targetMuscles: ['Chest', 'Shoulders'],
            secondaryMuscles: ['Triceps'],
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
            equipment: ['Barbell', 'Bench'],
            difficulty: 'Intermediate',
            category: 'Push'
          }
        ]
      },
      { 
        day: 'Tuesday', 
        focus: 'Pull Day', 
        exercises: []
      },
      { 
        day: 'Wednesday', 
        focus: 'Legs Day', 
        exercises: []
      },
      { 
        day: 'Thursday', 
        focus: 'Rest Day',
        exercises: [],
        notes: 'Active recovery or light cardio'
      },
      { 
        day: 'Friday', 
        focus: 'Push Day',
        exercises: []
      },
      { 
        day: 'Saturday', 
        focus: 'Pull Day',
        exercises: []
      },
      {
        day: 'Sunday',
        focus: 'Rest Day',
        exercises: [],
        notes: 'Complete rest'
      }
    ]
  };
  return { schedule };
};

export const generatePersonalizedWorkoutPlan = (profileData: any): WorkoutPlan => {
  return {
    id: 'personalized',
    title: 'Your Custom Plan',
    description: 'A workout plan tailored to your goals and preferences',
    imageUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c',
    duration: '8 weeks',
    goal: 'Custom',
    level: 'Intermediate',
    equipment: 'Full Gym',
    splitType: 'push-pull-legs'
  };
};

export const getExerciseDetails = async (exerciseName: string): Promise<ExerciseDetails> => {
  // Return sample exercise details
  return {
    name: exerciseName,
    sets: '4',
    reps: '8-12',
    notes: 'Focus on form and control',
    targetMuscles: ['Chest', 'Shoulders'],
    secondaryMuscles: ['Triceps'],
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
    instructions: [
      'Set up with proper form',
      'Execute the movement with control',
      'Focus on muscle contraction',
      'Return to starting position'
    ],
    tips: [
      'Maintain proper form',
      'Control the weight',
      'Focus on the target muscles'
    ],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    category: 'Push'
  };
};

export const generateWeeklySchedule = (
  level: string,
  goal: string,
  equipment: string,
  splitType: 'bro-split' | 'push-pull-legs' | 'upper-lower'
): DayWorkout[] => {
  // Return a basic weekly schedule
  return [
    {
      day: 'Monday',
      focus: 'Push Day',
      exercises: []
    },
    {
      day: 'Tuesday',
      focus: 'Pull Day',
      exercises: []
    },
    {
      day: 'Wednesday',
      focus: 'Legs Day',
      exercises: []
    },
    {
      day: 'Thursday',
      focus: 'Rest Day',
      exercises: [],
      notes: 'Active recovery or light cardio'
    },
    {
      day: 'Friday',
      focus: 'Push Day',
      exercises: []
    },
    {
      day: 'Saturday',
      focus: 'Pull Day',
      exercises: []
    },
    {
      day: 'Sunday',
      focus: 'Rest Day',
      exercises: [],
      notes: 'Complete rest'
    }
  ];
}; 