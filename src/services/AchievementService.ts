import { defaultAchievements } from '../data/achievements';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: 'streak' | 'workout' | 'strength' | 'nutrition';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Get achievements from localStorage or return defaults
export const getAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem('achievements');
    if (!saved) {
      localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
      return defaultAchievements;
    }
    
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
      return defaultAchievements;
    }
    
    // Ensure all achievements exist (in case new ones were added)
    const existingIds = new Set(parsed.map((a: Achievement) => a.id));
    const missingAchievements = defaultAchievements.filter(a => !existingIds.has(a.id));
    if (missingAchievements.length > 0) {
      const updatedAchievements = [...parsed, ...missingAchievements];
      localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
      return updatedAchievements;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading achievements:', error);
    localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
    return defaultAchievements;
  }
};

// Update a specific achievement
export const updateAchievement = (achievementId: string, unlocked: boolean = true) => {
  const achievements = getAchievements();
  let achievementUnlocked = false;

  const updatedAchievements = achievements.map(achievement => {
    if (achievement.id === achievementId && !achievement.unlocked && unlocked) {
      achievementUnlocked = true;
      return {
        ...achievement,
        unlocked,
        date: new Date().toISOString()
      };
    }
    return achievement;
  });
  
  localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
  return { achievements: updatedAchievements, unlocked: achievementUnlocked };
};

// Check and update streak achievements
export const checkStreakAchievements = (streakCount: number) => {
  const streakMilestones = {
    'streak-1': 1,
    'streak-7': 7,
    'streak-30': 30,
    'streak-100': 100
  };

  let updated = false;
  let achievements = getAchievements();

  Object.entries(streakMilestones).forEach(([id, milestone]) => {
    if (streakCount >= milestone) {
      const result = updateAchievement(id);
      achievements = result.achievements;
      if (result.unlocked) {
        updated = true;
      }
    }
  });

  return { achievements, updated };
};

// Check and update workout achievements
export const checkWorkoutAchievements = (workoutCount: number) => {
  const workoutMilestones = {
    'workout-first': 1,
    'workout-10': 10,
    'workout-50': 50
  };

  let updated = false;
  let achievements = getAchievements();

  Object.entries(workoutMilestones).forEach(([id, milestone]) => {
    if (workoutCount >= milestone) {
      const result = updateAchievement(id);
      achievements = result.achievements;
      if (result.unlocked) {
        updated = true;
      }
    }
  });

  return { achievements, updated };
};

// Reset achievements to default state
export const resetAchievements = () => {
  localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
  return defaultAchievements;
}; 