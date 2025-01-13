import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { pathname } = useLocation();

  const showHeaderAndNav = pathname !== '/profile' && pathname !== '/membership' && pathname !== '/achievements';

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-900'
    }`}>
      {showHeaderAndNav && <Header />}
      <main className={`flex-1 ${showHeaderAndNav ? 'pb-24 pt-16' : ''}`}>
        <Outlet />
      </main>
      {showHeaderAndNav && <Navigation onLogout={logout} />}
    </div>
  );
}