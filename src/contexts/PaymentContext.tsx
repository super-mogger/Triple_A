import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface PaymentContextType {
  loading: boolean;
  error: string | null;
  paymentStatus: string | null;
  setPaymentStatus: (status: string | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const value = {
    loading,
    error,
    paymentStatus,
    setPaymentStatus
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
} 