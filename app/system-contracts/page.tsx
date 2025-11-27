import type { Metadata } from 'next'
import { TokenSupplyDashboard } from '@/components/systemContracts/TokenSupplyDashboard'
import { MintBurnEventsViewer } from '@/components/systemContracts/MintBurnEventsViewer'
import { ActiveMintersPanel } from '@/components/systemContracts/ActiveMintersPanel'
import { GovernanceProposalsViewer } from '@/components/systemContracts/GovernanceProposalsViewer'

export const metadata: Metadata = {
  title: 'System Contracts',
  description: 'Token supply management, mint/burn events, governance proposals, and active minters',
}

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

/**
 * System Contracts Page
 *
 * Displays comprehensive information about system contracts including:
 * - Token supply dashboard
 * - Governance proposals viewer
 * - Mint/burn events viewer
 * - Active minters management
 */
export default function SystemContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">TOKEN MANAGEMENT</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">SYSTEM CONTRACTS</h1>
        <p className="font-mono text-sm text-text-secondary">
          Monitor token supply, governance proposals, mint/burn events, and active minters
        </p>
      </div>

      {/* Token Supply Dashboard */}
      <div className="mb-8">
        <TokenSupplyDashboard />
      </div>

      {/* Governance Proposals Viewer */}
      <div className="mb-8">
        <GovernanceProposalsViewer maxProposals={20} />
      </div>

      {/* Mint/Burn Events Viewer */}
      <div className="mb-8">
        <MintBurnEventsViewer maxEvents={50} />
      </div>

      {/* Active Minters Panel */}
      <div>
        <ActiveMintersPanel />
      </div>
    </div>
  )
}
