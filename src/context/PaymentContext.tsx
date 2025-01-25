import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMembership } from '../services/FirestoreService';
import type { FirestoreMembership } from '../types/firestore.types';

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
        throw membershipError;
      }

      setMembership(membershipData);
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