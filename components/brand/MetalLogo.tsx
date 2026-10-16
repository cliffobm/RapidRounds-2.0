'use client'
import { useId } from 'react'
type LogoProps = {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'horizontal' | 'icon' | 'monochrome'
}
// Reconstructed chrome RR direction; the exact original animation was not in the imported source.
export function Logo({
  className = '',
  showText = true,
  size = 'md',
  variant = 'default',
}: LogoProps) {
  const id = useId().replace(/:/g, '')
  return (
    <span className={`rr-brand rr-brand-${size} ${className}`}>
      <svg
        className="rr-monogram"
        viewBox="0 0 140 112"
        role="img"
        aria-label="Rapid Rounds metallic RR logo"
      >
        <defs>
          <linearGradient id={`chrome${id}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop stopColor="#fff" />
            <stop offset=".22" stopColor="#a9bfd3" />
            <stop offset=".44" stopColor="#f5fbff" />
            <stop offset=".49" stopColor="#6c8095" />
            <stop offset=".7" stopColor="#d6e3ef" />
            <stop offset="1" stopColor="#8193a9" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="138"
          height="110"
          rx="26"
          fill="#0b1728"
          stroke="#40566e"
        />
        <g
          className="rr-materialize"
          fill={`url(#chrome${id})`}
          stroke="#d9e9f5"
          strokeWidth=".65"
        >
          <path d="M20 83V27h27c16 0 24 7 24 19 0 8-4 14-12 17l16 20H55L41 65h-5v18Zm16-32h10c6 0 9-2 9-6s-3-6-9-6H36Z" />
          <path d="M73 83V27h25c16 0 24 7 24 19 0 8-4 14-12 17l16 20h-20L92 65h-3v18Zm16-32h8c6 0 9-2 9-6s-3-6-9-6h-8Z" />
        </g>
        <path
          className="rr-heartbeat-glow"
          d="M8 58H43l6-6 6 13 9-31 10 46 9-22h49"
          fill="none"
          stroke="#68f0cb"
          strokeWidth="5"
          opacity=".25"
        />
        <path
          className="rr-heartbeat"
          pathLength="1"
          d="M8 58H43l6-6 6 13 9-31 10 46 9-22h49"
          fill="none"
          stroke="#79ffdb"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
      {showText && variant !== 'icon' && (
        <span className="rr-wordmark">
          Rapid<span>Rounds</span>
          <small>THINK CLEAR. ACT READY.</small>
        </span>
      )}
    </span>
  )
}
