import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, Apple, Leaf } from 'lucide-react';
import DietCard from '../components/DietCard';

export default function DietPlan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Diet Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DietCard
            title="Balanced Diet"
            description="A balanced diet includes a variety of foods to provide the necessary nutrients."
            icon={Utensils}
          />
          <DietCard
            title="Fruit Intake"
            description="Incorporate a variety of fruits into your diet for essential vitamins."
            icon={Apple}
          />
          <DietCard
            title="Vegetarian Options"
            description="Explore vegetarian meals that are rich in protein and fiber."
            icon={Leaf}
          />
        </div>
      </div>
    </div>
  );
}