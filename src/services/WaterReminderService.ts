import { getWaterIntake } from './WaterIntakeService';

// Interval between reminders in minutes
const DEFAULT_REMINDER_INTERVAL = 60; // Default to hourly reminders
const MIN_REMINDER_INTERVAL = 30; // Minimum 30 minutes between reminders
const STORAGE_KEY = 'waterReminderSettings';

interface WaterReminderSettings {
  enabled: boolean;
  interval: number; // in minutes
  startTime: string; // HH:MM format, e.g. "08:00"
  endTime: string; // HH:MM format, e.g. "22:00"
  lastReminderTimestamp: number | null;
}

/**
 * Get stored water reminder settings or defaults
 */
export const getWaterReminderSettings = (): WaterReminderSettings => {
  const storedSettings = localStorage.getItem(STORAGE_KEY);
  
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  
  return {
    enabled: true,
    interval: DEFAULT_REMINDER_INTERVAL,
    startTime: "08:00", // 8 AM default
    endTime: "22:00", // 10 PM default
    lastReminderTimestamp: null
  };
};

/**
 * Save water reminder settings
 */
export const saveWaterReminderSettings = (settings: WaterReminderSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

/**
 * Check if a reminder should be sent now based on settings and last reminder time
 */
export const shouldSendReminder = (userId: string): boolean => {
  const settings = getWaterReminderSettings();
  
  // Don't send if reminders are disabled
  if (!settings.enabled) {
    return false;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // Check if current time is within reminder window
  if (currentTimeStr < settings.startTime || currentTimeStr > settings.endTime) {
    return false;
  }
  
  // Check if enough time has passed since the last reminder
  if (settings.lastReminderTimestamp) {
    const timeSinceLastReminder = Date.now() - settings.lastReminderTimestamp;
    const minimumInterval = settings.interval * 60 * 1000; // Convert to milliseconds
    
    if (timeSinceLastReminder < minimumInterval) {
      return false;
    }
  }
  
  return true;
};

/**
 * Calculate a personalized message based on the user's current water intake
 */
export const getWaterReminderMessage = async (userId: string): Promise<string> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const waterIntake = await getWaterIntake(userId, today);
    const percentage = Math.min((waterIntake.amount / waterIntake.goal) * 100, 100);
    
    if (percentage >= 100) {
      return "Great job! You've already met your water intake goal for today.";
    } else if (percentage >= 75) {
      return "You're doing great! Just a bit more water to reach your daily goal.";
    } else if (percentage >= 50) {
      return "You're halfway to your water intake goal. Keep it up!";
    } else if (percentage >= 25) {
      return "Don't forget to stay hydrated. You still need more water today.";
    } else {
      return "Time to hydrate! You've only had a small portion of your daily water goal.";
    }
  } catch (error) {
    console.error("Error getting water intake for reminder message:", error);
    return "Don't forget to stay hydrated! Time for some water.";
  }
};

/**
 * Mark that a reminder was sent now
 */
export const markReminderSent = (): void => {
  const settings = getWaterReminderSettings();
  settings.lastReminderTimestamp = Date.now();
  saveWaterReminderSettings(settings);
};

/**
 * Update water reminder settings
 */
export const updateWaterReminderSettings = (
  updates: Partial<Omit<WaterReminderSettings, 'lastReminderTimestamp'>>
): WaterReminderSettings => {
  const currentSettings = getWaterReminderSettings();
  const newSettings = {
    ...currentSettings,
    ...updates,
    // Enforce minimum interval
    interval: updates.interval ? 
      Math.max(updates.interval, MIN_REMINDER_INTERVAL) : 
      currentSettings.interval
  };
  
  saveWaterReminderSettings(newSettings);
  return newSettings;
}; 