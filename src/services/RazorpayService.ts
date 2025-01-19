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
    escape: boolean;
    confirm_close: boolean;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
  notes?: Record<string, string>;
}

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, any>;
}

// Environment configuration
const IS_DEV = import.meta.env.DEV;
const RAZORPAY_KEY = IS_DEV 
  ? import.meta.env.VITE_RAZORPAY_TEST_KEY_ID
  : import.meta.env.VITE_RAZORPAY_KEY_ID;

// Logging configuration
const logPaymentEvent = (event: string, data?: any) => {
  console.log(`[Razorpay] ${event}:`, data);
};

// Error handling
const handlePaymentError = (error: PaymentError): never => {
  logPaymentEvent('Error', error);
  throw new Error(`Payment failed: ${error.description || error.reason}`);
};

export const loadRazorpayScript = async (retryCount = 0): Promise<boolean> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  try {
    if (window.Razorpay) {
      logPaymentEvent('Script already loaded');
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        logPaymentEvent('Script loaded successfully');
        resolve(true);
      };

      script.onerror = async (error) => {
        logPaymentEvent('Script load failed', error);
        if (retryCount < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          resolve(loadRazorpayScript(retryCount + 1));
        } else {
          resolve(false);
        }
      };

      document.body.appendChild(script);
    });
  } catch (error) {
    logPaymentEvent('Script load error', error);
    return false;
  }
};

export const createOrder = async (amount: number, planId: string, currency: string = 'INR') => {
  try {
    if (!RAZORPAY_KEY) {
      throw new Error('Razorpay key is not configured. Please check your environment variables.');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    logPaymentEvent('Creating order', { amount, planId, currency, userId: session.user.id });

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-functions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ 
        path: 'create-order',
        userId: session.user.id,
        planId,
        amount,
        currency 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logPaymentEvent('Order creation failed', errorData);
      throw new Error(errorData.error || `Failed to create order: ${response.status}`);
    }

    const data = await response.json();
    logPaymentEvent('Order created', data);
    return data.orderId;
  } catch (error) {
    logPaymentEvent('Order creation error', error);
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
    userId: string;
  },
  onSuccess: (response: PaymentResponse) => void,
  onFailure: (error: PaymentError) => void
) => {
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const tryPayment = async (): Promise<void> => {
    try {
      if (!window.Razorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Failed to load Razorpay script');
        }
      }

      if (!RAZORPAY_KEY) {
        throw new Error('Razorpay key is not configured');
      }

      logPaymentEvent('Initializing payment', {
        amount: amount * 100,
        currency,
        orderId,
        userDetails: { ...userDetails, email: '***' }
      });

      const options: RazorpayOptions = {
        key: RAZORPAY_KEY,
        amount: amount * 100,
        currency,
        name: 'Triple A Fitness',
        description: 'Membership Payment',
        order_id: orderId,
        handler: async function(response: PaymentResponse) {
          try {
            logPaymentEvent('Payment successful', response);
            await updatePaymentStatus(orderId, 'success', response.razorpay_payment_id);
            onSuccess(response);
          } catch (error) {
            logPaymentEvent('Status update failed', error);
            onFailure(error as PaymentError);
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
              logPaymentEvent('Payment modal dismissed');
              await updatePaymentStatus(orderId, 'failed');
              onFailure({
                code: 'PAYMENT_CANCELLED',
                description: 'Payment cancelled by user',
                source: 'user',
                step: 'payment_initiation',
                reason: 'modal_closed',
                metadata: { orderId }
              });
            } catch (error) {
              logPaymentEvent('Status update failed after dismiss', error);
              onFailure(error as PaymentError);
            }
          },
          escape: false,
          confirm_close: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        notes: {
          user_id: userDetails.userId,
          plan_id: planId
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', async function(response: { error: PaymentError }) {
        try {
          logPaymentEvent('Payment failed', response.error);
          await updatePaymentStatus(orderId, 'failed');
          onFailure(response.error);
        } catch (error) {
          logPaymentEvent('Status update failed after payment failure', error);
          onFailure(error as PaymentError);
        }
      });

      razorpay.on('payment.error', function(error: PaymentError) {
        logPaymentEvent('Payment error', error);
        onFailure(error);
      });

      razorpay.on('payment.captured', function(response: PaymentResponse) {
        logPaymentEvent('Payment captured', response);
      });

      logPaymentEvent('Opening payment modal');
      razorpay.open();
    } catch (error) {
      logPaymentEvent('Payment initialization error', error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return tryPayment();
      }
      onFailure(error as PaymentError);
    }
  };

  return tryPayment();
}; 