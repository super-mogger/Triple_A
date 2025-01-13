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

// Add North Indian meal database
const northIndianMeals = {
  breakfast: [
    {
      id: 1,
      name: "Oatmeal with Fruits",
      calories: 280,
      protein: 8,
      carbs: 45,
      fats: 6,
      portion: "1 bowl",
      category: "Healthy",
      imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc",
      preparationTime: "10 mins",
      cookingTime: "5 mins",
      difficulty: "easy" as const,
      instructions: [
        "Boil water or milk",
        "Add oats and cook for 3-5 minutes",
        "Top with sliced fruits and nuts",
        "Add honey if desired"
      ],
      tips: [
        "Use rolled oats for better texture",
        "Add cinnamon for extra flavor",
        "Use seasonal fruits"
      ],
      alternatives: ["Porridge", "Muesli", "Cornflakes"]
    },
    {
      id: 2,
      name: "Boiled Eggs with Toast",
      calories: 240,
      protein: 14,
      carbs: 28,
      fats: 8,
      portion: "2 eggs, 2 toasts",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
      preparationTime: "5 mins",
      cookingTime: "8 mins",
      difficulty: "easy" as const,
      instructions: [
        "Boil eggs for 6-8 minutes",
        "Toast bread slices",
        "Season eggs with salt and pepper",
        "Serve with toast"
      ],
      tips: [
        "Add vegetables on the side",
        "Use whole grain bread for more fiber",
        "Don't overcook the eggs"
      ],
      alternatives: ["Scrambled Eggs", "Egg Whites", "Omelette"]
    },
    {
      id: 3,
      name: "Vegetable Sandwich",
      calories: 220,
      protein: 6,
      carbs: 35,
      fats: 7,
      portion: "2 sandwiches",
      category: "Vegetarian",
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af",
      preparationTime: "10 mins",
      cookingTime: "5 mins",
      difficulty: "easy" as const,
      instructions: [
        "Slice vegetables",
        "Toast bread slices",
        "Spread sauce or chutney",
        "Layer vegetables and assemble"
      ],
      tips: [
        "Use fresh vegetables",
        "Add cucumber for crunch",
        "Toast bread for better texture"
      ],
      alternatives: ["Grilled Sandwich", "Open Toast", "Wrap"]
    }
  ],
  lunch: [
    {
      id: 4,
      name: "Rice with Dal and Vegetables",
      calories: 380,
      protein: 12,
      carbs: 65,
      fats: 6,
      portion: "1 plate",
      category: "Vegetarian",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
      preparationTime: "15 mins",
      cookingTime: "20 mins",
      difficulty: "easy" as const,
      instructions: [
        "Cook rice",
        "Prepare yellow dal",
        "Steam mixed vegetables",
        "Serve together"
      ],
      tips: [
        "Use seasonal vegetables",
        "Add lemon for taste",
        "Include green chilies for spice"
      ],
      alternatives: ["Khichdi", "Rice Bowl", "Pulao"]
    },
    {
      id: 5,
      name: "Chapati with Mixed Vegetables",
      calories: 320,
      protein: 10,
      carbs: 48,
      fats: 8,
      portion: "2 chapatis with curry",
      category: "Vegetarian",
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
      preparationTime: "20 mins",
      cookingTime: "15 mins",
      difficulty: "medium" as const,
      instructions: [
        "Make chapati dough",
        "Cook mixed vegetables",
        "Roll and cook chapatis",
        "Serve hot"
      ],
      tips: [
        "Use whole wheat flour",
        "Add ghee for softness",
        "Make fresh chapatis"
      ],
      alternatives: ["Roti", "Paratha", "Rice"]
    }
  ],
  dinner: [
    {
      id: 6,
      name: "Grilled Chicken with Salad",
      calories: 350,
      protein: 32,
      carbs: 15,
      fats: 18,
      portion: "200g chicken, 1 bowl salad",
      category: "High Protein",
      imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
      preparationTime: "15 mins",
      cookingTime: "20 mins",
      difficulty: "medium" as const,
      instructions: [
        "Marinate chicken",
        "Prepare salad",
        "Grill chicken",
        "Serve with dressing"
      ],
      tips: [
        "Use lean chicken breast",
        "Add colorful vegetables",
        "Make fresh dressing"
      ],
      alternatives: ["Baked Chicken", "Fish", "Tofu"]
    },
    {
      id: 7,
      name: "Vegetable Soup with Toast",
      calories: 220,
      protein: 8,
      carbs: 35,
      fats: 6,
      portion: "1 bowl soup, 2 toasts",
      category: "Light Meal",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
      preparationTime: "15 mins",
      cookingTime: "25 mins",
      difficulty: "easy" as const,
      instructions: [
        "Chop vegetables",
        "Boil in vegetable stock",
        "Season with herbs",
        "Serve with toast"
      ],
      tips: [
        "Use fresh vegetables",
        "Add herbs for flavor",
        "Make extra for next day"
      ],
      alternatives: ["Clear Soup", "Tomato Soup", "Mushroom Soup"]
    }
  ]
};

