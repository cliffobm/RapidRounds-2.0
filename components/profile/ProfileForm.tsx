'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card } from '@/components/ui/Card'
import { ProfileOption, ProfileFormData } from '@/lib/db/profile'
import toast from 'react-hot-toast'

interface ProfileFormProps {
  initialData: ProfileFormData
  options: {
    aspirations: ProfileOption[]
    goals: ProfileOption[]
    learning_challenges: ProfileOption[]
  }
  onSave: (data: ProfileFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface CheckboxChipProps {
  id: string
  name: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function CheckboxChip({ id, name, description, checked, onChange, disabled }: CheckboxChipProps) {
  return (
    <label
      className={`
        relative flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${checked 
          ? 'border-brand-orange bg-orange-50 dark:bg-orange-900/20' 
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
      `}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex-shrink-0">
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${checked 
              ? 'border-brand-orange bg-brand-orange' 
              : 'border-gray-300 dark:border-gray-500'
            }
          `}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {name}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        )}
      </div>
    </label>
  )
}

interface MultiSelectSectionProps {
  title: string
  options: ProfileOption[]
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  disabled?: boolean
  maxSelections?: number
}

function MultiSelectSection({ 
  title, 
  options, 
  selectedIds, 
  onSelectionChange, 
  disabled = false,
  maxSelections 
}: MultiSelectSectionProps) {
  const handleToggle = (optionId: string, checked: boolean) => {
    if (disabled) return
    
    if (checked) {
      if (maxSelections && selectedIds.length >= maxSelections) {
        toast.error(`You can select up to ${maxSelections} items`)
        return
      }
      onSelectionChange([...selectedIds, optionId])
    } else {
      onSelectionChange(selectedIds.filter(id => id !== optionId))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </Label>
        {maxSelections && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.length}/{maxSelections} selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => (
          <CheckboxChip
            key={option.id}
            id={option.id}
            name={option.name}
            description={option.description ?? ''}
            checked={selectedIds.includes(option.id)}
            onChange={(checked) => handleToggle(option.id, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

export function ProfileForm({ 
  initialData, 
  options, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, display_name: value }))
  }

  const handleAspirationsChange = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, aspiration_ids: selectedIds }))
  }

  const handleGoalsChange = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, goal_ids: selectedIds }))
  }

  const handleChallengesChange = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, learning_challenge_ids: selectedIds }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name" className="text-base font-semibold text-gray-900 dark:text-white">
            Display Name
          </Label>
          <Input
            id="display_name"
            type="text"
            value={formData.display_name || ''}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="Enter your display name"
            disabled={isSubmitting}
            className="text-base"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is how your name will appear to other users
          </p>
        </div>

        {/* Professional Aspirations */}
        <MultiSelectSection
          title="Professional Aspirations"
          options={options.aspirations}
          selectedIds={formData.aspiration_ids}
          onSelectionChange={handleAspirationsChange}
          disabled={isSubmitting}
          maxSelections={5}
        />

        {/* Current Goals */}
        <MultiSelectSection
          title="Current Goals"
          options={options.goals}
          selectedIds={formData.goal_ids}
          onSelectionChange={handleGoalsChange}
          disabled={isSubmitting}
          maxSelections={5}
        />

        {/* Learning Challenges */}
        <MultiSelectSection
          title="Learning Challenges"
          options={options.learning_challenges}
          selectedIds={formData.learning_challenge_ids}
          onSelectionChange={handleChallengesChange}
          disabled={isSubmitting}
          maxSelections={5}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
