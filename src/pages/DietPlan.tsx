import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { useDietService } from '../services/DietService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../services/FirestoreService';
import { fetchFoodImage } from '../services/DietService';
import MembershipRequired from '../components/MembershipRequired';

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
  const [cardImage, setCardImage] = useState<string>(image);
  
  const handleStartPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartPlan();
  };

  const handleCardClick = () => {
    if (isPremium && !isGenerating) {
      onClick();
    }
  };

  const getStockImage = (type: string) => {
    switch (type) {
      case 'weight-loss':
        return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
      case 'muscle-gain':
        return 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg';
      case 'balanced':
        return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
      default:
        return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      console.log(`Fetching image for: ${title}`);
      const fetchedImage = getStockImage(type);
      console.log(`Fetched image URL: ${fetchedImage}`);
      setImageError(false);
      setCardImage(fetchedImage);
    };
    loadImage();
  }, [title, type]);

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
        relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 cursor-pointer
        ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.02]'}
      `}
    >
      <div className="h-48 relative">
        <img 
          src={imageError ? getDefaultImage(type) : cardImage}
          alt={title} 
          className="object-cover w-full h-full"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {duration}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            {goal}
          </span>
        </div>
        <button
          onClick={handleStartPlan}
          className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
        >
          Start Diet Plan
        </button>
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

  const handleStartPlan = async (plan: DietPlanType) => {
    if (!profile || !user) {
      toast.error('Please log in to start a diet plan');
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
      
      const dietPlan = await generateDietPlan(userProfile, plan.type);
      
      if (!dietPlan) {
        throw new Error('Failed to generate diet plan');
      }
      
      // Save plan data to localStorage
      localStorage.setItem('selectedDietPlanType', plan.type);
      localStorage.setItem('currentDietPlan', JSON.stringify(dietPlan));
      
      // Navigate to plan details
      navigate('/diet/plan-details', { state: { plan: dietPlan } });
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast.error('Failed to generate diet plan. Please try again.');
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
    return <MembershipRequired feature="diet" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Diet Plans</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietPlans.map((plan, index) => (
            <DietPlanCard
              key={index}
              {...plan}
              onClick={() => handlePlanSelect(plan)}
              isSelected={selectedPlan?.type === plan.type}
              isPremium={isPremium}
              isGenerating={isGenerating}
              onStartPlan={() => handleStartPlan(plan)}
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