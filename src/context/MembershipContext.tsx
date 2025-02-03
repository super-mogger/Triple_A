import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMembership, checkMembershipStatus } from '../services/FirestoreService';
import { Membership } from '../types/profile';

interface MembershipContextType {
  membership: Membership | null;
  isActive: boolean;
  loading: boolean;
  error: string | null;
  refreshMembership: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembershipStatus = async () => {
    if (!user?.uid) {
      setMembership(null);
      setIsActive(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await checkMembershipStatus(user.uid);
      
      setMembership(status.membership);
      setIsActive(status.isActive);
      setError(status.error);
    } catch (err) {
      console.error('Error fetching membership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch membership data when user changes
  useEffect(() => {
    fetchMembershipStatus();
  }, [user]);

  // Set up periodic refresh (every minute)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(fetchMembershipStatus, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  const refreshMembership = async () => {
    await fetchMembershipStatus();
  };

  return (
    <MembershipContext.Provider 
      value={{ 
        membership, 
        isActive, 
        loading, 
        error,
        refreshMembership 
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
} 