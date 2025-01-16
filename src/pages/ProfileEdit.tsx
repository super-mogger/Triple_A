import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { ArrowLeft, Check, Calendar, User2, Activity, Heart, Scale, Stethoscope } from 'lucide-react';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { profileData, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    personalInfo: {
      dateOfBirth: profileData?.personalInfo?.dateOfBirth || '',
      gender: profileData?.personalInfo?.gender || '',
      bloodType: profileData?.personalInfo?.bloodType || ''
    },
    medicalInfo: {
      conditions: profileData?.medicalInfo?.conditions || ''
    },
    stats: {
      weight: profileData?.stats?.weight || '',
      height: profileData?.stats?.height || ''
    },
    preferences: {
      fitnessLevel: profileData?.preferences?.fitnessLevel || '',
      activityLevel: profileData?.preferences?.activityLevel || '',
      dietary: profileData?.preferences?.dietary || []
    }
  });

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

    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        dietary: updatedDietary
      }
    });
  };

  const handleChange = (section: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section as keyof typeof formData],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate age before submitting
      const age = calculateAge(formData.personalInfo.dateOfBirth);
      
      await updateProfile({
        personalInfo: {
          ...formData.personalInfo,
          age // Add calculated age
        },
        medicalInfo: formData.medicalInfo,
        stats: formData.stats,
        preferences: formData.preferences
      });
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
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
                  {calculateAge(formData.personalInfo.dateOfBirth) || 'Will be calculated from DOB'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically calculated from your date of birth</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: 1990-01-15</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                <select
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleChange('personalInfo', 'gender', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</label>
                <select
                  value={formData.personalInfo.bloodType}
                  onChange={(e) => handleChange('personalInfo', 'bloodType', e.target.value)}
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
                    onClick={() => handleChange('medicalInfo', 'conditions', '')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      !formData.medicalInfo.conditions
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('medicalInfo', 'conditions', ' ')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.medicalInfo.conditions
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
              {formData.medicalInfo.conditions && (
                <div className="space-y-2">
                  <textarea
                    value={formData.medicalInfo.conditions}
                    onChange={(e) => handleChange('medicalInfo', 'conditions', e.target.value)}
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
                  value={formData.stats.weight}
                  onChange={(e) => handleChange('stats', 'weight', e.target.value)}
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
                  value={formData.stats.height}
                  onChange={(e) => handleChange('stats', 'height', e.target.value)}
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
                  value={formData.preferences.fitnessLevel}
                  onChange={(e) => handleChange('preferences', 'fitnessLevel', e.target.value)}
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
                  value={formData.preferences.activityLevel}
                  onChange={(e) => handleChange('preferences', 'activityLevel', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your daily activity level</option>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="lightly-active">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderately-active">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="very-active">Very Active (Exercise 6-7 days/week)</option>
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