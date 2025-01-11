import React, { useState, useEffect } from 'react';
import { scrapeWorkoutPlans, scrapeWorkoutDetails, generatePersonalizedWorkoutPlan, getExerciseDetails, WorkoutPlan, Exercise, DailyWorkout, WeeklySchedule, ExerciseDetails } from '../services/WorkoutService';
import { Dumbbell, Filter, ChevronDown, X, Clock, Target, Gauge, Wrench, Calendar, Play, Info } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

interface Filters {
  level: string;
  duration: string;
  goal: string;
  equipment: string;
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
      setWorkouts([personalPlan, ...data]);
      setFilteredWorkouts([personalPlan, ...data]);
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
        <div className="bg-[#1E1E1E] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold">{selectedExercise.name}</h2>
            <button
              onClick={() => setSelectedExercise(null)}
              className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
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

          {/* Exercise Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Target Muscles */}
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Target Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.targetMuscles.map((muscle, index) => (
                  <span key={index} className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-sm">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Muscles */}
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Secondary Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.secondaryMuscles.map((muscle, index) => (
                  <span key={index} className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Required Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.equipment.map((item, index) => (
                  <span key={index} className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Difficulty & Category */}
            <div className="bg-[#282828] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Exercise Info</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-orange-500">{selectedExercise.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-emerald-500">{selectedExercise.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Instructions</h3>
            <div className="space-y-4">
              {selectedExercise.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="text-gray-300">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Pro Tips</h3>
            <div className="bg-[#282828] rounded-lg p-4">
              <ul className="space-y-3">
                {selectedExercise.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-xs mt-0.5">
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
        <div className="min-h-screen bg-[#121212] text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">{selectedWorkout.title}</h1>
                <p className="text-gray-400 mt-2">{selectedWorkout.description}</p>
              </div>
              <button
                onClick={changeWorkoutPlan}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Change Workout Plan
              </button>
            </div>

            {/* Day Selection */}
            <div className="grid grid-cols-7 gap-2 mb-8">
              {selectedWorkout.schedule?.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setCurrentDay(day.day)}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    currentDay === day.day
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#282828] text-gray-400 hover:bg-[#333]'
                  }`}
                >
                  <div className="font-medium">{day.day.slice(0, 3)}</div>
                  <div className="text-xs mt-1">{day.focus.split(' ')[0]}</div>
                </button>
              ))}
            </div>

            {/* Current Day Workout */}
            {currentDayWorkout && (
              <div className="bg-[#1E1E1E] rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  {currentDayWorkout.focus}
                </h2>
                {renderDaySchedule(currentDayWorkout)}
              </div>
            )}
          </div>
        </div>
        {selectedExercise && renderExerciseModal()}
        {loadingExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#121212] text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Workout Plans</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-[#1E1E1E] p-6 rounded-xl">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Goal</label>
                <select
                  value={filters.goal}
                  onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
                >
                  <option value="">All Goals</option>
                  <option value="build muscle">Build Muscle</option>
                  <option value="lose fat">Lose Fat</option>
                  <option value="strength">Build Strength</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
                >
                  <option value="">Any Duration</option>
                  <option value="4 weeks">4 Weeks</option>
                  <option value="8 weeks">8 Weeks</option>
                  <option value="12 weeks">12 Weeks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Equipment</label>
                <select
                  value={filters.equipment}
                  onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
                  className="w-full bg-[#282828] rounded-lg px-4 py-2 text-white border border-gray-700"
                >
                  <option value="">Any Equipment</option>
                  <option value="full gym">Full Gym</option>
                  <option value="dumbbells">Dumbbells</option>
                  <option value="bodyweight">Bodyweight</option>
                </select>
              </div>
            </div>
          )}

          {/* Workout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
                onClick={() => selectWorkoutPlan(workout)}
              >
                {workout.imageUrl && (
                  <img
                    src={workout.imageUrl}
                    alt={workout.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{workout.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Gauge className="w-4 h-4" />
                      <span>Level: {workout.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {workout.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>Goal: {workout.goal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Wrench className="w-4 h-4" />
                      <span>Equipment: {workout.equipment}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{workout.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md animate-fade-in">
              <div className="flex items-center gap-2">
                <h3 className="text-red-500 font-medium">{error}</h3>
                <button 
                  onClick={() => setError(null)}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedExercise && renderExerciseModal()}
      {loadingExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      )}
    </>
  );
} 