import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-20">
      <Navigation onLogout={logout} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}