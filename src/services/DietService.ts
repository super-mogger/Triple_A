import { useProfile } from '../context/ProfileContext';

const SPOONACULAR_API_KEY = '3c97cc2a2fcf450fae17870b5558abc9';
const BASE_URL = 'https://api.spoonacular.com';

export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
  instructions?: string[];
  tips?: string[];
  nutritionalInfo?: string[];
  alternatives?: string[];
  category?: string;
  allergens?: string[];
  preparationTime?: string;
  cookingTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export interface DailyMeal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: Food[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
  recommendedTime?: string;
  preparationTips?: string[];
}

export interface WeeklyDietPlan {
  days: {
    day: string;
    meals: DailyMeal[];
    totalDailyCalories?: number;
    waterIntake?: number;
    supplementRecommendations?: string[];
  }[];
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  notes: string;
  benefits?: string;
  recommendations?: string;
}

export interface NutritionalGoals {
  dailyCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface DietPlan {
  id: string;
  title: string;
  description: string;
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance';
  duration: number;
  level: string;
  schedule?: WeeklyDietPlan;
  nutritionalGoals?: NutritionalGoals;
  restrictions?: string[];
  supplementation?: Supplement[];
  waterIntake?: number;
}

interface SpoonacularMealPlan {
  meals: SpoonacularMeal[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

interface SpoonacularMeal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
  imageType: string;
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

interface SpoonacularRecipe extends SpoonacularMeal {
  instructions: string;
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
      ingredients: { name: string }[];
      equipment: { name: string }[];
    }[];
  }[];
  extendedIngredients: {
    original: string;
    name: string;
    amount: number;
    unit: string;
    aisle: string;
  }[];
  diets: string[];
  cuisines: string[];
}

async function fetchMealPlan(targetCalories: number, diet?: string): Promise<SpoonacularMealPlan> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    targetCalories: targetCalories.toString(),
    timeFrame: 'day',
  });

  if (diet) {
    params.append('diet', diet);
  }

  const response = await fetch(`${BASE_URL}/mealplanner/generate?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch meal plan');
  }
  return response.json();
}

async function fetchRecipeDetails(id: number): Promise<SpoonacularRecipe> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
  });

  const response = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recipe details');
  }
  return response.json();
}

function convertSpoonacularMealToFood(meal: SpoonacularMeal, recipe: SpoonacularRecipe): Food {
  const nutrients = recipe.nutrition?.nutrients || [];
  
  return {
    id: meal.id,
    name: meal.title,
    calories: nutrients.find(n => n.name === 'Calories')?.amount || 0,
    protein: nutrients.find(n => n.name === 'Protein')?.amount || 0,
    carbs: nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
    fats: nutrients.find(n => n.name === 'Fat')?.amount || 0,
    portion: `${meal.servings} servings`,
    category: recipe.cuisines[0] || recipe.diets[0] || 'General',
    imageUrl: meal.image,
    preparationTime: `${recipe.readyInMinutes} mins`,
    difficulty: recipe.readyInMinutes <= 30 ? 'easy' : recipe.readyInMinutes <= 60 ? 'medium' : 'hard',
    instructions: recipe.analyzedInstructions[0]?.steps.map(step => step.step),
    alternatives: recipe.extendedIngredients.map(ing => ing.name),
  };
}

// High protein meal database
const proteinRichMeals = {
    breakfast: [
      {
      id: 1,
      name: "Protein Oatmeal with Eggs",
      calories: 450,
      protein: 32,
      carbs: 45,
      fats: 14,
      portion: "1 bowl oats + 3 egg whites",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc",
      preparationTime: "10 mins",
      cookingTime: "10 mins",
      difficulty: "easy" as const,
        instructions: [
        "Cook oats with milk",
        "Add protein powder to oats",
        "Cook egg whites separately",
        "Top with nuts and fruits"
        ],
        tips: [
        "Use whey protein for extra protein",
        "Add chia seeds for omega-3",
        "Use almond milk for fewer calories"
      ],
      alternatives: ["Protein Smoothie Bowl", "Greek Yogurt Parfait"]
    },
    {
      id: 2,
      name: "High Protein Toast",
      calories: 380,
      protein: 28,
      carbs: 35,
      fats: 12,
      portion: "2 toasts + toppings",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
      preparationTime: "10 mins",
      cookingTime: "5 mins",
      difficulty: "easy" as const,
        instructions: [
        "Toast whole grain bread",
        "Scramble eggs with whites",
        "Add cottage cheese",
        "Top with seeds and herbs"
        ],
        tips: [
        "Use whole grain bread for fiber",
        "Add smoked chicken or tuna for variety",
        "Include avocado for healthy fats"
      ],
      alternatives: ["Protein Pancakes", "Egg White Muffins"]
      }
    ],
    lunch: [
      {
      id: 3,
      name: "Chicken Rice Bowl",
      calories: 550,
      protein: 45,
      carbs: 55,
      fats: 12,
      portion: "300g chicken + 1 cup rice",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
      preparationTime: "15 mins",
      cookingTime: "20 mins",
      difficulty: "medium" as const,
        instructions: [
        "Grill chicken breast",
        "Cook brown rice",
        "Steam vegetables",
        "Assemble with sauce"
        ],
        tips: [
        "Marinate chicken for better taste",
        "Use brown rice for more nutrients",
        "Add quinoa for extra protein"
      ],
      alternatives: ["Turkey Bowl", "Fish Rice Bowl"]
    },
    {
      id: 4,
      name: "Protein-Packed Dal",
      calories: 420,
      protein: 28,
      carbs: 48,
      fats: 10,
      portion: "2 cups dal + sides",
      category: "Vegetarian Protein",
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
      preparationTime: "15 mins",
      cookingTime: "25 mins",
      difficulty: "easy" as const,
        instructions: [
        "Cook mixed lentils",
        "Add protein powder",
        "Season with spices",
        "Serve with egg whites"
        ],
        tips: [
        "Mix different lentils for complete protein",
        "Add tofu for extra protein",
        "Include spinach for iron"
      ],
      alternatives: ["Chickpea Curry", "Quinoa Dal"]
      }
    ],
    dinner: [
      {
      id: 5,
      name: "Grilled Chicken Plate",
      calories: 480,
      protein: 52,
      carbs: 20,
      fats: 18,
      portion: "300g chicken + vegetables",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
      preparationTime: "15 mins",
      cookingTime: "20 mins",
      difficulty: "medium" as const,
        instructions: [
        "Marinate chicken breast",
        "Grill or bake chicken",
        "Prepare salad",
        "Add healthy fats"
        ],
        tips: [
        "Use lean chicken breast",
        "Add olive oil for healthy fats",
        "Include variety of vegetables"
      ],
      alternatives: ["Fish Fillet", "Turkey Breast"]
    },
    {
      id: 6,
      name: "Protein Power Bowl",
      calories: 420,
      protein: 38,
      carbs: 35,
      fats: 14,
      portion: "1 large bowl",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
      preparationTime: "15 mins",
      cookingTime: "15 mins",
      difficulty: "easy" as const,
        instructions: [
        "Cook quinoa",
        "Prepare tofu/chicken",
        "Add legumes",
        "Mix with dressing"
        ],
        tips: [
        "Combine plant and animal proteins",
        "Add seeds for extra protein",
        "Use Greek yogurt dressing"
      ],
      alternatives: ["Chickpea Bowl", "Lentil Bowl"]
    }
  ]
};

// Supplement recommendations based on goals
const supplementInfo = {
  'weight-loss': [
    {
      name: 'Whey Protein Isolate',
      dosage: '25-30g',
      timing: 'Post-workout or between meals',
      benefits: 'Helps preserve muscle while cutting calories, increases satiety',
      recommendations: 'Choose low-carb variants, mix with water instead of milk'
    },
    {
      name: 'L-Carnitine',
      dosage: '1500-2000mg',
      timing: 'Before cardio or with meals',
      benefits: 'May help with fat metabolism, supports energy production',
      recommendations: 'Best taken with carbohydrates for absorption'
    }
  ],
  'muscle-gain': [
    {
      name: 'Whey Protein',
      dosage: '25-30g',
      timing: 'Post-workout and between meals',
      benefits: 'Fast-absorbing protein for muscle recovery and growth',
      recommendations: 'Can mix with milk for extra calories and nutrients'
    },
    {
      name: 'Creatine Monohydrate',
      dosage: '5g daily',
      timing: 'Any time of day, consistent timing',
      benefits: 'Increases strength, muscle volume, and workout performance',
      recommendations: 'No loading phase needed, stay consistent daily'
    },
    {
      name: 'Mass Gainer',
      dosage: '1 serving',
      timing: 'Post-workout or between meals',
      benefits: 'Extra calories and protein for muscle gain',
      recommendations: 'Use only if struggling to meet calorie needs through food'
    }
  ],
  'maintenance': [
    {
      name: 'Whey Protein',
      dosage: '20-25g',
      timing: 'Post-workout or as needed',
      benefits: 'Convenient protein source for muscle maintenance',
      recommendations: 'Use as supplement to whole food protein sources'
    },
    {
      name: 'Multivitamin',
      dosage: '1 serving',
      timing: 'With breakfast',
      benefits: 'Fills potential nutritional gaps',
      recommendations: 'Choose a high-quality brand with good absorption'
    }
  ]
};

// Helper function to convert duration string to number
export function parseDuration(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Helper function to convert nutritional goals
export function convertNutritionalGoals(goals: any): NutritionalGoals {
  const dailyCalories = Number(goals.dailyCalories) || 2000;
  const proteinPercentage = Number(goals.proteinPercentage) || 30;
  const carbsPercentage = Number(goals.carbsPercentage) || 40;
  const fatsPercentage = Number(goals.fatsPercentage) || 30;

  return {
    dailyCalories,
    proteinPercentage,
    carbsPercentage,
    fatsPercentage,
    proteinGrams: Math.round((dailyCalories * (proteinPercentage / 100)) / 4),
    carbsGrams: Math.round((dailyCalories * (carbsPercentage / 100)) / 4),
    fatsGrams: Math.round((dailyCalories * (fatsPercentage / 100)) / 9)
  };
}

// Helper function to convert supplementation data
export function convertSupplementation(supplementation: any[]): Supplement[] {
  return supplementation.map(supp => ({
    name: supp.name,
    dosage: supp.dosage,
    timing: supp.timing,
    notes: supp.notes || `${supp.benefits || ''} ${supp.recommendations || ''}`.trim()
  }));
}

export async function generatePersonalizedDietPlan(profile: any): Promise<DietPlan> {
  // Mock data - replace with actual API call
  const mockPlan = {
    id: Math.random().toString(36).substring(7),
    title: 'Muscle Gain Diet Plan',
    description: 'A high-protein diet plan focused on muscle gain through optimal protein intake and strategic supplementation.',
    goal: 'muscle-gain' as const,
    duration: 12, // weeks
    level: 'intermediate',
    nutritionalGoals: convertNutritionalGoals({
      dailyCalories: 2800,
      proteinPercentage: 35,
      carbsPercentage: 45,
      fatsPercentage: 20
    }),
    restrictions: [
      'No processed foods',
      'Limited sugary foods',
      'Adequate protein with each meal',
      'Fresh ingredients only'
    ],
    supplementation: convertSupplementation([
      {
        name: 'Whey Protein',
        dosage: '25-30g',
        timing: 'Post-workout and between meals',
        benefits: 'Supports muscle recovery and growth',
        recommendations: 'Mix with water or milk'
      },
      {
        name: 'Creatine Monohydrate',
        dosage: '5g daily',
        timing: 'Any time of day, consistent timing',
        benefits: 'Enhances strength and muscle gains',
        recommendations: 'Take with water, maintain consistent intake'
      },
      {
        name: 'Mass Gainer',
        dosage: '1 serving',
        timing: 'Post-workout or between meals',
        benefits: 'Additional calories and nutrients',
        recommendations: 'Use when struggling to meet calorie goals'
      }
    ]),
    waterIntake: 3.5, // liters
    schedule: {
      days: [
        {
          day: 'Monday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[0]],
              totalCalories: proteinRichMeals.breakfast[0].calories,
              totalProtein: proteinRichMeals.breakfast[0].protein,
              totalCarbs: proteinRichMeals.breakfast[0].carbs,
              totalFats: proteinRichMeals.breakfast[0].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[0]],
              totalCalories: proteinRichMeals.lunch[0].calories,
              totalProtein: proteinRichMeals.lunch[0].protein,
              totalCarbs: proteinRichMeals.lunch[0].carbs,
              totalFats: proteinRichMeals.lunch[0].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[0]],
              totalCalories: proteinRichMeals.dinner[0].calories,
              totalProtein: proteinRichMeals.dinner[0].protein,
              totalCarbs: proteinRichMeals.dinner[0].carbs,
              totalFats: proteinRichMeals.dinner[0].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[0].calories + 
                             proteinRichMeals.lunch[0].calories + 
                             proteinRichMeals.dinner[0].calories,
          waterIntake: 3.5
        },
        {
          day: 'Tuesday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[1]],
              totalCalories: proteinRichMeals.breakfast[1].calories,
              totalProtein: proteinRichMeals.breakfast[1].protein,
              totalCarbs: proteinRichMeals.breakfast[1].carbs,
              totalFats: proteinRichMeals.breakfast[1].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[1]],
              totalCalories: proteinRichMeals.lunch[1].calories,
              totalProtein: proteinRichMeals.lunch[1].protein,
              totalCarbs: proteinRichMeals.lunch[1].carbs,
              totalFats: proteinRichMeals.lunch[1].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[1]],
              totalCalories: proteinRichMeals.dinner[1].calories,
              totalProtein: proteinRichMeals.dinner[1].protein,
              totalCarbs: proteinRichMeals.dinner[1].carbs,
              totalFats: proteinRichMeals.dinner[1].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[1].calories + 
                             proteinRichMeals.lunch[1].calories + 
                             proteinRichMeals.dinner[1].calories,
          waterIntake: 3.5
        },
        {
          day: 'Wednesday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[0]],
              totalCalories: proteinRichMeals.breakfast[0].calories,
              totalProtein: proteinRichMeals.breakfast[0].protein,
              totalCarbs: proteinRichMeals.breakfast[0].carbs,
              totalFats: proteinRichMeals.breakfast[0].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[0]],
              totalCalories: proteinRichMeals.lunch[0].calories,
              totalProtein: proteinRichMeals.lunch[0].protein,
              totalCarbs: proteinRichMeals.lunch[0].carbs,
              totalFats: proteinRichMeals.lunch[0].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[0]],
              totalCalories: proteinRichMeals.dinner[0].calories,
              totalProtein: proteinRichMeals.dinner[0].protein,
              totalCarbs: proteinRichMeals.dinner[0].carbs,
              totalFats: proteinRichMeals.dinner[0].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[0].calories + 
                             proteinRichMeals.lunch[0].calories + 
                             proteinRichMeals.dinner[0].calories,
          waterIntake: 3.5
        },
        {
          day: 'Thursday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[1]],
              totalCalories: proteinRichMeals.breakfast[1].calories,
              totalProtein: proteinRichMeals.breakfast[1].protein,
              totalCarbs: proteinRichMeals.breakfast[1].carbs,
              totalFats: proteinRichMeals.breakfast[1].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[1]],
              totalCalories: proteinRichMeals.lunch[1].calories,
              totalProtein: proteinRichMeals.lunch[1].protein,
              totalCarbs: proteinRichMeals.lunch[1].carbs,
              totalFats: proteinRichMeals.lunch[1].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[1]],
              totalCalories: proteinRichMeals.dinner[1].calories,
              totalProtein: proteinRichMeals.dinner[1].protein,
              totalCarbs: proteinRichMeals.dinner[1].carbs,
              totalFats: proteinRichMeals.dinner[1].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[1].calories + 
                             proteinRichMeals.lunch[1].calories + 
                             proteinRichMeals.dinner[1].calories,
          waterIntake: 3.5
        },
        {
          day: 'Friday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[0]],
              totalCalories: proteinRichMeals.breakfast[0].calories,
              totalProtein: proteinRichMeals.breakfast[0].protein,
              totalCarbs: proteinRichMeals.breakfast[0].carbs,
              totalFats: proteinRichMeals.breakfast[0].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[0]],
              totalCalories: proteinRichMeals.lunch[0].calories,
              totalProtein: proteinRichMeals.lunch[0].protein,
              totalCarbs: proteinRichMeals.lunch[0].carbs,
              totalFats: proteinRichMeals.lunch[0].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[0]],
              totalCalories: proteinRichMeals.dinner[0].calories,
              totalProtein: proteinRichMeals.dinner[0].protein,
              totalCarbs: proteinRichMeals.dinner[0].carbs,
              totalFats: proteinRichMeals.dinner[0].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[0].calories + 
                             proteinRichMeals.lunch[0].calories + 
                             proteinRichMeals.dinner[0].calories,
          waterIntake: 3.5
        },
        {
          day: 'Saturday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[1]],
              totalCalories: proteinRichMeals.breakfast[1].calories,
              totalProtein: proteinRichMeals.breakfast[1].protein,
              totalCarbs: proteinRichMeals.breakfast[1].carbs,
              totalFats: proteinRichMeals.breakfast[1].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[1]],
              totalCalories: proteinRichMeals.lunch[1].calories,
              totalProtein: proteinRichMeals.lunch[1].protein,
              totalCarbs: proteinRichMeals.lunch[1].carbs,
              totalFats: proteinRichMeals.lunch[1].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[1]],
              totalCalories: proteinRichMeals.dinner[1].calories,
              totalProtein: proteinRichMeals.dinner[1].protein,
              totalCarbs: proteinRichMeals.dinner[1].carbs,
              totalFats: proteinRichMeals.dinner[1].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[1].calories + 
                             proteinRichMeals.lunch[1].calories + 
                             proteinRichMeals.dinner[1].calories,
          waterIntake: 3.5
        },
        {
          day: 'Sunday',
          meals: [
            {
              type: 'breakfast' as const,
              time: '8:00 AM',
              foods: [proteinRichMeals.breakfast[0]],
              totalCalories: proteinRichMeals.breakfast[0].calories,
              totalProtein: proteinRichMeals.breakfast[0].protein,
              totalCarbs: proteinRichMeals.breakfast[0].carbs,
              totalFats: proteinRichMeals.breakfast[0].fats
            },
            {
              type: 'lunch' as const,
              time: '1:00 PM',
              foods: [proteinRichMeals.lunch[0]],
              totalCalories: proteinRichMeals.lunch[0].calories,
              totalProtein: proteinRichMeals.lunch[0].protein,
              totalCarbs: proteinRichMeals.lunch[0].carbs,
              totalFats: proteinRichMeals.lunch[0].fats
            },
            {
              type: 'dinner' as const,
              time: '7:00 PM',
              foods: [proteinRichMeals.dinner[0]],
              totalCalories: proteinRichMeals.dinner[0].calories,
              totalProtein: proteinRichMeals.dinner[0].protein,
              totalCarbs: proteinRichMeals.dinner[0].carbs,
              totalFats: proteinRichMeals.dinner[0].fats
            }
          ],
          totalDailyCalories: proteinRichMeals.breakfast[0].calories + 
                             proteinRichMeals.lunch[0].calories + 
                             proteinRichMeals.dinner[0].calories,
          waterIntake: 3.5
        }
      ]
    }
  };

  return mockPlan;
} 