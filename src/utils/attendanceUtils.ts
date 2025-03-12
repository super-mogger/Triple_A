import { isHoliday } from '../services/HolidayService';

// Function to check if a date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Function to check if a date is yesterday
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

// Function to compare two dates (ignoring time)
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

// Convert Firebase timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  
  // If it's already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a number (seconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000);
  }
  
  return new Date();
};

// Check if a date is in a consecutive sequence
export const isDateInSequence = async (date: Date, previousDate: Date): Promise<boolean> => {
  // If dates are the same or if previous date is after current date, not in sequence
  if (isSameDate(date, previousDate) || date.getTime() < previousDate.getTime()) {
    return false;
  }
  
  // Calculate difference in days
  const diffTime = Math.abs(date.getTime() - previousDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If only 1 day apart, they are consecutive
  if (diffDays === 1) {
    return true;
  }
  
  // Check if all days between dates are holidays
  // For each day between previousDate and date, check if it's a holiday
  const daysBetween = diffDays - 1; // exclude previousDate
  
  if (daysBetween === 0) {
    return true;
  }
  
  let allDaysAreHolidays = true;
  const currentDate = new Date(previousDate);
  
  for (let i = 0; i < daysBetween; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Check if current day is a holiday
    const { isHoliday: isDateHoliday } = await isHoliday(currentDate);
    
    if (!isDateHoliday) {
      allDaysAreHolidays = false;
      break;
    }
  }
  
  return allDaysAreHolidays;
};

// Calculate current streak based on attendance dates
export const calculateStreak = async (attendanceDates: Date[]): Promise<number> => {
  if (!attendanceDates || attendanceDates.length === 0) {
    return 0;
  }
  
  // Sort dates in descending order (newest first)
  const sortedDates = [...attendanceDates].sort((a, b) => b.getTime() - a.getTime());
  
  // Check if most recent attendance was today or yesterday, or if days in between were holidays
  const mostRecentDate = sortedDates[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If most recent attendance is neither today nor yesterday, and days in between aren't all holidays
  // then the streak is broken
  if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    // Check if all days between most recent attendance and today are holidays
    const daysAreHolidays = await isDateInSequence(today, mostRecentDate);
    
    if (!daysAreHolidays) {
      return 0; // Streak broken
    }
  }
  
  // Count consecutive days, accounting for holidays
  let streak = 1; // Start with 1 for the most recent attendance
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = sortedDates[i];
    const nextDate = sortedDates[i + 1];
    
    // Check if dates are in sequence (consecutive or only holidays in between)
    const datesInSequence = await isDateInSequence(currentDate, nextDate);
    
    if (datesInSequence) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }
  
  return streak;
}; 