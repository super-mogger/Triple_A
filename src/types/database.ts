export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  membershipType?: string;
  joinDate: Date;
  lastUpdated: Date;
}

export interface WorkoutLog {
  id?: string;
  userId: string;
  date: Date;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
  duration: number;
  notes?: string;
}

export interface DietLog {
  id?: string;
  userId: string;
  date: Date;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }[];
  }[];
  totalCalories: number;
  notes?: string;
} 