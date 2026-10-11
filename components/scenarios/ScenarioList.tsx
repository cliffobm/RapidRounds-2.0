'use client'

import { useState } from 'react'
import { Scenario } from '@/types'
import { 
  ClockIcon, 
  StarIcon, 
  UserGroupIcon,
  AcademicCapIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ScenarioListProps {
  scenarios: Scenario[]
  onStartScenario: (scenario: Scenario) => void
  userProgress?: { [scenarioId: string]: { completed: boolean; score: number } }
}

export function ScenarioList({ scenarios, onStartScenario, userProgress }: ScenarioListProps) {
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesFilter = filter === 'all' || scenario.difficulty === filter
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢'
      case 'intermediate': return '🟡'
      case 'advanced': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => {
          const progress = userProgress?.[scenario.id]
          const isCompleted = progress?.completed
          const score = progress?.score

          return (
            <div
              key={scenario.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>
                  
                  {isCompleted && (
                    <CheckCircleIcon className="w-6 h-6 text-green-500 ml-2 flex-shrink-0" />
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {scenario.category}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {scenario.estimated_duration} min
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-1" />
                    {scenario.content.questions.length} questions
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 mr-1" />
                    {scenario.content.questions.reduce((sum, q) => sum + q.points, 0)} points
                  </div>
                </div>

                {/* Progress */}
                {isCompleted && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Score</span>
                      <span className="font-medium text-green-600">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Learning Objectives */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Objectives:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {scenario.learning_objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                    {scenario.learning_objectives.length > 2 && (
                      <li className="text-gray-500">
                        +{scenario.learning_objectives.length - 2} more...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onStartScenario(scenario)}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isCompleted
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  {isCompleted ? 'Review Scenario' : 'Start Scenario'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find scenarios.
          </p>
        </div>
      )}
    </div>
  )
}
