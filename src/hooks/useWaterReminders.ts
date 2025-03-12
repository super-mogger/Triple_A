import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  getWaterReminderSettings,
  shouldSendReminder,
  getWaterReminderMessage,
  markReminderSent,
  updateWaterReminderSettings
} from '../services/WaterReminderService';

// Check interval for reminders (in milliseconds)
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

// Define type for reminder setting updates
type ReminderSettingsUpdate = Partial<{
  enabled: boolean;
  interval: number;
  startTime: string;
  endTime: string;
}>;

export function useWaterReminders() {
  const { user } = useAuth();
  const { notifications, sendNotification, requestNotificationPermission } = useNotification();
  const [isInitialized, setIsInitialized] = useState(false);
  const checkIntervalRef = useRef<number | null>(null);
  const settings = getWaterReminderSettings();
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }
    };
  }, []);
  
  // Initialize reminders when component mounts and user is logged in
  useEffect(() => {
    if (user?.uid && notifications.waterReminders && !isInitialized) {
      initializeReminders();
      setIsInitialized(true);
    }
    
    // Pause reminders if they get disabled
    if (!notifications.waterReminders && checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, [user?.uid, notifications.waterReminders, isInitialized]);
  
  // Initialize water reminder interval
  const initializeReminders = useCallback(async () => {
    // First request permission
    const permissionGranted = await requestNotificationPermission();
    
    if (!permissionGranted) {
      console.log('Water reminders require notification permission');
      return;
    }
    
    // Clear any existing interval
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
    }
    
    // Initial check
    checkAndSendReminder();
    
    // Set up interval for regular checks
    checkIntervalRef.current = window.setInterval(() => {
      checkAndSendReminder();
    }, CHECK_INTERVAL);
    
    // Also check on visibility change (when user returns to the tab)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.uid]);
  
  // Handle when the user comes back to the app
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && user?.uid && notifications.waterReminders) {
      checkAndSendReminder();
    }
  }, [user?.uid, notifications.waterReminders]);
  
  // Check and send a reminder if conditions are met
  const checkAndSendReminder = useCallback(async () => {
    if (!user?.uid || !notifications.waterReminders) return;
    
    if (shouldSendReminder(user.uid)) {
      const message = await getWaterReminderMessage(user.uid);
      
      sendNotification('Water Reminder', {
        body: message,
        icon: '/logo192.png', // Replace with your app's icon path
        badge: '/badge.png', // Optional smaller icon for notifications
        tag: 'water-reminder', // Groups similar notifications
        // Chrome/Firefox specific options omitted to avoid TypeScript errors
      });
      
      markReminderSent();
    }
  }, [user?.uid, notifications.waterReminders, sendNotification]);
  
  // Manually trigger a reminder
  const sendWaterReminder = useCallback(async () => {
    if (!user?.uid) return;
    
    const message = await getWaterReminderMessage(user.uid);
    
    sendNotification('Water Reminder', {
      body: message,
      icon: '/logo192.png',
      tag: 'water-reminder',
    });
    
    markReminderSent();
  }, [user?.uid, sendNotification]);
  
  // Update reminder settings
  const updateReminderSettings = useCallback((updates: ReminderSettingsUpdate) => {
    const newSettings = updateWaterReminderSettings(updates);
    
    // Restart reminder checks if the reminder was enabled
    if (updates.enabled && updates.enabled !== settings.enabled) {
      setIsInitialized(false); // This will trigger reinitializing in the useEffect
    }
    
    return newSettings;
  }, [settings]);
  
  return {
    reminderSettings: settings,
    updateReminderSettings,
    sendWaterReminder,
    isInitialized,
    initializeReminders
  };
}

/**
 * Hook to initialize water reminders in the app 
 */
export function useInitializeWaterReminders() {
  const { user } = useAuth();
  const { notifications } = useNotification();
  const { initializeReminders } = useWaterReminders();
  
  // Initialize reminders when the app starts if user has enabled them
  useEffect(() => {
    if (user?.uid && notifications.waterReminders) {
      initializeReminders();
    }
  }, [user?.uid, notifications.waterReminders, initializeReminders]);
  
  return null;
} 