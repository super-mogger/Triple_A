import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getProfile as getFirestoreProfile, 
  updateProfile as updateFirestoreProfile, 
  createProfile as createFirestoreProfile,
  updateVerificationStatus,
  updateAadhaarImages,
  syncProfilePhotoToAuth
} from '../services/FirestoreService';
import { toast } from 'react-hot-toast';
import { Profile, ActivityLevel } from '../types/profile';
import { Timestamp } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateVerification: (isVerified: boolean) => Promise<void>;
  updateIdentityDocuments: (frontURL?: string, backURL?: string) => Promise<void>;
  refetchProfile: () => Promise<void>;
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
  const [lastRefreshed, setLastRefreshed] = useState<number>(0);

  // Create a memoized fetchProfile function that we can call directly
  const fetchProfile = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const { data: profileData, error: fetchError } = await getFirestoreProfile(user.uid);
      
      if (fetchError) throw fetchError;
      
      if (profileData) {
        setProfile(profileData);
        setLastRefreshed(Date.now());
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
          // Admin sync fields with default values
          aadhaarCardFrontURL: undefined,
          aadhaarCardBackURL: undefined,
          isVerified: false,
          address: '',
          emergencyContact: '',
          notes: '',
          created_at: now,
          updated_at: now
        };
        
        const { error: createError } = await createFirestoreProfile(user.uid, defaultProfile);
        if (createError) throw createError;
        
        setProfile(defaultProfile);
        setLastRefreshed(Date.now());
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Public function to allow components to request a profile refresh
  const refetchProfile = useCallback(async () => {
    if (user?.uid) {
      console.log('Manually refreshing profile data');
      await fetchProfile();
    }
  }, [user, fetchProfile]);

  // Load profile on initial render and when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  // Force refresh profile every few minutes to ensure sync
  useEffect(() => {
    // Set up a timer to refresh profile data every 5 minutes
    const intervalId = setInterval(() => {
      if (user?.uid && !loading && Date.now() - lastRefreshed > 5 * 60 * 1000) {
        console.log('Auto refreshing profile data');
        fetchProfile();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [user, loading, lastRefreshed, fetchProfile]);

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.uid) {
      return;
    }

    try {
      // Remove photo-related fields as users cannot update photos
      const updatedData = {
        ...data,
        updated_at: Timestamp.now()
      };
      
      // Block photo updates in the main app
      if (updatedData.photoURL || updatedData.avatar_url) {
        toast.error('Profile picture updates are disabled. Please contact an administrator.');
        delete updatedData.photoURL;
        delete updatedData.avatar_url;
      }
      
      // Block identity document updates in the main app
      if (updatedData.aadhaarCardFrontURL || updatedData.aadhaarCardBackURL) {
        toast.error('Identity document uploads are disabled. Please contact an administrator.');
        delete updatedData.aadhaarCardFrontURL;
        delete updatedData.aadhaarCardBackURL;
      }

      // Only proceed if there are still fields to update
      if (Object.keys(updatedData).length > 1) { // > 1 because updated_at is always present
        // Update Firestore profile
        const { error: updateError } = await updateFirestoreProfile(user.uid, updatedData);
        if (updateError) throw updateError;
        
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
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      throw err;
    }
  };

  // Function to update verification status (admin sync)
  const updateVerification = async (isVerified: boolean) => {
    if (!user?.uid) return;
    
    try {
      const { error } = await updateVerificationStatus(user.uid, isVerified);
      if (error) throw new Error(error);
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          isVerified,
          updated_at: Timestamp.now()
        });
      }
      
      // Refresh profile to ensure we have the latest data
      await fetchProfile();
      toast.success('Verification status updated');
    } catch (err) {
      console.error('Error updating verification status:', err);
      toast.error('Failed to update verification status');
      throw err;
    }
  };

  // Function to update identity documents (admin sync)
  const updateIdentityDocuments = async (frontURL?: string, backURL?: string) => {
    if (!user?.uid) return;
    
    try {
      const { error } = await updateAadhaarImages(user.uid, frontURL, backURL);
      if (error) throw new Error(error);
      
      // Update local state
      if (profile) {
        const updates: Partial<Profile> = {
          updated_at: Timestamp.now()
        };
        
        if (frontURL) updates.aadhaarCardFrontURL = frontURL;
        if (backURL) updates.aadhaarCardBackURL = backURL;
        
        // Auto-verify if both images are present
        if ((frontURL || profile.aadhaarCardFrontURL) && 
            (backURL || profile.aadhaarCardBackURL)) {
          updates.isVerified = true;
        }
        
        setProfile({
          ...profile,
          ...updates
        });
        
        // Refresh profile to ensure we have the latest data
        await fetchProfile();
      }
      
      toast.success('Identity documents updated');
    } catch (err) {
      console.error('Error updating identity documents:', err);
      toast.error('Failed to update identity documents');
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      loading, 
      error, 
      updateProfile,
      updateVerification,
      updateIdentityDocuments,
      refetchProfile
    }}>
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