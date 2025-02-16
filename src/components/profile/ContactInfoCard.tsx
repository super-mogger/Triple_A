import { Phone, Lock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Profile } from '../../types/profile';
import { toast } from 'react-hot-toast';

interface ContactInfoCardProps {
  profile: Profile;
  onUpdate: (updatedProfile: Profile) => Promise<boolean>;
}

export default function ContactInfoCard({ profile, onUpdate }: ContactInfoCardProps) {
  const [mobileNumber, setMobileNumber] = useState(profile?.personal_info?.contact || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsMobileNumber = !profile?.personal_info?.contact;

  // Mobile number validation
  const validateMobileNumber = (number: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  // Format mobile number as user types
  const formatMobileNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    return numbers.slice(0, 10);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value);
    setMobileNumber(formatted);
  };

  const handleSubmit = async () => {
    if (!needsMobileNumber) return;

    if (!validateMobileNumber(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedProfile: Profile = {
        ...profile,
        personal_info: {
          ...profile.personal_info,
          contact: mobileNumber
        }
      };

      const success = await onUpdate(updatedProfile);
      if (success) {
        toast.success('Mobile number updated successfully!');
      }
    } catch (error) {
      console.error('Error updating mobile number:', error);
      toast.error('Failed to update mobile number');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Phone className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
      </div>

      {needsMobileNumber ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Mobile Number Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  Please set your mobile number. Once set, it can only be changed by an administrator.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter a valid 10-digit mobile number starting with 6-9
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validateMobileNumber(mobileNumber)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Mobile Number'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Mobile Number
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {profile.personal_info?.contact}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Admin only</span>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your mobile number can only be changed by an administrator. Please contact support if you need to update it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 