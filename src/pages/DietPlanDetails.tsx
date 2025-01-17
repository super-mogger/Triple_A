import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Scale, Target, X, Info, ArrowLeft, Droplets, Pill } from 'lucide-react';
import { WeeklyDietPlan, Food, Meal, Supplement } from '../services/DietService';
import { useProfile } from '../context/ProfileContext';

// Add type for goal
type DietGoal = 'weight-loss' | 'muscle-gain' | 'maintenance';

// Add type for MacroCard props
interface MacroCardProps {
  label: string;
  value: number;
  percentage?: number;
  unit: string;
  color: string;
}

// Memoize the FoodModal component with useCallback for handlers
const FoodModal = memo(({ food, onClose }: { food: Food; onClose: () => void }) => {
  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!food) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg">
          <div className="relative">
            {food.imageUrl && (
              <img 
                src={food.imageUrl} 
                alt={food.name} 
                className="w-full h-64 object-cover rounded-t-xl"
              />
            )}
            <button onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{food.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  {food.category}
                </span>
                <span className="px-3 py-1.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {food.difficulty}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock size={16} />
                <span>Prep: {food.preparationTime}</span>
                <span>|</span>
                <span>Cook: {food.cookingTime}</span>
              </div>
              {food.allergens && food.allergens.length > 0 && (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  Allergens: {food.allergens.join(', ')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Nutrition Facts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{food.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{food.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">{food.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{food.fats}g</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Portion Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{food.portion}</span>
                  </div>
                  {food.alternatives && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Available alternatives: Vegetarian, Gluten-Free, Lactose-Free
                    </div>
                  )}
                </div>
              </div>
            </div>

            {food.instructions && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Instructions</h3>
                <ol className="list-decimal list-inside space-y-3">
                  {food.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400 pl-2">{instruction}</li>
                  ))}
                </ol>
              </div>
            )}

            {food.tips && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Pro Tips</h3>
                <ul className="list-disc list-inside space-y-3">
                  {food.tips.map((tip, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400 pl-2">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {food.alternatives && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Dietary Alternatives</h3>
                <div className="space-y-4">
                  {food.alternatives.vegetarian && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                      Vegetarian Option: {food.alternatives.vegetarian.name}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {food.alternatives.vegetarian.changes}
                      {food.alternatives.vegetarian.protein && (
                        <span className="ml-2 font-medium">({food.alternatives.vegetarian.protein}g protein)</span>
                      )}
                    </p>
                  </div>
                  )}

                  {food.alternatives.glutenFree && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                      Gluten-Free Option: {food.alternatives.glutenFree.name}
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      {food.alternatives.glutenFree.changes}
                    </p>
                  </div>
                  )}

                  {food.alternatives.lactoseFree && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                      Lactose-Free Option: {food.alternatives.lactoseFree.name}
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-500">
                      {food.alternatives.lactoseFree.changes}
                    </p>
                  </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Optimize MacroCard with proper memoization
const MacroCard = memo(({ label, value, percentage, unit, color }: MacroCardProps) => (
              <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <div>
      <p className={`text-2xl font-bold text-${color}`}>
        {percentage ?? value}
        <span className="text-base font-normal ml-1">{percentage ? '%' : unit}</span>
      </p>
      {percentage && (
        <p className={`text-sm text-${color}`}>
          {value}{unit}
        </p>
            )}
          </div>
        </div>
), (prevProps, nextProps) => {
  return prevProps.value === nextProps.value && 
         prevProps.percentage === nextProps.percentage;
});

// Optimize MealCard with proper event handling
const MealCard = memo(({ meal, onFoodClick }: { 
  meal: Meal; 
  onFoodClick: (food: Food) => void;
}) => {
  const handleFoodClick = useCallback((food: Food) => {
    onFoodClick(food);
  }, [onFoodClick]);

  if (!meal) return null;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl mb-6 overflow-hidden shadow-sm">
            <div className="flex justify-between items-center p-4 text-gray-900 dark:text-white">
              <h3 className="text-lg font-semibold capitalize">{meal.type}</h3>
              <span className="text-sm text-emerald-600 dark:text-emerald-400">{meal.time}</span>
            </div>

            <div className="space-y-px">
              {meal.foods.map((food: Food, foodIndex: number) => (
                <div 
                  key={foodIndex}
            onClick={() => handleFoodClick(food)}
                  className="flex justify-between items-start p-4 bg-gray-50 dark:bg-[#252525] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{food.name}</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                    handleFoodClick(food);
                        }}
                        className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-500/30"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Portion: {food.portion}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 dark:text-emerald-400">{food.calories} kcal</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <div className="text-right">
                  <span className="text-emerald-600 dark:text-emerald-400">{meal.totalCalories} kcal</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFats}g
                  </span>
                </div>
              </div>
            </div>
          </div>
  );
});

export default function DietPlanDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [currentDayPlan, setCurrentDayPlan] = useState<Meal[] | null>(null);
  const [dietPlan, setDietPlan] = useState<WeeklyDietPlan | null>(null);

  useEffect(() => {
    const savedPlanType = localStorage.getItem('selectedDietPlanType');
    const savedPlan = localStorage.getItem('currentDietPlan');
    
    if (!savedPlanType || !savedPlan) {
      navigate('/diet');
      return;
    }

    try {
      const plan = JSON.parse(savedPlan);
      
      // Verify that the loaded plan matches the selected type
      if (plan.type !== savedPlanType) {
        console.error('Plan type mismatch, redirecting to diet selection');
        navigate('/diet');
        return;
      }

      setDietPlan(plan);

      // Set current day plan based on the first day's meals
      if (plan.weeklyPlan?.[0]?.meals) {
        setCurrentDayPlan(plan.weeklyPlan[0].meals);
      }
    } catch (error) {
      console.error('Error loading diet plan:', error);
      navigate('/diet');
    }
  }, [navigate]);

  const handleFoodClick = useCallback((food: Food) => {
    setSelectedFood(food);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedFood(null);
  }, []);

  // Memoize nutritional goals calculations
  const nutritionalGoals = useMemo(() => {
    if (!dietPlan?.nutritionalGoals) return null;
    return {
      calories: dietPlan.nutritionalGoals.calories,
      protein: {
        grams: dietPlan.nutritionalGoals.protein.grams,
        percentage: dietPlan.nutritionalGoals.protein.percentage
      },
      carbs: {
        grams: dietPlan.nutritionalGoals.carbs.grams,
        percentage: dietPlan.nutritionalGoals.carbs.percentage
      },
      fats: {
        grams: dietPlan.nutritionalGoals.fats.grams,
        percentage: dietPlan.nutritionalGoals.fats.percentage
      }
    };
  }, [dietPlan?.nutritionalGoals]);

  // Get plan type specific details
  const getPlanTypeDetails = () => {
    const planType = localStorage.getItem('selectedDietPlanType');
    
    switch (planType) {
      case 'weight-loss':
        return {
          title: 'Weight Loss Diet Plan',
          description: 'Focus on caloric deficit while maintaining nutrition',
          color: 'emerald',
          level: 'Beginner'
        };
      case 'muscle-gain':
        return {
          title: 'Muscle Building Diet Plan',
          description: 'High protein diet to support muscle growth',
          color: 'blue',
          level: 'Intermediate'
        };
      case 'maintenance':
        return {
          title: 'Maintenance Diet Plan',
          description: 'Balanced nutrition to maintain current weight',
          color: 'purple',
          level: 'All Levels'
        };
      default:
        return {
          title: 'Custom Diet Plan',
          description: 'Personalized nutrition plan',
          color: 'emerald',
          level: 'Custom'
        };
    }
  };

  const planDetails = getPlanTypeDetails();

  if (!dietPlan || !currentDayPlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 p-4 sm:p-6">
          {/* Back Button and Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/diet')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">{dietPlan?.title}</h1>
            <span className="ml-auto px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
              {dietPlan?.level}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dietPlan?.description}
          </p>

          {/* Macro Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Calories</p>
              <p className="text-lg font-semibold">{dietPlan?.nutritionalGoals?.calories} kcal</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
              <p className="text-lg font-semibold">{dietPlan?.nutritionalGoals?.protein?.grams}g</p>
              <p className="text-xs text-gray-500">{dietPlan?.nutritionalGoals?.protein?.percentage}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
              <p className="text-lg font-semibold">{dietPlan?.nutritionalGoals?.carbs?.grams}g</p>
              <p className="text-xs text-gray-500">{dietPlan?.nutritionalGoals?.carbs?.percentage}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Fats</p>
              <p className="text-lg font-semibold">{dietPlan?.nutritionalGoals?.fats?.grams}g</p>
              <p className="text-xs text-gray-500">{dietPlan?.nutritionalGoals?.fats?.percentage}%</p>
            </div>
          </div>
        </div>

        {/* Water Intake Section */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Daily Water Intake</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recommended daily intake: {dietPlan?.waterIntake}L
                </p>
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium">Tips:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>Drink water before, during, and after exercise</li>
                    <li>Keep a water bottle with you throughout the day</li>
                    <li>Set reminders to drink water regularly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplement Recommendations */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Supplement Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dietPlan?.supplementation?.map((supplement: Supplement, index: number) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2"
              >
                <h4 className="font-medium">{supplement.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{supplement.timing}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Pill className="w-4 h-4" />
                  <span>{supplement.dosage}</span>
                </div>
                {supplement.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{supplement.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-6">
          {currentDayPlan.map((meal, index) => (
            <MealCard
              key={`${meal.type}-${index}`}
              meal={meal}
              onFoodClick={handleFoodClick}
            />
          ))}
        </div>
      </div>

      {/* Food Details Modal */}
        {selectedFood && (
          <FoodModal 
            food={selectedFood} 
          onClose={closeModal}
          />
        )}
    </div>
  );
} 