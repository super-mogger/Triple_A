import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, X, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { createTestAdmin } from '../utils/createTestAdmin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [adminCreationMessage, setAdminCreationMessage] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle, user, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const validateForm = () => {
    setLocalError(null);
    if (!email) {
      setLocalError('Email is required');
      return false;
    }
    if (!password) {
      setLocalError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setLocalError(null);
      await signIn(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      setLocalError(err.message || 'Failed to login');
      toast.error(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLocalError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setLocalError(err.message || 'Failed to sign in with Google');
      toast.error(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email) {
      setLocalError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      setAdminCreationMessage(null);
      
      const result = await createTestAdmin(email);
      if (result.success) {
        setAdminCreationMessage(result.message);
        toast.success('Test admin account created successfully');
        // Pre-fill the password field with the default password
        setPassword('password123');
      } else {
        setLocalError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      console.error('Create admin error:', err);
      setLocalError(err.message || 'Failed to create test admin');
      toast.error(err.message || 'Failed to create test admin');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await signIn(resetEmail, '');
      toast.success('Password reset email sent');
      setShowResetModal(false);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email');
    }
  };

  // If already logged in, render nothing
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="https://cdn.pixabay.com/vimeo/328880089/gym-23634.mp4?width=1280&hash=4c2f2c14c51e1e2b75d5c99bb1c8d5c7f7c77a7c" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-md w-full max-w-md rounded-xl shadow-2xl p-8 relative border-2 border-red-500/30">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-red-500/20 p-4 rounded-full mb-4 group hover:scale-110 transition-all duration-300 border border-red-500/30">
              <Flame className="w-8 h-8 text-red-500 group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Welcome Back Warrior</h1>
            <p className="text-gray-400 font-medium">Continue your path to greatness</p>
          </div>

          {(localError || (authError && authError.message)) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {localError || (authError && authError.message)}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {adminCreationMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {adminCreationMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/90 uppercase tracking-wider" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-red-500/30 bg-white/5 text-white placeholder:text-gray-500 focus:border-red-500 focus:bg-red-500/5 transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/90 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-red-500/30 bg-white/5 text-white placeholder:text-gray-500 focus:border-red-500 focus:bg-red-500/5 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded border-2 border-red-500/30 bg-white/5 text-red-500 focus:ring-red-500 focus:ring-offset-0"
                  disabled={loading}
                />
                <span className="text-sm text-gray-400 font-medium">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)}
                className="text-sm text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-wider"
                disabled={loading}
              >
                Reset Password
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 group uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span>{loading ? 'Signing in...' : 'Power Up'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-red-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400 uppercase tracking-wider font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/5 backdrop-blur-sm border-2 border-red-500/30 py-3 rounded-xl font-bold hover:bg-red-500/10 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-white uppercase tracking-wider">{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Ready to join the elite? </span>
            <Link to="/signup" className="text-sm text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-wider">
              Start Now
            </Link>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 w-full max-w-md relative text-white border-2 border-red-500/30">
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetStatus(null);
                setResetEmail('');
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Reset Password</h2>
            </div>
            
            {resetStatus ? (
              <div className={`p-4 rounded-xl backdrop-blur-sm ${
                resetStatus.type === 'success' ? 'bg-green-500/10 text-green-200 border border-green-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'
              } mb-4`}>
                {resetStatus.message}
              </div>
            ) : (
              <p className="text-gray-400 mb-4 font-medium">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90 uppercase tracking-wider" htmlFor="resetEmail">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors" />
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-red-500/30 bg-white/5 text-white placeholder:text-gray-500 focus:border-red-500 focus:bg-red-500/5 transition-all"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 group uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleCreateAdmin}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Test Admin
        </button>
        <p className="mt-2 text-xs text-center text-gray-500">
          No account? Use the "Create Test Admin" button to create a test admin account with your email
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse-border {
          0% { border-color: rgba(239, 68, 68, 0.3); }
          50% { border-color: rgba(239, 68, 68, 0.6); }
          100% { border-color: rgba(239, 68, 68, 0.3); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;