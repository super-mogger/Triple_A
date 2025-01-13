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
      name: "Paneer Paratha with Curd",
      calories: 350,
      protein: 15,
      carbs: 45,
      fats: 12,
      portion: "2 parathas",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
      preparationTime: "20 mins",
      cookingTime: "15 mins",
      difficulty: "medium" as const,
      instructions: [
        "Knead whole wheat dough",
        "Prepare paneer stuffing with spices",
        "Roll out parathas and stuff with filling",
        "Cook on tawa with ghee",
        "Serve hot with curd"
      ],
      tips: [
        "Use fresh homemade paneer for best results",
        "Add grated carrots for extra nutrition",
        "Serve with mint chutney for added flavor"
      ],
      alternatives: ["Aloo Paratha", "Gobi Paratha", "Mixed Veg Paratha"]
    },
    {
      id: 2,
      name: "Masala Dosa with Sambar",
      calories: 320,
      protein: 10,
      carbs: 52,
      fats: 8,
      portion: "1 dosa",
      category: "South Indian",
      imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921",
      preparationTime: "15 mins",
      cookingTime: "10 mins",
      difficulty: "easy" as const,
      instructions: [
        "Prepare potato masala filling",
        "Heat dosa tawa",
        "Spread batter and add oil",
        "Add filling and fold",
        "Serve with sambar and chutney"
      ],
      tips: [
        "Use fermented batter for crispy dosas",
        "Keep the filling warm",
        "Serve immediately while crispy"
      ],
      alternatives: ["Plain Dosa", "Rava Dosa", "Onion Dosa"]
    },
    {
      id: 3,
      name: "Poha with Peanuts",
      calories: 280,
      protein: 8,
      carbs: 48,
      fats: 6,
      portion: "1 bowl",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979",
      preparationTime: "10 mins",
      cookingTime: "15 mins",
      difficulty: "easy" as const,
      instructions: [
        "Wash and soak poha",
        "Roast peanuts",
        "Temper mustard seeds and curry leaves",
        "Add vegetables and poha",
        "Garnish with coriander and lemon"
      ],
      tips: [
        "Don't oversoak the poha",
        "Add roasted peanuts for crunch",
        "Serve hot with green chutney"
      ],
      alternatives: ["Upma", "Sabudana Khichdi", "Vermicelli Upma"]
    }
  ],
  lunch: [
    {
      id: 4,
      name: "Dal Makhani with Jeera Rice",
      calories: 450,
      protein: 18,
      carbs: 65,
      fats: 12,
      portion: "1 bowl each",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
      preparationTime: "30 mins",
      cookingTime: "45 mins",
      difficulty: "medium" as const,
      instructions: [
        "Soak black lentils overnight",
        "Pressure cook with rajma",
        "Prepare tadka with tomato gravy",
        "Simmer with cream",
        "Serve with jeera rice"
      ],
      tips: [
        "Slow cook for better taste",
        "Use fresh cream for richness",
        "Garnish with butter and cream"
      ],
      alternatives: ["Dal Tadka", "Rajma Chawal", "Chole Chawal"]
    },
    {
      id: 5,
      name: "Butter Chicken with Naan",
      calories: 550,
      protein: 35,
      carbs: 45,
      fats: 22,
      portion: "1 serving",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
      preparationTime: "40 mins",
      cookingTime: "30 mins",
      difficulty: "medium" as const,
      instructions: [
        "Marinate chicken in yogurt and spices",
        "Prepare tomato-based gravy",
        "Cook chicken in tandoor or oven",
        "Simmer in gravy with butter and cream",
        "Serve hot with naan"
      ],
      tips: [
        "Use Kashmiri red chili for color",
        "Smoke the gravy for authentic flavor",
        "Use butter for glossy finish"
      ],
      alternatives: ["Chicken Tikka Masala", "Paneer Butter Masala", "Kadai Chicken"]
    }
  ],
  dinner: [
    {
      id: 6,
      name: "Mixed Vegetable Curry with Roti",
      calories: 380,
      protein: 12,
      carbs: 55,
      fats: 14,
      portion: "2 rotis with curry",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
      preparationTime: "20 mins",
      cookingTime: "25 mins",
      difficulty: "easy" as const,
      instructions: [
        "Prepare fresh vegetables",
        "Make onion-tomato gravy",
        "Add spices and vegetables",
        "Cook until tender",
        "Serve with hot rotis"
      ],
      tips: [
        "Use seasonal vegetables",
        "Make fresh rotis",
        "Add ghee for extra flavor"
      ],
      alternatives: ["Palak Paneer", "Bhindi Masala", "Aloo Gobi"]
    },
    {
      id: 7,
      name: "Chicken Biryani",
      calories: 480,
      protein: 28,
      carbs: 58,
      fats: 16,
      portion: "1 plate",
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
      preparationTime: "45 mins",
      cookingTime: "40 mins",
      difficulty: "hard" as const,
      instructions: [
        "Marinate chicken",
        "Prepare rice with whole spices",
        "Layer chicken and rice",
        "Dum cook with saffron",
        "Garnish and serve hot"
      ],
      tips: [
        "Use long grain basmati rice",
        "Layer with fried onions",
        "Add kewra water for aroma"
      ],
      alternatives: ["Veg Biryani", "Pulao", "Jeera Rice"]
    }
  ]
};

// Add Indian grocery categories
const indianGroceryList = [
  {
    category: "Dals & Legumes",
    items: [
      "Toor Dal",
      "Moong Dal",
      "Masoor Dal",
      "Urad Dal",
      "Chana Dal",
      "Rajma",
      "Chole"
    ]
  },
  {
    category: "Spices & Masalas",
    items: [
      "Haldi (Turmeric)",
      "Jeera (Cumin)",
      "Dhania (Coriander)",
      "Garam Masala",
      "Red Chili Powder",
      "Ginger Garlic Paste",
      "Kitchen King Masala"
    ]
  },
  {
    category: "Atta & Grains",
    items: [
      "Whole Wheat Atta",
      "Basmati Rice",
      "Poha",
      "Besan",
      "Sooji (Semolina)",
      "Rice Flour"
    ]
  },
  {
    category: "Fresh Produce",
    items: [
      "Onions",
      "Tomatoes",
      "Potatoes",
      "Green Chilies",
      "Ginger",
      "Garlic",
      "Coriander Leaves",
      "Curry Leaves"
    ]
  },
  {
    category: "Dairy & Proteins",
    items: [
      "Paneer",
      "Curd",
      "Ghee",
      "Milk",
      "Fresh Cream",
      "Butter",
      "Eggs"
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