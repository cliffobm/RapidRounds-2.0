'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white shadow-sm',
        secondary: 'bg-slate-100 text-slate-800',
        success: 'bg-success text-white shadow-sm',
        warning: 'bg-warning text-white shadow-sm',
        danger: 'bg-danger text-white shadow-sm',
        accent: 'bg-accent text-slate-900 shadow-sm',
        outline: 'border border-slate-300 bg-white !text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:!text-slate-100',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }




