import React from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MembershipAlertProps {
  onClose: () => void;
}

export default function MembershipAlert({ onClose }: MembershipAlertProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-x-0 bottom-20 mx-auto px-4 z-50 max-w-md">
      <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-6 border border-yellow-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Activate Your Membership
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Get access to all gym facilities and exclusive features by activating your membership today.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/membership')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                View Plans
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 