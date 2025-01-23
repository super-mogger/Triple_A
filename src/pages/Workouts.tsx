import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  scrapeWorkoutPlans, 
  scrapeWorkoutDetails, 
  generatePersonalizedWorkoutPlan, 
  getExerciseDetails, 
  generateWeeklySchedule,
  type WorkoutPlan,
  type DayWorkout,
  type WeeklySchedule
} from '../services/WorkoutService';
import { Dumbbell, Filter, ChevronDown, X, Clock, Target, Gauge, Wrench, Calendar, Play, Info, BarChart } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { MuscleRadarChart } from '../components/MuscleRadarChart';
import { exerciseDatabase } from '../data/exerciseDatabase';
import type { Exercise, ExerciseDetails } from '../types/exercise';

type SplitType = 'bro-split' | 'push-pull-legs' | 'upper-lower';

const splitTypes = {
  'bro-split': {
    name: "Bro Split",
    description: "Train one muscle group per day"
  },
  'push-pull-legs': {
    name: "Push/Pull/Legs",
    description: "Group muscles by movement pattern"
  },
  'upper-lower': {
    name: "Upper/Lower",
    description: "Alternate between upper and lower body"
  }
} as const;

interface MuscleData {
  muscle: string;
  value: number;
}

interface Filters {
  level: string;
  duration: string;
  goal: string;
  equipment: string;
}

// Define the exercise mapping outside the function to keep it clean
const exerciseToMuscleMap: { [key: string]: string[] } = {
  // Chest Exercises
  'Bench Press': ['Chest', 'Shoulders', 'Arms'],
  'Incline Bench Press': ['Chest', 'Shoulders', 'Arms'],
  'Decline Bench Press': ['Chest', 'Arms'],
  'Push-Ups': ['Chest', 'Shoulders', 'Arms', 'Core'],
  'Dumbbell Flyes': ['Chest'],
  'Cable Flyes': ['Chest'],
  'Dips': ['Chest', 'Arms'],

  // Back Exercises
  'Pull-Ups': ['Back', 'Arms'],
  'Lat Pulldowns': ['Back', 'Arms'],
  'Barbell Rows': ['Back', 'Arms'],
  'Dumbbell Rows': ['Back', 'Arms'],
  'Face Pulls': ['Back', 'Shoulders'],
  'Deadlifts': ['Back', 'Legs', 'Core'],
  'Romanian Deadlifts': ['Back', 'Legs'],

  // Shoulder Exercises
  'Shoulder Press': ['Shoulders', 'Arms'],
  'Military Press': ['Shoulders', 'Arms'],
  'Lateral Raises': ['Shoulders'],
  'Front Raises': ['Shoulders'],
  'Upright Rows': ['Shoulders', 'Back'],
  'Arnold Press': ['Shoulders', 'Arms'],

  // Arm Exercises
  'Bicep Curls': ['Arms'],
  'Hammer Curls': ['Arms'],
  'Tricep Extensions': ['Arms'],
  'Tricep Pushdowns': ['Arms'],
  'Skull Crushers': ['Arms'],
  'Preacher Curls': ['Arms'],
  'Diamond Push-Ups': ['Arms', 'Chest'],

  // Leg Exercises
  'Squats': ['Legs', 'Core'],
  'Front Squats': ['Legs', 'Core'],
  'Leg Press': ['Legs'],
  'Lunges': ['Legs', 'Core'],
  'Bulgarian Split Squats': ['Legs'],
  'Calf Raises': ['Legs'],
  'Leg Extensions': ['Legs'],
  'Leg Curls': ['Legs'],
  'Hip Thrusts': ['Legs', 'Core'],

  // Core Exercises
  'Plank': ['Core'],
  'Russian Twists': ['Core'],
  'Crunches': ['Core'],
  'Leg Raises': ['Core'],
  'Mountain Climbers': ['Core'],
  'Ab Wheel Rollouts': ['Core'],
  'Wood Chops': ['Core'],
  'Side Planks': ['Core'],
  'Hanging Leg Raises': ['Core'],

  // Compound Movements
  'Clean and Press': ['Shoulders', 'Legs', 'Core', 'Back'],
  'Kettlebell Swings': ['Legs', 'Core', 'Back'],
  'Burpees': ['Legs', 'Chest', 'Core'],
  'Thrusters': ['Legs', 'Shoulders', 'Core']
};

