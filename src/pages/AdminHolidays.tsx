import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiftIcon, Calendar, Plus, Edit, Trash2, X, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getAllHolidays, addHoliday, updateHoliday, deleteHoliday } from '../services/HolidayService';
import { Holiday } from '../types/holiday';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// List of admin user IDs
const ADMIN_IDS = [
  // Add your admin UIDs here
  'BbYkrpcPNrarNbXCCpQd1AvUaLu2' // Example admin UID
];

interface HolidayFormData {
  id?: string;
  date: string;
  title: string;
  description: string;
  isFullDay: boolean;
}

export default function AdminHolidays() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HolidayFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    description: '',
    isFullDay: true
  });
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsAdmin(ADMIN_IDS.includes(user.uid));
  }, [user, navigate]);
  
  // Load holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const holidayData = await getAllHolidays();
        setHolidays(holidayData);
      } catch (error) {
        console.error('Error loading holidays:', error);
        toast.error('Failed to load holidays');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHolidays();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      description: '',
      isFullDay: true
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentEditId(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!formData.title || !formData.date) {
        setError('Title and date are required');
        return;
      }
      
      const dateObj = new Date(formData.date);
      
      if (isEditing && currentEditId) {
        await updateHoliday(currentEditId, {
          date: Timestamp.fromDate(dateObj),
          title: formData.title,
          description: formData.description,
          isFullDay: formData.isFullDay
        });
        
        // Update local state
        setHolidays(prev => prev.map(h => 
          h.id === currentEditId 
            ? { ...h, date: Timestamp.fromDate(dateObj), title: formData.title, description: formData.description, isFullDay: formData.isFullDay } 
            : h
        ));
        
        toast.success('Holiday updated successfully');
      } else {
        const newHoliday = await addHoliday({
          date: Timestamp.fromDate(dateObj),
          title: formData.title,
          description: formData.description,
          isFullDay: formData.isFullDay
        });
        
        // Update local state
        setHolidays(prev => [...prev, newHoliday]);
        
        toast.success('Holiday added successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error('Failed to save holiday');
    }
  };
  
  // Edit a holiday
  const handleEdit = (holiday: Holiday) => {
    // Early return if no ID
    if (!holiday.id) {
      console.error('Cannot edit holiday: Missing ID');
      return;
    }

    setFormData({
      id: holiday.id,
      date: format(holiday.date.toDate(), 'yyyy-MM-dd'),
      title: holiday.title,
      description: holiday.description,
      isFullDay: holiday.isFullDay
    });
    
    setIsEditing(true);
    setCurrentEditId(holiday.id); // Now holiday.id is definitely a string
    setShowForm(true);
  };
  
  // Delete a holiday
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      await deleteHoliday(id);
      
      // Update local state
      setHolidays(prev => prev.filter(h => h.id !== id));
      
      toast.success('Holiday deleted successfully');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };
  
  // If not admin, redirect
  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Holiday Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create and manage gym holidays. Streaks will be maintained during these days.
          </p>
          
          {/* Add Holiday Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </button>
          )}
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Holiday Form */}
        {showForm && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Independence Day"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Optional description about the holiday"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFullDay"
                    name="isFullDay"
                    checked={formData.isFullDay}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFullDay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Full day holiday (gym closed all day)
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {isEditing ? 'Update Holiday' : 'Save Holiday'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Holiday List */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Holiday Schedule
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading holidays...</p>
            </div>
          ) : holidays.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No holidays have been added yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Holiday
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {holidays
                .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
                .map(holiday => (
                  <div key={holiday.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <GiftIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{holiday.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(holiday.date.toDate(), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {holiday.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{holiday.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(holiday.id!)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}