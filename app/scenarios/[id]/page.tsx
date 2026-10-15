'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Scenario } from '@/types'
import { getScenarioById } from '@/lib/db/scenarios'
import { createAttempt } from '@/lib/db/attempts'
import { ScenarioViewer } from '@/components/scenarios/ScenarioViewer'
import { useLearningNavigation } from '@/lib/learning/nav'
import { useAuth } from '@/store/useAuth'

export default function ScenarioPage() {
  const params = useParams()
  const navigation = useLearningNavigation()
  const { user } = useAuth()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadScenario = async () => {
      const scenarioId = params.id as string
      const foundScenario = await getScenarioById(scenarioId)
      
      if (foundScenario) {
        setScenario(foundScenario)
      }
      
      setLoading(false)
    }

    loadScenario()
  }, [params.id])

  const handleComplete = async (answers: any[], score: number, timeSpent: number) => {
    if (!user || !scenario) return

    try {
      const attemptResult = await createAttempt({
        student_id: user.id,
        scenario_id: scenario.id,
        answers,
        score,
        time_spent: timeSpent
      })

      if (attemptResult) {
        console.log('Scenario completed and recorded:', attemptResult)
        
        // Show achievements if any were unlocked
        if (attemptResult.achievements_unlocked && attemptResult.achievements_unlocked.length > 0) {
          console.log('Achievements unlocked:', attemptResult.achievements_unlocked)
          // TODO: Show achievement notification
        }
      }
    } catch (error) {
      console.error('Error recording scenario completion:', error)
    }
  }

  const handleExit = () => {
    navigation.navigateToScenarioLibrary()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenario...</p>
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Scenario Not Found</h1>
          <p className="text-gray-600 mb-6">The scenario you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => navigation.navigateToScenarioLibrary()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Scenario Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <ScenarioViewer
      scenario={scenario}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
