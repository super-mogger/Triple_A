import { getAuth } from 'firebase/auth';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-hot-toast';

// Type definitions for notification scheduling
interface NotificationScheduleOptions {
  time?: Date;
  delayInMinutes?: number;
  recurring?: boolean;
  intervalInHours?: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

// Workout notification helper functions
export const scheduleWorkoutReminder = async (
  workoutName: string,
  scheduledTime: Date,
  userId?: string,
  options?: { beforeMinutes?: number }
) => {
  const auth = getAuth();
  const user = auth.currentUser || { uid: userId };
  
  if (!user?.uid) {
    console.error('Cannot schedule workout reminder: No user is signed in');
    return;
  }
  
  // Schedule the notification for the specified time
  const beforeMinutes = options?.beforeMinutes || 30; // Default 30 min before
  const notificationTime = new Date(scheduledTime.getTime() - beforeMinutes * 60 * 1000);
  
  // Only schedule if notification time is in the future
  if (notificationTime.getTime() > Date.now()) {
    try {
      // Save to local storage for browser-based scheduling
      const scheduledNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '[]'
      );
      
      // Add this notification
      scheduledNotifications.push({
        type: 'workoutReminders',
        userId: user.uid,
        title: 'Workout Reminder',
        body: `Your ${workoutName} workout starts in ${beforeMinutes} minutes!`,
        scheduledTime: notificationTime.toISOString(),
        workoutName,
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
};

// Membership notification helper functions
export const sendMembershipNotification = async (
  message: string,
  userId?: string
) => {
  const auth = getAuth();
  const user = auth.currentUser || { uid: userId };
  
  if (!user?.uid) {
    console.error('Cannot send membership notification: No user is signed in');
    return;
  }
  
  try {
    // Get the notification context
    const { notifications, sendNotification } = useNotification();
    
    // Only send if membership notifications are enabled
    if (notifications.membershipUpdates) {
      sendNotification('Membership Update', {
        body: message,
        icon: '/logo192.png',
        tag: 'membership-update'
      });
      return true;
    } else {
      // Fall back to toast if notifications not enabled
      toast(message);
      return false;
    }
  } catch (error) {
    console.error('Error sending membership notification:', error);
    toast(message);
    return false;
  }
};

// Progress notification helper functions
export const sendProgressNotification = async (
  achievementType: 'workout' | 'weight' | 'attendance' | 'water',
  message: string,
  userId?: string
) => {
  const auth = getAuth();
  const user = auth.currentUser || { uid: userId };
  
  if (!user?.uid) {
    console.error('Cannot send progress notification: No user is signed in');
    return;
  }
  
  try {
    // Get the notification context
    const { notifications, sendNotification } = useNotification();
    
    // Only send if progress notifications are enabled
    if (notifications.progressAlerts) {
      sendNotification('Progress Milestone', {
        body: message,
        icon: '/logo192.png',
        tag: `progress-${achievementType}`
      });
      return true;
    } else {
      // Fall back to toast if notifications not enabled
      toast('🎯 ' + message);
      return false;
    }
  } catch (error) {
    console.error('Error sending progress notification:', error);
    toast('🎯 ' + message);
    return false;
  }
};

// Feature notification helper
export const sendFeatureNotification = async (
  featureName: string,
  featureDescription: string,
  userId?: string
) => {
  const auth = getAuth();
  const user = auth.currentUser || { uid: userId };
  
  if (!user?.uid) {
    console.error('Cannot send feature notification: No user is signed in');
    return;
  }
  
  try {
    // Get the notification context
    const { notifications, sendNotification } = useNotification();
    
    // Only send if feature notifications are enabled
    if (notifications.newFeatures) {
      sendNotification(`New Feature: ${featureName}`, {
        body: featureDescription,
        icon: '/logo192.png',
        tag: `feature-${featureName.toLowerCase().replace(/\s+/g, '-')}`
      });
      return true;
    } else {
      // Fall back to toast if notifications not enabled
      toast.success(`New Feature: ${featureName} - ${featureDescription}`);
      return false;
    }
  } catch (error) {
    console.error('Error sending feature notification:', error);
    toast.success(`New Feature: ${featureName} - ${featureDescription}`);
    return false;
  }
};

// Special offers notification helper
export const sendSpecialOfferNotification = async (
  offerTitle: string,
  offerDetails: string,
  userId?: string
) => {
  const auth = getAuth();
  const user = auth.currentUser || { uid: userId };
  
  if (!user?.uid) {
    console.error('Cannot send offer notification: No user is signed in');
    return;
  }
  
  try {
    // Get the notification context
    const { notifications, sendNotification } = useNotification();
    
    // Only send if special offer notifications are enabled
    if (notifications.specialOffers) {
      sendNotification(`Special Offer: ${offerTitle}`, {
        body: offerDetails,
        icon: '/logo192.png',
        tag: 'special-offer'
      });
      return true;
    } else {
      // No fallback for special offers as they're promotional
      return false;
    }
  } catch (error) {
    console.error('Error sending special offer notification:', error);
    return false;
  }
};

// Check and send any scheduled notifications
// This should be called when the app initializes and periodically
export const checkScheduledNotifications = () => {
  try {
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduledNotifications') || '[]'
    );
    
    const now = new Date();
    const updatedNotifications = [];
    let notificationsSent = 0;
    
    // Get the notification context
    const { notifications, sendNotification } = useNotification();
    
    // Process each scheduled notification
    for (const notification of scheduledNotifications) {
      const scheduledTime = new Date(notification.scheduledTime);
      
      // If it's time to send and the notification type is enabled
      if (scheduledTime <= now && notifications[notification.type]) {
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
    
    // Save the updated list back to localStorage
    localStorage.setItem('scheduledNotifications', JSON.stringify(updatedNotifications));
    
    return { sent: notificationsSent, remaining: updatedNotifications.length };
  } catch (error) {
    console.error('Error checking scheduled notifications:', error);
    return { sent: 0, remaining: 0, error };
  }
}; 