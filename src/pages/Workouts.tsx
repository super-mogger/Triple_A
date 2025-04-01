import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  scrapeWorkoutPlans, 
  scrapeWorkoutDetails, 
  generatePersonalizedWorkoutPlan, 
  getExerciseDetails, 
  generateWeeklySchedule,
  convertTrainerWorkoutToAppFormat,
  type WorkoutPlan,
  type DayWorkout,
  type WeeklySchedule
} from '../services/WorkoutService';
import { Dumbbell, Filter, ChevronDown, X, Clock, Target, Gauge, Wrench, Calendar, Play, Info, BarChart } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { MuscleRadarChart } from '../components/MuscleRadarChart';
import { exerciseDatabase } from '../data/exerciseDatabase';
import type { Exercise, ExerciseDetails, Category, Difficulty } from '../types/exercise';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus, getTrainerWorkoutPlans } from '../services/FirestoreService';
import type { Membership } from '../types/profile';
import MembershipRequired from '../components/MembershipRequired';
import { useMembership } from '../context/MembershipContext';

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
    const requiredEquipment = Array.isArray(workout.equipment) ? workout.equipment : [];
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

// Add this helper function near the top of the file with other utility functions
const formatVideoUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Handle YouTube URLs
  if (url.includes('youtube.com/watch')) {
    // Convert YouTube watch URL to embed URL
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtu.be')) {
    // Handle youtu.be shortened URLs
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // If it's already an embed URL or another type, return as is
  return url;
};

