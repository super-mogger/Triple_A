import React from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TestPayment() {
  const { user } = useAuth();

  const handleTestPayment = () => {
    if (!user) {
      toast.error('Please sign in to make a payment');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: 1000, // ₹10 = 1000 paise
      currency: "INR",
      name: "Triple A Gym",
      description: "Test Payment",
      handler: function (response: any) {
        toast.success(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        console.log('Payment success:', response);
      },
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phoneNumber || '',
      },
      theme: {
        color: "#10B981",
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Test Payment
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Make a test payment of ₹10 to verify the payment integration.
      </p>
      <button
        onClick={handleTestPayment}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        Pay ₹10
      </button>
    </div>
  );
} 