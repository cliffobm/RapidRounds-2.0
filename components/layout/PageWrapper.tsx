'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { pageVariants, shouldReduceMotion } from '@/lib/animations'
import { announceToScreenReader, FocusManager } from '@/lib/accessibility'

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  announcePageChange?: boolean
  focusOnMount?: boolean
  skipLinkTarget?: string
}

export function PageWrapper({
  children,
  title,
  description,
  className = '',
  announcePageChange = true,
  focusOnMount = true,
  skipLinkTarget = 'main-content'
}: PageWrapperProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Announce page change to screen readers
    if (announcePageChange && title) {
      announceToScreenReader(`Navigated to ${title}`, 'polite')
    }
    return undefined

    // Focus management
    if (focusOnMount) {
      if (headingRef.current) {
        headingRef.current?.focus()
      } else if (pageRef.current) {
        pageRef.current?.focus()
      }
    }

    // Update document title
    if (title) {
      const originalTitle = document.title
      document.title = `${title} | RapidRounds`
      
      return () => {
        document.title = originalTitle
      }
    }
  }, [title, announcePageChange, focusOnMount])

  const MotionDiv = shouldReduceMotion() ? 'div' : motion.div

  return (
    <>
      {/* Skip Link */}
      <a
        href={`#${skipLinkTarget}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <MotionDiv
        ref={pageRef}
        className={className}
        tabIndex={-1}
        {...(shouldReduceMotion() ? {} : {
          variants: pageVariants,
          initial: "initial",
          animate: "animate",
          exit: "exit"
        })}
      >
        {/* Page Header */}
        {title && (
          <header className="mb-6">
            <h1
              ref={headingRef}
              className="text-3xl font-bold text-slate-900 dark:text-white focus:outline-none"
              tabIndex={-1}
            >
              {title}
            </h1>
            {description && (
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {description}
              </p>
            )}
          </header>
        )}

        {/* Main Content */}
        <main id={skipLinkTarget} className="focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </MotionDiv>
    </>
  )
}

// Higher-order component for page wrapping
export function withPageWrapper<P extends object>(
  Component: React.ComponentType<P>,
  pageConfig?: {
    title?: string
    description?: string
    className?: string
  }
) {
  return function WrappedPage(props: P) {
    return (
      <PageWrapper {...pageConfig}>
        <Component {...props} />
      </PageWrapper>
    )
  }
}



