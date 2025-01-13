import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ProfileData {
  personalInfo?: {
    age?: number;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodType?: string;
  };
  stats?: {
    weight?: number;
    height?: number;
  };
  medicalInfo?: {
    conditions?: string;
  };
  preferences?: {
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active';
    dietary?: string[];
  };
}

interface ProfileContextType {
  profileData: ProfileData | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'profiles', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfileData(docSnap.data() as ProfileData);
          } else {
            // Initialize empty profile
            const initialProfile: ProfileData = {};
            await setDoc(docRef, initialProfile);
            setProfileData(initialProfile);
          }
        } catch (err) {
          setError('Failed to load profile data');
          console.error('Error loading profile:', err);
        }
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<ProfileData>) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      const updatedData = { ...profileData, ...data };
      await setDoc(docRef, updatedData);
      setProfileData(updatedData);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 