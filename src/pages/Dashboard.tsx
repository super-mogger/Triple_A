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
  const { profileData, loading } = useProfile();
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
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-4 pb-24">
        {/* Streak Broken Alert */}
        {showStreakBrokenAlert && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💔</span>
              <div>
                <h3 className="font-semibold">Streak Lost!</h3>
                <p className="text-sm">Don't worry, start a new streak today!</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Workout Streak</h2>
          <div className="flex items-center justify-center">
            <StreakCounter 
              streak={streak} 
              label="Day Streak"
              onStreakBroken={handleStreakBroken}
            />
          </div>
        </div>

        {/* Membership Alert */}
        {!membership?.isActive && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-medium text-red-500">No Active Membership</h3>
                  <p className="text-sm text-red-400/80">Get access to all gym facilities and features</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/membership')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {profileData?.displayName || 'Athlete'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Let's achieve your fitness goals together.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Workout */}
          <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-[#282828] rounded-full">
                <Dumbbell className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Workout</p>
                <p className="text-lg font-semibold">Pending</p>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-[#282828] rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Progress</p>
                <p className="text-lg font-semibold">On Track</p>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-[#282828] rounded-full">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Goals</p>
                <p className="text-lg font-semibold">
                  {profileData?.goals?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div 
            className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
            onClick={() => navigate('/achievements')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-[#282828] rounded-full">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
                <p className="text-lg font-semibold">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </p>
                <div className="flex gap-1 mt-1">
                  {achievements
                    .filter(a => a.unlocked)
                    .slice(-3)
                    .map(achievement => (
                      <span 
                        key={achievement.id} 
                        className="text-lg" 
                        title={achievement.title}
                      >
                        {achievement.icon}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workout Plan */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Workout Plan</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#282828] rounded-xl">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-emerald-500 mr-3" />
                    <div>
                      <p className="font-medium">Warm Up</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">5-10 minutes</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-sm text-emerald-500 bg-emerald-500/10 rounded-full">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
              <div className="space-y-4">
                {/* Current Weight */}
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-[#282828] rounded-full">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Weight</p>
                    <p className="font-medium">{profileData?.stats?.weight || 73} kg</p>
                  </div>
                </div>

                {/* Fitness Level */}
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-[#282828] rounded-full">
                    <Activity className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fitness Level</p>
                    <p className="font-medium">{profileData?.preferences?.fitnessLevel || 'Intermediate'}</p>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-[#282828] rounded-full">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Activity Level</p>
                    <p className="font-medium">{profileData?.preferences?.activityLevel || 'Moderately-Active'}</p>
                  </div>
                </div>

                {/* Next Workout */}
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-[#282828] rounded-full">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next Workout</p>
                    <p className="font-medium">Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}