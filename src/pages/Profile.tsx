import React from 'react';
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
        </div>
      </div>
    </div>
  );
} 