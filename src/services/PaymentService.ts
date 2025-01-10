declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
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
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializePayment = async (
  options: PaymentOptions,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  const razorpay = new window.Razorpay({
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    ...options,
    handler: (response: any) => {
      onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        console.log('Payment modal closed');
      },
    },
  });

  razorpay.on('payment.failed', (response: any) => {
    onError(response.error);
  });

  razorpay.open();
};

export const createOrder = async (amount: number, planId: string) => {
  try {
    // TODO: Replace with actual API call to your backend
    // The backend should create an order with Razorpay and return the order ID
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, planId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data.orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    // TODO: Replace with actual API call to your backend
    // The backend should verify the payment with Razorpay
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, orderId, signature }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 