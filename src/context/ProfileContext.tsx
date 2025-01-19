import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { Membership } from '../types/payment';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  personal_info: {
    date_of_birth: string;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    contact: string;
    blood_type?: string;
  };
  preferences: {
    dietary: string[];
    workout_days: string[];
    fitness_goals: string[];
    fitness_level: string;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  };
  medical_info?: {
    conditions: string;
  };
  membership?: Membership;
  created_at: string;
  updated_at: string;
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
        // Fetch profile from Supabase
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw fetchError;
        }

        if (existingProfile) {
          setProfile(existingProfile as Profile);
        } else {
          // Create default profile
          const defaultProfile: Omit<Profile, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            personal_info: {
              date_of_birth: '',
              gender: 'male',
              height: 0,
              weight: 0,
              contact: '',
              blood_type: ''
            },
            preferences: {
              dietary: [],
              workout_days: [],
              fitness_goals: [],
              fitness_level: 'beginner',
              activity_level: 'moderate'
            },
            medical_info: {
              conditions: ''
            }
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfile])
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile as Profile);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Fetch the updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(updatedProfile as Profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
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