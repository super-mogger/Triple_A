import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <button
          onClick={toggleDarkMode}
          className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Toggle Dark Mode
        </button>
        {user ? (
          <div>
            <img
              src={user.photoURL || 'default-profile.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4"
            />
            <p className="text-lg font-semibold">{user.displayName || 'User'}</p>
            <p className="text-sm">{user.email}</p>
          </div>
        ) : (
          <p>No user information available.</p>
        )}
        <div className="mt-6">
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 