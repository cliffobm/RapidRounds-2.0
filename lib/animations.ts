import { Variants } from 'framer-motion'

// Respect user's motion preferences
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: shouldReduceMotion() ? 0 : 20,
    scale: shouldReduceMotion() ? 1 : 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: shouldReduceMotion() ? 0 : 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: shouldReduceMotion() ? 0 : -20,
    scale: shouldReduceMotion() ? 1 : 0.98,
    transition: {
      duration: shouldReduceMotion() ? 0 : 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Card entrance animations
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: shouldReduceMotion() ? 0 : 30,
    scale: shouldReduceMotion() ? 1 : 0.95
  },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: shouldReduceMotion() ? 0 : 0.5,
      delay: shouldReduceMotion() ? 0 : index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

// Stagger container for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: shouldReduceMotion() ? 0 : 0.1,
      delayChildren: shouldReduceMotion() ? 0 : 0.2
    }
  }
}

// Button interaction variants
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: shouldReduceMotion() ? 1 : 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: shouldReduceMotion() ? 1 : 0.98,
    transition: { duration: 0.1 }
  }
}

// Modal/overlay variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: shouldReduceMotion() ? 1 : 0.9,
    y: shouldReduceMotion() ? 0 : 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: shouldReduceMotion() ? 0 : 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: shouldReduceMotion() ? 1 : 0.9,
    y: shouldReduceMotion() ? 0 : 20,
    transition: {
      duration: shouldReduceMotion() ? 0 : 0.2
    }
  }
}

// Slide in from direction variants
export const slideVariants = {
  left: {
    hidden: { x: shouldReduceMotion() ? 0 : -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: shouldReduceMotion() ? 0 : -100, opacity: 0 }
  },
  right: {
    hidden: { x: shouldReduceMotion() ? 0 : 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: shouldReduceMotion() ? 0 : 100, opacity: 0 }
  },
  up: {
    hidden: { y: shouldReduceMotion() ? 0 : 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: shouldReduceMotion() ? 0 : -50, opacity: 0 }
  },
  down: {
    hidden: { y: shouldReduceMotion() ? 0 : -50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: shouldReduceMotion() ? 0 : 50, opacity: 0 }
  }
}

// Spring configurations
export const springConfig = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  responsive: { type: "spring", stiffness: 400, damping: 30 },
  bouncy: { type: "spring", stiffness: 300, damping: 8 }
}

// Loading skeleton variants
export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Success/error feedback variants
export const feedbackVariants: Variants = {
  success: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.6, ease: "easeOut" }
  },
  error: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6 }
  }
}

// Utility function to create safe motion props
export const createMotionProps = (variants: Variants, custom?: any) => {
  if (shouldReduceMotion()) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 }
    }
  }
  
  return {
    variants,
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    custom
  }
}


