import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, CalendarCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/diet', icon: UtensilsCrossed, label: 'Diet' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' }
];

interface NavigationProps {
  onLogout: () => Promise<void>;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const { isDarkMode } = useTheme();

  return (
    <nav className={`${
      isDarkMode 
        ? 'bg-dark-surface/80 border-gray-800/50' 
        : 'bg-white/80 border-gray-200/50'
    } border-t shadow-lg backdrop-blur-md backdrop-saturate-150 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-2 md:px-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 md:px-6 rounded-lg transition-all duration-200 touch-manipulation ${
                  isDarkMode
                    ? isActive
                      ? 'text-emerald-400 translate-y-[-4px]'
                      : 'text-gray-400 hover:text-emerald-400 active:text-emerald-500 hover:translate-y-[-2px]'
                    : isActive
                      ? 'text-emerald-600 translate-y-[-4px]'
                      : 'text-gray-600 hover:text-emerald-600 active:text-emerald-700 hover:translate-y-[-2px]'
                }`
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}