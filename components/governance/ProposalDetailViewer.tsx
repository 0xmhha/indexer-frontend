'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useProposal, useProposalVotes, ProposalStatus, type ProposalVote } from '@/lib/hooks/useGovernance'
import { formatNumber, formatDateTime, truncateAddress, formatHash } from '@/lib/utils/format'

interface ProposalDetailViewerProps {
  contract: string
  proposalId: string
}

/**
 * Proposal Detail Viewer
 *
 * Displays detailed information about a specific governance proposal,
 * including votes, approval progress, and execution status.
 */
export function ProposalDetailViewer({ contract, proposalId }: ProposalDetailViewerProps) {
  const { proposal, loading: proposalLoading, error: proposalError, refetch } = useProposal(contract, proposalId)
  const { votes, loading: votesLoading, error: votesError } = useProposalVotes(contract, proposalId)

  if (proposalLoading && !proposal) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (proposalError) {
    return <ErrorDisplay title="Failed to load proposal" message={proposalError.message} />
  }

  if (!proposal) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="font-mono text-sm text-text-muted">Proposal not found</p>
          <Link
            href="/governance"
            className="mt-4 inline-block font-mono text-xs text-accent-blue transition-colors hover:text-accent-cyan"
          >
            ← Back to Governance
          </Link>
        </CardContent>
      </Card>
    )
  }

  const approvalPercentage =
    proposal.requiredApprovals > 0
      ? Math.round((proposal.approved / proposal.requiredApprovals) * 100)
      : 0

  const statusStyles = getStatusStyles(proposal.status)
  const approvalVotes = votes.filter((v) => v.approval)
  const rejectionVotes = votes.filter((v) => !v.approval)

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
        <Link href="/governance" className="transition-colors hover:text-accent-blue">
          Governance
        </Link>
        <span>/</span>
        <span className="text-text-secondary">Proposal #{proposalId}</span>
      </div>

      {/* Proposal Header */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <CardTitle>PROPOSAL #{proposalId}</CardTitle>
                <span className={`rounded border px-2 py-0.5 font-mono text-xs ${statusStyles.badge}`}>
                  {proposal.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs text-text-muted">
                <div>Action Type: <span className="text-text-secondary">{proposal.actionType}</span></div>
                <div>Created: <span className="text-text-secondary">{formatDateTime(proposal.createdAt)}</span></div>
                {proposal.executedAt && (
                  <div>Executed: <span className="text-text-secondary">{formatDateTime(proposal.executedAt)}</span></div>
                )}
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
              aria-label="Refresh proposal"
            >
              ↻ REFRESH
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Approval Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-text-primary">Approval Progress</span>
                <span className="font-mono text-sm text-text-secondary">
                  {proposal.approved} / {proposal.requiredApprovals} ({approvalPercentage}%)
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full bg-accent-green transition-all"
                  style={{ width: `${Math.min(approvalPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-accent-green">
                  ✓ Approved: {proposal.approved} ({approvalVotes.length} votes)
                </span>
                {proposal.rejected > 0 && (
                  <span className="text-accent-red">
                    ✗ Rejected: {proposal.rejected} ({rejectionVotes.length} votes)
                  </span>
                )}
              </div>
            </div>

            {/* Proposal Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Contract Address" value={proposal.contract} copyable />
              <DetailItem label="Proposer" value={proposal.proposer} copyable />
              <DetailItem label="Member Version" value={proposal.memberVersion} />
              <DetailItem label="Block Number" value={formatNumber(BigInt(proposal.blockNumber))} />
              <DetailItem label="Transaction Hash" value={proposal.transactionHash} copyable hash />
              <DetailItem label="Required Approvals" value={proposal.requiredApprovals.toString()} />
            </div>

            {/* Call Data */}
            {proposal.callData && proposal.callData !== '0x' && (
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold text-text-primary">Call Data</div>
                <div className="overflow-x-auto rounded border border-bg-tertiary bg-bg-secondary p-4">
                  <code className="font-mono text-xs text-text-secondary break-all">{proposal.callData}</code>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Votes Section */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VOTES ({votes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {votesLoading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : votesError ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load votes" message={votesError.message} />
            </div>
          ) : votes.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="font-mono text-sm text-text-muted">No votes recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-bg-tertiary">
              {/* Approval Votes */}
              {approvalVotes.length > 0 && (
                <div className="p-4">
                  <div className="mb-3 font-mono text-xs font-bold text-accent-green">
                    APPROVED ({approvalVotes.length})
                  </div>
                  <div className="space-y-2">
                    {approvalVotes.map((vote, idx) => (
                      <VoteCard key={`${vote.transactionHash}-${idx}`} vote={vote} />
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Votes */}
              {rejectionVotes.length > 0 && (
                <div className="p-4">
                  <div className="mb-3 font-mono text-xs font-bold text-accent-red">
                    REJECTED ({rejectionVotes.length})
                  </div>
                  <div className="space-y-2">
                    {rejectionVotes.map((vote, idx) => (
                      <VoteCard key={`${vote.transactionHash}-${idx}`} vote={vote} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({
  label,
  value,
  copyable = false,
  hash = false,
}: {
  label: string
  value: string
  copyable?: boolean
  hash?: boolean
}) {
  const displayValue = hash ? formatHash(value) : copyable ? truncateAddress(value) : value

  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-text-secondary" title={value}>
          {displayValue}
        </span>
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="rounded border border-bg-tertiary bg-bg-primary px-2 py-0.5 font-mono text-xs text-text-muted transition-colors hover:border-accent-blue hover:text-accent-blue"
            aria-label={`Copy ${label}`}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}

function VoteCard({ vote }: { vote: ProposalVote }) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-primary p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Voter</div>
          <div className="font-mono text-xs text-text-secondary" title={vote.voter}>
            {truncateAddress(vote.voter)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Block</div>
          <div className="font-mono text-xs text-text-secondary">{formatNumber(BigInt(vote.blockNumber))}</div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Timestamp</div>
          <div className="font-mono text-xs text-text-secondary">{formatDateTime(vote.timestamp)}</div>
        </div>
      </div>
      <div className="mt-2 font-mono text-xs text-text-muted">
        Tx:{' '}
        <span className="text-text-secondary" title={vote.transactionHash}>
          {formatHash(vote.transactionHash)}
        </span>
      </div>
    </div>
  )
}

function getStatusStyles(status: string): {
  badge: string
} {
  switch (status) {
    case ProposalStatus.VOTING:
      return {
        badge: 'border-accent-blue bg-accent-blue/10 text-accent-blue',
      }
    case ProposalStatus.APPROVED:
      return {
        badge: 'border-accent-green bg-accent-green/10 text-accent-green',
      }
    case ProposalStatus.EXECUTED:
      return {
        badge: 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan',
      }
    case ProposalStatus.REJECTED:
    case ProposalStatus.FAILED:
      return {
        badge: 'border-accent-red bg-accent-red/10 text-accent-red',
      }
    case ProposalStatus.CANCELLED:
    case ProposalStatus.EXPIRED:
      return {
        badge: 'border-text-muted bg-bg-tertiary text-text-muted',
      }
    default:
      return {
        badge: 'border-bg-tertiary bg-bg-secondary text-text-secondary',
      }
  }
}
