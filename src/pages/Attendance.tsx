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

const Attendance = () => {
  const { profile } = useProfile();
  const { membership } = usePayment();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);

  // If user has no membership, show upgrade message
  if (!membership?.is_active) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] p-4">
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <CalendarIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upgrade to Track Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get access to attendance tracking, streak monitoring, and achievement unlocks with a membership.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <span>Track your gym streaks</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Mark daily attendance</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>View attendance history</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/membership')}
              className="mt-8 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              View Membership Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!profile?.id) return;

    // Load initial data
    loadAttendanceData();
    
    // Setup realtime listener
    attendanceService.setupRealtimeListener(profile.id);
    
    // Load recent attendance from local storage
    setRecentAttendance(attendanceService.getRecentAttendance());

    // Load all attendance records
    loadAllAttendanceRecords();

    return () => {
      // Cleanup realtime listener when component unmounts
      attendanceService.cleanup();
    };
  }, [profile?.id]);

  const loadAttendanceData = async () => {
    if (!profile?.id) return;
    
    try {
      const stats = await attendanceService.getAttendanceStats(profile.id);
      setStats(stats);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAttendanceRecords = async () => {
    if (!profile?.id) return;
    
    try {
      const records = await attendanceService.getAttendanceRecords(profile.id);
      setAllAttendance(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

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
        loadAttendanceData();
        loadAllAttendanceRecords(); // Reload calendar data
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
    const record = allAttendance.find(r => 
      format(r.date.toDate(), 'yyyy-MM-dd') === formattedDate
    );
    
    if (!record) return '';
    
    return record.status === 'present' ? 'attendance-present' : 'attendance-absent';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const record = allAttendance.find(r => 
      format(r.date.toDate(), 'yyyy-MM-dd') === formattedDate
    );
    
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

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

        .dark .attendance-present {
          background-color: rgba(16, 185, 129, 0.2) !important;
        }

        .dark .attendance-absent {
          background-color: rgba(239, 68, 68, 0.2) !important;
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