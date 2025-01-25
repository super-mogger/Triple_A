import { Timestamp } from 'firebase/firestore';

export interface FirestoreProfile {
  id: string;
  email: string;
  username: string;
  photoURL: string;
  personal_info: {
    height: number;
    weight: number;
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    blood_type: string;
    contact: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    activity_level: 'beginner' | 'intermediate' | 'advanced';
    dietary_preferences: string[];
    workout_preferences: string[];
    fitness_goals: string[];
  };
  stats: {
    bmi: string;
    activity_level: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FirestoreMembership {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  start_date: Timestamp;
  end_date: Timestamp;
  is_active: boolean;
  amount_paid: number;
  payment_status: 'pending' | 'completed' | 'failed';
  features?: string[];
  description?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FirestorePayment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  plan_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
} 