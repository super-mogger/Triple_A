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

export interface DietPlan {
  id?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  goal: string;
  dietType: string;
  imageUrl?: string;
  schedule?: WeeklyDietPlan;
  restrictions?: string[];
  allergies?: string[];
  isVegetarian?: boolean;
  nutritionalGoals?: {
    dailyCalories: number;
    proteinPercentage: number;
    carbsPercentage: number;
    fatsPercentage: number;
  };
  supplementation?: {
    name: string;
    dosage: string;
    timing: string;
    notes: string;
  }[];
  mealPreparationTips?: string[];
  groceryList?: {
    category: string;
    items: string[];
  }[];
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

export async function generatePersonalizedDietPlan(profile: any): Promise<DietPlan> {
  try {
    // Calculate BMR using Harris-Benedict Equation
    const bmr = profile.gender === 'male'
      ? 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
      : 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);

    // Calculate activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,      // Little or no exercise
      light: 1.375,        // Light exercise/sports 1-3 days/week
      moderate: 1.55,      // Moderate exercise/sports 3-5 days/week
      active: 1.725,       // Hard exercise/sports 6-7 days/week
      veryActive: 1.9      // Very hard exercise & physical job or training twice per day
    };

    const activityMultiplier = activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers] || activityMultipliers.moderate;
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultiplier;

    // Calculate target calories based on goal
    let targetCalories = profile.goal === 'weight-loss'
      ? tdee - 500  // 500 calorie deficit for weight loss
      : profile.goal === 'muscle-gain'
      ? tdee + 500  // 500 calorie surplus for muscle gain
      : tdee;       // Maintenance calories

    // Round calories to nearest 50
    targetCalories = Math.round(targetCalories / 50) * 50;

    // Calculate water intake based on weight and activity level
    // Base: 30ml per kg of body weight
    let waterIntake = (profile.weight * 0.03);
    
    // Adjust for activity level
    if (profile.activityLevel === 'active' || profile.activityLevel === 'veryActive') {
      waterIntake += 0.7; // Add 700ml for high activity
    } else if (profile.activityLevel === 'moderate') {
      waterIntake += 0.5; // Add 500ml for moderate activity
    }

    // Adjust for climate if available
    if (profile.climate === 'hot') {
      waterIntake += 0.5; // Add 500ml for hot climate
    }

    // Round water intake to nearest 0.1L
    waterIntake = Math.round(waterIntake * 10) / 10;

    // Select meals based on target calories
    const breakfast = proteinRichMeals.breakfast[Math.floor(Math.random() * proteinRichMeals.breakfast.length)];
    const lunch = proteinRichMeals.lunch[Math.floor(Math.random() * proteinRichMeals.lunch.length)];
    const dinner = proteinRichMeals.dinner[Math.floor(Math.random() * proteinRichMeals.dinner.length)];

    // Scale meal portions to match target calories
    const currentTotalCalories = breakfast.calories + lunch.calories + dinner.calories;
    const scaleFactor = targetCalories / currentTotalCalories;

    const scaledMeals: DailyMeal[] = [
        {
          type: 'breakfast',
          time: '7:00 AM',
        foods: [breakfast],
        totalCalories: Math.round(breakfast.calories * scaleFactor),
        totalProtein: Math.round(breakfast.protein * scaleFactor),
        totalCarbs: Math.round(breakfast.carbs * scaleFactor),
        totalFats: Math.round(breakfast.fats * scaleFactor)
        },
        {
          type: 'lunch',
          time: '12:30 PM',
        foods: [lunch],
        totalCalories: Math.round(lunch.calories * scaleFactor),
        totalProtein: Math.round(lunch.protein * scaleFactor),
        totalCarbs: Math.round(lunch.carbs * scaleFactor),
        totalFats: Math.round(lunch.fats * scaleFactor)
        },
        {
          type: 'dinner',
          time: '7:00 PM',
        foods: [dinner],
        totalCalories: Math.round(dinner.calories * scaleFactor),
        totalProtein: Math.round(dinner.protein * scaleFactor),
        totalCarbs: Math.round(dinner.carbs * scaleFactor),
        totalFats: Math.round(dinner.fats * scaleFactor)
      }
    ];

    const totalCalories = scaledMeals.reduce((acc, meal) => acc + (meal.totalCalories || 0), 0);
    const totalProtein = scaledMeals.reduce((acc, meal) => acc + (meal.totalProtein || 0), 0);
    const totalCarbs = scaledMeals.reduce((acc, meal) => acc + (meal.totalCarbs || 0), 0);
    const totalFats = scaledMeals.reduce((acc, meal) => acc + (meal.totalFats || 0), 0);

    // Calculate macro percentages
    const proteinCalories = totalProtein * 4;
    const carbsCalories = totalCarbs * 4;
    const fatCalories = totalFats * 9;

  return {
      title: `${profile.goal.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Diet Plan`,
      description: `A high-protein diet plan focused on ${profile.goal.replace('-', ' ')} through optimal protein intake and strategic supplementation.`,
      level: 'Intermediate',
      duration: profile.goal === 'maintenance' ? 'Ongoing' : '12 weeks',
      goal: profile.goal,
      dietType: 'High Protein',
      schedule: {
        days: [{
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          meals: scaledMeals,
          totalDailyCalories: totalCalories,
          waterIntake: waterIntake,
        }],
      },
    nutritionalGoals: {
        dailyCalories: totalCalories,
        proteinPercentage: Math.round((proteinCalories / totalCalories) * 100),
        carbsPercentage: Math.round((carbsCalories / totalCalories) * 100),
        fatsPercentage: Math.round((fatCalories / totalCalories) * 100),
      },
      restrictions: [
        'No processed foods',
        'Limited sugary foods',
        'Adequate protein with each meal',
        'Fresh ingredients only'
      ],
      supplementation: supplementInfo[profile.goal as keyof typeof supplementInfo] || supplementInfo.maintenance,
    };
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw error;
  }
} 