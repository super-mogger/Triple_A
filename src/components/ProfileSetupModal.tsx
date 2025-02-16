import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Loader2, X, RefreshCw, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadImageToImgBB } from '../services/ImgBBService';
import { detectFace, loadFaceDetectionModels } from '../services/FaceDetectionService';
import { useProfile } from '../context/ProfileContext';
import { Profile } from '../types/profile';
import { Timestamp } from 'firebase/firestore';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPhotoOnly?: boolean;
}

export default function ProfileSetupModal({ isOpen, onClose, isPhotoOnly = false }: ProfileSetupModalProps) {
  const { profile, updateProfile } = useProfile();
  const [fullName, setFullName] = useState(profile?.username || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [mobileNumber, setMobileNumber] = useState(profile?.personal_info?.contact || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if profile image is from Google
  const isGoogleImage = profile?.photoURL?.includes('googleusercontent.com');
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

  useEffect(() => {
    if (isOpen) {
      loadFaceDetectionModels().catch(console.error);
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast.error('Unable to access camera. Please check your camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsProcessingImage(true);
      
      // Set canvas dimensions to match video
      const { videoWidth, videoHeight } = videoRef.current;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob(
          (blob) => resolve(blob as Blob),
          'image/jpeg',
          0.9
        );
      });
      
      // Convert blob to file
      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
      
      // Detect face in the captured image
      const hasFace = await detectFace(file);
      if (!hasFace) {
        toast.error('No face detected. Please ensure your face is clearly visible.');
        return;
      }

      // Upload to ImgBB
      const loadingToast = toast.loading('Processing image...');
      const imageUrl = await uploadImageToImgBB(file);
      toast.dismiss(loadingToast);
      
      if (imageUrl) {
        setPhotoURL(imageUrl);
        toast.success('Photo captured successfully!');
        stopCamera();
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to process photo. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPhotoOnly && !fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!photoURL) {
      toast.error('Please take a profile picture');
      return;
    }

    if (needsMobileNumber && !validateMobileNumber(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error('Profile not found');
        return;
      }

      const updatedProfile: Profile = {
        ...profile,
        photoURL: photoURL,
      };

      if (!isPhotoOnly) {
        updatedProfile.username = fullName;
        updatedProfile.personal_info = {
          ...profile.personal_info,
          gender: profile.personal_info?.gender || 'male',
          date_of_birth: profile.personal_info?.date_of_birth || '',
          height: profile.personal_info?.height || 0,
          weight: profile.personal_info?.weight || 0,
          contact: needsMobileNumber ? mobileNumber : profile.personal_info?.contact || '',
          blood_type: profile.personal_info?.blood_type || ''
        };
        updatedProfile.medical_info = {
          ...profile.medical_info,
          conditions: profile.medical_info?.conditions || ''
        };
        updatedProfile.preferences = {
          ...profile.preferences,
          dietary: profile.preferences?.dietary || [],
          workout_days: profile.preferences?.workout_days || [],
          fitness_goals: profile.preferences?.fitness_goals || [],
          fitness_level: profile.preferences?.fitness_level || '',
          activity_level: profile.preferences?.activity_level || 'moderate'
        };
      }

      updatedProfile.updated_at = Timestamp.now();

      await updateProfile(updatedProfile);

      toast.success(isPhotoOnly ? 'Profile picture updated!' : 'Profile setup completed!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPhotoOnly ? 'Update Profile Picture' : 'Complete Your Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isPhotoOnly && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  Your full name, mobile number, and profile picture can only be changed by an administrator once set.
                  Please ensure the information is correct.
                </p>
              </div>
            </div>
          </div>
        )}

        {isGoogleImage && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You're currently using your Google profile picture. Take a new photo to personalize your profile.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camera Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
              {!photoURL ? (
                <>
                  <video
                    ref={videoRef}
                    className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {hasPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Camera access denied. Please check your browser permissions.
                      </p>
                    </div>
                  )}
                  
                  {isCameraActive && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCapture}
                        disabled={isProcessingImage}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white p-3 rounded-full transition-colors"
                      >
                        {isProcessingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={photoURL}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoURL('');
                      initializeCamera();
                    }}
                    className="absolute bottom-4 right-4 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Position your face in the center and ensure good lighting
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click the camera button to take your photo
              </p>
            </div>
          </div>

          {/* Full Name Input - Only show if not photo-only mode */}
          {!isPhotoOnly && (
            <div className="space-y-6">
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

              {/* Mobile Number Input - Only show if not set */}
              {needsMobileNumber && (
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
                    Enter a valid 10-digit mobile number. This can only be changed by an administrator later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isProcessingImage || !photoURL || (needsMobileNumber && !validateMobileNumber(mobileNumber))}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Saving...' : (isPhotoOnly ? 'Update Picture' : 'Complete Setup')}
          </button>
        </form>
      </div>
    </div>
  );
} 