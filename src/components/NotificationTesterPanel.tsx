import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { testNotification, NotificationType } from '../utils/NotificationTester';
import { Bell, AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useNotificationManager } from '../hooks/useNotificationManager';

const NotificationTesterPanel: React.FC = () => {
  const { notifications, sendNotification, requestNotificationPermission, notificationPermission } = useNotification();
  const notificationManager = useNotificationManager();
  
  const [testing, setTesting] = useState(false);
  const [hasScheduled, setHasScheduled] = useState(false);

  // Check for scheduled notifications on mount
  useEffect(() => {
    try {
      const scheduledNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '[]'
      );
      setHasScheduled(scheduledNotifications.length > 0);
    } catch (error) {
      console.error('Error checking for scheduled notifications:', error);
    }
  }, []);

  // Test a specific notification type
  const testSpecificNotification = async (type: NotificationType) => {
    // Check if this notification type is enabled
    if (!notifications[type]) {
      alert(`${type} notifications are disabled. Please enable them in the settings first.`);
      return;
    }

    setTesting(true);
    try {
      // Test using our notification system
      await testNotification(type, sendNotification);
    } catch (error) {
      console.error(`Error testing ${type} notification:`, error);
    } finally {
      setTesting(false);
    }
  };

  // Test a workout reminder (scheduled for 1 minute from now)
  const testWorkoutReminder = async () => {
    if (!notifications.workoutReminders) {
      alert('Workout reminders are disabled. Please enable them in the settings first.');
      return;
    }

    setTesting(true);
    try {
      // Schedule a workout reminder for 1 minute from now
      const workoutTime = new Date(Date.now() + 60 * 1000); // 1 minute from now
      const scheduled = await notificationManager.scheduleWorkoutReminder(
        'Quick Test Workout',
        workoutTime,
        { beforeMinutes: 0 } // Send immediately
      );
      
      if (scheduled) {
        setHasScheduled(true);
        alert('Workout reminder scheduled for 1 minute from now.');
      } else {
        alert('Failed to schedule workout reminder.');
      }
    } catch (error) {
      console.error('Error scheduling workout reminder:', error);
    } finally {
      setTesting(false);
    }
  };

  // Check scheduled notifications
  const checkScheduled = () => {
    setTesting(true);
    try {
      const result = notificationManager.checkScheduledNotifications();
      setHasScheduled(result.remaining > 0);
      alert(`Sent ${result.sent} notifications. ${result.remaining} remaining.`);
    } catch (error) {
      console.error('Error checking scheduled notifications:', error);
    } finally {
      setTesting(false);
    }
  };

  if (notificationPermission === 'denied') {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 text-red-500 mb-3">
          <X className="w-5 h-5" />
          <span className="font-medium">Notifications Blocked</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You've blocked notifications for this site. Please update your browser settings to allow notifications.
        </p>
        <button
          onClick={() => window.open('about:preferences#permissions', '_blank')}
          className="text-sm text-blue-500 hover:underline"
        >
          How to enable notifications
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {notificationPermission !== 'granted' && (
        <div className="p-4 mb-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          <p>You need to grant notification permission to receive notifications.</p>
          <button 
            onClick={requestNotificationPermission}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600 transition-colors"
          >
            Grant Permission
          </button>
        </div>
      )}
      
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 text-green-500 mb-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-medium">Test Push Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={() => testSpecificNotification('workoutReminders')}
              disabled={testing || !notifications.workoutReminders}
              className={`p-2 rounded-lg text-sm ${
                notifications.workoutReminders 
                  ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Workout Reminder
            </button>
            
            <button
              onClick={() => testSpecificNotification('membershipUpdates')}
              disabled={testing || !notifications.membershipUpdates}
              className={`p-2 rounded-lg text-sm ${
                notifications.membershipUpdates 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Membership Update
            </button>
            
            <button
              onClick={() => testSpecificNotification('newFeatures')}
              disabled={testing || !notifications.newFeatures}
              className={`p-2 rounded-lg text-sm ${
                notifications.newFeatures 
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test New Features Alert
            </button>
            
            <button
              onClick={() => testSpecificNotification('progressAlerts')}
              disabled={testing || !notifications.progressAlerts}
              className={`p-2 rounded-lg text-sm ${
                notifications.progressAlerts 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Progress Alert
            </button>
            
            <button
              onClick={() => testSpecificNotification('specialOffers')}
              disabled={testing || !notifications.specialOffers}
              className={`p-2 rounded-lg text-sm ${
                notifications.specialOffers 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Special Offer
            </button>
            
            <button
              onClick={() => testSpecificNotification('waterReminders')}
              disabled={testing || !notifications.waterReminders}
              className={`p-2 rounded-lg text-sm ${
                notifications.waterReminders 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Test Water Reminder
            </button>
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Scheduled Notifications</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={testWorkoutReminder}
                disabled={testing || !notifications.workoutReminders}
                className={`p-2 rounded-lg text-sm ${
                  notifications.workoutReminders 
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                Schedule Workout Reminder (1min)
              </button>
              
              <button
                onClick={checkScheduled}
                disabled={testing || !hasScheduled}
                className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                  hasScheduled 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Scheduled Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTesterPanel; 