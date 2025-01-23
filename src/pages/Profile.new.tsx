import { Edit, Crown, ArrowLeft, Activity, Calendar, User2, Scale, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getProfile, getMembership } from '../services/firestoreService';
import type { FirestoreProfile, FirestoreMembership } from '../types/firestore.types';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FirestoreProfile | null>(null);
  const [membership, setMembership] = useState<FirestoreMembership | null>(null);

  useEffect(() => {
    async function loadProfileData() {
      if (!user?.uid) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        // Load profile data
        const { data: profileData, error: profileError } = await getProfile(user.uid);
        
        if (profileError) {
          throw profileError;
        }
        
        setProfile(profileData);

        // Load membership data
        const { data: membershipData, error: membershipError } = await getMembership(user.uid);
        if (!membershipError && membershipData) {
          setMembership(membershipData);
        }

        toast.success('Profile loaded successfully');
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
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                  />
                  {membership?.is_active && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {profile.created_at.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BMI Card */}
          {bmi && bmiInfo && (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{bmi}</span>
                  <span className="text-lg font-medium text-emerald-500">{bmiInfo.category}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: bmiInfo.position }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Activity Level Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Level</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                  {profile.experience_level || 'Beginner'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current fitness level</p>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div 
          className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl cursor-pointer"
          onClick={() => navigate('/membership')}
        >
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <Crown className="w-6 h-6 text-yellow-500" />
              Membership Status
            </h2>
            {membership?.is_active ? (
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-sm font-medium">
                Inactive
              </span>
            )}
          </div>
          <div className="p-8">
            {membership?.is_active ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {membership.plan_name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Valid until {membership.end_date.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No active membership. Click to view available plans.
                </p>
                <button 
                  onClick={() => navigate('/membership')}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <Heart className="w-6 h-6 text-red-500" />
              Preferences
            </h2>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {profile.preferences ? (
                <>
                  {profile.preferences.dietary && profile.preferences.dietary.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dietary Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferences.dietary.map((diet, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.preferences.workout_time && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preferred Workout Time</h3>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm capitalize">
                        {profile.preferences.workout_time}
                      </span>
                    </div>
                  )}
                  {profile.preferences.workout_days && profile.preferences.workout_days.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workout Days</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferences.workout_days.map((day, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm capitalize"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No preferences set. Update your profile to add preferences.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 