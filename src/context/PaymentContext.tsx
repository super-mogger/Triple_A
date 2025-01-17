import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { loadRazorpayScript, initializeRazorpayPayment } from '../services/RazorpayService';
import { Payment, Membership, Plan } from '../types/payment';

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    duration: '1 month',
    price: 699
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    duration: '3 months',
    price: 1999
  },
  {
    id: 'biannual',
    name: '6 Month Plan',
    duration: '6 months',
    price: 3999
  }
];

interface PaymentContextType {
  payments: Payment[];
  membership: Membership | null;
  loading: boolean;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updateMembership: (membership: Membership) => Promise<void>;
  initiatePayment: (options: { amount: number; currency: string; description: string; planId: string }) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType>({
  payments: [],
  membership: null,
  loading: true,
  addPayment: async () => {},
  updateMembership: async () => {},
  initiatePayment: async () => {}
});

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  // Immediately update membership when profile changes
  useEffect(() => {
    if (profile?.membership) {
      setMembership(profile.membership);
    } else if (user?.uid) {
      // If no membership exists, create a default one
      const defaultMembership: Membership = {
        planId: 'monthly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        lastPaymentId: 'initial_free_month'
      };
      updateProfile({ membership: defaultMembership });
      setMembership(defaultMembership);
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch payments
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Payment[];
        setPayments(paymentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<void> => {
    if (!user?.uid) return;

    try {
      const paymentsRef = collection(db, 'payments');
      const newPaymentRef = doc(paymentsRef);
      const newPayment = {
        ...payment,
        id: newPaymentRef.id
      };

      await setDoc(newPaymentRef, newPayment);
      setPayments(prev => [newPayment as Payment, ...prev]);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const updateMembership = async (newMembership: Membership) => {
    if (!user?.uid) return;

    try {
      await updateProfile({
        membership: newMembership
      });
      setMembership(newMembership);
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (response: any, planId: string, amount: number) => {
    try {
      // Create a new payment record
      const payment: Omit<Payment, 'id'> = {
        userId: user!.uid,
        date: new Date().toISOString(),
        amount: amount,
        planId: planId,
        planName: plans.find((p: Plan) => p.id === planId)?.name || '',
        status: 'success',
        transactionId: response.razorpay_payment_id,
        paymentMethod: 'razorpay',
        orderId: response.razorpay_order_id
      };
      await addPayment(payment);

      // Calculate new membership dates
      const plan = plans.find((p: Plan) => p.id === planId);
      const durationInMonths = plan?.duration.includes('month') 
        ? parseInt(plan.duration) 
        : plan?.duration.includes('year') 
          ? parseInt(plan.duration) * 12 
          : 1;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationInMonths);

      // Update membership
      const newMembership: Membership = {
        planId: planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        lastPaymentId: response.razorpay_payment_id // Use payment ID from Razorpay response
      };
      await updateMembership(newMembership);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  };

  const initiatePayment = async (options: { amount: number; currency: string; description: string; planId: string }) => {
    if (!user) throw new Error('User must be logged in to make a payment');

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Failed to load Razorpay script');

      // Create order using Vercel API
      const orderResponse = await fetch('/api/razorpay/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await orderResponse.json();

      // Initialize payment
      await initializeRazorpayPayment(
        options.amount,
        options.currency,
        orderId,
        {
          name: user.displayName || '',
          email: user.email || '',
          contact: profile?.personalInfo?.contact || ''
        },
        async (response) => {
          try {
            await handlePaymentSuccess(response, options.planId, options.amount);
          } catch (error) {
            console.error('Error processing successful payment:', error);
            throw error;
          }
        },
        (error) => {
          // Add payment failure record
          const failedPayment: Omit<Payment, 'id'> = {
            userId: user.uid,
            date: new Date().toISOString(),
            amount: options.amount,
            planId: options.planId,
            planName: plans.find((p: Plan) => p.id === options.planId)?.name || '',
            status: 'failed',
            transactionId: 'failed_' + Date.now(),
            paymentMethod: 'razorpay',
            orderId: orderId
          };
          addPayment(failedPayment).catch(console.error);
          throw error;
        }
      );
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{
      payments,
      membership,
      loading,
      addPayment,
      updateMembership,
      initiatePayment
    }}>
      {children}
    </PaymentContext.Provider>
  );
}; 