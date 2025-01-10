import React from 'react';
<<<<<<< Updated upstream
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
=======
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { 
  Edit, 
  Crown, 
  Star, 
  Calendar, 
  Clock, 
  Shield, 
  Settings,
  BarChart2
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const { user } = useAuth();

  // Temporarily show admin controls for all users
  const isAdmin = true; // Changed this line to always return true

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* Profile Header */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-6">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/membership')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Grant Membership</span>
              </button>
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center gap-2 px-4 py-2 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
<<<<<<< Updated upstream
            </div>
>>>>>>> Stashed changes
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Membership Controls
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate('/admin/membership')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Grant 6-Month Membership</span>
              </button>
=======
>>>>>>> Stashed changes
            </div>
          </div>
        </div>

<<<<<<< Updated upstream
=======
        {/* Quick Actions */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Membership Controls
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate('/admin/membership')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Grant 6-Month Membership</span>
              </button>
            </div>
          </div>
        </div>

>>>>>>> Stashed changes
        {/* Existing Membership Section */}
        {/* ... rest of your profile sections ... */}
      </div>
    </div>
  );
} 