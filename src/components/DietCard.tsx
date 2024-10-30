import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DietCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function DietCard({ title, description, icon: Icon }: DietCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <Icon className="text-emerald-600 w-6 h-6 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 