'use client'

import Link from 'next/link'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useProposalVotes } from '@/lib/hooks/useGovernance'
import { truncateAddress } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

interface ProposalVotesDetailProps {
  contract: string
  proposalId: string
  isVisible: boolean
}

export function ProposalVotesDetail({ contract, proposalId, isVisible }: ProposalVotesDetailProps) {
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
