'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-white',
  {
    variants: {
      variant: {
        default: 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700',
        outline: 'border border-slate-300 hover:bg-slate-100 text-slate-700',
      },
      size: {
        default: 'h-10 px-3 min-h-[44px]',
        sm: 'h-8 px-2',
        lg: 'h-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle, toggleVariants }




