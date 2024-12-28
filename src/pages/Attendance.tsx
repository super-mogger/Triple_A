import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';

export default function Attendance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance</h1>
        <p>Attendance page content coming soon...</p>
      </div>
    </div>
  );
}