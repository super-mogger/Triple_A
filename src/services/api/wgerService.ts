import axios from 'axios';
import { API_CONFIG } from './config';

const WGER_API_KEY = '6d5464340c47ffdf3285cde2850fc2914b96479b';

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  muscles: string[];
  equipment: string[];
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  days: WorkoutDay[];
}

interface WorkoutDay {
  id: number;
  description: string;
  day: number;
  exercises: ExerciseSet[];
}

interface ExerciseSet {
  exercise: number;
  sets: number;
  reps: number;
  weight?: number;
}

export const wgerService = {
  async getExercises(): Promise<Exercise[]> {
    try {
      const response = await axios.get(`${API_CONFIG.WGER_BASE_URL}/exercise/`, {
        headers: {
          'Authorization': `Token ${WGER_API_KEY}`,
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  async getExerciseById(id: number): Promise<Exercise> {
    try {
      const response = await axios.get(`${API_CONFIG.WGER_BASE_URL}/exercise/${id}/`, {
        headers: {
          'Authorization': `Token ${WGER_API_KEY}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  },

  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    try {
      const response = await axios.get(`${API_CONFIG.WGER_BASE_URL}/workout/`, {
        headers: {
          'Authorization': `Token ${WGER_API_KEY}`,
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      throw error;
    }
  }
}; 