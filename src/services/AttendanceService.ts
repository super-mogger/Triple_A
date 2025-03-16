import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, deleteDoc, onSnapshot, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { format, subDays, differenceInDays, startOfDay, endOfDay, isSameDay, isWithinInterval } from 'date-fns';
import { checkAttendanceAchievements } from './AchievementService';
import { isHoliday } from './HolidayService';

export interface AttendanceStats {
  id?: string;
  userId: string;
  totalPresent: number;
  totalAbsent: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: Timestamp | null;
  lastUpdated: Timestamp;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  date: Timestamp;
  time: string;
  status: 'present' | 'absent';
  createdAt: Timestamp;
}

const LOCAL_STORAGE_KEY = 'recentAttendance';

class AttendanceService {
  private recentAttendance: AttendanceRecord[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.recentAttendance = parsed.map((record: any) => {
          // Check if the date and createdAt are Timestamp objects or numbers
          const dateSeconds = record.date?._seconds || record.date?.seconds;
          const createdAtSeconds = record.createdAt?._seconds || record.createdAt?.seconds;

          if (!dateSeconds || !createdAtSeconds) {
            // If we can't get valid timestamps, clear storage and return empty
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return null;
          }

          return {
            ...record,
            date: new Timestamp(dateSeconds, 0),
            createdAt: new Timestamp(createdAtSeconds, 0)
          };
        }).filter(Boolean); // Remove any null values
      } catch (error) {
        console.error('Error parsing stored attendance:', error);
        // Clear invalid data
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        this.recentAttendance = [];
      }
    }
  }

  private saveToLocalStorage() {
    try {
      const dataToStore = this.recentAttendance.map(record => ({
        ...record,
        date: { seconds: record.date.seconds, nanoseconds: record.date.nanoseconds },
        createdAt: { seconds: record.createdAt.seconds, nanoseconds: record.createdAt.nanoseconds }
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  setupRealtimeListener(userId: string) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const record = {
              id: change.doc.id,
              userId: data.userId,
              date: data.date,
              time: data.time,
              status: data.status,
              createdAt: data.createdAt
            } as AttendanceRecord;
            
            this.addToRecentAttendance(record);
          }
        });
      }, (error) => {
        console.error('Error in realtime listener:', error);
      });
    } catch (error) {
      console.error('Error setting up realtime listener:', error);
    }
  }

  private addToRecentAttendance(record: AttendanceRecord) {
    // Check if record already exists
    const exists = this.recentAttendance.some(r => r.id === record.id);
    if (exists) return;

    // Add to recent attendance and keep only last 10
    this.recentAttendance.unshift(record);
    if (this.recentAttendance.length > 10) {
      this.recentAttendance.pop();
    }
    this.saveToLocalStorage();
  }

  getRecentAttendance(): AttendanceRecord[] {
    try {
      // Validate timestamps before returning
      return this.recentAttendance.filter(record => {
        return record.date instanceof Timestamp && record.createdAt instanceof Timestamp;
      });
    } catch (error) {
      console.error('Error getting recent attendance:', error);
      return [];
    }
  }

  async markAttendance(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const today = new Date();
      const todayStart = startOfDay(today);

      // Check if attendance already marked
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(todayStart)),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { success: false, message: 'Attendance already marked for today' };
      }

      // Add attendance record
      const now = Timestamp.now();
      const attendanceRecord = {
        userId,
        date: now,
        time: format(now.toDate(), 'HH:mm:ss'),
        status: 'present' as const,
        createdAt: now
      };

      const docRef = await addDoc(attendanceRef, attendanceRecord);
      const recordWithId = { ...attendanceRecord, id: docRef.id };
      
      // Add to recent attendance
      this.addToRecentAttendance(recordWithId);

      // Update attendance stats
      const stats = await this.updateAttendanceStats(userId, true);

      // Check for achievements if stats were updated
      if (stats) {
        const { updated } = checkAttendanceAchievements(stats.totalPresent, stats.currentStreak);
        if (updated) {
          // You could add a toast notification here if you want to show achievement unlocks
        }
      }

      // Clean up old records
      await this.cleanupOldRecords(userId);

      return { success: true, message: 'Attendance marked successfully' };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, message: 'Failed to mark attendance' };
    }
  }

  async getAttendanceRecords(userId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: AttendanceRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          userId: data.userId,
          date: data.date,
          time: data.time,
          status: data.status,
          createdAt: data.createdAt
        });
      });
      
      return records;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  }

  async getAttendanceStats(userId: string): Promise<AttendanceStats | null> {
    try {
      // First, try to get stats using userId as document ID
      const statsByIdRef = doc(db, 'attendanceStats', userId);
      const statsByIdDoc = await getDoc(statsByIdRef);
      
      if (statsByIdDoc.exists()) {
        // Found stats using userId as document ID
        const data = statsByIdDoc.data() as AttendanceStats;
        return { ...data, id: userId };
      }
      
      // If not found, search by userId field
      const statsRef = collection(db, 'attendanceStats');
      const q = query(statsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No stats found, create a new document using userId as document ID
        const now = Timestamp.now();
        const newStats: AttendanceStats = {
          userId,
          totalPresent: 0,
          totalAbsent: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastAttendance: null,
          lastUpdated: now
        };
        
        await setDoc(statsByIdRef, newStats);
        return { ...newStats, id: userId };
      }
      
      // Found stats by userId field, migrate it to use userId as document ID
      const oldDoc = querySnapshot.docs[0];
      const data = oldDoc.data() as AttendanceStats;
      
      // If the document ID doesn't match userId, migrate it
      if (oldDoc.id !== userId) {
        console.log(`Migrating stats from ${oldDoc.id} to ${userId}`);
        
        // Create new document with userId as ID
        await setDoc(statsByIdRef, data);
        
        // Delete the old document
        await deleteDoc(oldDoc.ref);
        
        return { ...data, id: userId };
      }
      
      return { ...data, id: oldDoc.id };
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  }

  /**
   * Calculate streak while accounting for holidays
   */
  private async calculateStreakWithHolidays(attendanceRecords: any[]): Promise<number> {
    try {
      if (attendanceRecords.length === 0) return 0;
      
      // Sort by date (newest first)
      const sortedRecords = [...attendanceRecords].sort((a, b) => 
        b.date.toDate().getTime() - a.date.toDate().getTime()
      );
      
      let streakCount = 0;
      let currentDate = new Date();
      let lastAttendanceDate = sortedRecords[0].date.toDate();
      
      // If the last attendance wasn't today, check if we have attendance today
      if (!isSameDay(currentDate, lastAttendanceDate)) {
        // Check if today is a holiday
        const todayHolidayCheck = await isHoliday(currentDate);
        if (!todayHolidayCheck.isHoliday) {
          // If not a holiday and no attendance today, break the streak
          return 0;
        }
        // If today is a holiday, continue checking streak
      }
      
      streakCount = 1; // Start with 1 for today/last attendance
      
      // Check previous days
      let checkDate = subDays(lastAttendanceDate, 1);
      let foundGap = false;
      
      while (!foundGap) {
        // Check if the day was a holiday
        const holidayCheck = await isHoliday(checkDate);
        
        if (holidayCheck.isHoliday) {
          // If it's a holiday, it counts for the streak
          streakCount++;
          checkDate = subDays(checkDate, 1);
          continue;
        }
        
        // Check if there was attendance on this day
        const hasAttendance = sortedRecords.some(record => 
          isSameDay(record.date.toDate(), checkDate)
        );
        
        if (hasAttendance) {
          streakCount++;
          checkDate = subDays(checkDate, 1);
        } else {
          foundGap = true;
        }
      }
      
      return streakCount;
    } catch (error) {
      console.error('Error calculating streak with holidays:', error);
      return 0;
    }
  }

  // Update the existing updateAttendanceStats to use the new streak calculation
  private async updateAttendanceStats(userId: string, isPresent: boolean): Promise<AttendanceStats | null> {
    try {
      const now = Timestamp.now();
      
      // Use userId as document ID to ensure consistent stats updating
      const statsDocRef = doc(db, 'attendanceStats', userId);
      const statsDoc = await getDocs(query(collection(db, 'attendanceStats'), where('userId', '==', userId)));
      let stats: AttendanceStats;

      if (statsDoc.empty) {
        // Create new stats document with user ID as document ID
        const newStats = {
          userId,
          totalPresent: isPresent ? 1 : 0,
          totalAbsent: isPresent ? 0 : 1,
          currentStreak: isPresent ? 1 : 0,
          longestStreak: isPresent ? 1 : 0,
          lastAttendance: isPresent ? now : null,
          lastUpdated: now
        };
        
        // Use setDoc instead of addDoc to specify the document ID
        await setDoc(statsDocRef, newStats);
        stats = { ...newStats, id: userId };
        console.log('Created new attendance stats with ID:', userId);
      } else {
        // Update existing stats
        const existingDoc = statsDoc.docs[0];
        const existingStats = existingDoc.data() as AttendanceStats;
        const existingDocId = existingDoc.id;
        
        // If this is a different document ID than the user ID, we need to migrate
        if (existingDocId !== userId) {
          console.log(`Migrating stats from ${existingDocId} to ${userId}`);
          
          // If marking absent, immediately reset streak to 0
          if (!isPresent) {
            const updatedStats = {
              userId,
              totalPresent: existingStats.totalPresent,
              totalAbsent: existingStats.totalAbsent + 1,
              currentStreak: 0, // Reset streak on absence
              longestStreak: existingStats.longestStreak,
              lastAttendance: existingStats.lastAttendance,
              lastUpdated: now
            };
            
            // Create a new document with userId as ID
            await setDoc(statsDocRef, updatedStats);
            
            // Delete the old document
            await deleteDoc(doc(db, 'attendanceStats', existingDocId));
            
            stats = { ...updatedStats, id: userId };
            return stats;
          }
          
          // Get all attendance records for the last few days
          const attendanceRef = collection(db, 'attendance');
          const lastWeekDate = new Date();
          lastWeekDate.setDate(lastWeekDate.getDate() - 30); // Look back further for holidays
          
          const attendanceQuery = query(
            attendanceRef,
            where('userId', '==', userId),
            where('date', '>=', Timestamp.fromDate(lastWeekDate)),
            orderBy('date', 'desc')
          );
          
          const attendanceSnapshot = await getDocs(attendanceQuery);
          const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
            date: doc.data().date,
            status: doc.data().status
          }));

          // Calculate streak taking holidays into account
          let streakCount = await this.calculateStreakWithHolidays(attendanceRecords);
          
          const updatedStats = {
            userId,
            totalPresent: existingStats.totalPresent + 1,
            totalAbsent: existingStats.totalAbsent,
            currentStreak: streakCount,
            longestStreak: Math.max(streakCount, existingStats.longestStreak),
            lastAttendance: now,
            lastUpdated: now
          };

          // Create new document with userId as ID
          await setDoc(statsDocRef, updatedStats);
          
          // Delete the old document
          await deleteDoc(doc(db, 'attendanceStats', existingDocId));
          
          stats = { ...updatedStats, id: userId };
        } else {
          // Normal update to existing document with correct ID
          // If marking absent, immediately reset streak to 0
          if (!isPresent) {
            const updatedStats = {
              totalPresent: existingStats.totalPresent,
              totalAbsent: existingStats.totalAbsent + 1,
              currentStreak: 0, // Reset streak on absence
              longestStreak: existingStats.longestStreak,
              lastAttendance: existingStats.lastAttendance,
              lastUpdated: now
            };
            await updateDoc(existingDoc.ref, updatedStats);
            stats = { ...updatedStats, id: existingDocId, userId };
            return stats;
          }

          // Get all attendance records for the last few days
          const attendanceRef = collection(db, 'attendance');
          const lastWeekDate = new Date();
          lastWeekDate.setDate(lastWeekDate.getDate() - 30); // Look back further for holidays
          
          const attendanceQuery = query(
            attendanceRef,
            where('userId', '==', userId),
            where('date', '>=', Timestamp.fromDate(lastWeekDate)),
            orderBy('date', 'desc')
          );
          
          const attendanceSnapshot = await getDocs(attendanceQuery);
          const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
            date: doc.data().date,
            status: doc.data().status
          }));

          // Calculate streak taking holidays into account
          let streakCount = await this.calculateStreakWithHolidays(attendanceRecords);

          const updatedStats = {
            totalPresent: existingStats.totalPresent + 1,
            totalAbsent: existingStats.totalAbsent,
            currentStreak: streakCount,
            longestStreak: Math.max(streakCount, existingStats.longestStreak),
            lastAttendance: now,
            lastUpdated: now
          };

          await updateDoc(existingDoc.ref, updatedStats);
          stats = { ...updatedStats, id: existingDocId, userId };
        }
      }

      return stats;
    } catch (error) {
      console.error('Error updating attendance stats:', error);
      return null;
    }
  }
  
  // Helper function to check for absences between two dates
  private checkForAbsences(startDate: Date, endDate: Date, records: any[]): boolean {
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (currentDate < end) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Skip Sundays
      if (currentDate.getDay() === 0) continue;
      
      // Check if we have a record for this date
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const hasAttendance = records.some(record => {
        const recordDate = format(record.date.toDate(), 'yyyy-MM-dd');
        return recordDate === dateStr;
      });

      // If we don't have attendance for a working day, it's an absence
      if (!hasAttendance && currentDate < end) {
        return true;
      }
    }

    return false;
  }

  // Helper function to calculate working days difference (excluding Sundays)
  private getWorkingDaysDifference(startDate: Date, endDate: Date): number {
    let days = 0;
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (currentDate < end) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0) { // Skip Sundays
        days++;
      }
    }

    return days;
  }

  private async cleanupOldRecords(userId: string) {
    try {
      const cutoffDate = subDays(new Date(), 100);
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('date', '<=', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up old records:', error);
    }
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Force recalculation of attendance stats for a specific user
   * This can be used to fix stats that aren't updating properly
   */
  async forceRecalculateStats(userId: string): Promise<AttendanceStats | null> {
    try {
      console.log('Force recalculating stats for user:', userId);
      
      // Get all attendance records for this user
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const attendanceRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      
      console.log(`Found ${attendanceRecords.length} attendance records`);
      
      if (attendanceRecords.length === 0) {
        // No attendance records, create empty stats
        const statsRef = doc(db, 'attendanceStats', userId);
        const newStats: any = {
          userId,
          totalPresent: 0,
          totalAbsent: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastAttendance: null,
          lastUpdated: Timestamp.now(),
          // Add extra stats displayed in the UI
          totalVisits: 0,
          thisMonth: 0,
          daysRemainingThisMonth: 0,
          firstVisitDate: null
        };
        
        await setDoc(statsRef, newStats);
        console.log('Created new empty stats');
        return { ...newStats, id: userId };
      }
      
      // Calculate stats based on records
      let totalPresent = attendanceRecords.filter(r => r.status === 'present').length;
      let totalAbsent = attendanceRecords.filter(r => r.status === 'absent').length;
      
      // Sort by date (newest first)
      const sortedRecords = [...attendanceRecords].sort((a, b) => 
        b.date.toDate().getTime() - a.date.toDate().getTime()
      );
      
      // Get the most recent attendance
      const lastAttendance = sortedRecords.length > 0 ? sortedRecords[0].date : null;
      
      // Calculate current streak
      const streakCount = await this.calculateStreakWithHolidays(sortedRecords);
      
      // Calculate longest streak by testing each possible starting point
      let longestStreak = streakCount;
      
      // Regroup attendance records by date (YYYY-MM-DD format) for easier streak calculation
      const attendanceByDate: { [key: string]: boolean } = {};
      attendanceRecords.forEach(record => {
        if (record.status === 'present') {
          const dateStr = format(record.date.toDate(), 'yyyy-MM-dd');
          attendanceByDate[dateStr] = true;
        }
      });
      
      // Get all dates with attendance
      const attendanceDates = Object.keys(attendanceByDate).map(date => new Date(date));
      attendanceDates.sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
      
      // Find longest consecutive streak
      if (attendanceDates.length > 0) {
        let currentStreak = 1;
        let maxStreak = 1;
        
        for (let i = 1; i < attendanceDates.length; i++) {
          const prevDate = new Date(attendanceDates[i-1]);
          const currDate = new Date(attendanceDates[i]);
          
          // Check if dates are consecutive or only have holidays between them
          const expectedNextDay = new Date(prevDate);
          expectedNextDay.setDate(expectedNextDay.getDate() + 1);
          
          if (differenceInDays(currDate, prevDate) === 1) {
            // Consecutive days
            currentStreak++;
          } else {
            // Check if all days between are holidays
            let allHolidays = true;
            const checkDate = new Date(prevDate);
            
            while (differenceInDays(currDate, checkDate) > 1) {
              checkDate.setDate(checkDate.getDate() + 1);
              const dateHolidayCheck = await isHoliday(checkDate);
              
              if (!dateHolidayCheck.isHoliday) {
                allHolidays = false;
                break;
              }
            }
            
            if (allHolidays) {
              // If all days between are holidays, continue the streak
              currentStreak++;
            } else {
              // Streak broken, reset counter
              maxStreak = Math.max(maxStreak, currentStreak);
              currentStreak = 1;
            }
          }
          
          maxStreak = Math.max(maxStreak, currentStreak);
        }
        
        longestStreak = Math.max(longestStreak, maxStreak);
      }
      
      // Additional stats for UI display
      
      // Total visits (same as totalPresent)
      const totalVisits = totalPresent;
      
      // Find first visit date (oldest record)
      const oldestRecord = [...attendanceRecords].sort((a, b) => 
        a.date.toDate().getTime() - b.date.toDate().getTime()
      )[0];
      const firstVisitDate = oldestRecord ? oldestRecord.date : null;
      
      // Calculate this month's attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = attendanceRecords.filter(record => {
        const recordDate = record.date.toDate();
        return recordDate >= startOfMonth && 
               record.status === 'present';
      }).length;
      
      // Calculate days remaining in month
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const daysRemainingThisMonth = Math.max(0, daysInMonth - now.getDate() + 1);
      
      // Get or create stats document
      const statsRef = doc(db, 'attendanceStats', userId);
      
      // Create updated stats with additional fields
      const updatedStats: any = {
        userId,
        totalPresent,
        totalAbsent,
        currentStreak: streakCount,
        longestStreak,
        lastAttendance,
        lastUpdated: Timestamp.now(),
        // Additional stats for UI
        totalVisits,
        thisMonth,
        daysRemainingThisMonth,
        firstVisitDate
      };
      
      // Save to Firestore
      await setDoc(statsRef, updatedStats);
      
      console.log('Successfully recalculated stats:', {
        totalPresent,
        totalAbsent,
        currentStreak: streakCount,
        longestStreak,
        totalVisits,
        thisMonth
      });
      
      return { ...updatedStats, id: userId };
    } catch (error) {
      console.error('Error force recalculating stats:', error);
      return null;
    }
  }
}

export const attendanceService = new AttendanceService(); 