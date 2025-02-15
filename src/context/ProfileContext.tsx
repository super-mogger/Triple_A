import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getProfile as getFirestoreProfile, updateProfile as updateFirestoreProfile, createProfile as createFirestoreProfile } from '../services/FirestoreService';
import { toast } from 'react-hot-toast';
import { Profile, ActivityLevel } from '../types/profile';
import { Timestamp } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultPreferences = {
  activity_level: 'beginner' as ActivityLevel,
  dietary_preferences: [],
  workout_preferences: [],
  fitness_goals: [],
  fitness_level: '',
  dietary: [],
  workout_time: '',
  workout_days: []
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const { data: profileData, error: fetchError } = await getFirestoreProfile(user.uid);
      
      if (fetchError) throw fetchError;
      
      if (profileData) {
        setProfile(profileData);
      } else {
        // Create default profile if none exists
        const now = Timestamp.now();
        const defaultProfile: Profile = {
          id: user.uid,
          user_id: user.uid,
          email: user.email || '',
          username: user.email?.split('@')[0] || '',
          personal_info: {
            date_of_birth: '',
            gender: 'male',
            height: 0,
            weight: 0,
            contact: '',
            blood_type: ''
          },
          medical_info: {
            conditions: ''
          },
          preferences: defaultPreferences,
          created_at: now,
          updated_at: now
        };
        
        const { error: createError } = await createFirestoreProfile(user.uid, defaultProfile);
        if (createError) throw createError;
        
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.uid) {
      return;
    }

    try {
      const updatedData = {
        ...data,
        updated_at: Timestamp.now()
      };

      // Update Firestore profile
      const { error: updateError } = await updateFirestoreProfile(user.uid, updatedData);
      if (updateError) throw updateError;

      // If photoURL is being updated, also update the auth profile
      if (data.photoURL && user) {
        await updateAuthProfile(user, {
          photoURL: data.photoURL
        });
      }
      
      // Immediately update local state
      if (profile) {
        const newProfile = {
          ...profile,
          ...updatedData
        };
        setProfile(newProfile);
      }

      // Fetch fresh data from server to ensure sync
      await fetchProfile();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile }}>
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