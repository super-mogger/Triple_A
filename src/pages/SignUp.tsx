import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp, signInWithGoogle, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password);
    } catch (err) {
      console.error('Signup failed:', err);
      setPasswordError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google signup failed:', err);
      setPasswordError(err instanceof Error ? err.message : 'Google signup failed');
    }
  };

  const errorMessage = typeof error === 'string' ? error : error?.message || passwordError;

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
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Join The Elite</h1>
            <p className="text-gray-400 font-medium">Start your transformation today</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 backdrop-blur-sm text-red-200 text-sm border border-red-500/30">
              {errorMessage}
            </div>
          )}

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
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/90 uppercase tracking-wider" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-red-500/30 bg-white/5 text-white placeholder:text-gray-500 focus:border-red-500 focus:bg-red-500/5 transition-all"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 group uppercase tracking-wider"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-red-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400 uppercase tracking-wider font-medium">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              type="button"
              className="mt-4 w-full bg-white/5 backdrop-blur-sm border-2 border-red-500/30 py-3 rounded-xl font-bold hover:bg-red-500/10 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-white uppercase tracking-wider">Sign up with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Already a warrior? </span>
            <Link to="/login" className="text-sm text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-wider">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-border {
          0% { border-color: rgba(239, 68, 68, 0.3); }
          50% { border-color: rgba(239, 68, 68, 0.6); }
          100% { border-color: rgba(239, 68, 68, 0.3); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-dark) 100%);
        }
      `}</style>
    </div>
  );
} 