'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'scenario' | 'streak' | 'achievement' | 'social'
  earnedAt: string
  points: number
}

export interface GamificationState {
  // Core stats
  points: number
  totalScenariosCompleted: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  
  // Badges
  badges: Badge[]
  
  // Actions
  addPoints: (points: number) => void
  awardBadge: (badge: Omit<Badge, 'earnedAt'>) => void
  tickStreak: () => void
  completeScenario: (points: number) => void
  resetProgress: () => void
  
  // Getters
  getTotalPoints: () => number
  getBadgeCount: () => number
  getStreakStatus: () => { current: number; longest: number; isActive: boolean }
  getRecentBadges: (limit?: number) => Badge[]
}

// Predefined badges
const PREDEFINED_BADGES = {
  first_scenario: {
    id: 'first_scenario',
    name: 'First Steps',
    description: 'Complete your first scenario',
    icon: '🎯',
    category: 'scenario' as const,
    points: 50,
  },
  scenario_master: {
    id: 'scenario_master',
    name: 'Scenario Master',
    description: 'Complete 10 scenarios',
    icon: '🏆',
    category: 'scenario' as const,
    points: 200,
  },
  streak_3: {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak' as const,
    points: 100,
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak' as const,
    points: 300,
  },
  streak_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🌟',
    category: 'streak' as const,
    points: 1000,
  },
  high_scorer: {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Achieve 90% average score',
    icon: '⭐',
    category: 'achievement' as const,
    points: 250,
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieve a perfect 100% score',
    icon: '💯',
    category: 'achievement' as const,
    points: 150,
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a scenario before 8 AM',
    icon: '🐦',
    category: 'achievement' as const,
    points: 75,
  },
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a scenario after 10 PM',
    icon: '🦉',
    category: 'achievement' as const,
    points: 75,
  },
}

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      points: 0,
      totalScenariosCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      badges: [],

      // Actions
      addPoints: (points: number) => {
        set((state) => ({
          points: state.points + points,
        }))
      },

      awardBadge: (badge: Omit<Badge, 'earnedAt'>) => {
        set((state) => {
          // Check if badge already exists
          const existingBadge = state.badges.find(b => b.id === badge.id)
          if (existingBadge) return state

          const newBadge: Badge = {
            ...badge,
            earnedAt: new Date().toISOString(),
          }

          return {
            badges: [...state.badges, newBadge],
            points: state.points + badge.points,
          }
        })
      },

      tickStreak: () => {
        set((state) => {
          const today = new Date().toDateString()
          const lastActivity = state.lastActivityDate ? new Date(state.lastActivityDate).toDateString() : null
          
          let newStreak = state.currentStreak
          
          if (lastActivity === today) {
            // Already ticked today
            return state
          } else if (lastActivity === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
            // Consecutive day
            newStreak = state.currentStreak + 1
          } else {
            // Streak broken or first time
            newStreak = 1
          }

          const newLongestStreak = Math.max(state.longestStreak, newStreak)

          return {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: new Date().toISOString(),
          }
        })

        // Check for streak badges
        const { currentStreak } = get()
        if (currentStreak === 3) {
          get().awardBadge(PREDEFINED_BADGES.streak_3)
        } else if (currentStreak === 7) {
          get().awardBadge(PREDEFINED_BADGES.streak_7)
        } else if (currentStreak === 30) {
          get().awardBadge(PREDEFINED_BADGES.streak_30)
        }
      },

      completeScenario: (points: number) => {
        set((state) => ({
          totalScenariosCompleted: state.totalScenariosCompleted + 1,
          points: state.points + points,
        }))

        // Check for scenario badges
        const { totalScenariosCompleted } = get()
        if (totalScenariosCompleted === 1) {
          get().awardBadge(PREDEFINED_BADGES.first_scenario)
        } else if (totalScenariosCompleted === 10) {
          get().awardBadge(PREDEFINED_BADGES.scenario_master)
        }

        // Tick streak
        get().tickStreak()
      },

      resetProgress: () => {
        set({
          points: 0,
          totalScenariosCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          badges: [],
        })
      },

      // Getters
      getTotalPoints: () => get().points,
      getBadgeCount: () => get().badges.length,
      getStreakStatus: () => {
        const state = get()
        const today = new Date().toDateString()
        const lastActivity = state.lastActivityDate ? new Date(state.lastActivityDate).toDateString() : null
        const isActive = lastActivity === today || lastActivity === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
        
        return {
          current: state.currentStreak,
          longest: state.longestStreak,
          isActive,
        }
      },
      getRecentBadges: (limit = 5) => {
        return get().badges
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, limit)
      },
    }),
    {
      name: 'rapidrounds-gamification',
      version: 1,
    }
  )
)

// Helper functions for common badge checks
export const checkTimeBasedBadges = (gamificationStore: any) => {
  const hour = new Date().getHours()
  
  if (hour < 8) {
    gamificationStore.getState().awardBadge(PREDEFINED_BADGES.early_bird)
  } else if (hour >= 22) {
    gamificationStore.getState().awardBadge(PREDEFINED_BADGES.night_owl)
  }
}

export const checkScoreBadges = (score: number, gamificationStore: any) => {
  if (score === 100) {
    gamificationStore.getState().awardBadge(PREDEFINED_BADGES.perfect_score)
  } else if (score >= 90) {
    gamificationStore.getState().awardBadge(PREDEFINED_BADGES.high_scorer)
  }
}

