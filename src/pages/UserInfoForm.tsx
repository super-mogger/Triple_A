import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function UserInfoForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'users'), {
        name,
        age,
        email,
      });
      navigate('/'); // Redirect to home page after successful submission
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h1>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
} 