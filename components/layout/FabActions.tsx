'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookPlus, Users, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FabActionsProps {
  userRole?: 'student' | 'educator' | 'admin'
}

export function FabActions({ userRole = 'student' }: FabActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Only show FAB for educators
  if (userRole !== 'educator' && userRole !== 'admin') {
    return null
  }

  const actions = [
    {
      id: 'create-scenario',
      label: 'Create Scenario',
      icon: BookPlus,
      href: '/create/scenario',
      color: 'bg-primary hover:bg-primary/90'
    },
    {
      id: 'manage-students',
      label: 'Manage Students',
      icon: Users,
      href: '/manage/students',
      color: 'bg-accent hover:bg-accent/90'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-slate-600 hover:bg-slate-700'
    }
  ]

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 mb-4"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl shadow-md">
                  {action.label}
                </span>
                <a
                  href={action.href}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}
                >
                  <action.icon className="w-6 h-6" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
          isOpen ? 'bg-slate-600 hover:bg-slate-700 rotate-45' : 'bg-primary-700 hover:bg-primary-800'
        }`}
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </Button>
    </div>
  )
}



