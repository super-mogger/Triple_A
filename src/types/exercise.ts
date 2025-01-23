export interface Exercise {
  name: string;
  videoUrl: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: string;
  category: string;
  instructions: string[];
  tips: string[];
  notes: string;
  sets: number;
  reps: string;
  muscleGroup: string;
}

export interface ExerciseDetails extends Exercise {
  id: string;
  description: string;
  duration: string;
  calories: number;
  restTime: number;
} 