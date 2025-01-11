import { getFunctions, httpsCallable, HttpsCallableResult, Functions } from 'firebase/functions';
import { app } from '../config/firebase';

// Initialize Firebase Functions with the Asia South 1 region
const functions: Functions = getFunctions(app, 'asia-south1');

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface VerifyPaymentResponse {
  verified: boolean;
  orderId: string;
  paymentId: string;
}

interface RazorpayError extends Error {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  httpStatus?: number;
}

const handleError = (error: unknown): never => {
  console.error('Payment service error:', error);
  
  if (error instanceof Error) {
    const razorpayError = error as RazorpayError;
    if (razorpayError.code === 'unauthenticated') {
      throw new Error('Please sign in to continue with the payment');
    }
    if (razorpayError.code === 'invalid-argument') {
      throw new Error('Invalid payment details provided');
    }
    if (razorpayError.code === 'failed-precondition') {
      throw new Error('Payment service is not properly configured');
    }
    throw new Error(razorpayError.message || 'Payment service error');
  }
  
  throw new Error('An unexpected error occurred');
};

const callFunction = async <T, R>(
  name: string,
  data: T
): Promise<R> => {
  try {
    const func = httpsCallable<T, R>(functions, name);
    const result = await func(data);
    if (!result.data) {
      throw new Error('No response received from server');
    }
    return result.data;
  } catch (error) {
    console.error(`Error calling function ${name}:`, error);
    throw error;
  }
};

export const createRazorpayOrder = async (amount: number, planId: string): Promise<CreateOrderResponse> => {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount specified');
    }

    if (!planId) {
      throw new Error('Plan ID is required');
    }

    console.log('Creating Razorpay order:', { amount, planId });
    const result = await callFunction<{ amount: number; planId: string }, CreateOrderResponse>(
      'createRazorpayOrder',
      { amount, planId }
    );

    console.log('Order created successfully:', { orderId: result.orderId });
    return result;
  } catch (error) {
    return handleError(error);
  }
};

export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<VerifyPaymentResponse> => {
  try {
    if (!paymentId || !orderId || !signature) {
      throw new Error('Payment verification requires payment ID, order ID, and signature');
    }

    console.log('Verifying payment:', { paymentId, orderId });
    const result = await callFunction<
      { paymentId: string; orderId: string; signature: string },
      VerifyPaymentResponse
    >('verifyRazorpayPayment', { paymentId, orderId, signature });

    console.log('Payment verification result:', { verified: result.verified, paymentId });
    return result;
  } catch (error) {
    return handleError(error);
  }
}; 