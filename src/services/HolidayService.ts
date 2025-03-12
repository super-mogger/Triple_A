import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy,
  limit 
} from 'firebase/firestore';
import { Holiday } from '../types/holiday';
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// Collection references
const HOLIDAYS_COLLECTION = 'holidays';

/**
 * Get all holidays
 */
export const getAllHolidays = async (): Promise<Holiday[]> => {
  try {
    const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
    const q = query(holidaysRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Holiday));
  } catch (error) {
    console.error('Error getting holidays:', error);
    throw error;
  }
};

/**
 * Get upcoming holidays within the next X days
 */
export const getUpcomingHolidays = async (daysInFuture: number = 30): Promise<Holiday[]> => {
  try {
    const today = new Date();
    const futureDate = addDays(today, daysInFuture);
    
    const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
    const q = query(
      holidaysRef,
      where('date', '>=', Timestamp.fromDate(startOfDay(today))),
      where('date', '<=', Timestamp.fromDate(endOfDay(futureDate))),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Holiday));
  } catch (error) {
    console.error('Error getting upcoming holidays:', error);
    throw error;
  }
};

/**
 * Get the next upcoming holiday
 */
export const getNextHoliday = async (): Promise<Holiday | null> => {
  try {
    const today = new Date();
    
    const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
    const q = query(
      holidaysRef,
      where('date', '>=', Timestamp.fromDate(startOfDay(today))),
      orderBy('date', 'asc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Holiday;
  } catch (error) {
    console.error('Error getting next holiday:', error);
    throw error;
  }
};

/**
 * Check if a specific date is a holiday
 */
export const isHoliday = async (date: Date): Promise<{isHoliday: boolean, holiday: Holiday | null}> => {
  try {
    const targetDay = startOfDay(date);
    const endOfTargetDay = endOfDay(date);
    
    const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
    const q = query(
      holidaysRef,
      where('date', '>=', Timestamp.fromDate(targetDay)),
      where('date', '<=', Timestamp.fromDate(endOfTargetDay))
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { isHoliday: false, holiday: null };
    }
    
    const doc = querySnapshot.docs[0];
    const holiday = {
      id: doc.id,
      ...doc.data()
    } as Holiday;
    
    return { isHoliday: true, holiday };
  } catch (error) {
    console.error('Error checking if date is holiday:', error);
    throw error;
  }
};

/**
 * Add a new holiday
 */
export const addHoliday = async (holiday: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>): Promise<Holiday> => {
  try {
    const now = Timestamp.now();
    const holidayData = {
      ...holiday,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, HOLIDAYS_COLLECTION), holidayData);
    
    return {
      id: docRef.id,
      ...holidayData
    };
  } catch (error) {
    console.error('Error adding holiday:', error);
    throw error;
  }
};

/**
 * Update an existing holiday
 */
export const updateHoliday = async (id: string, holidayData: Partial<Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const holidayRef = doc(db, HOLIDAYS_COLLECTION, id);
    const holidayDoc = await getDoc(holidayRef);
    
    if (!holidayDoc.exists()) {
      throw new Error(`Holiday with ID ${id} does not exist`);
    }
    
    await updateDoc(holidayRef, {
      ...holidayData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

/**
 * Delete a holiday
 */
export const deleteHoliday = async (id: string): Promise<void> => {
  try {
    const holidayRef = doc(db, HOLIDAYS_COLLECTION, id);
    await deleteDoc(holidayRef);
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
}; 