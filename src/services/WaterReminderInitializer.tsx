import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; 
import {
  shouldSendReminder,
  getWaterReminderMessage,
  markReminderSent,
  getWaterReminderSettings
} from './WaterReminderService';

// Check interval for reminders (in milliseconds)
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

/**
 * A component that handles water reminder initialization
 * Add this once in your app (typically in App.tsx) 
 */
const WaterReminderInitializer: React.FC = () => {
  const { user } = useAuth();
  const { notifications, sendNotification } = useNotification();
  const checkIntervalRef = useRef<number | null>(null);
  const visibilityListenerRef = useRef<boolean>(false);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      if (visibilityListenerRef.current) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        visibilityListenerRef.current = false;
      }
    };
  }, []);
  
  // Initialize/cleanup reminders when user or notification settings change
  useEffect(() => {
    if (user?.uid && notifications.waterReminders) {
      startReminderChecks();
    } else {
      // Clean up if user logs out or reminders are disabled
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [user?.uid, notifications.waterReminders]);
  
  // Start checking for reminders
  const startReminderChecks = () => {
    // Clean up existing interval if any
    if (checkIntervalRef.current) {
      window.clearInterval(checkIntervalRef.current);
    }
    
    // Do initial check
    checkAndSendReminder();
    
    // Set up interval
    checkIntervalRef.current = window.setInterval(() => {
      checkAndSendReminder();
    }, CHECK_INTERVAL);
    
    // Add visibility listener if not already added
    if (!visibilityListenerRef.current) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerRef.current = true;
    }
  };
  
  // Check visibility changes (when user returns to the tab)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && user?.uid && notifications.waterReminders) {
      checkAndSendReminder();
    }
  };
  
  // Check if reminder should be sent and send it
  const checkAndSendReminder = async () => {
    if (!user?.uid || !notifications.waterReminders) return;
    
    const settings = getWaterReminderSettings();
    if (!settings.enabled) return;
    
    if (shouldSendReminder(user.uid)) {
      try {
        const message = await getWaterReminderMessage(user.uid);
        
        sendNotification('Water Reminder', {
          body: message,
          icon: '/logo192.png',
          tag: 'water-reminder',
        });
        
        markReminderSent();
      } catch (error) {
        console.error('Error sending water reminder:', error);
      }
    }
  };
  
  // This component doesn't render anything
  return null;
};

export default WaterReminderInitializer; 