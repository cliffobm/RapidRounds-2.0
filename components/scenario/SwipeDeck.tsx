'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { shouldReduceMotion } from '@/lib/animations'
import { announceToScreenReader, keyboardHandlers, aria } from '@/lib/accessibility'
import { Haptics } from '@/lib/utils/haptics'

export interface SwipeItem {
  id: string
  title: string
  content: React.ReactNode
  isBookmarked?: boolean
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    category?: string
    estimatedTime?: string
  }
}

interface SwipeDeckProps {
  items: SwipeItem[]
  onSwipeLeft?: (item: SwipeItem, index: number) => void
  onSwipeRight?: (item: SwipeItem, index: number) => void
  onBookmark?: (item: SwipeItem, index: number) => void
  className?: string
  showHints?: boolean
}

export function SwipeDeck({ 
  items, 
  onSwipeLeft, 
  onSwipeRight, 
  onBookmark, 
  className = '',
  showHints = true 
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [pulse, setPulse] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const currentItem = items[currentIndex]
  const hasNext = currentIndex < items.length - 1
  const hasPrev = currentIndex > 0

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deckRef.current?.contains(document.activeElement)) return
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], button[aria-roledescription="sortable"]')) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSwipeLeft()
          break
        case 'b':
        case 'B':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleSwipeRight()
          }
          break
        case 'Enter':
        case ' ':
          if (e.target === deckRef.current) {
            e.preventDefault()
            handleSwipeLeft()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, hasNext, hasPrev, navigating])

  // Announce navigation changes
  useEffect(() => {
    if (currentItem) {
      announceToScreenReader(
        `${currentItem.title}. Item ${currentIndex + 1} of ${items.length}`,
        'polite'
      )
    }
  }, [currentIndex, currentItem, items.length])

  const triggerPulse = useCallback(() => {
    setPulse(true)
    setTimeout(() => setPulse(false), 200)
  }, [])

  const handleSwipeLeft = useCallback(() => {
    if (hasNext && !navigating) {
      setNavigating(!shouldReduceMotion())
      setDirection('left')
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      onSwipeLeft?.(items[currentIndex]!, currentIndex)
      const ok = Haptics.selection()
      if (!ok) triggerPulse()
      
      // Reset direction after animation
      setTimeout(() => setDirection(null), 300)
    }
  }, [currentIndex, hasNext, items, onSwipeLeft, triggerPulse, navigating])

  const handleSwipeRight = useCallback(() => {
    const item = items[currentIndex]
    onSwipeRight?.(item!, currentIndex)
    onBookmark?.(item!, currentIndex)
    const ok = Haptics.light()
    if (!ok) triggerPulse()
  }, [currentIndex, items, onSwipeRight, onBookmark, triggerPulse])

  const handlePrevious = useCallback(() => {
    if (hasPrev && !navigating) {
      setNavigating(!shouldReduceMotion())
      setDirection('right')
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      
      // Reset direction after animation
      setTimeout(() => setDirection(null), 300)
    }
  }, [currentIndex, hasPrev, navigating])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 50, // Minimum distance for swipe
  })

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 40 : -40,
      opacity: 0,
      scale: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -40 : 40,
      opacity: 0,
      scale: 1,
    }),
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No items to display
      </div>
    )
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <div ref={deckRef} className={`relative w-full ${className}`}>
      {/* Progress indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {currentIndex + 1} of {items.length}
          </span>
          {currentItem.metadata?.category && (
            <Badge variant="outline" size="sm">
              {currentItem.metadata.category}
            </Badge>
          )}
          {currentItem.metadata?.difficulty && (
            <Badge variant={getDifficultyColor(currentItem.metadata.difficulty) as any} size="sm">
              {currentItem.metadata.difficulty}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {currentItem.metadata?.estimatedTime && (
            <span className="text-sm text-slate-500">
              {currentItem.metadata.estimatedTime}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label={currentItem.isBookmarked ? "Remove bookmark" : "Bookmark current item"}
            aria-pressed={Boolean(currentItem.isBookmarked)}
            onClick={() => { handleSwipeRight() }}
            className={`p-2 ${currentItem.isBookmarked ? 'text-accent' : 'text-slate-400'}`}
          >
            {currentItem.isBookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6" {...aria.progress(currentIndex + 1, items.length, `Content progress: ${currentIndex + 1} of ${items.length}`)}>
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Swipe area */}
      <div 
        {...swipeHandlers}
        className={`relative overflow-hidden rounded-2xl h-[600px] max-h-[70dvh] min-h-[400px] bg-white dark:bg-slate-800 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${pulse ? 'ring-2 ring-primary/40 animate-pulse' : ''}`}
        tabIndex={0}
        aria-describedby="swipe-instructions"
        role="region"
        aria-label="Scenario content"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={shouldReduceMotion() ? {} : slideVariants}
            initial={shouldReduceMotion() ? false : "enter"}
            animate={shouldReduceMotion() ? false : "center"}
            onAnimationComplete={(definition) => {
              if (definition === "center") {
                setNavigating(false)
                if (!contentRef.current?.parentElement?.contains(document.activeElement)) contentRef.current?.focus({ preventScroll: true })
              }
            }}
            {...(shouldReduceMotion() ? {} : { exit: "exit" })}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute inset-0 p-4 sm:p-6 overflow-hidden"
          >
            <div className="h-full min-h-0 flex flex-col">
              <h2 
                ref={contentRef}
                className="text-xl font-semibold text-slate-900 dark:text-white mb-4 focus:outline-none flex-shrink-0"
                tabIndex={-1}
              >
                {currentItem.title}
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto" role="main">
                {currentItem.content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Screen reader instructions */}
        <div id="swipe-instructions" className="sr-only">
          Use arrow keys to navigate. Right arrow for next, left arrow for previous. 
          Press Ctrl+B to bookmark current item.
        </div>
      </div>

      {/* Navigation controls */}
      <p className="mt-3 text-xs text-slate-500">Bookmarks apply to this round only and reset when the page is reloaded.</p>
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrev || navigating}
          className="flex items-center space-x-2"
          aria-label={`Go to previous item${hasPrev ? `: ${items[currentIndex - 1]?.title}` : ' (not available)'}`}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-4">
          {/* Swipe hints */}
          {showHints && (
            <div className="hidden sm:flex items-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Swipe for next</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4" />
                <span>Swipe to bookmark</span>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleSwipeLeft}
          disabled={!hasNext || navigating}
          className="flex items-center space-x-2"
          aria-label={`Go to next item${hasNext ? `: ${items[currentIndex + 1]?.title}` : ' (not available)'}`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Mobile swipe hints */}
      {showHints && (
        <div className="sm:hidden mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <ChevronLeft className="w-3 h-3" />
              <span>Next</span>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center space-x-1">
              <ChevronRight className="w-3 h-3" />
              <span>Bookmark</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
