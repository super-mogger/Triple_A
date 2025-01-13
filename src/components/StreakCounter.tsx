import React from 'react';

interface StreakCounterProps {
  streak: number;
  label?: string;
  onStreakBroken?: () => void;
}

export default function StreakCounter({ streak, label = "Day Streak", onStreakBroken }: StreakCounterProps) {
  const radius = 35;
  const circumference = radius * 2 * Math.PI;
  const progress = (streak % 100) / 100;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Background circle */}
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-orange-500 transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {/* Counter text */}
      <div className="text-center">
        <div className="text-3xl font-bold">{streak}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  );
} 