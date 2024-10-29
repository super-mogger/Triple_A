import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ActivitySquare, Utensils, QrCode, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/progress', icon: ActivitySquare, label: 'Progress' },
  { to: '/diet', icon: Utensils, label: 'Diet' },
  { to: '/attendance', icon: QrCode, label: 'Attendance' },
];

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:top-0 md:bottom-auto z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around md:justify-between">
          <div className="flex justify-around md:justify-start md:space-x-8">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
          <button
            onClick={onLogout}
            className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}