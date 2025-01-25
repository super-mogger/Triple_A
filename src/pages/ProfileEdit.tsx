import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { ArrowLeft, Check, Calendar, User2, Activity, Heart, Scale, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Profile } from '../types/profile';

type FormData = Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState<FormData>({
    personal_info: {
      date_of_birth: profile?.personal_info?.date_of_birth || '',
      gender: profile?.personal_info?.gender || 'male',
      height: Number(profile?.personal_info?.height) || 0,
      weight: Number(profile?.personal_info?.weight) || 0,
      contact: profile?.personal_info?.contact || '',
      blood_type: profile?.personal_info?.blood_type || ''
    },
    medical_info: {
      conditions: profile?.medical_info?.conditions || ''
    },
    preferences: {
      dietary: profile?.preferences?.dietary || [],
      workout_days: profile?.preferences?.workout_days || [],
      fitness_goals: profile?.preferences?.fitness_goals || [],
      fitness_level: profile?.preferences?.fitness_level || '',
      activity_level: profile?.preferences?.activity_level || 'moderate'
    }
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        personal_info: {
          date_of_birth: profile.personal_info?.date_of_birth || '',
          gender: profile.personal_info?.gender || 'male',
          height: Number(profile.personal_info?.height) || 0,
          weight: Number(profile.personal_info?.weight) || 0,
          contact: profile.personal_info?.contact || '',
          blood_type: profile.personal_info?.blood_type || ''
        },
        medical_info: {
          conditions: profile.medical_info?.conditions || ''
        },
        preferences: {
          dietary: profile.preferences?.dietary || [],
          workout_days: profile.preferences?.workout_days || [],
          fitness_goals: profile.preferences?.fitness_goals || [],
          fitness_level: profile.preferences?.fitness_level || '',
          activity_level: profile.preferences?.activity_level || 'moderate'
        }
      });
    }
  }, [profile]);

  // Calculate age from DOB
  const calculateAge = (dob: string): string => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-Free',
    'Lactose-Free',
    'Keto',
    'Low-Carb',
    'High-Protein'
  ];

  const handleDietaryChange = (preference: string) => {
    const currentDietary = formData.preferences.dietary;
    const updatedDietary = currentDietary.includes(preference)
      ? currentDietary.filter((p: string) => p !== preference)
      : [...currentDietary, preference];

    setFormData(prevData => ({
      ...prevData,
      preferences: {
        ...prevData.preferences,
        dietary: updatedDietary
      }
    }));
  };

  const handleChange = (section: string, field: string, value: any) => {
    setFormData(prevData => {
      const sectionData = prevData[section as keyof FormData];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prevData,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return prevData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Profile not found');
      return;
    }

    try {
      // Preserve the id and user_id from the existing profile
      const updatedProfile: Profile = {
        ...profile,
        personal_info: {
          ...formData.personal_info,
          height: Number(formData.personal_info.height),
          weight: Number(formData.personal_info.weight)
        },
        medical_info: formData.medical_info,
        preferences: formData.preferences
      };

      await updateProfile(updatedProfile);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <User2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basic details about yourself</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-[#282828] rounded-xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-medium">
                  {calculateAge(formData.personal_info.date_of_birth) || 'Will be calculated from DOB'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically calculated from your date of birth</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personal_info.date_of_birth}
                  onChange={(e) => handleChange('personal_info', 'date_of_birth', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: 1990-01-15</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                <select
                  value={formData.personal_info.gender}
                  onChange={(e) => handleChange('personal_info', 'gender', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</label>
                <select
                  value={formData.personal_info.blood_type}
                  onChange={(e) => handleChange('personal_info', 'blood_type', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your blood type</option>
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Important for medical purposes</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="w-5 h-5 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Medical Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Help us understand your health better</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Do you have any medical conditions?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('medical_info', 'conditions', '')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      !formData.medical_info.conditions
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('medical_info', 'conditions', ' ')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.medical_info.conditions
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
              {formData.medical_info.conditions && (
                <div className="space-y-2">
                  <textarea
                    value={formData.medical_info.conditions}
                    onChange={(e) => handleChange('medical_info', 'conditions', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors h-24"
                    placeholder="Example: Asthma, Diabetes, High Blood Pressure, or any allergies..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">This information helps us customize your workout plan safely</p>
                </div>
              )}
            </div>
          </div>

          {/* Physical Stats */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Physical Stats</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your current body measurements</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.personal_info.weight}
                  onChange={(e) => handleChange('personal_info', 'weight', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="65"
                  min="30"
                  max="250"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: 65 kg</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Height (cm)</label>
                <input
                  type="number"
                  value={formData.personal_info.height}
                  onChange={(e) => handleChange('personal_info', 'height', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="170"
                  min="100"
                  max="250"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: 170 cm</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your fitness journey</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Fitness Level</label>
                <select
                  value={formData.preferences.fitness_level}
                  onChange={(e) => handleChange('preferences', 'fitness_level', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Choose your current fitness level</option>
                  <option value="beginner">Beginner (New to fitness)</option>
                  <option value="intermediate">Intermediate (Regular exercise)</option>
                  <option value="advanced">Advanced (Experienced fitness enthusiast)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">This helps us tailor workouts to your experience level</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Activity Level</label>
                <select
                  value={formData.preferences.activity_level}
                  onChange={(e) => handleChange('preferences', 'activity_level', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your daily activity level</option>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="active">Very Active (Exercise 6-7 days/week)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Helps calculate your daily calorie needs</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Dietary Preferences</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select all that apply to your diet</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDietaryChange(option)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.preferences.dietary.includes(option)
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">These will be used to customize your meal plans</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Check className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
} 