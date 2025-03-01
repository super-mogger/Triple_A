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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
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

          {/* Attendance Reminder */}
          {showAttendanceReminder && (
            <div className="mb-8 animate-slide-in-bottom">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Mark Your Attendance
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Don't forget to mark your attendance for today's workout session!
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate('/attendance')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Scan className="w-4 h-4" />
                        Mark Attendance
                      </button>
                      <button
                        onClick={() => setShowAttendanceReminder(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAttendanceReminder(false)}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Today's Workout Section */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                Today's Workout
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Ready to crush your fitness goals? Start your workout now!
              </p>
              <button
                onClick={() => navigate('/workouts')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-5 h-5" />
                Start Workout
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Attendance Streak Card */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">Attendance Streak</h2>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold text-emerald-500">
                    {attendanceStats?.currentStreak || 0}
                  </span>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Streak</p>
              </div>
            </div>

            {/* Total Present Days */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">Total Present</h2>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold text-blue-500">
                    {attendanceStats?.totalPresent || 0}
                  </span>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Attendance</p>
              </div>
            </div>

            {/* Longest Streak */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">Best Streak</h2>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-3xl font-semibold text-yellow-500">
                    {attendanceStats?.longestStreak || 0}
                  </span>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Longest Streak</p>
              </div>
            </div>

            {/* Last Visit */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">Last Visit</h2>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {attendanceStats?.lastAttendance 
                    ? new Date(attendanceStats.lastAttendance.toDate()).toLocaleDateString()
                    : 'No visits yet'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last Check-in</p>
              </div>
            </div>
          </div>

          {/* Water Intake Section */}
          <div className="mb-8">
            <WaterIntakeCard 
              dailyGoal={2500}
              onUpdate={(amount) => {
                // TODO: Implement water intake tracking in the backend
                console.log('Water intake updated:', amount);
              }}
            />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
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
            {!membershipStatus.isActive && (
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

      {/* Profile Setup Modal */}
      <ProfileSetupModal 
        isOpen={showSetupModal} 
        onClose={() => setShowSetupModal(false)} 
      />
    </>
  );
}