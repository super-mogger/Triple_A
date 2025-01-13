import { Edit, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* User Info Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-8">
          <div className="p-6 flex items-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mr-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{user?.email?.[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.displayName || user?.email}</h2>
              <p className="text-gray-500 dark:text-gray-400">Member since {new Date(user?.metadata?.creationTime || '').toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Active Membership Card */}
        <div 
          className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors"
          onClick={() => navigate('/membership')}
        >
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Crown className="w-5 h-5 text-yellow-500" />
              Active Membership
            </h2>
            {membership?.isActive ? (
              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                Inactive
              </span>
            )}
          </div>
          <div className="p-6">
            {membership?.isActive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plans.find(p => p.id === membership.planId)?.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Valid until {new Date(membership.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                      {Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#282828] rounded-full h-2">
                  <div 
                    className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${Math.max(0, Math.min(100, (new Date(membership.endDate).getTime() - new Date().getTime()) / 
                        (new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime()) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-300">No Active Membership</p>
                  <p className="text-gray-500 dark:text-gray-400">Get access to all gym facilities and features</p>
                  <button className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors inline-flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    View Plans
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* BMR and Calorie Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">BMR & Calorie Information</h3>
              <div className="bg-[#1E1E1E] rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">BMR & Calorie Information</h2>
                
                <div className="space-y-6">
                  {/* BMR Display */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Basal Metabolic Rate (BMR)</p>
                      <p className="text-xs text-gray-500">Calories your body burns at complete rest</p>
                    </div>
                    <p className="text-lg font-semibold text-emerald-500">1841 kcal/day</p>
                  </div>

                  {/* BMI Display */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-400">Body Mass Index (BMI)</p>
                      <p className="text-lg font-semibold text-emerald-500">21.6</p>
                    </div>
                    
                    {/* BMI Scale */}
                    <div className="relative h-2 rounded-full overflow-hidden mb-2" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)' }}>
                      {/* BMI Indicator */}
                      <div 
                        className="absolute w-1 h-4 bg-white -top-1 transition-all duration-300"
                        style={{ left: 'calc(21.6% * 2.5)', transform: 'translateX(-50%)' }}
                      />
                    </div>
                    
                    {/* BMI Categories */}
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Age</p>
                  <p className="mt-1">{profileData?.personalInfo?.age || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date of Birth</p>
                  <p className="mt-1">{profileData?.personalInfo?.dateOfBirth || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gender</p>
                  <p className="mt-1">{profileData?.personalInfo?.gender || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Blood Type</p>
                  <p className="mt-1">{profileData?.personalInfo?.bloodType || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Medical Information</h3>
              <div>
                <p className="text-sm text-gray-400">Medical Conditions</p>
                <p className="mt-1">{profileData?.medicalInfo?.conditions || 'None reported'}</p>
              </div>
            </div>

            {/* Physical Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4">Physical Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Weight</p>
                  <p className="mt-1">{profileData?.stats?.weight || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Height</p>
                  <p className="mt-1">{profileData?.stats?.height || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Fitness Level</p>
                  <p className="mt-1">{profileData?.preferences?.fitnessLevel || 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Activity Level</p>
                  <p className="mt-1">{profileData?.preferences?.activityLevel || 'Not Set'}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-400">Dietary Preferences</p>
                <p className="mt-1">
                  {renderDietaryPreferences()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 