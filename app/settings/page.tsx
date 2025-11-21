import type { Metadata } from 'next'
import { NotificationSettings } from '@/components/settings/NotificationSettings'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure notification preferences and application settings',
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
          Configure your notification preferences and application settings
        </p>
      </div>

      <div className="max-w-4xl">
        <NotificationSettings />
      </div>
    </div>
  )
}
