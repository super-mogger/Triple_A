import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { CalendarIcon, CheckCircle2, Scan } from 'lucide-react';
import toast from 'react-hot-toast';
import QRScanner from '../components/QRScanner';
import { attendanceService } from '../services/AttendanceService';
import MembershipRequired from '../components/MembershipRequired';

// Custom dark mode styles for calendar
const calendarDarkStyles = `
  .react-calendar {
    background-color: #1E1E1E;
    border: none;
    color: white;
  }
  .react-calendar__tile {
    color: white;
    padding: 12px;
    border-radius: 8px;
  }
  .react-calendar__tile:hover {
    background-color: #333;
  }
  .react-calendar__tile--now {
    background-color: rgba(16, 185, 129, 0.2);
    color: white;
  }
  .react-calendar__month-view__weekdays__weekday {
    color: rgba(255, 255, 255, 0.7);
  }
  .react-calendar__navigation button {
    color: white;
  }
  .react-calendar__navigation button:hover {
    background-color: #333;
  }
  .react-calendar__navigation button:disabled {
    background-color: transparent;
  }
  .react-calendar__tile--active {
    background-color: #10B981;
    color: white;
  }
  .react-calendar__tile--present {
    background-color: rgba(16, 185, 129, 0.2);
  }
  .react-calendar__tile--absent {
    background-color: rgba(239, 68, 68, 0.2);
  }
  .react-calendar__tile--holiday {
    background-color: rgba(107, 114, 128, 0.2);
  }
`;

