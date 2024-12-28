import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming useAuth provides user information

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-50 flex items-center justify-between">
      <h1 className="text-lg font-bold text-gray-800">Triple A</h1>
      {user && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">{user.displayName || 'User'}</span>
          <img
            src={user.photoURL || 'default-profile.png'} // Fallback to a default image if no photoURL
            alt="Profile"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => navigate('/profile')}
          />
        </div>
      )}
    </header>
  );
} 