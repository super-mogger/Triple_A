import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, Dumbbell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 pt-safe ${
      isDarkMode 
        ? 'bg-dark-surface/80 border-gray-800/50' 
        : 'bg-white/80 border-gray-200/50'
    } border-b backdrop-blur-md backdrop-saturate-150 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        <Link 
          to="/dashboard"
          className="flex items-center gap-2 touch-manipulation"
        >
          <Dumbbell className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h1 className={`text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
            isDarkMode 
              ? 'from-emerald-400 to-blue-400' 
              : 'from-emerald-600 to-blue-600'
          }`}>
            Triple A
          </h1>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <Link 
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50 active:bg-gray-800/70' 
                  : 'hover:bg-gray-100/50 active:bg-gray-100/70'
              }`}
            >
              <span className={`text-sm font-medium hidden md:block ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {user.displayName || user.email}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-500/20">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Settings Button */}
            <Link
              to="/settings"
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50 active:bg-gray-800/70 text-gray-200' 
                  : 'hover:bg-gray-100/50 active:bg-gray-100/70 text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
} 