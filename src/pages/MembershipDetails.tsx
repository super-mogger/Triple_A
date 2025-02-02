import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus, createMembership } from '../services/FirestoreService';
import type { Membership } from '../services/FirestoreService';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { Timestamp } from 'firebase/firestore';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isDarkMode } = useTheme();
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    membership: Membership | null;
    error: string | null;
  }>({ isActive: false, membership: null, error: null });
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const fetchMembershipStatus = async () => {
    if (!user?.uid) return;
    const status = await checkMembershipStatus(user.uid);
    setMembershipStatus(status);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembershipStatus();
  }, [user]);

  const handleCreateMembership = async (planData: any) => {
    if (!user?.uid) return;
    
    try {
      const result = await createMembership(user.uid, planData);
      if (result.error) {
        throw new Error(result.error.toString());
      }
      await fetchMembershipStatus();
    } catch (error) {
      console.error('Error creating membership:', error);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
  };

  const getDaysRemaining = (endDate: Timestamp | undefined | null) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = endDate.toDate();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

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
              membershipStatus.isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
              {membershipStatus.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {membershipStatus.membership?.plan_name || 'No Active Plan'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {membershipStatus.membership?.end_date ? `Valid until ${formatDate(membershipStatus.membership.end_date)}` : 'Not subscribed'}
            </p>
          </div>

          {membershipStatus.isActive && (
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {getDaysRemaining(membershipStatus.membership?.end_date)} days
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400"> remaining</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(getDaysRemaining(membershipStatus.membership?.end_date) / 30) * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Online Payments Coming Soon!</h2>
            </div>
            <p className="text-white/90">
              We're working on bringing you a seamless online payment experience. Please visit our gym office for membership details and registration.
            </p>
          </div>
        </div>

        {/* Available Plans */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border ${
                  membershipStatus.membership?.plan_id === plan.id
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
                  disabled={true}
                  className="w-full py-2.5 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  Visit Gym Office to Register
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Please visit our gym office for membership registration and more details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 