import { Exercise } from '../types/exercise';
import { exerciseDatabase } from '../data/exerciseDatabase';

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
  level: string;
  duration: string;
  goal: string;
  equipment: string;
  schedule?: WeeklySchedule;
  showSplitMenu?: boolean;
  splitType?: 'bro-split' | 'push-pull-legs' | 'upper-lower';
}

export interface ExerciseDetails extends Exercise {
  // Additional fields specific to exercise details can be added here
}

export const getAllExercises = async (): Promise<Exercise[]> => {
  // Get all exercises from the local database
  const allExercises: Exercise[] = [];
  const muscleGroups = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'];
  
  for (const muscleGroup of muscleGroups) {
    const exercises = exerciseDatabase.intermediate[muscleGroup as keyof typeof exerciseDatabase.intermediate];
    allExercises.push(...exercises.map(exercise => ({
      ...exercise,
      muscleGroup
    })));
  }
  
  return allExercises;
};

export const getExerciseDetails = async (exerciseName: string): Promise<ExerciseDetails> => {
  const allExercises = await getAllExercises();
  const exercise = allExercises.find(e => e.name === exerciseName);
  
  if (!exercise) {
    throw new Error(`Exercise ${exerciseName} not found`);
  }

  return exercise as ExerciseDetails;
};

export const generateWeeklySchedule = (
  level: string,
  goal: string,
  equipment: string,
  splitType: 'bro-split' | 'push-pull-legs' | 'upper-lower'
): DayWorkout[] => {
  try {
    console.log('Starting generateWeeklySchedule with params:', { level, goal, equipment, splitType });
    
    // Get exercises for each muscle group and ensure proper formatting
    const formatExercise = (e: Exercise, muscleGroup: string): Exercise => ({
      ...e,
      muscleGroup,
      sets: e.sets || '3',
      reps: e.reps || '8-12',
      notes: e.notes || '',
      targetMuscles: e.targetMuscles || [],
      secondaryMuscles: e.secondaryMuscles || [],
      videoUrl: e.videoUrl || '',
      instructions: e.instructions || [],
      tips: e.tips || [],
      equipment: e.equipment || [],
      difficulty: e.difficulty || level,
      category: e.category || ''
    });

    const exercises = {
      chest: exerciseDatabase.intermediate.chest.map(e => formatExercise(e, 'chest')),
      back: exerciseDatabase.intermediate.back.map(e => formatExercise(e, 'back')),
      shoulders: exerciseDatabase.intermediate.shoulders.map(e => formatExercise(e, 'shoulders')),
      legs: exerciseDatabase.intermediate.legs.map(e => formatExercise(e, 'legs')),
      arms: exerciseDatabase.intermediate.arms.map(e => formatExercise(e, 'arms')),
      core: exerciseDatabase.intermediate.core.map(e => formatExercise(e, 'core'))
    };

    console.log('Formatted exercises:', Object.entries(exercises).map(([group, exs]) => ({
      group,
      count: exs.length,
      sample: exs[0] ? {
        name: exs[0].name,
        muscleGroup: exs[0].muscleGroup,
        sets: exs[0].sets,
        reps: exs[0].reps
      } : null
    })));

    // Organize exercises by category
    const categorizedExercises = {
      push: [
        ...exercises.chest,
        ...exercises.shoulders,
        ...exercises.arms.filter(e => e.targetMuscles.includes('Triceps'))
      ],
      pull: [
        ...exercises.back,
        ...exercises.arms.filter(e => e.targetMuscles.includes('Biceps'))
      ],
      legs: exercises.legs
    };

    // Filter exercises based on equipment if specified
    if (equipment !== 'Full Gym') {
      const filterByEquipment = (exercise: Exercise) => {
        return exercise.equipment.some(eq => 
          equipment === 'Minimal Equipment' 
            ? ['Dumbbells', 'Bodyweight', 'Resistance Bands'].includes(eq)
            : eq === 'Bodyweight'
        );
      };

      categorizedExercises.push = categorizedExercises.push.filter(filterByEquipment);
      categorizedExercises.pull = categorizedExercises.pull.filter(filterByEquipment);
      categorizedExercises.legs = categorizedExercises.legs.filter(filterByEquipment);
    }

    // Adjust sets and reps based on goal
    const adjustExercise = (exercise: Exercise): Exercise => {
      let sets = '3';
      let reps = '8-12';

      switch (goal.toLowerCase()) {
        case 'strength':
          sets = '5';
          reps = '3-5';
          break;
        case 'build muscle':
          sets = '4';
          reps = '8-12';
          break;
        case 'endurance':
          sets = '3';
          reps = '12-15';
          break;
        case 'lose fat':
          sets = '3';
          reps = '12-20';
          break;
      }

      return {
        ...exercise,
        sets,
        reps
      };
    };

    // Apply sets and reps adjustments
    categorizedExercises.push = categorizedExercises.push.map(adjustExercise);
    categorizedExercises.pull = categorizedExercises.pull.map(adjustExercise);
    categorizedExercises.legs = categorizedExercises.legs.map(adjustExercise);

    console.log('Exercise counts after categorization:', {
      push: categorizedExercises.push.length,
      pull: categorizedExercises.pull.length,
      legs: categorizedExercises.legs.length
    });

    let result: DayWorkout[];

    switch (splitType) {
      case 'push-pull-legs':
        result = [
          {
            day: 'Monday',
            focus: 'Push Day',
            exercises: categorizedExercises.push
          },
          {
            day: 'Tuesday',
            focus: 'Pull Day',
            exercises: categorizedExercises.pull
          },
          {
            day: 'Wednesday',
            focus: 'Legs Day',
            exercises: categorizedExercises.legs
          },
          {
            day: 'Thursday',
            focus: 'Push Day',
            exercises: categorizedExercises.push
          },
          {
            day: 'Friday',
            focus: 'Pull Day',
            exercises: categorizedExercises.pull
          },
          {
            day: 'Saturday',
            focus: 'Legs Day',
            exercises: categorizedExercises.legs
          },
          {
            day: 'Sunday',
            focus: 'Rest Day',
            exercises: [],
            notes: 'Complete rest'
          }
        ];
        break;
      case 'bro-split':
        result = [
          {
            day: 'Monday',
            focus: 'Chest Day',
            exercises: exercises.chest
          },
          {
            day: 'Tuesday',
            focus: 'Back Day',
            exercises: exercises.back
          },
          {
            day: 'Wednesday',
            focus: 'Legs Day',
            exercises: exercises.legs
          },
          {
            day: 'Thursday',
            focus: 'Shoulders Day',
            exercises: exercises.shoulders
          },
          {
            day: 'Friday',
            focus: 'Arms Day',
            exercises: exercises.arms
          },
          {
            day: 'Saturday',
            focus: 'Core Day',
            exercises: exercises.core
          },
          {
            day: 'Sunday',
            focus: 'Rest Day',
            exercises: [],
            notes: 'Complete rest'
          }
        ];
        break;
      case 'upper-lower':
        result = [
          {
            day: 'Monday',
            focus: 'Upper Body',
            exercises: [...categorizedExercises.push, ...categorizedExercises.pull]
          },
          {
            day: 'Tuesday',
            focus: 'Lower Body',
            exercises: categorizedExercises.legs
          },
          {
            day: 'Wednesday',
            focus: 'Rest Day',
            exercises: [],
            notes: 'Active recovery or light cardio'
          },
          {
            day: 'Thursday',
            focus: 'Upper Body',
            exercises: [...categorizedExercises.push, ...categorizedExercises.pull]
          },
          {
            day: 'Friday',
            focus: 'Lower Body',
            exercises: categorizedExercises.legs
          },
          {
            day: 'Saturday',
            focus: 'Core Day',
            exercises: exercises.core
          },
          {
            day: 'Sunday',
            focus: 'Rest Day',
            exercises: [],
            notes: 'Complete rest'
          }
        ];
        break;
    }

    // Apply sets and reps to all exercises in the schedule
    result = result.map(day => ({
      ...day,
      exercises: day.exercises.map(adjustExercise)
    }));

    console.log('Generated workout schedule:', result.map(day => ({
      day: day.day,
      focus: day.focus,
      exerciseCount: day.exercises.length,
      sampleExercise: day.exercises[0] ? {
        name: day.exercises[0].name,
        muscleGroup: day.exercises[0].muscleGroup,
        sets: day.exercises[0].sets,
        reps: day.exercises[0].reps
      } : null
    })));

    return result;
  } catch (error) {
    console.error('Error in generateWeeklySchedule:', error);
    throw error;
  }
};

