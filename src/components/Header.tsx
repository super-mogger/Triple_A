import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Settings, LogOut, User } from 'lucide-react';
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
    <header className={`fixed top-0 left-0 right-0 ${
      isDarkMode ? 'bg-dark-surface border-gray-800' : 'bg-white border-gray-200'
    } border-b px-4 py-3 z-50`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className={`text-xl font-bold ${
          isDarkMode ? 'text-dark-text' : 'text-gray-900'
        }`}>
          Triple A
        </h1>

        {user && (
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={`text-sm ${
                isDarkMode ? 'text-dark-text' : 'text-gray-700'
              }`}>
                {user.displayName || user.email}
              </span>
              <img
                src={user.photoURL || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                isDarkMode ? 'bg-dark-surface' : 'bg-white'
              } ring-1 ring-black ring-opacity-5`}>
                <div className="py-1">
                  {/* Profile Button */}
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-dark-text hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
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
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-dark-text hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
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
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-800' 
                        : 'text-red-600 hover:bg-gray-100'
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