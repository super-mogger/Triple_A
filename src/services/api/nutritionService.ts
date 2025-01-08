import axios from 'axios';
import { API_CONFIG } from './config';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface Food {
  name: string;
  servingSize: string;
  nutrition: NutritionInfo;
}

export const nutritionService = {
  async searchFood(query: string): Promise<Food[]> {
    try {
      const response = await axios.get(`${API_CONFIG.NUTRITION_BASE_URL}/search/instant`, {
        headers: {
          'x-app-id': API_CONFIG.NUTRITIONIX_APP_ID,
          'x-app-key': API_CONFIG.NUTRITIONIX_API_KEY
        },
        params: { query }
      });
      return response.data.common;
    } catch (error) {
      console.error('Error searching food:', error);
      throw error;
    }
  },

  async getNutritionInfo(query: string): Promise<NutritionInfo> {
    try {
      const response = await axios.post(
        `${API_CONFIG.NUTRITION_BASE_URL}/natural/nutrients`,
        { query },
        {
          headers: {
            'x-app-id': API_CONFIG.NUTRITIONIX_APP_ID,
            'x-app-key': API_CONFIG.NUTRITIONIX_API_KEY
          }
        }
      );
      return response.data.foods[0];
    } catch (error) {
      console.error('Error getting nutrition info:', error);
      throw error;
    }
  }
}; 