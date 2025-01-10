import { ArrowLeft, ArrowRight, Check, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Define plan interface
interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  pricePerMonth: number;
  features: string[];
}

// Define available plans
const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 699,
    duration: 'month',
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Mock active membership data (replace with actual data from backend)
  const activeMembership = {
    plan: 'quarterly',
    startDate: '2024-01-08',
    endDate: '2024-04-08',
    isActive: false
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    // TODO: Implement payment gateway integration
    alert('Payment gateway integration coming soon!');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-[#282828] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Membership Details</h1>
        </div>

        {/* Active Membership Status */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-[#282828] flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Active Membership
            </h2>
            {activeMembership.isActive ? (
              <span className="bg-emerald-600/20 text-emerald-500 px-3 py-1 rounded-full text-sm">
                Active
              </span>
            ) : (
              <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm">
                Inactive
              </span>
            )}
          </div>
          <div className="p-6">
            {activeMembership.isActive ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{plans.find(p => p.id === activeMembership.plan)?.name}</h3>
                    <p className="text-gray-400 text-sm">Valid until {new Date(activeMembership.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Days Remaining</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {Math.ceil((new Date(activeMembership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (new Date(activeMembership.endDate).getTime() - new Date().getTime()) / 
                        (new Date(activeMembership.endDate).getTime() - new Date(activeMembership.startDate).getTime()) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-300">No Active Membership</p>
                  <p className="text-gray-500 mt-1">Choose a plan below to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-[#1E1E1E] rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-[#282828]">
            <h2 className="text-xl font-semibold">Available Plans</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-[#282828] rounded-xl p-6 transition-all ${
                    selectedPlan === plan.id ? 'ring-2 ring-emerald-500' : ''
                  } ${activeMembership.isActive && activeMembership.plan === plan.id ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  {activeMembership.isActive && activeMembership.plan === plan.id && (
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs mb-2 inline-block">
                      Current Plan
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.duration}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Just ₹{plan.pricePerMonth} per month
                  </p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 group
                      ${activeMembership.isActive && activeMembership.plan === plan.id
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                  >
                    <span>
                      {activeMembership.isActive && activeMembership.plan === plan.id
                        ? 'Current Plan'
                        : 'Subscribe Now'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 