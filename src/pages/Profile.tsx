import React from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { Edit } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profileData } = useProfile();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
          {/* Header with Edit Button */}
          <div className="px-6 py-5 flex justify-between items-center border-b border-[#282828]">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
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
                <p className="text-sm text-gray-400">Dietary Preferences</p>
                <p className="mt-1">
                  {profileData?.preferences?.dietary?.length > 0 
                    ? profileData.preferences.dietary.join(', ') 
                    : 'No dietary preferences set'}
                </p>
              </div>
            </div>
          </div>
=======
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      <div className={`rounded-lg p-6 ${
        isDarkMode ? 'bg-dark-surface' : 'bg-white'
      } shadow-lg`}>
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user?.photoURL || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">
              {user?.displayName || 'User Profile'}
            </h1>
            <p className={`${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>
              Member since {user?.metadata.creationTime ? 
                new Date(user.metadata.creationTime).toLocaleDateString() : 
                'N/A'}
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5" />
              <span>{user?.email}</span>
            </div>
          </div>

          {user?.phoneNumber && (
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>{user.phoneNumber}</span>
              </div>
            </div>
          )}

          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Email verified: {user?.emailVerified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Additional Profile Sections */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Fitness Goals</h2>
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <p>Set your fitness goals here</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <p>Your progress statistics will appear here</p>
          </div>
>>>>>>> parent of 90f2545 (push)
        </div>
      </div>
    </div>
  );
} 