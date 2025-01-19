import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export interface PaymentRecord {
  id: string;
  user_id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'success' | 'failed';
  plan_id: string;
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
  status: PaymentRecord['status'],
  paymentId?: string
): Promise<PaymentRecord> => {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      payment_id: paymentId,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
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