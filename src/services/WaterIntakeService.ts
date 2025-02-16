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
  limit
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
    const intakeRef = doc(db, 'waterIntake', `${userId}_${date}`);
    const intakeDoc = await getDoc(intakeRef);

    if (!intakeDoc.exists()) {
      const defaultData = {
        userId,
        date,
        amount: 0,
        goal: 2500,
        history: [],
        lastUpdated: Timestamp.now()
      };
      
      // Create the document for first-time use
      await setDoc(intakeRef, defaultData);
      return defaultData;
    }

    return intakeDoc.data() as WaterIntake;
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
    const intakeRef = doc(db, 'waterIntake', `${userId}_${date}`);
    const intakeDoc = await getDoc(intakeRef);
    const now = Timestamp.now();

    if (!intakeDoc.exists()) {
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
    
    const q = query(
      collection(db, 'waterIntake'),
      where('userId', '==', userId),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
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