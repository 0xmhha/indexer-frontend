'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getUserPreferences,
  saveUserPreferences,
  updatePreference as updatePreferenceUtil,
  resetPreferences as resetPreferencesUtil,
  type UserPreferences,
} from '@/lib/store/userPreferences'

export interface UseUserPreferencesResult {
  preferences: UserPreferences
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  resetPreferences: () => void
  loading: boolean
}

/**
 * Hook for managing user preferences with localStorage persistence
 *
 * @example
 * ```tsx
 * const { preferences, updatePreference } = useUserPreferences()
 *
 * // Update single preference
 * updatePreference('theme', 'dark')
 *
 * // Update multiple preferences
 * updatePreferences({ theme: 'dark', itemsPerPage: 50 })
 * ```
 */
export function useUserPreferences(): UseUserPreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences())
  const [loading, setLoading] = useState(true)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      const prefs = getUserPreferences()
      setPreferences(prefs)
      setLoading(false)
    }

    loadPreferences()
  }, [])

  // Update single preference
  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      updatePreferenceUtil(key, value)
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  // Update multiple preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    saveUserPreferences(updates)
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }))
  }, [])

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    resetPreferencesUtil()
    const defaultPrefs = getUserPreferences()
    setPreferences(defaultPrefs)
  }, [])

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    loading,
  }
}
