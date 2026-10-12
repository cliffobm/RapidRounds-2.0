// Core types for RapidRounds nursing education platform

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'educator' | 'admin'
  institution_id: string | null
  created_at: string
  updated_at: string
}

export interface Institution {
  id: string
  name: string
  domain: string | null
  settings: InstitutionSettings | null
  created_at: string
  updated_at: string
}

export interface InstitutionSettings {
  theme: {
    primary_color: string
    secondary_color: string
    logo_url: string | null
  }
  features: {
    custom_scenarios: boolean
    leaderboards: boolean
    analytics: boolean
  }
}

export interface Scenario {
  id: string
  title: string
  description: string | null
  content: ScenarioContent
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  is_custom: boolean
  author_id: string | null
  institution_id: string | null
  is_published: boolean
  estimated_duration: number // in minutes
  learning_objectives: string[]
  created_at: string
  updated_at: string
}

export interface ScenarioContent {
  patient_info: PatientInfo
  vital_signs: VitalSigns
  history: string
  presentation: string
  questions: ScenarioQuestion[]
  rationales: ScenarioRationale[]
  resources: ScenarioResource[]
}

export interface PatientInfo {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight: number
  height: number
  allergies: string[]
  medications: string[]
  medical_history: string[]
}

export interface VitalSigns {
  temperature: number
  blood_pressure: {
    systolic: number
    diastolic: number
  }
  heart_rate: number
  respiratory_rate: number
  oxygen_saturation: number
  pain_level: number // 0-10 scale
}

export interface ScenarioQuestion {
  id: string
  type: 'multiple_choice' | 'text' | 'priority' | 'assessment'
  question: string
  options?: string[]
  correct_answer: string | string[]
  points: number
  explanation: string
  category: 'assessment' | 'intervention' | 'evaluation' | 'planning'
}

export interface ScenarioRationale {
  question_id: string
  explanation: string
  evidence: string[]
  references: string[]
  tier: 'free' | 'premium' // for monetization
}

export interface ScenarioResource {
  id: string
  type: 'video' | 'article' | 'image' | 'document'
  title: string
  url: string
  description: string
}

export interface StudentProgress {
  id: string
  student_id: string
  scenario_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number | null
  time_spent: number // in minutes
  attempts: number
  answers: StudentAnswer[]
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface StudentAnswer {
  question_id: string
  answer: string | string[]
  is_correct: boolean
  time_spent: number // in seconds
  attempted_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: BadgeCriteria
  points: number
  category: 'scenario' | 'streak' | 'achievement' | 'social'
}

export interface BadgeCriteria {
  type: 'scenarios_completed' | 'score_threshold' | 'streak_days' | 'category_mastery'
  value: number
  category?: string
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  earned_at: string
}

export interface LeaderboardEntry {
  student_id: string
  student_name: string
  total_points: number
  scenarios_completed: number
  average_score: number
  rank: number
  institution_id?: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  content: LessonContent
  duration: number // in minutes
  prerequisites: string[] // scenario IDs
  learning_objectives: string[]
  is_published: boolean
  author_id: string
  institution_id: string | null
  created_at: string
  updated_at: string
}

export interface LessonContent {
  sections: LessonSection[]
  quiz: LessonQuiz[]
  resources: ScenarioResource[]
}

export interface LessonSection {
  id: string
  title: string
  content: string
  type: 'text' | 'video' | 'interactive'
  order: number
}

export interface LessonQuiz {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  points: number
}

export interface StudentLessonProgress {
  id: string
  student_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  quiz_score: number | null
  time_spent: number
  completed_at: string | null
  created_at: string
  updated_at: string
}
