import React, { useEffect, useState } from 'react';
import { Award, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, getAchievements } from '../services/AchievementService';

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';
type CategoryType = 'all' | 'streak' | 'workout' | 'strength' | 'nutrition';

const rarityColors = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    text: 'text-slate-400',
    glow: 'shadow-slate-400/20',
    border: 'border-slate-400/20'
  },
  rare: {
    gradient: 'from-blue-400 to-cyan-500',
    text: 'text-blue-400',
    glow: 'shadow-blue-400/20',
    border: 'border-blue-400/20'
  },
  epic: {
    gradient: 'from-purple-400 to-pink-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/20',
    border: 'border-purple-400/20'
  },
  legendary: {
    gradient: 'from-yellow-400 to-orange-500',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-400/20',
    border: 'border-yellow-400/20'
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

  useEffect(() => {
    const loadedAchievements = getAchievements();
    setAchievements(loadedAchievements);
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
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
    { id: 'all', name: 'All' },
    { id: 'streak', name: 'Streaks' },
    { id: 'workout', name: 'Workouts' },
    { id: 'strength', name: 'Strength' },
    { id: 'nutrition', name: 'Nutrition' }
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-4 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Achievements</h1>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Achievement Progress</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {unlockedCount} of {totalCount} achievements unlocked
              </p>
            </div>
            <div className="h-16 w-16 relative">
              <Award className="h-16 w-16 text-yellow-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-[#282828] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-yellow-500"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#282828] dark:hover:bg-[#333333]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Rarity Filter & Sort */}
          <div className="flex gap-2">
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as 'all' | RarityType)}
              className="bg-gray-100 dark:bg-[#282828] text-gray-900 dark:text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              {rarities.map(rarity => (
                <option key={rarity.id} value={rarity.id}>{rarity.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'rarity')}
              className="bg-gray-100 dark:bg-[#282828] text-gray-900 dark:text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
            >
              <option value="recent">Sort by Recent</option>
              <option value="rarity">Sort by Rarity</option>
            </select>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map(achievement => {
            const colors = getRarityColor(achievement.rarity as RarityType);
            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-6 relative overflow-hidden shadow-sm ${
                  achievement.unlocked ? `shadow-lg ${colors.glow}` : 'opacity-50'
                }`}
              >
                <div 
                  className={`absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8 
                    bg-gradient-to-r ${colors.gradient}`}
                />
                
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="text-4xl">{achievement.icon}</div>
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <span className={`text-xs ${colors.text}`}>
                        {rarityNames[achievement.rarity]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{achievement.description}</p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Unlocked {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 