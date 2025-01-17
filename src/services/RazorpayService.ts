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
}

const RAZORPAY_KEY = 'rzp_test_GEZQfBnCrf1uyR';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (
  amount: number,
  currency: string,
  orderId: string,
  userDetails: {
    name: string;
    email: string;
    contact: string;
  },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY,
    amount: amount,
    currency: currency,
    name: 'Triple A Fitness',
    description: 'Membership Payment',
    order_id: orderId,
    handler: (response) => {
      onSuccess(response);
    },
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.contact,
    },
    theme: {
      color: '#10B981' // emerald-500
    }
  };

  try {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onFailure(error);
  }
}; 