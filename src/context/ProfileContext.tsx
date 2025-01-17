import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface Profile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  personalInfo: {
    age: number;
    dateOfBirth: string;
    gender: 'male' | 'female';
    bloodType: string;
  };
  stats: {
    weight: number;
    height: number;
  };
  preferences: {
    fitnessLevel: string;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
    dietary: string[];
  };
  goals: string[];
  medicalInfo: {
    conditions: string;
  };
  membership: {
    planId: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    lastPaymentId: string;
  };
  createdAt: string;
  lastUpdated: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updatedData: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  updateProfile: async () => {},
  refreshProfile: async () => {}
});

export const useProfile = () => useContext(ProfileContext);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchProfileWithRetry = async (retryCount = 0): Promise<Profile | null> => {
    try {
      if (!user?.uid) {
        throw new Error('No authenticated user found');
      }

      // First try to get the profile by UID
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as Profile;
      }

      // If not found by UID, try to find by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingProfile = querySnapshot.docs[0].data() as Profile;
        // Update the document with the correct UID
        await setDoc(docRef, { ...existingProfile, uid: user.uid }, { merge: true });
        return existingProfile;
      }

      // If no profile exists, create a new one
      const initialProfile: Profile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        personalInfo: {
          age: 0,
          dateOfBirth: '',
          gender: 'male',
          bloodType: '',
        },
        stats: {
          weight: 0,
          height: 0,
        },
        preferences: {
          fitnessLevel: '',
          activityLevel: 'moderate',
          dietary: [],
        },
        goals: [],
        medicalInfo: {
          conditions: '',
        },
        membership: {
          planId: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          lastPaymentId: 'initial_free_month'
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await setDoc(docRef, initialProfile);
      return initialProfile;

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      if (retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * Math.pow(2, retryCount));
        return fetchProfileWithRetry(retryCount + 1);
      }
      
      throw error;
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProfile = await fetchProfileWithRetry();
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const updateProfile = async (updatedData: Partial<Profile>) => {
    if (!user?.uid) {
      throw new Error('No authenticated user found');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'users', user.uid);
      const currentProfile = profile || await fetchProfileWithRetry();

      if (!currentProfile) {
        throw new Error('Failed to fetch current profile');
      }

      const updatedProfile: Profile = {
        ...currentProfile,
        ...updatedData,
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(docRef, updatedProfile);
      setProfile(updatedProfile);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};