/**
 * User Preferences Store
 * Manages user settings in localStorage with type safety
 */

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'ko' | 'ja' | 'zh'
export type DateFormat = 'relative' | 'absolute' | 'both'

export interface UserPreferences {
  theme: Theme
  language: Language
  itemsPerPage: number
  dateFormat: DateFormat
  showTestTransactions: boolean
  autoRefresh: boolean
  refreshInterval: number // seconds
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  itemsPerPage: 20,
  dateFormat: 'relative',
  showTestTransactions: true,
  autoRefresh: false,
  refreshInterval: 30,
}

const STORAGE_KEY = 'indexer-user-preferences'

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PREFERENCES
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return DEFAULT_PREFERENCES
    }

    const parsed = JSON.parse(stored) as Partial<UserPreferences>

    // Merge with defaults to handle new preference keys
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available')
    return
  }

  try {
    const current = getUserPreferences()
    const updated = {
      ...current,
      ...preferences,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save user preferences:', error)
  }
}

/**
 * Update a single preference
 */
export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void {
  saveUserPreferences({ [key]: value })
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to reset preferences:', error)
  }
}

/**
 * Get a single preference value
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] {
  const preferences = getUserPreferences()
  return preferences[key]
}

/**
 * Export preferences as JSON
 */
export function exportPreferences(): string {
  const preferences = getUserPreferences()
  return JSON.stringify(preferences, null, 2)
}

/**
 * Import preferences from JSON
 */
export function importPreferences(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<UserPreferences>
    saveUserPreferences(parsed)
    return true
  } catch (error) {
    console.error('Failed to import preferences:', error)
    return false
  }
}
