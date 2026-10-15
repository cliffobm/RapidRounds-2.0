'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { skeletonVariants, shouldReduceMotion } from '@/lib/animations'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animate?: boolean
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = true,
  animate = true
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-slate-200 dark:bg-slate-700',
    rounded && 'rounded',
    className
  )

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (!animate || shouldReduceMotion()) {
    return (
      <div 
        className={baseClasses}
        style={style}
        role="status"
        aria-label="Loading content"
      />
    )
  }

  return (
    <motion.div
      className={baseClasses}
      style={style}
      variants={skeletonVariants}
      animate="loading"
      role="status"
      aria-label="Loading content"
    />
  )
}

// Preset skeleton components for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="80%" />
      <div className="flex space-x-2 mt-4">
        <Skeleton height={32} width={80} rounded />
        <Skeleton height={32} width={60} rounded />
      </div>
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      className="rounded-full" 
    />
  )
}

export function SkeletonButton({ width = 100 }: { width?: number }) {
  return (
    <Skeleton 
      width={width} 
      height={40} 
      className="rounded-2xl" 
    />
  )
}

export function SkeletonText({ 
  lines = 3, 
  className 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i}
          height={16} 
          width={i === lines - 1 ? '75%' : '100%'} 
        />
      ))}
    </div>
  )
}

export function SkeletonLeaderboard({ entries = 5 }: { entries?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: entries }, (_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton width={40} height={40} className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="40%" />
            <Skeleton height={14} width="60%" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton height={20} width={60} />
            <Skeleton height={14} width={40} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonScenarioCard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <SkeletonAvatar size={48} />
          <div className="space-y-2">
            <Skeleton height={20} width={120} />
            <Skeleton height={16} width={80} />
          </div>
        </div>
        <Skeleton height={24} width={60} className="rounded-full" />
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton height={100} width="100%" />
        
        {/* Vital signs grid */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton width={40} height={40} className="rounded-lg mx-auto" />
              <Skeleton height={16} width={40} className="mx-auto" />
              <Skeleton height={12} width={30} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



