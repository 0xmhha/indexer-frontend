'use client'

/**
 * Governance Proposal Hooks
 * Proposal-related types, utilities, and hooks for system contracts
 */

import { useQuery } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_PROPOSALS,
  GET_PROPOSAL,
  GET_PROPOSAL_VOTES,
} from '@/lib/graphql/queries/system-contracts'

// ============================================================================
// Types - Proposal Status
// ============================================================================

/** UI-friendly enum (lowercase values) - for backward compatibility */
export enum ProposalStatus {
  NONE = 'none',
  VOTING = 'voting',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

/** Backend ProposalStatus type (uppercase values) */
export type BackendProposalStatus =
  | 'NONE'
  | 'VOTING'
  | 'APPROVED'
  | 'EXECUTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED'
  | 'REJECTED'

/** Filter type for UI that includes 'all' option */
export type ProposalStatusFilter =
  | 'all'
  | 'none'
  | 'voting'
  | 'approved'
  | 'executed'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'rejected'

// ============================================================================
// Types - Core Entities
// ============================================================================

export interface Proposal {
  contract: string
  proposalId: string
  proposer: string
  actionType: string
  callData: string
  memberVersion: string
  requiredApprovals: number
  approved: number
  rejected: number
  status: ProposalStatus | BackendProposalStatus | string
  createdAt: string
  executedAt?: string
  blockNumber: string
  transactionHash: string
}

export interface ProposalVote {
  contract: string
  proposalId: string
  voter: string
  approval: boolean
  blockNumber: string
  transactionHash: string
  timestamp: string
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isAddressBlacklisted(address: string, blacklistedAddresses: string[]): boolean {
  return blacklistedAddresses.map(addr => addr.toLowerCase()).includes(address.toLowerCase())
}

export function filterToBackendStatus(filter: ProposalStatusFilter): BackendProposalStatus | undefined {
  if (filter === 'all') {return undefined}
  const mapping: Record<Exclude<ProposalStatusFilter, 'all'>, BackendProposalStatus> = {
    none: 'NONE',
    voting: 'VOTING',
    approved: 'APPROVED',
    executed: 'EXECUTED',
    cancelled: 'CANCELLED',
    expired: 'EXPIRED',
    failed: 'FAILED',
    rejected: 'REJECTED',
  }
  return mapping[filter]
}

export function getProposalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    all: 'All', none: 'Initial', voting: 'Voting', approved: 'Approved',
    executed: 'Executed', cancelled: 'Cancelled', expired: 'Expired',
    failed: 'Failed', rejected: 'Rejected',
    NONE: 'Initial', VOTING: 'Voting', APPROVED: 'Approved',
    EXECUTED: 'Executed', CANCELLED: 'Cancelled', EXPIRED: 'Expired',
    FAILED: 'Failed', REJECTED: 'Rejected',
  }
  return labels[status] || status
}

export function getProposalStatusColor(status: string): string {
  const colors: Record<string, string> = {
    all: 'text-text-secondary', none: 'text-text-muted', voting: 'text-accent-blue',
    approved: 'text-accent-cyan', executed: 'text-accent-green', cancelled: 'text-text-muted',
    expired: 'text-yellow-500', failed: 'text-accent-red', rejected: 'text-accent-red',
    NONE: 'text-text-muted', VOTING: 'text-accent-blue', APPROVED: 'text-accent-cyan',
    EXECUTED: 'text-accent-green', CANCELLED: 'text-text-muted', EXPIRED: 'text-yellow-500',
    FAILED: 'text-accent-red', REJECTED: 'text-accent-red',
  }
  return colors[status] || 'text-text-secondary'
}

// ============================================================================
// Hooks
// ============================================================================

export function useProposals(params: {
  contract?: string
  status?: ProposalStatus | ProposalStatusFilter | string
  limit?: number
  offset?: number
} = {}) {
  const { contract, status, limit = PAGINATION.DEFAULT_PAGE_SIZE, offset = 0 } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_PROPOSALS, {
    variables: {
      filter: {
        contract: contract ?? '',
        ...(status && status !== 'all' && { status }),
      },
      pagination: { limit, offset },
    },
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const proposals: Proposal[] = effectiveData?.proposals?.nodes ?? []
  const totalCount = effectiveData?.proposals?.totalCount ?? 0
  const pageInfo = effectiveData?.proposals?.pageInfo

  return { proposals, totalCount, pageInfo, loading, error, refetch, fetchMore }
}

export function useProposal(contract: string, proposalId: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL, {
    variables: { contract, proposalId },
    returnPartialData: true,
    skip: !contract || !proposalId,
  })

  const effectiveData = data ?? previousData
  const proposal: Proposal | null = effectiveData?.proposal ?? null

  return { proposal, loading, error, refetch }
}

export function useProposalVotes(contract: string, proposalId: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_VOTES, {
    variables: { contract, proposalId },
    returnPartialData: true,
    skip: !contract || !proposalId,
  })

  const effectiveData = data ?? previousData
  const votes: ProposalVote[] = effectiveData?.proposalVotes ?? []

  return { votes, loading, error, refetch }
}
