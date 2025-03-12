import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface NotificationSettings {
  workoutReminders: boolean;
  membershipUpdates: boolean;
  newFeatures: boolean;
  progressAlerts: boolean;
  specialOffers: boolean;
  waterReminders: boolean;
}

interface NotificationContextType {
  notifications: NotificationSettings;
  toggleNotification: (key: keyof NotificationSettings) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      workoutReminders: true,
      membershipUpdates: true,
      newFeatures: true,
      progressAlerts: true,
      specialOffers: false,
      waterReminders: true
    };
  });

  const [notificationPermission, setNotificationPermission] = 
    useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
  }, [notifications]);

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast.error('Failed to request notification permission');
        return false;
      }
    }

    toast.error('Notification permission has been denied. Please enable in browser settings.');
    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (
      !('Notification' in window) || 
      notificationPermission !== 'granted'
    ) {
      toast(title);
      return;
    }

    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast(title);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        toggleNotification, 
        notificationPermission,
        requestNotificationPermission,
        sendNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 