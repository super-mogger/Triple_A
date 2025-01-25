import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface OrderDetails {
  amount: number;
  planId: string;
  userId: string;
}

interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  planId: string;
  userInfo: {
    name: string;
    email: string;
    contact: string;
  };
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createOrder = async (orderDetails: OrderDetails): Promise<string> => {
  try {
    // Create an order document in Firestore
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      amount: orderDetails.amount,
      planId: orderDetails.planId,
      userId: orderDetails.userId,
      status: 'pending',
      createdAt: new Date(),
    });

    // In a production environment, you would make an API call to your backend
    // to create a Razorpay order and get the order ID
    // For now, we'll use the Firestore document ID as the order ID
    return orderDoc.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const initializeRazorpayPayment = async (options: PaymentOptions): Promise<void> => {
  const { amount, currency, orderId, planId, userInfo, onSuccess, onError } = options;

  const razorpayOptions = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    name: 'Triple A Gym',
    description: `Payment for ${planId} plan`,
    order_id: orderId,
    prefill: {
      name: userInfo.name,
      email: userInfo.email,
      contact: userInfo.contact,
    },
    handler: async function (response: any) {
      try {
        // Update order status in Firestore
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'completed',
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          updatedAt: new Date(),
        });

        onSuccess(response);
      } catch (error) {
        console.error('Error updating order status:', error);
        onError(error);
      }
    },
    modal: {
      ondismiss: function () {
        onError(new Error('Payment cancelled by user'));
      },
    },
    theme: {
      color: '#10B981',
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  razorpay.open();
}; 