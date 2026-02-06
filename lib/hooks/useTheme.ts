'use client'

import { useState, useEffect, useCallback } from 'react'
import { errorLogger } from '@/lib/errors/logger'

type Theme = 'dark' | 'light' | 'system'

interface UseThemeResult {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'theme-preference'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') {return 'dark'}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') {return}

  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)
}

/**
 * Hook for managing theme (dark/light/system)
 *
 * @example
 * ```tsx
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
 * ```
 */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {return 'dark'}

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored
      }
    } catch (error) {
      errorLogger.error(error, { component: 'useTheme', action: 'load-theme' })
    }

    return 'dark' // Default to dark theme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme === 'light' ? 'light' : 'dark'
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme
    // This is a valid use case - updating derived state based on theme preference change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(resolved)
    applyTheme(resolved)

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      errorLogger.error(error, { component: 'useTheme', action: 'save-theme' })
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') {return}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      applyTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      if (current === 'dark') {return 'light'}
      if (current === 'light') {return 'dark'}
      // If system, toggle to opposite of current resolved theme
      return resolvedTheme === 'dark' ? 'light' : 'dark'
    })
  }, [resolvedTheme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
