import { Exercise } from '../types/exercise';
import { getAllExercises, getExercisesByCategory, getExercisesByMuscleGroup } from './ExerciseService';
import { TrainerWorkoutPlan } from './FirestoreService';

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
  isTrainerPlan?: boolean;
}

export interface ExerciseDetails extends Exercise {
  // Additional fields specific to exercise details can be added here
}

export const getAllExercisesFromDB = async (): Promise<Exercise[]> => {
  return await getAllExercises();
};

export const getExerciseDetails = async (exerciseName: string): Promise<ExerciseDetails> => {
  const allExercises = await getAllExercises();
  const exercise = allExercises.find(e => e.name === exerciseName);
  
  if (!exercise) {
    throw new Error(`Exercise ${exerciseName} not found`);
  }

  return exercise as ExerciseDetails;
};

export const generateWeeklySchedule = async (
  level: string,
  goal: string,
  equipment: string,
  splitType: 'bro-split' | 'push-pull-legs' | 'upper-lower'
): Promise<DayWorkout[]> => {
  try {
    console.log('Starting generateWeeklySchedule with params:', { level, goal, equipment, splitType });
    
    // Get exercises for each muscle group and ensure proper formatting
    const formatExercise = (e: Exercise): Exercise => ({
      ...e,
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

    // Fetch exercises from database
    const [chestExercises, backExercises, shoulderExercises, legExercises, armExercises, coreExercises] = 
      await Promise.all([
        getExercisesByMuscleGroup('chest'),
        getExercisesByMuscleGroup('back'),
        getExercisesByMuscleGroup('shoulders'),
        getExercisesByMuscleGroup('legs'),
        getExercisesByMuscleGroup('arms'),
        getExercisesByMuscleGroup('core')
      ]);

    console.log('Fetched exercises:', {
      chest: chestExercises.length,
      back: backExercises.length,
      shoulders: shoulderExercises.length,
      legs: legExercises.length,
      arms: armExercises.length,
      core: coreExercises.length
    });

    const exercises = {
      chest: chestExercises.map(formatExercise),
      back: backExercises.map(formatExercise),
      shoulders: shoulderExercises.map(formatExercise),
      legs: legExercises.map(formatExercise),
      arms: armExercises.map(formatExercise),
      core: coreExercises.map(formatExercise)
    };

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

    // Ensure we have at least some exercises for each category
    if (categorizedExercises.push.length === 0) {
      console.warn('No push exercises found, adding default push-ups');
      categorizedExercises.push = [{
        id: 'default-pushups',
        name: 'Push-ups',
        category: 'push',
        difficulty: 'Beginner',
        equipment: ['None'],
        muscleGroup: 'chest',
        targetMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        sets: '3',
        reps: '10-15',
        instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
        tips: ['Keep body straight', 'Control the movement'],
        muscles_worked: ['chest', 'triceps', 'shoulders'],
        common_mistakes: ['Sagging hips', 'Half reps'],
        variations: ['Knee Push-ups', 'Incline Push-ups'],
        videoUrl: ''
      }];
    }

    let result: DayWorkout[];

    switch (splitType) {
      case 'push-pull-legs':
        result = [
          {
            day: 'Monday',
            focus: 'Push Day',
            exercises: categorizedExercises.push.slice(0, 4)
          },
          {
            day: 'Tuesday',
            focus: 'Pull Day',
            exercises: categorizedExercises.pull.slice(0, 4)
          },
          {
            day: 'Wednesday',
            focus: 'Legs Day',
            exercises: categorizedExercises.legs.slice(0, 4)
          },
          {
            day: 'Thursday',
            focus: 'Push Day',
            exercises: categorizedExercises.push.slice(0, 4)
          },
          {
            day: 'Friday',
            focus: 'Pull Day',
            exercises: categorizedExercises.pull.slice(0, 4)
          },
          {
            day: 'Saturday',
            focus: 'Legs Day',
            exercises: categorizedExercises.legs.slice(0, 4)
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
            exercises: exercises.chest.slice(0, 4)
          },
          {
            day: 'Tuesday',
            focus: 'Back Day',
            exercises: exercises.back.slice(0, 4)
          },
          {
            day: 'Wednesday',
            focus: 'Legs Day',
            exercises: exercises.legs.slice(0, 4)
          },
          {
            day: 'Thursday',
            focus: 'Shoulders Day',
            exercises: exercises.shoulders.slice(0, 4)
          },
          {
            day: 'Friday',
            focus: 'Arms Day',
            exercises: exercises.arms.slice(0, 4)
          },
          {
            day: 'Saturday',
            focus: 'Core Day',
            exercises: exercises.core.slice(0, 4)
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
        const upperExercises = [
          ...exercises.chest,
          ...exercises.back,
          ...exercises.shoulders,
          ...exercises.arms
        ];
        result = [
          {
            day: 'Monday',
            focus: 'Upper Body',
            exercises: upperExercises.slice(0, 6)
          },
          {
            day: 'Tuesday',
            focus: 'Lower Body',
            exercises: exercises.legs.slice(0, 6)
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
            exercises: upperExercises.slice(0, 6)
          },
          {
            day: 'Friday',
            focus: 'Lower Body',
            exercises: exercises.legs.slice(0, 6)
          },
          {
            day: 'Saturday',
            focus: 'Core & Cardio',
            exercises: exercises.core.slice(0, 4)
          },
          {
            day: 'Sunday',
            focus: 'Rest Day',
            exercises: [],
            notes: 'Complete rest'
          }
        ];
        break;

      default:
        throw new Error(`Invalid split type: ${splitType}`);
    }

    console.log('Generated workout schedule:', result);
    return result;

  } catch (error) {
    console.error('Error generating weekly schedule:', error);
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
    const days = await generateWeeklySchedule('Intermediate', 'Build Muscle', 'Full Gym', 'push-pull-legs');
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

/**
 * Converts trainer workout plans from Firestore to the format expected by the Workouts component
 */
export const convertTrainerWorkoutToAppFormat = async (trainerPlan: TrainerWorkoutPlan): Promise<WorkoutPlan> => {
  const allExercises = await getAllExercises();
  
  // Process each day's exercises to match the expected Exercise type
  const days = trainerPlan.days.map(day => {
    // Map each exercise to the full Exercise object
    const processedExercises = day.exercises.map(exerciseItem => {
      // Try to find the full exercise details from our exercise database
      const exerciseDetails = allExercises.find(e => 
        e.id === exerciseItem.exerciseId || e.name === exerciseItem.exerciseName
      );
      
      if (exerciseDetails) {
        // If found, use the details but override with trainer-specified values
        return {
          ...exerciseDetails,
          sets: exerciseItem.sets.toString(),
          reps: exerciseItem.reps,
          notes: exerciseItem.weight || ''
        };
      } else {
        // If not found, create a minimal exercise object with available data
        return {
          id: exerciseItem.exerciseId || `exercise-${Math.random().toString(36).substring(2, 9)}`,
          name: exerciseItem.exerciseName,
          sets: exerciseItem.sets.toString(),
          reps: exerciseItem.reps,
          notes: exerciseItem.weight || '',
          targetMuscles: [],
          secondaryMuscles: [],
          instructions: [],
          tips: [],
          equipment: [],
          difficulty: 'Intermediate' as any,
          category: 'back' as any,
          muscles_worked: [],
          common_mistakes: [],
          variations: [],
          videoUrl: ''
        } as Exercise;
      }
    });

    return {
      day: day.day,
      focus: day.day + (day.notes ? `: ${day.notes}` : ''),
      exercises: processedExercises,
      notes: day.notes
    } as DayWorkout;
  });

  // Convert to WorkoutPlan format
  return {
    id: trainerPlan.id,
    title: `${trainerPlan.name}'s Trainer Plan`,
    description: trainerPlan.description || 'Custom workout plan created by your trainer',
    imageUrl: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80',
    level: trainerPlan.level,
    duration: trainerPlan.duration.toString() + ' weeks',
    goal: 'Custom',
    equipment: 'Custom',
    schedule: { days },
    isTrainerPlan: true,
    splitType: 'bro-split'
  };
}; 