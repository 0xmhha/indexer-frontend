'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import {
  useProposals,
  useProposalVotes,
  SYSTEM_CONTRACTS,
  getProposalStatusLabel,
  getProposalStatusColor,
  type Proposal,
  type ProposalStatusFilter,
} from '@/lib/hooks/useSystemContracts'
import { formatDateTime, truncateAddress } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

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

  // Group proposals by status for summary
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
      // Backend returns uppercase status values
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

interface ProposalItemProps {
  proposal: Proposal
  isExpanded: boolean
  onToggle: () => void
}

function ProposalItem({ proposal, isExpanded, onToggle }: ProposalItemProps) {
  const statusColor = getProposalStatusColor(proposal.status)
  // Backend uses 'approved' and 'rejected' for vote counts
  const totalVotes = proposal.approved + proposal.rejected
  const yesPercentage = totalVotes > 0 ? (proposal.approved / totalVotes) * 100 : 0

  return (
    <div className="transition-colors hover:bg-bg-secondary">
      {/* Main Row */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggle()
          }
        }}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-text-primary">
              #{proposal.proposalId}
            </span>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${statusColor} border-current/30 bg-current/10`}
            >
              {getProposalStatusLabel(proposal.status)}
            </span>
          </div>
          <div className="font-mono text-xs text-text-muted">
            Action: <span className="text-text-secondary">{proposal.actionType}</span>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-text-muted">
            <span>
              Proposer:{' '}
              <Link
                href={`/address/${proposal.proposer}`}
                className="text-accent-blue hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {truncateAddress(proposal.proposer)}
              </Link>
            </span>
            <span>Created: {formatDateTime(proposal.createdAt)}</span>
          </div>
        </div>

        {/* Vote Summary */}
        <div className="ml-4 flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-xs text-text-muted">Votes</div>
            <div className="font-mono text-sm">
              <span className="text-accent-green">{proposal.approved}</span>
              <span className="text-text-muted"> / </span>
              <span className="text-accent-red">{proposal.rejected}</span>
            </div>
          </div>
          <div className={`text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            &#x25BC;
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-bg-tertiary bg-bg-secondary p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Left Column - Details */}
            <div className="space-y-3">
              <div>
                <div className="font-mono text-xs text-text-muted">Contract</div>
                <div className="font-mono text-sm text-text-secondary">{proposal.contract}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-text-muted">Created At</div>
                <div className="font-mono text-sm text-text-secondary">
                  {formatDateTime(proposal.createdAt)}
                </div>
              </div>
              {proposal.executedAt && (
                <div>
                  <div className="font-mono text-xs text-text-muted">Executed At</div>
                  <div className="font-mono text-sm text-text-secondary">
                    {formatDateTime(proposal.executedAt)}
                  </div>
                </div>
              )}
              {proposal.callData && (
                <div>
                  <div className="font-mono text-xs text-text-muted">Call Data</div>
                  <div className="max-h-20 overflow-auto rounded border border-bg-tertiary bg-bg-primary p-2 font-mono text-xs text-text-secondary">
                    {proposal.callData}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Vote Visualization */}
            <div className="space-y-3">
              <div className="font-mono text-xs text-text-muted">Vote Distribution</div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full bg-accent-green transition-all"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-accent-green">
                  Yes: {proposal.approved} ({yesPercentage.toFixed(1)}%)
                </span>
                <span className="text-accent-red">
                  No: {proposal.rejected} ({(100 - yesPercentage).toFixed(1)}%)
                </span>
              </div>

              {/* Proposal Votes Detail (lazy loaded) */}
              <ProposalVotesDetail
                contract={proposal.contract}
                proposalId={proposal.proposalId}
                isVisible={isExpanded}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProposalVotesDetailProps {
  contract: string
  proposalId: string
  isVisible: boolean
}

function ProposalVotesDetail({ contract, proposalId, isVisible }: ProposalVotesDetailProps) {
  const { votes, loading, error } = useProposalVotes(
    isVisible ? contract : '',
    isVisible ? proposalId : ''
  )

  if (!isVisible) {return null}

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
        <LoadingSpinner size="sm" />
        <span>Loading votes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="font-mono text-xs text-accent-red">
        Failed to load votes: {error.message}
      </div>
    )
  }

  if (votes.length === 0) {
    return <div className="font-mono text-xs text-text-muted">No votes recorded yet</div>
  }

  return (
    <div className="space-y-2">
      <div className="font-mono text-xs text-text-muted">Recent Votes ({votes.length})</div>
      <div className="max-h-32 space-y-1 overflow-auto">
        {votes.slice(0, UI.MAX_LIST_PREVIEW).map((vote, idx) => (
          <div
            key={`${vote.voter}-${idx}`}
            className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-primary px-2 py-1"
          >
            <Link
              href={`/address/${vote.voter}`}
              className="font-mono text-xs text-accent-blue hover:underline"
            >
              {truncateAddress(vote.voter)}
            </Link>
            <span
              className={`font-mono text-xs font-semibold ${
                vote.approval ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {vote.approval ? 'YES' : 'NO'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Compact Governance Summary Card
 * For use in dashboards showing quick proposal overview
 */
export function GovernanceSummaryCard() {
  const { proposals: masterMinterProposals, loading: mmLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovMasterMinter,
    status: 'voting',
    limit: 10,
  })

  const { proposals: minterProposals, loading: mLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovMinter,
    status: 'voting',
    limit: 10,
  })

  const { proposals: councilProposals, loading: cLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovCouncil,
    status: 'voting',
    limit: 10,
  })

  const loading = mmLoading || mLoading || cLoading

  const totalActiveVoting =
    masterMinterProposals.length + minterProposals.length + councilProposals.length

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>GOVERNANCE</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-accent-blue">
                {totalActiveVoting}
              </div>
              <div className="font-mono text-xs text-text-muted">Active Proposals</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {masterMinterProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">MasterMinter</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {minterProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">Minter</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {councilProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">Council</div>
              </div>
            </div>
            <Link
              href="/system-contracts"
              className="block rounded border border-bg-tertiary bg-bg-secondary p-2 text-center font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
            >
              View All Proposals
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
