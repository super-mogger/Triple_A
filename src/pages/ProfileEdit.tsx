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
  const { profile, updateProfile } = useProfile();
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

  useEffect(() => {
    if (profile && !profile.photoURL) {
      setIsFirstTimeUser(true);
      setIsCameraOpen(true); // Automatically open camera for first-time users
    }
  }, [profile]);

  useEffect(() => {
    loadFaceDetectionModels().catch(console.error);
  }, []);

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
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (file: File) => {
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

        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <User2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basic details about yourself</p>
              </div>
            </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={formData.photoURL || profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
                    />
                    {(isFirstTimeUser || isAdmin) && (
                      <div className="absolute bottom-0 right-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsCameraOpen(true);
                          }}
                          disabled={isProcessingImage}
                          className={`p-1.5 rounded-full transition-colors ${
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
                        </button>
                      </div>
                    )}
                    {!isFirstTimeUser && !isAdmin && (
                      <div className="absolute bottom-0 right-0">
                        <div className="p-1.5 rounded-full bg-gray-400">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile Picture</h3>
                    {isFirstTimeUser ? (
                      <>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">Please take a photo to complete your profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Must be a clear photo of your face</p>
                      </>
                    ) : isAdmin ? (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin can update user's photo</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Must be a clear photo of the face</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Photo can only be changed by admin</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contact admin for photo updates</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Full Name {!hasEditedName && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        if (!hasEditedName || isAdmin) {
                          handleChange('username', '', e.target.value);
                        }
                      }}
                      className={`w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${
                        (!hasEditedName || isAdmin) ? '' : 'opacity-50 cursor-not-allowed'
                      }`}
                      placeholder="Enter your full name"
                      disabled={hasEditedName && !isAdmin}
                      required={!hasEditedName}
                    />
                    {hasEditedName && !isAdmin && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500">
                        <Lock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Admin only</span>
                      </div>
                    )}
                  </div>
                  {!hasEditedName ? (
                    <p className="text-xs text-red-500">
                      Please enter your full name. Once set, it can only be changed by an admin.
                    </p>
                  ) : !isAdmin ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Full name can only be changed by an admin after initial setup.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-500">
                      As an admin, you can modify the user's full name.
                    </p>
                  )}
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-[#282828] rounded-xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-medium">
                  {calculateAge(formData.personal_info.date_of_birth) || 'Will be calculated from DOB'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically calculated from your date of birth</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personal_info.date_of_birth}
                  onChange={(e) => handleChange('personal_info', 'date_of_birth', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: 1990-01-15</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                <select
                  value={formData.personal_info.gender}
                  onChange={(e) => handleChange('personal_info', 'gender', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</label>
                <select
                  value={formData.personal_info.blood_type}
                  onChange={(e) => handleChange('personal_info', 'blood_type', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your blood type</option>
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Important for medical purposes</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formData.personal_info.contact.replace('+91', '').trim()}
                      disabled={!isAdmin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange('personal_info', 'contact', value ? `+91 ${value}` : '');
                      }}
                      maxLength={10}
                    />
                    {!isAdmin && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500">
                        <Lock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Admin only</span>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="w-5 h-5 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Medical Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Help us understand your health better</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Do you have any medical conditions?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('preferences', 'fitness_level', '')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      !formData.preferences.fitness_level
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('preferences', 'fitness_level', ' ')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      formData.preferences.fitness_level
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
              {formData.preferences.fitness_level && (
                <div className="space-y-2">
                  <textarea
                    value={formData.preferences.fitness_level}
                    onChange={(e) => handleChange('preferences', 'fitness_level', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors h-24"
                    placeholder="Example: Asthma, Diabetes, High Blood Pressure, or any allergies..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">This information helps us customize your workout plan safely</p>
                </div>
              )}
            </div>
          </div>

            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-5 h-5 text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Physical Stats</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your current body measurements</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    value={formData.personal_info.weight}
                    onChange={(e) => handleChange('personal_info', 'weight', e.target.value)}
                    min="0"
                    max="300"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">Height</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHeightUnit('cm')}
                        className={`text-xs px-2 py-1 rounded ${
                          heightUnit === 'cm' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('ft')}
                        className={`text-xs px-2 py-1 rounded ${
                          heightUnit === 'ft' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        ft/in
                      </button>
                    </div>
                  </div>
                  {heightUnit === 'cm' ? (
                    <input
                      type="number"
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      value={formData.personal_info.height}
                      onChange={(e) => handleChange('personal_info', 'height', e.target.value)}
                      min="0"
                      max="300"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          value={Math.floor(formData.personal_info.height / 30.48)}
                          onChange={(e) => {
                            const feet = Number(e.target.value);
                            const inches = formData.personal_info.height % 30.48 / 2.54;
                            const totalCm = (feet * 30.48) + (inches * 2.54);
                            handleChange('personal_info', 'height', Math.round(totalCm));
                          }}
                          min="0"
                          max="9"
                          placeholder="ft"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#282828] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          value={Math.round((formData.personal_info.height % 30.48) / 2.54)}
                          onChange={(e) => {
                            const inches = Number(e.target.value);
                            const feet = Math.floor(formData.personal_info.height / 30.48);
                            const totalCm = (feet * 30.48) + (inches * 2.54);
                            handleChange('personal_info', 'height', Math.round(totalCm));
                          }}
                          min="0"
                          max="11"
                          placeholder="in"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your fitness journey</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Fitness Level</label>
                <select
                  value={formData.preferences.fitness_level}
                  onChange={(e) => handleChange('preferences', 'fitness_level', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Choose your current fitness level</option>
                  <option value="beginner">Beginner (New to fitness)</option>
                  <option value="intermediate">Intermediate (Regular exercise)</option>
                  <option value="advanced">Advanced (Experienced fitness enthusiast)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">This helps us tailor workouts to your experience level</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Activity Level</label>
                <select
                  value={formData.preferences.activity_level}
                  onChange={(e) => handleChange('preferences', 'activity_level', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#282828] rounded-xl px-4 py-3 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select your daily activity level</option>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="active">Very Active (Exercise 6-7 days/week)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">Helps calculate your daily calorie needs</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Dietary Preferences</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select all that apply to your diet</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDietaryChange(option)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.preferences.dietary_preferences.includes(option)
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">These will be used to customize your meal plans</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Check className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </div>
    </div>

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => !isFirstTimeUser && setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
} 