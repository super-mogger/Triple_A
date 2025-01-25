import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { usePayment } from '../context/PaymentContext';
import { useDietService } from '../services/DietService';
import { toast } from 'react-hot-toast';

interface DietPlanCardProps {
  title: string;
  description: string;
  duration: string;
  type: string;
  goal: string;
  image: string;
  onClick: () => void;
  isSelected: boolean;
  isPremium: boolean;
  isGenerating: boolean;
  onStartPlan: () => void;
}

interface DietPlanType {
  title: string;
  description: string;
  duration: string;
  type: string;
  goal: string;
  image: string;
}

// Memoized card component to prevent unnecessary re-renders
const DietPlanCard = React.memo(({ 
  title, 
  description, 
  duration, 
  type, 
  goal,
  image,
  onClick,
  isSelected,
  isPremium,
  isGenerating,
  onStartPlan
}: DietPlanCardProps) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div 
      className={`
        relative rounded-xl overflow-hidden transform transition-all duration-300
        ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.02]'}
      `}
    >
      <div 
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={image} 
            alt={title} 
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {duration}
            </span>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${type === 'weight-loss' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                type === 'muscle-gain' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}
            `}>
              {goal}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 pb-6">
        {isPremium ? (
          <button
            onClick={onStartPlan}
            disabled={!isSelected || isGenerating}
            className={`
              w-full px-4 py-3 rounded-lg font-medium transition-all duration-300
              ${!isSelected 
                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                : isGenerating
                  ? 'bg-blue-100 text-blue-400 dark:bg-blue-900/30 dark:text-blue-400 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'}
            `}
          >
            {isGenerating ? 'Generating...' : isSelected ? 'Start Plan' : 'Select Plan'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/pricing')}
            className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
});

export default function DietPlan() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { profile } = useProfile();
  const { membership, loading: membershipLoading } = usePayment();
  const { generateDietPlan } = useDietService();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isActiveMembership = useMemo(() => {
    if (membershipLoading) return false;
    if (!membership) return false;
    return membership.is_active;
  }, [membership, membershipLoading]);

  // If user has no membership, show upgrade message
  if (!isActiveMembership && !membershipLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] p-4">
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <svg 
              className="w-12 h-12 text-emerald-500 mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upgrade to Access Diet Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get access to personalized diet plans, nutrition tracking, and meal recommendations with a membership.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>Personalized meal plans</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20v-6M6 20V10M18 20V4"/>
                </svg>
                <span>Nutrition tracking</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span>Expert recommendations</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/membership')}
              className="mt-8 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              View Membership Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = useMemo(() => {
    if (membershipLoading) return false;
    if (!membership) return false;
    
    const now = new Date().getTime();
    const endDate = membership.end_date.toDate().getTime();
    
    return membership.is_active && now < endDate;
  }, [membership, membershipLoading]);

  const dietPlans = useMemo<DietPlanType[]>(() => [
    {
      title: "Weight Loss Diet Plan",
      description: "A calorie-controlled diet plan focused on sustainable fat loss while preserving muscle mass.",
      duration: "12 weeks",
      type: "weight-loss",
      goal: "Lose Fat",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
    },
    {
      title: "Muscle Building Diet Plan",
      description: "A high-protein diet plan designed to support muscle growth and strength gains.",
      duration: "12 weeks",
      type: "muscle-gain",
      goal: "Build Muscle",
      image: "https://images.unsplash.com/photo-1547496502-affa22d38842"
    },
    {
      title: "Maintenance Diet Plan",
      description: "A balanced diet plan to maintain weight and support overall health.",
      duration: "12 weeks",
      type: "maintenance",
      goal: "Stay Healthy",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352"
    }
  ], []);

  const handlePlanSelect = useCallback((plan: DietPlanType) => {
    setSelectedPlan(plan);
  }, []);

  const handleStartPlan = useCallback(async () => {
    if (!selectedPlan || !profile) return;
    
    try {
      setIsGenerating(true);
      
      // Generate personalized diet plan based on profile and selected plan type
      const dietPlan = generateDietPlan({
        weight: profile.personal_info?.weight || 0,
        height: profile.personal_info?.height || 0,
        age: profile.personal_info?.date_of_birth ? calculateAge(profile.personal_info.date_of_birth) : 25,
        gender: profile.personal_info?.gender || 'male',
        activityLevel: profile.preferences?.activity_level || 'moderate'
      }, selectedPlan.type);
      
      // Store both the plan type and the generated plan
      localStorage.setItem('selectedDietPlanType', selectedPlan.type);
      localStorage.setItem('currentDietPlan', JSON.stringify({
        ...dietPlan,
        type: selectedPlan.type,
        title: selectedPlan.title,
        description: selectedPlan.description,
        goal: selectedPlan.goal
      }));
      
      // Navigate to diet plan details page
      navigate('/diet/plan-details');
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast.error('Failed to generate diet plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPlan, profile, generateDietPlan, navigate]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!profile) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
            <p className="mb-4">Please complete your profile to get a personalized diet plan.</p>
              <button 
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
              Go to Profile
              </button>
            </div>
          </div>
            </div>
    );
  }

  if (membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Diet Plan
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a diet plan that aligns with your fitness goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietPlans.map((plan) => (
            <DietPlanCard
              key={plan.type}
              {...plan}
              onClick={() => handlePlanSelect(plan)}
              isSelected={selectedPlan?.type === plan.type}
              isPremium={isPremium}
              isGenerating={isGenerating}
              onStartPlan={handleStartPlan}
            />
          ))}
        </div>

        {!isPremium && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Upgrade to premium to access personalized diet plans
            </p>
            <p className="text-xs text-gray-400">
              Get access to all diet plans, personalized recommendations, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
}