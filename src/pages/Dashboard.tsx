import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { Activity, Award, Calendar, Clock, Crown, Dumbbell, Target, TrendingUp, User, Scan, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../types/profile';
import StreakCounter from '../components/StreakCounter';
import { getAchievements, updateAchievement, checkStreakAchievements, checkWorkoutAchievements } from '../services/AchievementService';
import { attendanceService } from '../services/AttendanceService';
import { useAuth } from '../context/AuthContext';
import ProfileSetupModal from '../components/ProfileSetupModal';
import WaterIntakeCard from '../components/WaterIntakeCard';
import { format } from 'date-fns';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface AttendanceStats {
  totalPresent: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: any;
}

export default function Dashboard() {
  const { profile, loading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    membership: Membership | null;
    error: string | null;
  }>({ isActive: false, membership: null, error: null });
  const [streak, setStreak] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [showStreakBrokenAlert, setShowStreakBrokenAlert] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showAttendanceReminder, setShowAttendanceReminder] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    // Load attendance stats
    const loadAttendanceStats = async () => {
      try {
        const stats = await attendanceService.getAttendanceStats(profile.id);
        setAttendanceStats(stats);
        
        // Update streak from attendance stats
        if (stats) {
          setStreak(stats.currentStreak);
          if (stats.lastAttendance) {
            setLastWorkoutDate(stats.lastAttendance.toDate().toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error loading attendance stats:', error);
      }
    };

    loadAttendanceStats();
    
    // Load achievements
    setAchievements(getAchievements());

    // Setup realtime listener for attendance
    attendanceService.setupRealtimeListener(profile.id);

    return () => {
      attendanceService.cleanup();
    };
  }, [profile?.id]);

  // Update achievements based on attendance stats
  useEffect(() => {
    if (!attendanceStats) return;

    const milestones = [
      { days: 1, id: 'first-attendance' },
      { days: 7, id: 'week-regular' },
      { days: 21, id: 'gym-enthusiast' },
      { days: 30, id: 'monthly-dedication' },
      { days: 50, id: 'fitness-warrior' },
      { days: 100, id: 'gym-legend' }
    ];

    // Check total attendance achievements
    const totalMilestone = milestones.find(m => m.days === attendanceStats.totalPresent);
    if (totalMilestone) {
      const { achievements: updatedAchievements } = updateAchievement(totalMilestone.id);
      setAchievements(updatedAchievements);
    }

    // Check streak achievements
    const streakMilestone = milestones.find(m => m.days === attendanceStats.currentStreak);
    if (streakMilestone) {
      const { achievements: updatedAchievements } = updateAchievement(`streak-${streakMilestone.id}`);
      setAchievements(updatedAchievements);
    }
  }, [attendanceStats]);

  // Add membership status check
  useEffect(() => {
    if (!user?.uid) return;

    const fetchMembershipStatus = async () => {
      const status = await checkMembershipStatus(user.uid);
      setMembershipStatus(status);
    };

    fetchMembershipStatus();

    // Set up an interval to check membership status every minute
    const intervalId = setInterval(fetchMembershipStatus, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    // Show setup modal if profile is incomplete
    if (profile && (!profile.username || !profile.photoURL)) {
      setShowSetupModal(true);
    }
  }, [profile]);

  // Add this useEffect to check today's attendance
  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!profile?.id) return;

      try {
        const today = new Date();
        const records = await attendanceService.getAttendanceRecords(profile.id);
        const todayRecord = records.find(record => 
          format(record.date.toDate(), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        );

        setShowAttendanceReminder(!todayRecord);
      } catch (error) {
        console.error('Error checking attendance:', error);
      }
    };

    checkTodayAttendance();
  }, [profile?.id]);

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

  // Add attendance reminder component
  const renderAttendanceReminder = () => {
    return null;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 pb-20 sm:pb-24 max-w-5xl">
          {/* Streak Broken Alert - Make more visible on mobile */}
          {showStreakBrokenAlert && (
            <div className="fixed top-4 right-4 left-4 sm:left-auto bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white px-4 py-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-in-right z-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-full">
                  <Activity className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Streak Lost</h3>
                  <p className="text-gray-600 dark:text-gray-300">Start a new streak today!</p>
                </div>
                <button 
                  onClick={() => setShowStreakBrokenAlert(false)}
                  className="ml-auto p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Hero Section - Optimize for mobile */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-5 sm:mb-8 shadow-lg">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
              <Dumbbell className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col items-start gap-4 mb-5 sm:mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Hi, {profile?.username || 'Athlete'}
                  </h1>
                  <p className="text-emerald-50 mt-1 text-base sm:text-lg">Let's crush your fitness goals today</p>
                </div>
                
                {/* Current Streak Display */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl w-full sm:w-auto px-4 py-3 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Current Streak</p>
                    <p className="text-white text-xl font-bold">{attendanceStats?.currentStreak || 0} days</p>
                  </div>
                </div>
              </div>
              
              {/* Single Action Button - Make larger touch target for mobile */}
              <button
                onClick={() => navigate('/attendance')}
                className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
              >
                <Scan className="w-5 h-5" />
                Mark Attendance
              </button>
            </div>
          </div>

          {/* Attendance Reminder - Mobile optimized */}
          {showAttendanceReminder && (
            <div className="mb-5 sm:mb-8 animate-slide-in-bottom">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      Mark Your Attendance
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Don't forget to mark your attendance for today's workout session!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate('/attendance')}
                        className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-md"
                      >
                        <Scan className="w-4 h-4" />
                        Mark Attendance
                      </button>
                      <button
                        onClick={() => setShowAttendanceReminder(false)}
                        className="px-5 py-3.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors text-center"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAttendanceReminder(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Today's Workout Section - Mobile optimized */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl mb-5 sm:mb-8 transition-all hover:shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
              <Dumbbell className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Today's Workout
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-white/90 max-w-xl">
                  Ready to crush your fitness goals? Start your workout now!
                </p>
                <button
                  onClick={() => navigate('/workouts')}
                  className="w-full bg-white text-red-600 px-5 py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <Dumbbell className="w-5 h-5" />
                  Start Workout
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid - Mobile optimized */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-5 sm:mb-8">
            {/* Attendance Streak Card */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Attendance Streak</h2>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-500">
                    {attendanceStats?.currentStreak || 0}
                  </span>
                  <span className="ml-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Current Streak</p>
              </div>
            </div>

            {/* Total Present Days */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Total Present</h2>
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-500">
                    {attendanceStats?.totalPresent || 0}
                  </span>
                  <span className="ml-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Total Attendance</p>
              </div>
            </div>

            {/* Longest Streak */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Best Streak</h2>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-full">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-bold text-yellow-500">
                    {attendanceStats?.longestStreak || 0}
                  </span>
                  <span className="ml-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Longest Streak</p>
              </div>
            </div>

            {/* Last Visit */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Last Visit</h2>
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-full">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg sm:text-xl font-bold text-purple-500">
                  {attendanceStats?.lastAttendance 
                    ? new Date(attendanceStats.lastAttendance.toDate()).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
                    : 'None'}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Last Check-in</p>
              </div>
            </div>
          </div>

          {/* Water Intake Section - Mobile optimized */}
          <div className="mb-5 sm:mb-8">
            <WaterIntakeCard 
              dailyGoal={2500}
              onUpdate={(amount) => {
                // TODO: Implement water intake tracking in the backend
                console.log('Water intake updated:', amount);
              }}
            />
          </div>

          {/* Main Content - Mobile Optimized */}
          <div className="space-y-5 sm:space-y-6">
            {/* Achievements - Mobile Optimized */}
            <div 
              className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => navigate('/achievements')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full text-white">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Achievements</h2>
              </div>
              
              <div className="flex flex-wrap items-center justify-between bg-gray-50 dark:bg-gray-800/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {achievements
                    .filter(a => a.unlocked)
                    .slice(-3)
                    .map(achievement => (
                      <span 
                        key={achievement.id} 
                        className="text-xl sm:text-2xl flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-700 rounded-full shadow-sm" 
                        title={achievement.title}
                      >
                        {achievement.icon}
                      </span>
                    ))}
                  {achievements.filter(a => a.unlocked).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No achievements yet</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {achievements.filter(a => a.unlocked).length} / {achievements.length}
                  </p>
                  <span className="text-emerald-500">→</span>
                </div>
              </div>
            </div>

            {/* Membership Alert - Mobile Optimized */}
            {!membershipStatus.isActive && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Upgrade to Premium</h3>
                      <p className="text-purple-100 text-sm sm:text-base">Unlock all features and premium workouts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-md"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <ProfileSetupModal 
        isOpen={showSetupModal} 
        onClose={() => setShowSetupModal(false)} 
      />
    </>
  );
}