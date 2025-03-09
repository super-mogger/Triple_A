import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateUserProfile,
  updatePassword as updateUserPassword,
  UserCredential,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getProfile, createProfile, updateProfile } from '../services/FirestoreService';
import { Timestamp } from 'firebase/firestore';
import { Profile, ActivityLevel } from '../types/profile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateUserProfile: (data: { photoURL?: string; displayName?: string }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleProfile = useCallback(async (user: User) => {
    try {
      const { data: existingProfile, error } = await getProfile(user.uid);
      
      if (!existingProfile) {
        console.log('Creating new profile for user:', user.email);
        const defaultProfile: Profile = {
          id: user.uid,
          user_id: user.uid,
          email: user.email || '',
          username: user.displayName || user.email?.split('@')[0] || `user_${user.uid.substring(0, 6)}`,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          personal_info: {
            date_of_birth: '',
            gender: 'male',
            height: 170,
            weight: 70,
            contact: '',
            blood_type: ''
          },
          medical_info: {
            conditions: ''
          },
          preferences: {
            activity_level: 'beginner' as ActivityLevel,
            dietary_preferences: [],
            workout_preferences: [],
            fitness_goals: [],
            fitness_level: '',
            dietary: [],
            workout_days: [],
            workout_time: ''
          },
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };
        
        const { error: createError } = await createProfile(user.uid, defaultProfile);
        if (createError) throw createError;
        setProfile(defaultProfile);
      } else {
        console.log('Updating existing profile for user:', user.email);
        const updates = {
          email: user.email || existingProfile.email,
          username: user.displayName || existingProfile.username,
          photoURL: user.photoURL || existingProfile.photoURL,
          updated_at: Timestamp.now()
        };
        const { error: updateError } = await updateProfile(user.uid, updates);
        if (updateError) throw updateError;
        setProfile({ ...existingProfile, ...updates });
      }
    } catch (error) {
      console.error('Error managing profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to manage profile'));
    }
  }, []);

  useEffect(() => {
    console.log('Setting up auth state listener');
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      if (!isMounted) return;

      if (user) {
        setUser(user);
        await handleProfile(user);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      isMounted = false;
      unsubscribe();
    };
  }, [handleProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!user) throw new Error('No user logged in');
    await updateUserPassword(user, password);
  }, [user]);

  const updateUserProfileData = useCallback(async (data: { photoURL?: string; displayName?: string }) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await updateUserProfile(user, data);
      
      if (data.photoURL && profile) {
        const { error: updateError } = await updateProfile(user.uid, {
          photoURL: data.photoURL,
          updated_at: Timestamp.now()
        });
        
        if (updateError) throw updateError;
        setProfile({ ...profile, photoURL: data.photoURL });
      }
      
      await user.reload();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }, [user, profile]);

  const updateProfileData = useCallback(async (data: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    if (!profile) throw new Error('No profile found');
    
    try {
      const updatedProfile: Profile = {
        ...profile,
        ...data,
        updated_at: Timestamp.now()
      };
      
      await updateProfile(user.uid, updatedProfile);
      setProfile(updatedProfile);
      
      if (data.photoURL || data.username) {
        await user.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user, profile]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    profile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateUserProfile: updateUserProfileData,
    updateProfile: updateProfileData,
    sendVerificationEmail: async () => {
      if (user) {
        await sendEmailVerification(user);
      }
    },
    isEmailVerified: user?.emailVerified || false,
    logout: signOut
  }), [
    user,
    loading,
    error,
    profile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateUserProfileData,
    updateProfileData
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;