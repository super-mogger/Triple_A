import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface FormData {
  // Basic Info
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';

  // Body Metrics
  height: string;
  weight: string;
  bodyFat?: string;
  measurementUnit: 'metric' | 'imperial';

  // Fitness Goals
  primaryGoal: 'bulking' | 'cutting' | 'maintenance';
  targetWeight: string;
  timeline: string;

  // Activity
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'super';
  workoutPreference: string[];
  workoutFrequency: string;
  sessionDuration: string;

  // Diet
  dietType: string;
  allergies: string;
  mealFrequency: string;
  budget: 'low' | 'medium' | 'high';

  // Health
  medicalConditions: string;
  injuries: string;
  supplements: string;

  // Fitness Level
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  benchPress?: string;
  squat?: string;
  deadlift?: string;
  cardioLevel: string;
}

const initialFormData: FormData = {
  name: '',
  age: '',
  gender: 'male',
  height: '',
  weight: '',
  measurementUnit: 'metric',
  primaryGoal: 'maintenance',
  targetWeight: '',
  timeline: '',
  activityLevel: 'moderate',
  workoutPreference: [],
  workoutFrequency: '',
  sessionDuration: '',
  dietType: '',
  allergies: '',
  mealFrequency: '',
  budget: 'medium',
  medicalConditions: '',
  injuries: '',
  supplements: '',
  experienceLevel: 'beginner',
  cardioLevel: ''
};

export default function UserInfoForm() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      workoutPreference: checked
        ? [...prev.workoutPreference, name]
        : prev.workoutPreference.filter(item => item !== name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to database
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Body Metrics</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Measurement Unit</label>
              <select
                name="measurementUnit"
                value={formData.measurementUnit}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              >
                <option value="metric">Metric (cm/kg)</option>
                <option value="imperial">Imperial (ft/lbs)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Height ({formData.measurementUnit === 'metric' ? 'cm' : 'ft'})
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Weight ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Body Fat % (optional)</label>
              <input
                type="number"
                name="bodyFat"
                value={formData.bodyFat}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        );

      // Add more cases for other steps...

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto p-4">
        <div className={`p-6 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
              )}
              
              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 ml-auto"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 ml-auto"
                >
                  Complete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 