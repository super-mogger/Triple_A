import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Dumbbell, CreditCard, Sparkles, Activity, Tag } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { notifications, toggleNotification } = useNotification();

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Workout Reminders */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Workout Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about your scheduled workouts</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('workoutReminders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  notifications.workoutReminders ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notifications.workoutReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Membership Updates */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Membership Updates</p>
                  <p className="text-sm text-gray-500">Updates about your membership status</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('membershipUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  notifications.membershipUpdates ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notifications.membershipUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* New Features */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">New Features</p>
                  <p className="text-sm text-gray-500">Stay updated with new app features</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('newFeatures')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  notifications.newFeatures ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notifications.newFeatures ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Progress Alerts */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Progress Alerts</p>
                  <p className="text-sm text-gray-500">Notifications about your fitness progress</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('progressAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  notifications.progressAlerts ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notifications.progressAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Special Offers */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-200 font-medium">Special Offers</p>
                  <p className="text-sm text-gray-500">Receive updates about special deals and promotions</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('specialOffers')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  notifications.specialOffers ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notifications.specialOffers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          You can change these notification settings at any time
        </div>
      </div>
    </div>
  );
} 