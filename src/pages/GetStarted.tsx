import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, Activity, Utensils, Target, ChevronRight, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GetStarted() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
          className="w-full h-full object-cover opacity-50"
        >
          <source src="https://cdn.pixabay.com/vimeo/328880089/gym-23634.mp4?width=1280&hash=4c2f2c14c51e1e2b75d5c99bb1c8d5c7f7c77a7c" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section */}
        <div className="space-y-8 mb-16 relative">
          <div className="relative mb-8">
            <div className="bg-red-500/20 p-6 rounded-full group hover:scale-110 transition-transform duration-300 border-2 border-red-500/30">
              <Flame className="w-16 h-16 text-red-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute -top-4 -right-4 bg-red-500 w-8 h-8 rounded-full animate-ping"></div>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
              Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
                LIMITS
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Push beyond your boundaries. Join the elite community of warriors dedicated to forging their best selves.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-20">
          <Link 
            to="/login" 
            className="flex-1 bg-white/5 text-white border-2 border-red-500/30 py-4 px-8 rounded-xl font-bold hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center group uppercase tracking-wider"
          >
            Sign In
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/signup" 
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-8 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center group uppercase tracking-wider transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
          >
            Start Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl w-full">
          <div className="bg-white/5 p-8 rounded-xl text-white border-2 border-red-500/30 hover:bg-red-500/10 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="bg-red-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase">Elite Training</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Access professional workout programs designed to push your limits and achieve maximum results.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-xl text-white border-2 border-orange-500/30 hover:bg-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="bg-orange-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase">Track Progress</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Monitor your gains with advanced analytics. Compete with fellow warriors on the leaderboard.
            </p>
          </div>

          <div className="bg-white/5 p-8 rounded-xl text-white border-2 border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="bg-yellow-500/20 p-3 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase">Beast Mode</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Unlock your full potential with personalized challenges and achievement tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Add styles for animations */}
      <style>{`
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