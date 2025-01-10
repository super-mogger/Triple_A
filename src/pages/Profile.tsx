import { Edit, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

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

  // Mock active membership data (replace with actual data from backend)
  const activeMembership = {
    plan: 'quarterly',
    startDate: '2024-01-08',
    endDate: '2024-04-08',
    isActive: false
  };

  const [editingDietary, setEditingDietary] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(profileData?.preferences?.dietary || []);
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
    try {
      setSaveError(null);
      await updateProfile({
        preferences: {
          ...profileData?.preferences,
          dietary: dietaryPreferences
        }
      });
      setEditingDietary(false);
    } catch (error) {
      console.error('Error saving dietary preferences:', error);
      setSaveError('Failed to save preferences. Please try again.');
    }
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
            {activeMembership.isActive ? (
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
            {activeMembership.isActive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{plans.find(p => p.id === activeMembership.plan)?.name}</h3>
                    <p className="text-gray-400 text-sm">Valid until {new Date(activeMembership.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {Math.ceil((new Date(activeMembership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (new Date(activeMembership.endDate).getTime() - new Date().getTime()) / 
                        (new Date(activeMembership.endDate).getTime() - new Date(activeMembership.startDate).getTime()) * 100))}%`
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Dietary Preferences</p>
                  <button
                    onClick={() => {
                      setEditingDietary(!editingDietary);
                      setSaveError(null);
                    }}
                    className="text-sm text-emerald-500 hover:text-emerald-400"
                  >
                    {editingDietary ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editingDietary ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dietaryOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleDietaryChange(option)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            dietaryPreferences.includes(option)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#282828] text-gray-300 hover:bg-[#333]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {saveError && (
                      <p className="text-red-500 text-sm mb-3">{saveError}</p>
                    )}
                    <button
                      onClick={saveDietaryPreferences}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                ) : (
                  <p className="mt-1">
                    {profileData?.preferences?.dietary?.length > 0 
                      ? profileData.preferences.dietary.join(', ') 
                      : 'No dietary preferences set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 