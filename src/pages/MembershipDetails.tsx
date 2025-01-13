import React from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
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
  const activePlan = {
    name: 'Monthly Plan',
    validUntil: '2/10/2025',
    daysRemaining: 28,
    totalDays: 30
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button with Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Membership</h1>
        </div>

        {/* Active Membership */}
        <div className="bg-[#1E1E1E] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Active Membership</h2>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-sm rounded-full">
              Active
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium">{activePlan.name}</h3>
            <p className="text-sm text-gray-400">Valid until {activePlan.validUntil}</p>
          </div>

          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-right">
                <span className="text-sm font-semibold text-emerald-500">
                  {activePlan.daysRemaining} days
                </span>
                <span className="text-sm text-gray-400"> remaining</span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-[#282828]">
              <div
                style={{ width: `${(activePlan.daysRemaining / activePlan.totalDays) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold">₹{plan.price}</span>
                  <span className="text-gray-400">/{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Just ₹{plan.pricePerMonth} per month
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-emerald-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors">
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 