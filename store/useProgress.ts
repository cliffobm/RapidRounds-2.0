import { LEGACY_DATABASE_ENABLED } from '@/lib/env'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabaseClient as supabase } from '@/lib/supabase-client'

export interface ScenarioProgress {
  scenario_id: string
  score: number
  completed_at: string
  correct_count: number
  attempts: number
  time_spent: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'performance' | 'consistency' | 'learning' | 'social' | 'milestone'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  xp_reward: number
  unlocked_at: string
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity: string
  weekly_goal: number
  weekly_progress: number
}

export interface BookmarkedItem {
  scenario_item_id: string
  created_at: string
  scenario_title: string
  item_type: string
}

interface ProgressState {
  // Progress data
  xp: number
  level: number
  streakData: StreakData | null
  achievements: Achievement[]
  scenarioProgress: ScenarioProgress[]
  bookmarks: BookmarkedItem[]

  // Offline cache
  offlineScenarios: any[]
  lastSyncAt: string | null

  // Loading states
  loading: boolean
  syncing: boolean

  // Actions
  setXP: (xp: number) => void
  addXP: (amount: number) => void
  setStreakData: (data: StreakData) => void
  addAchievement: (achievement: Achievement) => void
  updateScenarioProgress: (progress: ScenarioProgress) => void
  addBookmark: (bookmark: BookmarkedItem) => void
  removeBookmark: (scenarioItemId: string) => void

  // Sync methods
  syncToServer: () => Promise<void>
  syncFromServer: () => Promise<void>
  cacheScenarioOffline: (scenario: any) => void
  clearOfflineCache: () => void

  // Computed getters
  getCurrentLevel: () => number
  getXPForNextLevel: () => number
  getProgressToNextLevel: () => number
  getTotalScenariosCompleted: () => number
  getAverageScore: () => number
}

// XP calculation helpers
const XP_PER_LEVEL = 1000
const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1
const calculateXPForNextLevel = (level: number) => level * XP_PER_LEVEL
const calculateProgressToNextLevel = (xp: number, level: number) => {
  const currentLevelXP = (level - 1) * XP_PER_LEVEL
  const nextLevelXP = level * XP_PER_LEVEL
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      xp: 0,
      level: 1,
      streakData: null,
      achievements: [],
      scenarioProgress: [],
      bookmarks: [],
      offlineScenarios: [],
      lastSyncAt: null,
      loading: false,
      syncing: false,

      // Basic setters
      setXP: (xp) => {
        const level = calculateLevel(xp)
        set({ xp, level })
      },

      addXP: (amount) => {
        const { xp } = get()
        const newXP = xp + amount
        const newLevel = calculateLevel(newXP)
        const oldLevel = get().level

        set({ xp: newXP, level: newLevel })

        // Check for level up achievement
        if (newLevel > oldLevel) {
          // TODO: Trigger level up celebration
          console.log(`Level up! Now level ${newLevel}`)
        }
      },

      setStreakData: (data) => set({ streakData: data }),

      addAchievement: (achievement) => {
        const { achievements } = get()
        if (!achievements.find((a) => a.id === achievement.id)) {
          set({ achievements: [...achievements, achievement] })
          get().addXP(achievement.xp_reward)
        }
      },

      updateScenarioProgress: (progress) => {
        const { scenarioProgress } = get()
        const existingIndex = scenarioProgress.findIndex(
          (p) => p.scenario_id === progress.scenario_id
        )

        if (existingIndex >= 0) {
          // Update existing progress
          const updated = [...scenarioProgress]
          updated[existingIndex] = progress
          set({ scenarioProgress: updated })
        } else {
          // Add new progress
          set({ scenarioProgress: [...scenarioProgress, progress] })
        }

        // Add XP for completion
        get().addXP(progress.score * 10) // 10 XP per percentage point
      },

      addBookmark: (bookmark) => {
        const { bookmarks } = get()
        if (
          !bookmarks.find(
            (b) => b.scenario_item_id === bookmark.scenario_item_id
          )
        ) {
          set({ bookmarks: [...bookmarks, bookmark] })
        }
      },

      removeBookmark: (scenarioItemId) => {
        const { bookmarks } = get()
        set({
          bookmarks: bookmarks.filter(
            (b) => b.scenario_item_id !== scenarioItemId
          ),
        })
      },

      // Sync methods
      syncToServer: async () => {
        if (!LEGACY_DATABASE_ENABLED) return
        const state = get()
        // Get user from auth store
        const { user } = await import('./useAuth').then((m) =>
          m.useAuth.getState()
        )
        if (!user) return

        try {
          set({ syncing: true })

          // Sync progress
          for (const progress of state.scenarioProgress) {
            await supabase.from('progress').upsert({
              user_id: user.id,
              ...progress,
            })
          }

          // Sync bookmarks
          for (const bookmark of state.bookmarks) {
            await supabase.from('bookmarks').upsert({
              user_id: user.id,
              ...bookmark,
            })
          }

          set({ lastSyncAt: new Date().toISOString() })
        } catch (error) {
          console.error('Sync to server failed:', error)
        } finally {
          set({ syncing: false })
        }
      },

      syncFromServer: async () => {
        if (!LEGACY_DATABASE_ENABLED) return
        // TODO: Implement server sync
        try {
          set({ syncing: true })

          // Fetch progress from server
          // Fetch bookmarks from server
          // Merge with local data
        } catch (error) {
          console.error('Sync from server failed:', error)
        } finally {
          set({ syncing: false })
        }
      },

      cacheScenarioOffline: (scenario) => {
        const { offlineScenarios } = get()
        const exists = offlineScenarios.find((s) => s.id === scenario.id)

        if (!exists) {
          set({ offlineScenarios: [...offlineScenarios, scenario] })
        }
      },

      clearOfflineCache: () => {
        set({ offlineScenarios: [], lastSyncAt: null })
      },

      // Computed getters
      getCurrentLevel: () => get().level,

      getXPForNextLevel: () => {
        const { level } = get()
        return calculateXPForNextLevel(level)
      },

      getProgressToNextLevel: () => {
        const { xp, level } = get()
        return calculateProgressToNextLevel(xp, level)
      },

      getTotalScenariosCompleted: () => {
        return get().scenarioProgress.length
      },

      getAverageScore: () => {
        const { scenarioProgress } = get()
        if (scenarioProgress.length === 0) return 0

        const totalScore = scenarioProgress.reduce((sum, p) => sum + p.score, 0)
        return Math.round(totalScore / scenarioProgress.length)
      },
    }),
    {
      name: 'progress-storage',
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        achievements: state.achievements,
        scenarioProgress: state.scenarioProgress,
        bookmarks: state.bookmarks,
        offlineScenarios: state.offlineScenarios,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
)
