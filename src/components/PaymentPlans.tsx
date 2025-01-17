import React from 'react';
import { razorpayService } from '../services/RazorpayClientService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Dumbbell, Users, Star, Shield, Zap } from 'lucide-react';

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

const getErrorMessage = (errorCode: string | null): string => {
  switch (errorCode) {
    case 'payment-failed':
      return 'Your payment was not successful. Please try again.';
    case 'verification-failed':
      return 'Payment verification failed. Please contact support.';
    default:
      return 'An error occurred. Please try again.';
  }
};

export const PaymentPlans: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/plans' } });
    }
  }, [user, authLoading, navigate]);

  const handlePayment = async (plan: Plan) => {
    try {
      setLoading(plan.id);
      setError(null);

      await razorpayService.createOrder({
        amount: plan.price,
        planId: plan.id,
        name: 'Triple A Fitness',
        description: `${plan.name} Membership - ${plan.duration}`,
        prefill: {
          name: user?.displayName || undefined,
          email: user?.email || undefined,
          contact: user?.phoneNumber || undefined
        }
      });
    } catch (err) {
      console.error('Payment failed:', err);
      let errorMessage = 'Payment failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('User must be logged in')) {
          errorMessage = 'Please log in to make a payment.';
          navigate('/login', { state: { from: '/plans' } });
        } else if (err.message.includes('Failed to create order')) {
          errorMessage = 'Unable to create order. Please try again later.';
        } else if (err.message.includes('Payment verification failed')) {
          errorMessage = 'Payment verification failed. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
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

                <button
                  onClick={() => handlePayment(plan)}
                  disabled={!!loading || !user}
                  className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl
                    transition duration-150 ease-in-out flex items-center justify-center
                    ${loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''}
                    ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : !user ? (
                    'Please Login'
                  ) : (
                    'Get Started'
                  )}
                </button>
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
}; 