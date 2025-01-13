import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Scale, Target, X, Info, CalendarDays } from 'lucide-react';
import { DietPlan as DietPlanType, Food, DailyMeal, WeeklyDietPlan } from '../services/DietService';
import { useProfile } from '../context/ProfileContext';

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
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

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                      Gluten-Free Option: {food.alternatives.glutenFree.name}
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                      {food.alternatives.glutenFree.changes}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                      Lactose-Free Option: {food.alternatives.lactoseFree.name}
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-500">
                      {food.alternatives.lactoseFree.changes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DietPlanDetails() {
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const savedPlan = localStorage.getItem('selectedDietPlan');
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      
      // Calculate BMR
      if (profileData?.stats?.weight && profileData?.stats?.height && profileData?.personalInfo?.age) {
        const bmr = profileData.personalInfo.gender === 'male'
          ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
          : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));

        // Calculate activity multiplier
        const activityMultipliers = {
          sedentary: 1.2,
          'lightly-active': 1.375,
          'moderately-active': 1.55,
          'very-active': 1.725
        };
        const multiplier = activityMultipliers[profileData.preferences?.activityLevel as keyof typeof activityMultipliers] || 1.2;
        
        // Calculate TDEE
        const tdee = Math.round(bmr * multiplier);

        // Calculate target calories based on goal
        let targetCalories = tdee;
        if (plan.goal === 'weight-loss') {
          targetCalories = tdee - 500; // 500 calorie deficit
        } else if (plan.goal === 'muscle-gain') {
          targetCalories = tdee + 500; // 500 calorie surplus
        }

        // Calculate macros based on goal
        let proteinPercentage = 30;
        let carbsPercentage = 40;
        let fatsPercentage = 30;

        if (plan.goal === 'muscle-gain') {
          proteinPercentage = 35;
          carbsPercentage = 45;
          fatsPercentage = 20;
        } else if (plan.goal === 'weight-loss') {
          proteinPercentage = 40;
          carbsPercentage = 30;
          fatsPercentage = 30;
        }

        // Update nutritional goals
        plan.nutritionalGoals = {
          dailyCalories: targetCalories,
          proteinPercentage,
          carbsPercentage,
          fatsPercentage,
          proteinGrams: Math.round((targetCalories * (proteinPercentage / 100)) / 4),
          carbsGrams: Math.round((targetCalories * (carbsPercentage / 100)) / 4),
          fatsGrams: Math.round((targetCalories * (fatsPercentage / 100)) / 9)
        };

        // Calculate water intake based on weight (in liters)
        const waterIntake = Math.round((Number(profileData.stats.weight) * 0.033) * 10) / 10;
        plan.waterIntake = waterIntake;
      }

      setSelectedPlan(plan);
    } else {
      navigate('/diet');
    }
  }, [navigate, savedPlan, profileData]);

  if (!selectedPlan) return null;

  const toggleMeal = (mealType: string) => {
    setExpandedMeal(expandedMeal === mealType ? null : mealType);
  };

  const currentDayPlan = selectedPlan.schedule?.days.find(d => d.day === currentDay);

  return (
    <div className="min-h-screen bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">{selectedPlan.title}</h1>
          <button
            onClick={() => navigate('/diet')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-gray-800 hover:bg-[#252525] transition-colors text-gray-200"
          >
            Change Diet Plan
          </button>
        </div>

        <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Plan Details</h2>
            
            {/* Macro Distribution */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-[#252525] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Daily Calories</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {selectedPlan.nutritionalGoals?.dailyCalories || 0}
                  <span className="text-base font-normal text-emerald-600 ml-1">kcal</span>
                </p>
              </div>

              <div className="bg-[#252525] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Protein</p>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {selectedPlan.nutritionalGoals?.proteinPercentage || 0}
                    <span className="text-base font-normal text-blue-600 ml-1">%</span>
                  </p>
                  <p className="text-sm text-blue-400">
                    {selectedPlan.nutritionalGoals?.proteinGrams || 0}g
                  </p>
                </div>
              </div>

              <div className="bg-[#252525] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Carbs</p>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {selectedPlan.nutritionalGoals?.carbsPercentage || 0}
                    <span className="text-base font-normal text-yellow-600 ml-1">%</span>
                  </p>
                  <p className="text-sm text-yellow-400">
                    {selectedPlan.nutritionalGoals?.carbsGrams || 0}g
                  </p>
                </div>
              </div>

              <div className="bg-[#252525] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Fats</p>
                <div>
                  <p className="text-2xl font-bold text-purple-500">
                    {selectedPlan.nutritionalGoals?.fatsPercentage || 0}
                    <span className="text-base font-normal text-purple-600 ml-1">%</span>
                  </p>
                  <p className="text-sm text-purple-400">
                    {selectedPlan.nutritionalGoals?.fatsGrams || 0}g
                  </p>
                </div>
              </div>
            </div>

            {/* Water Intake */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Daily Water Intake</h3>
              <div className="bg-[#252525] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">Recommended water intake</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {selectedPlan.waterIntake || 0}
                    <span className="text-base font-normal text-blue-600 ml-1">L</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">Based on your body weight and activity level</p>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.restrictions?.map((restriction, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm"
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>

            {/* Supplementation */}
            {selectedPlan.supplementation && selectedPlan.supplementation.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Recommended Supplements</h3>
                <div className="grid gap-4">
                  {selectedPlan.supplementation.map((supplement, index) => (
                    <div key={index} className="bg-[#252525] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{supplement.name}</h4>
                        <span className="text-sm text-emerald-500">{supplement.dosage}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{supplement.timing}</p>
                      <p className="text-sm text-gray-500">{supplement.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {selectedPlan.schedule?.days.map((day) => (
            <button
              key={day.day}
              onClick={() => setCurrentDay(day.day)}
              className={`p-4 rounded-lg text-center transition-all ${
                currentDay === day.day
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#1E1E1E] text-gray-400 hover:bg-[#252525]'
              }`}
            >
              <div className="font-medium text-sm">{day.day.slice(0, 3)}</div>
              <div className="text-xs mt-1">{day.totalDailyCalories || 0} kcal</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 text-white">
          <Calendar className="w-5 h-5" />
          <h2 className="text-xl font-semibold">{currentDay}'s Meals</h2>
        </div>

        {currentDayPlan?.meals.map((meal, index) => (
          <div 
            key={index}
            className="bg-[#1E1E1E] rounded-xl mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="text-lg font-semibold capitalize">{meal.type}</h3>
              <span className="text-sm text-emerald-400">{meal.time}</span>
            </div>

            <div className="space-y-px">
              {meal.foods.map((food, foodIndex) => (
                <div 
                  key={foodIndex}
                  onClick={() => setSelectedFood(food)}
                  className="flex justify-between items-start p-4 bg-[#252525] cursor-pointer hover:bg-[#2A2A2A] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white group-hover:text-emerald-400">{food.name}</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFood(food);
                        }}
                        className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/30"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-400">Portion: {food.portion}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400">{food.calories} kcal</div>
                    <div className="text-sm text-gray-400">
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total:</span>
                <div className="text-right">
                  <span className="text-emerald-400">{meal.totalCalories} kcal</span>
                  <span className="text-gray-400 ml-2">
                    P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFats}g
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {selectedFood && (
          <FoodModal 
            food={selectedFood} 
            onClose={() => setSelectedFood(null)} 
          />
        )}
      </div>
    </div>
  );
} 