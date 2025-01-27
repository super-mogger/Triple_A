import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { useDietService } from '../services/DietService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../services/FirestoreService';

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
  const [imageError, setImageError] = useState(false);
  
  const handleCardClick = () => {
    if (isPremium && !isGenerating) {
      onClick();
    }
  };

  // Get default image based on plan type
  const getDefaultImage = (type: string) => {
    switch (type) {
      case 'weight-loss':
        return '/images/default-weight-loss.png';
      case 'muscle-gain':
        return '/images/default-muscle-gain.png';
      case 'balanced':
        return '/images/default-balanced.png';
      default:
        return '/images/default-diet.png';
    }
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative rounded-xl overflow-hidden transform transition-all duration-300 cursor-pointer
        ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.02]'}
      `}
    >
      <div className="h-48 relative bg-gray-100 dark:bg-gray-800">
        <img 
          src={imageError ? getDefaultImage(type) : image}
          alt={title} 
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
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

      {/* Action Button */}
      <div className="px-6 pb-6">
        {isPremium ? (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              if (isSelected) {
                onStartPlan();
              } else {
                onClick();
              }
            }}
            disabled={isGenerating}
            className={`
              w-full px-4 py-3 rounded-lg font-medium transition-all duration-300
              ${isGenerating
                ? 'bg-blue-100 text-blue-400 dark:bg-blue-900/30 dark:text-blue-400 cursor-wait'
                : isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            {isGenerating ? 'Generating...' : isSelected ? 'Start Plan' : 'Select Plan'}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              navigate('/membership');
            }}
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { profile } = useProfile();
  const { generateDietPlan } = useDietService();
  const [selectedPlan, setSelectedPlan] = useState<DietPlanType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    membership: Membership | null;
    error: string | null;
  }>({ isActive: false, membership: null, error: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchMembershipStatus = async () => {
      const status = await checkMembershipStatus(user.uid);
      setMembershipStatus(status);
      setLoading(false);
    };

    fetchMembershipStatus();
  }, [user]);

  const isPremium = useMemo(() => {
    if (!membershipStatus.membership) return false;
    if (!membershipStatus.isActive) return false;
    
    const now = new Date().getTime();
    const endDate = membershipStatus.membership.end_date?.toDate().getTime();
    
    // If we have an active membership, consider it premium even if endDate is not set
    if (membershipStatus.isActive && !endDate) return true;
    
    return membershipStatus.isActive && typeof endDate === 'number' && now < endDate;
  }, [membershipStatus]);

  const dietPlans = useMemo<DietPlanType[]>(() => [
    {
      title: "Weight Loss Plan",
      description: "Calorie-controlled diet focused on sustainable weight loss",
      duration: "12 weeks",
      type: "weight-loss",
      goal: "Lose Weight",
      image: "/images/weight-loss.png"
    },
    {
      title: "Muscle Gain Plan",
      description: "High-protein diet designed for muscle growth",
      duration: "12 weeks",
      type: "muscle-gain",
      goal: "Build Muscle",
      image: "/images/muscle-gain.png"
    },
    {
      title: "Balanced Nutrition",
      description: "Well-rounded diet for overall health and maintenance",
      duration: "12 weeks",
      type: "balanced",
      goal: "Maintain Health",
      image: "/images/balanced.png"
    }
  ], []);

  const handlePlanSelect = (plan: DietPlanType) => {
    if (!isPremium) {
      navigate('/membership');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleStartPlan = async () => {
    if (!selectedPlan || !profile || !user) {
      toast.error('Please select a plan first');
      return;
    }

    if (!isPremium) {
      navigate('/membership');
      return;
    }
    
    setIsGenerating(true);
    try {
      const userProfile = {
        weight: profile.personal_info?.weight || 70,
        height: profile.personal_info?.height || 170,
        age: profile.personal_info?.date_of_birth ? calculateAge(profile.personal_info.date_of_birth) : 25,
        gender: profile.personal_info?.gender || 'male',
        activityLevel: profile.preferences?.activity_level || 'moderate',
        userId: user.uid
      };
      
      const plan = await generateDietPlan(userProfile, selectedPlan.type);
      
      if (!plan) {
        throw new Error('Failed to generate diet plan');
      }
      
      // Save plan data to localStorage
      localStorage.setItem('selectedDietPlanType', selectedPlan.type);
      localStorage.setItem('currentDietPlan', JSON.stringify(plan));
      
      toast.success('Diet plan generated successfully!');
      navigate('/diet/plan-details');
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate diet plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!membershipStatus.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Active Membership Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please purchase a membership to access diet plan features.</p>
          <button
            onClick={() => navigate('/membership')}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            View Membership Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Diet Plans</h1>
        
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
              Upgrade to premium to access all diet plans
            </p>
            <button
              onClick={() => navigate('/membership')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
}