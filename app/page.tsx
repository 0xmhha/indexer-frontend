'use client'

import { LatestBlockCard } from '@/components/blocks/LatestBlockCard'
import { RecentBlocksList } from '@/components/blocks/RecentBlocksList'
import { NetworkStats } from '@/components/common/NetworkStats'
import { LiveIndicator } from '@/components/common/LiveIndicator'
import { AdvancedPendingTransactionsPanel } from '@/components/transactions/AdvancedPendingTransactionsPanel'
import { RealtimeActivityChart } from '@/components/charts/RealtimeActivityChart'

// Force dynamic rendering for real-time WebSocket features
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="annotation mb-4">CRYSTALLINE INFRASTRUCTURE v0.2.0</div>
        <h1 className="mb-4 font-mono text-4xl font-bold text-accent-blue">STABLENET EXPLORER</h1>
        <p className="mb-6 text-sm text-text-secondary">
          BLOCKCHAIN INDEXER • REAL-TIME SYNC • GRAPHQL API
        </p>
        <LiveIndicator />
      </div>

      {/* Network Statistics */}
      <div className="mb-8">
        <NetworkStats />
      </div>

      {/* Real-time Activity Chart */}
      <div className="mb-8">
        <RealtimeActivityChart />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest Block - Spans 1 column */}
        <div className="lg:col-span-1">
          <LatestBlockCard />
        </div>

        {/* Recent Blocks - Spans 2 columns */}
        <div className="lg:col-span-2">
          <RecentBlocksList />
        </div>
      </div>

      {/* Advanced Pending Transactions - Full width real-time feed with filters */}
      <div className="mt-8">
        <AdvancedPendingTransactionsPanel maxTransactions={20} />
      </div>

      {/* Info Footer */}
      <div className="mt-12 border-t border-bg-tertiary pt-8 text-center">
        <p className="font-mono text-xs text-text-muted">
          BLOCK_MATRIX • HEIGHT: 0x000000 → 0xFFFFFF • REAL-TIME DATA FEED
        </p>
      </div>
    </div>
  )
}
