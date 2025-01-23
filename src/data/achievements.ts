interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: 'streak' | 'workout' | 'strength' | 'nutrition' | 'attendance';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const defaultAchievements: Achievement[] = [
  // Attendance Achievements
  {
    id: 'first-attendance',
    title: 'First Check-in',
    description: 'Mark your first attendance at the gym',
    icon: '📍',
    unlocked: false,
    category: 'attendance',
    rarity: 'common'
  },
  {
    id: 'week-regular',
    title: 'Regular Member',
    description: 'Attend the gym for 7 days',
    icon: '📅',
    unlocked: false,
    category: 'attendance',
    rarity: 'common'
  },
  {
    id: 'gym-enthusiast',
    title: 'Gym Enthusiast',
    description: 'Attend the gym for 21 days',
    icon: '🏋️‍♂️',
    unlocked: false,
    category: 'attendance',
    rarity: 'rare'
  },
  {
    id: 'monthly-dedication',
    title: 'Monthly Dedication',
    description: 'Complete 30 days of gym attendance',
    icon: '🎯',
    unlocked: false,
    category: 'attendance',
    rarity: 'epic'
  },
  {
    id: 'fitness-warrior',
    title: 'Fitness Warrior',
    description: 'Reach 50 days of gym attendance',
    icon: '⚔️',
    unlocked: false,
    category: 'attendance',
    rarity: 'epic'
  },
  {
    id: 'gym-legend',
    title: 'Gym Legend',
    description: 'Achieve 100 days of gym attendance',
    icon: '👑',
    unlocked: false,
    category: 'attendance',
    rarity: 'legendary'
  },

  // Attendance Streak Achievements
  {
    id: 'streak-first-attendance',
    title: 'Streak Starter',
    description: 'Start your first attendance streak',
    icon: '🔥',
    unlocked: false,
    category: 'attendance',
    rarity: 'common'
  },
  {
    id: 'streak-week-regular',
    title: 'Week Warrior',
    description: 'Maintain a 7-day attendance streak',
    icon: '🔥',
    unlocked: false,
    category: 'attendance',
    rarity: 'rare'
  },
  {
    id: 'streak-gym-enthusiast',
    title: 'Streak Enthusiast',
    description: 'Maintain a 21-day attendance streak',
    icon: '🔥',
    unlocked: false,
    category: 'attendance',
    rarity: 'epic'
  },
  {
    id: 'streak-monthly-dedication',
    title: 'Dedication Master',
    description: 'Maintain a 30-day attendance streak',
    icon: '🔥',
    unlocked: false,
    category: 'attendance',
    rarity: 'legendary'
  },

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