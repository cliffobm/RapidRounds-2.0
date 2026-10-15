import { describe, it, expect, beforeEach } from 'vitest'
import { useProgress } from './useProgress'

describe('useProgress Store', () => {
  beforeEach(() => {
    // Reset store state
    useProgress.setState({
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
    })
  })

  describe('XP and Level System', () => {
    it('should initialize with default values', () => {
      const state = useProgress.getState()
      
      expect(state.xp).toBe(0)
      expect(state.level).toBe(1)
      expect(state.achievements).toEqual([])
    })

    it('should update XP and calculate level correctly', () => {
      const { setXP } = useProgress.getState()
      
      setXP(1500) // Should be level 2
      
      const state = useProgress.getState()
      expect(state.xp).toBe(1500)
      expect(state.level).toBe(2)
    })

    it('should add XP and trigger level up', () => {
      const { addXP } = useProgress.getState()
      
      addXP(500)
      expect(useProgress.getState().xp).toBe(500)
      expect(useProgress.getState().level).toBe(1)
      
      addXP(600) // Should trigger level up to 2
      expect(useProgress.getState().xp).toBe(1100)
      expect(useProgress.getState().level).toBe(2)
    })

    it('should calculate level progression correctly', () => {
      const { getCurrentLevel, getXPForNextLevel, getProgressToNextLevel } = useProgress.getState()
      
      useProgress.setState({ xp: 1500, level: 2 })
      
      expect(getCurrentLevel()).toBe(2)
      expect(getXPForNextLevel()).toBe(2000) // Level 2 * 1000
      expect(getProgressToNextLevel()).toBe(50) // 1500 is 50% to level 3
    })
  })

  describe('Achievement System', () => {
    it('should add achievements without duplicates', () => {
      const { addAchievement } = useProgress.getState()
      
      const achievement = {
        id: 'test-achievement',
        title: 'Test Achievement',
        description: 'Test description',
        icon: 'star',
        category: 'milestone' as const,
        rarity: 'common' as const,
        xp_reward: 100,
        unlocked_at: '2024-01-01'
      }
      
      addAchievement(achievement)
      expect(useProgress.getState().achievements).toHaveLength(1)
      expect(useProgress.getState().xp).toBe(100) // XP should be added
      
      // Adding same achievement again should not duplicate
      addAchievement(achievement)
      expect(useProgress.getState().achievements).toHaveLength(1)
      expect(useProgress.getState().xp).toBe(100) // XP should not be added again
    })
  })

  describe('Scenario Progress', () => {
    it('should add new scenario progress', () => {
      const { updateScenarioProgress } = useProgress.getState()
      
      const progress = {
        scenario_id: 'scenario-1',
        score: 85,
        completed_at: '2024-01-01',
        correct_count: 8,
        attempts: 1,
        time_spent: 300
      }
      
      updateScenarioProgress(progress)
      
      const state = useProgress.getState()
      expect(state.scenarioProgress).toHaveLength(1)
      expect(state.scenarioProgress[0]).toBe(progress)
      expect(state.xp).toBe(850) // 85 * 10 XP
    })

    it('should update existing scenario progress', () => {
      const { updateScenarioProgress } = useProgress.getState()
      
      const initialProgress = {
        scenario_id: 'scenario-1',
        score: 70,
        completed_at: '2024-01-01',
        correct_count: 7,
        attempts: 1,
        time_spent: 400
      }
      
      const updatedProgress = {
        scenario_id: 'scenario-1',
        score: 90,
        completed_at: '2024-01-02',
        correct_count: 9,
        attempts: 2,
        time_spent: 350
      }
      
      updateScenarioProgress(initialProgress)
      updateScenarioProgress(updatedProgress)
      
      const state = useProgress.getState()
      expect(state.scenarioProgress).toHaveLength(1)
      expect(state.scenarioProgress[0]?.score).toBe(90)
    })

    it('should calculate statistics correctly', () => {
      const { updateScenarioProgress, getTotalScenariosCompleted, getAverageScore } = useProgress.getState()
      
      // Add multiple scenario completions
      updateScenarioProgress({
        scenario_id: 'scenario-1',
        score: 80,
        completed_at: '2024-01-01',
        correct_count: 8,
        attempts: 1,
        time_spent: 300
      })
      
      updateScenarioProgress({
        scenario_id: 'scenario-2',
        score: 90,
        completed_at: '2024-01-02',
        correct_count: 9,
        attempts: 1,
        time_spent: 250
      })
      
      expect(getTotalScenariosCompleted()).toBe(2)
      expect(getAverageScore()).toBe(85) // (80 + 90) / 2
    })
  })

  describe('Bookmark Management', () => {
    it('should add bookmarks without duplicates', () => {
      const { addBookmark } = useProgress.getState()
      
      const bookmark = {
        scenario_item_id: 'item-1',
        created_at: '2024-01-01',
        scenario_title: 'Test Scenario',
        item_type: 'question'
      }
      
      addBookmark(bookmark)
      expect(useProgress.getState().bookmarks).toHaveLength(1)
      
      // Adding same bookmark should not duplicate
      addBookmark(bookmark)
      expect(useProgress.getState().bookmarks).toHaveLength(1)
    })

    it('should remove bookmarks correctly', () => {
      const { addBookmark, removeBookmark } = useProgress.getState()
      
      const bookmark1 = {
        scenario_item_id: 'item-1',
        created_at: '2024-01-01',
        scenario_title: 'Test Scenario 1',
        item_type: 'question'
      }
      
      const bookmark2 = {
        scenario_item_id: 'item-2',
        created_at: '2024-01-01',
        scenario_title: 'Test Scenario 2',
        item_type: 'question'
      }
      
      addBookmark(bookmark1)
      addBookmark(bookmark2)
      expect(useProgress.getState().bookmarks).toHaveLength(2)
      
      removeBookmark('item-1')
      expect(useProgress.getState().bookmarks).toHaveLength(1)
      expect(useProgress.getState().bookmarks[0]?.scenario_item_id).toBe('item-2')
    })
  })

  describe('Offline Cache', () => {
    it('should cache scenarios without duplicates', () => {
      const { cacheScenarioOffline } = useProgress.getState()
      
      const scenario = {
        id: 'scenario-1',
        title: 'Test Scenario',
        content: 'Test content'
      }
      
      cacheScenarioOffline(scenario)
      expect(useProgress.getState().offlineScenarios).toHaveLength(1)
      
      // Caching same scenario should not duplicate
      cacheScenarioOffline(scenario)
      expect(useProgress.getState().offlineScenarios).toHaveLength(1)
    })

    it('should clear offline cache', () => {
      const { cacheScenarioOffline, clearOfflineCache } = useProgress.getState()
      
      cacheScenarioOffline({ id: 'scenario-1', title: 'Test' })
      cacheScenarioOffline({ id: 'scenario-2', title: 'Test 2' })
      
      expect(useProgress.getState().offlineScenarios).toHaveLength(2)
      
      clearOfflineCache()
      
      expect(useProgress.getState().offlineScenarios).toHaveLength(0)
      expect(useProgress.getState().lastSyncAt).toBeNull()
    })
  })
})


