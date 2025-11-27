import type { Metadata } from 'next'
import { ValidatorsListViewer } from '@/components/validators/ValidatorsListViewer'
import { BlacklistViewer } from '@/components/validators/BlacklistViewer'
import { ValidatorSigningStatsDashboard } from '@/components/validators/ValidatorSigningStats'

export const metadata: Metadata = {
  title: 'Validators | Stable-One Explorer',
  description: 'View validators, their signing performance, and blacklisted addresses',
}

export default function ValidatorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold text-text-primary">VALIDATORS</h1>
        <p className="font-mono text-sm text-text-secondary">
          View validators, signing performance statistics, and network governance status
        </p>
      </div>

      <div className="space-y-8">
        <ValidatorsListViewer />
        <ValidatorSigningStatsDashboard maxStats={50} />
        <BlacklistViewer />
      </div>
    </div>
  )
}
