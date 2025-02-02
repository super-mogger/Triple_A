export type Difficulty = 1 | 2 | 3 | 4 | 5 | 'Beginner' | 'Intermediate' | 'Advanced';

export type Category = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'push' | 'pull' | 'Pull';

export type Equipment = string;

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string[];
  muscles_worked: string[];
  tips: string[];
  common_mistakes: string[];
  variations: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  sets?: string;
  reps?: string;
  notes?: string;
  videoUrl?: string;
  muscleGroup?: string;
}

export interface ExerciseDetails extends Exercise {
  description: string;
  duration: string;
  calories: number;
  restTime: number;
} 