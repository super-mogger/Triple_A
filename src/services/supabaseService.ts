import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

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
): Promise<PaymentRecord> => {
  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        user_id: userId,
        order_id: orderId,
        amount,
        currency,
        status: 'created',
        plan_id: planId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePaymentStatus = async (
  orderId: string,
  status: 'success' | 'failed',
  paymentId?: string
) => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        ...(paymentId && { razorpay_payment_id: paymentId }),
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const getPaymentByOrderId = async (orderId: string): Promise<PaymentRecord | null> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) throw error;
  return data;
};

export const getUserPayments = async (userId: string): Promise<PaymentRecord[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Membership related functions
export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
};

export const getUserActiveMembership = async (userId: string): Promise<PaymentRecord | null> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data;
};

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