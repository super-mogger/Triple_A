import { Edit, Crown, ArrowLeft, Activity, Calendar, User2, Scale, Heart, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getProfile } from '../services/FirestoreService';
import type { Profile } from '../types/profile';
import { toast } from 'react-hot-toast';
import { useMembership } from '../context/MembershipContext';
import UserInfoCard from '../components/profile/UserInfoCard';
import StatsGrid from '../components/profile/StatsGrid';
import MembershipCard from '../components/profile/MembershipCard';
import PreferencesCard from '../components/profile/PreferencesCard';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { membership, isActive, loading: membershipLoading } = useMembership();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      if (!user?.uid) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await getProfile(user.uid);
        
        if (profileError) {
          throw profileError;
        }
        
        setProfile(profileData);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [user, navigate]);

  // Calculate BMI
  const calculateBMI = () => {
    if (!profile?.personal_info?.weight || !profile?.personal_info?.height) return null;
    const weight = Number(profile.personal_info.weight);
    const heightInMeters = Number(profile.personal_info.height) / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? {
    category: Number(bmi) < 18.5 ? 'Underweight' :
              Number(bmi) < 25 ? 'Normal' :
              Number(bmi) < 30 ? 'Overweight' : 'Obese',
    position: Number(bmi) < 18.5 ? '10%' :
              Number(bmi) < 25 ? '35%' :
              Number(bmi) < 30 ? '60%' : '85%'
  } : null;

  const handlePhotoUpdate = () => {
    setIsPhotoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
            <User2 className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">We couldn't find your profile information.</p>
          <button
            onClick={() => navigate('/profile/edit')}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Back Button with Title */}
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>

          {/* User Info Card */}
          <UserInfoCard 
            profile={profile} 
            isActive={isActive} 
            onPhotoUpdate={handlePhotoUpdate}
          />

          {/* Stats Grid */}
          <StatsGrid profile={profile} bmi={bmi} bmiInfo={bmiInfo} />

          {/* Membership Card */}
          <MembershipCard isActive={isActive} membership={membership} />

          {/* Preferences Card */}
          <PreferencesCard profile={profile} />
        </div>
      </div>

      {/* Photo Update Modal */}
      <ProfileSetupModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        isPhotoOnly={true}
      />
    </>
  );
} 