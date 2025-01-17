import React, { useState } from 'react';
import { ArrowLeft, Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import { useTheme } from '../context/ThemeContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  pricePerMonth: number;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 699,
    duration: '1 month',
    pricePerMonth: 699,
    features: [
      'Access to all gym equipment',
      'Personal trainer consultation',
      'Group fitness classes',
      'Locker room access',
      'Fitness assessment'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 1999,
    duration: '3 months',
    pricePerMonth: Math.round(1999 / 3),
    features: [
      'All Monthly Plan features',
      'Nutrition consultation',
      'Progress tracking',
      'Priority booking for classes',
      'Guest passes (2)'
    ]
  },
  {
    id: 'biannual',
    name: '6 Month Plan',
    price: 3999,
    duration: '6 months',
    pricePerMonth: Math.round(3999 / 6),
    features: [
      'All Quarterly Plan features',
      'Personalized workout plans',
      'Monthly body composition analysis',
      'Premium app features',
      'Unlimited guest passes'
    ]
  }
];

export default function MembershipDetails() {
  const navigate = useNavigate();
  const { membership, initiatePayment } = usePayment();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Calculate days remaining
  const daysRemaining = membership?.endDate 
    ? Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate total days
  const totalDays = membership?.startDate && membership?.endDate
    ? Math.ceil((new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  // Get active plan details
  const activePlan = membership?.planId ? plans.find(p => p.id === membership.planId) : null;

  const handlePayment = async (plan: Plan) => {
    try {
      setLoading(true);
      setSelectedPlan(plan.id);
      await initiatePayment({
        amount: plan.price * 100, // Convert to paise
        currency: 'INR',
        description: `${plan.name} - ${plan.duration} Membership`,
        planId: plan.id
      });
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button with Title */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership</h1>
        </div>

        {/* Active Membership Card */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Membership</h2>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              membership?.isActive 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
              {membership?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {activePlan?.name || 'No Active Plan'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {membership?.endDate ? `Valid until ${new Date(membership.endDate).toLocaleDateString()}` : 'Not subscribed'}
            </p>
          </div>

          {membership?.isActive && (
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {daysRemaining} days
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400"> remaining</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(daysRemaining / totalDays) * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border ${
                  membership?.planId === plan.id
                    ? 'border-emerald-500 dark:border-emerald-400'
                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                } transition-all duration-300 hover:shadow-lg`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Just ₹{plan.pricePerMonth} per month
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loading || membership?.planId === plan.id}
                  className={`w-full py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    membership?.planId === plan.id
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-default'
                      : loading && selectedPlan === plan.id
                      ? 'bg-gray-300 text-gray-600 cursor-wait'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-gradient-to-r dark:from-emerald-400 dark:to-teal-400 dark:hover:from-emerald-500 dark:hover:to-teal-500 dark:text-black'
                  }`}
                >
                  {membership?.planId === plan.id 
                    ? 'Current Plan' 
                    : loading && selectedPlan === plan.id 
                    ? 'Processing...' 
                    : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 