import type { Metadata } from 'next'
import { WBFTBlockViewer } from '@/components/wbft/WBFTBlockViewer'
import { EpochViewer } from '@/components/wbft/EpochViewer'

export const metadata: Metadata = {
  title: 'WBFT Consensus | StableNet Explorer',
  description: 'View WBFT consensus metadata, block information, and epoch details',
}

export default function WBFTPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold text-text-primary">WBFT CONSENSUS</h1>
        <p className="font-mono text-sm text-text-secondary">
          View WBFT consensus metadata, block signers, and epoch information
        </p>
      </div>

      <div className="space-y-8">
        <EpochViewer />
        <WBFTBlockViewer />
      </div>
    </div>
  )
}
