'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/common/StatCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import {
  useProposals,
  useActiveValidators,
  useBlacklistedAddresses,
  ProposalStatus,
  type Proposal,
} from '@/lib/hooks/useGovernance'
import { formatNumber, formatDateTime, truncateAddress } from '@/lib/utils/format'
import { UI, BLOCKCHAIN } from '@/lib/config/constants'

/**
 * Governance Dashboard
 *
 * Overview dashboard showing governance statistics, recent proposals,
 * validators, and blacklisted addresses.
 */
export function GovernanceDashboard() {
  // Fetch all proposals to calculate statistics
  const {
    proposals,
    totalCount: totalProposals,
    loading: proposalsLoading,
    error: proposalsError,
  } = useProposals({ limit: UI.GOVERNANCE_PROPOSALS_LIMIT })

  const { validators, loading: validatorsLoading } = useActiveValidators()
  const { addresses: blacklistedAddresses, loading: blacklistLoading } = useBlacklistedAddresses()

  const loading = proposalsLoading && !proposals.length

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (proposalsError) {
    return <ErrorDisplay title="Failed to load governance data" message={proposalsError.message} />
  }

  // Calculate proposal statistics
  const votingCount = proposals.filter((p) => p.status === ProposalStatus.VOTING).length
  const approvedCount = proposals.filter((p) => p.status === ProposalStatus.APPROVED).length
  const executedCount = proposals.filter((p) => p.status === ProposalStatus.EXECUTED).length
  const rejectedCount = proposals.filter(
    (p) => p.status === ProposalStatus.REJECTED || p.status === ProposalStatus.FAILED
  ).length

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="TOTAL PROPOSALS"
          value={formatNumber(totalProposals)}
          icon="📋"
          color="text-accent-blue"
          link="/governance"
        />
        <StatCard
          label="VOTING"
          value={votingCount.toString()}
          icon="🗳️"
          color="text-accent-cyan"
          subtitle="In progress"
        />
        <StatCard
          label="ACTIVE VALIDATORS"
          value={validatorsLoading ? '...' : validators.length.toString()}
          icon="⚡"
          color="text-accent-green"
        />
        <StatCard
          label="BLACKLISTED"
          value={blacklistLoading ? '...' : blacklistedAddresses.length.toString()}
          icon="🚫"
          color="text-accent-red"
        />
      </div>

      {/* Proposal Status Breakdown */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PROPOSAL STATUS BREAKDOWN</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatusItem label="Voting" count={votingCount} color="text-accent-blue" />
            <StatusItem label="Approved" count={approvedCount} color="text-accent-green" />
            <StatusItem label="Executed" count={executedCount} color="text-accent-cyan" />
            <StatusItem label="Rejected/Failed" count={rejectedCount} color="text-accent-red" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Proposals */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex items-center justify-between">
            <CardTitle>RECENT PROPOSALS</CardTitle>
            <Link
              href="/governance"
              className="font-mono text-xs text-accent-blue transition-colors hover:text-accent-cyan"
            >
              View All →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {proposalsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="font-mono text-sm text-text-muted">No proposals found</p>
            </div>
          ) : (
            <div className="divide-y divide-bg-tertiary">
              {proposals.slice(0, UI.MAX_LIST_PREVIEW).map((proposal) => (
                <RecentProposalCard key={`${proposal.contract}-${proposal.proposalId}`} proposal={proposal} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validators Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Validators */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>ACTIVE VALIDATORS ({validators.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {validatorsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : validators.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No active validators</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {validators.slice(0, UI.MAX_LIST_PREVIEW).map((validator, idx) => (
                  <div key={`${validator.address}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent-green" />
                        <span className="font-mono text-xs text-text-secondary" title={validator.address}>
                          {truncateAddress(validator.address)}
                        </span>
                      </div>
                      <span className="rounded border border-accent-green bg-accent-green/10 px-2 py-0.5 font-mono text-xs text-accent-green">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blacklisted Addresses */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>BLACKLISTED ADDRESSES ({blacklistedAddresses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {blacklistLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : blacklistedAddresses.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No blacklisted addresses</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {blacklistedAddresses.slice(0, UI.MAX_LIST_PREVIEW).map((address, idx) => (
                  <div key={`${address}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent-red" />
                      <span className="font-mono text-xs text-text-secondary" title={address}>
                        {truncateAddress(address)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


function StatusItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-1 font-mono text-xs text-text-muted">{label}</div>
      <div className={`font-mono text-2xl font-bold ${color}`}>{count}</div>
    </div>
  )
}

function RecentProposalCard({ proposal }: { proposal: Proposal }) {
  const approvalPercentage =
    proposal.requiredApprovals > 0
      ? Math.round((proposal.approved / proposal.requiredApprovals) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER)
      : 0

  const statusStyles = getStatusStyles(proposal.status)

  return (
    <Link
      href={`/governance/${proposal.contract}/${proposal.proposalId}`}
      className="block p-4 transition-colors hover:bg-bg-secondary"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-text-primary">#{proposal.proposalId}</span>
            <span className={`rounded border px-2 py-0.5 font-mono text-xs ${statusStyles}`}>
              {proposal.status.toUpperCase()}
            </span>
          </div>
          <div className="font-mono text-xs text-text-muted">
            {proposal.actionType} • {formatDateTime(proposal.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-xs text-text-muted">Approvals</div>
            <div className="font-mono text-sm text-text-secondary">
              {proposal.approved}/{proposal.requiredApprovals}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-bg-tertiary bg-bg-secondary">
            <div
              className="flex h-full w-full items-center justify-center rounded-full border-4 border-accent-green"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${approvalPercentage >= BLOCKCHAIN.PERCENTAGE_QUARTER ? '100% 0%' : '50% 0%'}, ${approvalPercentage >= BLOCKCHAIN.PERCENTAGE_HALF ? '100% 100%' : '100% 0%'}, ${approvalPercentage >= BLOCKCHAIN.PERCENTAGE_THREE_QUARTERS ? '0% 100%' : approvalPercentage >= BLOCKCHAIN.PERCENTAGE_HALF ? '100% 100%' : '100% 0%'}, ${approvalPercentage >= BLOCKCHAIN.PERCENTAGE_FULL ? '0% 0%' : approvalPercentage >= BLOCKCHAIN.PERCENTAGE_THREE_QUARTERS ? '0% 100%' : '100% 0%'})`,
              }}
            >
              <span className="font-mono text-xs font-bold text-text-secondary">{approvalPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function getStatusStyles(status: string): string {
  switch (status) {
    case ProposalStatus.VOTING:
      return 'border-accent-blue bg-accent-blue/10 text-accent-blue'
    case ProposalStatus.APPROVED:
      return 'border-accent-green bg-accent-green/10 text-accent-green'
    case ProposalStatus.EXECUTED:
      return 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
    case ProposalStatus.REJECTED:
    case ProposalStatus.FAILED:
      return 'border-accent-red bg-accent-red/10 text-accent-red'
    case ProposalStatus.CANCELLED:
    case ProposalStatus.EXPIRED:
      return 'border-text-muted bg-bg-tertiary text-text-muted'
    default:
      return 'border-bg-tertiary bg-bg-secondary text-text-secondary'
  }
}
