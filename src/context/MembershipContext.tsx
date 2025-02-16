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
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchMembershipStatus = async (force: boolean = false) => {
    if (!user?.uid) {
      setMembership(null);
      setIsActive(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await checkMembershipStatus(user.uid);
      
      // Only update if forced or there's a change in status
      if (force || status.isActive !== isActive || JSON.stringify(status.membership) !== JSON.stringify(membership)) {
        setMembership(status.membership);
        setIsActive(status.isActive);
        setError(status.error);
        setLastRefresh(Date.now());
      }
    } catch (err) {
      console.error('Error fetching membership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch membership data when user changes
  useEffect(() => {
    fetchMembershipStatus(true);
  }, [user]);

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => fetchMembershipStatus(false), 30000);
    return () => clearInterval(intervalId);
  }, [user, lastRefresh]);

  const refreshMembership = async () => {
    await fetchMembershipStatus(true);
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