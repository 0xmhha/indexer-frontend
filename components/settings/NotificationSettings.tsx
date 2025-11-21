'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface NotificationPreferences {
  pendingTransactions: boolean
  newLogs: boolean
  newBlocks: boolean
  playSound: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pendingTransactions: false,
  newLogs: false,
  newBlocks: true,
  playSound: false,
}

/**
 * Notification Settings Panel
 *
 * Allows users to configure WebSocket event notifications.
 * Settings are persisted in localStorage.
 */
export function NotificationSettings() {
  // Track if this is the first render to avoid saving initial load to localStorage
  const isFirstRender = useRef(true)

  // Load preferences from localStorage using lazy initialization
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    try {
      const saved = localStorage.getItem('notification-preferences')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('[Notification Settings] Failed to load preferences:', error)
    }
    return DEFAULT_PREFERENCES
  })

  // Save preferences to localStorage (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    try {
      localStorage.setItem('notification-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('[Notification Settings] Failed to save preferences:', error)
    }
  }, [preferences])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleResetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES)
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>NOTIFICATION SETTINGS</span>
          <button
            onClick={handleResetToDefaults}
            className="font-mono text-xs text-text-secondary transition-colors hover:text-accent-blue"
          >
            RESET
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="annotation mb-4">WEBSOCKET EVENT NOTIFICATIONS</div>

          {/* Pending Transactions */}
          <SettingToggle
            label="Pending Transactions"
            description="Show notification when new pending transactions arrive"
            enabled={preferences.pendingTransactions}
            onToggle={() => handleToggle('pendingTransactions')}
          />

          {/* New Logs */}
          <SettingToggle
            label="Contract Logs"
            description="Show notification when new contract logs are emitted"
            enabled={preferences.newLogs}
            onToggle={() => handleToggle('newLogs')}
          />

          {/* New Blocks */}
          <SettingToggle
            label="New Blocks"
            description="Show notification when new blocks are mined"
            enabled={preferences.newBlocks}
            onToggle={() => handleToggle('newBlocks')}
          />

          <div className="my-6 border-t border-bg-tertiary" />

          <div className="annotation mb-4">NOTIFICATION PREFERENCES</div>

          {/* Sound */}
          <SettingToggle
            label="Notification Sound"
            description="Play sound when notifications appear"
            enabled={preferences.playSound}
            onToggle={() => handleToggle('playSound')}
          />

          {/* Info */}
          <div className="mt-6 rounded border border-accent-blue/30 bg-accent-blue/5 p-4">
            <div className="mb-2 font-mono text-xs font-bold text-accent-blue">NOTE</div>
            <div className="font-mono text-xs text-text-secondary">
              Notifications are shown in the top-right corner of the screen. You can dismiss them
              manually or they will auto-close after a few seconds.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="flex-1">
        <div className="mb-1 font-mono text-sm font-medium text-text-primary">{label}</div>
        <div className="font-mono text-xs text-text-secondary">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 ${
          enabled ? 'bg-accent-blue' : 'bg-bg-tertiary'
        }`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

/**
 * Hook to access notification preferences
 *
 * @returns Current notification preferences
 */
export function useNotificationPreferences(): NotificationPreferences {
  // Load preferences from localStorage using lazy initialization
  const [preferences] = useState<NotificationPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    try {
      const saved = localStorage.getItem('notification-preferences')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('[Notification Preferences] Failed to load:', error)
    }
    return DEFAULT_PREFERENCES
  })

  return preferences
}
