import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  target: string;
  icon: LucideIcon;
  color: string;
  progress: number;
  unit?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  target, 
  icon: Icon, 
  color, 
  progress, 
  unit = '' 
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="text-white w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <h3 className="text-gray-700 font-medium mb-1">{title}</h3>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-gray-500 text-sm">{unit}</span>}
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Target: {target}{unit}</p>
      </div>
    </div>
  );
}