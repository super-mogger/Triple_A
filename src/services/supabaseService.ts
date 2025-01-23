import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://istringwlwisownzv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdHJpbmd3bHdpc293bnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0NzE3NzAsImV4cCI6MjAyMzA0Nzc3MH0.GYUEoFHKQiBABnbBrEJgeqAyG3ZkGHXwYc_yfkCo9Ug'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for auth
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, error }
  }
}

// Type definitions
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  height?: number;
  weight?: number;
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
  created_at: string;
  updated_at: string;
}

export interface ProfileError {
  code: string;
  message: string;
  details?: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'success' | 'failed';
  plan_id: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  created_at: string;
}

// Payment related functions
export const createPaymentRecord = async (
  userId: string,
  orderId: string,
  amount: number,
  planId: string,
  currency: string = 'INR'
): Promise<{ data: PaymentRecord | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          razorpay_order_id: orderId,
          amount,
          currency,
          status: 'created',
          plan_id: planId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating payment record:', error)
    return { data: null, error: error as Error }
  }
}

export const updatePaymentStatus = async (
  orderId: string,
  status: 'success' | 'failed',
  paymentId?: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        ...(paymentId && { razorpay_payment_id: paymentId }),
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { error: error as Error }
  }
}

export const getUserPayments = async (userId: string): Promise<{ data: PaymentRecord[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting user payments:', error)
    return { data: null, error: error as Error }
  }
}

// Membership related functions
export const getMembershipPlans = async (): Promise<{ data: MembershipPlan[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .order('price', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting membership plans:', error)
    return { data: null, error: error as Error }
  }
}

export const getUserActiveMembership = async (userId: string): Promise<{ data: PaymentRecord | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, membership_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error getting active membership:', error)
    return { data: null, error: error as Error }
  }
}

interface RealtimePostgresChangesPayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}

export const subscribeToPaymentUpdates = (
  orderId: string,
  onUpdate: (payment: PaymentRecord) => void
) => {
  // Create a unique channel name for this payment
  const channelName = `payments:${orderId}:${Date.now()}`;
  
  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: true },
      presence: { key: orderId },
    }
  });

  channel
    .on(
      'postgres_changes' as any, // Type assertion needed due to Supabase types limitation
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'payments',
        filter: `razorpay_order_id=eq.${orderId}`,
      },
      (payload: RealtimePostgresChangesPayload<PaymentRecord>) => {
        console.log('Payment update received:', {
          event: payload.eventType,
          orderId,
          status: payload.new?.status,
        });

        // Only trigger update for relevant changes
        if (payload.new && payload.new.razorpay_order_id === orderId) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe(async (status) => {
      console.log(`Subscription status for ${channelName}:`, status);
      
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to payment updates');
        
        // Verify the current payment status
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('razorpay_order_id', orderId)
            .single();
            
          if (error) throw error;
          if (data) {
            console.log('Current payment status:', data.status);
            // If payment is already completed, trigger update
            if (data.status === 'success' || data.status === 'failed') {
              onUpdate(data);
            }
          }
        } catch (error) {
          console.error('Error fetching payment status:', error);
        }
      }
      
      if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to payment updates');
      }
    });

  // Return cleanup function
  return () => {
    console.log(`Unsubscribing from ${channelName}`);
    try {
      channel.unsubscribe();
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
    }
  };
};

// Profile Operations
export const getProfile = async (userId: string): Promise<{ 
  data: Profile | null; 
  error: ProfileError | null;
  status: 'success' | 'error';
}> => {
  try {
    if (!userId) {
      return {
        data: null,
        error: { 
          code: 'INVALID_INPUT', 
          message: 'User ID is required' 
        },
        status: 'error'
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        phone,
        address,
        gender,
        date_of_birth,
        height,
        weight,
        fitness_goal,
        experience_level,
        medical_conditions,
        emergency_contact,
        preferences,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        status: 'error'
      };
    }

    return {
      data,
      error: null,
      status: 'success'
    };
  } catch (err) {
    const error = err as Error;
    return {
      data: null,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error.stack
      },
      status: 'error'
    };
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// Membership Operations
export const getMembership = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching membership:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching membership:', error);
    return { data: null, error };
  }
};

export const createMembership = async (membershipData: any) => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .insert([membershipData])
      .select()
      .single();

    if (error) {
      console.error('Error creating membership:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating membership:', error);
    return { data: null, error };
  }
};

// Workout Operations
export const getWorkouts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workouts:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return { data: null, error };
  }
};

export const createWorkout = async (workoutData: any) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select()
      .single();

    if (error) {
      console.error('Error creating workout:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating workout:', error);
    return { data: null, error };
  }
};

// Diet Operations
export const getDietPlans = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching diet plans:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    return { data: null, error };
  }
};

export const createDietPlan = async (dietData: any) => {
  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .insert([dietData])
      .select()
      .single();

    if (error) {
      console.error('Error creating diet plan:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating diet plan:', error);
    return { data: null, error };
  }
};

// Attendance Operations
export const getAttendance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { data: null, error };
  }
};

export const markAttendance = async (attendanceData: any) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { data: null, error };
  }
}; 