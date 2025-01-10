import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { ArrowLeft, Check } from 'lucide-react';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { profileData, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    personalInfo: {
      age: profileData?.personalInfo?.age || '',
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
      await updateProfile(formData);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.personalInfo.age}
                  onChange={(e) => handleChange('personalInfo', 'age', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Gender</label>
                <select
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleChange('personalInfo', 'gender', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Blood Type</label>
                <select
                  value={formData.personalInfo.bloodType}
                  onChange={(e) => handleChange('personalInfo', 'bloodType', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Medical Information</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Medical Conditions</label>
              <textarea
                value={formData.medicalInfo.conditions}
                onChange={(e) => handleChange('medicalInfo', 'conditions', e.target.value)}
                className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-24"
                placeholder="List any medical conditions or allergies..."
              />
            </div>
          </div>

          {/* Physical Stats */}
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Physical Stats</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.stats.weight}
                  onChange={(e) => handleChange('stats', 'weight', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.stats.height}
                  onChange={(e) => handleChange('stats', 'height', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fitness Level</label>
                <select
                  value={formData.preferences.fitnessLevel}
                  onChange={(e) => handleChange('preferences', 'fitnessLevel', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Fitness Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Activity Level</label>
                <select
                  value={formData.preferences.activityLevel}
                  onChange={(e) => handleChange('preferences', 'activityLevel', e.target.value)}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly-active">Lightly Active</option>
                  <option value="moderately-active">Moderately Active</option>
                  <option value="very-active">Very Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDietaryChange(option)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                        ${formData.preferences.dietary.includes(option)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#282828] text-gray-300 hover:bg-[#333]'
                        }`}
                    >
                      {formData.preferences.dietary.includes(option) && (
                        <Check className="w-4 h-4" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 