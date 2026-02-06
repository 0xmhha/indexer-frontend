'use client'

import { useUserPreferences } from '@/lib/hooks/useUserPreferences'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { exportPreferences, importPreferences } from '@/lib/store/userPreferences'
import { useState } from 'react'
import { TIMEOUTS } from '@/lib/config/constants'

export function UserPreferencesSettings() {
  const { preferences, updatePreference, resetPreferences, loading } = useUserPreferences()
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleExport = () => {
    const json = exportPreferences()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `preferences_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {return}

      try {
        const text = await file.text()
        const success = importPreferences(text)
        if (success) {
          setImportSuccess(true)
          setImportError(null)
          setTimeout(() => setImportSuccess(false), TIMEOUTS.IMPORT_SUCCESS_DURATION)
          window.location.reload() // Reload to apply all changes
        } else {
          setImportError('Failed to import preferences. Invalid format.')
          setTimeout(() => setImportError(null), TIMEOUTS.IMPORT_ERROR_DURATION)
        }
      } catch {
        setImportError('Failed to read file.')
        setTimeout(() => setImportError(null), TIMEOUTS.IMPORT_ERROR_DURATION)
      }
    }
    input.click()
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences to default values?')) {
      resetPreferences()
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>USER PREFERENCES</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-text-muted">Loading preferences...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>USER PREFERENCES</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Theme */}
        <div className="space-y-2">
          <label htmlFor="theme" className="font-mono text-sm font-medium text-text-primary">
            Theme
          </label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) => updatePreference('theme', e.target.value as 'light' | 'dark' | 'system')}
            className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <p className="font-mono text-xs text-text-muted">Choose your preferred color theme</p>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label htmlFor="language" className="font-mono text-sm font-medium text-text-primary">
            Language
          </label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) => updatePreference('language', e.target.value as 'en' | 'ko' | 'ja' | 'zh')}
            className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
          <p className="font-mono text-xs text-text-muted">Select your preferred language</p>
        </div>

        {/* Items Per Page */}
        <div className="space-y-2">
          <label htmlFor="itemsPerPage" className="font-mono text-sm font-medium text-text-primary">
            Default Items Per Page
          </label>
          <select
            id="itemsPerPage"
            value={preferences.itemsPerPage}
            onChange={(e) => updatePreference('itemsPerPage', Number(e.target.value))}
            className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <p className="font-mono text-xs text-text-muted">
            Default number of items to display per page in lists
          </p>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label htmlFor="dateFormat" className="font-mono text-sm font-medium text-text-primary">
            Date Format
          </label>
          <select
            id="dateFormat"
            value={preferences.dateFormat}
            onChange={(e) =>
              updatePreference('dateFormat', e.target.value as 'relative' | 'absolute' | 'both')
            }
            className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
          >
            <option value="relative">Relative (e.g., &quot;2 hours ago&quot;)</option>
            <option value="absolute">Absolute (e.g., &quot;2024-01-15 14:30:00&quot;)</option>
            <option value="both">Both</option>
          </select>
          <p className="font-mono text-xs text-text-muted">How timestamps should be displayed</p>
        </div>

        {/* Auto Refresh */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={preferences.autoRefresh}
              onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
              className="h-4 w-4 border border-bg-tertiary bg-bg-secondary text-accent-blue focus:ring-2 focus:ring-accent-blue"
            />
            <label htmlFor="autoRefresh" className="font-mono text-sm font-medium text-text-primary">
              Auto Refresh
            </label>
          </div>
          <p className="font-mono text-xs text-text-muted">
            Automatically refresh data at regular intervals
          </p>
        </div>

        {/* Refresh Interval */}
        {preferences.autoRefresh && (
          <div className="space-y-2">
            <label
              htmlFor="refreshInterval"
              className="font-mono text-sm font-medium text-text-primary"
            >
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              id="refreshInterval"
              min={5}
              max={300}
              value={preferences.refreshInterval}
              onChange={(e) => updatePreference('refreshInterval', Number(e.target.value))}
              className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-sm text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
            />
            <p className="font-mono text-xs text-text-muted">How often to refresh data (5-300 seconds)</p>
          </div>
        )}

        {/* Show Test Transactions */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showTestTransactions"
              checked={preferences.showTestTransactions}
              onChange={(e) => updatePreference('showTestTransactions', e.target.checked)}
              className="h-4 w-4 border border-bg-tertiary bg-bg-secondary text-accent-blue focus:ring-2 focus:ring-accent-blue"
            />
            <label
              htmlFor="showTestTransactions"
              className="font-mono text-sm font-medium text-text-primary"
            >
              Show Test Transactions
            </label>
          </div>
          <p className="font-mono text-xs text-text-muted">
            Include test/dummy transactions in lists
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-bg-tertiary pt-6">
          <button
            onClick={handleExport}
            className="btn-hex px-4 py-2 text-xs"
            aria-label="Export preferences"
          >
            EXPORT PREFERENCES
          </button>
          <button
            onClick={handleImport}
            className="btn-hex px-4 py-2 text-xs"
            aria-label="Import preferences"
          >
            IMPORT PREFERENCES
          </button>
          <button
            onClick={handleReset}
            className="border border-error bg-transparent px-4 py-2 font-mono text-xs text-error transition-colors hover:bg-error hover:text-bg-primary"
            aria-label="Reset preferences"
          >
            RESET TO DEFAULTS
          </button>
        </div>

        {/* Status Messages */}
        {importError && (
          <div className="rounded border border-error bg-error/10 p-3">
            <p className="font-mono text-xs text-error">{importError}</p>
          </div>
        )}
        {importSuccess && (
          <div className="rounded border border-accent-green bg-accent-green/10 p-3">
            <p className="font-mono text-xs text-accent-green">
              Preferences imported successfully! Reloading...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
