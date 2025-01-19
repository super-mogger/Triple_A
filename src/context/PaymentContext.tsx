import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

export interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  user_id: string;
  membership_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface PaymentContextType {
  membership: Membership | null;
  loading: boolean;
  error: Error | null;
  createOrder: (planId: string, amount: number) => Promise<{ orderId: string }>;
  verifyPayment: (paymentId: string, orderId: string, signature: string) => Promise<void>;
  loadMembership: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadMembership = async () => {
    if (!user) {
      setMembership(null);
        setLoading(false);
        return;
      }

      try {
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        throw membershipError;
      }

      setMembership(memberships as Membership);
    } catch (err) {
      console.error('Error loading membership:', err);
      setError(err instanceof Error ? err : new Error('Failed to load membership'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembership();
  }, [user]);

  const createOrder = async (planId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          path: 'create-order',
          planId,
          amount,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return { orderId: data.orderId };
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://gjuecyugpchcwznewohb.supabase.co/functions/v1/payment-functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          path: 'verify-payment',
          paymentId,
          orderId,
          signature,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const { membership: newMembership } = await response.json();
      setMembership(newMembership);
    } catch (err) {
      console.error('Error verifying payment:', err);
      throw err;
    }
  };

  return (
    <PaymentContext.Provider
      value={{
      membership,
      loading,
        error,
        createOrder,
        verifyPayment,
        loadMembership,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}; 