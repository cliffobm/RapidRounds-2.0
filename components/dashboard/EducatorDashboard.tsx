'use client'

import { useState, useEffect } from 'react'
import { User, StudentProgress, LeaderboardEntry } from '@/types'
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface EducatorDashboardProps {
  user: User
}

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  scenariosAssigned: number
  averageScore: number
  completionRate: number
  totalLessons: number
  activeTime: string
}

export function EducatorDashboard({ user }: EducatorDashboardProps) {
  // Safety check for user
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">No user data available</p>
        </div>
      </div>
    )
  }
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    scenariosAssigned: 0,
    averageScore: 0,
    completionRate: 0,
    totalLessons: 0,
    activeTime: '0h'
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'scenario_completed',
      student: 'Sarah Johnson',
      action: 'completed Cardiac Assessment',
      score: 85,
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'lesson_completed',
      student: 'Michael Chen',
      action: 'finished Pharmacology Module',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'scenario_started',
      student: 'Emily Rodriguez',
      action: 'started Respiratory Assessment',
      time: '6 hours ago'
    }
  ])

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { student_id: '1', student_name: 'Sarah Johnson', total_points: 1250, scenarios_completed: 8, average_score: 87, rank: 1 },
    { student_id: '2', student_name: 'Michael Chen', total_points: 1180, scenarios_completed: 7, average_score: 84, rank: 2 },
    { student_id: '3', student_name: 'Emily Rodriguez', total_points: 1100, scenarios_completed: 6, average_score: 82, rank: 3 },
    { student_id: '4', student_name: 'David Kim', total_points: 980, scenarios_completed: 5, average_score: 78, rank: 4 },
    { student_id: '5', student_name: 'Lisa Wang', total_points: 920, scenarios_completed: 5, average_score: 76, rank: 5 }
  ])

  useEffect(() => {
    // Simulate loading real data
    setStats({
      totalStudents: 45,
      activeStudents: 38,
      scenariosAssigned: 156,
      averageScore: 78,
      completionRate: 82,
      totalLessons: 23,
      activeTime: '12.5h'
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Educator Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center">
            <EyeIcon className="w-4 h-4 mr-2" />
            View Reports
          </button>
          <button className="btn btn-primary flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Content
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.activeStudents} active this week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scenarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scenariosAssigned}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Assigned this month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Across all scenarios</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
                         <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
               <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
             </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Of assigned work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Student Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {activity.student} {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  {activity.score && (
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.score}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Top Performers
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((student) => (
                <div key={student.student_id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    student.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    student.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    student.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {student.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.student_name}</p>
                    <p className="text-sm text-gray-500">
                      {student.scenarios_completed} scenarios • {student.average_score}% avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{student.total_points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <AcademicCapIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Create Scenario</h3>
          <p className="text-sm text-gray-600">Design new patient scenarios and questions</p>
        </button>

        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Upload Lesson</h3>
          <p className="text-sm text-gray-600">Add new flipped classroom content</p>
        </button>

        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">View Reports</h3>
          <p className="text-sm text-gray-600">Generate detailed analytics and insights</p>
        </button>
      </div>
    </div>
  )
}
