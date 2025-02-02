import { ArrowLeft, Sun, Moon, Bell, Shield, HelpCircle, LogOut, User, Settings as SettingsIcon, CreditCard, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
  const navigate = useNavigate();
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const { signOut, user } = useAuth();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-blue-500" />;
      case 'adaptive':
        return <Monitor className="w-5 h-5 text-purple-500" />;
    }
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'adaptive':
        return 'System Theme';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* User Info Summary */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.displayName || user?.email}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <User className="w-5 h-5 text-emerald-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Edit Profile</p>
                  <p className="text-sm text-gray-500">Update your personal information</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/membership')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-purple-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Membership</p>
                  <p className="text-sm text-gray-500">Manage your subscription plan</p>
                </div>
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            </div>
            <div className="p-4">
              <div className="relative">
                <button
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getThemeIcon()}
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {getThemeText()}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isThemeDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isThemeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <button
                      onClick={() => {
                        setThemeMode('light');
                        setIsThemeDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-200">Light Mode</span>
                    </button>
                    <button
                      onClick={() => {
                        setThemeMode('dark');
                        setIsThemeDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Moon className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                    </button>
                    <button
                      onClick={() => {
                        setThemeMode('adaptive');
                        setIsThemeDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Monitor className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-200">System Theme</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="p-4">
              <button
                onClick={() => navigate('/notifications')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-emerald-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Notification Settings</p>
                  <p className="text-sm text-gray-500">Manage your notification preferences</p>
                </div>
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            <div className="p-4">
              <button
                onClick={() => navigate('/privacy')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Shield className="w-5 h-5 text-purple-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Privacy & Security</p>
                  <p className="text-sm text-gray-500">Manage your account security settings</p>
                </div>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Support</h2>
            </div>
            <div className="p-4">
              <button
                onClick={() => navigate('/support')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Shield className="w-5 h-5 text-purple-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Help & Support</p>
                  <p className="text-sm text-gray-500">Get help with your account</p>
                </div>
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 