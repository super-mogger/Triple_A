import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useWaterReminders } from '../hooks/useWaterReminders';
import { toast } from 'react-hot-toast';

interface WaterReminderButtonProps {
  className?: string;
}

const WaterReminderButton: React.FC<WaterReminderButtonProps> = ({ className = '' }) => {
  const { notifications, toggleNotification, requestNotificationPermission } = useNotification();
  const { sendWaterReminder } = useWaterReminders();

  const handleToggleReminders = async () => {
    // If enabling reminders, request permission first
    if (!notifications.waterReminders) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('Please enable browser notifications to receive water reminders.');
        return;
      }
      
      // Send a test notification when enabling
      toast.success('Water reminders enabled. You will receive notifications based on your settings.');
      toggleNotification('waterReminders');
      
      // Send an immediate test reminder
      setTimeout(() => {
        sendWaterReminder();
      }, 1000);
    } else {
      // Just toggle off if already enabled
      toggleNotification('waterReminders');
      toast('Water reminders disabled');
    }
  };

  return (
    <button
      onClick={handleToggleReminders}
      className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      title={notifications.waterReminders ? "Disable water reminders" : "Enable water reminders"}
    >
      {notifications.waterReminders ? (
        <Bell className="w-4 h-4 text-blue-500" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
    </button>
  );
};

export default WaterReminderButton; 