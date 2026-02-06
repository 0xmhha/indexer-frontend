'use client'

/**
 * Governance Hooks
 * All governance-related hooks for system contracts (0x1001-0x1004)
 */

import { gql, useQuery } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_PROPOSALS,
  GET_PROPOSAL,
  GET_PROPOSAL_VOTES,
  GET_ACTIVE_VALIDATORS,
  GET_BLACKLISTED_ADDRESSES,
  GET_DEPOSIT_MINT_PROPOSALS,
  GET_MAX_PROPOSALS_UPDATE_HISTORY,
  GET_PROPOSAL_EXECUTION_SKIPPED,
} from '@/lib/graphql/queries/system-contracts'

// Re-export SYSTEM_CONTRACTS from subscriptions
export { SYSTEM_CONTRACTS } from './useContractSubscriptions'

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

export interface Validator {
  address: string
  isActive: boolean
}

export interface ValidatorInfo {
  address: string
  isActive: boolean
}

// ============================================================================
// Types - Events
// ============================================================================

export interface GasTipUpdateEvent {
  blockNumber: string
  transactionHash: string
  oldTip: string
  newTip: string
  updater: string
  timestamp: string
  txHash?: string
}

export interface ValidatorChangeEvent {
  blockNumber: string
  transactionHash: string
  validator: string
  action: string
  oldValidator?: string
  timestamp: string
  txHash?: string
}

export type ValidatorHistoryEvent = ValidatorChangeEvent

export interface EmergencyPauseEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  proposalId?: string
  action: string
  timestamp: string
  txHash?: string
  isPaused?: boolean
}

export interface DepositMintProposal {
  proposalId: string
  requester: string
  beneficiary: string
  amount: string
  depositId: string
  bankReference: string
  status: BackendProposalStatus
  blockNumber: string
  transactionHash: string
  timestamp: string
}

export interface BurnHistoryEvent {
  blockNumber: string
  transactionHash: string
  burner: string
  amount: string
  withdrawalId?: string
  timestamp: string
  txHash?: string
  burnTxId?: string
}

export interface BlacklistEvent {
  blockNumber: string
  transactionHash: string
  account: string
  action: string
  proposalId?: string
  timestamp: string
}

export interface BlacklistHistoryEvent {
  blockNumber: string
  txHash: string
  address: string
  isBlacklisted: boolean
  proposalId: string
  timestamp: string
}

export interface MaxProposalsUpdateEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  oldMax: string
  newMax: string
  timestamp: string
}

export interface ProposalExecutionSkippedEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  account: string
  proposalId: string
  reason: string
  timestamp: string
}

export type ProposalExecutionSkippedReason =
  | 'ALREADY_BLACKLISTED'
  | 'NOT_IN_BLACKLIST'
  | 'ALREADY_AUTHORIZED'
  | 'NOT_AUTHORIZED'
  | 'GovCouncil: blacklist call failed'
  | 'GovCouncil: authorize call failed'

export interface MemberChangeEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  member: string
  action: string
  oldMember?: string
  totalMembers: string
  newQuorum: number
  timestamp: string
}

export type MemberHistoryEvent = MemberChangeEvent

// ============================================================================
// GraphQL Queries - Local
// ============================================================================

const GET_GAS_TIP_HISTORY = gql`
  query GetGasTipHistoryLocal($fromBlock: BigInt!, $toBlock: BigInt!) {
    gasTipHistory(filter: { fromBlock: $fromBlock, toBlock: $toBlock }) {
      blockNumber
      transactionHash
      oldTip
      newTip
      updater
      timestamp
    }
  }
`

const GET_VALIDATOR_HISTORY = gql`
  query GetValidatorHistoryLocal($validator: Address!) {
    validatorHistory(validator: $validator) {
      blockNumber
      transactionHash
      validator
      action
      oldValidator
      timestamp
    }
  }
`

const GET_EMERGENCY_PAUSE_HISTORY = gql`
  query GetEmergencyPauseHistoryLocal($contract: Address!) {
    emergencyPauseHistory(contract: $contract) {
      contract
      blockNumber
      transactionHash
      proposalId
      action
      timestamp
    }
  }
`

const GET_BURN_HISTORY = gql`
  query GetBurnHistoryLocal($filter: SystemContractEventFilter!, $pagination: PaginationInput) {
    burnEvents(filter: $filter, pagination: $pagination) {
      nodes {
        blockNumber
        transactionHash
        burner
        amount
        withdrawalId
        timestamp
      }
      totalCount
    }
  }
`

const GET_BLACKLIST_HISTORY = gql`
  query GetBlacklistHistoryLocal($address: Address!) {
    blacklistHistory(address: $address) {
      blockNumber
      transactionHash
      account
      action
      proposalId
      timestamp
    }
  }
`

const GET_MEMBER_HISTORY = gql`
  query GetMemberHistoryLocal($contract: Address!) {
    memberHistory(contract: $contract) {
      contract
      blockNumber
      transactionHash
      member
      action
      oldMember
      totalMembers
      newQuorum
      timestamp
    }
  }
`

// ============================================================================
// Helper
// ============================================================================

