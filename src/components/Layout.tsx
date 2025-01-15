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

  const showHeaderAndNav = !['profile', 'membership', 'achievements', 'profile/edit'].some(path => 
    pathname.endsWith(path)
  );

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-900'
    }`}>
      {showHeaderAndNav && <Header />}
      <main className={`flex-1 ${showHeaderAndNav ? 'pb-24 pt-16 px-4 md:px-6 lg:px-8' : ''} max-w-7xl mx-auto w-full`}>
        <Outlet />
      </main>
      {showHeaderAndNav && (
        <div className="fixed bottom-0 left-0 right-0 pb-safe">
          <Navigation onLogout={logout} />
        </div>
      )}
    </div>
  );
}