// Initial states
export default function Workouts() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isActive, loading: membershipLoading } = useMembership();
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutList, setShowWorkoutList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  const [filters, setFilters] = useState<Filters>({
    level: '',
    duration: '',
    goal: '',
    equipment: ''
  });

  const [trainerWorkouts, setTrainerWorkouts] = useState<WorkoutPlan[]>([]);
  const [loadingTrainerWorkouts, setLoadingTrainerWorkouts] = useState(false);

  // Add fetchWorkouts function
  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const workoutPlans = await scrapeWorkoutPlans();
      setWorkouts(workoutPlans);
      setFilteredWorkouts(workoutPlans);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add fetchTrainerWorkouts function
  const fetchTrainerWorkouts = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingTrainerWorkouts(true);
      const { data: trainerPlans, error } = await getTrainerWorkoutPlans(user.uid);
      
      if (error) {
        console.error('Error fetching trainer workout plans:', error);
        return;
      }
      
      if (trainerPlans && trainerPlans.length > 0) {
        // Convert each trainer plan to app format
        const convertedPlans = await Promise.all(
          trainerPlans.map(plan => convertTrainerWorkoutToAppFormat(plan))
        );
        setTrainerWorkouts(convertedPlans);
      }
    } catch (err) {
      console.error('Error in fetchTrainerWorkouts:', err);
    } finally {
      setLoadingTrainerWorkouts(false);
    }
  }, [user?.uid]);

  // Update the useEffect that depends on membership status to also fetch trainer workouts
  useEffect(() => {
    if (isActive) {
      fetchWorkouts();
      fetchTrainerWorkouts();
    } else {
      setLoading(false);
    }
  }, [isActive, fetchWorkouts, fetchTrainerWorkouts]);

  // Define applyFilters at the top level
  const applyFilters = useCallback(() => {
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

  // Memoize the getCurrentDayWorkout function
  const getCurrentDayWorkout = React.useCallback(() => {
    if (!selectedWorkout?.schedule?.days || !Array.isArray(selectedWorkout.schedule.days)) {
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
    }

    return workout;
  }, [selectedWorkout, currentDay]);

  // Load initial workout from localStorage
  useEffect(() => {
    const savedWorkout = localStorage.getItem('selectedWorkout');
    if (savedWorkout) {
      try {
        const parsedWorkout = JSON.parse(savedWorkout);
        // Ensure schedule.days is an array
        if (parsedWorkout.schedule && !Array.isArray(parsedWorkout.schedule.days)) {
          parsedWorkout.schedule.days = [];
        }
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
    const loadExercises = async () => {
      if (selectedWorkout) {
        const dayWorkout = getCurrentDayWorkout();
        if (dayWorkout?.exercises) {
          try {
            setLoadingExercises(true);
            // Ensure exercises is an array
            const exerciseList = Array.isArray(dayWorkout.exercises) ? dayWorkout.exercises : [];
            setExercises(exerciseList);
          } catch (error) {
            console.error('Error loading exercises:', error);
            setError('Failed to load exercises');
          } finally {
            setLoadingExercises(false);
          }
        } else {
          setExercises([]);
        }
      } else {
        setExercises([]);
      }
    };

    loadExercises();
  }, [selectedWorkout, getCurrentDayWorkout, currentDay]);

  // Apply filters when workouts or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Optimized workout plan selection
  const selectWorkoutPlan = React.useCallback(async (workout: WorkoutPlan) => {
    try {
      setLoading(true);
      setError(null);

      // If no split type is selected, default to 'bro-split'
      const splitType = workout.splitType || 'bro-split';
      const days = await generateWeeklySchedule(
        workout.level || 'Intermediate',
        workout.goal || 'Build Muscle',
        workout.equipment || 'Full Gym',
        splitType
      );

      const updatedWorkout: WorkoutPlan = {
        ...workout,
        splitType,
        schedule: { days: Array.isArray(days) ? days : [] },
        showSplitMenu: false
      };

      setSelectedWorkout(updatedWorkout);
      setCurrentDay('Monday');
      setShowWorkoutList(false);
      localStorage.setItem('selectedWorkout', JSON.stringify(updatedWorkout));
    } catch (error) {
      console.error('Error in selectWorkoutPlan:', error);
      setError(error instanceof Error ? error.message : 'Failed to load workout details');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized exercise details view
  const viewExerciseDetails = React.useCallback(async (exercise: Exercise) => {
    try {
      setLoadingExercise(true);
      setError(null);
      
      // Get the exercise details from the service
      const details = await getExerciseDetails(exercise.name);
      
      if (!details) {
        throw new Error(`Exercise ${exercise.name} not found`);
      }

      setSelectedExercise(details);
    } catch (err) {
      console.error('Error loading exercise details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercise details');
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

  // Handle day change
  const handleDayChange = (day: string) => {
    setCurrentDay(day);
    // Additional logic for day change
  };

  const handleSplitTypeSelect = async (key: string) => {
    if (!selectedWorkout) return;
    
    try {
      setIsLoading(true);
      const days = await generateWeeklySchedule(selectedWorkout.level, selectedWorkout.goal, selectedWorkout.equipment, key as SplitType);
      const updatedWorkout: WorkoutPlan = {
        ...selectedWorkout,
        splitType: key as SplitType,
        schedule: { days: Array.isArray(days) ? days : [] },
        showSplitMenu: false
      };
      setSelectedWorkout(updatedWorkout);
      setCurrentDay('Monday');
      localStorage.setItem('selectedWorkout', JSON.stringify(updatedWorkout));
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all exercises for search functionality
  const loadAllExercises = useCallback(() => {
    const exercises: Exercise[] = [];
    
    // Extract all exercises from the exercise database
    Object.keys(exerciseDatabase).forEach(level => {
      const levelData = exerciseDatabase[level as keyof typeof exerciseDatabase];
      
      Object.keys(levelData).forEach(category => {
        const categoryExercises = levelData[category as keyof typeof levelData];
        
        if (Array.isArray(categoryExercises)) {
          categoryExercises.forEach(exercise => {
            // Make sure the category is properly typed
            const typedExercise: Exercise = {
              ...exercise,
              category: exercise.category as Category,
              difficulty: exercise.difficulty as Difficulty,
              sets: '3-4',
              reps: '8-12',
              notes: `${category} exercise - ${level} level`
            };
            exercises.push(typedExercise);
          });
        }
      });
    });
    
    setAllExercises(exercises);
  }, []);

  // Handle exercise search
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const results = allExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(term) || 
      exercise.category?.toLowerCase().includes(term) ||
      exercise.muscles_worked?.some(muscle => muscle.toLowerCase().includes(term)) ||
      exercise.equipment?.some(eq => eq.toLowerCase().includes(term))
    );

    setSearchResults(results);
    setShowSearchResults(true);
  }, [allExercises]);

  // Load all exercises when component mounts
  useEffect(() => {
    if (isActive) {
      loadAllExercises();
    }
  }, [isActive, loadAllExercises]);

  // Search handler with debouncing
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, handleSearch]);

  // Handle selecting an exercise from search results
  const selectExerciseFromSearch = (exercise: Exercise) => {
    // Instead of directly setting the exercise, fetch full details including video
    setLoadingExercise(true);
    setError(null);
    
    // Get the exercise details from the service, same as viewExerciseDetails does
    getExerciseDetails(exercise.name)
      .then(details => {
        if (!details) {
          throw new Error(`Exercise ${exercise.name} not found`);
        }
        setSelectedExercise(details);
      })
      .catch(err => {
        console.error('Error loading exercise details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exercise details');
        // Fall back to the basic exercise if no details found
        setSelectedExercise(exercise);
      })
      .finally(() => {
        setLoadingExercise(false);
        setShowSearchResults(false);
        setSearchTerm('');
      });
  };

  // Update loading check
  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
      </div>
    );
  }

  // Update membership check
  if (!isActive) {
    return <MembershipRequired feature="workout" />;
  }

  if (loadingExercises) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showWorkoutList && selectedWorkout ? (
          // Workout Plan View
          <>
            {/* Header Section with Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-lg p-6 mb-6">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                <Dumbbell className="w-64 h-64 text-white" />
              </div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedWorkout.title}</h1>
                  <p className="text-emerald-50 mt-2 max-w-xl">{selectedWorkout.description}</p>
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
                      className="w-full bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-xl flex items-center justify-between border border-white/20 hover:bg-white/30 transition-all font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart className="w-4 h-4" />
                        Split: {splitTypes[selectedWorkout.splitType || 'bro-split'].name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {selectedWorkout.showSplitMenu && (
                      <div 
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{ zIndex: 9999 }}
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Split Type</h3>
                        </div>
                        {Object.entries(splitTypes).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => {
                              handleSplitTypeSelect(key);
                              setSelectedWorkout(prev => prev ? {
                                ...prev,
                                showSplitMenu: false
                              } : null);
                            }}
                            className={`w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#282828] transition-all ${
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
                    className="bg-white text-emerald-600 px-5 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4" />
                    Change Workout Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Day Selection */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-full">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Schedule</h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                {selectedWorkout.schedule?.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => handleDayChange(day.day)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-all ${
                      currentDay === day.day
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{day.day.slice(0, 3)}</div>
                    <div className="text-[10px] sm:text-xs mt-1 sm:mt-1.5 opacity-80">{day.focus.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Day Workout */}
            {getCurrentDayWorkout() && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl">
                <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {getCurrentDayWorkout()?.focus || "Rest Day"}
                    </h2>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {exercises.map((exercise, index) => (
                      <button
                        key={index}
                        onClick={() => viewExerciseDetails(exercise)}
                        className="w-full bg-gray-50 dark:bg-[#282828] hover:bg-gray-100 dark:hover:bg-[#333] rounded-xl p-4 transition-all text-left border border-gray-200 dark:border-gray-700 hover:shadow-md"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
                              <Dumbbell className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {exercise.name}
                                <Info className="w-3.5 h-3.5 text-emerald-500" />
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.notes}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                                {exercise.sets} sets × {exercise.reps}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {exercises.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-[#282828] rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
                          <Calendar className="w-8 h-8 text-amber-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          {getCurrentDayWorkout()?.notes || "Rest day - Take time to recover and prepare for your next workout session."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Workout List View
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-lg p-8 mb-8">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
                <Dumbbell className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Workout Plans</h1>
                <p className="text-emerald-50 mt-2 max-w-xl text-lg">Choose a personalized workout plan that matches your fitness goals and experience level</p>
              </div>
            </div>

            {/* Search Exercise Bar */}
            <div className="mb-6 relative z-30">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                    <Dumbbell className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Search Exercises
                  </h2>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by exercise name, muscle group, or equipment..."
                    className="w-full p-4 pr-12 bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-emerald-500 rounded-lg text-white"
                    onClick={() => handleSearch(searchTerm)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                      <div className="p-2">
                        <h3 className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {searchResults.length} exercises found
                        </h3>
                        
                        <div className="space-y-1">
                          {searchResults.map((exercise) => (
                            <button
                              key={exercise.id}
                              onClick={() => selectExerciseFromSearch(exercise)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#282828] rounded-lg transition-colors text-left"
                            >
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Dumbbell className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {exercise.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {exercise.muscles_worked?.join(', ') || exercise.category}
                                </p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                {exercise.equipment?.join(', ') || "No equipment"}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showSearchResults && searchResults.length === 0 && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                      <div className="p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">No exercises found matching "{searchTerm}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trainer Workout Plans */}
            {loadingTrainerWorkouts ? (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <BarChart className="w-5 h-5 text-indigo-500" />
                  </div>
                  Loading Trainer Plans...
                </h2>
                <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-500"></div>
                </div>
              </div>
            ) : trainerWorkouts.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <BarChart className="w-5 h-5 text-indigo-500" />
                  </div>
                  Your Trainer Plans
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {trainerWorkouts.map((workout, index) => (
                    <div 
                      key={`trainer-${index}`}
                      className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden group hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="bg-white dark:bg-gray-800 text-xs text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full inline-block mb-2">Trainer Plan</div>
                          <h3 className="text-xl font-bold text-white">{workout.title}</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                              <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                              <p className="font-medium text-gray-900 dark:text-white">{workout.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-full">
                              <Target className="w-4 h-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
                              <p className="font-medium text-gray-900 dark:text-white">{workout.goal}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                              <Gauge className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                              <p className="font-medium text-gray-900 dark:text-white">{workout.level}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-full">
                              <Calendar className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                              <p className="font-medium text-gray-900 dark:text-white">By Trainer</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{workout.description}</p>
                        <button 
                          onClick={() => selectWorkout(workout)}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all font-medium shadow-md flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Start Trainer Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Workout Plans - keep existing code */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
              </div>
              Standard Workout Plans
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="relative h-52">
                    <img
                      src={workout.imageUrl}
                      alt={workout.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white">{workout.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workout.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-full">
                          <Target className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workout.goal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                          <Gauge className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workout.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-full">
                          <Wrench className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Equipment</p>
                          <p className="font-medium text-gray-900 dark:text-white">{workout.equipment}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{workout.description}</p>
                    <button 
                      onClick={() => selectWorkout(workout)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl transition-all font-medium shadow-md flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Workout Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Exercise Modal - Visible in both views */}
            {selectedExercise && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start mb-5 sm:mb-6 sticky top-0 bg-white dark:bg-[#1E1E1E] z-10 py-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{selectedExercise.name}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Video Section */}
                  <div className="mb-6 sm:mb-8">
                    <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-md">
                  {selectedExercise.videoUrl ? (
                      <iframe
                      src={formatVideoUrl(selectedExercise.videoUrl)}
                        className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${selectedExercise.name} demonstration`}
                      onError={(e) => {
                        // Hide iframe on error and show fallback
                        if (e.target) {
                          (e.target as HTMLIFrameElement).style.display = 'none';
                          const parent = (e.target as HTMLIFrameElement).parentElement;
                          if (parent) {
                            parent.classList.add('flex', 'items-center', 'justify-center');
                            const videoUrl = selectedExercise && selectedExercise.videoUrl ? selectedExercise.videoUrl : '#';
                            parent.innerHTML += `<div class="text-white text-center p-4">
                              <p>Video playback error.</p>
                              <p class="text-sm mt-2">Try opening the video directly: 
                                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" 
                                   class="text-emerald-400 hover:underline">Open video</a>
                              </p>
                            </div>`;
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No video available for this exercise.</p>
                        <p className="text-sm mt-2 text-gray-400">
                          {selectedExercise && selectedExercise.name 
                            ? `Try searching "${selectedExercise.name} demonstration" on YouTube.`
                            : "Try searching for this exercise demonstration on YouTube."}
                        </p>
                      </div>
                    </div>
                  )}
                    </div>
                  </div>

                  {/* Muscle Targeting Chart */}
                  <div className="mb-6 sm:mb-8 bg-gray-50 dark:bg-[#282828] p-5 sm:p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                          <BarChart className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Muscle Activation Analysis</h3>
                      </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8">
                    {/* Target Muscles */}
                    <div className="bg-gray-50 dark:bg-[#282828] p-4 sm:p-5 rounded-xl shadow-md">
                      <h3 className="text-base font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                          <Target className="w-4 h-4 text-emerald-500" />
                        </div>
                        Primary Target Muscles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.targetMuscles.map((muscle, index) => (
                          <span key={index} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Muscles */}
                    <div className="bg-gray-50 dark:bg-[#282828] p-4 sm:p-5 rounded-xl shadow-md">
                      <h3 className="text-base font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                          <Target className="w-4 h-4 text-blue-500" />
                        </div>
                        Secondary Muscles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.secondaryMuscles.map((muscle, index) => (
                          <span key={index} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-full">
                        <Info className="w-5 h-5 text-purple-500" />
                      </div>
                      Instructions
                    </h3>
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 dark:bg-[#282828] p-4 sm:p-5 rounded-xl shadow-md">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-3 sm:gap-4">
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 pt-1">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-full">
                        <Wrench className="w-5 h-5 text-amber-500" />
                      </div>
                      Pro Tips
                    </h3>
                    <div className="bg-gray-50 dark:bg-[#282828] rounded-xl p-4 sm:p-5 shadow-md">
                      <ul className="space-y-3 sm:space-y-4">
                        {selectedExercise.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3 sm:gap-4 text-gray-700 dark:text-gray-300">
                            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
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
      </div>

            {/* Loading Overlay */}
            {loadingExercise && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
              </div>
            )}
    </div>
  );
} 