const isUnsupportedQueryError = (error: Error | undefined): boolean => {
  const msg = error?.message ?? ''
  return msg.includes('Cannot query field') || msg.includes('Unknown field')
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isAddressBlacklisted(address: string, blacklistedAddresses: string[]): boolean {
  return blacklistedAddresses.map(addr => addr.toLowerCase()).includes(address.toLowerCase())
}

export function filterToBackendStatus(filter: ProposalStatusFilter): BackendProposalStatus | undefined {
  if (filter === 'all') return undefined
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
// Hooks - Basic Governance
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

// ============================================================================
// Hooks - GovValidator (0x1001)
// ============================================================================

export function useActiveValidators() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_VALIDATORS, {
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const validatorInfos: ValidatorInfo[] = effectiveData?.activeValidators ?? []
  const validators: Validator[] = validatorInfos

  return {
    validators,
    validatorInfos,
    totalCount: validatorInfos.length,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

export function useGasTipHistory(params: { fromBlock?: string; toBlock?: string } = {}) {
  const { fromBlock = '0', toBlock = '999999999' } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_GAS_TIP_HISTORY, {
    variables: { fromBlock, toBlock },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const rawHistory = effectiveData?.gasTipHistory ?? []

  const history: GasTipUpdateEvent[] = rawHistory.map((e: GasTipUpdateEvent) => ({
    ...e,
    txHash: e.transactionHash,
  }))

  return { history, loading, error: isUnsupportedQueryError(error) ? undefined : error, refetch }
}

export function useValidatorHistory(validator: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_VALIDATOR_HISTORY, {
    variables: { validator },
    skip: !validator,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: ValidatorHistoryEvent[] = effectiveData?.validatorHistory ?? []

  return { history, loading, error, refetch }
}

// ============================================================================
// Hooks - GovMasterMinter (0x1002)
// ============================================================================

export function useMinterConfigHistory(_params: { fromBlock?: string; toBlock?: string } = {}) {
  return {
    history: [] as import('./useNativeCoinAdapter').MinterConfigEvent[],
    loading: false,
    error: undefined,
    refetch: async () => ({ data: undefined }),
  }
}

export function useEmergencyPauseHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_EMERGENCY_PAUSE_HISTORY, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: EmergencyPauseEvent[] = effectiveData?.emergencyPauseHistory ?? []

  return { history, loading, error, refetch }
}

// ============================================================================
// Hooks - GovMinter (0x1003)
// ============================================================================

export function useDepositMintProposals(params: {
  fromBlock?: string
  toBlock?: string
  status?: BackendProposalStatus
} = {}) {
  const { fromBlock = '0', toBlock = '999999999', status } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_DEPOSIT_MINT_PROPOSALS, {
    variables: { fromBlock, toBlock, status },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const proposals: DepositMintProposal[] = effectiveData?.depositMintProposals ?? []

  return { proposals, loading, error, refetch }
}

export function useBurnHistory(params: { fromBlock?: string; toBlock?: string; user?: string } = {}) {
  const { fromBlock = '0', toBlock = '999999999', user } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_BURN_HISTORY, {
    variables: {
      filter: { fromBlock, toBlock, address: user },
      pagination: { limit: PAGINATION.DEFAULT_PAGE_SIZE, offset: 0 },
    },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const burnEventsData = effectiveData?.burnEvents

  const history: BurnHistoryEvent[] = (burnEventsData?.nodes ?? []).map((e: { blockNumber: string; transactionHash: string; burner: string; amount: string; withdrawalId?: string; timestamp: string }) => ({
    blockNumber: e.blockNumber,
    transactionHash: e.transactionHash,
    burner: e.burner,
    amount: e.amount,
    withdrawalId: e.withdrawalId,
    timestamp: e.timestamp,
    txHash: e.transactionHash,
    burnTxId: e.withdrawalId,
  }))

  return {
    history,
    totalCount: burnEventsData?.totalCount ?? 0,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

// ============================================================================
// Hooks - GovCouncil (0x1004)
// ============================================================================

export function useBlacklistedAddresses() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLACKLISTED_ADDRESSES, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const addresses: string[] = effectiveData?.blacklistedAddresses ?? []

  return { addresses, totalCount: addresses.length, loading, error, refetch }
}

export function useBlacklistHistory(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLACKLIST_HISTORY, {
    variables: { address },
    skip: !address,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: BlacklistHistoryEvent[] = effectiveData?.blacklistHistory ?? []

  return { history, loading, error, refetch }
}

export function useAuthorizedAccounts() {
  return {
    accounts: [] as string[],
    totalCount: 0,
    loading: false,
    error: undefined,
    refetch: async () => ({ data: undefined }),
  }
}

// ============================================================================
// Hooks - Common Governance
// ============================================================================

export function useMaxProposalsUpdateHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MAX_PROPOSALS_UPDATE_HISTORY, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const history: MaxProposalsUpdateEvent[] = effectiveData?.maxProposalsUpdateHistory ?? []

  return { history, loading, error: isUnsupportedQueryError(error) ? undefined : error, refetch }
}

export function useProposalExecutionSkipped(contract: string, proposalId?: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_EXECUTION_SKIPPED, {
    variables: { contract, proposalId },
    skip: !contract,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const events: ProposalExecutionSkippedEvent[] = effectiveData?.proposalExecutionSkippedEvents ?? []

  return { events, loading, error: isUnsupportedQueryError(error) ? undefined : error, refetch }
}

export function useMemberHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MEMBER_HISTORY, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: MemberHistoryEvent[] = effectiveData?.memberHistory ?? []

  return { history, loading, error, refetch }
}
