import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import { useProfile } from '../context/ProfileContext';
import { usePayment } from '../context/PaymentContext';
import { Crown, QrCode, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent';
  time?: string;
};

export default function Attendance() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { membership } = usePayment();
  const navigate = useNavigate();

  // Mock attendance records (replace with actual data from backend)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { date: '2024-01-15', status: 'present', time: '09:15 AM' },
    { date: '2024-01-16', status: 'absent' },
    { date: '2024-01-17', status: 'present', time: '10:30 AM' },
  ]);

  const handleScanSuccess = (result: string) => {
    if (result === 'triple-a676789') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const currentTime = format(new Date(), 'hh:mm a');
      
      // Check if attendance is already marked for today
      const todayRecord = attendanceRecords.find(record => record.date === today);
      
      if (!todayRecord) {
        setAttendanceRecords(prev => [
          { date: today, status: 'present', time: currentTime },
          ...prev
        ]);
      }
      
      setScanResult('Attendance marked successfully!');
      setError(null);
    } else {
      setError('Invalid QR code');
      setScanResult(null);
    }
    setShowScanner(false);
  };

  const handleScanError = (error: string) => {
    setError(error);
    setScanResult(null);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === formattedDate);
    
    if (!record) return '';
    
    return `attendance-${record.status}`;
  };

  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === formattedDate);
    
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

  if (!membership?.isActive) {
    return (
      <div className="min-h-screen bg-[#121212] text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-500 mb-2">Active Membership Required</h2>
              <p className="text-gray-400 mb-4">
                You need an active membership to access the attendance feature
              </p>
              <button
                onClick={() => navigate('/membership')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                View Membership Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with Scan Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <CalendarIcon className="w-6 h-6" />
              Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your gym visits</p>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scan QR
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar
            className="attendance-calendar"
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="space-y-4">
            {attendanceRecords.slice(0, 5).map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#282828] rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  {record.status === 'present' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(record.date), 'MMMM d, yyyy')}
                    </p>
                    {record.time && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{record.time}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    record.status === 'present'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {record.status === 'present' ? 'Present' : 'Absent'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Success Message */}
        {scanResult && (
          <div className="fixed bottom-4 right-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4 max-w-md">
            <h3 className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">Attendance Marked!</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your attendance has been recorded successfully.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .attendance-calendar {
          width: 100%;
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }

        .attendance-calendar .react-calendar__tile {
          padding: 1em 0.5em !important;
          font-size: 0.95rem !important;
          color: #111827 !important;
        }

        .dark .attendance-calendar .react-calendar__tile {
          color: #e5e7eb !important;
        }

        .attendance-calendar .react-calendar__month-view__days__day--weekend {
          color: #ef4444 !important;
        }

        .dark .attendance-calendar .react-calendar__month-view__days__day--weekend {
          color: #f87171 !important;
        }

        .attendance-calendar .react-calendar__tile--now {
          background: #f3f4f6 !important;
          font-weight: 600 !important;
        }

        .dark .attendance-calendar .react-calendar__tile--now {
          background: #374151 !important;
        }

        .attendance-calendar .react-calendar__tile--active {
          background: #10b981 !important;
          color: white !important;
        }

        .attendance-calendar .react-calendar__navigation {
          margin-bottom: 1rem !important;
        }

        .attendance-calendar .react-calendar__navigation button {
          font-size: 1rem !important;
          color: #111827 !important;
          font-weight: 500 !important;
        }

        .dark .attendance-calendar .react-calendar__navigation button {
          color: #e5e7eb !important;
        }

        .attendance-calendar .react-calendar__navigation button:disabled {
          color: #9ca3af !important;
        }

        .attendance-calendar .react-calendar__navigation button:enabled:hover,
        .attendance-calendar .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6 !important;
        }

        .dark .attendance-calendar .react-calendar__navigation button:enabled:hover,
        .dark .attendance-calendar .react-calendar__navigation button:enabled:focus {
          background-color: #374151 !important;
        }

        .attendance-calendar .react-calendar__tile:enabled:hover,
        .attendance-calendar .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6 !important;
        }

        .dark .attendance-calendar .react-calendar__tile:enabled:hover,
        .dark .attendance-calendar .react-calendar__tile:enabled:focus {
          background-color: #374151 !important;
        }

        .attendance-calendar .react-calendar__month-view__weekdays {
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          color: #6b7280 !important;
          text-transform: uppercase !important;
          margin-bottom: 0.5rem !important;
        }

        .dark .attendance-calendar .react-calendar__month-view__weekdays {
          color: #9ca3af !important;
        }

        .attendance-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem !important;
        }

        .attendance-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
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
      `}</style>
    </div>
  );
}