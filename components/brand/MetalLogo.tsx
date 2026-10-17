'use client'
import Image from 'next/image'
type LogoProps = {
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
  return (
    <span className={`rr-brand rr-brand-${size} ${className}`}>
      <Image
        className="rr-monogram rr-original-logo"
        src="/brand/rapidrounds-metallic.png"
        alt="Rapid Rounds metallic RR logo"
        width={280}
        height={280}
        sizes={size === 'lg' ? '280px' : '70px'}
        loading="eager"
      />
      {showText && variant !== 'icon' && (
        <span className="rr-wordmark">
          Rapid<span>Rounds</span>
          <small>THINK CLEAR. ACT READY.</small>
        </span>
      )}
    </span>
  )
}
