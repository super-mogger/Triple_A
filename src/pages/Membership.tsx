import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      'Full access to gym equipment',
      'Basic workout plans',
      'Access to fitness classes',
      'Locker room access',
      'Cancel anytime'
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
      'Personalized workout plans',
      'Nutrition guidance',
      '1 Personal training session/month',
      'Save ₹98 per month'
    ]
  },
  {
    id: 'biannual',
    name: 'Biannual Plan',
    price: 3999,
    duration: '6 months',
    pricePerMonth: Math.round(3999 / 6),
    features: [
      'All Quarterly Plan features',
      'Priority booking for classes',
      '2 Personal training sessions/month',
      'Monthly fitness assessment',
      'Save ₹133 per month'
    ]
  }
];

export default function Membership() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    // TODO: Implement payment gateway integration
    // For now, just navigate to a success page or show a modal
    alert('Payment gateway integration coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Membership Plan</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Invest in your health with our flexible membership options
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md ${
                selectedPlan === plan.id ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Just ₹{plan.pricePerMonth} per month
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400">
            All plans include access to our state-of-the-art facilities and equipment.
            <br />
            Need help choosing? Contact our membership team.
          </p>
        </div>
      </div>
    </div>
  );
} 