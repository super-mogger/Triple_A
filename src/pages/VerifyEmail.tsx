import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const { user, sendVerificationEmail, isEmailVerified, logout } = useAuth();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (isEmailVerified) {
      navigate('/');
    }
  }, [user, isEmailVerified, navigate]);

  useEffect(() => {
    const checkVerification = setInterval(() => {
      user?.reload();
    }, 5000);

    return () => clearInterval(checkVerification);
  }, [user]);

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail();
      setResendDisabled(true);
      
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-md rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-4 rounded-full">
            <Mail className="w-12 h-12 text-emerald-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify your email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification email to:<br />
          <span className="font-medium text-gray-800">{user?.email}</span>
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={resendDisabled}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${resendDisabled ? 'animate-spin' : ''}`} />
            <span>
              {resendDisabled 
                ? `Resend available in ${countdown}s` 
                : 'Resend verification email'}
            </span>
          </button>
          
          <button
            onClick={() => logout()}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to login
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Please check your spam folder if you don't see the email in your inbox
        </p>
      </div>
    </div>
  );
} 