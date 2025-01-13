import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { usePayment } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import { 
  Apple, 
  Coffee, 
  Utensils, 
  Moon,
  Plus,
  ChevronDown,
  Info,
  Search,
  X,
  Calendar,
  Filter,
  Target
} from 'lucide-react';
import {
  DietPlan as DietPlanType,
  Food,
  DailyMeal,
  WeeklyDietPlan,
  scrapeDietPlans,
  scrapeDietDetails,
  generatePersonalizedDietPlan
} from '../services/DietService';

interface Filters {
  dietType: string;
  goal: string;
  level: string;
}

export default function DietPlan() {
  const { isDarkMode } = useTheme();
  const { profileData } = useProfile();
  const { membership } = usePayment();
  const navigate = useNavigate();

  const [dietPlans, setDietPlans] = useState<DietPlanType[]>([]);
  const [filteredDietPlans, setFilteredDietPlans] = useState<DietPlanType[]>([]);
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlanType | null>(() => {
    const saved = localStorage.getItem('selectedDietPlan');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDietPlanList, setShowDietPlanList] = useState(!localStorage.getItem('selectedDietPlan'));
  const [currentDay, setCurrentDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });
  const [filters, setFilters] = useState<Filters>({
    dietType: '',
    goal: '',
    level: ''
  });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dietPlans, filters]);

  const fetchDietPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scrapeDietPlans();
      const personalPlan = generatePersonalizedDietPlan(profileData);
      setDietPlans([personalPlan, ...data]);
      setFilteredDietPlans([personalPlan, ...data]);
    } catch (err) {
      setError('Failed to load diet plans. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectDietPlan = async (dietPlan: DietPlanType) => {
    try {
      setLoading(true);
      setError(null);
      const details = await scrapeDietDetails(dietPlan);
      setSelectedDietPlan(details);
      localStorage.setItem('selectedDietPlan', JSON.stringify(details));
      setShowDietPlanList(false);
    } catch (err) {
      setError('Failed to load diet plan details. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const changeDietPlan = () => {
    setShowDietPlanList(true);
  };

  const applyFilters = () => {
    let filtered = [...dietPlans];

    if (filters.level) {
      filtered = filtered.filter(d => d.level.toLowerCase().includes(filters.level.toLowerCase()));
    }
    if (filters.goal) {
      filtered = filtered.filter(d => d.goal.toLowerCase().includes(filters.goal.toLowerCase()));
    }
    if (filters.dietType) {
      filtered = filtered.filter(d => d.dietType.toLowerCase().includes(filters.dietType.toLowerCase()));
    }

    setFilteredDietPlans(filtered);
  };

  const resetFilters = () => {
    setFilters({
      dietType: '',
      goal: '',
      level: ''
    });
  };

  const getCurrentDayMeals = () => {
    if (!selectedDietPlan?.schedule) return null;
    return selectedDietPlan.schedule.days.find(day => day.day === currentDay);
  };

  const renderMealCard = (meal: DailyMeal) => {
    const totalCalories = meal.foods.reduce((acc, food) => acc + food.calories, 0);
    const totalProtein = meal.foods.reduce((acc, food) => acc + food.protein, 0);
    const totalCarbs = meal.foods.reduce((acc, food) => acc + food.carbs, 0);
    const totalFats = meal.foods.reduce((acc, food) => acc + food.fats, 0);

    return (
      <div className="bg-[#282828] rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold capitalize">{meal.type}</h3>
          <span className="text-emerald-500">{meal.time}</span>
        </div>
        <div className="space-y-4">
          {meal.foods.map((food, index) => (
            <button
              key={index}
              className="w-full border-b border-gray-700 last:border-0 pb-4 last:pb-0 hover:bg-[#333] rounded-lg transition-colors p-4 text-left"
              onClick={() => setSelectedFood(food)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    {food.name}
                    <Info className="w-4 h-4 text-emerald-500" />
                  </h4>
                  <p className="text-sm text-gray-400">Portion: {food.portion}</p>
      </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-500">{food.calories} kcal</p>
                  <p className="text-xs text-gray-400">P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g</p>
      </div>
    </div>
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="text-emerald-500">{totalCalories} kcal | P: {totalProtein}g | C: {totalCarbs}g | F: {totalFats}g</span>
      </div>
        </div>
      </div>
    );
  };

  const renderFoodModal = () => {
    if (!selectedFood) return null;
          
          return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#1E1E1E] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold">{selectedFood.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-emerald-500">{selectedFood.category}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">
                  Prep: {selectedFood.preparationTime} | Cook: {selectedFood.cookingTime}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className={`text-sm ${
                  selectedFood.difficulty === 'easy' ? 'text-green-500' :
                  selectedFood.difficulty === 'medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {selectedFood.difficulty?.charAt(0).toUpperCase() + selectedFood.difficulty?.slice(1)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedFood(null)}
              className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedFood.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Nutrition Facts</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Calories:</span>
                  <span>{selectedFood.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Protein:</span>
                  <span>{selectedFood.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carbs:</span>
                  <span>{selectedFood.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fats:</span>
                  <span>{selectedFood.fats}g</span>
                </div>
              </div>
            </div>

            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Portion Size:</span>
                  <span>{selectedFood.portion}</span>
                </div>
                {selectedFood.allergens && selectedFood.allergens.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allergens:</span>
                    <span className="text-yellow-500">{selectedFood.allergens.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedFood.instructions && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              <div className="space-y-4">
                {selectedFood.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedFood.tips && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Pro Tips</h3>
              <div className="bg-[#282828] rounded-lg p-4">
                <ul className="space-y-2">
                  {selectedFood.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-xs mt-0.5">
                        ✓
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedFood.alternatives && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Alternatives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFood.alternatives.map((alternative, index) => (
                  <div key={index} className="bg-[#282828] p-3 rounded-lg text-gray-300">
                    {alternative}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDietPlanDetails = () => {
    if (!selectedDietPlan) return null;

    return (
      <div className="bg-[#1E1E1E] rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
        
        {selectedDietPlan.nutritionalGoals && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Daily Calories</h3>
              <p className="text-2xl font-semibold text-emerald-500">
                {selectedDietPlan.nutritionalGoals.dailyCalories}
                <span className="text-base font-normal text-gray-400 ml-1">kcal</span>
              </p>
            </div>
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Protein</h3>
              <p className="text-2xl font-semibold text-blue-500">
                {selectedDietPlan.nutritionalGoals.proteinPercentage}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </p>
            </div>
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Carbs</h3>
              <p className="text-2xl font-semibold text-yellow-500">
                {selectedDietPlan.nutritionalGoals.carbsPercentage}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </p>
            </div>
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Fats</h3>
              <p className="text-2xl font-semibold text-purple-500">
                {selectedDietPlan.nutritionalGoals.fatsPercentage}
                <span className="text-base font-normal text-gray-400 ml-1">%</span>
              </p>
            </div>
          </div>
        )}

        {selectedDietPlan.restrictions && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Dietary Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {selectedDietPlan.restrictions.map((restriction, index) => (
                <span
                  key={index}
                  className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm"
                >
                  {restriction}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedDietPlan.supplementation && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recommended Supplements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDietPlan.supplementation.map((supplement, index) => (
                <div key={index} className="bg-[#282828] p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-500">{supplement.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-400">Dosage: {supplement.dosage}</p>
                    <p className="text-gray-400">Timing: {supplement.timing}</p>
                    <p className="text-gray-400">{supplement.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDietPlan.groceryList && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Grocery List</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDietPlan.groceryList.map((category, index) => (
                <div key={index} className="bg-[#282828] p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-500 mb-2">{category.category}</h4>
                  <ul className="space-y-1">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-400 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!membership?.isActive) {
    return (
      <div className="min-h-screen bg-[#121212] text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-500 mb-2">Active Membership Required</h2>
              <p className="text-gray-400 mb-4">
                You need an active membership to access diet plans
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                View Membership Plans
              </button>
            </div>
                        </div>
                        </div>
                      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!showDietPlanList && selectedDietPlan) {
    const currentDayMeals = getCurrentDayMeals();

    return (
      <div className="min-h-screen bg-[#121212] text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{selectedDietPlan.title}</h1>
              <p className="text-gray-400 mt-2">{selectedDietPlan.description}</p>
            </div>
            <button
              onClick={changeDietPlan}
              className="w-full sm:w-auto bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Change Diet Plan
            </button>
          </div>

          {renderDietPlanDetails()}

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
            <div className="grid grid-cols-7 gap-2 min-w-[640px] sm:min-w-0">
              {selectedDietPlan.schedule?.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setCurrentDay(day.day)}
                  className={`p-3 sm:p-4 rounded-lg text-center transition-colors ${
                    currentDay === day.day
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#282828] text-gray-400 hover:bg-[#333]'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base">{day.day.slice(0, 3)}</div>
                  {day?.totalDailyCalories && (
                    <div className="text-xs mt-1 text-gray-500">
                      {day?.totalDailyCalories} kcal
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {currentDayMeals && (
            <div className="bg-[#1E1E1E] rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                {currentDayMeals.day}'s Meals
              </h2>
              {currentDayMeals.meals.map((meal, index) => (
                <div key={index}>{renderMealCard(meal)}</div>
              ))}
              
              {currentDayMeals.waterIntake && (
                <div className="mt-6 bg-blue-500/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-500 mb-2">Water Intake</h3>
                  <p className="text-gray-400">Target: {currentDayMeals.waterIntake} liters</p>
                </div>
              )}

              {currentDayMeals.supplementRecommendations && (
                <div className="mt-4 bg-purple-500/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-500 mb-2">Supplements</h3>
                  <ul className="space-y-1">
                    {currentDayMeals.supplementRecommendations.map((supp, idx) => (
                      <li key={idx} className="text-gray-400">• {supp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        {selectedFood && renderFoodModal()}
            </div>
          );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Diet Plans</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-[#1E1E1E] p-6 rounded-xl">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Diet Type</label>
              <select
                value={filters.dietType}
                onChange={(e) => setFilters({ ...filters, dietType: e.target.value })}
                className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
              >
                <option value="">All Types</option>
                <option value="balanced">Balanced</option>
                <option value="keto">Keto</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Goal</label>
              <select
                value={filters.goal}
                onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
              >
                <option value="">All Goals</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Level</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDietPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
              onClick={() => selectDietPlan(plan)}
            >
              {plan.imageUrl && (
                <img
                  src={plan.imageUrl}
                  alt={plan.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{plan.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Coffee className="w-4 h-4" />
                    <span>Type: {plan.dietType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Duration: {plan.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>Goal: {plan.goal}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{plan.description}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md animate-fade-in">
            <div className="flex items-center gap-2">
              <h3 className="text-red-500 font-medium">{error}</h3>
              <button 
                onClick={() => setError(null)}
                className="text-gray-400 hover:text-white ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}