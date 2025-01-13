interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: 'streak' | 'workout' | 'strength' | 'nutrition';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const defaultAchievements: Achievement[] = [
  // Streak Achievements
  {
    id: 'streak-1',
    title: 'First Step',
    description: 'Complete your first day',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    rarity: 'common'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    rarity: 'rare'
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    rarity: 'epic'
  },
  {
    id: 'streak-100',
    title: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    rarity: 'legendary'
  },

  // Workout Achievements
  {
    id: 'workout-first',
    title: 'First Workout',
    description: 'Complete your first workout',
    icon: '💪',
    unlocked: false,
    category: 'workout',
    rarity: 'common'
  },
  {
    id: 'workout-10',
    title: 'Dedicated Athlete',
    description: 'Complete 10 workouts',
    icon: '💪',
    unlocked: false,
    category: 'workout',
    rarity: 'rare'
  },
  {
    id: 'workout-50',
    title: 'Fitness Enthusiast',
    description: 'Complete 50 workouts',
    icon: '💪',
    unlocked: false,
    category: 'workout',
    rarity: 'epic'
  },

  // Strength Achievements
  {
    id: 'strength-pr',
    title: 'Personal Best',
    description: 'Set your first personal record',
    icon: '🏋️‍♂️',
    unlocked: false,
    category: 'strength',
    rarity: 'common'
  },
  {
    id: 'strength-milestone',
    title: 'Strength Milestone',
    description: 'Reach a major strength goal',
    icon: '🏋️‍♂️',
    unlocked: false,
    category: 'strength',
    rarity: 'epic'
  },

  // Nutrition Achievements
  {
    id: 'nutrition-track',
    title: 'Nutrition Tracker',
    description: 'Track your meals for a week',
    icon: '🥗',
    unlocked: false,
    category: 'nutrition',
    rarity: 'common'
  },
  {
    id: 'nutrition-goals',
    title: 'Nutrition Master',
    description: 'Meet your nutrition goals for a month',
    icon: '🥗',
    unlocked: false,
    category: 'nutrition',
    rarity: 'epic'
  }
]; 