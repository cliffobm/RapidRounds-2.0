'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LazyCard } from '@/components/ui/LazyLoad'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { staggerContainer, cardVariants } from '@/lib/animations'
import { keyboardHandlers } from '@/lib/accessibility'
import { 
  Heart, 
  Wind, // Using Wind instead of Lungs
  Brain, 
  Bone, 
  Droplets, // Using Droplets instead of Kidney
  Eye,
  Stethoscope,
  Activity,
  Clock
} from 'lucide-react'

const categories = [
  {
    id: 'cardiac',
    title: 'Cardiac Assessment',
    description: 'Heart conditions, ECG interpretation, cardiac emergencies',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    scenarios: 12,
    difficulty: 'Intermediate',
    estimatedTime: '45 min'
  },
  {
    id: 'respiratory',
    title: 'Respiratory System',
    description: 'Breathing disorders, oxygen therapy, ventilation',
    icon: Wind,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    scenarios: 8,
    difficulty: 'Beginner',
    estimatedTime: '30 min'
  },
  {
    id: 'neurological',
    title: 'Neurological Assessment',
    description: 'Stroke protocols, consciousness levels, neurological exams',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    scenarios: 10,
    difficulty: 'Advanced',
    estimatedTime: '60 min'
  },
  {
    id: 'musculoskeletal',
    title: 'Musculoskeletal',
    description: 'Fractures, mobility, pain management, rehabilitation',
    icon: Bone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    scenarios: 6,
    difficulty: 'Intermediate',
    estimatedTime: '35 min'
  },
  {
    id: 'renal',
    title: 'Renal & Genitourinary',
    description: 'Kidney function, fluid balance, urinary disorders',
    icon: Droplets,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    scenarios: 7,
    difficulty: 'Intermediate',
    estimatedTime: '40 min'
  },
  {
    id: 'integumentary',
    title: 'Skin & Wound Care',
    description: 'Wound assessment, pressure ulcers, skin conditions',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    scenarios: 9,
    difficulty: 'Beginner',
    estimatedTime: '25 min'
  }
]

export default function TestPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success'
      case 'Intermediate': return 'warning'
      case 'Advanced': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <PageWrapper
      title="Testing Categories"
      description="Choose a category to start practicing clinical scenarios"
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <div>

            <p className="text-slate-700 dark:text-slate-200">
              Choose a category to start practicing clinical scenarios
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>52 Total Scenarios</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>~4 hours total</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <LazyCard key={category.id} delay={0}>
              <motion.div
                variants={cardVariants}
                custom={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
                  role="button"
                  tabIndex={0}
                  aria-label={`Start ${category.title} testing. ${category.scenarios} scenarios available. Difficulty: ${category.difficulty}. Estimated time: ${category.estimatedTime}`}
                  onClick={() => window.location.href = `/test/${category.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      window.location.href = `/test/${category.id}`
                    }
                  }}
                >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${category.bgColor}`}>
                    <Icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <Badge variant={getDifficultyColor(category.difficulty) as any}>
                    {category.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary-700 dark:group-hover:text-primary-600 transition-colors">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200 mb-4">
                  <span>{category.scenarios} scenarios</span>
                  <span>{category.estimatedTime}</span>
                </div>
                
                <div className="w-full bg-primary-700 text-white text-center py-3 px-4 rounded-2xl font-medium hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 transition-colors">
                  Start Testing
                </div>
              </CardContent>
                </Card>
              </motion.div>
            </LazyCard>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Ready for a Challenge?
            </h3>
            <p className="text-slate-700 dark:text-slate-200">
              Try our adaptive testing mode that adjusts difficulty based on your performance.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/test/mixed-practice'}
            >
              Mixed Practice
            </Button>
            <Button 
              variant="primary"
              onClick={() => window.location.href = '/test/adaptive'}
            >
              Adaptive Test
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
