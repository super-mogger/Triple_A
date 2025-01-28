import { useProfile } from '../context/ProfileContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format, subDays, differenceInDays } from 'date-fns';
import axios from 'axios';

// Export all necessary interfaces
export interface DietaryAlternative {
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  servingSize: string;
  changes?: string;
}

export interface Food {
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  servingSize: string;
  portion: string;
  alternatives?: {
    vegetarian?: DietaryAlternative;
    glutenFree?: DietaryAlternative;
    lactoseFree?: DietaryAlternative;
  };
  category?: string;
  difficulty?: string;
  preparationTime?: string;
  cookingTime?: string;
  imageUrl?: string;
  allergens?: string[];
  instructions?: string[];
  tips?: string[];
}

export interface Meal {
  type: string;
  time: string;
  foods: Food[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface DailyMeals {
  day: string;
  meals: Meal[];
}

export interface WeeklyDietPlan {
  title: string;
  description: string;
  level: string;
  duration: string;
  type: string;
  goal: string;
  color: string;
  waterIntake: number;
  supplementation: Supplement[];
  nutritionalGoals: NutritionalGoals;
  weeklyPlan: DailyMeals[];
}

export interface NutritionalGoals {
  calories: number;
  protein: {
    grams: number;
    percentage: number;
  };
  carbs: {
    grams: number;
    percentage: number;
  };
  fats: {
    grams: number;
    percentage: number;
  };
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  notes: string;
  benefits?: string;
}

export interface AttendanceStats {
  userId: string;
  totalPresent: number;
  totalAbsent: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: Date | null;
  lastUpdated: Date;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  date: Date;
  time: string;
  status: 'present' | 'absent';
  createdAt: Date;
}

const highProteinMealDatabase: Food[] = [
  {
    name: "Chicken Breast with Rice",
    protein: 30,
    carbs: 40,
    fats: 5,
    calories: 325,
    servingSize: "300g",
    portion: "300g",
      category: "High Protein",
    difficulty: "Easy",
      preparationTime: "10 mins",
    cookingTime: "20 mins",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
    allergens: []
  },
  {
    name: "Protein Oatmeal",
    protein: 20,
      carbs: 35,
    fats: 8,
    calories: 290,
    servingSize: "250g",
    portion: "250g",
      category: "High Protein",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "10 mins",
    allergens: ["Dairy"]
  },
  {
    name: "Salmon with Sweet Potato",
          protein: 25,
    carbs: 30,
    fats: 15,
    calories: 355,
    servingSize: "300g",
    portion: "300g",
      category: "High Protein",
    difficulty: "Medium",
    preparationTime: "10 mins",
    cookingTime: "25 mins",
    allergens: ["Fish"]
  }
];

const lowCalorieMealDatabase: Food[] = [
  {
    name: "Grilled Chicken Breast",
    protein: 25,
    carbs: 0,
    fats: 3,
    calories: 165,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "5 mins",
      cookingTime: "15 mins",
      alternatives: {
        vegetarian: {
        name: "Grilled Tofu",
        protein: 20,
        carbs: 2,
        fats: 5,
        calories: 150,
        servingSize: "100g",
        changes: "Replace chicken with firm tofu"
      }
    }
  },
  {
    name: "Mixed Green Salad",
    protein: 2,
    carbs: 5,
    fats: 0,
    calories: 25,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "10 mins",
    cookingTime: "0 mins"
  },
  {
    name: "Quinoa Bowl",
    protein: 4,
    carbs: 21,
    fats: 2,
    calories: 120,
    servingSize: "100g",
    portion: "100g",
    category: "Low Calorie",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "15 mins"
  }
];

const maintenanceMealDatabase: Food[] = [
  {
    name: "Brown Rice Bowl",
    protein: 3,
    carbs: 45,
    fats: 2,
    calories: 215,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Easy",
    preparationTime: "5 mins",
    cookingTime: "20 mins"
  },
  {
    name: "Sweet Potato Mash",
    protein: 2,
    carbs: 20,
    fats: 0,
    calories: 90,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Easy",
    preparationTime: "10 mins",
    cookingTime: "15 mins"
  },
  {
    name: "Grilled Salmon",
    protein: 20,
    carbs: 0,
    fats: 13,
    calories: 208,
    servingSize: "100g",
    portion: "100g",
    category: "Balanced",
    difficulty: "Medium",
    preparationTime: "5 mins",
    cookingTime: "15 mins",
    allergens: ["Fish"]
  }
];

const calculateMealTotals = (foods: Food[]): { 
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
} => {
  return foods.reduce((totals, food) => ({
    totalCalories: totals.totalCalories + food.calories,
    totalProtein: totals.totalProtein + food.protein,
    totalCarbs: totals.totalCarbs + food.carbs,
    totalFats: totals.totalFats + food.fats
  }), {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0
  });
};

interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  userId: string;
}

const SPOONACULAR_API_KEY = '41a7028772cd4a0fa562ceb7377f59db';

export const fetchFoodImage = async (foodName: string): Promise<string> => {
  try {
    console.log(`Requesting image for: ${foodName}`);
    const response = await axios.get(`https://api.spoonacular.com/food/ingredients/search`, {
      params: {
        query: foodName,
        apiKey: SPOONACULAR_API_KEY
      }
    });

    console.log('API response:', response.data);
    const results = response.data.results;
    if (results.length > 0) {
      const imageUrl = `https://spoonacular.com/cdn/ingredients_500x500/${results[0].image}`;
      console.log(`Image URL found: ${imageUrl}`);
      return imageUrl;
    }
    console.log('No image found, using default.');
    return '/images/default-diet.png'; // Fallback image
  } catch (error) {
    console.error('Error fetching food image:', error);
    return '/images/default-diet.png'; // Fallback image
  }
};

export const useDietService = () => {
  const generateDietPlan = async (profile: UserProfile, planType: string): Promise<WeeklyDietPlan> => {
    try {
      console.log('Generating diet plan for:', { profile, planType });
  
  // Calculate BMR using Mifflin-St Jeor Equation
      const bmr = profile.gender === 'male'
        ? (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5
        : (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;

      // Calculate TDEE (Total Daily Energy Expenditure)
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
      };
      const tdee = bmr * (activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers] || 1.55);

      // Adjust calories based on plan type
      let targetCalories = tdee;
      switch (planType) {
        case 'weight-loss':
          targetCalories = tdee - 500; // 500 calorie deficit
          break;
        case 'muscle-gain':
          targetCalories = tdee + 300; // 300 calorie surplus
          break;
        case 'maintenance':
          targetCalories = tdee;
          break;
      }

      // Calculate macronutrient goals
      const nutritionalGoals = {
        calories: Math.round(targetCalories),
        protein: {
          grams: Math.round(profile.weight * 2.2), // 1g per lb of body weight
          percentage: 30
        },
        carbs: {
          grams: Math.round((targetCalories * 0.4) / 4), // 40% of calories from carbs
          percentage: 40
        },
        fats: {
          grams: Math.round((targetCalories * 0.3) / 9), // 30% of calories from fats
          percentage: 30
        }
      };

      // Generate the weekly plan
      const weeklyPlan = generateWeeklyPlan(nutritionalGoals, planType);

      const plan: WeeklyDietPlan = {
        title: `${planType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Diet Plan`,
        description: getDescription(planType),
        level: 'Intermediate',
        duration: '12 weeks',
        type: planType,
        goal: getGoal(planType),
        color: getColor(planType),
        waterIntake: Math.round(profile.weight * 0.033 * 1000), // ml per day
        supplementation: getSupplementation(planType),
        nutritionalGoals,
        weeklyPlan
      };

      // Save the plan to Firestore
      try {
        const dietPlansRef = collection(db, 'dietPlans');
        await addDoc(dietPlansRef, {
          ...plan,
          userId: profile.userId, // Make sure to pass userId in profile
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error saving diet plan to database:', error);
        // Continue even if save fails - user can still view the plan
      }

      return plan;
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw new Error('Failed to generate diet plan. Please try again.');
    }
  };

  return {
    generateDietPlan
  };
};

// Helper functions
const generateWeeklyPlan = (goals: NutritionalGoals, planType: string): DailyMeals[] => {
  // Select appropriate meal database based on plan type
  let mealDatabase: Food[];
  switch (planType) {
    case 'weight-loss':
      mealDatabase = lowCalorieMealDatabase;
      break;
    case 'muscle-gain':
      mealDatabase = highProteinMealDatabase;
      break;
    default:
      mealDatabase = maintenanceMealDatabase;
  }

  // Generate a week's worth of meals
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return daysOfWeek.map(day => {
    // Create three meals for each day
    const breakfast: Meal = {
      type: 'Breakfast',
      time: '8:00 AM',
      foods: [mealDatabase[1]], // Using protein oatmeal or similar
      ...calculateMealTotals([mealDatabase[1]])
    };

    const lunch: Meal = {
      type: 'Lunch',
      time: '1:00 PM',
      foods: [mealDatabase[0]], // Using main protein dish
      ...calculateMealTotals([mealDatabase[0]])
    };

    const dinner: Meal = {
      type: 'Dinner',
      time: '7:00 PM',
      foods: [mealDatabase[2]], // Using evening meal
      ...calculateMealTotals([mealDatabase[2]])
    };

    // Add snacks based on plan type
    const meals = [breakfast, lunch, dinner];

    // For muscle gain, add pre and post workout meals
    if (planType === 'muscle-gain') {
      const preWorkout: Meal = {
        type: 'Pre-Workout',
        time: '4:00 PM',
        foods: [{
          name: "Banana with Peanut Butter",
          protein: 7,
          carbs: 27,
          fats: 8,
          calories: 200,
          servingSize: "1 medium banana + 1 tbsp peanut butter",
          portion: "1 serving"
        }],
        ...calculateMealTotals([{
          name: "Banana with Peanut Butter",
          protein: 7,
          carbs: 27,
          fats: 8,
          calories: 200,
          servingSize: "1 medium banana + 1 tbsp peanut butter",
          portion: "1 serving"
        }])
      };
      meals.splice(2, 0, preWorkout);
    }

    return {
      day,
      meals
    };
  });
};

const getSupplementation = (planType: string): Supplement[] => {
  const baseSupplements: Supplement[] = [
    {
      name: 'Multivitamin',
      dosage: '1 tablet',
      timing: 'Morning with breakfast',
      notes: 'Covers basic micronutrient needs',
      benefits: 'Supports overall health and fills potential nutritional gaps'
    }
  ];

  switch (planType) {
    case 'muscle-gain':
      return [
        ...baseSupplements,
        {
          name: 'Whey Protein',
          dosage: '25-30g',
          timing: 'Post-workout or between meals',
          notes: 'High-quality protein source',
          benefits: 'Supports muscle recovery and growth'
        },
        {
          name: 'Creatine Monohydrate',
          dosage: '5g daily',
          timing: 'Any time of day',
          notes: 'Most researched supplement for muscle gain',
          benefits: 'Improves strength, power, and muscle growth'
        }
      ];
    case 'weight-loss':
      return [
        ...baseSupplements,
        {
          name: 'Whey Protein',
          dosage: '20-25g',
          timing: 'Between meals or as meal replacement',
          notes: 'Helps maintain muscle mass during weight loss',
          benefits: 'Supports satiety and preserves lean mass'
        }
      ];
    default:
      return baseSupplements;
  }
};

const getDescription = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return 'A calorie-controlled diet plan focused on sustainable fat loss while preserving muscle mass.';
    case 'muscle-gain':
      return 'A high-protein diet plan designed to support muscle growth and strength gains.';
    case 'maintenance':
      return 'A balanced diet plan to maintain weight and support overall health.';
    default:
      return 'A personalized diet plan tailored to your goals.';
  }
};

const getGoal = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return 'Lose Fat';
    case 'muscle-gain':
      return 'Build Muscle';
    case 'maintenance':
      return 'Stay Healthy';
    default:
      return 'General Health';
  }
};

