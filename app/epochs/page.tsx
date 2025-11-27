import type { Metadata } from 'next'
import { EpochsListViewer } from '@/components/epochs/EpochsListViewer'

export const metadata: Metadata = {
  title: 'Epochs | Stable-One Explorer',
  description: 'View epoch history and validator set changes',
}

export default function EpochsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold text-text-primary">EPOCHS</h1>
        <p className="font-mono text-sm text-text-secondary">
          View epoch history, validator set changes, and candidate information
        </p>
      </div>

      <EpochsListViewer />
    </div>
  )
}
