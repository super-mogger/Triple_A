import { Timestamp } from 'firebase/firestore';

export interface FirestoreProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  personal_info?: {
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    height?: number;
    weight?: number;
  };
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'general_fitness' | 'strength';
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  medical_conditions?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    dietary?: string[];
    workout_time?: 'morning' | 'afternoon' | 'evening';
    workout_days?: string[];
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