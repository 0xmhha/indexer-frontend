import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const ConsensusDashboard = dynamic(
  () => import('@/components/consensus/ConsensusDashboard').then((mod) => ({ default: mod.ConsensusDashboard })),
  { loading: () => <LoadingSpinner /> }
)

export const metadata: Metadata = {
  title: 'Consensus | StableNet Explorer',
  description: 'View consensus data, validator participation, and epoch information',
}

export default function ConsensusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold text-text-primary">CONSENSUS</h1>
        <p className="font-mono text-sm text-text-secondary">
          View consensus data, validator participation rates, and epoch information
        </p>
      </div>

      <ConsensusDashboard />
    </div>
  )
}
