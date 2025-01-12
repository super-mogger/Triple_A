import { useProfile } from '../context/ProfileContext';

export interface Food {
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

// Add meal-specific image constants
const MEAL_IMAGES = {
  breakfast: {
    oatmeal: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af',
    yogurtParfait: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    smoothieBowl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
    proteinPancakes: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93'
  },
  lunch: {
    chickenSalad: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
    quinoaBowl: 'https://images.unsplash.com/photo-1546007600-8e2e3fc7f785',
    chickenRiceBowl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19'
  },
  dinner: {
    salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
    turkeyMeatballs: 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
    steak: 'https://images.unsplash.com/photo-1544025162-d76694265947'
  },
  snacks: {
    appleAlmondButter: 'https://images.unsplash.com/photo-1479490382520-5e9f356135a7',
    nuts: 'https://images.unsplash.com/photo-1525351326368-efbb5cb6814d',
    fruits: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7'
  },
  dietPlans: {
    weightLoss: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    muscleGain: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
    keto: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    balanced: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    vegetarian: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'
  },
  vegetarian: {
    breakfast: {
      overnightOats: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2',
      avocadoToast: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2',
      tofuScramble: 'https://images.unsplash.com/photo-1543362905-f2423ef4e0f8'
    },
    lunch: {
      buddahBowl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      veggieBurger: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
      quinoaSalad: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71'
    },
    dinner: {
      stirFryTofu: 'https://images.unsplash.com/photo-1547592180-85f173990554',
      lentilCurry: 'https://images.unsplash.com/photo-1546833998-877b37c2e604',
      veggiePasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'
    }
  }
};

// Update the mock diet database with specific images
const dietDatabase = {
  weightLoss: {
    breakfast: [
      {
        name: 'Oatmeal with Banana',
        calories: 350,
        protein: 12,
        carbs: 65,
        fats: 6,
        portion: '1 bowl',
        category: 'Whole Grains',
        preparationTime: '5 mins',
        cookingTime: '10 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.breakfast.oatmeal,
        instructions: [
          'Cook oatmeal with water or low-fat milk',
          'Add sliced banana',
          'Optional: add cinnamon for taste'
        ],
        tips: [
          'Use steel-cut oats for better nutrition',
          'Add protein powder to increase protein content',
          'Prepare overnight oats for convenience'
        ],
        allergens: ['Gluten'],
        alternatives: [
          'Quinoa porridge',
          'Buckwheat porridge',
          'Chia seed pudding'
        ]
      },
      {
        name: 'Greek Yogurt Parfait',
        calories: 280,
        protein: 20,
        carbs: 30,
        fats: 8,
        portion: '1 cup',
        category: 'Dairy',
        preparationTime: '5 mins',
        cookingTime: '0 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.breakfast.yogurtParfait,
        instructions: [
          'Layer Greek yogurt with berries',
          'Add honey for sweetness',
          'Top with granola'
        ],
        tips: [
          'Use 0% fat Greek yogurt to reduce calories',
          'Make your own sugar-free granola',
          'Add chia seeds for extra nutrients'
        ],
        allergens: ['Dairy', 'Nuts'],
        alternatives: [
          'Coconut yogurt parfait',
          'Soy yogurt parfait',
          'Smoothie bowl'
        ]
      },
      {
        name: 'Protein Smoothie Bowl',
        calories: 320,
        protein: 25,
        carbs: 45,
        fats: 7,
        portion: '1 bowl',
        category: 'Smoothies',
        preparationTime: '10 mins',
        cookingTime: '0 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.breakfast.smoothieBowl,
        instructions: [
          'Blend protein powder with frozen fruits',
          'Add almond milk and blend until smooth',
          'Top with fresh fruits and seeds'
        ],
        tips: [
          'Use frozen banana for creamier texture',
          'Add spinach for extra nutrients',
          'Top with low-calorie fruits'
        ],
        allergens: ['Dairy', 'Soy'],
        alternatives: [
          'Acai bowl',
          'Green smoothie bowl',
          'Protein pancakes'
        ]
      }
    ],
    lunch: [
      {
        name: 'Grilled Chicken Salad',
        calories: 350,
        protein: 35,
        carbs: 15,
        fats: 18,
        portion: '1 plate',
        category: 'Protein',
        preparationTime: '15 mins',
        cookingTime: '15 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.lunch.chickenSalad,
        instructions: [
          'Grill chicken breast',
          'Mix fresh vegetables',
          'Add light dressing'
        ],
        tips: [
          'Marinate chicken for better flavor',
          'Use mixed greens for variety',
          'Make your own healthy dressing'
        ],
        allergens: [],
        alternatives: [
          'Grilled tofu salad',
          'Tuna salad',
          'Chickpea salad'
        ]
      },
      {
        name: 'Quinoa Buddha Bowl',
        calories: 380,
        protein: 15,
        carbs: 45,
        fats: 16,
        portion: '1 bowl',
        category: 'Vegetarian',
        preparationTime: '15 mins',
        cookingTime: '20 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.lunch.quinoaBowl,
        instructions: [
          'Cook quinoa according to package',
          'Roast vegetables',
          'Assemble bowl with dressing'
        ],
        tips: [
          'Prep ingredients in advance',
          'Use seasonal vegetables',
          'Add seeds for extra protein'
        ],
        allergens: [],
        alternatives: [
          'Brown rice bowl',
          'Cauliflower rice bowl',
          'Couscous bowl'
        ]
      }
    ],
    dinner: [
      {
        name: 'Baked Salmon',
        calories: 400,
        protein: 46,
        carbs: 0,
        fats: 22,
        portion: '200g',
        category: 'Fish',
        preparationTime: '10 mins',
        cookingTime: '15 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.dinner.salmon,
        instructions: [
          'Season salmon fillet',
          'Bake at 400°F for 12-15 minutes',
          'Serve with vegetables'
        ],
        tips: [
          'Check for doneness at 12 minutes',
          'Use fresh herbs for flavor',
          'Pair with roasted vegetables'
        ],
        allergens: ['Fish'],
        alternatives: [
          'Baked cod',
          'Grilled chicken breast',
          'Baked tofu'
        ]
      },
      {
        name: 'Turkey Meatballs with Zucchini Noodles',
        calories: 380,
        protein: 35,
        carbs: 12,
        fats: 20,
        portion: '1 plate',
        category: 'Protein',
        preparationTime: '20 mins',
        cookingTime: '20 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.dinner.turkeyMeatballs,
        instructions: [
          'Form and cook turkey meatballs',
          'Spiralize zucchini',
          'Combine with marinara sauce'
        ],
        tips: [
          'Use lean turkey meat',
          "Don't overcook zucchini noodles",
          'Make extra for meal prep'
        ],
        allergens: ['Eggs'],
        alternatives: [
          'Chicken meatballs',
          'Lentil meatballs',
          'Regular pasta for non-low-carb'
        ]
      }
    ],
    snacks: [
      {
        name: 'Apple with Almond Butter',
        calories: 200,
        protein: 5,
        carbs: 25,
        fats: 12,
        portion: '1 apple + 2 tbsp almond butter',
        category: 'Snacks',
        preparationTime: '2 mins',
        cookingTime: '0 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.snacks.appleAlmondButter,
        instructions: [
          'Slice apple',
          'Serve with almond butter'
        ],
        tips: [
          'Choose organic apples',
          'Use natural almond butter',
          'Portion control the nut butter'
        ],
        allergens: ['Nuts'],
        alternatives: [
          'Pear with peanut butter',
          'Banana with sunflower seed butter',
          'Celery with nut butter'
        ]
      }
    ]
  },
  muscleGain: {
    breakfast: [
      {
        name: 'Protein Pancakes',
        calories: 450,
        protein: 35,
        carbs: 45,
        fats: 12,
        portion: '3 pancakes',
        category: 'Breakfast',
        preparationTime: '15 mins',
        cookingTime: '10 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.breakfast.proteinPancakes,
        instructions: [
          'Mix protein powder with pancake mix',
          'Cook on medium heat',
          'Top with maple syrup'
        ]
      }
    ],
    lunch: [
      {
        name: 'Chicken Rice Bowl',
        calories: 650,
        protein: 45,
        carbs: 75,
        fats: 15,
        portion: '1 bowl',
        category: 'Protein',
        preparationTime: '20 mins',
        cookingTime: '25 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.lunch.chickenRiceBowl,
        instructions: [
          'Cook brown rice',
          'Grill chicken breast',
          'Add vegetables and sauce'
        ]
      }
    ],
    dinner: [
      {
        name: 'Steak and Sweet Potato',
        calories: 700,
        protein: 50,
        carbs: 45,
        fats: 25,
        portion: '1 plate',
        category: 'Protein',
        preparationTime: '15 mins',
        cookingTime: '20 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.dinner.steak,
        instructions: [
          'Cook steak to desired doneness',
          'Bake sweet potato',
          'Serve with vegetables'
        ]
      }
    ]
  }
};

// Add vegetarian alternatives to the diet database
const vegetarianDatabase = {
  weightLoss: {
    breakfast: [
      {
        name: 'Overnight Oats with Berries',
        calories: 320,
        protein: 12,
        carbs: 55,
        fats: 8,
        portion: '1 bowl',
        category: 'Whole Grains',
        preparationTime: '5 mins (plus overnight)',
        cookingTime: '0 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.vegetarian.breakfast.overnightOats,
        instructions: [
          'Mix oats with plant-based milk',
          'Add chia seeds and berries',
          'Refrigerate overnight'
        ],
        tips: [
          'Use almond or soy milk for extra protein',
          'Add nuts for healthy fats',
          'Top with fresh fruits in the morning'
        ],
        allergens: ['Gluten'],
        alternatives: [
          'Chia pudding',
          'Quinoa porridge',
          'Muesli bowl'
        ]
      },
      {
        name: 'Avocado Toast with Chickpeas',
        calories: 350,
        protein: 15,
        carbs: 40,
        fats: 18,
        portion: '2 slices',
        category: 'Vegetarian',
        preparationTime: '10 mins',
        cookingTime: '0 mins',
        difficulty: 'easy' as const,
        imageUrl: MEAL_IMAGES.vegetarian.breakfast.avocadoToast,
        instructions: [
          'Mash avocado with lemon and seasonings',
          'Toast whole grain bread',
          'Top with mashed chickpeas and microgreens'
        ],
        tips: [
          'Use sprouted bread for extra nutrients',
          'Add nutritional yeast for B12',
          'Season with turmeric for anti-inflammatory benefits'
        ],
        allergens: ['Gluten'],
        alternatives: [
          'Sweet potato toast',
          'Gluten-free bread option',
          'Rice cakes'
        ]
      }
    ],
    lunch: [
      {
        name: 'Buddha Bowl with Tofu',
        calories: 380,
        protein: 20,
        carbs: 45,
        fats: 16,
        portion: '1 bowl',
        category: 'Vegetarian',
        preparationTime: '20 mins',
        cookingTime: '15 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.vegetarian.lunch.buddahBowl,
        instructions: [
          'Bake marinated tofu cubes',
          'Cook quinoa and prepare vegetables',
          'Assemble bowl with tahini dressing'
        ],
        tips: [
          'Press tofu for better texture',
          'Use colorful vegetables for nutrients',
          'Make extra for meal prep'
        ],
        allergens: ['Soy', 'Sesame'],
        alternatives: [
          'Tempeh bowl',
          'Chickpea bowl',
          'Edamame bowl'
        ]
      }
    ],
    dinner: [
      {
        name: 'Lentil and Spinach Curry',
        calories: 350,
        protein: 18,
        carbs: 45,
        fats: 12,
        portion: '1 bowl',
        category: 'Vegetarian',
        preparationTime: '15 mins',
        cookingTime: '25 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.vegetarian.dinner.lentilCurry,
        instructions: [
          'Cook red lentils with spices',
          'Add spinach and coconut milk',
          'Serve with brown rice or quinoa'
        ],
        tips: [
          'Use fresh spices for better flavor',
          'Add turmeric for anti-inflammatory benefits',
          'Make extra for freezing'
        ],
        allergens: [],
        alternatives: [
          'Chickpea curry',
          'Bean curry',
          'Vegetable curry'
        ]
      }
    ]
  },
  muscleGain: {
    breakfast: [
      {
        name: 'Tofu Scramble with Vegetables',
        calories: 400,
        protein: 25,
        carbs: 30,
        fats: 20,
        portion: '1 plate',
        category: 'Vegetarian',
        preparationTime: '10 mins',
        cookingTime: '15 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.vegetarian.breakfast.tofuScramble,
        instructions: [
          'Crumble and season tofu',
          'Sauté vegetables',
          'Combine with nutritional yeast'
        ],
        tips: [
          'Use firm tofu for best texture',
          'Add black salt for eggy flavor',
          'Include protein-rich vegetables'
        ],
        allergens: ['Soy'],
        alternatives: [
          'Chickpea scramble',
          'Tempeh scramble',
          'Quinoa breakfast bowl'
        ]
      }
    ],
    lunch: [
      {
        name: 'High-Protein Quinoa Bowl',
        calories: 550,
        protein: 28,
        carbs: 65,
        fats: 22,
        portion: '1 large bowl',
        category: 'Vegetarian',
        preparationTime: '15 mins',
        cookingTime: '20 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.vegetarian.lunch.buddahBowl,
        instructions: [
          'Cook quinoa with vegetable broth',
          'Prepare tempeh or seitan',
          'Add roasted vegetables and seeds'
        ],
        tips: [
          'Use a mix of seeds for extra protein',
          'Add nutritional yeast for B-vitamins',
          'Include legumes for protein boost'
        ],
        allergens: ['Soy', 'Gluten'],
        alternatives: [
          'Brown rice bowl',
          'Amaranth bowl',
          'Buckwheat bowl'
        ]
      }
    ],
    dinner: [
      {
        name: 'Protein-Packed Stir-Fried Tofu',
        calories: 600,
        protein: 35,
        carbs: 50,
        fats: 25,
        portion: '1 large plate',
        category: 'Vegetarian',
        preparationTime: '20 mins',
        cookingTime: '15 mins',
        difficulty: 'medium' as const,
        imageUrl: MEAL_IMAGES.vegetarian.dinner.stirFryTofu,
        instructions: [
          'Press and marinate tofu',
          'Stir-fry with high-protein vegetables',
          'Serve with brown rice or quinoa'
        ],
        tips: [
          'Use extra-firm tofu for best results',
          'Add edamame for extra protein',
          'Include seitan or tempeh for variety'
        ],
        allergens: ['Soy'],
        alternatives: [
          'Tempeh stir-fry',
          'Seitan stir-fry',
          'Legume and vegetable stir-fry'
        ]
      }
    ]
  }
};

// Modify the generateWeeklyDietPlan function to handle vegetarian option
function generateWeeklyDietPlan(goal: string, dietType: string, isVegetarian: boolean = false): WeeklyDietPlan {
  const meals = isVegetarian ? vegetarianDatabase[goal.toLowerCase().includes('muscle') ? 'muscleGain' : 'weightLoss'] 
                            : dietDatabase[goal.toLowerCase().includes('muscle') ? 'muscleGain' : 'weightLoss'];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    days: days.map(day => ({
      day,
      meals: [
        {
          type: 'breakfast',
          time: '7:00 AM',
          foods: [meals.breakfast[Math.floor(Math.random() * meals.breakfast.length)]]
        },
        {
          type: 'lunch',
          time: '12:30 PM',
          foods: [meals.lunch[Math.floor(Math.random() * meals.lunch.length)]]
        },
        {
          type: 'dinner',
          time: '7:00 PM',
          foods: [meals.dinner[Math.floor(Math.random() * meals.dinner.length)]]
        }
      ],
      waterIntake: 2.5,
      supplementRecommendations: isVegetarian ? [
        'Vitamin B12 supplement',
        'Plant-based protein powder',
        'Iron supplement (if needed)',
        'Vitamin D supplement'
      ] : undefined
    }))
  };
}

