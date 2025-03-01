import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Profile, ActivityLevel } from '../types/profile';
import { ArrowLeft, Check, Calendar, User2, Activity, Heart, Scale, Stethoscope, Camera, Loader2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadImageToImgBB, validateImage } from '../services/ImgBBService';
import { detectFace, loadFaceDetectionModels } from '../services/FaceDetectionService';
import CameraCapture from '../components/CameraCapture';
import ContactInfoCard from '../components/profile/ContactInfoCard';

interface FormData {
  username: string;
  photoURL?: string;
  personal_info: {
    gender: 'male' | 'female' | 'other';
    date_of_birth: string;
    height: number;
    weight: number;
    contact: string;
    blood_type: string;
  };
  medical_info: {
    conditions: string;
  };
  preferences: {
    activity_level: ActivityLevel;
    dietary_preferences: string[];
    workout_preferences: string[];
    fitness_goals: string[];
    fitness_level?: string;
    dietary?: string[];
    workout_time?: string;
    workout_days?: string[];
  };
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, refetchProfile } = useProfile();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const isAdmin = user?.email === 'admin@example.com'; // Replace with your admin email check
  const [hasEditedName, setHasEditedName] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: profile?.username || '',
    photoURL: profile?.photoURL,
    personal_info: {
      gender: profile?.personal_info?.gender || 'male',
      date_of_birth: profile?.personal_info?.date_of_birth || '',
      height: profile?.personal_info?.height || 0,
      weight: profile?.personal_info?.weight || 0,
      contact: profile?.personal_info?.contact || '',
      blood_type: profile?.personal_info?.blood_type || ''
    },
    medical_info: {
      conditions: profile?.medical_info?.conditions || ''
    },
    preferences: {
      activity_level: (profile?.preferences?.activity_level || 'beginner') as ActivityLevel,
      dietary_preferences: profile?.preferences?.dietary_preferences || [],
      workout_preferences: profile?.preferences?.workout_preferences || [],
      fitness_goals: profile?.preferences?.fitness_goals || [],
      fitness_level: profile?.preferences?.fitness_level || '',
      dietary: profile?.preferences?.dietary || [],
      workout_time: profile?.preferences?.workout_time || '',
      workout_days: profile?.preferences?.workout_days || []
    }
  });
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightFeet, setHeightFeet] = useState(0);
  const [heightInches, setHeightInches] = useState(0);

  // Ensure we have the latest profile data
  useEffect(() => {
    if (user?.uid) {
      refetchProfile();
    }
  }, [user, refetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        photoURL: profile.photoURL,
        personal_info: {
          gender: profile.personal_info?.gender || 'male',
          date_of_birth: profile.personal_info?.date_of_birth || '',
          height: profile.personal_info?.height || 0,
          weight: profile.personal_info?.weight || 0,
          contact: profile.personal_info?.contact || '',
          blood_type: profile.personal_info?.blood_type || ''
        },
        medical_info: {
          conditions: profile.medical_info?.conditions || ''
        },
        preferences: {
          activity_level: (profile.preferences?.activity_level || 'beginner') as ActivityLevel,
          dietary_preferences: profile.preferences?.dietary_preferences || [],
          workout_preferences: profile.preferences?.workout_preferences || [],
          fitness_goals: profile.preferences?.fitness_goals || [],
          fitness_level: profile.preferences?.fitness_level || '',
          dietary: profile.preferences?.dietary || [],
          workout_time: profile.preferences?.workout_time || '',
          workout_days: profile.preferences?.workout_days || []
        }
      });
      setHasEditedName(!!profile.username);
    }
  }, [profile]);

  // We no longer automatically open camera for first-time users since photo updates are admin-only
  useEffect(() => {
    if (profile && !profile.photoURL) {
      setIsFirstTimeUser(true);
    }
  }, [profile]);

  useEffect(() => {
    loadFaceDetectionModels().catch(console.error);
  }, []);

  useEffect(() => {
    if (heightUnit === 'ft' && formData.personal_info.height) {
      const { feet, inches } = cmToFeetInches(formData.personal_info.height);
      setHeightFeet(feet);
      setHeightInches(inches);
    }
  }, [heightUnit, formData.personal_info.height]);

  const calculateAge = (dob: string): string => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-Free',
    'Lactose-Free',
    'Keto',
    'Low-Carb',
    'High-Protein'
  ];

  const handleDietaryChange = (preference: string) => {
    const currentDietary = formData.preferences.dietary_preferences;
    const updatedDietary = currentDietary.includes(preference)
      ? currentDietary.filter((p: string) => p !== preference)
      : [...currentDietary, preference];

    setFormData(prevData => ({
      ...prevData,
      preferences: {
        ...prevData.preferences,
        dietary_preferences: updatedDietary
      }
    }));
  };

  const handleChange = (section: string, field: string, value: any) => {
    setFormData(prevData => {
      if (section === 'username') {
        return {
          ...prevData,
          username: value
        };
      }
      
      const sectionData = prevData[section as keyof FormData];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prevData,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return prevData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Profile not found');
      return;
    }

    if (!formData.username.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      const updatedProfile: Partial<Profile> = {
        username: formData.username,
        personal_info: {
          ...formData.personal_info,
          height: Number(formData.personal_info.height),
          weight: Number(formData.personal_info.weight)
        },
        medical_info: {
          ...formData.medical_info
        },
        preferences: formData.preferences
      };

      await updateProfile(updatedProfile);
      setHasEditedName(true);
      
      // Ensure the latest data is displayed
      await refetchProfile();
      
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (file: File) => {
    // This is only for admins now
    if (!isAdmin) {
      toast.error('Profile picture updates are restricted to administrators');
      return;
    }
    
    try {
      setIsProcessingImage(true);
      
      const hasFace = await detectFace(file);
      if (!hasFace) {
        toast.error('No face detected in the image');
        return;
      }

      const loadingToast = toast.loading('Uploading image...');
      const imageUrl = await uploadImageToImgBB(file);
      toast.dismiss(loadingToast);
      
      if (imageUrl && profile) {
        const updatedProfile = {
          ...profile,
          photoURL: imageUrl
        };

        await updateProfile(updatedProfile);
        setFormData(prevData => ({
          ...prevData,
          photoURL: imageUrl
        }));

        // Ensure the latest data is displayed
        await refetchProfile();
        
        toast.success('Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCameraCapture = async (file: File) => {
    // This is only for admins now
    if (!isAdmin) {
      toast.error('Profile picture updates are restricted to administrators');
      setIsCameraOpen(false);
      return;
    }
    
    try {
      setIsProcessingImage(true);
      
      const hasFace = await detectFace(file);
      if (!hasFace) {
        toast.error('No face detected. Please take a clear photo of your face.');
        return;
      }

      const loadingToast = toast.loading('Uploading image...');
      const imageUrl = await uploadImageToImgBB(file);
      toast.dismiss(loadingToast);
      
      if (imageUrl && profile) {
        const updatedProfile = {
          ...profile,
          photoURL: imageUrl
        };

        await updateProfile(updatedProfile);
        setFormData(prevData => ({
          ...prevData,
          photoURL: imageUrl
        }));

        setIsFirstTimeUser(false);
        
        // Ensure the latest data is displayed
        await refetchProfile();

        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    try {
      await updateProfile(updatedProfile);
      
      // Ensure the latest data is displayed
      await refetchProfile();
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const cmToFeetInches = (cm: number) => {
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    // Handle case where inches rounds up to 12
    if (remainingInches === 12) {
      return { feet: feet + 1, inches: 0 };
    }
    return { feet, inches: remainingInches };
  };

  const feetInchesToCm = (feet: number, inches: number) => {
    const totalInches = (feet * 12) + inches;
    return Math.round(totalInches * 2.54);
  };

  const handleHeightUnitChange = (newUnit: 'cm' | 'ft') => {
    setHeightUnit(newUnit);
    if (newUnit === 'ft' && formData.personal_info.height) {
      const { feet, inches } = cmToFeetInches(formData.personal_info.height);
      setHeightFeet(feet);
      setHeightInches(inches);
    } else if (newUnit === 'cm' && heightFeet) {
      const cm = feetInchesToCm(heightFeet, heightInches);
      handleChange('personal_info', 'height', cm);
    }
  };

  const handleFeetChange = (feet: number) => {
    if (feet >= 0 && feet <= 8) {
      setHeightFeet(feet);
      const cm = feetInchesToCm(feet, heightInches);
      handleChange('personal_info', 'height', cm);
    }
  };

  const handleInchesChange = (inches: number) => {
    if (inches >= 0 && inches <= 11) {
      setHeightInches(inches);
      const cm = feetInchesToCm(heightFeet, inches);
      handleChange('personal_info', 'height', cm);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Back Button with Title */}
        <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
            <Camera className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
            </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500"
                key={profile.photoURL || 'default'} // Force re-render when URL changes
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;
                }}
              />
              {isAdmin && (
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-colors"
                  disabled={isProcessingImage}
                >
                  {isProcessingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Admin only</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contact an administrator to update your profile picture
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <ContactInfoCard 
          profile={profile} 
          onUpdate={handleProfileUpdate}
        />

        {/* Basic Information */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>

          <div className="space-y-4">
            {/* Full Name */}
                <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
                  </label>
                    <input
                      type="text"
                      value={formData.username}
                onChange={(e) => handleChange('username', '', e.target.value)}
                disabled={hasEditedName && !isAdmin}
                className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                    {hasEditedName && !isAdmin && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Only administrators can change your name once set
                    </p>
                  )}
              </div>

            {/* Gender Selection */}
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <div className="flex gap-4">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.personal_info.gender === gender}
                      onChange={(e) => handleChange('personal_info', 'gender', e.target.value)}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
                <input
                  type="date"
                  value={formData.personal_info.date_of_birth}
                  onChange={(e) => handleChange('personal_info', 'date_of_birth', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {formData.personal_info.date_of_birth && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Age: {calculateAge(formData.personal_info.date_of_birth)} years
                </p>
              )}
            </div>
            </div>
          </div>

        {/* Physical Information */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
            <Scale className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Physical Information</h3>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Height */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height
              </label>
              <div className="flex gap-2">
                  {heightUnit === 'cm' ? (
                  <>
                    <input
                      type="number"
                      value={formData.personal_info.height || ''}
                      onChange={(e) => handleChange('personal_info', 'height', Number(e.target.value))}
                      className="flex-1 bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      placeholder="Enter height"
                      min="0"
                      max="300"
                    />
                    <select
                      value={heightUnit}
                      onChange={(e) => handleHeightUnitChange(e.target.value as 'cm' | 'ft')}
                      className="bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="number"
                        value={heightFeet || ''}
                        onChange={(e) => handleFeetChange(Number(e.target.value))}
                        className="flex-1 bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Feet"
                          min="0"
                        max="8"
                        />
                      <span className="text-gray-500 dark:text-gray-400">ft</span>
                      </div>
                    <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="number"
                        value={heightInches || ''}
                        onChange={(e) => handleInchesChange(Number(e.target.value))}
                        className="flex-1 bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Inches"
                          min="0"
                          max="11"
                        />
                      <span className="text-gray-500 dark:text-gray-400">in</span>
                      </div>
                    <select
                      value={heightUnit}
                      onChange={(e) => handleHeightUnitChange(e.target.value as 'cm' | 'ft')}
                      className="bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                    </div>
                  )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {heightUnit === 'cm' 
                  ? 'Enter height in centimeters' 
                  : 'Enter height in feet and inches'}
              </p>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.personal_info.weight}
                onChange={(e) => handleChange('personal_info', 'weight', e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Enter weight"
              />
            </div>

            {/* Blood Type */}
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blood Type
              </label>
                <select
                value={formData.personal_info.blood_type}
                onChange={(e) => handleChange('personal_info', 'blood_type', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                <option value="">Select blood type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                </select>
            </div>
          </div>
        </div>

        {/* Fitness Preferences */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fitness Preferences</h3>
              </div>

          <div className="space-y-6">
            {/* Activity Level */}
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Activity Level
              </label>
                <select
                  value={formData.preferences.activity_level}
                  onChange={(e) => handleChange('preferences', 'activity_level', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                </select>
              </div>

            {/* Dietary Preferences */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dietary Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleDietaryChange(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.preferences.dietary_preferences.includes(option)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medical Conditions
              </label>
              <textarea
                value={formData.medical_info.conditions}
                onChange={(e) => handleChange('medical_info', 'conditions', e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="List any medical conditions or allergies"
                rows={4}
              />
              </div>
            </div>
          </div>

        {/* Submit Button */}
          <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Save Changes
          </button>
    </div>

      {/* Camera Modal - Only shown to admins */}
      {isCameraOpen && isAdmin && (
        <CameraCapture
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
} 