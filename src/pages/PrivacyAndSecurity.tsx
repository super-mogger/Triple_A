import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, Eye, Key, UserPlus, Bell, History, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';

export default function PrivacyAndSecurity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { privacySettings, securitySettings, updatePrivacySetting, updateSecuritySetting } = usePrivacy();

  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    if (typeof privacySettings[key] === 'boolean') {
      updatePrivacySetting(key, !privacySettings[key]);
    }
  };

  const handleSecurityToggle = (key: keyof typeof securitySettings) => {
    updateSecuritySetting(key, !securitySettings[key]);
  };

  const handleProfileVisibilityChange = (value: 'public' | 'friends' | 'private') => {
    updatePrivacySetting('profileVisibility', value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Security</h1>
        </div>

        {/* Privacy Overview */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Privacy Matters</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            At Triple A Fitness, we take your privacy and security seriously. We implement industry-standard encryption 
            and security measures to protect your personal information and fitness data.
          </p>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Profile Visibility */}
            <div className="px-4 py-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Profile Visibility
              </label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handleProfileVisibilityChange(e.target.value as 'public' | 'friends' | 'private')}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private - Only me</option>
              </select>
            </div>

            {/* Progress Visibility */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Show Progress</p>
                <p className="text-sm text-gray-500">Allow others to see your fitness progress</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showProgress')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  privacySettings.showProgress ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    privacySettings.showProgress ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Achievements Visibility */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Show Achievements</p>
                <p className="text-sm text-gray-500">Display your fitness achievements to others</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showAchievements')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  privacySettings.showAchievements ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    privacySettings.showAchievements ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Friend Requests */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Allow Friend Requests</p>
                <p className="text-sm text-gray-500">Receive friend requests from other members</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('allowFriendRequests')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  privacySettings.allowFriendRequests ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    privacySettings.allowFriendRequests ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Data Collection */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Data Collection</p>
                <p className="text-sm text-gray-500">Allow anonymous data collection to improve services</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('dataCollection')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  privacySettings.dataCollection ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    privacySettings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => handleSecurityToggle('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  securitySettings.twoFactorAuth ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Login Alerts */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Login Alerts</p>
                <p className="text-sm text-gray-500">Get notified of new sign-ins to your account</p>
              </div>
              <button
                onClick={() => handleSecurityToggle('loginAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  securitySettings.loginAlerts ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Device History */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200 font-medium">Device History</p>
                <p className="text-sm text-gray-500">Track and manage devices that accessed your account</p>
              </div>
              <button
                onClick={() => handleSecurityToggle('deviceHistory')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  securitySettings.deviceHistory ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    securitySettings.deviceHistory ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Password Change Button */}
            <div className="px-4 py-3">
              <button
                onClick={() => navigate('/change-password')}
                className="w-full py-2.5 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Data Protection Info */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Protection</h2>
          </div>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              Your data is encrypted using industry-standard protocols and stored securely in our protected databases.
              We never share your personal information with third parties without your explicit consent.
            </p>
            <p>
              You can request a copy of your data or delete your account at any time. Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 