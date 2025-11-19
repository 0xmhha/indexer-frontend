import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Background layers (Crystalline Infrastructure) - use CSS variables for theme support
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        // Accent colors
        accent: {
          blue: '#00D4FF',
          cyan: '#4DD0E1',
          orange: '#FFA726',
        },
        // Text colors - use CSS variables for theme support
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        // Semantic colors
        success: '#2EA043',
        error: '#F85149',
        warning: '#FFA726',
        info: '#00D4FF',
        // shadcn/ui compatibility
        border: '#21262D',
        input: '#21262D',
        ring: '#00D4FF',
        background: '#0A0E14',
        foreground: '#E6EDF3',
        primary: {
          DEFAULT: '#00D4FF',
          foreground: '#0A0E14',
        },
        secondary: {
          DEFAULT: '#1C2128',
          foreground: '#E6EDF3',
        },
        destructive: {
          DEFAULT: '#F85149',
          foreground: '#E6EDF3',
        },
        muted: {
          DEFAULT: '#21262D',
          foreground: '#8B949E',
        },
        popover: {
          DEFAULT: '#1C2128',
          foreground: '#E6EDF3',
        },
        card: {
          DEFAULT: '#1C2128',
          foreground: '#E6EDF3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        xs: '0.5rem', // 8px
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
        xl: '3rem', // 48px
        '2xl': '4rem', // 64px
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
