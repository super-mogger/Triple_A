import { Timestamp } from 'firebase/firestore';

export interface Profile {
  id: string;
  user_id: string;
  personal_info: {
    gender: 'male' | 'female';
    date_of_birth: string;
    height: number;
    weight: number;
    contact: string;
    blood_type?: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    dietary: string[];
    workout_days: string[];
    fitness_goals: string[];
    fitness_level: string;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  };
  created_at: Timestamp;
  updated_at: Timestamp;
} 