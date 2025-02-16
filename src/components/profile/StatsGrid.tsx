import { Scale, Activity } from 'lucide-react';
import { Profile } from '../../types/profile';

interface StatsGridProps {
  profile: Profile;
  bmi: string | null;
  bmiInfo: {
    category: string;
    position: string;
  } | null;
}

export default function StatsGrid({ profile, bmi, bmiInfo }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* BMI Card */}
      {bmi && bmiInfo && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{bmi}</span>
              <span className="text-lg font-medium text-emerald-500">{bmiInfo.category}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: bmiInfo.position }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Activity Level Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Level</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {profile.preferences?.activity_level || 'Beginner'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current fitness level</p>
        </div>
      </div>
    </div>
  );
} 