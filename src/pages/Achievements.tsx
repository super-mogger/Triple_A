import React, { useEffect, useState } from 'react';
import { Award, ChevronLeft, Lock, Filter, Search, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, getAchievements } from '../services/AchievementService';

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';
type CategoryType = 'all' | 'streak' | 'workout' | 'strength' | 'nutrition' | 'attendance';

const rarityColors = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    text: 'text-slate-400',
    glow: 'shadow-slate-400/30',
    border: 'border-slate-400/20',
    bg: 'bg-slate-100 dark:bg-slate-800/30'
  },
  rare: {
    gradient: 'from-blue-400 to-cyan-500',
    text: 'text-blue-400',
    glow: 'shadow-blue-400/30',
    border: 'border-blue-400/20',
    bg: 'bg-blue-50 dark:bg-blue-900/10'
  },
  epic: {
    gradient: 'from-purple-400 to-pink-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/30',
    border: 'border-purple-400/20',
    bg: 'bg-purple-50 dark:bg-purple-900/10'
  },
  legendary: {
    gradient: 'from-yellow-400 to-orange-500',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-400/30',
    border: 'border-yellow-400/20',
    bg: 'bg-yellow-50 dark:bg-amber-900/10'
  }
} as const;

const getRarityColor = (rarity: RarityType) => {
  return rarityColors[rarity] || rarityColors.common;
};

const rarityNames = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | RarityType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadedAchievements = getAchievements();
    setAchievements(loadedAchievements);
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    const searchMatch = !searchTerm || 
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && rarityMatch && searchMatch;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === 'recent') {
      if (!a.unlocked && !b.unlocked) return 0;
      if (!a.unlocked) return 1;
      if (!b.unlocked) return -1;
      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
    } else {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
    }
  });

  const categories = [
    { id: 'all', name: 'All', icon: <Award size={16} /> },
    { id: 'streak', name: 'Streaks', icon: <TrendingUp size={16} /> },
    { id: 'workout', name: 'Workouts', icon: '💪' },
    { id: 'strength', name: 'Strength', icon: '🏋️‍♂️' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'attendance', name: 'Attendance', icon: <Calendar size={16} /> }
  ] as const;

  const rarities = [
    { id: 'all', name: 'All Rarities' },
    { id: 'legendary', name: 'Legendary' },
    { id: 'epic', name: 'Epic' },
    { id: 'rare', name: 'Rare' },
    { id: 'common', name: 'Common' }
  ] as const;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  // Group achievements by rarity for a better visual organization
  const achievementsByRarity = sortedAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.rarity]) {
      acc[achievement.rarity] = [];
    }
    acc[achievement.rarity].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white">
      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Achievements</h1>
          </motion.div>
          
          {/* Enhanced Progress Overview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">Your Trophy Cabinet</h2>
                <p className="text-white/80">
                  You've unlocked <span className="font-bold text-white">{unlockedCount}</span> of <span className="font-bold text-white">{totalCount}</span> achievements
                </p>
              </div>
              <div className="h-20 w-20 relative">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/80">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
                <span>Master</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'rarity')}
              className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <option value="recent">Recently Unlocked</option>
              <option value="rarity">Sort by Rarity</option>
            </select>
          </div>

          {/* Expandable Filter Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="p-4 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                  <h3 className="text-lg font-medium mb-3">Categories</h3>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#282828] dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mt-4 mb-3">Rarity</h3>
                  <div className="flex gap-2 flex-wrap">
                    {rarities.map(rarity => (
                      <button
                        key={rarity.id}
                        onClick={() => setSelectedRarity(rarity.id as 'all' | RarityType)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedRarity === rarity.id
                            ? rarity.id !== 'all'
                              ? `bg-gradient-to-r ${rarityColors[rarity.id as RarityType].gradient} text-white`
                              : 'bg-gray-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#282828] dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {rarity.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* No Results Message */}
        {sortedAchievements.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Award size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium mb-2">No achievements found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search term
            </p>
          </motion.div>
        )}

        {/* Achievements By Rarity (When not filtering) */}
        {sortBy === 'rarity' && !searchTerm && selectedCategory === 'all' && selectedRarity === 'all' && (
          <div className="space-y-8">
            {['legendary', 'epic', 'rare', 'common'].map(rarity => {
              const rarityAchievements = achievementsByRarity[rarity] || [];
              if (rarityAchievements.length === 0) return null;
              
              const colors = getRarityColor(rarity as RarityType);
              
              return (
                <div key={rarity} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${colors.gradient}`}></div>
                    <h2 className={`text-xl font-bold ${colors.text}`}>
                      {rarityNames[rarity as RarityType]} Achievements
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rarityAchievements.map(renderAchievementCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Achievements Grid (When filtering) */}
        {(sortBy !== 'rarity' || searchTerm || selectedCategory !== 'all' || selectedRarity !== 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedAchievements.map(renderAchievementCard)}
          </div>
        )}
      </div>
    </div>
  );
  
  function renderAchievementCard(achievement: Achievement) {
    const colors = getRarityColor(achievement.rarity as RarityType);
    
    return (
      <motion.div
        key={achievement.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className={`relative overflow-hidden rounded-xl transition-all duration-300
          ${achievement.unlocked 
            ? `bg-white dark:bg-[#1E1E1E] border-2 ${colors.border} shadow-lg ${colors.glow}` 
            : 'bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800'}`
        }
      >
        {/* Rarity indicator */}
        <div 
          className={`absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8 
            bg-gradient-to-r ${colors.gradient}`}
        />
        
        {/* Achievement icon/banner at the top */}
        <div className={`p-4 ${colors.bg} relative overflow-hidden`}>
          <div className="flex justify-between items-start">
            <div className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl bg-white dark:bg-gray-800 rounded-full shadow-md">
              {achievement.icon}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            
            <span className={`z-10 px-3 py-1 rounded-full text-xs font-medium ${colors.text} bg-white/50 dark:bg-black/30 backdrop-blur-sm`}>
              {rarityNames[achievement.rarity]}
            </span>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute right-0 bottom-0 w-24 h-24 opacity-10">
            <Award className="w-full h-full" />
          </div>
        </div>
        
        {/* Achievement details */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {achievement.description}
          </p>
          
          {achievement.unlocked && achievement.date ? (
            <div className="flex items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                Unlocked on {new Date(achievement.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          ) : (
            <div className="flex items-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                Not yet unlocked
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
} 