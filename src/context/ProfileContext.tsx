import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface ProfileData {
  profileData: any;
  loading: boolean;
  updateProfile: (updatedData: any) => Promise<void>;
  membership?: {
    type: 'Free' | 'Premium';
    status: string;
    startDate?: string;
    expiryDate?: string;
  };
}

const ProfileContext = createContext<ProfileData>({} as ProfileData);

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileData, setProfileData] = useState<any>(null);
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
          setProfileData(docSnap.data());
        } else {
          console.log('Creating new profile for:', user.email);
          const initialProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            personalInfo: {
              age: '',
              dateOfBirth: '',
              gender: '',
              bloodType: '',
            },
            stats: {
              weight: '',
              height: '',
            },
            preferences: {
              fitnessLevel: '',
              activityLevel: '',
              dietary: [],
            },
            goals: [],
            medicalInfo: {
              conditions: '',
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
          
          await setDoc(docRef, initialProfile);
          console.log('Initial profile created');
          setProfileData(initialProfile);
        }
      } catch (error) {
        console.error('Error in ProfileContext:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updatedData: any) => {
    if (!user?.email) {
      console.log('No authenticated user found');
      return;
    }
    
    try {
      console.log('Updating profile for:', user.email);
      const docRef = doc(db, 'users', user.uid);
      
      console.log('Current profile data:', profileData);
      console.log('Update data received:', updatedData);
      
      // Merge with existing data
      const updatedProfile = {
        ...profileData,
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
      setProfileData(updatedProfile);
    } catch (error) {
      console.error('Detailed error:', {
        error,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  // Admin function to grant membership
  const grantMembership = async (email: string) => {
    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months from now

      const membershipData = {
        type: 'biannual',
        name: '6 Months Plan',
        price: 3999,
        duration: '6 months',
        startDate: now.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        status: 'Active' as const,
        features: [
          'All Quarterly Plan features',
          'Personal training consultation',
          'Custom meal plans',
          'Premium support 24/7',
          'Exclusive content access'
        ],
        paymentId: `ADMIN-GRANT-${Date.now()}`,
        grantedBy: 'admin',
        grantedAt: now.toISOString()
      };

      // Update user's profile
      const userRef = doc(db, 'users', email);
      await setDoc(userRef, {
        membership: membershipData
      }, { merge: true });

      // Add to membership history
      const historyRef = doc(db, 'membershipHistory', email);
      await setDoc(historyRef, {
        userId: email,
        memberships: arrayUnion({
          ...membershipData,
          purchasedAt: now.toISOString(),
        })
      }, { merge: true });

      console.log('Membership granted successfully to:', email);
      return true;
    } catch (error) {
      console.error('Error granting membership:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}