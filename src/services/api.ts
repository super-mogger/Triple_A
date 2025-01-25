// API Configuration
const IS_DEV = import.meta.env.DEV;
const API_BASE_URL = IS_DEV 
  ? 'http://localhost:3000/api'  // Local development
  : 'http://localhost:3000/api'; // Temporarily use local for production too

// Razorpay test configuration
const TEST_KEY = 'rzp_test_GEZQfBnCrf1uyR';

export const api = {
  async post(endpoint: string, data: any) {
    try {
      // Log request details
      console.log('API Request:', {
        url: `${API_BASE_URL}${endpoint}`,
        method: 'POST',
        data
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API Success:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  },

  razorpay: {
    async createOrder(amount: number, currency: string = 'INR') {
      try {
        // Ensure amount is a whole number
        const validAmount = Math.round(amount);
        
        const data = await api.post('/razorpay/createOrder', {
          amount: validAmount,
          currency
        });
        
        return data.orderId;
      } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
      }
    }
  }
}; 