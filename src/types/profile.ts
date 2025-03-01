import { Timestamp } from 'firebase/firestore';

export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced' | 'moderate' | 'light' | 'sedentary' | 'active' | 'veryActive';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  avatar_url?: string;
  photoURL?: string;
  full_name?: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  personal_info: {
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    contact: string;
    blood_type: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    activity_level: ActivityLevel;
    dietary_preferences: string[];
    workout_preferences: string[];
    fitness_goals: string[];
    fitness_level?: string;
    dietary?: string[];
    workout_time?: string;
    workout_days?: string[];
  };
  stats?: {
    workouts_completed: number;
    total_time: number;
    calories_burned: number;
    attendance_streak: number;
  };
  // Admin sync fields
  aadhaarCardFrontURL?: string;
  aadhaarCardBackURL?: string;
  isVerified?: boolean;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FirestoreProfile extends Profile {
  stats: {
    workouts_completed: number;
    total_time: number;
    calories_burned: number;
    attendance_streak: number;
  };
}

export interface Membership {
  amount: number;
  created_at: Timestamp;
  duration: number;
  end_date: Timestamp;
  is_active: boolean;
  payment_method: string;
  payment_status: string;
  plan_id: string;
  plan_name: string;
  start_date: Timestamp;
  updated_at: Timestamp;
  userId: string;
}

export interface FirestoreMembership extends Membership {
  amount_paid: number;
} 