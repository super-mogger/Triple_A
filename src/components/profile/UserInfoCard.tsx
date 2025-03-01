import { Edit, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/profile';
import { format } from 'date-fns';

interface UserInfoCardProps {
  profile: Profile;
  isActive: boolean;
}

export default function UserInfoCard({ profile, isActive }: UserInfoCardProps) {
  const navigate = useNavigate();
  
  // Format join date from timestamp
  const joinDate = profile.created_at ? 
    format(profile.created_at.toDate(), 'MMM dd, yyyy') : 
    'N/A';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0 relative">
              {profile.photoURL ? (
                <img
                  className="h-20 w-20 rounded-full object-cover border-2 border-white dark:border-gray-700"
                  src={profile.photoURL}
                  alt={profile.username}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Verification Badge */}
              {profile.isVerified && (
                <div 
                  className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-700"
                  title="Verified Member"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <p className="text-xl font-bold text-gray-900 dark:text-white sm:flex sm:items-center">
                {profile.username}
                {profile.isVerified && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Verified
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Joined {joinDate}</span>
                </div>
                
                {isActive ? (
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Active Member</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Membership Inactive</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0">
            <button
              onClick={() => navigate('/profile/edit')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 