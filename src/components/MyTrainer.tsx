import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { User2, Clock, Calendar, Award, Dumbbell, Mail, Phone, MapPin } from 'lucide-react';

interface TrainerInfo {
  id: string;
  name: string;
  specializations: string[];
  experience: number;
  bio?: string;
  photoURL?: string;
  shift?: string;
  email?: string;
  phone?: string;
  age?: number;
  location?: string;
}

interface TrainerAssignment {
  trainerId: string;
  trainerName: string;
  shift: string;
  assignedAt: Date;
}

const MyTrainer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [assignment, setAssignment] = useState<TrainerAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [preferredShift, setPreferredShift] = useState<'morning' | 'evening' | 'any'>('any');
  const [requestMessage, setRequestMessage] = useState('');
  const [pendingRequest, setPendingRequest] = useState(false);
  const [showTrainerDetails, setShowTrainerDetails] = useState(false);

  useEffect(() => {
    fetchAssignedTrainer();
    checkExistingRequest();
  }, []);

  const fetchAssignedTrainer = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // First check if there's an assignment for this member
      const assignmentRef = doc(db, 'trainerAssignments', currentUser.uid);
      const assignmentSnap = await getDoc(assignmentRef);
      
      if (!assignmentSnap.exists()) {
        setLoading(false);
        return;
      }

      const assignmentData = assignmentSnap.data();
      setAssignment({
        trainerId: assignmentData.trainerId,
        trainerName: assignmentData.trainerName,
        shift: assignmentData.shift,
        assignedAt: assignmentData.assignedAt.toDate()
      });

      // Fetch detailed trainer information
      const trainerRef = doc(db, 'trainers', assignmentData.trainerId);
      const trainerSnap = await getDoc(trainerRef);
      
      if (trainerSnap.exists()) {
        const trainerData = trainerSnap.data();
        
        // Also fetch admin data for additional info
        const adminRef = doc(db, 'admins', assignmentData.trainerId);
        const adminSnap = await getDoc(adminRef);
        const adminData = adminSnap.exists() ? adminSnap.data() : {};
        
        setTrainer({
          id: assignmentData.trainerId,
          name: assignmentData.trainerName,
          specializations: trainerData.specializations || [],
          experience: trainerData.experience || 0,
          bio: trainerData.bio || '',
          photoURL: trainerData.photoURL || adminData.photoURL || '',
          shift: assignmentData.shift,
          email: adminData.email || trainerData.email,
          phone: adminData.phone || trainerData.phone,
          age: trainerData.age,
          location: trainerData.location
        });
      } else {
        // Fallback if detailed trainer info isn't available
        setTrainer({
          id: assignmentData.trainerId,
          name: assignmentData.trainerName,
          specializations: [],
          experience: 0,
          shift: assignmentData.shift
        });
      }
    } catch (error) {
      console.error('Error fetching trainer:', error);
      toast.error('Failed to load trainer information');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRequest = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const requestsRef = collection(db, 'trainerRequests');
      const q = query(requestsRef, where('userId', '==', currentUser.uid), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setPendingRequest(true);
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const handleRequestTrainer = async () => {
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
      
      // Create a new request document with a unique ID
      const requestId = `${currentUser.uid}_${Date.now()}`;
      const requestRef = doc(db, 'trainerRequests', requestId);
      
      await setDoc(requestRef, {
        userId: currentUser.uid,
        userName,
        userEmail: currentUser.email,
        requestDate: serverTimestamp(),
        status: 'pending',
        preferredShift,
        message: requestMessage
      });
      
      setPendingRequest(true);
      setShowRequestForm(false);
      toast.success('Trainer request submitted successfully');
    } catch (error) {
      console.error('Error requesting trainer:', error);
      toast.error('Failed to submit trainer request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg overflow-hidden shadow ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } p-4`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'} border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Trainer
          </h3>
          {!trainer && !pendingRequest && (
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className={`text-sm px-3 py-1.5 rounded ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Request Trainer
            </button>
          )}
          {trainer && (
            <button
              onClick={() => setShowTrainerDetails(!showTrainerDetails)}
              className={`text-sm px-3 py-1.5 rounded ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {showTrainerDetails ? 'Hide Details' : 'View Details'}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {/* Trainer Request Form */}
        {showRequestForm && !trainer && !pendingRequest && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-750 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h4 className={`text-md font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Request a Trainer
            </h4>
            
            <div className="space-y-4">
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
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
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
                  placeholder="Any specific requirements or goals..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestTrainer}
                  disabled={requestLoading}
                  className={`px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 ${
                    requestLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {requestLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Existing Request Status */}
        {pendingRequest && !trainer && (
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-blue-900/20 border-blue-800/40' : 'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex items-start">
              <div className={`mt-1 p-2 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              <div className="ml-4">
                <h4 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Trainer Request Pending
                </h4>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your request has been submitted and is waiting for approval. We'll notify you once a trainer is assigned.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* No Trainer Assigned */}
        {!trainer && !showRequestForm && !pendingRequest && (
          <div className="text-center py-8">
            <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <User2 className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <h3 className={`mt-4 text-md font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No trainer assigned
            </h3>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Request a personal trainer to help achieve your fitness goals
            </p>
            <button
              onClick={() => setShowRequestForm(true)}
              className={`mt-4 px-4 py-2 rounded ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Request a Trainer
            </button>
          </div>
        )}
        
        {/* Trainer Info - Basic View */}
        {trainer && !showTrainerDetails && (
          <div className="flex items-start">
            {trainer.photoURL ? (
              <img 
                src={trainer.photoURL} 
                alt={trainer.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-semibold ${
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {trainer.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="ml-4">
              <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {trainer.name}
              </h4>
              
              {trainer.shift && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {trainer.shift.charAt(0).toUpperCase() + trainer.shift.slice(1)} shift
                </p>
              )}
              
              {trainer.experience > 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {trainer.experience} {trainer.experience === 1 ? 'year' : 'years'} of experience
                </p>
              )}
              
              {trainer.specializations && trainer.specializations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trainer.specializations.slice(0, 2).map((spec, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                  {trainer.specializations.length > 2 && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{trainer.specializations.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Trainer Info - Detailed View */}
        {trainer && showTrainerDetails && (
          <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Trainer Photo */}
              <div className="flex-shrink-0">
                {trainer.photoURL ? (
                  <img 
                    src={trainer.photoURL} 
                    alt={trainer.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className={`h-24 w-24 sm:h-32 sm:w-32 rounded-full flex items-center justify-center text-2xl font-semibold ${
                    isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {trainer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Trainer Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {trainer.name}
                </h4>
                
                <div className="mt-2 space-y-2">
                  {trainer.shift && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <Clock className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.shift.charAt(0).toUpperCase() + trainer.shift.slice(1)} shift
                      </span>
                    </div>
                  )}
                  
                  {trainer.experience > 0 && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <Award className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.experience} {trainer.experience === 1 ? 'year' : 'years'} of experience
                      </span>
                    </div>
                  )}
                  
                  {trainer.age && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <User2 className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.age} years old
                      </span>
                    </div>
                  )}
                  
                  {trainer.location && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <MapPin className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {trainer.email && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <Mail className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.email}
                      </span>
                    </div>
                  )}
                  {trainer.phone && (
                    <div className="flex items-center justify-center sm:justify-start mt-1">
                      <Phone className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trainer.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Specializations */}
            {trainer.specializations && trainer.specializations.length > 0 && (
              <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h5 className={`text-sm font-medium flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Specializations
                </h5>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trainer.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bio */}
            {trainer.bio && (
              <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h5 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  About
                </h5>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {trainer.bio}
                </p>
              </div>
            )}
            
            {/* Assignment Details */}
            {assignment && (
              <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <Calendar className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Assigned on {assignment.assignedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrainer; 