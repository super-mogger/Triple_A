import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-blue-600 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Membership Plan</h1>
          <p className="text-xl text-white/80">
            Invest in your health with our flexible membership options
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-transform hover:scale-105 ${
                selectedPlan === plan.id ? 'ring-4 ring-emerald-500' : ''
              }`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Just ₹{plan.pricePerMonth} per month
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 group"
                >
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/80">
            All plans include access to our state-of-the-art facilities and equipment.
            <br />
            Need help choosing? Contact our membership team.
          </p>
        </div>
      </div>
    </div>
  );
} 