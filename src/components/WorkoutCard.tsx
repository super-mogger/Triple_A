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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all p-6 cursor-pointer border border-gray-100 dark:border-gray-700"
    >
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="text-white w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
      )}
      <div className="space-y-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Duration: {duration}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Exercises: {exercises}</p>
      </div>
    </div>
  );
}