const calculateMuscleTargeting = (exercise: Exercise): MuscleData[] => {
  const muscleScores: Record<string, number> = {};
  
  exercise.targetMuscles.forEach((muscle) => {
    muscleScores[muscle] = 100;
  });
  
  exercise.secondaryMuscles.forEach((muscle) => {
    muscleScores[muscle] = 50;
  });
  
  return Object.entries(muscleScores).map(([muscle, value]) => ({
    muscle,
    value
  }));
};

const filterWorkoutsByEquipment = (workouts: WorkoutPlan[], equipment: string[]): WorkoutPlan[] => {
  return workouts.filter(workout => {
    const requiredEquipment = workout.equipment || [];
    return requiredEquipment.every((item: string) => equipment.includes(item.toLowerCase()));
  });
};

interface WeekdayScheduleProps {
  schedule: WeeklySchedule;
  currentDay: string;
  setCurrentDay: (day: string) => void;
}

function WeekdaySchedule({ schedule, currentDay, setCurrentDay }: WeekdayScheduleProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const dayMap: { [key: string]: string } = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  const workoutTypeMap: { [key: string]: string } = {
    'Chest': 'Chest',
    'Back': 'Back',
    'Shoulders': 'Shoulders',
    'Arms': 'Arms',
    'Legs': 'Legs',
    'Core': 'Core',
    'Rest': 'Rest',
    'Push': 'Push',
    'Pull': 'Pull'
  };

  const getWorkoutType = (daySchedule: DayWorkout | undefined): string => {
    if (!daySchedule || !daySchedule.exercises || daySchedule.exercises.length === 0) {
      return 'Rest';
    }
    // Get the primary muscle group from the first exercise
    const muscleGroup = daySchedule.exercises[0].targetMuscles?.[0] || 'Rest';
    return muscleGroup;
  };

  // Scroll to active day when it changes
  React.useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.querySelector('[data-active="true"]');
      if (activeButton) {
        const container = scrollRef.current;
        const scrollLeft = activeButton.getBoundingClientRect().left + 
          container.scrollLeft - 
          container.getBoundingClientRect().left - 
          (container.offsetWidth - (activeButton as HTMLElement).offsetWidth) / 2;
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [currentDay]);

  return (
    <div className="relative mb-6">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth hide-scrollbar"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex space-x-1 px-4">
          {days.map((day) => {
            const fullDay = dayMap[day];
            const isActive = currentDay === fullDay;
            const isToday = day === today;
            const daySchedule = schedule?.days.find(d => d.day === fullDay);
            const workoutType = getWorkoutType(daySchedule);
            const shortWorkoutType = workoutTypeMap[workoutType] || workoutType;
            
            return (
              <button
                key={day}
                data-active={isActive}
                onClick={() => setCurrentDay(fullDay)}
                className={`flex-none w-[calc(25%-3px)] flex flex-col items-center py-1.5 px-1 rounded transition-all snap-center ${
                  isActive
                    ? 'bg-emerald-500'
                    : 'bg-[#1E1E1E]'
                }`}
              >
                <span className={`text-[11px] font-medium ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}>
                  {day}
                </span>
                <span className={`text-[10px] truncate w-full text-center mt-0.5 ${
                  isActive ? 'text-white/90' : 'text-gray-500'
                }`}>
                  {shortWorkoutType}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Workouts() {
  const [currentDay, setCurrentDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });

  const { profile } = useProfile();
  const { membership, loading: membershipLoading } = usePayment();
  const navigate = useNavigate();

  const isActiveMembership = useMemo(() => {
    if (membershipLoading) return false;
    if (!membership) return false;
    return membership.is_active;
  }, [membership, membershipLoading]);

  // Initial states
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingExercise, setLoadingExercise] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutList, setShowWorkoutList] = useState(true);

  // Memoize filters to prevent unnecessary re-renders
  const [filters, setFilters] = useState<Filters>({
    level: '',
    duration: '',
    goal: '',
    equipment: ''
  });

  // Memoize the getCurrentDayWorkout function
  const getCurrentDayWorkout = React.useCallback(() => {
    if (!selectedWorkout?.schedule?.days) {
      console.log('No schedule or days found in selected workout');
      return null;
    }

    const currentDayLower = currentDay.toLowerCase();
    console.log('Looking for workout on:', currentDayLower);
    
    const workout = selectedWorkout.schedule.days.find(
      (day: DayWorkout) => day.day.toLowerCase() === currentDayLower
    );

    if (workout) {
      console.log('Found workout for current day:', {
        focus: workout.focus,
        exerciseCount: workout.exercises?.length || 0
      });
    } else {
      console.log('No workout found for current day');
    }

    return workout;
  }, [selectedWorkout, currentDay]);

  // Memoize the filtered workouts calculation
  const applyFilters = React.useCallback(() => {
    let filtered = [...workouts];

    if (filters.level) {
      filtered = filtered.filter(w => w.level.toLowerCase().includes(filters.level.toLowerCase()));
    }
    if (filters.goal) {
      filtered = filtered.filter(w => w.goal.toLowerCase().includes(filters.goal.toLowerCase()));
    }
    if (filters.duration) {
      filtered = filtered.filter(w => w.duration.toLowerCase().includes(filters.duration.toLowerCase()));
    }
    if (filters.equipment) {
      filtered = filtered.filter(w => w.equipment.toLowerCase().includes(filters.equipment.toLowerCase()));
    }

    setFilteredWorkouts(filtered);
  }, [workouts, filters]);

  // Load initial workout from localStorage
  useEffect(() => {
    const savedWorkout = localStorage.getItem('selectedWorkout');
    if (savedWorkout) {
      try {
        const parsedWorkout = JSON.parse(savedWorkout);
        setSelectedWorkout(parsedWorkout);
        setShowWorkoutList(false);
      } catch (error) {
        console.error('Error parsing saved workout:', error);
        localStorage.removeItem('selectedWorkout');
      }
    }
  }, []);

  // Update exercises when selected workout or current day changes
  useEffect(() => {
    if (selectedWorkout) {
      const dayWorkout = getCurrentDayWorkout();
      setExercises(dayWorkout?.exercises || []);
    } else {
      setExercises([]);
    }
  }, [selectedWorkout, getCurrentDayWorkout, currentDay]);

  // Apply filters when workouts or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (!membershipLoading && !isActiveMembership) {
      navigate('/membership');
      return;
    }

    // Only fetch workouts if we have an active membership
    if (isActiveMembership) {
      fetchWorkouts();
    }
  }, [isActiveMembership, membershipLoading, navigate]);

  // Optimized workout plan selection
  const selectWorkoutPlan = React.useCallback(async (workout: WorkoutPlan) => {
    try {
      setLoading(true);
      setError(null);

      if (!workout.splitType || !Object.keys(splitTypes).includes(workout.splitType)) {
        workout.splitType = 'bro-split'; // Set default split type if not specified
      }

      const days = generateWeeklySchedule(
        workout.level || 'Intermediate',
        workout.goal || 'Build Muscle',
        workout.equipment || 'Full Gym',
        workout.splitType as SplitType
      );

      if (!days?.length) {
        throw new Error('Failed to generate workout schedule');
      }

      const fullWorkout = {
        ...workout,
        schedule: { days }
      };

      localStorage.setItem('selectedWorkout', JSON.stringify(fullWorkout));
      setSelectedWorkout(fullWorkout);
      setShowWorkoutList(false);
    } catch (err) {
      console.error('Error selecting workout plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout details');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized exercise details view
  const viewExerciseDetails = React.useCallback(async (exercise: Exercise) => {
    try {
      setLoadingExercise(true);
      const muscleGroup = exercise.muscleGroup?.toLowerCase();
      if (!muscleGroup) return;

      const exercises = exerciseDatabase.intermediate[muscleGroup as keyof typeof exerciseDatabase.intermediate];
      const details = exercises?.find(e => e.name === exercise.name);
      
      if (!details) {
        throw new Error(`Exercise ${exercise.name} not found`);
      }

      setSelectedExercise(details as unknown as Exercise);
    } catch (err) {
      console.error('Error loading exercise details:', err);
      setError('Failed to load exercise details');
    } finally {
      setLoadingExercise(false);
    }
  }, []);

  // Optimized workout plan change
  const changeWorkoutPlan = React.useCallback(() => {
    setSelectedWorkout(null);
    setExercises([]);
    setSelectedExercise(null);
    setError(null);
    localStorage.removeItem('selectedWorkout');
    setShowWorkoutList(true);
  }, []);

  const selectWorkout = (workout: WorkoutPlan) => {
    selectWorkoutPlan(workout).catch(err => {
      console.error('Error in selectWorkout:', err);
      setError('Failed to select workout plan');
    });
  };

  if (membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isActiveMembership) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Active Membership Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need an active membership to access workout plans
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-medium"
              >
                View Membership Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadInitialWorkout = async () => {
      try {
        const savedWorkout = localStorage.getItem('selectedWorkout');
        if (savedWorkout) {
          console.log('Found saved workout in localStorage');
          const parsedWorkout = JSON.parse(savedWorkout);
          
          // Validate the workout data
          if (!parsedWorkout.splitType || !Object.keys(splitTypes).includes(parsedWorkout.splitType)) {
            console.error('Invalid split type in saved workout');
            localStorage.removeItem('selectedWorkout');
            return;
          }
          
          // Regenerate schedule to ensure exercises are properly formatted
          const days = generateWeeklySchedule(
            parsedWorkout.level || 'Intermediate',
            parsedWorkout.goal || 'Build Muscle',
            parsedWorkout.equipment || 'Full Gym',
            parsedWorkout.splitType as 'bro-split' | 'push-pull-legs' | 'upper-lower'
          );
          
          if (!days || days.length === 0) {
            console.error('Failed to regenerate schedule');
            localStorage.removeItem('selectedWorkout');
            return;
          }
          
          const fullWorkout = {
            ...parsedWorkout,
            schedule: { days }
          };
          
          console.log('Loaded workout with regenerated schedule:', {
            id: fullWorkout.id,
            title: fullWorkout.title,
            splitType: fullWorkout.splitType,
            schedule: {
              days: fullWorkout.schedule.days.map((day: DayWorkout) => ({
                day: day.day,
                focus: day.focus,
                exerciseCount: day.exercises?.length || 0
              }))
            }
          });
          
          setSelectedWorkout(fullWorkout);
        } else {
          console.log('No saved workout found in localStorage');
        }
      } catch (error) {
        console.error('Error loading saved workout:', error);
        localStorage.removeItem('selectedWorkout');
      }
    };

    loadInitialWorkout();
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (selectedWorkout && currentDay) {
      setLoadingExercises(true);
      try {
        const dayWorkout = getCurrentDayWorkout();
        if (dayWorkout) {
          console.log('Found workout for current day:', {
            day: dayWorkout.day,
            focus: dayWorkout.focus,
            exercises: dayWorkout.exercises?.map(e => ({
              name: e.name,
              muscleGroup: e.muscleGroup,
              sets: e.sets,
              reps: e.reps
            }))
          });
          setExercises(dayWorkout.exercises || []);
        } else {
          console.log('No workout found for current day:', currentDay);
          setExercises([]);
        }
      } catch (error) {
        console.error('Error loading day workout:', error);
        setExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    }
  }, [selectedWorkout, currentDay]);

  useEffect(() => {
    applyFilters();
  }, [workouts, filters]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get workout plans from local data
      const data = await scrapeWorkoutPlans();
      console.log('Fetched workout plans:', data);
      
      // Generate personal plan if profile data exists
      if (profile) {
        const personalPlan = generatePersonalizedWorkoutPlan(profile);
        console.log('Generated personal plan:', personalPlan);
        
        // Check if a personal plan already exists
        const existingPlan = data.find(p => p.title === personalPlan.title);
        const finalWorkouts = existingPlan ? data : [personalPlan, ...data];
        
        console.log('Setting workouts:', finalWorkouts);
        setWorkouts(finalWorkouts);
        setFilteredWorkouts(finalWorkouts);
      } else {
        console.log('No profile data, using default workouts');
        setWorkouts(data);
        setFilteredWorkouts(data);
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workout plans. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const renderDaySchedule = (day: DayWorkout) => {
    return (
      <div key={day.day} className="bg-[#282828] rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{day.day}</h3>
          <span className="text-emerald-500">{day.focus}</span>
        </div>
        {day.exercises && day.exercises.length > 0 ? (
          <div className="space-y-4">
            {day.exercises.map((exercise: Exercise, index: number) => (
              <button 
                key={index} 
                className="w-full border-b border-gray-700 last:border-0 pb-4 last:pb-0 hover:bg-[#333] rounded-lg transition-colors p-4 text-left"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  viewExerciseDetails(exercise);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {exercise.name}
                      <Info className="w-4 h-4 text-emerald-500" />
                    </h4>
                    <p className="text-sm text-gray-400">{exercise.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-500">{exercise.sets} sets × {exercise.reps}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">
            {day.notes || "Rest day"}
          </div>
        )}
      </div>
    );
  };

  const renderExerciseModal = () => {
    if (!selectedExercise) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{selectedExercise.name}</h2>
            <button
              onClick={() => setSelectedExercise(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Video Section */}
          <div className="mb-6 sm:mb-8">
            <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
              <iframe
                src={selectedExercise.videoUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={`${selectedExercise.name} demonstration`}
              />
            </div>
          </div>

          {/* Muscle Targeting Chart */}
          <div className="mb-6 sm:mb-8 bg-gray-50 dark:bg-[#282828] p-4 sm:p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Muscle Activation Analysis</h3>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Hover over the chart for detailed percentages
              </div>
            </div>
            <MuscleRadarChart 
              muscleData={calculateMuscleTargeting(selectedExercise)} 
              detailedView={true}
            />
          </div>

          {/* Exercise Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Target Muscles */}
            <div className="bg-gray-50 dark:bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Primary Target Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.targetMuscles.map((muscle, index) => (
                  <span key={index} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Muscles */}
            <div className="bg-gray-50 dark:bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Secondary Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.secondaryMuscles.map((muscle, index) => (
                  <span key={index} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-gray-50 dark:bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Required Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.equipment.map((item, index) => (
                  <span key={index} className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Difficulty & Category */}
            <div className="bg-gray-50 dark:bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Exercise Info</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className="text-orange-600 dark:text-orange-400">{selectedExercise.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{selectedExercise.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Instructions</h3>
            <div className="space-y-4">
              {selectedExercise.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pro Tips</h3>
            <div className="bg-gray-50 dark:bg-[#282828] rounded-lg p-4">
              <ul className="space-y-3">
                {selectedExercise.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs mt-0.5">
                      ✓
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkoutCard = (workout: WorkoutPlan) => {
    return (
      <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
        <div className="relative h-48">
          <img
            src={workout.imageUrl}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{workout.title}</h3>
          <div className="space-y-2 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Duration: {workout.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Goal: {workout.goal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              <span>Level: {workout.level}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>Equipment: {workout.equipment}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">{workout.description}</p>
          <button
            onClick={() => selectWorkout(workout)}
            className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Start Workout Plan
          </button>
        </div>
      </div>
    );
  };

  if (!membership?.is_active) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Active Membership Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You need an active membership to access workout plans
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-medium"
              >
                View Membership Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (loadingExercises) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!showWorkoutList && selectedWorkout) {
    const currentDayWorkout = getCurrentDayWorkout();

    return (
      <>
        <div className="min-h-screen bg-white dark:bg-[#121212] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{selectedWorkout.title}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedWorkout.description}</p>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  {/* Split Selection */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setSelectedWorkout({
                          ...selectedWorkout,
                          showSplitMenu: !selectedWorkout.showSplitMenu
                        });
                      }}
                      className="w-full bg-gray-50 dark:bg-[#282828] text-sm px-4 py-2.5 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors text-gray-700 dark:text-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart className="w-4 h-4 text-emerald-500" />
                        Split: {splitTypes[selectedWorkout.splitType || 'bro-split'].name}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    {selectedWorkout.showSplitMenu && (
                      <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {Object.entries(splitTypes).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => {
                              const updatedWorkout = {
                                ...selectedWorkout,
                                splitType: key as SplitType,
                                showSplitMenu: false,
                                schedule: {
                                  days: generateWeeklySchedule(selectedWorkout.level, selectedWorkout.goal, selectedWorkout.equipment, key as SplitType)
                                }
                              };
                              setSelectedWorkout(updatedWorkout);
                              localStorage.setItem('selectedWorkout', JSON.stringify(updatedWorkout));
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#282828] transition-colors ${
                              selectedWorkout.splitType === key 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            <div className="font-medium">{value.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{value.description}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={changeWorkoutPlan}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Change Workout Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Day Selection */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                {selectedWorkout.schedule?.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setCurrentDay(day.day)}
                    className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-all ${
                      currentDay === day.day
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-50 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-medium text-xs sm:text-sm">{day.day.slice(0, 3)}</div>
                    <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 opacity-80">{day.focus.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Day Workout */}
            {currentDayWorkout && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    {currentDayWorkout.focus}
                  </h2>
                </div>

                <div className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-4">
                    {exercises.map((exercise, index) => (
                      <button
                        key={index}
                        onClick={() => viewExerciseDetails(exercise)}
                        className="w-full bg-gray-50 dark:bg-[#282828] hover:bg-gray-100 dark:hover:bg-[#333] rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-colors text-left border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start gap-3 sm:gap-4">
                          <div>
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                              {exercise.name}
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">{exercise.notes}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-emerald-500">
                              {exercise.sets} sets × {exercise.reps}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {exercises.length === 0 && (
                      <div className="text-center py-8 sm:py-12">
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                          {currentDayWorkout.notes || "Rest day"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Modal */}
            {selectedExercise && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 z-50">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-[#1E1E1E] z-10 py-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{selectedExercise.name}</h2>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg sm:rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Video Section */}
                  <div className="mb-6 sm:mb-8">
                    <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={selectedExercise.videoUrl}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        title={`${selectedExercise.name} demonstration`}
                      />
                    </div>
                  </div>

                  {/* Muscle Targeting Chart */}
                  <div className="mb-6 sm:mb-8 bg-gray-50 dark:bg-[#282828] p-4 sm:p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Muscle Activation Analysis</h3>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Hover over the chart for detailed percentages
                      </div>
                    </div>
                    <MuscleRadarChart 
                      muscleData={calculateMuscleTargeting(selectedExercise)} 
                      detailedView={true}
                    />
                  </div>

                  {/* Exercise Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Target Muscles */}
                    <div className="bg-gray-50 dark:bg-[#282828] p-3 sm:p-4 rounded-lg">
                      <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">Primary Target Muscles</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedExercise.targetMuscles.map((muscle, index) => (
                          <span key={index} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Muscles */}
                    <div className="bg-gray-50 dark:bg-[#282828] p-3 sm:p-4 rounded-lg">
                      <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">Secondary Muscles</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedExercise.secondaryMuscles.map((muscle, index) => (
                          <span key={index} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Instructions</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-3 sm:gap-4">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-medium text-sm sm:text-base">
                            {index + 1}
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Pro Tips</h3>
                    <div className="bg-gray-50 dark:bg-[#282828] rounded-lg p-3 sm:p-4">
                      <ul className="space-y-2 sm:space-y-3">
                        {selectedExercise.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                            <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[10px] sm:text-xs mt-0.5">
                              ✓
                            </div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loadingExercise && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Workout Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Choose a workout plan that matches your goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={workout.imageUrl}
                  alt={workout.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-semibold text-white">{workout.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Duration: {workout.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Goal: {workout.goal}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Gauge className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Level: {workout.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Wrench className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>Equipment: {workout.equipment}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{workout.description}</p>
                <button 
                  onClick={() => selectWorkout(workout)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl transition-colors font-medium"
                >
                  Start Workout Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 