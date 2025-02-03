import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, X, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only redirect if user is on the login page
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting Google sign in');
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in failed:', err);
      // Error toast is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent');
      setShowResetModal(false);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email');
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded border-2 border-red-500/30 bg-white/5 text-red-500 focus:ring-red-500 focus:ring-offset-0"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-400 font-medium">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)}
                className="text-sm text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-wider"
                disabled={isLoading}
              >
                Reset Password
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 group uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span>{isLoading ? 'Signing in...' : 'Power Up'}</span>
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
              disabled={isLoading}
              className="w-full bg-white/5 backdrop-blur-sm border-2 border-red-500/30 py-3 rounded-xl font-bold hover:bg-red-500/10 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-white uppercase tracking-wider">{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
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
              disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 group uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          </div>
        </div>
      )}

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
}