import React from 'react';
import { Utensils, Apple, Leaf } from 'lucide-react';
import DietCard from '../components/DietCard';

export default function DietPlan() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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