const Attendance = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    membership: any | null;
    error: string | null;
  }>({ isActive: false, membership: null, error: null });

  // Function to load attendance data
  const loadData = async (userId: string) => {
    try {
      const stats = await attendanceService.getAttendanceStats(userId);
      const records = await attendanceService.getAttendanceRecords(userId);
      setStats(stats);
      setAllAttendance(records);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchMembershipStatus = async () => {
      try {
        // Directly check if membership is active for now
        // We'll simplify this since checkMembershipStatus doesn't exist
        const isActive = true; // For demo purposes, we'll assume active
        setMembershipStatus({
          isActive,
          membership: null,
          error: null
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching membership status:', error);
        setMembershipStatus({
          isActive: false,
          membership: null,
          error: 'Failed to fetch membership status'
        });
        setLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [user]);

  useEffect(() => {
    if (!profile?.id || !membershipStatus.isActive) return;

    // Load initial data
    loadData(profile.id);
    
    // Setup realtime listener
    attendanceService.setupRealtimeListener(profile.id);
    
    // Load recent attendance from local storage
    setRecentAttendance(attendanceService.getRecentAttendance());

    return () => {
      // Cleanup realtime listener when component unmounts
      attendanceService.cleanup();
    };
  }, [profile?.id, membershipStatus.isActive]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!membershipStatus.isActive) {
    return <MembershipRequired feature="attendance" />;
  }

  const handleScanSuccess = async (result: string) => {
    if (!profile?.id) {
      navigate('/login');
      return;
    }

    if (result !== 'triple-a676789') {
      console.error('Invalid QR code');
      return;
    }

    setShowScanner(false);
    const loadingToast = toast.loading('Marking attendance...');

    try {
      const response = await attendanceService.markAttendance(profile.id);
      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success(response.message);
        // Reload data after marking attendance
        await loadData(profile.id);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to mark attendance');
    }
  };

  const handleScanError = (error: string) => {
    console.error('QR Scan Error:', error);
    
    // Use a fixed toast ID to prevent duplicate toasts
    toast.error('Failed to scan QR code', {
      id: 'qr-scan-error',
      duration: 3000 // Auto dismiss after 3 seconds
    });
  };

  const tileClassName = ({ date }: { date: Date }) => {
    let classes = [];
    
    // Check if day is present in attendance records
    const isPresent = allAttendance.some(record => 
      record.date && isSameDay(record.date.toDate(), date)
    );
    
    // Add class based on attendance
    if (isPresent) {
      classes.push('bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400');
    }
    
    return classes.join(' ');
  };
  
  const tileContent = ({ date }: { date: Date }) => {
    // Check if day is present in attendance records
    const attendance = allAttendance.find(record => 
      record.date && isSameDay(record.date.toDate(), date)
    );
    
    if (attendance) {
      return (
        <div className="absolute bottom-1 right-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        </div>
      );
    }
    
    return null;
  };

  const renderStats = () => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Current Streak */}
        <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Current Streak</h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white flex items-baseline">
            {stats.currentStreak || 0}
            <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">days</span>
          </div>
          
          {stats.currentStreak > 0 && (
            <div className="mt-4 text-sm bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl">
              <span className="text-emerald-500 font-medium">Keep it up!</span> Come back tomorrow to continue your streak.
            </div>
          )}
          
          {stats.currentStreak === 0 && (
            <div className="mt-4 text-sm bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl text-gray-600 dark:text-gray-400">
              Visit today to start a streak!
            </div>
          )}
        </div>
        
        {/* Longest Streak */}
        <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Longest Streak</h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white flex items-baseline">
            {stats.longestStreak || 0}
            <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">days</span>
          </div>
          
          {stats.currentStreak > 0 && stats.longestStreak > stats.currentStreak && (
            <div className="mt-4 text-sm bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl text-blue-600 dark:text-blue-400">
              {stats.longestStreak - stats.currentStreak} more days to beat your record!
            </div>
          )}
          
          {stats.currentStreak > 0 && stats.longestStreak === stats.currentStreak && (
            <div className="mt-4 text-sm bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl">
              <span className="text-blue-600 dark:text-blue-400 font-medium">Amazing!</span> You're at your best streak ever!
            </div>
          )}
        </div>
        
        {/* This Month */}
        <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">This Month</h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white flex items-baseline">
            {stats.thisMonth || 0}
            <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">days</span>
          </div>
          
          {stats.thisMonth > 0 && stats.daysRemainingThisMonth > 0 && (
            <div className="mt-4 text-sm bg-purple-50 dark:bg-purple-500/10 p-3 rounded-xl text-purple-600 dark:text-purple-400">
              {stats.daysRemainingThisMonth} more days possible this month
            </div>
          )}
        </div>
        
        {/* Total Visits */}
        <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Total Visits</h3>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white flex items-baseline">
            {stats.totalVisits || 0}
            <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">days</span>
          </div>
          
          {stats.totalVisits > 0 && (
            <div className="mt-4 text-sm bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl text-amber-600 dark:text-amber-400">
              First visit: {stats.firstVisitDate ? format(stats.firstVisitDate.toDate(), 'MMM d, yyyy') : 'N/A'}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderRecentAttendance = () => {
    // Filter to last 5 attendance records
    const latestRecords = [...allAttendance]
      .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
      .slice(0, 5);
    
    if (latestRecords.length === 0) {
      return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
              <CalendarIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
          </div>
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
              No attendance records yet. Scan a QR code to mark your attendance and start building your streak.
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="mt-6 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Mark Attendance Now
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
            <CalendarIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
        </div>
        <div className="space-y-3">
          {latestRecords.map((record, index) => (
            <div 
              key={record.id || index} 
              className={`flex items-center gap-4 p-4 rounded-xl ${index === 0 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500' 
                : 'bg-gray-50 dark:bg-gray-800/40'}`}
            >
              <div className={`p-3 rounded-full ${index === 0 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(record.date.toDate(), 'EEEE, MMMM dd')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Checked in at {record.time}
                </p>
              </div>
              {index === 0 && (
                <span className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-full font-medium">
                  Latest
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{calendarDarkStyles}</style>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header Section - Enhanced with gradient background */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="absolute top-0 right-0 -mt-4 -mr-16 opacity-20">
              <CalendarIcon className="w-64 h-64 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <h1 className="text-3xl font-bold text-white">Attendance</h1>
                <p className="text-emerald-50 mt-1 text-lg">Track your gym visits and build your streak</p>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-emerald-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Scan className="w-5 h-5" />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>

          {/* Stats Grid - Enhanced with better cards */}
          {renderStats()}

          {/* Recent Attendance - Improved design */}
          {renderRecentAttendance()}

          {/* Calendar Section - Enhanced container */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                  <CalendarIcon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Attendance Calendar</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Holiday</span>
                </div>
              </div>
            </div>
            <div className="calendar-container overflow-hidden rounded-xl">
              <Calendar
                value={new Date()}
                tileClassName={tileClassName}
                tileContent={tileContent}
                className="border-0 w-full"
                locale="en-US"
                minDetail="month"
              />
            </div>
          </div>

          {/* QR Scanner Modal - Improved modal design */}
          {showScanner && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan QR Code</h2>
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                  onClose={() => setShowScanner(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Attendance;