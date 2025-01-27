import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMembership } from '../services/FirestoreService';
import type { FirestoreMembership } from '../types/firestore.types';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface PaymentContextType {
  membership: FirestoreMembership | null;
  loading: boolean;
  error: Error | null;
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
  const [membership, setMembership] = useState<FirestoreMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      console.log('Setting up membership listener for user:', user.uid);
      // Set up real-time listener for membership changes
      unsubscribe = onSnapshot(
        doc(db, 'memberships', user.uid),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log('Raw membership data from listener:', data);

            // Convert timestamps to dates for comparison
            const endDate = data.end_date?.toDate();
            const startDate = data.start_date?.toDate();
            const now = new Date();
            
            // Check if membership is active
            const isActive = endDate && startDate 
              ? now >= startDate && now <= endDate && data.status !== 'cancelled'
              : false;

            console.log('Membership status:', {
              startDate,
              endDate,
              now,
              isActive,
              status: data.status
            });

            setMembership({
              id: doc.id,
              user_id: user.uid,
              plan_id: data.planId || data.plan_id || 'monthly',
              plan_name: data.planName || data.plan_name || 'Monthly Plan',
              start_date: data.startDate || data.start_date,
              end_date: data.endDate || data.end_date,
              is_active: isActive,
              status: data.status || 'active',
              amount_paid: data.amount || data.amount_paid || 699,
              payment_status: data.paymentStatus || data.payment_status || 'completed',
              features: data.features || [
                'Access to gym equipment',
                'Personal trainer consultation',
                'Group fitness classes',
                'Locker room access',
                'Fitness assessment'
              ],
              description: data.description || 'Standard gym membership',
              created_at: data.createdAt || data.created_at,
              updated_at: data.updatedAt || data.updated_at
            } as FirestoreMembership);
          } else {
            console.log('No membership found for user:', user.uid);
            setMembership(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to membership changes:', error);
          setError(error instanceof Error ? error : new Error('Failed to listen to membership changes'));
          setLoading(false);
        }
      );
    } else {
      setMembership(null);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up membership listener');
        unsubscribe();
      }
    };
  }, [user]);

  const loadMembership = async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: membershipData, error: membershipError } = await getMembership(user.uid);
      
      if (membershipError) {
        throw new Error(membershipError);
      }

      setMembership(membershipData);
    } catch (err) {
      console.error('Error loading membership:', err);
      setError(err instanceof Error ? err : new Error('Failed to load membership'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        membership,
        loading,
        error,
        loadMembership
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}; 