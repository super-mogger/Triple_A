import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Membership } from '../../types/profile';

interface MembershipCardProps {
  isActive: boolean;
  membership: Membership | null;
}

export default function MembershipCard({ isActive, membership }: MembershipCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl cursor-pointer"
      onClick={() => navigate('/membership')}
    >
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
          <Crown className="w-6 h-6 text-yellow-500" />
          Membership Status
        </h2>
        {isActive ? (
          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium">
            Active
          </span>
        ) : (
          <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-sm font-medium">
            Inactive
          </span>
        )}
      </div>
      <div className="p-8">
        {isActive && membership ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {membership.plan_name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Valid until {membership.end_date.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No active membership. Click to view available plans.
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/membership');
              }}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 