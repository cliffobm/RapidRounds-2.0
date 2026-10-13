'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Star,
  Users,
  TrendingUp,
  Award
} from 'lucide-react'

const studyMaterials = [
  {
    id: 'cardiac-fundamentals',
    title: 'Cardiac Assessment Fundamentals',
    description: 'Learn the basics of cardiac assessment, ECG interpretation, and emergency protocols',
    type: 'Lesson Series',
    duration: '45 min',
    lessons: 6,
    progress: 75,
    difficulty: 'Beginner',
    featured: true
  },
  {
    id: 'respiratory-care',
    title: 'Respiratory Care Essentials',
    description: 'Master respiratory assessment, oxygen therapy, and ventilator management',
    type: 'Interactive Module',
    duration: '60 min',
    lessons: 8,
    progress: 30,
    difficulty: 'Intermediate',
    featured: false
  },
  {
    id: 'medication-safety',
    title: 'Medication Administration Safety',
    description: 'Critical safety protocols for medication administration and error prevention',
    type: 'Case Studies',
    duration: '35 min',
    lessons: 5,
    progress: 100,
    difficulty: 'Advanced',
    featured: false
  },
  {
    id: 'wound-care',
    title: 'Advanced Wound Care',
    description: 'Comprehensive wound assessment, treatment planning, and healing promotion',
    type: 'Practical Guide',
    duration: '50 min',
    lessons: 7,
    progress: 0,
    difficulty: 'Intermediate',
    featured: true
  }
]

const quickAccess = [
  {
    id: 'drug-reference',
    title: 'Drug Reference',
    description: 'Quick lookup for medications, dosages, and interactions',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'lab-values',
    title: 'Lab Values Guide',
    description: 'Normal ranges and interpretation guidelines',
    icon: TrendingUp,
    color: 'bg-green-500'
  },
  {
    id: 'protocols',
    title: 'Emergency Protocols',
    description: 'Step-by-step emergency response procedures',
    icon: Award,
    color: 'bg-red-500'
  },
  {
    id: 'calculators',
    title: 'Medical Calculators',
    description: 'Dosage, IV rate, and other medical calculations',
    icon: Star,
    color: 'bg-purple-500'
  }
]

export default function StudyPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success'
      case 'Intermediate': return 'warning'
      case 'Advanced': return 'danger'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lesson Series': return 'bg-blue-100 text-blue-800'
      case 'Interactive Module': return 'bg-purple-100 text-purple-800'
      case 'Case Studies': return 'bg-orange-100 text-orange-800'
      case 'Practical Guide': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <p role="status" className="mb-4 text-sm text-slate-600">Some progress is sample data. Lesson completion applies only to this visit.</p>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Study Materials
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Interactive lessons and resources to enhance your clinical knowledge
            </p>
          </div>
        </div>
        
        {/* Study Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-primary" />
              <span className="text-sm text-slate-600 dark:text-slate-400">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-warning" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Study Time</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24h</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Rank</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">#15</p>
          </div>
        </div>
      </div>

      {/* Featured Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Featured Study Materials
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studyMaterials.filter(item => item.featured && ['cardiac-fundamentals', 'wound-care'].includes(item.id)).map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                  <Badge variant={getDifficultyColor(item.difficulty) as any}>
                    {item.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.duration}</span>
                    </span>
                    <span>{item.lessons} lessons</span>
                  </div>
                  <ProgressRing 
                    progress={item.progress} 
                    size={60} 
                    strokeWidth={4}
                    showLabel={false}
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = `/study/${item.id}`}
                >
                  {item.progress > 0 ? 'Continue' : 'Start'} Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Study Materials */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          All Study Materials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyMaterials.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <ProgressRing 
                    progress={item.progress} 
                    size={50} 
                    strokeWidth={3}
                    showLabel={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <Badge size="sm" className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span>{item.duration}</span>
                        <span>{item.lessons} lessons</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={!['cardiac-fundamentals', 'wound-care'].includes(item.id)}
                        onClick={() => window.location.href = `/study/${item.id}`}
                      >
                        {['cardiac-fundamentals', 'wound-care'].includes(item.id) ? (item.progress > 0 ? 'Continue' : 'Start') : 'Coming soon'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Tools */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Quick Reference Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccess.map((tool) => {
            const Icon = tool.icon
            const getToolPath = (toolId: string) => {
              switch (toolId) {
                case 'drug-reference': return '/reference/drug-reference'
                case 'lab-values': return '/reference/lab-values'
                case 'protocols': return '/reference/emergency-protocols'
                case 'calculators': return '/reference/calculators'
                default: return '/study'
              }
            }
            return (
              <Card 
                key={tool.id} 
                className="hover:shadow-md transition-all duration-200 cursor-pointer"
                role="button" tabIndex={0} aria-label={`Open ${tool.title}`}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.href = getToolPath(tool.id) } }}
                onClick={() => window.location.href = getToolPath(tool.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${tool.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
