import React from 'react';
import { Droplets, Bell } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * A reusable component for water reminder toggle
 * Can be used in NotificationSettings or directly in WaterIntakeCard
 */
const WaterReminderRow: React.FC = () => {
  const { notifications, toggleNotification, requestNotificationPermission, sendNotification } = useNotification();
  const { user } = useAuth();

  const handleToggleReminder = async () => {
    if (!notifications.waterReminders) {
      // Request permission when enabling reminders
      const granted = await requestNotificationPermission();
      
      if (granted) {
        toggleNotification('waterReminders');
        
        // Send a test notification
        setTimeout(() => {
          sendNotification('Water Reminder', {
            body: 'Water reminders are now enabled! You will receive reminders to stay hydrated.',
            icon: '/logo192.png',
          });
        }, 1000);
      } else {
        toast.error('Please enable browser notifications to receive water reminders');
      }
    } else {
      // Just disable if already enabled
      toggleNotification('waterReminders');
      toast('Water reminders disabled');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Droplets className="w-5 h-5 text-blue-500" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Water Reminders</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get regular reminders to stay hydrated</p>
        </div>
      </div>
      
      <button
        onClick={handleToggleReminder}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
          notifications.waterReminders ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
            notifications.waterReminders ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default WaterReminderRow; 