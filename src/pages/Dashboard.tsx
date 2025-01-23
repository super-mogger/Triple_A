import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { Activity, Award, Calendar, Clock, Crown, Dumbbell, Target, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import StreakCounter from '../components/StreakCounter';
import { getAchievements, updateAchievement, checkStreakAchievements, checkWorkoutAchievements } from '../services/AchievementService';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export default function Dashboard() {
  const { profile, loading } = useProfile();
  const { membership } = usePayment();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [showStreakBrokenAlert, setShowStreakBrokenAlert] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Load saved streak and achievements
    const savedStreak = localStorage.getItem('workoutStreak');
    const savedLastWorkoutDate = localStorage.getItem('lastWorkoutDate');
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    if (savedLastWorkoutDate) {
      setLastWorkoutDate(savedLastWorkoutDate);
    }

    // Load achievements
    setAchievements(getAchievements());

    // Check for streak break
    if (savedLastWorkoutDate) {
      const lastDate = new Date(savedLastWorkoutDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        handleStreakBroken();
      }
    }
  }, []);

  // Update achievements based on streak
  useEffect(() => {
    const milestones = [
      { days: 1, id: 'first-day' },
      { days: 7, id: 'week-warrior' },
      { days: 21, id: 'habit-former' },
      { days: 30, id: 'monthly-master' },
      { days: 50, id: 'half-centurion' },
      { days: 100, id: 'centurion' }
    ];

    const milestone = milestones.find(m => m.days === streak);
    if (milestone) {
      const { achievements: updatedAchievements } = updateAchievement(milestone.id);
      setAchievements(updatedAchievements);
    }
  }, [streak]);

  const handleStreakBroken = () => {
    const audio = new Audio('/sounds/streak-broken.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      console.log('Sound autoplay blocked');
    });

    setStreak(0);
    localStorage.setItem('workoutStreak', '0');
    setShowStreakBrokenAlert(true);
    
    setTimeout(() => setShowStreakBrokenAlert(false), 5000);
  };

  const markAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (lastWorkoutDate !== today) {
      setStreak(prev => {
        const newStreak = prev + 1;
        localStorage.setItem('workoutStreak', newStreak.toString());
        return newStreak;
      });
      setLastWorkoutDate(today);
      localStorage.setItem('lastWorkoutDate', today);
    }
  };

  const incrementStreak = () => {
    setStreak(prev => {
      const newStreak = prev + 1;
      localStorage.setItem('workoutStreak', newStreak.toString());
      
      // Check for achievements
      checkStreakAchievements(newStreak);
      return newStreak;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-5xl">
        {/* Streak Broken Alert */}
        {showStreakBrokenAlert && (
          <div className="fixed top-4 right-4 bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white px-6 py-3 rounded-2xl shadow-lg animate-slide-in-right">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <h3 className="font-medium">Streak Lost</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Start a new streak today!</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Hi, Athlete
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Let's stay active today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Streak Card */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-gray-900 dark:text-white">Workout Streak</h2>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold text-emerald-500">{streak}</span>
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">days</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Keep it going!</p>
            </div>
          </div>

          {/* Today's Goal */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-gray-900 dark:text-white">Today's Goal</h2>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline">
                <span className="text-3xl font-semibold text-blue-500">1</span>
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">workout</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">30 minutes target</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Today's Workout */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Today's Workout</h2>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors">
                Start
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Dumbbell className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Warm Up</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5-10 minutes</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {/* Weight */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.personal_info?.weight || 0} kg</p>
                  </div>
                </div>

                {/* Fitness Level */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fitness Level</p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.preferences?.fitness_level || 'Intermediate'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Activity Level */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activity Level</p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.preferences?.activity_level || 'Moderate'}</p>
                  </div>
                </div>

                {/* Next Workout */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Workout</p>
                    <p className="font-medium text-gray-900 dark:text-white">Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div 
            className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer"
            onClick={() => navigate('/achievements')}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Achievements</h2>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {achievements
                  .filter(a => a.unlocked)
                  .slice(-3)
                  .map(achievement => (
                    <span 
                      key={achievement.id} 
                      className="text-xl" 
                      title={achievement.title}
                    >
                      {achievement.icon}
                    </span>
                  ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {achievements.filter(a => a.unlocked).length} / {achievements.length}
              </p>
            </div>
          </div>

          {/* Membership Alert */}
          {!membership?.is_active && (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <Crown className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Upgrade to Premium</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get access to all features</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/membership')}
                  className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}