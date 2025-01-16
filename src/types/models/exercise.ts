export interface Exercise {
  id?: string;
  name: string;
  sets: string;
  reps: string;
  notes: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  videoUrl: string;
  instructions: string[];
  tips: string[];
  equipment: string[];
  difficulty: string;
  category: string;
  muscleGroup?: string;
} 