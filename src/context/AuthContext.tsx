import React, { createContext, useContext, useEffect, useState } from 'react';
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
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getProfile, createProfile, updateProfile } from '../services/FirestoreService';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import type { Profile } from '../types/profile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);

      if (user) {
        try {
          // Check if profile exists
          const { data: profile, error } = await getProfile(user.uid);
          
          if (!profile) {
            console.log('Creating new profile for user:', user.email);
            // Create default profile if none exists
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
                dietary: [],
                workout_days: [],
                fitness_goals: [],
                fitness_level: 'beginner',
                activity_level: 'moderate'
              },
              created_at: Timestamp.now(),
              updated_at: Timestamp.now()
            };
            
            const { error: createError } = await createProfile(user.uid, defaultProfile);
            if (createError) {
              console.error('Error creating profile:', createError);
              setError(new Error('Failed to create profile'));
            }
          } else {
            console.log('Updating existing profile for user:', user.email);
            // Update profile with latest auth data
            const updates = {
              email: user.email || profile.email,
              username: user.displayName || profile.username,
              photoURL: user.photoURL || profile.photoURL,
              updated_at: Timestamp.now()
            };
            const { error: updateError } = await updateProfile(user.uid, updates);
            if (updateError) {
              console.error('Error updating profile:', updateError);
              setError(new Error('Failed to update profile'));
            }
          }
        } catch (error) {
          console.error('Error managing profile:', error);
          setError(error instanceof Error ? error : new Error('Failed to manage profile'));
        }
      }

      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updatePassword = async (password: string) => {
    if (!user) throw new Error('No user logged in');
    await updateUserPassword(user, password);
  };

  const updateUserProfileData = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error('No user logged in');
    await updateUserProfile(user, data);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateUserProfile: updateUserProfileData
  };

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