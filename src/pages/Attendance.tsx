import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { 
  QrCode, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent';
  time?: string;
};

export default function Attendance() {
  const { isDarkMode } = useTheme();
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { date: '2024-02-01', status: 'present', time: '09:15 AM' },
    { date: '2024-02-03', status: 'absent' },
    { date: '2024-02-05', status: 'present', time: '09:30 AM' },
  ]);

  const handleScan = (data: string | null) => {
    if (data) {
      // Validate QR code data and mark attendance
      if (data === 'your-gym-qr-code') { // Replace with your actual QR code validation
        const today = format(new Date(), 'yyyy-MM-dd');
        const newRecord: AttendanceRecord = {
          date: today,
          status: 'present',
          time: format(new Date(), 'hh:mm a')
        };
        
        setAttendanceRecords(prev => [...prev, newRecord]);
        setShowScanner(false);
        
        // Show success message
        alert('Attendance marked successfully!');
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === formattedDate);
    
    if (!record) return '';
    
    return `attendance-${record.status} ${isDarkMode ? 'dark' : ''}`;
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

  return (
    <div className={`max-w-4xl mx-auto p-4 ${
      isDarkMode ? 'text-dark-text' : 'text-gray-800'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" />
            Attendance
          </h1>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Track your gym visits</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className={`px-4 py-2 rounded-lg flex items-center ${
            isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
          } text-white transition-colors`}
        >
          <QrCode className="w-5 h-5 mr-2" />
          Scan QR
        </button>
      </div>

      {/* Calendar */}
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-dark-surface' : 'bg-white'
      } shadow-lg mb-6`}>
        <Calendar
          className={`w-full ${isDarkMode ? 'dark-calendar' : ''}`}
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`relative p-4 rounded-lg ${
            isDarkMode ? 'bg-dark-surface' : 'bg-white'
          } max-w-md w-full mx-4`}>
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Scan QR Code</h2>
            
            <div className="aspect-square rounded-lg overflow-hidden bg-black mb-4">
              {/* Add QR Scanner component here when needed */}
              <p className="text-center text-white p-4">
                QR Scanner will be implemented here
              </p>
            </div>
            
            <p className="text-sm text-center text-gray-500">
              Position the QR code within the frame to mark your attendance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}