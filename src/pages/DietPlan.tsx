import React, { useState, memo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { usePayment } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import { 
  Clock,
  Target,
  Scale
} from 'lucide-react';
import {
  DietPlan as DietPlanType,
  generatePersonalizedDietPlan
} from '../services/DietService';

// Memoize the DietPlanCard component
const DietPlanCard = memo(({ 
  title, 
  description, 
  duration, 
  type, 
  goal, 
  image, 
  onStart 
}: { 
  title: string;
  description: string;
  duration: string;
  type: string;
  goal: string;
  image: string;
  onStart: () => void;
}) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-black/30 transition-all border border-gray-200 dark:border-gray-800">
    <div className="relative h-48">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>Duration: {duration}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Scale className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>Type: {type}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>Goal: {goal}</span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        {description}
      </p>
      <button 
        onClick={onStart}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
      >
        Start Diet Plan
      </button>
    </div>
  </div>
));

export default function DietPlan() {
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);

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

  const dietPlans = [
    {
      title: "Weight Loss Diet Plan",
      description: "Personalized diet plan focused on weight loss with balanced meals.",
      duration: "4 weeks",
      type: "Balanced",
      goal: "Weight Loss",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
      planType: "weight-loss"
    },
    {
      title: "Muscle Building Diet Plan",
      description: "High-protein diet plan designed to support muscle growth and recovery.",
      duration: "8 weeks",
      type: "High Protein",
      goal: "Muscle Gain",
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
      planType: "muscle-gain"
    },
    {
      title: "Maintenance Diet Plan",
      description: "Balanced diet plan designed to maintain current weight and support overall health.",
      duration: "Ongoing",
      type: "Balanced",
      goal: "Maintenance",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
      planType: "maintenance"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Diet Plans</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietPlans.map((plan, index) => (
            <DietPlanCard
              key={index}
              title={plan.title}
              description={plan.description}
              duration={plan.duration}
              type={plan.type}
              goal={plan.goal}
              image={plan.image}
              onStart={() => handleStartDietPlan(plan.planType)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}