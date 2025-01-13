import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Settings, LogOut, User, Dumbbell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${
      isDarkMode 
        ? 'bg-dark-surface/80 border-gray-800/50' 
        : 'bg-white/80 border-gray-200/50'
    } border-b backdrop-blur-md backdrop-saturate-150 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <Dumbbell className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
            isDarkMode 
              ? 'from-emerald-400 to-blue-400' 
              : 'from-emerald-600 to-blue-600'
          }`}>
            Triple A
          </h1>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button 
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50' 
                  : 'hover:bg-gray-100/50'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {user.displayName || user.email}
              </span>
              <img
                src={user.photoURL || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-emerald-500/20"
              />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                isDarkMode 
                  ? 'bg-[#1E1E1E]/90 border border-gray-800/50' 
                  : 'bg-white/90 border border-gray-200/50'
              } backdrop-blur-md backdrop-saturate-150 overflow-hidden transition-all duration-200`}>
                <div className="py-1.5">
                  {/* Profile Button */}
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-800/50' 
                        : 'text-gray-700 hover:bg-gray-100/50'
                    }`}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-800/50' 
                        : 'text-gray-700 hover:bg-gray-100/50'
                    }`}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 mr-3" />
                    ) : (
                      <Moon className="w-4 h-4 mr-3" />
                    )}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-800/50' 
                        : 'text-red-600 hover:bg-gray-100/50'
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
} 