import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  updateDoc,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';

interface WaterIntake {
  userId: string;
  date: string;
  amount: number;
  goal: number;
  lastUpdated: Timestamp;
  history: {
    time: Timestamp;
    amount: number;
  }[];
}

export const getWaterIntake = async (userId: string, date: string) => {
  try {
    console.log('Getting water intake for user:', userId, 'date:', date);
    
    // First try to get the document using userId as part of the document ID
    const intakeRef = doc(db, 'waterIntake', `${userId}_${date}`);
    const intakeDoc = await getDoc(intakeRef);

    if (intakeDoc.exists()) {
      console.log('Found water intake document with ID:', `${userId}_${date}`);
      return intakeDoc.data() as WaterIntake;
    }
    
    // If not found, search for any document with this userId and date
    const q = query(
      collection(db, 'waterIntake'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Found a document with the userId and date, but with a different ID
      const oldDocData = querySnapshot.docs[0].data() as WaterIntake;
      const oldDocId = querySnapshot.docs[0].id;
      
      console.log(`Found water intake document with different ID: ${oldDocId}, migrating to ${userId}_${date}`);
      
      // Migrate to the new ID format
      await setDoc(intakeRef, oldDocData);
      
      // Delete the old document
      await deleteDoc(doc(db, 'waterIntake', oldDocId));
      
      return oldDocData;
    }

    // No document found, create a new one
    const defaultData = {
      userId,
      date,
      amount: 0,
      goal: 2500,
      history: [],
      lastUpdated: Timestamp.now()
    };
    
    console.log('Creating new water intake document with ID:', `${userId}_${date}`);
    
    // Create the document for first-time use
    await setDoc(intakeRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error('Error getting water intake:', error);
    throw error;
  }
};

export const updateWaterIntake = async (
  userId: string, 
  date: string, 
  amount: number,
  goal: number
) => {
  try {
    console.log('Updating water intake for user:', userId, 'date:', date, 'amount:', amount);
    
    const intakeRef = doc(db, 'waterIntake', `${userId}_${date}`);
    const intakeDoc = await getDoc(intakeRef);
    const now = Timestamp.now();

    if (!intakeDoc.exists()) {
      // Try to find the document with any ID but matching userId and date
      const q = query(
        collection(db, 'waterIntake'),
        where('userId', '==', userId),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Found a document with the userId and date, but with a different ID
        const oldDocData = querySnapshot.docs[0].data() as WaterIntake;
        const oldDocId = querySnapshot.docs[0].id;
        
        console.log(`Found water intake document with different ID: ${oldDocId}, migrating to ${userId}_${date}`);
        
        // Update the data with the new amount
        const difference = amount - oldDocData.amount;
        
        const updatedData = {
          ...oldDocData,
          amount,
          lastUpdated: now,
          history: [...oldDocData.history, {
            time: now,
            amount: difference
          }]
        };
        
        // Create a document with the new ID format and updated data
        await setDoc(intakeRef, updatedData);
        
        // Delete the old document
        await deleteDoc(doc(db, 'waterIntake', oldDocId));
        
        return updatedData;
      }
      
      // Create new document
      const newData = {
        userId,
        date,
        amount,
        goal,
        lastUpdated: now,
        history: [{
          time: now,
          amount
        }]
      };
      await setDoc(intakeRef, newData);
      return newData;
    } else {
      // Update existing document
      const currentData = intakeDoc.data() as WaterIntake;
      const difference = amount - currentData.amount;
      
      const updatedData = {
        amount,
        lastUpdated: now,
        history: [...currentData.history, {
          time: now,
          amount: difference // Store the difference
        }]
      };
      
      await updateDoc(intakeRef, updatedData);
      return {
        ...currentData,
        ...updatedData
      };
    }
  } catch (error) {
    console.error('Error updating water intake:', error);
    throw error;
  }
};

export const getWeeklyWaterIntake = async (userId: string) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateString = startDate.toISOString().split('T')[0];
    
    console.log('Getting weekly water intake for user:', userId, 'since:', startDateString);
    
    // First try to get documents with IDs matching the pattern userId_date
    const q = query(
      collection(db, 'waterIntake'),
      where('userId', '==', userId),
      where('date', '>=', startDateString),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} water intake records for the week`);
    
    return querySnapshot.docs.map(doc => doc.data() as WaterIntake);
  } catch (error) {
    console.error('Error getting weekly water intake:', error);
    throw error;
  }
};

// Calculate recommended water intake based on weight and activity level
export const calculateRecommendedIntake = (
  weight: number, // in kg
  activityLevel: 'sedentary' | 'moderate' | 'active'
): number => {
  // Base calculation: 30-35ml per kg of body weight
  let baseIntake = weight * 33;

  // Adjust for activity level
  const activityMultiplier = {
    sedentary: 1,
    moderate: 1.2,
    active: 1.4
  };

  return Math.round(baseIntake * activityMultiplier[activityLevel]);
}; 