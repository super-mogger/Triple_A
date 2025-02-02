import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationSettings {
  workoutReminders: boolean;
  membershipUpdates: boolean;
  newFeatures: boolean;
  progressAlerts: boolean;
  specialOffers: boolean;
}

interface NotificationContextType {
  notifications: NotificationSettings;
  toggleNotification: (key: keyof NotificationSettings) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    workoutReminders: true,
    membershipUpdates: true,
    newFeatures: true,
    progressAlerts: true,
    specialOffers: false
  });

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <NotificationContext.Provider value={{ notifications, toggleNotification }}>
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