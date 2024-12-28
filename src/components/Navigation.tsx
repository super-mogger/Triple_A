import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ActivitySquare, Utensils, QrCode } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/progress', icon: ActivitySquare, label: 'Progress' },
  { to: '/diet', icon: Utensils, label: 'Diet' },
  { to: '/attendance', icon: QrCode, label: 'Attendance' },
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 flex-grow px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
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