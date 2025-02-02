import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadImageToImgBB, validateImage } from '../services/ImgBBService';
import { detectFace, loadFaceDetectionModels } from '../services/FaceDetectionService';
import { useProfile } from '../context/ProfileContext';
import { Profile } from '../types/profile';
import { Timestamp } from 'firebase/firestore';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSetupModal({ isOpen, onClose }: ProfileSetupModalProps) {
  const { profile, updateProfile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Load face detection models when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFaceDetectionModels().catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImage(file)) return;

    try {
      setIsProcessingImage(true);
      
      // First, detect face in the image
      const hasFace = await detectFace(file);
      if (!hasFace) return;

      // If face detection passes, upload to ImgBB
      const loadingToast = toast.loading('Uploading image...');
      const imageUrl = await uploadImageToImgBB(file);
      toast.dismiss(loadingToast);
      
      if (imageUrl) {
        setPhotoURL(imageUrl);
        toast.success('Profile picture uploaded!');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!photoURL) {
      toast.error('Please upload a profile picture');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error('Profile not found');
        return;
      }

      await updateProfile({
        ...profile,
        username: fullName,
        photoURL: photoURL,
        personal_info: {
          ...profile.personal_info,
          gender: profile.personal_info?.gender || 'male',
          date_of_birth: profile.personal_info?.date_of_birth || '',
          height: profile.personal_info?.height || 0,
          weight: profile.personal_info?.weight || 0,
          contact: profile.personal_info?.contact || '',
          blood_type: profile.personal_info?.blood_type || ''
        },
        medical_info: {
          ...profile.medical_info,
          conditions: profile.medical_info?.conditions || ''
        },
        preferences: {
          ...profile.preferences,
          dietary: profile.preferences?.dietary || [],
          workout_days: profile.preferences?.workout_days || [],
          fitness_goals: profile.preferences?.fitness_goals || [],
          fitness_level: profile.preferences?.fitness_level || '',
          activity_level: profile.preferences?.activity_level || 'moderate'
        },
        updated_at: Timestamp.now()
      });

      toast.success('Profile setup completed!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set up your profile picture and full name
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Important Notice
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Your full name and profile picture can only be changed by an administrator once set.
                Please ensure the information is correct and upload a clear photo of your face.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
              />
              <label 
                htmlFor="profile-photo" 
                className={`absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer transition-colors ${
                  isProcessingImage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isProcessingImage ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
                <input
                  type="file"
                  id="profile-photo"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isProcessingImage}
                />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the camera icon to upload your profile picture
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be a clear photo of your face
              </p>
            </div>
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="Enter your full name"
              maxLength={50}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isProcessingImage}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
} 