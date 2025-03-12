import { toast } from 'react-hot-toast';

// Example notification content for each notification type
const notificationExamples = {
  workoutReminders: {
    title: 'Workout Reminder',
    body: 'Your scheduled workout "Leg Day" starts in 30 minutes!',
    icon: '/logo192.png',
    tag: 'workout-reminder'
  },
  membershipUpdates: {
    title: 'Membership Update',
    body: 'Your premium membership will expire in 5 days. Renew now to avoid interruption.',
    icon: '/logo192.png',
    tag: 'membership-update'
  },
  newFeatures: {
    title: 'New Feature Available',
    body: 'We just released our new workout tracking feature! Check it out now.',
    icon: '/logo192.png',
    tag: 'new-feature'
  },
  progressAlerts: {
    title: 'Progress Milestone',
    body: 'Congratulations! You\'ve completed 10 workouts this month. Keep up the good work!',
    icon: '/logo192.png',
    tag: 'progress-alert'
  },
  specialOffers: {
    title: 'Special Offer',
    body: 'Limited time offer: Get 20% off on annual membership when you upgrade this week!',
    icon: '/logo192.png',
    tag: 'special-offer'
  },
  waterReminders: {
    title: 'Water Reminder',
    body: 'It\'s time to hydrate! You\'ve only reached 40% of your water intake goal today.',
    icon: '/logo192.png',
    tag: 'water-reminder'
  }
};

// Type for notification keys
export type NotificationType = keyof typeof notificationExamples;

/**
 * Test a notification by displaying it using the browser notification API
 * Will fallback to toast notification if permissions not granted
 */
export const testNotification = async (
  type: NotificationType, 
  notificationSystem?: (title: string, options?: NotificationOptions) => void
): Promise<boolean> => {
  const notificationContent = notificationExamples[type];
  
  // If a notification system is provided, use it
  if (notificationSystem) {
    notificationSystem(notificationContent.title, notificationContent);
    toast.success(`Test ${type} notification sent!`);
    return true;
  }
  
  // Otherwise, try to use the browser notification API directly
  if (!('Notification' in window)) {
    toast.error('This browser does not support desktop notifications');
    return false;
  }
  
  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    new Notification(notificationContent.title, notificationContent);
    toast.success(`Test ${type} notification sent!`);
    return true;
  }
  
  // Request permission
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      new Notification(notificationContent.title, notificationContent);
      toast.success(`Test ${type} notification sent!`);
      return true;
    }
  }
  
  // Fallback if permission denied
  toast.error('Notification permission denied. Please enable notifications in your browser settings.');
  return false;
};

/**
 * Check if notifications are supported and permission is granted
 */
export const checkNotificationSupport = async (): Promise<{ 
  supported: boolean; 
  permission: NotificationPermission;
}> => {
  const supported = 'Notification' in window;
  let permission: NotificationPermission = 'default';
  
  if (supported) {
    permission = Notification.permission;
    
    // Try to request permission if not determined yet
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
  }
  
  return { supported, permission };
}; 