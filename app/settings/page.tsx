import type { Metadata } from 'next'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { UserPreferencesSettings } from '@/components/settings/UserPreferencesSettings'
import { NetworkSettings } from '@/components/settings/NetworkSettings'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure network connections, notification preferences, and application settings',
}

/**
 * Settings Page
 *
 * User preferences and application configuration.
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold uppercase tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="font-mono text-sm text-text-secondary">
          Configure network connections, notification preferences, and application settings
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        <NetworkSettings />
        <UserPreferencesSettings />
        <NotificationSettings />
      </div>
    </div>
  )
}
