import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { attendanceService, AttendanceRecord } from '../services/AttendanceService';
import { format, isToday, isPast, isSunday } from 'date-fns';
import QRScanner from '../components/QRScanner';
import { 
  Trophy, Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, 
  Scan, ArrowRight, Activity, Award, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../types/profile';
import MembershipRequired from '../components/MembershipRequired';
import type { QRScannerProps } from '../components/QRScanner';

// Updated calendar dark styles
const calendarDarkStyles = `
  /* Calendar Container */
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border: none;
    font-family: inherit;
    line-height: 1.125em;
    padding: 1rem;
  }

  .dark .react-calendar {
    background-color: transparent;
    border: none;
    color: #fff;
  }

  /* Navigation Section */
  .react-calendar__navigation {
    display: flex;
    margin-bottom: 1.5rem;
    background: transparent;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: #374151;
  }

  .dark .react-calendar__navigation button {
    color: #fff;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #F3F4F6;
    border-radius: 0.5rem;
  }

  .dark .react-calendar__navigation button:enabled:hover,
  .dark .react-calendar__navigation button:enabled:focus {
    background-color: rgba(45, 45, 45, 0.8);
  }

  .react-calendar__navigation button[disabled] {
    background: transparent;
    opacity: 0.5;
  }

  /* Month View */
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.5rem 0;
    color: #6B7280;
  }

  .dark .react-calendar__month-view__weekdays {
    color: #9CA3AF;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.75rem;
  }

  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
    cursor: default;
  }

  /* Calendar Tiles */
  .react-calendar__tile {
    padding: 1.5rem 0.5rem;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 0.875rem;
    position: relative;
    border-radius: 0.5rem;
  }

  .dark .react-calendar__tile {
    color: #fff;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #F3F4F6;
    border-radius: 0.5rem;
  }

  .dark .react-calendar__tile:enabled:hover,
  .dark .react-calendar__tile:enabled:focus {
    background-color: rgba(45, 45, 45, 0.8);
  }

  /* Today's Date */
  .react-calendar__tile--now {
    background: rgba(16, 185, 129, 0.1);
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .dark .react-calendar__tile--now {
    background: rgba(16, 185, 129, 0.15);
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: rgba(16, 185, 129, 0.2);
  }

  /* Active Date */
  .react-calendar__tile--active {
    background: #10B981;
    color: white;
    border-radius: 0.5rem;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #059669;
  }

  /* Weekend Days */
  .react-calendar__month-view__days__day--weekend {
    color: #EF4444;
  }

  .dark .react-calendar__month-view__days__day--weekend {
    color: #F87171;
  }

  /* Neighboring Month Days */
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #9CA3AF;
  }

  .dark .react-calendar__month-view__days__day--neighboringMonth {
    color: #4B5563;
  }

  /* Attendance Status Styles */
  .attendance-present {
    background-color: rgba(16, 185, 129, 0.1) !important;
  }

  .dark .attendance-present {
    background-color: rgba(16, 185, 129, 0.15) !important;
  }

  .attendance-present::after {
    content: '';
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.5rem;
    height: 0.5rem;
    background-color: #10B981;
    border-radius: 9999px;
  }

  .attendance-absent {
    background-color: rgba(239, 68, 68, 0.1) !important;
  }

  .dark .attendance-absent {
    background-color: rgba(239, 68, 68, 0.15) !important;
  }

  .attendance-absent::after {
    content: '';
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.5rem;
    height: 0.5rem;
    background-color: #EF4444;
    border-radius: 9999px;
  }

  .attendance-holiday {
    background-color: rgba(107, 114, 128, 0.1) !important;
  }

  .dark .attendance-holiday {
    background-color: rgba(107, 114, 128, 0.15) !important;
  }

  .attendance-holiday::after {
    content: '';
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.5rem;
    height: 0.5rem;
    background-color: #6B7280;
    border-radius: 9999px;
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
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    membership: Membership | null;
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
      const status = await checkMembershipStatus(user.uid);
      setMembershipStatus(status);
      setLoading(false);
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
    toast.error('Failed to scan QR code');
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSunday = date.getDay() === 0;
    
    if (isSunday) {
      return 'attendance-holiday';
    }

    const record = allAttendance.find(r => 
      format(r.date.toDate(), 'yyyy-MM-dd') === formattedDate
    );
    
    if (!record) {
      // Check if this date is in the past (excluding today) and not marked
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate < today && !isSunday) {
        return 'attendance-absent';
      }
      
      return '';
    }
    
    return record.status === 'present' ? 'attendance-present' : 'attendance-absent';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSunday = date.getDay() === 0;
    
    if (isSunday) {
      return (
        <div className="flex justify-center">
          <span className="text-xs text-gray-500">Holiday</span>
        </div>
      );
    }

    const record = allAttendance.find(r => 
      format(r.date.toDate(), 'yyyy-MM-dd') === formattedDate
    );
    
    // Check if this date is in the past (excluding today) and not marked
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate < today && !record && !isSunday) {
      return (
        <div className="flex justify-center">
          <XCircle className="w-4 h-4 text-red-500" />
        </div>
      );
    }
    
    if (!record) return null;
    
    return (
      <div className="flex justify-center">
        {record.status === 'present' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Present Days */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Present Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPresent}</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <Flame className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestStreak}</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Visit */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transform transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Visit</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.lastAttendance 
                  ? format(stats.lastAttendance.toDate(), 'MMM dd')
                  : 'No visits'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecentAttendance = () => {
    if (recentAttendance.length === 0) return null;

    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Last 5 visits</span>
        </div>
        <div className="space-y-4">
          {recentAttendance.map((record, index) => (
            <div 
              key={record.id} 
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
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
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm rounded-full">
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
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track your gym visits and streaks</p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              <Scan className="w-5 h-5" />
              <span>Mark Attendance</span>
            </button>
          </div>

          {/* Stats Grid */}
          {renderStats()}

          {/* Recent Attendance */}
          {renderRecentAttendance()}

          {/* Calendar Section - Updated container */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Calendar</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
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

          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 max-w-md w-full mx-4">
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