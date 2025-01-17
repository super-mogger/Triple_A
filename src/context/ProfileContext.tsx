import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  updateProfile: (updatedData: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  updateProfile: async () => {}
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for:', user.email);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Existing profile found:', docSnap.data());
          const data = docSnap.data();
          // Ensure membership exists and is active
          if (!data.membership || !data.membership.isActive) {
            data.membership = {
              planId: 'monthly',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
              lastPaymentId: 'initial_free_month'
            };
            // Update the document with active membership
            await setDoc(docRef, data, { merge: true });
          }
          setProfile(data as Profile);
        } else {
          console.log('Creating new profile for:', user.email);
          const initialProfile: Profile = {
            uid: user.uid,
            email: user.email,
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
          console.log('Initial profile created');
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Error in ProfileContext:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updatedData: Partial<Profile>) => {
    if (!user?.email || !profile) {
      console.log('No authenticated user found or no existing profile');
      return;
    }
    
    try {
      console.log('Updating profile for:', user.email);
      const docRef = doc(db, 'users', user.uid);
      
      console.log('Current profile data:', profile);
      console.log('Update data received:', updatedData);
      
      // Merge with existing data
      const updatedProfile: Profile = {
        ...profile,
        ...updatedData,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastUpdated: new Date().toISOString(),
      };

      console.log('Final update data:', updatedProfile);

      await setDoc(docRef, updatedProfile, { merge: true });
      console.log('Profile updated successfully');
      setProfile(updatedProfile);
    } catch (error: any) {
      console.error('Detailed error:', {
        error,
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};