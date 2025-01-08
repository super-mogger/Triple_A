import axios from 'axios';
import { API_CONFIG } from './config';

interface AIResponse {
  suggestion: string;
  recommendations: string[];
}

export const aiService = {
  async getWorkoutSuggestion(
    goals: string,
    fitnessLevel: string,
    limitations?: string
  ): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${API_CONFIG.OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Create a workout plan for someone with these parameters:
              Goals: ${goals}
              Fitness Level: ${fitnessLevel}
              ${limitations ? `Limitations: ${limitations}` : ''}
              Please provide a structured response with exercises, sets, reps, and progression tips.`
          }],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        suggestion: response.data.choices[0].message.content,
        recommendations: []  // Parse the response to extract specific recommendations
      };
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      throw error;
    }
  }
}; 