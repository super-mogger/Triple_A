import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, ChevronRight } from 'lucide-react';

interface MembershipRequiredProps {
  feature: 'workout' | 'diet' | 'attendance';
}

const featureDetails = {
  workout: {
    title: 'Premium Workouts',
    description: 'Access personalized workout plans, track your progress, and achieve your fitness goals with expert guidance.',
    benefits: [
      'Customized workout plans',
      'Progress tracking',
      'Video demonstrations',
      'Expert form guidance',
      'Workout history'
    ]
  },
  diet: {
    title: 'Personalized Diet Plans',
    description: 'Get customized nutrition plans, meal tracking, and dietary recommendations tailored to your goals.',
    benefits: [
      'Customized meal plans',
      'Nutrition tracking',
      'Dietary recommendations',
      'Meal history',
      'Calorie tracking'
    ]
  },
  attendance: {
    title: 'Attendance Tracking',
    description: 'Track your gym visits, maintain streaks, and stay motivated with our attendance system.',
    benefits: [
      'QR code check-in',
      'Attendance history',
      'Streak tracking',
      'Performance insights',
      'Monthly reports'
    ]
  }
};

export default function MembershipRequired({ feature }: MembershipRequiredProps) {
  const navigate = useNavigate();
  const details = featureDetails[feature];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white">
          <div className="absolute top-0 right-0 p-4">
            <Crown className="w-12 h-12 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{details.title}</h2>
          <p className="text-emerald-100">{details.description}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Premium Features Include:
            </h3>
            <ul className="space-y-3">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                  <Lock className="w-4 h-4 mr-3 text-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/membership')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center group"
            >
              View Membership Plans
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Unlock all features with our flexible membership plans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 