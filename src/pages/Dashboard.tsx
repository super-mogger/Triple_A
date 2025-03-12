import React, { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { Activity, Award, Calendar, Clock, Crown, Dumbbell, Target, TrendingUp, User, Scan, X, CheckCircle2, GiftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../types/profile';
import StreakCounter from '../components/StreakCounter';
import { getAchievements, updateAchievement, checkStreakAchievements, checkWorkoutAchievements } from '../services/AchievementService';
import { attendanceService } from '../services/AttendanceService';
import { useAuth } from '../context/AuthContext';
import ProfileSetupModal from '../components/ProfileSetupModal';
import WaterIntakeCard from '../components/WaterIntakeCard';
import { format, isToday, isTomorrow, addDays, differenceInDays, isSameDay } from 'date-fns';
import { useMembership } from '../context/MembershipContext';
import { getNextHoliday, getUpcomingHolidays, getAllHolidays } from '../services/HolidayService';
import { Holiday } from '../types/holiday';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: 'streak' | 'workout' | 'strength' | 'nutrition' | 'attendance';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AttendanceStats {
  totalPresent: number;
  currentStreak: number;
  longestStreak: number;
  lastAttendance: any;
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isActive, loading: membershipLoading } = useMembership();
  const [streak, setStreak] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [showStreakBrokenAlert, setShowStreakBrokenAlert] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPremiumAlert, setShowPremiumAlert] = useState(true);
  const [attendanceMarkedToday, setAttendanceMarkedToday] = useState(false);
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null);
  const [showHolidayAlert, setShowHolidayAlert] = useState(true);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [isTodayHoliday, setIsTodayHoliday] = useState(false);
  const [todayHoliday, setTodayHoliday] = useState<Holiday | null>(null);

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

  useEffect(() => {
    // Show setup modal if profile is incomplete
    if (profile && (!profile.username || !profile.photoURL)) {
      setShowSetupModal(true);
    }
  }, [profile]);

  // Update the useEffect to check today's attendance without setting the attendance reminder
  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!profile?.id) return;

      try {
        const today = new Date();
        const records = await attendanceService.getAttendanceRecords(profile.id);
        const todayRecord = records.find(record => 
          format(record.date.toDate(), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        );

        // Only set attendance status, not reminder
        setAttendanceMarkedToday(!!todayRecord);
      } catch (error) {
        console.error('Error checking attendance:', error);
      }
    };

    checkTodayAttendance();
  }, [profile?.id]);

  // Update effect to fetch upcoming holidays (not just next one)
  useEffect(() => {
    const fetchNextHoliday = async () => {
      try {
        const holiday = await getNextHoliday();
        setNextHoliday(holiday);
      } catch (error) {
        console.error('Error fetching next holiday:', error);
      }
    };
    
    const fetchUpcomingHolidays = async () => {
      try {
        // Get all holidays instead of just upcoming ones
        const holidays = await getAllHolidays();
        setUpcomingHolidays(holidays);
        
        // Check if today is a holiday using isSameDay instead of isToday
        const today = new Date();
        const holiday = holidays.find(h => isSameDay(h.date.toDate(), today));
        setIsTodayHoliday(!!holiday);
        setTodayHoliday(holiday || null);
      } catch (error) {
        console.error('Error fetching upcoming holidays:', error);
      }
    };
    
    fetchNextHoliday();
    fetchUpcomingHolidays();
  }, []);

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

  // Helper to format holiday date
  const formatHolidayDate = (holiday: Holiday): string => {
    const date = holiday.date.toDate();
    
    if (isToday(date)) {
      return 'today';
    } else if (isTomorrow(date)) {
      return 'tomorrow';
    } else {
      const daysUntil = differenceInDays(date, new Date());
      if (daysUntil <= 7) {
        return `in ${daysUntil} days (${format(date, 'EEEE')})`;
      } else {
        return format(date, 'MMMM d, yyyy');
      }
    }
  };

  // Update loading check
  if (profileLoading || membershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 pb-20 sm:pb-24 max-w-5xl">
          
          {/* Premium Membership Alert - Moved to top */}
          {!isActive && showPremiumAlert && (
            <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg mb-5 sm:mb-8 animate-slide-in-top">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Upgrade to Premium</h3>
                    <p className="text-purple-100 text-sm sm:text-base">Unlock all features including Water Tracking & Attendance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Upgrade Now
                  </button>
                  <button 
                    onClick={() => setShowPremiumAlert(false)}
                    className="p-2.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Holiday Alert - Show upcoming holiday */}
          {nextHoliday && showHolidayAlert && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg mb-5 sm:mb-8 animate-slide-in-top">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
                    <GiftIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Upcoming Holiday</h3>
                    <p className="text-yellow-50 text-sm sm:text-base">
                      {isToday(nextHoliday.date.toDate()) 
                        ? `Today is a holiday: ${nextHoliday.title}`
                        : `The gym will be closed ${formatHolidayDate(nextHoliday)}: ${nextHoliday.title}`
                      }
                    </p>
                    {nextHoliday.description && (
                      <p className="text-yellow-100 text-xs mt-1">{nextHoliday.description}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowHolidayAlert(false)}
                  className="absolute top-0 right-0 p-2.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
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
              
              {/* Conditionally show Mark Attendance button or Already Marked message */}
              {isTodayHoliday ? (
                <div className="w-full sm:w-auto bg-yellow-400/30 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <GiftIcon className="w-5 h-5 text-yellow-300" />
                  Today is Holiday: {todayHoliday?.title}
                </div>
              ) : !attendanceMarkedToday ? (
                <button
                  onClick={() => navigate('/attendance')}
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
                >
                  <Scan className="w-5 h-5" />
                  Mark Attendance
                </button>
              ) : (
                <div className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-300" />
                  Attendance Marked for Today
                </div>
              )}
            </div>
          </div>

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

          {/* Water Intake Section */}
          {/* Add Holiday Calendar Section before Water Intake */}
          {upcomingHolidays.length > 0 && (
            <div className="mb-5 sm:mb-8">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <GiftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Upcoming Holidays
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {upcomingHolidays.map((holiday, index) => {
                    const holidayDate = holiday.date.toDate();
                    const isToday = differenceInDays(holidayDate, new Date()) === 0;
                    
                    return (
                      <div 
                        key={holiday.id || index}
                        className={`flex items-start sm:items-center gap-3 p-3 rounded-xl ${
                          isToday 
                            ? 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20' 
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${
                          isToday 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {holiday.title}
                            </h3>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isToday 
                                ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {formatHolidayDate(holiday)}
                            </div>
                          </div>
                          {holiday.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {upcomingHolidays.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No upcoming holidays in the next 60 days.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Water Intake Section */}
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