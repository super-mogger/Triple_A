import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Scale, Target, X } from 'lucide-react';
import { DietPlan as DietPlanType, Food, DailyMeal, WeeklyDietPlan } from '../services/DietService';

interface FoodModalProps {
  food: Food;
  onClose: () => void;
}

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

function FoodModal({ food, onClose }: FoodModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {food.imageUrl && (
            <img 
              src={food.imageUrl} 
              alt={food.name} 
              className="w-full h-64 object-cover"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{food.name}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {food.category}
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {food.difficulty}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
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

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Nutrition Facts</h3>
              <div className="space-y-2">
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Portion Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{food.portion}</span>
                </div>
                {food.alternatives && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Alternatives: {food.alternatives.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {food.instructions && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {food.instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {food.tips && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pro Tips</h3>
              <ul className="list-disc list-inside space-y-2">
                {food.tips.map((tip, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DietPlanDetails() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('selectedDietPlan');
    if (!savedPlan) {
      navigate('/diet');
      return;
    }
    const plan: DietPlanType = JSON.parse(savedPlan);
    
    // Calculate totals for each meal
    if (plan.schedule?.days) {
      plan.schedule.days = plan.schedule.days.map(day => {
        day.meals = day.meals.map((meal: DailyMeal) => {
          const totals = meal.foods.reduce((acc: DayTotals, food: Food) => ({
            calories: acc.calories + food.calories,
            protein: acc.protein + food.protein,
            carbs: acc.carbs + food.carbs,
            fats: acc.fats + food.fats
          }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

          return {
            ...meal,
            totalCalories: totals.calories,
            totalProtein: totals.protein,
            totalCarbs: totals.carbs,
            totalFats: totals.fats
          };
        });

        // Calculate daily totals
        day.totalDailyCalories = day.meals.reduce((acc: number, meal: DailyMeal) => acc + (meal.totalCalories || 0), 0);
        return day;
      });
    }

    // Set default nutritional goals if not present
    if (!plan.nutritionalGoals) {
      plan.nutritionalGoals = {
        dailyCalories: plan.schedule?.days[0]?.totalDailyCalories || 2000,
        proteinPercentage: 30,
        carbsPercentage: 40,
        fatsPercentage: 30
      };
    }

    setSelectedPlan(plan);
  }, [navigate]);

  if (!selectedPlan) return null;

  const toggleMeal = (mealType: string) => {
    setExpandedMeal(expandedMeal === mealType ? null : mealType);
  };

  const currentDayPlan = selectedPlan.schedule?.days.find(d => d.day === currentDay);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedPlan.description}</p>
          </div>
          <button
            onClick={() => navigate('/diet')}
            className="bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            Change Plan
          </button>
        </div>

        {/* Plan Overview */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Plan Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Calories</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currentDayPlan?.totalDailyCalories || selectedPlan.nutritionalGoals?.dailyCalories} kcal
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Macros Split</div>
              <div className="flex gap-4">
                <span className="text-blue-600 dark:text-blue-400">P: {selectedPlan.nutritionalGoals?.proteinPercentage}%</span>
                <span className="text-yellow-600 dark:text-yellow-400">C: {selectedPlan.nutritionalGoals?.carbsPercentage}%</span>
                <span className="text-purple-600 dark:text-purple-400">F: {selectedPlan.nutritionalGoals?.fatsPercentage}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Water Intake</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentDayPlan?.waterIntake || 2.5}L
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {selectedPlan.schedule?.days.map((day) => (
            <button
              key={day.day}
              onClick={() => setCurrentDay(day.day)}
              className={`p-4 rounded-lg text-center transition-all ${
                currentDay === day.day
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525] border border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="font-medium text-sm">{day.day.slice(0, 3)}</div>
              <div className="text-xs mt-1 opacity-80">{day.totalDailyCalories} kcal</div>
            </button>
          ))}
        </div>

        {/* Daily Meals */}
        {currentDayPlan?.meals.map((meal, index) => (
          <div 
            key={index}
            onClick={() => toggleMeal(meal.type)}
            className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{meal.type}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
            </div>
            <div className={`space-y-4 ${expandedMeal === meal.type ? 'block' : 'hidden'}`}>
              {meal.foods.map((food, foodIndex) => (
                <div 
                  key={foodIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFood(food);
                  }}
                  className="flex justify-between items-start p-4 bg-gray-50 dark:bg-[#252525] rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Portion: {food.portion}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">{food.calories} kcal</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {meal.totalCalories} kcal
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFood && (
        <FoodModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
        />
      )}
    </div>
  );
} 