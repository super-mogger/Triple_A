import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { attendanceService, AttendanceRecord } from '../services/AttendanceService';
import { format } from 'date-fns';
import QRScanner from '../components/QRScanner';
import { Trophy, Clock, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { usePayment } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkMembershipStatus } from '../services/FirestoreService';
import type { Membership } from '../services/FirestoreService';

const Attendance = () => {
  const { profile } = useProfile();
  const { membership } = usePayment();
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
    return <div className="p-4">Loading...</div>;
  }

  if (!membershipStatus.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Active Membership Required</h2>
          <p className="text-gray-600 mb-4">Please purchase a membership to access attendance features.</p>
          <button
            onClick={() => navigate('/membership')}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            View Membership Plans
          </button>
        </div>
      </div>
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Present Days</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalPresent}</p>
        </div>
        
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Current Streak</h3>
          </div>
          <p className="text-2xl font-bold">{stats.currentStreak} days</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Longest Streak</h3>
          </div>
          <p className="text-2xl font-bold">{stats.longestStreak} days</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Last Visit</h3>
          </div>
          <p className="text-lg">
            {stats.lastAttendance 
              ? format(stats.lastAttendance.toDate(), 'MMM dd, yyyy')
              : 'No visits yet'}
          </p>
        </div>
      </div>
    );
  };

  const renderRecentAttendance = () => {
    if (recentAttendance.length === 0) return null;

    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
        <div className="space-y-2">
          {recentAttendance.map((record) => (
            <div 
              key={record.id} 
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-[#2D2D2D] rounded"
            >
              <div>
                <p className="font-medium">
                  {format(record.date.toDate(), 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {record.time}
                </p>
              </div>
              <span className="px-2 py-1 text-sm rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
          <button
            onClick={() => setShowScanner(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Scan QR
          </button>
        </div>

      {renderStats()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-sm">
          <Calendar
            className="attendance-calendar"
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>
                  <div>
          {renderRecentAttendance()}
          </div>
        </div>

        {showScanner && (
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={() => setShowScanner(false)}
          />
        )}

      <style>{`
        .attendance-calendar {
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }

        .attendance-calendar .react-calendar__tile {
          padding: 1em 0.5em !important;
          position: relative !important;
        }

        .attendance-calendar .react-calendar__month-view__days__day--weekend {
          color: #ef4444 !important;
        }

        .attendance-calendar .react-calendar__tile--now {
          background: #f3f4f6 !important;
        }

        .dark .attendance-calendar .react-calendar__tile--now {
          background: #374151 !important;
        }

        .attendance-present {
          background-color: rgba(16, 185, 129, 0.1) !important;
        }

        .attendance-absent {
          background-color: rgba(239, 68, 68, 0.1) !important;
        }

        .attendance-holiday {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        .dark .attendance-present {
          background-color: rgba(16, 185, 129, 0.2) !important;
        }

        .dark .attendance-absent {
          background-color: rgba(239, 68, 68, 0.2) !important;
        }

        .dark .attendance-holiday {
          background-color: rgba(59, 130, 246, 0.2) !important;
        }

        .attendance-calendar .react-calendar__navigation button {
          color: #111827 !important;
        }

        .dark .attendance-calendar .react-calendar__navigation button {
          color: #e5e7eb !important;
        }

        .attendance-calendar .react-calendar__month-view__weekdays {
          color: #6b7280 !important;
        }

        .dark .attendance-calendar .react-calendar__month-view__weekdays {
          color: #9ca3af !important;
        }

        .attendance-calendar .react-calendar__tile {
          color: #111827 !important;
        }

        .dark .attendance-calendar .react-calendar__tile {
          color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};

export default Attendance;