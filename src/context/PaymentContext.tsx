import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Payment {
  id: string;
  userId: string;
  date: string;
  amount: number;
  planId: string;
  planName: string;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  paymentMethod: string;
  orderId: string;
  invoiceUrl?: string;
}

interface Membership {
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  lastPaymentId: string;
}

interface PaymentContextType {
  payments: Payment[];
  membership: Membership | null;
  loading: boolean;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updateMembership: (membership: Membership) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType>({} as PaymentContextType);

export function usePayment() {
  return useContext(PaymentContext);
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profileData, updateProfile } = useProfile();

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

        // Set membership from profile data
        if (profileData?.membership) {
          setMembership(profileData.membership);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, profileData]);

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
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
      // Update membership in profile
      await updateProfile({
        membership: newMembership
      });
      setMembership(newMembership);
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{
      payments,
      membership,
      loading,
      addPayment,
      updateMembership
    }}>
      {children}
    </PaymentContext.Provider>
  );
} 