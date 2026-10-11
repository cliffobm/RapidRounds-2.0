// Accessibility utilities for RapidRounds

/**
 * Generate accessible IDs for form elements
 */
export function generateId(prefix: string = 'rr'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window === 'undefined') return

  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  
  document.body.appendChild(announcer)
  announcer.textContent = message
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusHistory: HTMLElement[] = []

  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement)
    }
  }

  static restoreFocus(): void {
    const lastFocused = this.focusHistory.pop()
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus()
    }
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.restoreFocus()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    container.addEventListener('keydown', handleEscapeKey)

    // Focus first element
    firstElement?.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
      container.removeEventListener('keydown', handleEscapeKey)
    }
  }
}

/**
 * Keyboard navigation helpers
 */
export const keyboardHandlers = {
  // Handle Enter and Space as click
  activateOnEnterOrSpace: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  },

  // Handle arrow keys for navigation
  arrowNavigation: (
    items: HTMLElement[],
    currentIndex: number,
    onNavigate: (newIndex: number) => void
  ) => (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0)
        break
      case 'Home':
        e.preventDefault()
        onNavigate(0)
        break
      case 'End':
        e.preventDefault()
        onNavigate(items.length - 1)
        break
    }
  }
}

/**
 * ARIA helpers
 */
export const aria = {
  // Generate ARIA attributes for expandable content
  expandable: (isExpanded: boolean, controlsId: string) => ({
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
    'aria-haspopup': 'true'
  }),

  // Generate ARIA attributes for tab panels
  tabPanel: (isSelected: boolean, tabId: string, panelId: string) => ({
    'role': 'tabpanel',
    'aria-labelledby': tabId,
    'id': panelId,
    'hidden': !isSelected,
    'tabIndex': isSelected ? 0 : -1
  }),

  // Generate ARIA attributes for tabs
  tab: (isSelected: boolean, tabId: string, panelId: string) => ({
    'role': 'tab',
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'id': tabId,
    'tabIndex': isSelected ? 0 : -1
  }),

  // Generate ARIA attributes for progress indicators
  progress: (value: number, max: number = 100, label?: string) => ({
    'role': 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label || `Progress: ${value} of ${max}`
  }),

  // Generate ARIA attributes for live regions
  liveRegion: (priority: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': priority,
    'aria-atomic': 'true'
  })
}

/**
 * Color contrast utilities
 */
export const contrast = {
  // Check if color combination meets WCAG AA standards
  meetsWCAG: (foreground: string, background: string): boolean => {
    // Simplified check - in production, use a proper contrast calculation library
    const isDarkFg = foreground.includes('slate-700') || foreground.includes('slate-800') || foreground.includes('slate-900')
    const isLightBg = background.includes('white') || background.includes('slate-50') || background.includes('slate-100')
    
    return isDarkFg && isLightBg
  },

  // Get high contrast variant of a color
  getHighContrastVariant: (colorClass: string): string => {
    if (colorClass.includes('slate-600')) return 'slate-900'
    if (colorClass.includes('slate-500')) return 'slate-800'
    if (colorClass.includes('slate-400')) return 'slate-700'
    return colorClass
  }
}

/**
 * Performance utilities
 */
export const performance = {
  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Intersection observer for lazy loading
  createIntersectionObserver: (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver => {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })
  }
}

/**
 * Skeleton loading component props
 */
export const skeletonProps = {
  className: "animate-pulse bg-slate-200 dark:bg-slate-700 rounded",
  'aria-label': 'Loading content',
  role: 'status'
}

/**
 * Focus visible utilities
 */
export const focusVisible = {
  // Ring styles for focus indicators
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  
  // Skip link styles
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50',
  
  // High contrast focus for better visibility
  highContrast: 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4'
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  // Hide decorative content from screen readers
  decorative: { 'aria-hidden': 'true' },
  
  // Screen reader only text
  only: 'sr-only',
  
  // Skip to main content
  skipToMain: 'Skip to main content',
  
  // Loading announcements
  loading: 'Loading content, please wait',
  loaded: 'Content loaded successfully',
  
  // Error announcements
  error: 'An error occurred. Please try again or contact support.',
  
  // Success announcements
  success: 'Action completed successfully'
}

/**
 * Touch target utilities
 */
export const touchTarget = {
  // Minimum 44px touch targets
  minimum: 'min-h-[44px] min-w-[44px]',
  
  // Comfortable touch targets
  comfortable: 'min-h-[48px] min-w-[48px]',
  
  // Large touch targets for primary actions
  large: 'min-h-[56px] min-w-[56px]'
}

/**
 * Responsive utilities
 */
export const responsive = {
  // Container max widths
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid responsive patterns
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  
  // Flex responsive patterns
  flexStack: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
  
  // Text responsive sizing
  headingResponsive: 'text-2xl sm:text-3xl lg:text-4xl',
  bodyResponsive: 'text-sm sm:text-base'
}


