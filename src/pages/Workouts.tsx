import React, { useState, useEffect } from 'react';
import { scrapeWorkoutPlans, scrapeWorkoutDetails, generatePersonalizedWorkoutPlan, getExerciseDetails, generateWeeklySchedule, WorkoutPlan, Exercise, DailyWorkout, WeeklySchedule, ExerciseDetails } from '../services/WorkoutService';
import { Dumbbell, Filter, ChevronDown, X, Clock, Target, Gauge, Wrench, Calendar, Play, Info, BarChart } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { MuscleRadarChart } from '../components/MuscleRadarChart';

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
};

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

function calculateMuscleTargeting(exercise: Exercise | ExerciseDetails | Exercise[]): { muscle: string; value: number; }[] {
  if (!Array.isArray(exercise) && 'targetMuscles' in exercise && exercise.targetMuscles) {
    const muscleData: { muscle: string; value: number; }[] = [];

    // Add primary target muscles with 100% activation
    exercise.targetMuscles.forEach(muscle => {
      muscleData.push({
        muscle,
        value: 100
      });
    });

    // Add secondary muscles with 60% activation
    if (exercise.secondaryMuscles) {
      exercise.secondaryMuscles.forEach(muscle => {
        if (!muscleData.some(m => m.muscle === muscle)) {
          muscleData.push({
            muscle,
            value: 60
          });
        }
      });
    }

    return muscleData.sort((a, b) => b.value - a.value);
  }

  // Fallback for array of exercises or other cases
  const muscleGroups = {
    'Chest': 0,
    'Back': 0,
    'Shoulders': 0,
    'Arms': 0,
    'Legs': 0,
    'Core': 0
  };

  if (Array.isArray(exercise)) {
    exercise.forEach(ex => {
      const targetMuscles = exerciseToMuscleMap[ex.name] || [];
      const contributionPerMuscle = 100 / (exercise.length * targetMuscles.length || 1);
      
      targetMuscles.forEach(muscle => {
        if (muscle in muscleGroups) {
          muscleGroups[muscle as keyof typeof muscleGroups] += contributionPerMuscle;
        }
      });
    });
  } else if ('name' in exercise) {
    const targetMuscles = exerciseToMuscleMap[exercise.name] || [];
    targetMuscles.forEach(muscle => {
      if (muscle in muscleGroups) {
        muscleGroups[muscle as keyof typeof muscleGroups] = 100;
      }
    });
  }

  return Object.entries(muscleGroups)
    .map(([muscle, value]) => ({
      muscle,
      value: Math.round(value)
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(() => {
    const saved = localStorage.getItem('selectedWorkout');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutList, setShowWorkoutList] = useState(!localStorage.getItem('selectedWorkout'));
  const [currentDay, setCurrentDay] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });
  const [filters, setFilters] = useState<Filters>({
    level: '',
    duration: '',
    goal: '',
    equipment: ''
  });
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetails | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(false);

  const { profileData } = useProfile();
  const { membership } = usePayment();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workouts, filters]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scrapeWorkoutPlans();
      const personalPlan = generatePersonalizedWorkoutPlan(profileData);
      const existingPlan = data.find(p => p.title === personalPlan.title);
      setWorkouts(existingPlan ? data : [personalPlan, ...data]);
      setFilteredWorkouts(existingPlan ? data : [personalPlan, ...data]);
    } catch (err) {
      setError('Failed to load workout plans. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkoutPlan = async (workout: WorkoutPlan) => {
    try {
      setLoading(true);
      setError(null);
      const details = await scrapeWorkoutDetails(workout.url);
      const fullWorkout = { 
        ...workout, 
        schedule: details.schedule 
      };
      setSelectedWorkout(fullWorkout);
      localStorage.setItem('selectedWorkout', JSON.stringify(fullWorkout));
      setShowWorkoutList(false);
    } catch (err) {
      setError('Failed to load workout details. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const changeWorkoutPlan = () => {
    setShowWorkoutList(true);
  };

  const applyFilters = () => {
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
  };

  const resetFilters = () => {
    setFilters({
      level: '',
      duration: '',
      goal: '',
      equipment: ''
    });
  };

  const getCurrentDayWorkout = () => {
    if (!selectedWorkout?.schedule) return null;
    return selectedWorkout.schedule.days.find(day => day.day === currentDay);
  };

  const viewExerciseDetails = async (exercise: Exercise) => {
    try {
      console.log('Viewing exercise:', exercise.name); // Debug log
      setLoadingExercise(true);
      const details = await getExerciseDetails(exercise.name);
      console.log('Exercise details:', details); // Debug log
      setSelectedExercise(details);
    } catch (err) {
      console.error('Error loading exercise details:', err); // Debug log
      setError('Failed to load exercise details. Please try again later.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingExercise(false);
    }
  };

  const renderDaySchedule = (day: DailyWorkout) => {
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
          <div className="mb-8">
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
          <div className="mb-8 bg-gray-50 dark:bg-[#282828] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Muscle Activation Analysis</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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

  const selectWorkout = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    setShowWorkoutList(false);
    localStorage.setItem('selectedWorkout', JSON.stringify(workout));
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

  if (!membership?.isActive) {
    return (
      <div className="min-h-screen bg-[#121212] text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-500 mb-2">Active Membership Required</h2>
              <p className="text-gray-400 mb-4">
                You need an active membership to access workout plans
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                View Membership Plans
              </button>
            </div>
          </div>
        </div>
        {selectedExercise && renderExerciseModal()}
        {loadingExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        {selectedExercise && renderExerciseModal()}
        {loadingExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
    );
  }

  if (!showWorkoutList && selectedWorkout) {
    const currentDayWorkout = getCurrentDayWorkout();

    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{selectedWorkout.title}</h1>
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
                    className="w-full bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-sm text-sm px-4 py-2.5 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#282828] transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-emerald-500" />
                      Split: {splitTypes[selectedWorkout.splitType || 'bro-split'].name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {selectedWorkout.showSplitMenu && (
                    <div className="absolute z-10 w-full mt-1 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-[#282828] transition-colors ${
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
                  className="bg-emerald-500/90 backdrop-blur-sm hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Change Workout Plan
                </button>
              </div>
            </div>

            {/* Day Selection */}
            <div className="grid grid-cols-7 gap-2 mb-8">
              {selectedWorkout.schedule?.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setCurrentDay(day.day)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    currentDay === day.day
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282828] border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{day.day.slice(0, 3)}</div>
                  <div className="text-xs mt-1 opacity-80">{day.focus.split(' ')[0]}</div>
                </button>
              ))}
            </div>

            {/* Current Day Workout */}
            {currentDayWorkout && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    {currentDayWorkout.focus}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {currentDayWorkout.exercises?.map((exercise, index) => (
                      <button
                        key={index}
                        onClick={() => viewExerciseDetails(exercise)}
                        className="w-full bg-gray-50 dark:bg-[#282828] hover:bg-gray-100 dark:hover:bg-[#333333] rounded-lg p-4 transition-colors text-left border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {exercise.name}
                              <Info className="w-4 h-4 text-emerald-500" />
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.notes}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {exercise.sets} sets × {exercise.reps}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {(!currentDayWorkout.exercises || currentDayWorkout.exercises.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          {currentDayWorkout.notes || "Rest day"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Modal */}
        {selectedExercise && (
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
              <div className="mb-8">
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
              <div className="mb-8 bg-gray-50 dark:bg-[#282828] p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Muscle Activation Analysis</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
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
        )}

        {/* Loading Overlay */}
        {loadingExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={workout.imageUrl}
                  alt={workout.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{workout.title}</h3>
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
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
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