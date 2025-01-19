import { supabase } from '../config/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals?: string[];
  medical_conditions?: string[];
  dietary_preferences?: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  date: string;
  duration: number;
  type: string;
  exercises: Exercise[];
  notes?: string;
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: {
    weight: number;
    reps: number;
  }[];
}

export interface Attendance {
  id: string;
  user_id: string;
  check_in: string;
  check_out?: string;
  duration?: number;
  created_at: string;
}

// User Profile Functions
export const createUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: userId,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Workout Functions
export const addWorkoutSession = async (userId: string, workout: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert([
      {
        user_id: userId,
        ...workout,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserWorkouts = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// Attendance Functions
export const checkIn = async (userId: string) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([
      {
        user_id: userId,
        check_in: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const checkOut = async (attendanceId: string) => {
  // First get the check-in time
  const { data: attendance } = await supabase
    .from('attendance')
    .select('check_in')
    .eq('id', attendanceId)
    .single();

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  const checkOutTime = new Date().toISOString();
  const { data, error } = await supabase
    .from('attendance')
    .update({
      check_out: checkOutTime,
      duration: calculateDuration(attendance.check_in, checkOutTime),
    })
    .eq('id', attendanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAttendanceHistory = async (userId: string, limit = 30) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// Helper Functions
const calculateDuration = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
}; 