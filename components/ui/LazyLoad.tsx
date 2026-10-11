'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useIntersectionObserver } from '@/lib/hooks/usePerformance'
import { Skeleton } from './Skeleton'
import { cardVariants, shouldReduceMotion } from '@/lib/animations'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
  delay?: number
}

export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  className = '',
  delay = 0
}: LazyLoadProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)
  
  const { isIntersecting, hasIntersected } = useIntersectionObserver(ref as any, {
    threshold,
    rootMargin
  })

  // Determine if we should show content
  const showContent = triggerOnce ? hasIntersected : isIntersecting

  // Handle delayed rendering
  useEffect(() => {
    if (showContent && delay > 0) {
      const timer = setTimeout(() => setShouldRender(true), delay)
      return () => clearTimeout(timer)
    } else if (showContent) {
      setShouldRender(true)
    }
    return undefined
  }, [showContent, delay])

  const finalShowContent = delay > 0 ? shouldRender : showContent

  if (shouldReduceMotion()) {
    return (
      <div ref={ref} className={className}>
        {finalShowContent ? children : (fallback || <Skeleton height={200} />)}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      {finalShowContent ? (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay / 1000 }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || <Skeleton height={200} />
      )}
    </div>
  )
}

// Preset lazy loading components
export function LazyCard({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number 
}) {
  return (
    <LazyLoad
      className={className}
      delay={delay}
      fallback={
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-6">
          <div className="space-y-4">
            <Skeleton height={24} width="60%" />
            <Skeleton height={16} width="100%" />
            <Skeleton height={16} width="80%" />
            <div className="flex space-x-2 mt-4">
              <Skeleton height={32} width={80} rounded />
              <Skeleton height={32} width={60} rounded />
            </div>
          </div>
        </div>
      }
    >
      {children}
    </LazyLoad>
  )
}

export function LazyImage({ 
  src, 
  alt, 
  className = '',
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <LazyLoad
      fallback={
        <Skeleton 
          className={`${className} bg-slate-200 dark:bg-slate-700`}
          height={200}
        />
      }
    >
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        {...props}
      />
    </LazyLoad>
  )
}

export function LazyScenarioCard({ 
  children, 
  index = 0 
}: { 
  children: React.ReactNode
  index?: number 
}) {
  return (
    <LazyLoad
      delay={index * 100} // Stagger loading
      fallback={
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-6">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton width={48} height={48} className="rounded-full" />
                <div className="space-y-2">
                  <Skeleton height={20} width={120} />
                  <Skeleton height={16} width={80} />
                </div>
              </div>
              <Skeleton height={24} width={60} className="rounded-full" />
            </div>

            {/* Content skeleton */}
            <Skeleton height={100} width="100%" />
            
            {/* Vital signs skeleton */}
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
      }
    >
      {children}
    </LazyLoad>
  )
}



