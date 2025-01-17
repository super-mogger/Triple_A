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

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

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
      // Send verification request to Vercel API
      fetch('/api/razorpay/verifyPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          onSuccess(response);
        } else {
          onFailure(new Error('Payment verification failed'));
        }
      })
      .catch(error => {
        onFailure(error);
      });
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