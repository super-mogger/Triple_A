import { ArrowLeft, Sun, Moon, Bell, Shield, HelpCircle, LogOut, User, Settings as SettingsIcon, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
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
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  isDarkMode ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                } relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                    isDarkMode ? 'transform translate-x-5' : ''
                  }`} />
                </div>
              </button>
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
                onClick={() => navigate('/help')}
                className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-blue-500 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Help & Support</p>
                  <p className="text-sm text-gray-500">Get help and contact support</p>
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