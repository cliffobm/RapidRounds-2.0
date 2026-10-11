'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { buttonVariants as animationVariants, shouldReduceMotion } from '@/lib/animations'
import { touchTarget } from '@/lib/accessibility'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary-700 text-white hover:bg-primary-800 shadow-lg hover:shadow-xl',
        destructive: 'bg-danger text-white hover:bg-danger/90 shadow-lg hover:shadow-xl',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white',
        link: 'text-primary-700 underline-offset-4 hover:underline shadow-none',
        primary: 'bg-primary-700 text-white hover:bg-primary-800 shadow-lg hover:shadow-xl',
        accent: 'bg-accent text-slate-900 hover:bg-accent/90 shadow-lg hover:shadow-xl',
        success: 'bg-success text-white hover:bg-success/90 shadow-lg hover:shadow-xl',
        warning: 'bg-warning text-white hover:bg-warning/90 shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-11 px-6 py-3 min-h-[44px]', // Minimum 44px for touch targets
        sm: 'h-9 px-4 py-2',
        lg: 'h-12 px-8 py-4 text-base',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, loadingText, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading
    
    const buttonContent = loading ? (
      <div className="flex items-center space-x-2">
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span>{loadingText || 'Loading...'}</span>
      </div>
    ) : children

    if (shouldReduceMotion()) {
      return (
        <button
          className={cn(
            buttonVariants({ variant, size }),
            touchTarget.minimum,
            className
          )}
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          {...props}
        >
          {buttonContent}
        </button>
      )
    }

    return (
      <motion.button
        className={cn(
          buttonVariants({ variant, size }),
          touchTarget.minimum,
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        variants={animationVariants}
        initial="rest"
        whileHover={isDisabled ? "rest" : "hover"}
        whileTap={isDisabled ? "rest" : "tap"}
        {...(props as any)}
      >
        {buttonContent}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