// Update generatePersonalizedDietPlan to include vegetarian option
export function generatePersonalizedDietPlan(profileData: any): DietPlan {
  const { preferences } = profileData;
  const goal = preferences?.goal || 'weight loss';
  const dietType = preferences?.dietType || 'balanced';
  const isVegetarian = preferences?.isVegetarian || false;

  const schedule = generateWeeklyDietPlan(goal, dietType, isVegetarian);

  return {
    title: `${isVegetarian ? 'Vegetarian ' : ''}${goal.charAt(0).toUpperCase() + goal.slice(1)} Diet Plan`,
    description: `Personalized ${isVegetarian ? 'vegetarian ' : ''}diet plan focused on ${goal} with ${dietType} meals.`,
    level: preferences?.fitnessLevel || 'beginner',
    duration: '4 weeks',
    goal,
    dietType,
    isVegetarian,
    imageUrl: isVegetarian ? MEAL_IMAGES.dietPlans.vegetarian : MEAL_IMAGES.dietPlans.weightLoss,
    schedule,
    supplementation: isVegetarian ? [
      {
        name: 'Vitamin B12',
        dosage: '1000mcg',
        timing: 'Daily with breakfast',
        notes: 'Essential for vegetarians/vegans'
      },
      {
        name: 'Iron',
        dosage: '18mg',
        timing: 'With vitamin C for better absorption',
        notes: 'Monitor levels through blood tests'
      }
    ] : undefined
  };
}

