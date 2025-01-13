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
  Target,
  Clock,
  Scale
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
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleStartDietPlan = async (planType: string) => {
    try {
      const plan = await generatePersonalizedDietPlan({
        ...profileData,
        goal: planType
      });
      setSelectedPlan(plan);
      localStorage.setItem('selectedDietPlan', JSON.stringify(plan));
      navigate('/diet/plan-details');
    } catch (error) {
      console.error('Error starting diet plan:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Diet Plans</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors text-gray-700 dark:text-gray-200"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Weight Loss Diet Plan */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-black/30 transition-all border border-gray-200 dark:border-gray-800">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
                alt="Weight Loss Diet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weight Loss Diet Plan</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Duration: 4 weeks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Scale className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Type: Balanced</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Goal: Weight Loss</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Personalized diet plan focused on weight loss with balanced meals.
              </p>
              <button 
                onClick={() => handleStartDietPlan('weight-loss')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Start Diet Plan
              </button>
            </div>
          </div>

          {/* Muscle Building Diet Plan */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-black/30 transition-all border border-gray-200 dark:border-gray-800">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1532550907401-a500c9a57435"
                alt="Muscle Building Diet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Muscle Building Diet Plan</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Duration: 8 weeks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Scale className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Type: High Protein</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Goal: Muscle Gain</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                High-protein diet plan designed to support muscle growth and recovery.
              </p>
              <button 
                onClick={() => handleStartDietPlan('muscle-gain')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Start Diet Plan
              </button>
            </div>
          </div>

          {/* Maintenance Diet Plan */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-black/30 transition-all border border-gray-200 dark:border-gray-800">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352"
                alt="Maintenance Diet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Maintenance Diet Plan</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Duration: Ongoing</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Scale className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Type: Balanced</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>Goal: Maintenance</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Balanced diet plan designed to maintain current weight and support overall health.
              </p>
              <button 
                onClick={() => handleStartDietPlan('maintenance')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Start Diet Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}