export const scrapeWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
  // Return some sample workout plans
  const plans = [
    {
      id: 'strength-1',
      title: 'Strength Builder',
      description: 'A comprehensive program focused on building strength and muscle mass',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      level: 'Intermediate',
      duration: '12 weeks',
      goal: 'Strength',
      equipment: 'Full Gym',
      splitType: 'push-pull-legs' as const
    },
    {
      id: 'hypertrophy-1',
      title: 'Muscle Builder',
      description: 'Focused on muscle growth through high-volume training',
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
      level: 'Intermediate',
      duration: '8 weeks',
      goal: 'Build Muscle',
      equipment: 'Full Gym',
      splitType: 'bro-split' as const
    },
    {
      id: 'beginner-1',
      title: 'Beginner Basics',
      description: 'Perfect for those just starting their fitness journey',
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
      level: 'Beginner',
      duration: '4 weeks',
      goal: 'Build Muscle',
      equipment: 'Minimal Equipment',
      splitType: 'upper-lower' as const
    }
  ];

  console.log('Generated workout plans:', plans.map(p => ({
    id: p.id,
    title: p.title,
    goal: p.goal,
    level: p.level,
    equipment: p.equipment,
    splitType: p.splitType
  })));

  return plans;
};

export const scrapeWorkoutDetails = async (id: string): Promise<{ schedule: WeeklySchedule }> => {
  try {
    console.log('Generating workout details for ID:', id);
    const days = generateWeeklySchedule('Intermediate', 'Build Muscle', 'Full Gym', 'push-pull-legs');
    console.log('Generated schedule:', days);
    return { schedule: { days } };
  } catch (error) {
    console.error('Error in scrapeWorkoutDetails:', error);
    throw error;
  }
};

export const generatePersonalizedWorkoutPlan = (profileData: any): WorkoutPlan => {
  return {
    id: 'personalized',
    title: 'Your Custom Plan',
    description: 'A workout plan tailored to your goals and preferences',
    imageUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c',
    level: 'Intermediate',
    duration: '8 weeks',
    goal: 'Custom',
    equipment: 'Full Gym',
    splitType: 'push-pull-legs'
  };
}; 