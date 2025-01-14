import React from 'react';
import { LucideIcon } from 'lucide-react';

interface WorkoutCardProps {
  title: string;
  icon: LucideIcon;
  duration: string;
  exercises: number;
  color: string;
  description?: string;
  onClick?: () => void;
}

export default function WorkoutCard({ 
  title, 
  icon: Icon, 
  duration, 
  exercises, 
  color,
  description,
  onClick 
}: WorkoutCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all p-4 md:p-6 cursor-pointer border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-[0.98]"
    >
      <div className={`${color} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="text-white w-5 h-5 md:w-6 md:h-6" />
      </div>
      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{description}</p>
      )}
      <div className="space-y-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {duration}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Exercises: {exercises}</p>
      </div>
    </div>
  );
}