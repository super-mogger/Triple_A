import { Edit, Crown, Phone, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/profile';

interface UserInfoCardProps {
  profile: Profile;
  isActive: boolean;
  onPhotoUpdate?: () => void;
}

export default function UserInfoCard({ profile, isActive, onPhotoUpdate }: UserInfoCardProps) {
  const navigate = useNavigate();

  // Check if profile image is from Google or missing
  const isGoogleImage = profile?.photoURL?.includes('googleusercontent.com');
  const needsProfilePicture = !profile?.photoURL || isGoogleImage;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative group">
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
              />
              {isActive && (
                <div className="absolute -top-1 -right-1">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
              )}
              {needsProfilePicture && onPhotoUpdate && (
                <button
                  onClick={onPhotoUpdate}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              {needsProfilePicture && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-0.5 rounded-full">
                    Update photo
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {profile.created_at?.toDate().toLocaleDateString()}
              </p>
              {profile.personal_info?.contact && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile.personal_info.contact}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
            <button
              onClick={() => navigate('/profile/edit')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 