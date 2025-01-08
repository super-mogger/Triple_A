import axios from 'axios';
import { API_CONFIG } from './config';

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscles: string[];
  equipment: string[];
  instructions: string[];
  difficulty: string;
  images?: string[];
}

export const exerciseService = {
  async getExercises(bodyPart?: string): Promise<Exercise[]> {
    try {
      const response = await axios.get(`${API_CONFIG.EXERCISE_DB_URL}/exercises`, {
        headers: {
          'X-RapidAPI-Key': API_CONFIG.RAPID_API_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        },
        params: bodyPart ? { bodyPart } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  async getExerciseById(id: string): Promise<Exercise> {
    try {
      const response = await axios.get(`${API_CONFIG.EXERCISE_DB_URL}/exercises/exercise/${id}`, {
        headers: {
          'X-RapidAPI-Key': API_CONFIG.RAPID_API_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  }
}; 