import { Edit, Crown, ArrowLeft, Activity, Calendar, User2, Scale, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
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
  const { profileData, updateProfile } = useProfile();
  const { user } = useAuth();
  const { membership } = usePayment();
  const { isDarkMode } = useTheme();

  // Mock active membership data (replace with actual data from backend)
  const activeMembership = {
    plan: 'quarterly',
    startDate: '2024-01-08',
    endDate: '2024-04-08',
    isActive: false
  };

  const [editingDietary, setEditingDietary] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    profileData?.preferences?.dietary || []
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.preferences?.dietary) {
      setDietaryPreferences(profileData.preferences.dietary);
    }
  }, [profileData]);

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto'];

  const handleDietaryChange = (option: string) => {
    if (dietaryPreferences.includes(option)) {
      setDietaryPreferences(dietaryPreferences.filter(pref => pref !== option));
    } else {
      setDietaryPreferences([...dietaryPreferences, option]);
    }
  };

  const saveDietaryPreferences = async () => {
    if (!profileData) return;
    
    try {
      setSaveError(null);
      const updatedPreferences = {
        fitnessLevel: profileData.preferences?.fitnessLevel || 'beginner',
        activityLevel: profileData.preferences?.activityLevel || 'sedentary',
        dietary: dietaryPreferences
      } as const;
      
      await updateProfile({
        preferences: updatedPreferences
      });
      setEditingDietary(false);
    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      setSaveError('Failed to save preferences. Please try again.');
    }
  };

  // Calculate activity multiplier with type safety
  const getActivityMultiplier = (level: string): number => {
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725
    };
    return activityMultipliers[level] || 1.2;
  };

  // Helper function to safely display dietary preferences
  const renderDietaryPreferences = () => {
    const preferences = profileData?.preferences?.dietary;
    if (!preferences || preferences.length === 0) {
      return 'No dietary preferences set';
    }
    return preferences.join(', ');
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!profileData?.stats?.weight || !profileData?.stats?.height) return null;
    const weight = Number(profileData.stats.weight);
    const heightInMeters = Number(profileData.stats.height) / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Get BMI category and position
  const getBMIInfo = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', position: '10%' };
    if (bmi < 25) return { category: 'Normal', position: '35%' };
    if (bmi < 30) return { category: 'Overweight', position: '60%' };
    return { category: 'Obese', position: '85%' };
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (!profileData?.stats?.weight || !profileData?.stats?.height || !profileData?.personalInfo?.age) return null;
    
    const weight = Number(profileData.stats.weight);
    const height = Number(profileData.stats.height);
    const age = Number(profileData.personalInfo.age);
    const gender = profileData.personalInfo.gender;

    // BMR Formula:
    // For men: BMR = 10W + 6.25H - 5A + 5
    // For women: BMR = 10W + 6.25H - 5A - 161
    const bmr = (10 * weight) + (6.25 * height) - (5 * age);
    return gender === 'male' ? Math.round(bmr + 5) : Math.round(bmr - 161);
  };

  const bmr = calculateBMR();
  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMIInfo(Number(bmi)) : null;

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
          <div className="p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{user?.email?.[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user?.displayName || user?.email}</h2>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <p>Member since {new Date(user?.metadata?.creationTime || '').toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl hover:bg-emerald-500/20 transition-all duration-200 font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
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
                      {plans.find(p => p.id === membership.planId)?.name}
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
            {!editingDietary && (
              <button
                onClick={() => setEditingDietary(true)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="p-8">
            {editingDietary ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleDietaryChange(option)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        dietaryPreferences.includes(option)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingDietary(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDietaryPreferences}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData?.preferences?.dietary && profileData.preferences.dietary.length > 0 ? (
                  profileData.preferences.dietary.map(pref => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 