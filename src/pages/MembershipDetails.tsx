import React from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';

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
  const { membership } = usePayment();

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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button with Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Membership</h1>
        </div>

        {/* Active Membership */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Active Membership</h2>
            </div>
            <span className={`px-3 py-1 ${
              membership?.isActive 
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-red-100 text-red-600'
            } text-sm rounded-full`}>
              {membership?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">{activePlan?.name || 'No Active Plan'}</h3>
            <p className="text-sm text-gray-500">
              {membership?.endDate ? `Valid until ${new Date(membership.endDate).toLocaleDateString()}` : 'Not subscribed'}
            </p>
          </div>

          {membership?.isActive && (
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-right">
                  <span className="text-sm font-semibold text-emerald-600">
                    {daysRemaining} days
                  </span>
                  <span className="text-sm text-gray-500"> remaining</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${(daysRemaining / totalDays) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 border ${
                  membership?.planId === plan.id
                    ? 'border-emerald-500'
                    : 'border-gray-200 hover:border-emerald-200'
                } transition-colors`}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-500">/{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Just ₹{plan.pricePerMonth} per month
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full ${
                    membership?.planId === plan.id
                      ? 'bg-emerald-100 text-emerald-600 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  } py-2 rounded-lg font-medium transition-colors`}
                  disabled={membership?.planId === plan.id}
                >
                  {membership?.planId === plan.id ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 