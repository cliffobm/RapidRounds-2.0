'use client'

import confetti from 'canvas-confetti'

export function confettiBurst() {
  // Create a burst of confetti from the center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FC4C02', '#0E3A5D', '#1C6E8C', '#F5FAFF', '#22c55e', '#f59e0b'],
    shapes: ['circle', 'square'],
    scalar: 1.2,
  })

  // Add a second burst for extra celebration
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#FC4C02', '#0E3A5D', '#1C6E8C'],
    })
  }, 200)

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#FC4C02', '#0E3A5D', '#1C6E8C'],
    })
  }, 400)
}

export function confettiSuccess() {
  // Success celebration with green and brand colors
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#FC4C02', '#0E3A5D', '#1C6E8C'],
    shapes: ['circle'],
    scalar: 1.1,
  })
}

export function confettiAchievement() {
  // Achievement celebration with golden burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#f59e0b', '#FC4C02', '#0E3A5D', '#1C6E8C'],
    shapes: ['star', 'circle'],
    scalar: 1.3,
  })

  // Add a golden shower effect
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.1 },
      colors: ['#f59e0b', '#FC4C02'],
      shapes: ['star'],
      gravity: 0.5,
      scalar: 1.5,
    })
  }, 300)
}

export function confettiStreak() {
  // Streak celebration with fire-like effect
  confetti({
    particleCount: 60,
    spread: 45,
    origin: { y: 0.7 },
    colors: ['#FC4C02', '#f59e0b', '#ef4444'],
    shapes: ['circle'],
    scalar: 1.0,
    gravity: 0.8,
  })

  // Add upward burst
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 30,
      origin: { y: 0.8 },
      colors: ['#FC4C02', '#f59e0b'],
      shapes: ['circle'],
      scalar: 0.8,
      gravity: -0.5,
      drift: 0.1,
    })
  }, 150)
}

// Export all confetti functions as a single object for easy importing
export const confettiCelebrations = {
  burst: confettiBurst,
  success: confettiSuccess,
  achievement: confettiAchievement,
  streak: confettiStreak,
}

