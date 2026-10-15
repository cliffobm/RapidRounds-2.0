'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Scenario } from '@/types'
import { getScenarioById } from '@/lib/db/scenarios'
import { ScenarioViewer } from '@/components/scenarios/ScenarioViewer'
import { useLearningNavigation } from '@/lib/learning/nav'
import { 
  ArrowLeftIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  UserIcon,
  HeartIcon,
  CpuChipIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

export default function ScenarioPage() {
  const params = useParams()
  const router = useRouter()
  const navigation = useLearningNavigation()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(true)

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

  const handleComplete = (answers: any[], score: number, timeSpent: number) => {
    console.log('Scenario completed:', { answers, score, timeSpent })
    // Additional completion logic can be added here
  }

  const handleExit = () => {
    router.push('/scenario-library')
  }

  const handleStartScenario = () => {
    setShowDetails(false)
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Cardiac': <HeartIcon className="w-5 h-5" />,
      'Respiratory': <CpuChipIcon className="w-5 h-5" />,
      'Neurological': <CpuChipIcon className="w-5 h-5" />,
      'Pediatric': <UserIcon className="w-5 h-5" />,
      'Pharmacology': <BeakerIcon className="w-5 h-5" />,
      'Gastrointestinal': <BeakerIcon className="w-5 h-5" />,
      'Endocrine': <BeakerIcon className="w-5 h-5" />,
      'Integumentary': <BeakerIcon className="w-5 h-5" />,
      'Musculoskeletal': <BeakerIcon className="w-5 h-5" />,
      'Renal': <BeakerIcon className="w-5 h-5" />,
      'Hematology/Oncology': <BeakerIcon className="w-5 h-5" />,
      'Obstetrics': <UserIcon className="w-5 h-5" />,
      'Psychiatric': <CpuChipIcon className="w-5 h-5" />
    }
    return icons[category as keyof typeof icons] || <BeakerIcon className="w-5 h-5" />
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
            onClick={() => router.push('/scenario-library')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Scenario Library
          </button>
        </div>
      </div>
    )
  }

  // Show scenario viewer if user clicked start
  if (!showDetails) {
    return (
      <ScenarioViewer
        scenario={scenario}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/scenario-library')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Scenario Library
        </button>

        {/* Scenario Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{scenario.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{scenario.description}</p>
              
              {/* Tags */}
              <div className="flex items-center space-x-3 mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getCategoryIcon(scenario.category)}
                  <span className="ml-2">{scenario.category}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estimated Duration</p>
                <p className="text-xl font-bold text-gray-900">{scenario.estimated_duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-xl font-bold text-gray-900">{scenario.content.questions.length}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-xl font-bold text-gray-900">Interactive</p>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
            <ul className="space-y-2">
              {scenario.learning_objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Information Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Name:</strong> {scenario.content.patient_info.name}</p>
                    <p><strong>Age:</strong> {scenario.content.patient_info.age} years</p>
                    <p><strong>Gender:</strong> {scenario.content.patient_info.gender}</p>
                    <p><strong>Weight:</strong> {scenario.content.patient_info.weight} {scenario.content.patient_info.age < 18 ? 'kg' : 'lbs'}</p>
                    <p><strong>Height:</strong> {scenario.content.patient_info.height} {scenario.content.patient_info.age < 18 ? 'cm' : 'inches'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Medical History</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Allergies:</strong> {scenario.content.patient_info.allergies.join(', ') || 'None known'}</p>
                    <p><strong>Medications:</strong> {scenario.content.patient_info.medications.join(', ') || 'None'}</p>
                    <p><strong>History:</strong> {scenario.content.patient_info.medical_history.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.content.vital_signs.temperature}°F</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="text-xl font-bold text-gray-900">
                    {scenario.content.vital_signs.blood_pressure.systolic}/{scenario.content.vital_signs.blood_pressure.diastolic}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.content.vital_signs.heart_rate} bpm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Respiratory Rate</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.content.vital_signs.respiratory_rate} /min</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Oxygen Saturation</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.content.vital_signs.oxygen_saturation}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pain Level</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.content.vital_signs.pain_level}/10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Description</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">History</h4>
                  <p className="text-gray-700">{scenario.content.history}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Presentation</h4>
                  <p className="text-gray-700">{scenario.content.presentation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartScenario}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlayIcon className="w-6 h-6 mr-3" />
              Start Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
