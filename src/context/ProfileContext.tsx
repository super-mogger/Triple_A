import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Membership } from '../types/payment';

interface Profile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    contact: string;
  };
  preferences: {
    dietary: string[];
    workoutDays: string[];
    fitnessGoals: string[];
    fitnessLevel: string;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  };
  membership?: Membership;
  createdAt: string;
  updatedAt: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  updateProfile: async () => {}
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as Profile);
        } else {
          // Create default profile
          const defaultProfile: Profile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            personalInfo: {
              fullName: user.displayName || '',
              dateOfBirth: '',
              gender: 'male',
              height: 0,
              weight: 0,
              contact: ''
            },
            preferences: {
              dietary: [],
              workoutDays: [],
              fitnessGoals: [],
              fitnessLevel: 'beginner',
              activityLevel: 'moderate'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(profileRef, defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await setDoc(profileRef, updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err as Error);
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};