// Enhanced mock diet database
const mockDietPlans: DietPlan[] = [
  {
    title: 'Weight Loss Diet Plan',
    description: 'A balanced diet plan focused on sustainable weight loss through portion control and nutrient-rich foods.',
    level: 'Beginner',
    duration: '4 weeks',
    goal: 'Weight Loss',
    dietType: 'Balanced',
    imageUrl: MEAL_IMAGES.dietPlans.weightLoss,
    nutritionalGoals: {
      dailyCalories: 1800,
      proteinPercentage: 30,
      carbsPercentage: 40,
      fatsPercentage: 30
    },
    restrictions: ['No processed foods', 'Limited sugar', 'No alcohol'],
    supplementation: [
      {
        name: 'Multivitamin',
        dosage: '1 tablet',
        timing: 'Morning with breakfast',
        notes: 'Helps fill potential nutritional gaps'
      },
      {
        name: 'Omega-3',
        dosage: '1000mg',
        timing: 'With meals',
        notes: 'Supports overall health and fat loss'
      }
    ],
    mealPreparationTips: [
      'Meal prep on Sundays',
      'Use portion control containers',
      'Keep healthy snacks ready'
    ],
    groceryList: [
      {
        category: 'Proteins',
        items: ['Chicken breast', 'Salmon', 'Greek yogurt', 'Eggs']
      },
      {
        category: 'Vegetables',
        items: ['Spinach', 'Broccoli', 'Bell peppers', 'Zucchini']
      },
      {
        category: 'Fruits',
        items: ['Apples', 'Berries', 'Bananas', 'Oranges']
      },
      {
        category: 'Grains',
        items: ['Quinoa', 'Oats', 'Brown rice']
      }
    ]
  },
  {
    title: 'Muscle Building Diet Plan',
    description: 'High-protein diet plan designed to support muscle growth and recovery.',
    level: 'Intermediate',
    duration: '8 weeks',
    goal: 'Muscle Gain',
    dietType: 'High Protein',
    imageUrl: MEAL_IMAGES.dietPlans.muscleGain
  },
  {
    title: 'Keto Diet Plan',
    description: 'Low-carb, high-fat diet plan for efficient fat burning and energy optimization.',
    level: 'Advanced',
    duration: '12 weeks',
    goal: 'Fat Loss',
    dietType: 'Ketogenic',
    imageUrl: MEAL_IMAGES.dietPlans.keto
  }
];

export async function scrapeDietPlans(): Promise<DietPlan[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDietPlans);
    }, 1000);
  });
}

export const scrapeDietDetails = async (dietPlan: DietPlan): Promise<DietPlan> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const schedule = generateWeeklyDietPlan(dietPlan.goal, dietPlan.dietType);
      resolve({ ...dietPlan, schedule });
    }, 500);
  });
}; 