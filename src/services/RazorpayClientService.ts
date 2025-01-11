import { loadScript } from '../utils/scriptLoader';
import { getFirestore, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const RAZORPAY_KEY = 'rzp_live_uYi8XdEi23tP10';

interface PaymentOptions {
  amount: number;
  planId: string;
  currency?: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export class RazorpayClientService {
  private static instance: RazorpayClientService;
  private razorpay: any = null;
  private functions = getFunctions();

  private constructor() {
    // Initialize Firebase Functions with Asia South 1 region
    this.functions = getFunctions(undefined, 'asia-south1');
  }

  static getInstance(): RazorpayClientService {
    if (!RazorpayClientService.instance) {
      RazorpayClientService.instance = new RazorpayClientService();
    }
    return RazorpayClientService.instance;
  }

  private async loadRazorpay(): Promise<void> {
    if (!this.razorpay) {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      this.razorpay = (window as any).Razorpay;
    }
  }

  async createOrder(options: PaymentOptions): Promise<void> {
    try {
      await this.loadRazorpay();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be logged in to make a payment');
      }

      // Call the Firebase Function to create order
      const createRazorpayOrder = httpsCallable(this.functions, 'createRazorpayOrder');
      const response = await createRazorpayOrder({
        amount: options.amount,
        planId: options.planId
      });

      const orderData = response.data as {
        orderId: string;
        amount: number;
        currency: string;
        key: string;
      };

      if (!orderData.orderId) {
        throw new Error('Failed to create order');
      }

      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Triple A Fitness',
        description: options.description,
        order_id: orderData.orderId,
        notes: {
          userId: user.uid,
          planId: options.planId
        },
        prefill: {
          name: options.prefill?.name || user.displayName || '',
          email: options.prefill?.email || user.email || '',
          contact: options.prefill?.contact || ''
        },
        theme: {
          color: '#4F46E5' // Indigo color to match your UI
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
          }
        },
        handler: async (response: any) => {
          try {
            await this.handlePaymentSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: options.amount,
              planId: options.planId,
              userId: user.uid
            });
            // Redirect to success page or show success message
            window.location.href = '/membership';
          } catch (error) {
            console.error('Payment verification failed:', error);
            // Redirect to error page or show error message
            window.location.href = '/plans?error=payment-failed';
          }
        }
      };

      const rzp = new this.razorpay(razorpayOptions);
      
      // Handle payment failures
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        window.location.href = '/plans?error=payment-failed';
      });

      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentDetails: {
    paymentId: string;
    orderId: string;
    signature: string;
    amount: number;
    planId: string;
    userId: string;
  }) {
    try {
      // Call the Firebase Function to verify payment
      const verifyRazorpayPayment = httpsCallable(this.functions, 'verifyRazorpayPayment');
      const response = await verifyRazorpayPayment({
        paymentId: paymentDetails.paymentId,
        orderId: paymentDetails.orderId,
        signature: paymentDetails.signature
      });

      const verificationResult = response.data as {
        verified: boolean;
        orderId: string;
        paymentId: string;
      };

      if (!verificationResult.verified) {
        throw new Error('Payment verification failed');
      }

      console.log('Payment verified successfully');
      return verificationResult;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

export const razorpayService = RazorpayClientService.getInstance(); 