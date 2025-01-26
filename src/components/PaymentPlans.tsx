import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadRazorpayScript, createOrder, initializeRazorpayPayment } from '../services/RazorpayService';
import { Dumbbell, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 699,
    duration: '1 Month',
    features: [
      'Access to all gym equipment',
      'Personal trainer consultation',
      'Group fitness classes',
      'Locker room access',
      'Fitness assessment'
    ],
    icon: <Clock className="w-6 h-6" />
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 1799,
    duration: '3 Months',
    features: [
      'All Monthly Plan features',
      'Nutrition consultation',
      'Personalized workout plan',
      'Progress tracking',
      'Priority booking'
    ],
    popular: true,
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: 'yearly',
    name: 'Annual Plan',
    price: 5999,
    duration: '12 Months',
    features: [
      'All Quarterly Plan features',
      'Free supplements starter pack',
      'Exclusive member events',
      'Guest passes',
      'Annual health check-up'
    ],
    icon: <Dumbbell className="w-6 h-6" />
  }
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function PaymentPlans() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (plan: Plan) => {
    if (!user) {
      toast.error('Please sign in to purchase a plan');
      return;
    }

    try {
      setLoading(plan.id);

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const { orderId, razorpayOrderId } = await createOrder({
        amount: plan.price,
        planId: plan.id,
        userId: user.uid
      });

      // Initialize payment
      await initializeRazorpayPayment({
        amount: plan.price,
        currency: 'INR',
        orderId: razorpayOrderId,
        planId: plan.id,
        userInfo: {
          name: user.displayName || '',
          email: user.email || '',
          contact: user.phoneNumber || ''
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  const handlePaymentSuccess = (response: any) => {
    toast.success('Payment successful! Welcome to Triple A Gym!');
    console.log('Payment success:', response);
  };

  const handlePaymentError = (error: any) => {
    toast.error('Payment failed: ' + getErrorMessage(error));
    console.error('Payment error:', error);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Select the perfect membership plan for your fitness journey
        </p>
      </div>

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 ${
              plan.popular ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan.duration}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  plan.popular ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {React.cloneElement(plan.icon as React.ReactElement, {
                    className: `w-6 h-6 ${plan.popular ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`
                  })}
                </div>
              </div>

              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
              </p>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={!!loading}
                className={`mt-8 w-full py-3 px-4 rounded-md shadow ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500'
                    : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                } text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 