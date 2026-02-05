'use client'

import { useQuery } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_PROPOSALS,
  GET_PROPOSAL,
  GET_PROPOSAL_VOTES,
  GET_ACTIVE_VALIDATORS,
  GET_BLACKLISTED_ADDRESSES,
} from '@/lib/graphql/queries/system-contracts'

// Proposal Status enum
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

// Types
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
  status: ProposalStatus
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

export interface Validator {
  address: string
  isActive: boolean
}

/**
 * Hook to fetch proposals list
 * Note: Backend filter requires contract address. If not provided, query is skipped.
 * @param params - Filter and pagination parameters (contract is required by schema)
 */
export function useProposals(
  params: {
    contract?: string
    status?: ProposalStatus | string
    limit?: number
    offset?: number
  } = {}
) {
  const { contract, status, limit = PAGINATION.DEFAULT_PAGE_SIZE, offset = 0 } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_PROPOSALS, {
    variables: {
      filter: {
        contract: contract ?? '',
        ...(status && { status }),
      },
      pagination: { limit, offset },
    },
    // Skip query if no contract provided (schema requires contract)
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const proposals: Proposal[] = effectiveData?.proposals?.nodes ?? []
  const totalCount = effectiveData?.proposals?.totalCount ?? 0
  const pageInfo = effectiveData?.proposals?.pageInfo

  return {
    proposals,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch specific proposal
 */
export function useProposal(contract: string, proposalId: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL, {
    variables: { contract, proposalId },
    returnPartialData: true,
    skip: !contract || !proposalId,
  })

  const effectiveData = data ?? previousData
  const proposal: Proposal | null = effectiveData?.proposal ?? null

  return {
    proposal,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch proposal votes
 */
export function useProposalVotes(contract: string, proposalId: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_VOTES, {
    variables: { contract, proposalId },
    returnPartialData: true,
    skip: !contract || !proposalId,
  })

  const effectiveData = data ?? previousData
  const votes: ProposalVote[] = effectiveData?.proposalVotes ?? []

  return {
    votes,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch active validators
 */
export function useActiveValidators() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_VALIDATORS, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const validators: Validator[] = effectiveData?.activeValidators ?? []

  return {
    validators,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch blacklisted addresses
 */
export function useBlacklistedAddresses() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLACKLISTED_ADDRESSES, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const addresses: string[] = effectiveData?.blacklistedAddresses ?? []

  return {
    addresses,
    loading,
    error,
    refetch,
  }
}
