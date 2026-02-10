'use client'

import Link from 'next/link'
import {
  getProposalStatusLabel,
  getProposalStatusColor,
  type Proposal,
} from '@/lib/hooks/useGovernance'
import { formatDateTime, truncateAddress } from '@/lib/utils/format'
import { ProposalVotesDetail } from './ProposalVotesDetail'

interface ProposalItemProps {
  proposal: Proposal
  isExpanded: boolean
  onToggle: () => void
}

export function ProposalItem({ proposal, isExpanded, onToggle }: ProposalItemProps) {
  const statusColor = getProposalStatusColor(proposal.status)
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
