import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Scale, Target, X, Info, ArrowLeft, Droplets, Pill } from 'lucide-react';
import { WeeklyDietPlan, Food, Meal, Supplement } from '../services/DietService';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-hot-toast';

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

// Enhanced MacroCard component
const MacroCard = memo(({ label, value, percentage, unit, color }: MacroCardProps) => {
  const colorClasses = {
    protein: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    carbs: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    fats: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    calories: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.calories;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-md">
      <div className={`inline-flex items-center justify-center w-10 h-10 ${bgClass} rounded-full mb-3`}>
        {color === 'protein' && <div className="w-5 h-5 rounded-full border-4 border-current"></div>}
        {color === 'carbs' && <div className="w-5 h-5 border-4 border-current rounded-md"></div>}
        {color === 'fats' && <div className="w-5 h-1.5 bg-current rounded-full"></div>}
        {color === 'calories' && 
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{unit}</p>
      </div>
      {percentage !== undefined && (
        <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {percentage}% of daily intake
        </div>
      )}
    </div>
  );
});

// Memoize the FoodModal component with useCallback for handlers
const FoodModal = memo(({ food, onClose }: { food: Food; onClose: () => void }) => {
  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!food) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="relative">
            {food.imageUrl && (
              <img 
                src={food.imageUrl} 
                alt={food.name} 
                className="w-full h-64 object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleClose}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-500 text-white font-medium">
                  {food.category}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500 text-white font-medium">
                  {food.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{food.name}</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Prep: {food.preparationTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Cook: {food.cookingTime}</span>
              </div>
              {food.allergens && food.allergens.length > 0 && (
                <div className="flex items-center gap-2 text-sm ml-auto">
                  <span className="text-amber-500 font-medium">Allergens:</span>
                  <span className="text-gray-700 dark:text-gray-300">{food.allergens.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info size={16} className="text-emerald-500" />
                  Nutrition Facts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                    <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{food.calories} kcal</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                    <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{food.protein}g</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                    <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{food.carbs}g</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                    <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{food.fats}g</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                    <span className="text-gray-600 dark:text-gray-400">Portion Size:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{food.portionSize}</span>
                  </div>
                  {food.servings && (
                    <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                      <span className="text-gray-600 dark:text-gray-400">Servings:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{food.servings}</span>
                    </div>
                  )}
                  {food.benefits && (
                    <div className="flex justify-between p-2 rounded bg-white dark:bg-gray-800/60">
                      <span className="text-gray-600 dark:text-gray-400">Benefits:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{food.benefits}</span>
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
  const [plan, setPlan] = useState<WeeklyDietPlan | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = () => {
      try {
        // Try to get plan from navigation state first
        if (location.state?.plan) {
          setPlan(location.state.plan);
          setLoading(false);
          return;
        }

        // If not in navigation state, try localStorage
        const savedPlan = localStorage.getItem('currentDietPlan');
        if (savedPlan) {
          setPlan(JSON.parse(savedPlan));
          setLoading(false);
          return;
        }

        // If no plan is found, show error
        setError('No diet plan found. Please select a plan first.');
        setLoading(false);
      } catch (err) {
        console.error('Error loading diet plan:', err);
        setError('Failed to load diet plan. Please try again.');
        setLoading(false);
      }
    };

    loadPlan();
  }, [location.state]);

  const handleFoodClick = useCallback((food: Food) => {
    setSelectedFood(food);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedFood(null);
  }, []);

  // Memoize nutritional goals calculations
  const nutritionalGoals = useMemo(() => {
    if (!plan?.nutritionalGoals) return null;
    return {
      calories: plan.nutritionalGoals.calories,
      protein: {
        grams: plan.nutritionalGoals.protein.grams,
        percentage: plan.nutritionalGoals.protein.percentage
      },
      carbs: {
        grams: plan.nutritionalGoals.carbs.grams,
        percentage: plan.nutritionalGoals.carbs.percentage
      },
      fats: {
        grams: plan.nutritionalGoals.fats.grams,
        percentage: plan.nutritionalGoals.fats.percentage
      }
    };
  }, [plan?.nutritionalGoals]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="text-center bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Error Loading Diet Plan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'No diet plan found'}</p>
          <button
            onClick={() => navigate('/diet')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md"
          >
            Select a Diet Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section - Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
            <svg className="w-64 h-64 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          
          <div className="relative z-10">
            {/* Back Button and Title */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/diet')}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">{plan?.title}</h1>
              <span className="ml-auto px-3 py-1 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-medium">
                {plan?.level}
              </span>
            </div>

            {/* Description */}
            <p className="text-emerald-50 mb-6">
              {plan?.description}
            </p>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MacroCard
                label="Daily Calories"
                value={plan?.nutritionalGoals?.calories || 0}
                unit="kcal"
                color="calories"
              />
              <MacroCard
                label="Protein"
                value={plan?.nutritionalGoals?.protein?.grams || 0}
                percentage={plan?.nutritionalGoals?.protein?.percentage}
                unit="g"
                color="protein"
              />
              <MacroCard
                label="Carbs"
                value={plan?.nutritionalGoals?.carbs?.grams || 0}
                percentage={plan?.nutritionalGoals?.carbs?.percentage}
                unit="g"
                color="carbs"
              />
              <MacroCard
                label="Fats"
                value={plan?.nutritionalGoals?.fats?.grams || 0}
                percentage={plan?.nutritionalGoals?.fats?.percentage}
                unit="g"
                color="fats"
              />
            </div>
          </div>
        </div>

        {/* Water Intake Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white">
              <Droplets className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Daily Water Intake</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Recommended daily intake: <span className="font-semibold text-blue-600 dark:text-blue-400">{plan?.waterIntake}L</span>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">Tips for staying hydrated:</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-4 h-4 bg-blue-100 dark:bg-blue-800/60 rounded-full flex items-center justify-center text-blue-500">•</div>
                    <span>Drink water before, during, and after exercise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-4 h-4 bg-blue-100 dark:bg-blue-800/60 rounded-full flex items-center justify-center text-blue-500">•</div>
                    <span>Keep a water bottle with you throughout the day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-4 h-4 bg-blue-100 dark:bg-blue-800/60 rounded-full flex items-center justify-center text-blue-500">•</div>
                    <span>Set reminders to drink water regularly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Supplement Recommendations */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full text-white">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Supplement Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plan?.supplementation?.map((supplement: Supplement, index: number) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 shadow-md transition-all hover:shadow-lg"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{supplement.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/60 p-2 rounded">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{supplement.timing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/60 p-2 rounded">
                    <Pill className="w-4 h-4 text-purple-500" />
                    <span>{supplement.dosage}</span>
                  </div>
                  {supplement.notes && (
                    <div className="text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-purple-700 dark:text-purple-300 mt-2">
                      {supplement.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meals - Render using the MealCard component */}
        <div className="space-y-6">
          {plan.weeklyPlan?.[0]?.meals.map((meal, index) => (
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