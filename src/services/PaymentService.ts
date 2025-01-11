declare global {
  interface Window {
    Razorpay: any;
  }
}

import { createRazorpayOrder, verifyRazorpayPayment } from './RazorpayBackendService';
import { getAuth } from 'firebase/auth';

export interface PaymentOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefillEmail: string;
  prefillName: string;
  theme: {
    color: string;
  };
  notes?: Record<string, string>;
  image?: string;
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata?: Record<string, any>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const loadRazorpayScript = async (retryCount = 0): Promise<boolean> => {
  try {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = async () => {
        console.error(`Failed to load Razorpay SDK (attempt ${retryCount + 1})`);
        if (retryCount < MAX_RETRIES) {
          await wait(RETRY_DELAY);
          const result = await loadRazorpayScript(retryCount + 1);
          resolve(result);
        } else {
          resolve(false);
        }
      };
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading Razorpay script:', error);
    return false;
  }
};

export const initializePayment = async (
  options: PaymentOptions,
  onSuccess: (response: PaymentResponse) => void,
  onError: (error: PaymentError) => void
): Promise<void> => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK after multiple attempts');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!user.email) {
      throw new Error('User email is required for payment');
    }

    console.log('Initializing payment with options:', {
      ...options,
      key: '***' // Hide the key in logs
    });

    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name,
      description: options.description,
      image: options.image,
      order_id: options.orderId,
      handler: function(response: PaymentResponse) {
        console.log('Payment successful:', response.razorpay_payment_id);
        onSuccess(response);
      },
      prefill: {
        name: user.displayName || undefined,
        email: user.email,
        contact: user.phoneNumber || undefined
      },
      notes: {
        ...options.notes,
        userId: user.uid
      },
      theme: {
        color: options.theme?.color || '#3B82F6'
      },
      modal: {
        confirm_close: true,
        escape: false,
        ondismiss: function() {
          console.log('Payment modal closed by user');
          onError({
            code: 'MODAL_CLOSED',
            description: 'Payment cancelled by user',
            source: 'client',
            step: 'modal',
            reason: 'User closed the payment modal'
          });
        }
      }
    });

    razorpay.on('payment.failed', function(response: { error: PaymentError }) {
      console.error('Payment failed:', response.error);
      onError({
        ...response.error,
        metadata: {
          orderId: options.orderId,
          amount: options.amount
        }
      });
    });

    console.log('Opening Razorpay modal');
    razorpay.open();
  } catch (error) {
    console.error('Payment initialization error:', error);
    onError({
      code: 'INITIALIZATION_ERROR',
      description: 'Failed to initialize payment',
      source: 'client',
      step: 'initialization',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createOrder = async (amount: number, planId: string, retryCount = 0): Promise<string> => {
  try {
    console.log('Creating order:', { amount, planId });
    const response = await createRazorpayOrder(amount, planId);
    console.log('Order created:', response.orderId);
    return response.orderId;
  } catch (error) {
    console.error(`Error creating order (attempt ${retryCount + 1}):`, error);
    if (retryCount < MAX_RETRIES) {
      await wait(RETRY_DELAY);
      return createOrder(amount, planId, retryCount + 1);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to create order');
  }
};

export const verifyPayment = async (
  paymentId: string, 
  orderId: string, 
  signature: string,
  retryCount = 0
): Promise<boolean> => {
  try {
    console.log('Verifying payment:', { paymentId, orderId });
    const response = await verifyRazorpayPayment(paymentId, orderId, signature);
    console.log('Payment verification result:', response.verified);
    return response.verified;
  } catch (error) {
    console.error(`Error verifying payment (attempt ${retryCount + 1}):`, error);
    if (retryCount < MAX_RETRIES) {
      await wait(RETRY_DELAY);
      return verifyPayment(paymentId, orderId, signature, retryCount + 1);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to verify payment');
  }
}; 