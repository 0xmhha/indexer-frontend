import type { Metadata } from 'next'
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard'
import { ProposalsListViewer } from '@/components/governance/ProposalsListViewer'

export const metadata: Metadata = {
  title: 'Governance | StableNet Explorer',
  description: 'View governance proposals, votes, and validator information',
}

export default function GovernancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-3xl font-bold text-text-primary">GOVERNANCE</h1>
        <p className="font-mono text-sm text-text-secondary">
          View and track governance proposals, votes, and validator activities
        </p>
      </div>

      <div className="mb-8">
        <GovernanceDashboard />
      </div>

      <ProposalsListViewer maxProposals={50} />
    </div>
  )
}
