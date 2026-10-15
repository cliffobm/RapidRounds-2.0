'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/store/useAuth'
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Wifi,
  Shield,
  Key,
  Trash2,
  LogOut,
  ArrowLeft,
  Smartphone,
  Mail,
  Volume2,
  Eye,
  Globe,
  Clock,
  Database,
  AlertTriangle,
  Info,
  Trophy,
  TrendingUp,
  Award,
  User,
  Activity
} from 'lucide-react'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
    streakReminders: boolean
    achievementAlerts: boolean
    weeklyProgress: boolean
  }
  privacy: {
    showProfile: boolean
    showProgress: boolean
    showAchievements: boolean
  }
  offline: {
    syncEnabled: boolean
    autoDownload: boolean
    storageLimit: number
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    largeText: boolean
  }
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { setTheme } = useTheme()
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') setSettings(prev => ({ ...prev, theme: saved }))
  }, [])
  
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sound: false,
      streakReminders: true,
      achievementAlerts: true,
      weeklyProgress: true
    },
    privacy: {
      showProfile: true,
      showProgress: true,
      showAchievements: true
    },
    offline: {
      syncEnabled: true,
      autoDownload: false,
      storageLimit: 500 // MB
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false
    }
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [storageUsed, setStorageUsed] = useState(245) // MB

  const handleSettingChange = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Account deletion requested')
    setShowDeleteConfirm(false)
  }

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Data export requested')
  }

  const clearOfflineData = () => {
    // TODO: Clear offline data
    console.log('Clearing offline data')
    setStorageUsed(0)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <p id="settings-pending" role="status" className="mb-4 text-sm">Appearance and sign out are available. Other preferences, offline storage, export, account deletion, and policy/support actions are not connected yet; their controls are disabled.</p>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div className="p-3 bg-slate-500/10 rounded-2xl">
            <Settings className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your preferences and account settings
            </p>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="w-5 h-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize how RapidRounds looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Theme</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose your preferred color scheme
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => { setTheme(theme); setSettings(prev => ({ ...prev, theme })) }}
                    className="capitalize"
                  >
                    {theme === 'light' && <Sun className="w-4 h-4 mr-1" />}
                    {theme === 'dark' && <Moon className="w-4 h-4 mr-1" />}
                    {theme === 'system' && <Smartphone className="w-4 h-4 mr-1" />}
                    {theme}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Control when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {key === 'email' && <Mail className="w-5 h-5 text-slate-500" />}
                  {key === 'push' && <Bell className="w-5 h-5 text-slate-500" />}
                  {key === 'sound' && <Volume2 className="w-5 h-5 text-slate-500" />}
                  {key === 'streakReminders' && <Clock className="w-5 h-5 text-slate-500" />}
                  {key === 'achievementAlerts' && <Trophy className="w-5 h-5 text-slate-500" />}
                  {key === 'weeklyProgress' && <TrendingUp className="w-5 h-5 text-slate-500" />}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Browser and mobile push notifications'}
                      {key === 'sound' && 'Play sounds for notifications'}
                      {key === 'streakReminders' && 'Daily reminders to maintain your streak'}
                      {key === 'achievementAlerts' && 'Celebrate when you unlock achievements'}
                      {key === 'weeklyProgress' && 'Weekly progress summary emails'}
                    </p>
                  </div>
                </div>
                <Toggle disabled aria-describedby="settings-pending"
                  pressed={value}
                  onPressedChange={(pressed) => handleSettingChange('notifications', key, pressed)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy</span>
          </CardTitle>
          <CardDescription>
            Control what information is visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {key === 'showProfile' && <User className="w-5 h-5 text-slate-500" />}
                  {key === 'showProgress' && <TrendingUp className="w-5 h-5 text-slate-500" />}
                  {key === 'showAchievements' && <Award className="w-5 h-5 text-slate-500" />}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {key === 'showProfile' && 'Show Profile'}
                      {key === 'showProgress' && 'Show Progress'}
                      {key === 'showAchievements' && 'Show Achievements'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {key === 'showProfile' && 'Allow others to view your profile information'}
                      {key === 'showProgress' && 'Display your learning progress on leaderboards'}
                      {key === 'showAchievements' && 'Show your badges and achievements publicly'}
                    </p>
                  </div>
                </div>
                <Toggle disabled aria-describedby="settings-pending"
                  pressed={value}
                  onPressedChange={(pressed) => handleSettingChange('privacy', key, pressed)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Sync Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Offline & Sync</span>
          </CardTitle>
          <CardDescription>
            Manage offline content and data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Sync Enabled
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically sync your progress across devices
                  </p>
                </div>
              </div>
              <Toggle disabled aria-describedby="settings-pending"
                pressed={settings.offline.syncEnabled}
                onPressedChange={(pressed) => handleSettingChange('offline', 'syncEnabled', pressed)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Auto Download
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download scenarios for offline access
                  </p>
                </div>
              </div>
              <Toggle disabled aria-describedby="settings-pending"
                pressed={settings.offline.autoDownload}
                onPressedChange={(pressed) => handleSettingChange('offline', 'autoDownload', pressed)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Storage Usage
                </h4>
                <Badge variant="outline">
                  Not measured / {settings.offline.storageLimit} MB
                </Badge>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(storageUsed / settings.offline.storageLimit) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Offline content and cache</span>
                <Button disabled title="Not connected yet"
                  variant="outline"
                  size="sm"
                  onClick={clearOfflineData}
                  aria-disabled={true}
                >
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Accessibility</span>
          </CardTitle>
          <CardDescription>
            Customize the interface for better accessibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(settings.accessibility).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {key === 'reducedMotion' && <Activity className="w-5 h-5 text-slate-500" />}
                  {key === 'highContrast' && <Eye className="w-5 h-5 text-slate-500" />}
                  {key === 'largeText' && <Globe className="w-5 h-5 text-slate-500" />}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {key === 'reducedMotion' && 'Reduced Motion'}
                      {key === 'highContrast' && 'High Contrast'}
                      {key === 'largeText' && 'Large Text'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {key === 'reducedMotion' && 'Minimize animations and transitions'}
                      {key === 'highContrast' && 'Increase contrast for better visibility'}
                      {key === 'largeText' && 'Use larger font sizes throughout the app'}
                    </p>
                  </div>
                </div>
                <Toggle disabled aria-describedby="settings-pending"
                  pressed={value}
                  onPressedChange={(pressed) => handleSettingChange('accessibility', key, pressed)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Account Management</span>
          </CardTitle>
          <CardDescription>
            Manage your account data and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Export Data
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download all your learning data and progress
                  </p>
                </div>
              </div>
              <Button disabled title="Not connected yet" variant="outline" onClick={handleExportData}>
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-warning" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Sign Out
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign out of your account on this device
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-300">
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <Button disabled title="Not connected yet"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>December 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Terms of Service</span>
              <Button disabled title="Not connected yet" variant="link" size="sm">View</Button>
            </div>
            <div className="flex justify-between">
              <span>Privacy Policy</span>
              <Button disabled title="Not connected yet" variant="link" size="sm">View</Button>
            </div>
            <div className="flex justify-between">
              <span>Support</span>
              <Button disabled title="Not connected yet" variant="link" size="sm">Contact</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Delete Account
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                This action cannot be undone. All your progress, achievements, and data will be permanently deleted.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button disabled title="Not connected yet"
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button disabled title="Not connected yet"
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