// Add simple grocery categories
const indianGroceryList = [
  {
    category: "Staples",
    items: [
      "Rice",
      "Whole Wheat Flour",
      "Oats",
      "Bread",
      "Dal (Lentils)",
      "Eggs"
    ]
  },
  {
    category: "Fresh Vegetables",
    items: [
      "Tomatoes",
      "Onions",
      "Potatoes",
      "Carrots",
      "Green Leafy Vegetables",
      "Bell Peppers",
      "Cucumber"
    ]
  },
  {
    category: "Fruits",
    items: [
      "Apples",
      "Bananas",
      "Oranges",
      "Seasonal Fruits",
      "Lemons"
    ]
  },
  {
    category: "Protein Sources",
    items: [
      "Chicken Breast",
      "Fish",
      "Eggs",
      "Tofu",
      "Paneer",
      "Lentils"
    ]
  },
  {
    category: "Basics & Condiments",
    items: [
      "Salt",
      "Black Pepper",
      "Cooking Oil",
      "Milk",
      "Curd",
      "Butter"
    ]
  }
];

export async function generatePersonalizedDietPlan(profile: any): Promise<DietPlan> {
  try {
    // Calculate target calories based on profile and goal
    let targetCalories = profile.goal === 'weight-loss' 
      ? 1800 
      : profile.goal === 'muscle-gain'
      ? 2500
      : 2000;

    // Select meals based on target calories
    const breakfast = northIndianMeals.breakfast[Math.floor(Math.random() * northIndianMeals.breakfast.length)];
    const lunch = northIndianMeals.lunch[Math.floor(Math.random() * northIndianMeals.lunch.length)];
    const dinner = northIndianMeals.dinner[Math.floor(Math.random() * northIndianMeals.dinner.length)];

    const meals: DailyMeal[] = [
      {
        type: 'breakfast',
        time: '7:00 AM',
        foods: [breakfast],
        totalCalories: breakfast.calories,
        totalProtein: breakfast.protein,
        totalCarbs: breakfast.carbs,
        totalFats: breakfast.fats
      },
      {
        type: 'lunch',
        time: '12:30 PM',
        foods: [lunch],
        totalCalories: lunch.calories,
        totalProtein: lunch.protein,
        totalCarbs: lunch.carbs,
        totalFats: lunch.fats
      },
      {
        type: 'dinner',
        time: '7:00 PM',
        foods: [dinner],
        totalCalories: dinner.calories,
        totalProtein: dinner.protein,
        totalCarbs: dinner.carbs,
        totalFats: dinner.fats
      }
    ];

    const totalCalories = meals.reduce((acc, meal) => acc + (meal.totalCalories || 0), 0);
    const totalProtein = meals.reduce((acc, meal) => acc + (meal.totalProtein || 0), 0);
    const totalCarbs = meals.reduce((acc, meal) => acc + (meal.totalCarbs || 0), 0);
    const totalFats = meals.reduce((acc, meal) => acc + (meal.totalFats || 0), 0);

    // Calculate macro percentages
    const proteinCalories = totalProtein * 4;
    const carbsCalories = totalCarbs * 4;
    const fatCalories = totalFats * 9;

    return {
      title: `${profile.goal.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Diet Plan`,
      description: `A balanced North Indian diet plan focused on sustainable ${profile.goal.replace('-', ' ')} through portion control and nutrient-rich foods.`,
      level: 'Intermediate',
      duration: profile.goal === 'maintenance' ? 'Ongoing' : '8 weeks',
      goal: profile.goal,
      dietType: 'North Indian',
      schedule: {
        days: [{
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          meals,
          totalDailyCalories: totalCalories,
          waterIntake: 2.5,
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
        'Limited sweets',
        'No excessive oil',
        'Fresh ingredients only'
      ],
      groceryList: indianGroceryList,
      supplementation: [
        {
          name: 'Multivitamin',
          dosage: '1 tablet',
          timing: 'Morning with breakfast',
          notes: 'Helps fill potential nutritional gaps',
        },
        {
          name: 'Calcium with Vitamin D',
          dosage: '500mg',
          timing: 'Evening with dinner',
          notes: 'Supports bone health and immunity',
        },
      ],
    };
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw error;
  }
} 