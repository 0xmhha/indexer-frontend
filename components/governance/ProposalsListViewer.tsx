'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useProposals, type Proposal, ProposalStatus } from '@/lib/hooks/useGovernance'
import { formatNumber, formatDateTime, truncateAddress } from '@/lib/utils/format'

interface ProposalsListViewerProps {
  maxProposals?: number
  contract?: string
}

/**
 * Proposals List Viewer
 *
 * Displays governance proposals with filtering by status and proposer.
 * Shows proposal details, approval progress, and status.
 */
export function ProposalsListViewer({ maxProposals = 50, contract }: ProposalsListViewerProps) {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | ''>('')
  const [proposerFilter, setProposerFilter] = useState('')

  const {
    proposals,
    totalCount,
    loading,
    error,
    refetch,
  } = useProposals({
    limit: maxProposals,
    ...(contract && { contract }),
    ...(statusFilter && { status: statusFilter }),
    ...(proposerFilter && { proposer: proposerFilter }),
  })

  const handleStatusFilterChange = (status: ProposalStatus | '') => {
    setStatusFilter(status)
  }

  const handleProposerFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProposerFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setProposerFilter('')
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>GOVERNANCE PROPOSALS</CardTitle>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-secondary">
              Total: {formatNumber(totalCount)}
            </span>
            <button
              onClick={() => refetch()}
              className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
              aria-label="Refresh proposals"
            >
              ↻
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="border-b border-bg-tertiary bg-bg-secondary p-4">
        <div className="flex flex-col gap-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-xs text-text-muted">Status:</span>
            <button
              onClick={() => handleStatusFilterChange('')}
              className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
                statusFilter === ''
                  ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                  : 'border-bg-tertiary bg-bg-primary text-text-secondary hover:border-accent-blue'
              }`}
            >
              All
            </button>
            {Object.values(ProposalStatus).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
                  statusFilter === status
                    ? getStatusStyles(status).active
                    : 'border-bg-tertiary bg-bg-primary text-text-secondary hover:border-accent-blue'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Proposer Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={proposerFilter}
                onChange={handleProposerFilterChange}
                placeholder="Filter by proposer address..."
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>
            {(statusFilter || proposerFilter) && (
              <button
                onClick={handleClearFilters}
                className="rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay title="Failed to load proposals" message={error.message} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">No proposals found</p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {proposals.map((proposal) => (
              <ProposalCard key={`${proposal.contract}-${proposal.proposalId}`} proposal={proposal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const approvalPercentage =
    proposal.requiredApprovals > 0
      ? Math.round((proposal.approved / proposal.requiredApprovals) * 100)
      : 0

  const statusStyles = getStatusStyles(proposal.status)

  return (
    <Link
      href={`/governance/${proposal.contract}/${proposal.proposalId}`}
      className="block p-4 transition-colors hover:bg-bg-secondary"
    >
      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-text-primary">
                Proposal #{proposal.proposalId}
              </span>
              <span className={`rounded border px-2 py-0.5 font-mono text-xs ${statusStyles.badge}`}>
                {proposal.status.toUpperCase()}
              </span>
            </div>
            <div className="font-mono text-xs text-text-muted">
              Action: <span className="text-text-secondary">{proposal.actionType}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-text-muted">
              Block {formatNumber(BigInt(proposal.blockNumber))}
            </div>
            <div className="font-mono text-xs text-text-muted">{formatDateTime(proposal.createdAt)}</div>
          </div>
        </div>

        {/* Approval Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">Approval Progress</span>
            <span className="font-mono text-xs text-text-secondary">
              {proposal.approved} / {proposal.requiredApprovals} ({approvalPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className="h-full bg-accent-green transition-all"
              style={{ width: `${Math.min(approvalPercentage, 100)}%` }}
            />
          </div>
          {proposal.rejected > 0 && (
            <div className="font-mono text-xs text-accent-red">Rejected: {proposal.rejected}</div>
          )}
        </div>

        {/* Details Row */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="font-mono text-xs text-text-muted">
            Proposer:{' '}
            <span className="text-text-secondary" title={proposal.proposer}>
              {truncateAddress(proposal.proposer)}
            </span>
          </div>
          <div className="font-mono text-xs text-text-muted">
            Contract:{' '}
            <span className="text-text-secondary" title={proposal.contract}>
              {truncateAddress(proposal.contract)}
            </span>
          </div>
          <div className="font-mono text-xs text-text-muted">
            Member Version: <span className="text-text-secondary">{proposal.memberVersion}</span>
          </div>
          {proposal.executedAt && (
            <div className="font-mono text-xs text-text-muted">
              Executed: <span className="text-text-secondary">{formatDateTime(proposal.executedAt)}</span>
            </div>
          )}
        </div>

        {/* Call Data Preview */}
        {proposal.callData && proposal.callData !== '0x' && (
          <div className="font-mono text-xs text-text-muted">
            Call Data:{' '}
            <span className="text-text-secondary">
              {proposal.callData.slice(0, 66)}
              {proposal.callData.length > 66 && '...'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function getStatusStyles(status: ProposalStatus): {
  badge: string
  active: string
} {
  switch (status) {
    case ProposalStatus.VOTING:
      return {
        badge: 'border-accent-blue bg-accent-blue/10 text-accent-blue',
        active: 'border-accent-blue bg-accent-blue/10 text-accent-blue',
      }
    case ProposalStatus.APPROVED:
      return {
        badge: 'border-accent-green bg-accent-green/10 text-accent-green',
        active: 'border-accent-green bg-accent-green/10 text-accent-green',
      }
    case ProposalStatus.EXECUTED:
      return {
        badge: 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan',
        active: 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan',
      }
    case ProposalStatus.REJECTED:
    case ProposalStatus.FAILED:
      return {
        badge: 'border-accent-red bg-accent-red/10 text-accent-red',
        active: 'border-accent-red bg-accent-red/10 text-accent-red',
      }
    case ProposalStatus.CANCELLED:
    case ProposalStatus.EXPIRED:
      return {
        badge: 'border-text-muted bg-bg-tertiary text-text-muted',
        active: 'border-text-muted bg-bg-tertiary text-text-muted',
      }
    default:
      return {
        badge: 'border-bg-tertiary bg-bg-secondary text-text-secondary',
        active: 'border-bg-tertiary bg-bg-secondary text-text-secondary',
      }
  }
}
