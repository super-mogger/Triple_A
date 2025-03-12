import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-hot-toast';

// Type definitions for scheduled notifications
interface ScheduledNotification {
  type: 'workoutReminders' | 'membershipUpdates' | 'newFeatures' | 'progressAlerts' | 'specialOffers' | 'waterReminders';
  userId: string;
  title: string;
  body: string;
  scheduledTime: string;
  tag: string;
  data?: any;
}

/**
 * Hook to manage application notifications
 */
export function useNotificationManager() {
  const { user } = useAuth();
  const { notifications, sendNotification, requestNotificationPermission } = useNotification();

  /**
   * Schedule a workout reminder notification
   */
  const scheduleWorkoutReminder = useCallback(async (
    workoutName: string,
    scheduledTime: Date,
    options?: { beforeMinutes?: number }
  ) => {
    if (!user?.uid) {
      console.error('Cannot schedule workout reminder: No user is signed in');
      return false;
    }
    
    // Check if workout notifications are enabled
    if (!notifications.workoutReminders) {
      return false;
    }

    // Schedule the notification for the specified time
    const beforeMinutes = options?.beforeMinutes || 30; // Default 30 min before
    const notificationTime = new Date(scheduledTime.getTime() - beforeMinutes * 60 * 1000);
    
    // Only schedule if notification time is in the future
    if (notificationTime.getTime() > Date.now()) {
      try {
        // Save to local storage for browser-based scheduling
        const scheduledNotifications: ScheduledNotification[] = JSON.parse(
          localStorage.getItem('scheduledNotifications') || '[]'
        );
        
        // Add this notification
        scheduledNotifications.push({
          type: 'workoutReminders',
          userId: user.uid,
          title: 'Workout Reminder',
          body: `Your ${workoutName} workout starts in ${beforeMinutes} minutes!`,
          scheduledTime: notificationTime.toISOString(),
          tag: `workout-${workoutName.toLowerCase().replace(/\s+/g, '-')}`
        });
        
        // Save back to localStorage
        localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
        
        return true;
      } catch (error) {
        console.error('Error scheduling workout notification:', error);
        return false;
      }
    } else {
      console.log('Notification time is in the past, not scheduling');
      return false;
    }
  }, [user?.uid, notifications.workoutReminders]);

  /**
   * Send a membership update notification
   */
  const sendMembershipNotification = useCallback(async (message: string) => {
    if (!user?.uid) {
      console.error('Cannot send membership notification: No user is signed in');
      return false;
    }
    
    // Check if membership notifications are enabled
    if (!notifications.membershipUpdates) {
      toast(message);
      return false;
    }
    
    try {
      // Ensure we have permission
      if (await requestNotificationPermission()) {
        sendNotification('Membership Update', {
          body: message,
          icon: '/logo192.png',
          tag: 'membership-update'
        });
        return true;
      } else {
        toast(message);
        return false;
      }
    } catch (error) {
      console.error('Error sending membership notification:', error);
      toast(message);
      return false;
    }
  }, [user?.uid, notifications.membershipUpdates, sendNotification, requestNotificationPermission]);

  /**
   * Send a progress achievement notification
   */
  const sendProgressNotification = useCallback(async (
    achievementType: 'workout' | 'weight' | 'attendance' | 'water',
    message: string
  ) => {
    if (!user?.uid) {
      console.error('Cannot send progress notification: No user is signed in');
      return false;
    }
    
    // Check if progress notifications are enabled
    if (!notifications.progressAlerts) {
      toast('🎯 ' + message);
      return false;
    }
    
    try {
      // Ensure we have permission
      if (await requestNotificationPermission()) {
        sendNotification('Progress Milestone', {
          body: message,
          icon: '/logo192.png',
          tag: `progress-${achievementType}`
        });
        return true;
      } else {
        toast('🎯 ' + message);
        return false;
      }
    } catch (error) {
      console.error('Error sending progress notification:', error);
      toast('🎯 ' + message);
      return false;
    }
  }, [user?.uid, notifications.progressAlerts, sendNotification, requestNotificationPermission]);

  /**
   * Send a new feature notification
   */
  const sendFeatureNotification = useCallback(async (
    featureName: string,
    featureDescription: string
  ) => {
    if (!user?.uid) {
      console.error('Cannot send feature notification: No user is signed in');
      return false;
    }
    
    // Check if feature notifications are enabled
    if (!notifications.newFeatures) {
      toast.success(`New Feature: ${featureName} - ${featureDescription}`);
      return false;
    }
    
    try {
      // Ensure we have permission
      if (await requestNotificationPermission()) {
        sendNotification(`New Feature: ${featureName}`, {
          body: featureDescription,
          icon: '/logo192.png',
          tag: `feature-${featureName.toLowerCase().replace(/\s+/g, '-')}`
        });
        return true;
      } else {
        toast.success(`New Feature: ${featureName} - ${featureDescription}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending feature notification:', error);
      toast.success(`New Feature: ${featureName} - ${featureDescription}`);
      return false;
    }
  }, [user?.uid, notifications.newFeatures, sendNotification, requestNotificationPermission]);

  /**
   * Send a special offer notification
   */
  const sendSpecialOfferNotification = useCallback(async (
    offerTitle: string,
    offerDetails: string
  ) => {
    if (!user?.uid) {
      console.error('Cannot send offer notification: No user is signed in');
      return false;
    }
    
    // Check if special offer notifications are enabled
    if (!notifications.specialOffers) {
      return false;
    }
    
    try {
      // Ensure we have permission
      if (await requestNotificationPermission()) {
        sendNotification(`Special Offer: ${offerTitle}`, {
          body: offerDetails,
          icon: '/logo192.png',
          tag: 'special-offer'
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error sending special offer notification:', error);
      return false;
    }
  }, [user?.uid, notifications.specialOffers, sendNotification, requestNotificationPermission]);

  /**
   * Check and send any scheduled notifications
   */
  const checkScheduledNotifications = useCallback(() => {
    try {
      const scheduledNotifications: ScheduledNotification[] = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '[]'
      );
      
      // Only process notifications for the current user
      const userNotifications = scheduledNotifications.filter(
        notification => notification.userId === user?.uid
      );
      
      if (userNotifications.length === 0) {
        return { sent: 0, remaining: 0 };
      }
      
      const now = new Date();
      const updatedNotifications: ScheduledNotification[] = [];
      let notificationsSent = 0;
      
      // Process each scheduled notification
      for (const notification of userNotifications) {
        const scheduledTime = new Date(notification.scheduledTime);
        const notificationType = notification.type;
        
        // If it's time to send and the notification type is enabled
        if (scheduledTime <= now && notifications[notificationType]) {
          // Send the notification
          sendNotification(notification.title, {
            body: notification.body,
            icon: '/logo192.png',
            tag: notification.tag
          });
          
          notificationsSent++;
        } else if (scheduledTime > now) {
          // Keep future notifications
          updatedNotifications.push(notification);
        }
      }
      
      // Filter out the processed user notifications
      const otherNotifications = scheduledNotifications.filter(
        notification => notification.userId !== user?.uid
      );
      
      // Save the updated list back to localStorage
      localStorage.setItem('scheduledNotifications', 
        JSON.stringify([...otherNotifications, ...updatedNotifications])
      );
      
      return { sent: notificationsSent, remaining: updatedNotifications.length };
    } catch (error) {
      console.error('Error checking scheduled notifications:', error);
      return { sent: 0, remaining: 0, error };
    }
  }, [user?.uid, notifications, sendNotification]);

  return {
    scheduleWorkoutReminder,
    sendMembershipNotification,
    sendProgressNotification,
    sendFeatureNotification,
    sendSpecialOfferNotification,
    checkScheduledNotifications
  };
} 