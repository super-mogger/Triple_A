import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Scale,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Mock data (replace with actual data from your database)
  const userStats = {
    currentWeight: '75 kg',
    targetWeight: '80 kg',
    workoutsCompleted: 12,
    currentStreak: 5,
    nextWorkout: 'Push Day (Chest, Shoulders, Triceps)',
    calorieTarget: '2800 kcal',
    proteinTarget: '160g',
    progress: {
      monthly: '+2.5 kg',
      workoutFrequency: '4 days/week'
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtext }: {
    icon: React.ElementType;
    title: string;
    value: string;
    subtext?: string;
  }) => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{title}</p>
          <h3 className="text-xl font-bold mt-1">{value}</h3>
          {subtext && (
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } mt-1`}>{subtext}</p>
          )}
        </div>
        <Icon className={`w-5 h-5 ${
          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
        }`} />
      </div>
    </div>
  );

  const NextWorkoutCard = () => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Next Workout</h3>
        <Calendar className="w-5 h-5 text-emerald-600" />
      </div>
      <p className={`text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      } mb-3`}>Today's Session</p>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{userStats.nextWorkout}</p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          } mt-1`}>Estimated time: 60 min</p>
        </div>
        <button className={`px-3 py-1.5 rounded-lg flex items-center ${
          isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
        } text-white transition-colors text-sm`}>
          Start
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );

  const NutritionCard = () => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    } shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Daily Nutrition</h3>
        <Target className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Calories</span>
            <span>{userStats.calorieTarget}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Protein</span>
            <span>{userStats.proteinTarget}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user?.displayName || 'Athlete'}!</h1>
        <p className={`${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Let's crush today's goals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Scale}
          title="Current Weight"
          value={userStats.currentWeight}
          subtext={`Target: ${userStats.targetWeight}`}
        />
        <StatCard
          icon={Activity}
          title="Workouts Completed"
          value={userStats.workoutsCompleted.toString()}
          subtext={`${userStats.currentStreak} day streak`}
        />
        <StatCard
          icon={TrendingUp}
          title="Monthly Progress"
          value={userStats.progress.monthly}
          subtext={userStats.progress.workoutFrequency}
        />
      </div>

      {/* Workout and Nutrition Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NextWorkoutCard />
        <NutritionCard />
      </div>
    </div>
  );
}