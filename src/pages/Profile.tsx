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
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* User Info Card */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-8">
          <div className="p-6 flex items-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mr-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{user?.email?.[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user?.displayName || user?.email}</h2>
              <p className="text-gray-400">Member since {new Date(user?.metadata?.creationTime || '').toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Active Membership Card */}
        <div 
          className="bg-[#1E1E1E] rounded-xl shadow-sm mb-8 cursor-pointer hover:bg-[#242424] transition-colors"
          onClick={() => navigate('/membership')}
        >
          <div className="px-6 py-5 border-b border-[#282828] flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Active Membership
            </h2>
            {membership?.isActive ? (
              <span className="bg-emerald-600/20 text-emerald-500 px-3 py-1 rounded-full text-sm">
                Active
              </span>
            ) : (
              <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm">
                Inactive
              </span>
            )}
          </div>
          <div className="p-6">
            {membership?.isActive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{plans.find(p => p.id === membership.planId)?.name}</h3>
                    <p className="text-gray-400 text-sm">Valid until {new Date(membership.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (new Date(membership.endDate).getTime() - new Date().getTime()) / 
                        (new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime()) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-300">No Active Membership</p>
                  <p className="text-gray-500 mt-1">Get access to all gym facilities and features</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-[#282828]">
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* BMR and Calorie Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">BMR & Calorie Information</h3>
              <div className="bg-[#282828] rounded-xl p-6 space-y-6">
                {profileData?.stats?.weight && profileData?.stats?.height && profileData?.personalInfo?.age ? (
                  <>
                    {/* BMR Calculation */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">Basal Metabolic Rate (BMR)</p>
                        <p className="text-lg font-semibold text-emerald-500">
                          {Math.round(
                            profileData.personalInfo.gender === 'male'
                              ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
                              : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age))
                          )} kcal/day
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">Calories your body burns at complete rest</p>
                    </div>

                    {/* BMI Indicator */}
                    <div className="border-t border-[#363636] pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">Body Mass Index (BMI)</p>
                        {(() => {
                          const heightInM = Number(profileData.stats.height) / 100;
                          const weightInKg = Number(profileData.stats.weight);
                          const bmi = weightInKg / (heightInM * heightInM);
                          return (
                            <p className={`text-lg font-semibold ${
                              bmi < 18.5 ? 'text-blue-500' :
                              bmi < 25 ? 'text-emerald-500' :
                              bmi < 30 ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              {bmi.toFixed(1)}
                            </p>
                          );
                        })()}
                      </div>

                      {/* BMI Scale */}
                      <div className="relative h-8 mt-4">
                        {/* Background gradient */}
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-emerald-500 via-yellow-500 to-red-500" />
                        </div>

                        {/* BMI Categories */}
                        <div className="absolute inset-0 flex text-[10px] text-white">
                          <div className="w-[20%] border-r border-white/20 px-1">
                            Underweight
                            <br />
                            (&lt;18.5)
                          </div>
                          <div className="w-[35%] border-r border-white/20 px-1">
                            Normal
                            <br />
                            (18.5-24.9)
                          </div>
                          <div className="w-[25%] border-r border-white/20 px-1">
                            Overweight
                            <br />
                            (25-29.9)
                          </div>
                          <div className="w-[20%] px-1">
                            Obese
                            <br />
                            (≥30)
                          </div>
                        </div>

                        {/* Current BMI Marker */}
                        {(() => {
                          const heightInM = Number(profileData.stats.height) / 100;
                          const weightInKg = Number(profileData.stats.weight);
                          const bmi = weightInKg / (heightInM * heightInM);
                          // Calculate position (0-100%)
                          let position = 0;
                          if (bmi < 18.5) {
                            position = (bmi / 18.5) * 20;
                          } else if (bmi < 25) {
                            position = 20 + ((bmi - 18.5) / 6.5) * 35;
                          } else if (bmi < 30) {
                            position = 55 + ((bmi - 25) / 5) * 25;
                          } else {
                            position = Math.min(100, 80 + ((bmi - 30) / 10) * 20);
                          }
                          
                          return (
                            <div 
                              className="absolute w-0.5 h-10 bg-white shadow-lg transform -translate-x-1/2 -translate-y-1"
                              style={{ left: `${position}%` }}
                            />
                          );
                        })()}
                      </div>

                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const heightInM = Number(profileData.stats.height) / 100;
                            const weightInKg = Number(profileData.stats.weight);
                            const bmi = weightInKg / (heightInM * heightInM);
                            if (bmi < 18.5) return "You're in the underweight range. Consider consulting with a nutritionist for a healthy weight gain plan.";
                            if (bmi < 25) return "You're in the healthy weight range. Keep maintaining a balanced diet and regular exercise.";
                            if (bmi < 30) return "You're in the overweight range. Consider a moderate calorie deficit and increased physical activity.";
                            return "You're in the obese range. Consider consulting with a healthcare provider for a personalized weight management plan.";
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* TDEE Calculation */}
                    {profileData?.preferences?.activityLevel && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-400">Total Daily Energy Expenditure (TDEE)</p>
                          <p className="text-lg font-semibold text-emerald-500">
                            {(() => {
                              const bmr = profileData.personalInfo.gender === 'male'
                                ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
                                : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));
                              
                              const activityMultipliers = {
                                sedentary: 1.2,
                                'lightly-active': 1.375,
                                'moderately-active': 1.55,
                                'very-active': 1.725
                              };
                              
                              const multiplier = activityMultipliers[profileData.preferences.activityLevel as keyof typeof activityMultipliers] || 1.2;
                              return Math.round(bmr * multiplier);
                            })()} kcal/day
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">Total calories burned based on your activity level</p>
                      </div>
                    )}

                    {/* Recommended Calorie Targets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#363636]">
                      <div className="bg-[#1E1E1E] p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Weight Loss Target</p>
                        <p className="text-lg font-semibold text-red-500">
                          {(() => {
                            const bmr = profileData.personalInfo.gender === 'male'
                              ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
                              : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));
                            
                            const activityMultipliers = {
                              sedentary: 1.2,
                              'lightly-active': 1.375,
                              'moderately-active': 1.55,
                              'very-active': 1.725
                            };
                            
                            const multiplier = activityMultipliers[profileData.preferences.activityLevel as keyof typeof activityMultipliers] || 1.2;
                            return Math.round((bmr * multiplier) - 500);
                          })()} kcal/day
                        </p>
                        <p className="text-xs text-gray-500 mt-1">500 calorie deficit</p>
                      </div>

                      <div className="bg-[#1E1E1E] p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Maintenance Target</p>
                        <p className="text-lg font-semibold text-yellow-500">
                          {(() => {
                            const bmr = profileData.personalInfo.gender === 'male'
                              ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
                              : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));
                            
                            const activityMultipliers = {
                              sedentary: 1.2,
                              'lightly-active': 1.375,
                              'moderately-active': 1.55,
                              'very-active': 1.725
                            };
                            
                            const multiplier = activityMultipliers[profileData.preferences.activityLevel as keyof typeof activityMultipliers] || 1.2;
                            return Math.round(bmr * multiplier);
                          })()} kcal/day
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Maintain current weight</p>
                      </div>

                      <div className="bg-[#1E1E1E] p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Muscle Gain Target</p>
                        <p className="text-lg font-semibold text-emerald-500">
                          {(() => {
                            const bmr = profileData.personalInfo.gender === 'male'
                              ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
                              : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));
                            
                            const activityMultipliers = {
                              sedentary: 1.2,
                              'lightly-active': 1.375,
                              'moderately-active': 1.55,
                              'very-active': 1.725
                            };
                            
                            const multiplier = activityMultipliers[profileData.preferences.activityLevel as keyof typeof activityMultipliers] || 1.2;
                            return Math.round((bmr * multiplier) + 500);
                          })()} kcal/day
                        </p>
                        <p className="text-xs text-gray-500 mt-1">500 calorie surplus</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-2">Complete your profile to see BMR calculations</p>
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="text-emerald-500 hover:text-emerald-400 text-sm font-medium"
                    >
                      Update Profile
                    </button>
                  </div>
                )}
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