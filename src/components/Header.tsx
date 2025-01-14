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
    <header className={`fixed top-0 left-0 right-0 z-50 pt-safe ${
      isDarkMode 
        ? 'bg-dark-surface/80 border-gray-800/50' 
        : 'bg-white/80 border-gray-200/50'
    } border-b backdrop-blur-md backdrop-saturate-150 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        <button 
          onClick={() => navigate('/')}
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
        </button>

        {user && (
          <div className="relative" ref={menuRef}>
            <button 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50 active:bg-gray-800/70' 
                  : 'hover:bg-gray-100/50 active:bg-gray-100/70'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            </button>

            {isMenuOpen && (
              <div className={`absolute right-0 mt-2 w-56 md:w-48 rounded-lg shadow-lg ${
                isDarkMode 
                  ? 'bg-[#1E1E1E]/90 border border-gray-800/50' 
                  : 'bg-white/90 border border-gray-200/50'
              } backdrop-blur-md backdrop-saturate-150 overflow-hidden transition-all duration-200`}>
                <div className="py-1.5">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 md:py-2 text-sm font-medium transition-colors touch-manipulation ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-800/50 active:bg-gray-800/70' 
                        : 'text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/70'
                    }`}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 md:py-2 text-sm font-medium transition-colors touch-manipulation ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-800/50 active:bg-gray-800/70' 
                        : 'text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/70'
                    }`}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 mr-3" />
                    ) : (
                      <Moon className="w-4 h-4 mr-3" />
                    )}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 md:py-2 text-sm font-medium transition-colors touch-manipulation ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-800/50 active:bg-gray-800/70' 
                        : 'text-red-600 hover:bg-gray-100/50 active:bg-gray-100/70'
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