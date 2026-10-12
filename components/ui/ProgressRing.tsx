'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { shouldReduceMotion } from '@/lib/animations'
import { aria } from '@/lib/accessibility'

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  showLabel?: boolean
  label?: string
}

const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ 
    progress, 
    size = 120, 
    strokeWidth = 8, 
    showLabel = true, 
    label,
    className, 
    ...props 
  }, ref) => {
    const normalizedRadius = (size - strokeWidth) / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const MotionCircle = shouldReduceMotion() ? 'circle' : motion.circle

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...aria.progress(progress, 100, label)}
        {...props}
      >
        <svg
          height={size}
          width={size}
          className="transform -rotate-90"
          role="img"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <MotionCircle
            stroke="currentColor"
            className="text-primary"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            {...(shouldReduceMotion() ? {
              strokeDashoffset
            } : {
              initial: { strokeDashoffset: circumference },
              animate: { strokeDashoffset },
              transition: { 
                duration: 1, 
                ease: "easeOut",
                delay: 0.2
              }
            })}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="text-2xl font-bold text-slate-900 dark:text-white"
                {...(shouldReduceMotion() ? {} : {
                  initial: { scale: 0.8, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  transition: { delay: 0.5, duration: 0.3 }
                })}
              >
                {Math.round(progress)}%
              </motion.div>
              {label && (
                <motion.div 
                  className="text-xs text-slate-600 dark:text-slate-400 mt-1"
                  {...(shouldReduceMotion() ? {} : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.7, duration: 0.3 }
                  })}
                >
                  {label}
                </motion.div>
              )}
            </div>
          </div>
        )}
        
        {/* Screen reader text */}
        <div className="sr-only">
          {`Progress: ${Math.round(progress)} percent${label ? ` of ${label}` : ''}`}
        </div>
      </div>
    )
  }
)

ProgressRing.displayName = 'ProgressRing'

export { ProgressRing }

