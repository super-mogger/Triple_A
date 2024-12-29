import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUserDetails } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserDetails({ displayName: name });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
        {user ? (
          <div>
            <img
              src={user.photoURL || 'default-profile.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4"
            />
            <form onSubmit={handleUpdate} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${isEditing ? '' : 'bg-gray-100 cursor-not-allowed'}`}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              {isEditing ? (
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit
                </button>
              )}
            </form>
          </div>
        ) : (
          <p>No user information available.</p>
        )}
        <div className="mt-6">
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 