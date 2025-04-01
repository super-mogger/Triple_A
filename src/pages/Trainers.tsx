import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Award, Dumbbell, Clock, Heart, Star, User2, Clock8 } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  specializations: string[];
  experience: number;
  bio?: string;
  photoURL?: string;
  shifts?: string[];
  isAvailable: boolean;
  age?: number;
  location?: string;
  rating?: number;
  reviewCount?: number;
}

const Trainers: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [preferredShift, setPreferredShift] = useState<'morning' | 'evening' | 'any'>('any');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [assignedTrainerId, setAssignedTrainerId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainers();
    checkExistingRequest();
    checkAssignedTrainer();
  }, []);

  useEffect(() => {
    if (trainers.length > 0) {
      filterTrainers();
    }
  }, [trainers, searchTerm, specialtyFilter]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      // Get all trainers from admins collection with role = trainer
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('role', '==', 'trainer'));
      const querySnapshot = await getDocs(q);
      
      const trainerIds = querySnapshot.docs.map(doc => doc.id);
      console.log('Found trainer IDs:', trainerIds);
      
      // Fetch detailed info from trainers collection
      const trainerPromises = trainerIds.map(async (id) => {
        const adminDoc = querySnapshot.docs.find(doc => doc.id === id);
        const adminData = adminDoc?.data();
        
        // Get additional data from trainers collection
        const trainerRef = doc(db, 'trainers', id);
        const trainerSnap = await getDoc(trainerRef);
        const trainerData = trainerSnap.exists() ? trainerSnap.data() : {};
        
        // Get profile photo from profiles collection
        const profileRef = doc(db, 'profiles', id);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        
        // Log photo URLs for debugging
        console.log(`Trainer ${id} photo sources:`, {
          profilePhotoURL: profileData?.photoURL || '(none)',
          trainerPhotoURL: trainerData?.photoURL || '(none)',
          email: adminData?.email || '(none)'
        });
        
        // Try to get a working photoURL from various sources
        let photoURL = '';
        
        // First try profile collection
        if (profileData?.photoURL) {
          photoURL = profileData.photoURL;
          console.log(`Using profile photo for ${id}:`, photoURL);
        } 
        // Then try trainers collection
        else if (trainerData?.photoURL) {
          photoURL = trainerData.photoURL;
          console.log(`Using trainer photo for ${id}:`, photoURL);
        }
        
        // We're not setting photoURL to UI Avatars anymore since we'll handle this with JSX
        
        return {
          id,
          name: adminData?.name || adminData?.email.split('@')[0] || 'Unknown',
          specializations: trainerData?.specializations || [],
          experience: trainerData?.experience || 0,
          bio: trainerData?.bio || '',
          photoURL, // This might be empty now if no photo was found
          shifts: trainerData?.shifts || ['morning', 'evening'],
          isAvailable: trainerData?.isAvailable !== false,
          age: trainerData?.age,
          location: trainerData?.location,
          rating: trainerData?.rating || (3 + Math.random() * 2), // Mock rating between 3-5
          reviewCount: trainerData?.reviewCount || Math.floor(5 + Math.random() * 50) // Mock review count
        };
      });
      
      const trainerList = await Promise.all(trainerPromises);
      setTrainers(trainerList.filter(t => t.isAvailable));
      setFilteredTrainers(trainerList.filter(t => t.isAvailable));
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRequest = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // First try to check the user profile for the flag
      const profileRef = doc(db, 'profiles', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists() && profileSnap.data().hasPendingTrainerRequest) {
        setPendingRequest(true);
        return;
      }
      
      // If not found in profile, check directly in the trainerRequests collection
      const requestsRef = collection(db, 'trainerRequests');
      const q = query(
        requestsRef, 
        where('userId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setPendingRequest(true);
        
        // Also update the user profile for future quick checks
        try {
          await updateDoc(profileRef, {
            hasPendingTrainerRequest: true,
            lastTrainerRequestId: querySnapshot.docs[0].id,
            lastTrainerRequestDate: querySnapshot.docs[0].data().requestTimestamp
          });
        } catch (err) {
          console.warn("Couldn't update profile with pending request info:", err);
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const checkAssignedTrainer = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const assignmentRef = doc(db, 'trainerAssignments', currentUser.uid);
      const assignmentSnap = await getDoc(assignmentRef);
      
      if (assignmentSnap.exists()) {
        const assignmentData = assignmentSnap.data();
        setAssignedTrainerId(assignmentData.trainerId);
      }
    } catch (error) {
      console.error('Error checking assigned trainer:', error);
    }
  };

  const filterTrainers = () => {
    let filtered = trainers;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(term) || 
        trainer.bio?.toLowerCase().includes(term) ||
        trainer.specializations.some(spec => spec.toLowerCase().includes(term))
      );
    }
    
    if (specialtyFilter) {
      filtered = filtered.filter(trainer => 
        trainer.specializations.some(spec => 
          spec.toLowerCase() === specialtyFilter.toLowerCase()
        )
      );
    }
    
    setFilteredTrainers(filtered);
  };

  const handleRequestTrainer = async () => {
    if (!selectedTrainer) return;

    try {
      setRequestLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser || !currentUser.email) {
        toast.error('You must be signed in to request a trainer');
        return;
      }
      
      // Get user name from profile
      const profileRef = doc(db, 'profiles', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : {};
      const userName = profileData.username || profileData.displayName || currentUser.email.split('@')[0];
      
      // Use a much simpler data structure for trainer requests
      // Each request gets its own document with a simple structure
      const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const requestRef = doc(db, `trainerRequests/${requestId}`);
      
      // Create a simple object with only primitive values - no nested objects
      const simpleRequestData = {
        userId: currentUser.uid,
        userName: userName,
        userEmail: currentUser.email,
        requestDateISO: new Date().toISOString(),
        requestTimestamp: Date.now(),
        status: 'pending',
        preferredShift: preferredShift,
        message: requestMessage || '',
        requestedTrainerId: selectedTrainer.id,
        requestedTrainerName: selectedTrainer.name
      };
      
      // Try to write directly to the trainerRequests collection
      await setDoc(requestRef, simpleRequestData);
      
      // If successful, also try to update the user profile to indicate a pending request
      try {
        const userRef = doc(db, 'profiles', currentUser.uid);
        await updateDoc(userRef, {
          hasPendingTrainerRequest: true,
          lastTrainerRequestId: requestId,
          lastTrainerRequestDate: Date.now()
        });
      } catch (profileError) {
        // Even if updating the profile fails, the request was still created
        console.warn("Couldn't update user profile, but request was created:", profileError);
      }
      
      setPendingRequest(true);
      setShowRequestModal(false);
      toast.success(`Request for trainer ${selectedTrainer.name} submitted successfully`);
      
    } catch (error) {
      console.error('Error requesting trainer:', error);
      
      // Check if it's a permission error
      if (error instanceof Error && 
          error.toString().includes('permission')) {
        toast.error('Permission denied. Your account does not have access to request trainers. Please contact support.');
      } else {
        toast.error('Failed to save request data. Please try again later.');
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const openRequestModal = (trainer: Trainer) => {
    if (pendingRequest) {
      toast.error('You already have a pending trainer request');
      return;
    }

    if (assignedTrainerId) {
      toast.error('You already have an assigned trainer. Visit your profile to request a change.');
      return;
    }

    setSelectedTrainer(trainer);
    setPreferredShift('any');
    setRequestMessage('');
    setShowRequestModal(true);
  };

  // Get all unique specializations for filtering
  const allSpecializations = Array.from(
    new Set(trainers.flatMap(trainer => trainer.specializations))
  ).sort();

  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 fill-[50%]" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/profile')}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-2xl font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Our Trainers
          </h1>
        </div>
        
        {/* Filters */}
        <div className={`mb-8 rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Specialty
              </label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className={`w-full p-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'border border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Specializations</option>
                {allSpecializations.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredTrainers.length} trainers available
            {pendingRequest && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
              }`}>
                You have a pending trainer request
              </span>
            )}
            {assignedTrainerId && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              }`}>
                You already have an assigned trainer
              </span>
            )}
          </div>
        </div>
        
        {/* Trainers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 ${
              isDarkMode ? 'border-gray-700' : 'border-blue-200'
            }`}></div>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <User2 className="mx-auto h-16 w-16 opacity-30" />
            <h2 className="mt-4 text-lg font-medium">No trainers found</h2>
            <p className="mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <div 
                key={trainer.id} 
                className={`rounded-lg overflow-hidden shadow-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } hover:shadow-xl transition-shadow`}
              >
                <div className={`h-32 ${
                  isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                } relative`}>
                  {trainer.id === assignedTrainerId && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    }`}>
                      Your Trainer
                    </div>
                  )}
                  <div className="absolute -bottom-10 left-6">
                    {trainer.photoURL ? (
                      <img 
                        src={trainer.photoURL} 
                        alt={trainer.name}
                        className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-gray-800"
                        onError={(e) => {
                          console.error(`Failed to load image for ${trainer.name}:`, trainer.photoURL);
                          // Replace with fallback on error
                          e.currentTarget.style.display = 'none';
                          // Create and insert fallback div
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = `h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${
                              isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-600'
                            } border-4 border-white dark:border-gray-800`;
                            fallback.textContent = trainer.name.charAt(0).toUpperCase();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold ${
                        isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-600'
                      } border-4 border-white dark:border-gray-800`}>
                        {trainer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-12 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {trainer.name}
                      </h3>
                      
                      <div className="flex items-center mt-1">
                        {trainer.rating && renderRating(trainer.rating)}
                        <span className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({trainer.reviewCount})
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Award className="w-4 h-4 mr-1" />
                      <span>{trainer.experience} {trainer.experience === 1 ? 'year' : 'years'}</span>
                    </div>
                  </div>
                  
                  {trainer.specializations && trainer.specializations.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {trainer.specializations.slice(0, 3).map((spec, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {spec}
                          </span>
                        ))}
                        {trainer.specializations.length > 3 && (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{trainer.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {trainer.shifts && (
                    <div className={`mt-3 flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock8 className="w-3 h-3 mr-1" />
                      <span>
                        Available: {trainer.shifts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' & ')} shifts
                      </span>
                    </div>
                  )}
                  
                  {trainer.bio && (
                    <div className="mt-3">
                      <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.bio}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => openRequestModal(trainer)}
                    disabled={pendingRequest || trainer.id === assignedTrainerId}
                    className={`mt-4 w-full py-2 rounded-md ${
                      pendingRequest || trainer.id === assignedTrainerId
                        ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500')
                        : (isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700')
                    }`}
                  >
                    {trainer.id === assignedTrainerId ? 'Current Trainer' : 
                     pendingRequest ? 'Request Pending' : 'Request Trainer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Request Modal */}
      {showRequestModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              onClick={() => setShowRequestModal(false)}
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>

            <div className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className={`text-lg leading-6 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Request Trainer: {selectedTrainer.name}
                  </h3>
                  <div className="mt-2">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Select your preferred shift and leave any additional notes for the trainer
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Preferred Shift
                      </label>
                      <select
                        value={preferredShift}
                        onChange={(e) => setPreferredShift(e.target.value as any)}
                        className={`w-full rounded-md ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="any">Any Shift</option>
                        {selectedTrainer.shifts?.map(shift => (
                          <option key={shift} value={shift}>
                            {shift.charAt(0).toUpperCase() + shift.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Additional Information (Optional)
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={3}
                        className={`w-full rounded-md ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Tell us about your fitness goals or any specific requirements..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRequestTrainer}
                  disabled={requestLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                    requestLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {requestLoading ? 'Processing...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm ${
                    isDarkMode
                      ? 'border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers; 