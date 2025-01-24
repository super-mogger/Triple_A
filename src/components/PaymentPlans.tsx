import React, { useState, useCallback } from 'react';
import { loadRazorpayScript, initializeRazorpayPayment, createOrder } from '../services/RazorpayService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Dumbbell, Users, Star, Shield, Zap } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';

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
    name: 'Basic Plan',
    price: 999,
    duration: '1 Month',
    icon: <Dumbbell className="w-6 h-6 text-emerald-500" />,
    features: [
      'Full Gym Access',
      'Personal Trainer',
      'Diet Consultation',
      'Progress Tracking',
      'Basic Workout Plans',
      'Mobile App Access'
    ]
  },
  {
    id: 'quarterly',
    name: 'Pro Plan',
    price: 2499,
    duration: '3 Months',
    popular: true,
    icon: <Crown className="w-6 h-6 text-emerald-500" />,
    features: [
      'All Basic Features',
      'Premium Workout Plans',
      'Group Fitness Classes',
      'Nutrition Planning',
      '15% Supplement Discount',
      'Priority Support'
    ]
  },
  {
    id: 'yearly',
    name: 'Elite Plan',
    price: 7999,
    duration: '12 Months',
    icon: <Star className="w-6 h-6 text-emerald-500" />,
    features: [
      'All Pro Features',
      'Personal Training Sessions',
      'Custom Workout Plans',
      'Free Supplements',
      '25% Store Discount',
      'VIP Support'
    ]
  }
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export default function PaymentPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(plan.id);
      setError(null);
      console.log('Starting payment flow for plan:', plan.name);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment system. Please refresh and try again.');
      }

      // Create order
      const amount = Math.round(plan.price * 100); // Convert to paise
      console.log('Creating order with amount:', amount);
      const orderId = await createOrder(amount);
      
      if (!orderId) {
        throw new Error('Failed to create order. Please try again.');
      }

      // Initialize payment
      console.log('Initializing Razorpay payment...');
      await initializeRazorpayPayment(
        amount,
        'INR',
        orderId,
        {
          name: user.displayName || 'User',
          email: user.email || '',
          contact: user.phoneNumber || '',
        },
        handlePaymentSuccess,
        handlePaymentError
      );
    } catch (error) {
      console.error('Payment flow error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  }, [user, navigate]);

  const handlePaymentSuccess = async (response: any) => {
    try {
      const { data: membership, error } = await verifyPayment(response);
      if (error) {
        throw error;
      }
      if (membership) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMessage = error.message || 'Payment verification failed';
      setError(errorMessage);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    const errorMessage = error.message || 'Payment failed';
    setError(errorMessage);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choose Your Fitness Journey
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Select the plan that best fits your goals
          </p>
        </div>

        {error && (
          <div className="mt-8 max-w-md mx-auto bg-red-900/50 border border-red-500/50 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-3 sm:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#1E1E1E] rounded-2xl shadow-xl overflow-hidden border border-gray-800 ${
                plan.popular ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {plan.icon}
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                
                <p className="text-gray-400 mb-8">{plan.duration}</p>
                
                <p className="flex items-baseline mb-8">
                  <span className="text-5xl font-extrabold text-white">₹{plan.price}</span>
                  <span className="ml-2 text-gray-400">/{plan.duration.toLowerCase()}</span>
                </p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Zap className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="px-6 pt-6 pb-8">
                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={loading === plan.id}
                    className={`w-full bg-emerald-500 text-white rounded-md px-4 py-2 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1E1E1E] px-4 py-2 rounded-xl border border-gray-800">
            <Shield className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-gray-400">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 