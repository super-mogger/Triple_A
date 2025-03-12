import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, AlertTriangle, History, Settings, RefreshCw, Bell, BellOff, Crown } from 'lucide-react';
import { getWaterIntake, updateWaterIntake } from '../services/WaterIntakeService';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-hot-toast';
import QRScanner from './QRScanner';
import { useNotification } from '../context/NotificationContext';
import { useMembership } from '../context/MembershipContext';
import { useNavigate } from 'react-router-dom';

interface WaterIntakeCardProps {
  dailyGoal: number;
  onUpdate?: (amount: number) => void;
}

export default function WaterIntakeCard({ dailyGoal, onUpdate }: WaterIntakeCardProps) {
  const { user } = useAuth();
  const { isActive, loading: membershipLoading } = useMembership();
  const navigate = useNavigate();
  const { notifications, toggleNotification, requestNotificationPermission } = useNotification();
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [intakeHistory, setIntakeHistory] = useState<{ time: Date; amount: number }[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const percentage = Math.min((intake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - intake, 0);

  useEffect(() => {
    if (!user?.uid) {
      setError('Please sign in to track water intake');
      setLoading(false);
      return;
    }

    if (isActive) {
      loadWaterIntake();
    } else {
      setLoading(false);
    }
  }, [user?.uid, isActive]);

  const loadWaterIntake = async () => {
    if (!user?.uid) {
      setError('Please sign in to track water intake');
      setLoading(false);
      return;
    }
    
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

  const handleRefresh = async () => {
    if (!user?.uid) return;
    
    setRefreshing(true);
    toast.loading('Refreshing water intake data...');
    
    try {
      // Force reload by calling the service function again
      await loadWaterIntake();
      toast.dismiss();
      toast.success('Water intake data refreshed');
    } catch (error) {
      console.error('Error refreshing water intake:', error);
      toast.dismiss();
      toast.error('Failed to refresh water intake data');
    } finally {
      setRefreshing(false);
    }
  };

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

  if (membershipLoading || loading) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Water Intake</h3>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
            <Crown className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Water tracking is available exclusively to premium members.
            Upgrade your membership to track your daily hydration.
          </p>
          <button 
            onClick={() => navigate('/membership')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Upgrade Membership
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
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

      <div className="mb-4">
        <div className="relative h-40 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {/* Water level visualization */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 ease-out"
            style={{ height: `${percentage}%`, opacity: 0.8 }}
          ></div>

          {/* Glass jar effect */}
          <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-5"></div>

          {/* Water measurements */}
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <div className="self-end text-sm font-medium text-gray-500 dark:text-gray-400">
              {dailyGoal}ml
            </div>
            <div className="self-end text-sm font-medium text-gray-500 dark:text-gray-400">
              {Math.floor(dailyGoal * 0.75)}ml
            </div>
            <div className="self-end text-sm font-medium text-gray-500 dark:text-gray-400">
              {Math.floor(dailyGoal * 0.5)}ml
            </div>
            <div className="self-end text-sm font-medium text-gray-500 dark:text-gray-400">
              {Math.floor(dailyGoal * 0.25)}ml
            </div>
            <div className="self-end text-sm font-medium text-gray-500 dark:text-gray-400">
              0ml
            </div>
          </div>

          {/* Percentage and amount display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {intake}ml / {dailyGoal}ml
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {remaining}ml remaining
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleRemoveWater}
          className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
          aria-label="Remove 250ml"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Add or remove 250ml</p>
        </div>
        <button
          onClick={handleAddWater}
          className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
          aria-label="Add 250ml"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showHistory && (
        <div className="mt-4 overflow-auto max-h-40">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Today's History</h4>
          {intakeHistory.length > 0 ? (
            <ul className="space-y-2">
              {intakeHistory.map((entry, index) => (
                <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={entry.amount > 0 ? 'text-blue-500' : 'text-red-500'}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}ml
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">No history for today</p>
          )}
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
} 