/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--rr-canvas) / <alpha-value>)',
        surface: 'rgb(var(--rr-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--rr-raised) / <alpha-value>)',
        ink: 'rgb(var(--rr-ink) / <alpha-value>)',
        muted: 'rgb(var(--rr-muted) / <alpha-value>)',
        edge: 'rgb(var(--rr-edge) / <alpha-value>)',
        signal: 'rgb(var(--rr-signal) / <alpha-value>)',
        'signal-contrast': 'rgb(var(--rr-signal-contrast) / <alpha-value>)',
        'signal-soft': 'rgb(var(--rr-signal-soft) / <alpha-value>)',
        positive: 'rgb(var(--rr-positive) / <alpha-value>)',
        // New RapidRounds brand tokens (AA-tilted primary scale)
        primary: {
          DEFAULT: 'rgb(var(--rr-signal) / <alpha-value>)',
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#39D5F8', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63'
        },
        accent: '#FC4C02', // Energizing orange
        success: '#15803d',
        warning: '#b45309', 
        danger: '#ef4444',
        // Slate scale for neutrals
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#122235',
          900: '#08121F',
          950: '#050b13',
        },
        // Legacy brand colors for backward compatibility
        brand: {
          orange: '#FC4C02',
          'orange-light': '#FF6B35',
          blue: '#0e7490',
          'blue-dark': '#031C32',
          'blue-darker': '#0D1016',
          teal: '#0f766e',
          'teal-light': '#A4C9D7',
          ink: '#0B1220',
          cloud: '#F2F6F7',
          'cloud-light': '#F1F5F7',
          'cloud-lighter': '#EFF3F5',
        },
        // Healthcare theme colors (keeping for compatibility)
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'DEFAULT': '1rem', // 2xl as default for interactive components
        '2xl': '1rem',
        'xl2': '1.25rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
