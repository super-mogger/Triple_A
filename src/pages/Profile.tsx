import { Edit, Crown, ArrowLeft, Activity, Calendar, User2, Scale, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useTheme } from '../context/ThemeContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  pricePerMonth: number;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 699,
    duration: '1 month',
    pricePerMonth: 699,
    features: [
      'Full access to gym equipment',
      'Basic workout plans',
      'Access to fitness classes',
      'Locker room access',
      'Cancel anytime'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 1999,
    duration: '3 months',
    pricePerMonth: Math.round(1999 / 3),
    features: [
      'All Monthly Plan features',
      'Personalized workout plans',
      'Nutrition guidance',
      '1 Personal training session/month',
      'Save ₹98 per month'
    ]
  },
  {
    id: 'biannual',
    name: 'Biannual Plan',
    price: 3999,
    duration: '6 months',
    pricePerMonth: Math.round(3999 / 6),
    features: [
      'All Quarterly Plan features',
      'Priority booking for classes',
      '2 Personal training sessions/month',
      'Monthly fitness assessment',
      'Save ₹133 per month'
    ]
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile();
  const { user } = useAuth();
  const { membership } = usePayment();
  const { isDarkMode } = useTheme();
  const [editingDietary, setEditingDietary] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Calculate BMI
  const calculateBMI = useCallback(() => {
    if (!profile?.personal_info?.weight || !profile?.personal_info?.height) return null;
    const weight = Number(profile.personal_info.weight);
    const heightInMeters = Number(profile.personal_info.height) / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [profile]);

  // Calculate BMR
  const calculateBMR = useCallback(() => {
    if (!profile?.personal_info?.weight || !profile?.personal_info?.height || !profile?.personal_info?.date_of_birth) return null;
    
    const weight = Number(profile.personal_info.weight);
    const height = Number(profile.personal_info.height);
    const birthDate = new Date(profile.personal_info.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const gender = profile.personal_info.gender;

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = (10 * weight) + (6.25 * height) - (5 * age);
    return Math.round(gender === 'male' ? bmr + 5 : bmr - 161);
  }, [profile]);

  const bmr = calculateBMR();
  const bmi = calculateBMI();
  const bmiInfo = useMemo(() => {
    if (!bmi) return null;
    const bmiNum = Number(bmi);
    if (bmiNum < 18.5) return { category: 'Underweight', position: '10%' };
    if (bmiNum < 25) return { category: 'Normal', position: '35%' };
    if (bmiNum < 30) return { category: 'Overweight', position: '60%' };
    return { category: 'Obese', position: '85%' };
  }, [bmi]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load profile</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
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
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
          {/* Profile Header Section */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar and Name Section */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                  <img
                    src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                  />
                  {membership?.isActive && (
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
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Edit Profile Button */}
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Status</h3>
            </div>
            {bmi && bmiInfo && (
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
            )}
          </div>

          {/* BMR Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Calories</h3>
            </div>
            {bmr && (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{bmr}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">calories/day</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Base Metabolic Rate</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Membership Card */}
        <div 
          className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl cursor-pointer"
          onClick={() => navigate('/membership')}
        >
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <Crown className="w-6 h-6 text-yellow-500" />
              Active Membership
            </h2>
            {membership?.isActive ? (
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
            {membership?.isActive ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {membership.planName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">Valid until {new Date(membership.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Days Remaining</p>
                    <p className="text-3xl font-bold text-emerald-500">
                      {Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) / 
                        Math.ceil((new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime()) / (1000 * 60 * 60 * 24))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No active membership. Click to view available plans.</p>
                <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dietary Preferences Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <Heart className="w-6 h-6 text-red-500" />
              Dietary Preferences
            </h2>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="p-8">
            <div className="flex flex-wrap gap-2">
              {profile.preferences?.dietary && profile.preferences.dietary.length > 0 ? (
                profile.preferences.dietary.map((pref: string) => (
                  <span
                    key={pref}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg"
                  >
                    {pref}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No dietary preferences set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 