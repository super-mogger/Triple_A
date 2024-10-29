import React from 'react';
import { LucideIcon } from 'lucide-react';

interface WorkoutCardProps {
  title: string;
  icon: LucideIcon;
  duration: string;
  exercises: number;
  color: string;
}

export default function WorkoutCard({ title, icon: Icon, duration, exercises, color }: WorkoutCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="text-white w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="space-y-1">
        <p className="text-gray-600 text-sm">Duration: {duration}</p>
        <p className="text-gray-600 text-sm">Exercises: {exercises}</p>
      </div>
    </div>
  );
}