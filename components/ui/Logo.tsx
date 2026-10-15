'use client'

import Link from 'next/link'
import { useId } from 'react'

export function BrandMark({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${id}-silver`}
          x1="28"
          y1="22"
          x2="72"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#b8cdd9" />
        </linearGradient>
        <linearGradient
          id={`${id}-signal`}
          x1="70"
          y1="25"
          x2="113"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#39d5f8" />
          <stop offset="1" stopColor="#39d6a3" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="120"
        height="120"
        rx="31"
        fill="#08121f"
        stroke="#237082"
      />
      <path
        d="M30 90V30H52C70 30 76 38 76 49C76 59 70 65 62 67L80 90H65L48 68H42V90H30ZM42 41V57H52C60 57 64 54 64 49C64 44 60 41 52 41H42Z"
        fill={`url(#${id}-silver)`}
      />
      <path
        d="M72 30H86C102 30 109 38 109 50C109 60 104 66 96 69L112 90H98L80 65V58H86C94 58 98 55 98 50C98 44 94 41 86 41H80L72 30Z"
        fill={`url(#${id}-signal)`}
      />
      <path
        className="rr-pulse"
        d="M14 102H30L35 96L41 108L48 102H62L69 78L78 117L87 94L92 102H114"
        stroke="#39d5f8"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'horizontal' | 'icon' | 'monochrome'
}

export function Logo({
  className = '',
  showText = true,
  size = 'md',
  variant = 'default',
}: LogoProps) {
  const sizeClasses = { sm: 'h-10 w-10', md: 'h-12 w-12', lg: 'h-14 w-14' }
  return (
    <Link
      href="/"
      aria-label="Rapid Rounds home"
      className={`inline-flex items-center gap-3 rounded-lg ${className}`}
    >
      <BrandMark className={`shrink-0 ${sizeClasses[size]}`} />
      {showText && variant !== 'icon' && (
        <span className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-ink">
            RAPID <span className="text-signal">ROUNDS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.18em] text-muted">
            CLINICAL JUDGMENT TRAINING
          </span>
        </span>
      )}
    </Link>
  )
}
