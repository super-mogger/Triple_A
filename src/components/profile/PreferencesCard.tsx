import { Heart } from 'lucide-react';
import { Profile } from '../../types/profile';

interface PreferencesCardProps {
  profile: Profile;
}

export default function PreferencesCard({ profile }: PreferencesCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 transform transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h3>
      </div>
      <div className="space-y-6">
        {/* Fitness Goals */}
        {profile.preferences?.fitness_goals && profile.preferences.fitness_goals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fitness Goals</h4>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.fitness_goals.map((goal, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Preferences */}
        {profile.preferences?.dietary_preferences && profile.preferences.dietary_preferences.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dietary Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.dietary_preferences.map((pref, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Workout Preferences */}
        {profile.preferences?.workout_preferences && profile.preferences.workout_preferences.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Workout Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.workout_preferences.map((pref, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 