const getColor = (planType: string): string => {
  switch (planType) {
    case 'weight-loss':
      return 'red';
    case 'muscle-gain':
      return 'blue';
    case 'maintenance':
      return 'green';
    default:
      return 'gray';
  }
};

export const useAttendanceService = () => {
  const markAttendance = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const formattedTime = format(today, 'HH:mm:ss');

      // Check if attendance already marked
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('date', '==', formattedDate)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { success: false, message: 'Attendance already marked for today' };
      }

      // Add attendance record
      const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
        userId,
        date: today,
        time: formattedTime,
        status: 'present',
        createdAt: today
      };

      await addDoc(attendanceRef, {
        ...attendanceRecord,
        date: Timestamp.fromDate(today),
        createdAt: Timestamp.fromDate(today)
      });

      // Update attendance stats
      await updateAttendanceStats(userId, true);

      // Clean up old records
      await cleanupOldRecords(userId);

      return { success: true, message: 'Attendance marked successfully' };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, message: 'Failed to mark attendance' };
    }
  };

  const updateAttendanceStats = async (userId: string, isPresent: boolean) => {
    try {
      const statsRef = collection(db, 'attendanceStats');
      const q = query(statsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const today = new Date();
      let stats: AttendanceStats;

      if (querySnapshot.empty) {
        // Create new stats
        stats = {
          userId,
          totalPresent: isPresent ? 1 : 0,
          totalAbsent: isPresent ? 0 : 1,
          currentStreak: isPresent ? 1 : 0,
          longestStreak: isPresent ? 1 : 0,
          lastAttendance: isPresent ? today : null,
          lastUpdated: today
        };
        await addDoc(statsRef, {
          ...stats,
          lastAttendance: stats.lastAttendance ? Timestamp.fromDate(stats.lastAttendance) : null,
          lastUpdated: Timestamp.fromDate(stats.lastUpdated)
        });
      } else {
        const docRef = doc(db, 'attendanceStats', querySnapshot.docs[0].id);
        const existingStats = querySnapshot.docs[0].data() as AttendanceStats;

        // Calculate streak
        let currentStreak = existingStats.currentStreak;
        if (isPresent) {
          if (existingStats.lastAttendance) {
            const daysSinceLastAttendance = differenceInDays(today, existingStats.lastAttendance);
            if (daysSinceLastAttendance === 1) {
              currentStreak++;
            } else if (daysSinceLastAttendance > 1) {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 0;
        }

        stats = {
          ...existingStats,
          totalPresent: isPresent ? existingStats.totalPresent + 1 : existingStats.totalPresent,
          totalAbsent: !isPresent ? existingStats.totalAbsent + 1 : existingStats.totalAbsent,
          currentStreak,
          longestStreak: Math.max(currentStreak, existingStats.longestStreak),
          lastAttendance: isPresent ? today : existingStats.lastAttendance,
          lastUpdated: today
        };

        await updateDoc(docRef, {
          ...stats,
          lastAttendance: stats.lastAttendance ? Timestamp.fromDate(stats.lastAttendance) : null,
          lastUpdated: Timestamp.fromDate(stats.lastUpdated)
        });
      }

      return stats;
    } catch (error) {
      console.error('Error updating attendance stats:', error);
      throw error;
    }
  };

  const cleanupOldRecords = async (userId: string) => {
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
  };

  const getAttendanceStats = async (userId: string): Promise<AttendanceStats | null> => {
    try {
      const statsRef = collection(db, 'attendanceStats');
      const q = query(statsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const data = querySnapshot.docs[0].data();
      return {
        ...data,
        lastAttendance: data.lastAttendance?.toDate() || null,
        lastUpdated: data.lastUpdated.toDate()
      } as AttendanceStats;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  };

  return {
    markAttendance,
    getAttendanceStats,
    updateAttendanceStats
  };
}; 