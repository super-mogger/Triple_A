import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { format, subDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { checkAttendanceAchievements } from './AchievementService';

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
      const statsRef = collection(db, 'attendanceStats');
      const q = query(statsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
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
        const docRef = await addDoc(statsRef, newStats);
        return { ...newStats, id: docRef.id };
      }

      const data = querySnapshot.docs[0].data() as AttendanceStats;
      return { ...data, id: querySnapshot.docs[0].id };
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  }

  private async updateAttendanceStats(userId: string, isPresent: boolean): Promise<AttendanceStats | null> {
    try {
      const statsRef = collection(db, 'attendanceStats');
      const q = query(statsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const now = Timestamp.now();
      let stats: AttendanceStats;
      let docRef;

      if (querySnapshot.empty) {
        // Create new stats
        const newStats = {
          userId,
          totalPresent: isPresent ? 1 : 0,
          totalAbsent: isPresent ? 0 : 1,
          currentStreak: isPresent ? 1 : 0,
          longestStreak: isPresent ? 1 : 0,
          lastAttendance: isPresent ? now : null,
          lastUpdated: now
        };
        docRef = await addDoc(statsRef, newStats);
        stats = { ...newStats, id: docRef.id };
      } else {
        // Update existing stats
        const doc = querySnapshot.docs[0];
        const existingStats = doc.data() as AttendanceStats;
        
        let newStreak = existingStats.currentStreak;
        if (isPresent) {
          // Check if this is a consecutive day
          if (existingStats.lastAttendance) {
            const lastDate = existingStats.lastAttendance.toDate();
            const today = now.toDate();
            const diffDays = differenceInDays(today, lastDate);
            
            if (diffDays === 1) {
              // Consecutive day
              newStreak++;
            } else if (diffDays > 1) {
              // Streak broken
              newStreak = 1;
            }
          } else {
            // First attendance
            newStreak = 1;
          }
        } else {
          // Absent breaks the streak
          newStreak = 0;
        }

        const updatedStats = {
          totalPresent: existingStats.totalPresent + (isPresent ? 1 : 0),
          totalAbsent: existingStats.totalAbsent + (isPresent ? 0 : 1),
          currentStreak: newStreak,
          longestStreak: Math.max(existingStats.longestStreak, newStreak),
          lastAttendance: isPresent ? now : existingStats.lastAttendance,
          lastUpdated: now
        };

        await updateDoc(doc.ref, updatedStats);
        stats = { ...existingStats, ...updatedStats, id: doc.id };
      }

      return stats;
    } catch (error) {
      console.error('Error updating attendance stats:', error);
      return null;
    }
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
}

export const attendanceService = new AttendanceService(); 