import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Scale, Target, X, Info } from 'lucide-react';
import { DietPlan as DietPlanType, Food, DailyMeal } from '../services/DietService';
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

// Memoize the FoodModal component
const FoodModal = memo(({ food, onClose }: { food: Food; onClose: () => void }) => {
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
});

// Update MacroCard component with proper types
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
));

// Memoize the MealCard component
const MealCard = memo(({ meal, onFoodClick }: { 
  meal: DailyMeal; 
  onFoodClick: (food: Food) => void;
}) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl mb-6 overflow-hidden shadow-sm">
    <div className="flex justify-between items-center p-4 text-gray-900 dark:text-white">
      <h3 className="text-lg font-semibold capitalize">{meal.type}</h3>
      <span className="text-sm text-emerald-600 dark:text-emerald-400">{meal.time}</span>
    </div>

    <div className="space-y-px">
      {meal.foods.map((food, foodIndex) => (
        <div 
          key={foodIndex}
          onClick={() => onFoodClick(food)}
          className="flex justify-between items-start p-4 bg-gray-50 dark:bg-[#252525] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{food.name}</div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFoodClick(food);
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
));

export default function DietPlanDetails() {
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [currentDay, setCurrentDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Memoize nutritional calculations
  const nutritionalCalculations = useMemo(() => {
    if (!profileData?.stats?.weight || !profileData?.stats?.height || !profileData?.personalInfo?.age) {
      return null;
    }

        const bmr = profileData.personalInfo.gender === 'male'
          ? 88.362 + (13.397 * Number(profileData.stats.weight)) + (4.799 * Number(profileData.stats.height)) - (5.677 * Number(profileData.personalInfo.age))
          : 447.593 + (9.247 * Number(profileData.stats.weight)) + (3.098 * Number(profileData.stats.height)) - (4.330 * Number(profileData.personalInfo.age));

        const activityMultipliers = {
          sedentary: 1.2,
          'lightly-active': 1.375,
          'moderately-active': 1.55,
          'very-active': 1.725
        };
        const multiplier = activityMultipliers[profileData.preferences?.activityLevel as keyof typeof activityMultipliers] || 1.2;
        
    return {
      bmr,
      tdee: Math.round(bmr * multiplier),
      waterIntake: Math.round((Number(profileData.stats.weight) * 0.033) * 10) / 10
    };
  }, [profileData]);

  // Memoize current day plan
  const currentDayPlan = useMemo(() => {
    return selectedPlan?.schedule?.days.find(d => d.day === currentDay);
  }, [selectedPlan, currentDay]);

  useEffect(() => {
    const savedPlan = localStorage.getItem('selectedDietPlan');
    if (savedPlan && nutritionalCalculations) {
      const plan = JSON.parse(savedPlan);

        // Calculate target calories based on goal
      let targetCalories = nutritionalCalculations.tdee;
        if (plan.goal === 'weight-loss') {
        targetCalories -= 500;
        } else if (plan.goal === 'muscle-gain') {
        targetCalories += 500;
        }

        // Calculate macros based on goal
      const macros = {
        'weight-loss': { protein: 40, carbs: 30, fats: 30 },
        'muscle-gain': { protein: 35, carbs: 45, fats: 20 },
        'maintenance': { protein: 30, carbs: 40, fats: 30 }
      };
      
      const { protein, carbs, fats } = macros[plan.goal as DietGoal] || macros.maintenance;

        plan.nutritionalGoals = {
          dailyCalories: targetCalories,
        proteinPercentage: protein,
        carbsPercentage: carbs,
        fatsPercentage: fats,
        proteinGrams: Math.round((targetCalories * (protein / 100)) / 4),
        carbsGrams: Math.round((targetCalories * (carbs / 100)) / 4),
        fatsGrams: Math.round((targetCalories * (fats / 100)) / 9)
      };

      plan.waterIntake = nutritionalCalculations.waterIntake;
      setSelectedPlan(plan);
    } else if (!savedPlan) {
      navigate('/diet');
    }
  }, [navigate, nutritionalCalculations]);

  if (!selectedPlan) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlan.title}</h1>
          <button
            onClick={() => navigate('/diet')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors text-gray-700 dark:text-gray-200"
          >
            Change Diet Plan
          </button>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Plan Details</h2>
            
            {/* Macro Distribution */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <MacroCard 
                label="Daily Calories" 
                value={selectedPlan.nutritionalGoals?.dailyCalories || 0} 
                unit="kcal" 
                color="text-emerald-600" 
              />
              <MacroCard 
                label="Protein" 
                value={selectedPlan.nutritionalGoals?.proteinGrams || 0} 
                percentage={selectedPlan.nutritionalGoals?.proteinPercentage || 0} 
                unit="g" 
                color="text-blue-600" 
              />
              <MacroCard 
                label="Carbs" 
                value={selectedPlan.nutritionalGoals?.carbsGrams || 0} 
                percentage={selectedPlan.nutritionalGoals?.carbsPercentage || 0} 
                unit="g" 
                color="text-yellow-600" 
              />
              <MacroCard 
                label="Fats" 
                value={selectedPlan.nutritionalGoals?.fatsGrams || 0} 
                percentage={selectedPlan.nutritionalGoals?.fatsPercentage || 0} 
                unit="g" 
                color="text-purple-600" 
              />
            </div>

            {/* Water Intake */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Water Intake</h3>
              <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Recommended water intake</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                    {selectedPlan.waterIntake || 0}
                    <span className="text-base font-normal text-blue-500 dark:text-blue-600 ml-1">L</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">Based on your body weight and activity level</p>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.restrictions?.map((restriction, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-full text-sm"
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>

            {/* Supplementation */}
            {selectedPlan.supplementation && selectedPlan.supplementation.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommended Supplements</h3>
                <div className="grid gap-4">
                  {selectedPlan.supplementation.map((supplement, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-[#252525] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{supplement.name}</h4>
                        <span className="text-sm text-emerald-600 dark:text-emerald-500">{supplement.dosage}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{supplement.timing}</p>
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
                  : 'bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525]'
              }`}
            >
              <div className="font-medium text-sm">{day.day.slice(0, 3)}</div>
              <div className="text-xs mt-1">{day.totalDailyCalories || 0} kcal</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5" />
          <h2 className="text-xl font-semibold">{currentDay}'s Meals</h2>
        </div>

        {currentDayPlan?.meals.map((meal, index) => (
          <MealCard 
            key={index}
            meal={meal} 
            onFoodClick={(food) => setSelectedFood(food)} 
          />
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