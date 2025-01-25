import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { signOut, user } = useAuth();
  const { isDarkMode } = useTheme();
  const { pathname } = useLocation();

  // Redirect to /dashboard if at root path
  if (pathname === '/' && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const showHeaderAndNav = !['/profile', '/membership', '/achievements', '/profile/edit', '/settings', '/plans'].some(path => 
    pathname === path
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
        <Navigation onLogout={signOut} />
      )}
    </div>
  );
}