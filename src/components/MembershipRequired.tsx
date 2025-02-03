import React from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMembership } from '../context/MembershipContext';

interface MembershipRequiredProps {
  feature: string;
}

export default function MembershipRequired({ feature }: MembershipRequiredProps) {
  const navigate = useNavigate();
  const { isActive, loading } = useMembership();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (isActive) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-full">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Feature
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Access to {feature} is available exclusively to our premium members. 
            Upgrade your membership to unlock this feature and many more benefits.
          </p>
          
          <button
            onClick={() => navigate('/membership')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
} 