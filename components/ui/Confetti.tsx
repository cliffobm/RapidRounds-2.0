'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [active, onComplete])

  if (!active) return null

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['#0A66C2', '#FC4C02', '#16a34a', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute rounded-full opacity-90"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
          }}
          initial={{
            y: -20,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: 720,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Hook for easier confetti triggering
export function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const trigger = () => setIsActive(true)
  const stop = () => setIsActive(false)

  return { isActive, trigger, stop }
}

