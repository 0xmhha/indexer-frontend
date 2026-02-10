'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import {
  useProposals,
  SYSTEM_CONTRACTS,
  getProposalStatusLabel,
  type ProposalStatusFilter,
} from '@/lib/hooks/useGovernance'
import { UI } from '@/lib/config/constants'
import { ProposalItem } from './ProposalItem'

/**
 * Available governance contract options
 */
const GOVERNANCE_CONTRACTS = [
  { value: SYSTEM_CONTRACTS.GovMasterMinter, label: 'GovMasterMinter (0x1002)' },
  { value: SYSTEM_CONTRACTS.GovMinter, label: 'GovMinter (0x1003)' },
  { value: SYSTEM_CONTRACTS.GovCouncil, label: 'GovCouncil (0x1004)' },
] as const

/**
 * Available status filter options
 */
const STATUS_OPTIONS: ProposalStatusFilter[] = [
  'all',
  'voting',
  'approved',
  'executed',
  'rejected',
  'cancelled',
  'expired',
  'failed',
]

interface GovernanceProposalsViewerProps {
  maxProposals?: number
}

/**
 * Governance Proposals Viewer
 *
 * Displays governance proposals with filtering by contract and status.
 * Supports viewing proposal details and vote information.
 */
export function GovernanceProposalsViewer({
  maxProposals = UI.MAX_VIEWER_ITEMS,
}: GovernanceProposalsViewerProps) {
  const [selectedContract, setSelectedContract] = useState<string>(GOVERNANCE_CONTRACTS[0].value)
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatusFilter>('all')
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null)

  const {
    proposals,
    loading,
    error,
    refetch,
  } = useProposals({
    contract: selectedContract,
    status: selectedStatus,
    limit: maxProposals,
  })

  const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContract(e.target.value)
    setExpandedProposal(null)
  }

  const handleStatusChange = (status: ProposalStatusFilter) => {
    setSelectedStatus(status)
    setExpandedProposal(null)
  }

  const toggleProposalExpansion = (proposalId: string) => {
    setExpandedProposal((prev) => (prev === proposalId ? null : proposalId))
  }

  const proposalSummary = useMemo(() => {
    const summary = {
      total: proposals.length,
      voting: 0,
      approved: 0,
      executed: 0,
      rejected: 0,
      other: 0,
    }

    for (const proposal of proposals) {
      switch (proposal.status) {
        case 'VOTING':
          summary.voting++
          break
        case 'APPROVED':
          summary.approved++
          break
        case 'EXECUTED':
          summary.executed++
          break
        case 'REJECTED':
          summary.rejected++
          break
        default:
          summary.other++
      }
    }

    return summary
  }, [proposals])

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle>GOVERNANCE PROPOSALS</CardTitle>
            <button
              onClick={() => refetch()}
              className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
            >
              REFRESH
            </button>
          </div>

          {/* Contract Selector */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="font-mono text-xs text-text-muted">Contract:</label>
            <select
              value={selectedContract}
              onChange={handleContractChange}
              className="flex-1 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
            >
              {GOVERNANCE_CONTRACTS.map((contract) => (
                <option key={contract.value} value={contract.value}>
                  {contract.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2 border-b border-bg-tertiary bg-bg-secondary p-4">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
              selectedStatus === status
                ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                : 'border-bg-tertiary bg-bg-primary text-text-secondary hover:border-accent-blue hover:text-accent-blue'
            }`}
          >
            {getProposalStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 border-b border-bg-tertiary bg-bg-secondary p-4 sm:grid-cols-5">
        <div className="text-center">
          <div className="font-mono text-xs text-text-muted">Total</div>
          <div className="font-mono text-lg font-bold text-text-primary">{proposalSummary.total}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-text-muted">Voting</div>
          <div className="font-mono text-lg font-bold text-accent-blue">{proposalSummary.voting}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-text-muted">Approved</div>
          <div className="font-mono text-lg font-bold text-accent-cyan">{proposalSummary.approved}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-text-muted">Executed</div>
          <div className="font-mono text-lg font-bold text-accent-green">{proposalSummary.executed}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-text-muted">Rejected</div>
          <div className="font-mono text-lg font-bold text-accent-red">{proposalSummary.rejected}</div>
        </div>
      </div>

      <CardContent className="p-0">
        {loading && proposals.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay title="Failed to load proposals" message={error.message} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">
              No proposals found for the selected filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {proposals.map((proposal) => (
              <ProposalItem
                key={proposal.proposalId}
                proposal={proposal}
                isExpanded={expandedProposal === proposal.proposalId}
                onToggle={() => toggleProposalExpansion(proposal.proposalId)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
