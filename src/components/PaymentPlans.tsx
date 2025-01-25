import React from 'react';
import { razorpayService } from '../services/RazorpayClientService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 999,
    duration: '1 Month',
    features: [
      'Full Gym Access',
      'Personal Trainer',
      'Diet Consultation',
      'Progress Tracking'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 2499,
    duration: '3 Months',
    features: [
      'All Monthly Features',
      'Fitness Classes',
      '15% Discount',
      'Nutrition Plan'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 7999,
    duration: '12 Months',
    features: [
      'All Quarterly Features',
      'Free Supplements',
      '25% Discount',
      'Priority Support'
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

  // Handle URL error parameters
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
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
        description: `${plan.name} Membership`,
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
<<<<<<< Updated upstream
      
      setError(errorMessage);
=======

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
>>>>>>> Stashed changes
    } finally {
      setLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Choose Your Membership Plan
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Select the plan that best fits your fitness journey
        </p>
      </div>

      {error && (
        <div className="mt-8 max-w-md mx-auto bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-4 text-gray-500">{plan.duration}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹{plan.price}
                </span>
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={!!loading}
                className={`mt-8 block w-full bg-indigo-600 hover:bg-indigo-700 
                  text-white font-semibold py-3 px-4 rounded-md text-center
                  transition duration-150 ease-in-out
                  ${loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''}
                  ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : !user ? (
                  'Please Login'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 