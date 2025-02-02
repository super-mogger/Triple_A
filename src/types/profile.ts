import { Timestamp } from 'firebase/firestore';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  avatar_url?: string;
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
    activity_level: 'beginner' | 'intermediate' | 'advanced';
    dietary_preferences: string[];
    workout_preferences: string[];
    fitness_goals: string[];
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
  id: string;
  plan_id: string;
  plan_name: string;
  start_date: Timestamp;
  end_date: Timestamp;
  status: 'active' | 'expired' | 'cancelled';
}

export interface FirestoreMembership extends Membership {
  user_id: string;
  amount_paid: number;
} 