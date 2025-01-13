import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

interface MuscleData {
  muscle: string;
  value: number;
}

interface MuscleRadarChartProps {
  muscleData: MuscleData[];
  detailedView?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]?.value) {
    return (
      <div className="bg-[#282828] px-3 py-2 rounded-lg shadow-lg border border-gray-700">
        <p className="text-gray-300">{`${payload[0].payload.muscle}: ${Math.round(payload[0].value)}%`}</p>
      </div>
    );
  }
  return null;
};

export const MuscleRadarChart = ({ muscleData, detailedView = false }: MuscleRadarChartProps) => {
  // Sort data by value in descending order for better visualization
  const sortedData = [...muscleData].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sortedData}>
          <PolarGrid stroke="#404040" />
          <PolarAngleAxis
            dataKey="muscle"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#404040' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#404040' }}
          />
          <Radar
            name="Muscle Activation"
            dataKey="value"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}; 