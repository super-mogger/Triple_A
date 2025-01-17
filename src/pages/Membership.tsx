import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  pricePerMonth: number;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Basic Plan',
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
    name: 'Pro Plan',
    price: 1999,
    duration: '3 months',
    pricePerMonth: Math.round(1999 / 3),
    popular: true,
    features: [
      'All Monthly Plan features',
      'Nutrition guidance',
      'Progress tracking',
      'Priority booking for classes',
      'Guest passes (2)'
    ]
  },
  {
    id: 'biannual',
    name: 'Elite Plan',
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

export default function Membership() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    // TODO: Implement payment gateway integration
    alert('Payment gateway integration coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-[#121212] dark:to-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
            Choose Your Fitness Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transform your life with our premium membership plans
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:scale-105 ${
                selectedPlan === plan.id ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    POPULAR
                  </div>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r from-emerald-400 to-teal-400">
                    ₹{plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.duration}</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-8">
                  ₹{plan.pricePerMonth} per month
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
                  className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-400 dark:to-teal-400 dark:hover:from-emerald-500 dark:hover:to-teal-500 text-white dark:text-black py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include access to our state-of-the-art facilities and equipment
            <br />
            <span className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors">
              Contact our membership team
            </span>{' '}
            for personalized guidance
          </p>
        </div>
      </div>
    </div>
  );
} 