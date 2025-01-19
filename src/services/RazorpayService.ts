import { createPaymentRecord, updatePaymentStatus } from './supabaseService';
import { supabase } from '../config/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

// Environment configuration
const IS_DEV = import.meta.env.DEV;
const RAZORPAY_KEY = IS_DEV 
  ? 'rzp_test_GEZQfBnCrf1uyR'  // Development test key
  : import.meta.env.VITE_RAZORPAY_KEY_ID; // Production key

if (!RAZORPAY_KEY) {
  console.error('Razorpay key is not configured!');
}

// Log environment and configuration
console.log('Environment:', IS_DEV ? 'Development' : 'Production');
console.log('Using Razorpay key:', RAZORPAY_KEY ? 'Key is set' : 'Key is missing');

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const createOrder = async (amount: number, planId: string, currency: string = 'INR') => {
  try {
    if (!RAZORPAY_KEY) {
      throw new Error('Razorpay key is not configured');
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create order on backend
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const { id: orderId } = await response.json();

    // Create payment record in Supabase
    await createPaymentRecord(
      user.id,
      orderId,
      amount,
      planId,
      currency
    );

    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const initializeRazorpayPayment = async (
  amount: number,
  currency: string,
  orderId: string,
  planId: string,
  userDetails: {
    name: string;
    email: string;
    contact: string;
  },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay script not loaded');
  }

  if (!RAZORPAY_KEY) {
    throw new Error('Razorpay key is not configured');
  }

  console.log('Initializing payment:', {
    amount,
    currency,
    orderId,
    userDetails: { ...userDetails, email: userDetails.email ? '***' : undefined }
  });

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY,
    amount,
    currency,
    name: 'Triple A Fitness',
    description: 'Membership Payment',
    order_id: orderId,
    handler: async function(response) {
      try {
        // Update payment status in Supabase
        await updatePaymentStatus(orderId, 'success', response.razorpay_payment_id);
        console.log('Payment successful:', response);
        onSuccess(response);
      } catch (error) {
        console.error('Error updating payment status:', error);
        onFailure(error);
      }
    },
    prefill: {
      name: userDetails.name || '',
      email: userDetails.email || '',
      contact: userDetails.contact || '',
    },
    theme: {
      color: '#10B981'
    },
    modal: {
      ondismiss: async function() {
        try {
          await updatePaymentStatus(orderId, 'failed');
          console.log('Payment modal dismissed');
          onFailure(new Error('Payment cancelled by user'));
        } catch (error) {
          console.error('Error updating payment status:', error);
          onFailure(error);
        }
      }
    }
  };

  try {
    console.log('Creating Razorpay instance...');
    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', async function(response: any) {
      try {
        await updatePaymentStatus(orderId, 'failed');
        console.error('Payment failed:', response.error);
        onFailure(response.error);
      } catch (error) {
        console.error('Error updating payment status:', error);
        onFailure(error);
      }
    });

    console.log('Opening Razorpay modal...');
    razorpay.open();
  } catch (error) {
    console.error('Error opening Razorpay:', error);
    onFailure(error);
  }
}; 