import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, AlertTriangle, History, Settings } from 'lucide-react';
import { getWaterIntake, updateWaterIntake } from '../services/WaterIntakeService';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-hot-toast';
import QRScanner from './QRScanner';

interface WaterIntakeCardProps {
  dailyGoal: number;
  onUpdate?: (amount: number) => void;
}

export default function WaterIntakeCard({ dailyGoal, onUpdate }: WaterIntakeCardProps) {
  const { user } = useAuth();
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [intakeHistory, setIntakeHistory] = useState<{ time: Date; amount: number }[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const percentage = Math.min((intake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - intake, 0);

  useEffect(() => {
    if (!user?.uid) {
      setError('Please sign in to track water intake');
      setLoading(false);
      return;
    }

    const loadWaterIntake = async () => {
      try {
        setLoading(true);
        setError(null);
        const today = new Date().toISOString().split('T')[0];
        const data = await getWaterIntake(user.uid, today);
        setIntake(data.amount);
        setIntakeHistory(data.history.map(h => ({
          time: h.time.toDate(),
          amount: h.amount
        })));
      } catch (error) {
        console.error('Error loading water intake:', error);
        setError('Failed to load water intake data');
        toast.error('Failed to load water intake data');
      } finally {
        setLoading(false);
      }
    };

    loadWaterIntake();
  }, [user?.uid]);

  const handleAddWater = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to track water intake');
      return;
    }

    try {
      setError(null);
      const newIntake = intake + 250;
      const today = new Date().toISOString().split('T')[0];
      const updatedData = await updateWaterIntake(user.uid, today, newIntake, dailyGoal);
      setIntake(updatedData.amount);
      setIntakeHistory(updatedData.history.map(h => ({
        time: h.time.toDate(),
        amount: h.amount
      })));
      onUpdate?.(newIntake);
    } catch (error) {
      console.error('Error updating water intake:', error);
      setError('Failed to update water intake');
      toast.error('Failed to update water intake');
    }
  };

  const handleRemoveWater = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to track water intake');
      return;
    }

    try {
      setError(null);
      const newIntake = Math.max(intake - 250, 0);
      const today = new Date().toISOString().split('T')[0];
      const updatedData = await updateWaterIntake(user.uid, today, newIntake, dailyGoal);
      setIntake(updatedData.amount);
      setIntakeHistory(updatedData.history.map(h => ({
        time: h.time.toDate(),
        amount: h.amount
      })));
      onUpdate?.(newIntake);
    } catch (error) {
      console.error('Error updating water intake:', error);
      setError('Failed to update water intake');
      toast.error('Failed to update water intake');
    }
  };

  const handleScanSuccess = (code: string) => {
    // Handle scan success
  };

  const handleScanError = (error: string) => {
    // Handle scan error
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Water Intake</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Goal: {dailyGoal}ml
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Water Meter Jar */}
        <div className="relative flex-1">
          <div className="h-40 w-24 mx-auto relative">
            {/* Jar Container */}
            <div className="absolute inset-0">
              {/* Glass Highlight */}
              <div className="absolute inset-x-0 top-0 h-full w-full bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-[2rem] z-20"></div>
              {/* Jar Body */}
              <div className="h-full w-full bg-gray-100/20 dark:bg-gray-800/20 rounded-[2rem] backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Water Fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-blue-400 to-blue-500 transition-all duration-500 ease-out rounded-b-[2rem]"
                  style={{ height: `${percentage}%` }}
                >
                  {/* Water Surface Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
              </div>
              {/* Jar Neck */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-100 dark:bg-gray-800 rounded-t-xl border-2 border-b-0 border-gray-200 dark:border-gray-700"></div>
            </div>
          </div>
          <div className="mt-2 text-center relative z-10">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{intake}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">ml</span>
          </div>
          <div className="mt-1 text-center relative z-10">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {percentage.toFixed(0)}% of goal
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remaining
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {remaining}ml
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRemoveWater}
              disabled={intake === 0}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddWater}
              className="flex-1 py-2 px-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add 250ml</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      {showHistory && intakeHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Recent History</h4>
          <div className="space-y-2">
            {intakeHistory
              .slice(-5) // Get last 5 entries
              .reverse() // Show newest first
              .map((entry, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`font-medium ${entry.amount > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}ml
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {showScanner && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan QR Code</h2>
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}
    </div>
  );
} 