'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { BadgeGallery, Achievement } from '@/components/gamification/BadgeGallery'
import { StreakMeter, StreakData } from '@/components/gamification/StreakMeter'
import { useAuth } from '@/store/useAuth'
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Settings, 
  Crown, 
  Star, 
  Trophy, 
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Brain,
  Shield,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Building,
  CreditCard,
  Gift
} from 'lucide-react'

// Mock profile data
const mockProfile = {
  id: 'user-123',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  avatar: null,
  institution: 'Metro Health University',
  program: 'Bachelor of Science in Nursing',
  year: 'Junior (3rd Year)',
  credentials: ['BLS Certified', 'ACLS Pending'],
  specialtyInterests: ['Critical Care', 'Emergency Medicine', 'Pediatrics'],
  subscriptionTier: 'premium',
  joinedDate: new Date('2024-01-15'),
  location: 'Chicago, IL',
  phone: '+1 (555) 123-4567',
  emergencyContact: 'Sarah Johnson - Mother'
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  {
    id: 'first-scenario',
    title: 'First Steps',
    description: 'Completed your first scenario',
    icon: 'star',
    category: 'milestone',
    rarity: 'common',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-16'),
    requirements: ['Complete 1 scenario'],
    xpReward: 50
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    icon: 'flame',
    category: 'consistency',
    rarity: 'rare',
    isUnlocked: true,
    unlockedAt: new Date('2024-02-01'),
    requirements: ['Study for 7 consecutive days'],
    xpReward: 200
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Achieved 100% on a scenario',
    icon: 'trophy',
    category: 'performance',
    rarity: 'uncommon',
    isUnlocked: true,
    unlockedAt: new Date('2024-02-10'),
    requirements: ['Score 100% on any scenario'],
    xpReward: 150
  },
  {
    id: 'cardiac-master',
    title: 'Cardiac Master',
    description: 'Complete all cardiac scenarios',
    icon: 'heart',
    category: 'learning',
    rarity: 'epic',
    isUnlocked: false,
    progress: { current: 8, total: 12 },
    requirements: ['Complete all 12 cardiac scenarios'],
    xpReward: 500
  }
]

// Mock streak data
const mockStreakData: StreakData = {
  current: 7,
  longest: 15,
  lastActivity: new Date(),
  isActive: true,
  target: 30,
  weeklyGoal: 5,
  weeklyProgress: 4,
  streakHistory: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
    completed: i < 6, // All days completed except today
    activities: i < 6 ? ['Cardiac Scenario', 'Study Session'] : []
  }))
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(mockProfile)
  const [activeSection, setActiveSection] = useState<'overview' | 'achievements' | 'streak' | 'settings'>('overview')

  const handleSaveProfile = async () => {
    try {
      // Update the mock profile with edited data
      // In a real app, this would make an API call to save to the database
      console.log('Saving profile:', editedProfile)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the displayed profile
      Object.assign(mockProfile, editedProfile)
      
      setIsEditing(false)
      
      // Show success message (you could add a toast notification here)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'premium': return { variant: 'accent' as const, icon: Crown, text: 'Premium' }
      case 'trial': return { variant: 'warning' as const, icon: Gift, text: 'Free Trial' }
      case 'free': return { variant: 'outline' as const, icon: User, text: 'Free' }
      default: return { variant: 'outline' as const, icon: User, text: 'Free' }
    }
  }

  const subscriptionBadge = getSubscriptionBadge(mockProfile.subscriptionTier)
  const SubscriptionIcon = subscriptionBadge.icon

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your learning journey, achievements, and account settings
            </p>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {mockProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <Badge variant={subscriptionBadge.variant} className="flex items-center space-x-1">
                    <SubscriptionIcon className="w-3 h-3" />
                    <span>{subscriptionBadge.text}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockProfile.name}
                  </h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{mockProfile.program}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{mockProfile.institution}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Year: {mockProfile.year}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {mockProfile.credentials.map((credential, index) => (
                    <Badge key={index} variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {credential}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 grid grid-cols-2 gap-6">
              <div className="text-center">
                <ProgressRing 
                  progress={75} 
                  size={80} 
                  strokeWidth={6}
                  label="Progress"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  2,340
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total XP</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1 mt-2">
                  #15
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Global Rank</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile Form */}
      {isEditing && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Edit Profile</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Display Name
                  </label>
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Institution
                  </label>
                  <Input
                    value={editedProfile.institution}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Your nursing school or institution"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Program
                  </label>
                  <Input
                    value={editedProfile.program}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, program: e.target.value }))}
                    placeholder="e.g., Bachelor of Science in Nursing"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Academic Year
                  </label>
                  <Input
                    value={editedProfile.year}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g., Junior (3rd Year)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <Input
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Specialty Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {mockProfile.specialtyInterests.map((interest, index) => (
                  <Badge key={index} variant="accent" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Navigation */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-8">
        {(['overview', 'achievements', 'streak', 'settings'] as const).map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection(section)}
            className="capitalize"
          >
            {section === 'overview' && <User className="w-4 h-4 mr-2" />}
            {section === 'achievements' && <Trophy className="w-4 h-4 mr-2" />}
            {section === 'streak' && <Zap className="w-4 h-4 mr-2" />}
            {section === 'settings' && <Settings className="w-4 h-4 mr-2" />}
            {section}
          </Button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Email</p>
                          <p className="text-slate-600 dark:text-slate-400">{mockProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Phone</p>
                          <p className="text-slate-600 dark:text-slate-400">{mockProfile.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Location</p>
                          <p className="text-slate-600 dark:text-slate-400">{mockProfile.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Emergency Contact</p>
                          <p className="text-slate-600 dark:text-slate-400">{mockProfile.emergencyContact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Academic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white mb-2">Program</p>
                        <p className="text-slate-600 dark:text-slate-400">{mockProfile.program}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white mb-2">Academic Year</p>
                        <p className="text-slate-600 dark:text-slate-400">{mockProfile.year}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white mb-2">Credentials</p>
                        <div className="flex flex-wrap gap-2">
                          {mockProfile.credentials.map((credential, index) => (
                            <Badge key={index} variant="success" size="sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {credential}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white mb-2">Specialty Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {mockProfile.specialtyInterests.map((interest, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Subscription</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-accent/10 rounded-xl">
                        <SubscriptionIcon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {subscriptionBadge.text} Plan
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {mockProfile.subscriptionTier === 'premium' 
                            ? 'Full access to all features and content'
                            : mockProfile.subscriptionTier === 'trial'
                            ? '5 days remaining in your free trial'
                            : 'Limited access to scenarios and features'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {mockProfile.subscriptionTier !== 'premium' && (
                        <Button variant="accent">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade
                        </Button>
                      )}
                      <Button variant="outline">
                        Manage Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'achievements' && (
            <BadgeGallery 
              achievements={mockAchievements}
              variant="grid"
              showLocked={true}
            />
          )}

          {activeSection === 'streak' && (
            <StreakMeter 
              streakData={mockStreakData}
              variant="full"
              showHistory={true}
              onStartActivity={() => router.push('/test')}
            />
          )}

          {activeSection === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Manage your preferences and account settings
              </p>
              <Button onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Go to Settings
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
