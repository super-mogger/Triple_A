import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ActivitySquare, Utensils, QrCode } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workouts', icon: ActivitySquare, label: 'Workouts' },
  { to: '/diet', icon: Utensils, label: 'Diet' },
  { to: '/attendance', icon: QrCode, label: 'Attendance' },
];

interface NavigationProps {
  onLogout: () => Promise<void>;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const { isDarkMode } = useTheme();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${
      isDarkMode 
        ? 'bg-dark-surface border-gray-800' 
        : 'bg-white border-gray-200'
    } border-t shadow-lg backdrop-blur-lg backdrop-filter`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 flex-grow px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? isActive
                      ? 'text-emerald-500'
                      : 'text-gray-400 hover:text-emerald-500'
                    : isActive
                      ? 'text-emerald-600'
                      : 'text-gray-600 hover:text-emerald-600'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}