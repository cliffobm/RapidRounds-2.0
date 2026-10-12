'use client'

import { useState, useEffect } from 'react'
import { Scenario } from '@/types'
import { getScenarios, getCategories } from '@/lib/db/scenarios'
import { getRecentProgress } from '@/lib/db/progress'
import { useLearningNavigation } from '@/lib/learning/nav'
// import { useAuth } from '@/lib/auth/entitlements'
import { 
  PlayIcon, 
  ClockIcon, 
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  count: number
}

export default function ScenarioLibraryPage() {
  const navigation = useLearningNavigation()
  // const { user } = useAuth()
  const user = { id: 'mock-user-id' } // Mock user for now
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load scenarios from database
        const scenariosData = await getScenarios({ isPublished: true })
        setScenarios(scenariosData)
        
        // Load categories from database
        const categoriesData = await getCategories()
        setCategories(categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          icon: cat.icon || '📚',
          color: cat.color || '#6b7280',
          count: scenariosData.filter(s => s.category?.toLowerCase() === cat.slug).length
        })))
        
        // Load completed scenarios for current user
        if (user) {
          try {
            const progressData = await getRecentProgress(user.id, 100)
            const completedIds = new Set(progressData.map(p => p.scenario_id))
            setCompletedScenarios(completedIds)
          } catch (error) {
            console.warn('Failed to load user progress, continuing without progress data:', error)
            setCompletedScenarios(new Set())
          }
        } else {
          // No user available, set empty completed scenarios
          setCompletedScenarios(new Set())
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleStartScenario = (scenarioId: string) => {
    navigation.navigateToScenario(scenarioId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryObj = categories.find(cat => cat.slug === category.toLowerCase())
    return categoryObj ? `bg-[${categoryObj.color}20] border-[${categoryObj.color}40]` : 'bg-gray-50 border-gray-200'
  }

  // Filter scenarios based on search and filters
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = searchTerm === '' || 
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scenario.description && scenario.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      scenario.learning_objectives.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      scenario.category.toLowerCase() === selectedCategory.toLowerCase()
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
      scenario.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedDifficulty('all')
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || selectedDifficulty !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scenario Library</h1>
          <p className="text-gray-600">
            Practice your nursing skills with interactive clinical scenarios across all specialties
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlayIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scenarios</p>
                <p className="text-2xl font-bold text-gray-900">{scenarios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedScenarios.size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scenarios.length > 0 ? Math.round((completedScenarios.size / scenarios.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FunnelIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search scenarios, descriptions, or learning objectives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {[searchTerm, selectedCategory !== 'all', selectedDifficulty !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedCategory === category.slug
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.count} scenarios</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasActiveFilters ? 'Filtered Results' : 'All Scenarios'}
            <span className="text-gray-500 font-normal ml-2">({filteredScenarios.length} scenarios)</span>
          </h2>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => {
            const isCompleted = completedScenarios.has(scenario.id)
            const completion = isCompleted ? navigation.getScenarioCompletion(scenario.id) : null

            return (
              <div
                key={scenario.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                  isCompleted ? 'border-green-200' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {scenario.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(scenario.category)}`}>
                          {scenario.category}
                        </span>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {scenario.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{scenario.estimated_duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      <span>{scenario.content.questions.length} questions</span>
                    </div>
                  </div>

                  {/* Completion Score */}
                  {isCompleted && completion && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Score</span>
                        <span className="text-lg font-bold text-green-900">{completion.score}%</span>
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
                    onClick={() => handleStartScenario(scenario.id)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isCompleted ? 'Retake Scenario' : 'Start Scenario'}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No scenarios match your filters' : 'No scenarios available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your search terms or filters.' : 'Check back later for new scenarios.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
