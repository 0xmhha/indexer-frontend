'use client'

import { gql, useQuery, useSubscription, useMutation } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_TOTAL_SUPPLY,
  GET_ACTIVE_MINTERS,
  GET_MINTER_ALLOWANCE,
  GET_MINT_EVENTS,
  GET_BURN_EVENTS,
  GET_ACTIVE_VALIDATORS,
  GET_BLACKLISTED_ADDRESSES,
  GET_DEPOSIT_MINT_PROPOSALS as GET_DEPOSIT_MINT_PROPOSALS_CENTRAL,
  GET_MAX_PROPOSALS_UPDATE_HISTORY as GET_MAX_PROPOSALS_UPDATE_HISTORY_CENTRAL,
  GET_PROPOSAL_EXECUTION_SKIPPED as GET_PROPOSAL_EXECUTION_SKIPPED_CENTRAL,
  SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION,
  REGISTER_CONTRACT as REGISTER_CONTRACT_CENTRAL,
  UNREGISTER_CONTRACT as UNREGISTER_CONTRACT_CENTRAL,
  GET_REGISTERED_CONTRACTS as GET_REGISTERED_CONTRACTS_CENTRAL,
  GET_REGISTERED_CONTRACT as GET_REGISTERED_CONTRACT_CENTRAL,
  DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION,
} from '@/lib/graphql/queries/system-contracts'

// ============================================================================
// System Contract Addresses
// ============================================================================

export const SYSTEM_CONTRACTS = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

// ============================================================================
// GraphQL Queries - Local definitions for queries not in centralized file
// These use proper schema types (Address, BigInt) instead of String
// ============================================================================

// Backend returns [MinterConfigEvent!]! with action field
const GET_MINTER_HISTORY = gql`
  query GetMinterHistoryLocal($minter: Address!) {
    minterHistory(minter: $minter) {
      blockNumber
      transactionHash
      minter
      allowance
      action
      timestamp
    }
  }
`

// Backend uses SystemContractEventFilter
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

// Backend returns [ValidatorChangeEvent!]!
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

// NOTE: minterConfigHistory query is not exposed in backend GraphQL yet
// Commented out - not in schema
// const GET_MINTER_CONFIG_HISTORY = gql`
//   query GetMinterConfigHistoryLocal($fromBlock: BigInt!, $toBlock: BigInt!) {
//     minterConfigHistory(fromBlock: $fromBlock, toBlock: $toBlock) {
//       blockNumber
//       transactionHash
//       minter
//       allowance
//       action
//       timestamp
//     }
//   }
// `

// Backend returns [EmergencyPauseEvent!]!
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

// NOTE: burnHistory query uses burnEvents - local version with proper types
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

// Backend returns [BlacklistEvent!]!
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

// NOTE: authorizedAccounts query is not exposed in backend GraphQL yet
// Commented out - not in schema
// const GET_AUTHORIZED_ACCOUNTS = gql`
//   query GetAuthorizedAccountsLocal {
//     authorizedAccounts
//   }
// `

// Local proposals query with flexible filter (contract nullable)
const GET_PROPOSALS_LOCAL = gql`
  query GetProposalsLocal(
    $filter: ProposalFilter!
    $pagination: PaginationInput
  ) {
    proposals(filter: $filter, pagination: $pagination) {
      nodes {
        proposalId
        contract
        proposer
        actionType
        callData
        memberVersion
        requiredApprovals
        approved
        rejected
        status
        createdAt
        executedAt
        blockNumber
        transactionHash
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Backend uses proposalId: BigInt!
const GET_PROPOSAL_VOTES_LOCAL = gql`
  query GetProposalVotesLocal($contract: Address!, $proposalId: BigInt!) {
    proposalVotes(contract: $contract, proposalId: $proposalId) {
      contract
      proposalId
      voter
      approval
      blockNumber
      transactionHash
      timestamp
    }
  }
`

// Backend returns [MemberChangeEvent!]!
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
// TypeScript Interfaces - Aligned with Backend Schema
// ============================================================================

// MinterInfo from activeMinters query
export interface MinterInfo {
  address: string
  allowance: string
  isActive: boolean
}

// ValidatorInfo from activeValidators query
export interface ValidatorInfo {
  address: string
  isActive: boolean
}

export interface MintEvent {
  blockNumber: string
  transactionHash: string
  minter: string
  to: string
  amount: string
  timestamp: string
  // Legacy field alias
  txHash?: string
}

export interface BurnEvent {
  blockNumber: string
  transactionHash: string
  burner: string
  amount: string
  timestamp: string
  withdrawalId?: string
  // Legacy field alias
  txHash?: string
}

export interface MinterConfigEvent {
  blockNumber: string
  transactionHash: string
  minter: string
  allowance: string
  action: string  // 'configured' | 'removed'
  timestamp: string
  // Legacy field alias
  txHash?: string
  isActive?: boolean
}

export interface GasTipUpdateEvent {
  blockNumber: string
  transactionHash: string
  oldTip: string
  newTip: string
  updater: string
  timestamp: string
  // Legacy field alias
  txHash?: string
}

export interface ValidatorChangeEvent {
  blockNumber: string
  transactionHash: string
  validator: string
  action: string  // 'added' | 'removed' | 'changed'
  oldValidator?: string
  timestamp: string
  // Legacy field alias
  txHash?: string
}

// Legacy alias
export type ValidatorHistoryEvent = ValidatorChangeEvent

export interface EmergencyPauseEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  proposalId?: string
  action: string  // 'paused' | 'unpaused'
  timestamp: string
  // Legacy field alias
  txHash?: string
  isPaused?: boolean
}

export interface DepositMintProposal {
  proposalId: string
  requester: string      // 제안을 생성한 멤버 주소
  beneficiary: string    // 토큰을 받을 수신자 주소 (기존 to 대체)
  amount: string
  depositId: string
  bankReference: string  // 은행 참조번호
  status: ProposalStatus
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
  // Legacy field alias
  txHash?: string
  burnTxId?: string
}

export interface BlacklistEvent {
  blockNumber: string
  transactionHash: string
  account: string
  action: string  // 'blacklisted' | 'unblacklisted'
  proposalId?: string
  timestamp: string
}

// MaxProposalsUpdate Event (GovBase 공통)
export interface MaxProposalsUpdateEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  oldMax: string
  newMax: string
  timestamp: string
}

// ProposalExecutionSkipped Event (GovCouncil)
export interface ProposalExecutionSkippedEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  account: string
  proposalId: string
  reason: string
  timestamp: string
}

/**
 * Possible reason values for ProposalExecutionSkippedEvent:
 * - ALREADY_BLACKLISTED: 이미 블랙리스트에 있음
 * - NOT_IN_BLACKLIST: 블랙리스트에 없음
 * - ALREADY_AUTHORIZED: 이미 인가됨
 * - NOT_AUTHORIZED: 인가되지 않음
 * - GovCouncil: blacklist call failed: 블랙리스트 호출 실패
 * - GovCouncil: authorize call failed: 인가 호출 실패
 */
export type ProposalExecutionSkippedReason =
  | 'ALREADY_BLACKLISTED'
  | 'NOT_IN_BLACKLIST'
  | 'ALREADY_AUTHORIZED'
  | 'NOT_AUTHORIZED'
  | 'GovCouncil: blacklist call failed'
  | 'GovCouncil: authorize call failed'

// Legacy alias with mapped fields
export interface BlacklistHistoryEvent {
  blockNumber: string
  txHash: string
  address: string
  isBlacklisted: boolean
  proposalId: string
  timestamp: string
}

export interface Proposal {
  proposalId: string
  contract: string
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

export interface MemberChangeEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  member: string
  action: string  // 'added' | 'removed' | 'changed'
  oldMember?: string
  totalMembers: string
  newQuorum: number
  timestamp: string
}

// Legacy alias
export type MemberHistoryEvent = MemberChangeEvent

// Backend uses uppercase values for ProposalStatus
export type ProposalStatus =
  | 'NONE'
  | 'VOTING'
  | 'APPROVED'
  | 'EXECUTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED'
  | 'REJECTED'

// Filter type for UI that includes 'all' option
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

// Helper to check for unsupported query error
const isUnsupportedQueryError = (error: Error | undefined): boolean => {
  const msg = error?.message ?? ''
  return msg.includes('Cannot query field') || msg.includes('Unknown field')
}

// ============================================================================
// React Hooks - NativeCoinAdapter (0x1000)
// ============================================================================

/**
 * Hook to fetch total token supply
 */
export function useTotalSupply() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_TOTAL_SUPPLY, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const totalSupply: string | null = effectiveData?.totalSupply ?? null

  return {
    totalSupply,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch mint events
 * Uses SystemContractEventFilter with pagination
 */
export function useMintEvents(params: {
  fromBlock?: string
  toBlock?: string
  minter?: string
  limit?: number
  offset?: number
} = {}) {
  const {
    fromBlock = '0',
    toBlock = '999999999',
    minter,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_MINT_EVENTS, {
    variables: {
      filter: { fromBlock, toBlock, address: minter },
      pagination: { limit, offset },
    },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const mintEventsData = effectiveData?.mintEvents

  // Transform to add legacy txHash field
  const mintEvents: MintEvent[] = (mintEventsData?.nodes ?? []).map((e: MintEvent) => ({
    ...e,
    txHash: e.transactionHash,
  }))

  return {
    mintEvents,
    totalCount: mintEventsData?.totalCount ?? 0,
    pageInfo: mintEventsData?.pageInfo,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch burn events
 * Uses SystemContractEventFilter with pagination
 */
export function useBurnEvents(params: {
  fromBlock?: string
  toBlock?: string
  burner?: string
  limit?: number
  offset?: number
} = {}) {
  const {
    fromBlock = '0',
    toBlock = '999999999',
    burner,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_BURN_EVENTS, {
    variables: {
      filter: { fromBlock, toBlock, address: burner },
      pagination: { limit, offset },
    },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const burnEventsData = effectiveData?.burnEvents

  // Transform to add legacy txHash field
  const burnEvents: BurnEvent[] = (burnEventsData?.nodes ?? []).map((e: BurnEvent) => ({
    ...e,
    txHash: e.transactionHash,
  }))

  return {
    burnEvents,
    totalCount: burnEventsData?.totalCount ?? 0,
    pageInfo: burnEventsData?.pageInfo,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch active minters
 * Returns MinterInfo objects (address, allowance, isActive)
 */
export function useActiveMinters() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_MINTERS, {
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const minterInfos: MinterInfo[] = effectiveData?.activeMinters ?? []

  // Also provide legacy string array for backward compatibility
  const minters: string[] = minterInfos.map(m => m.address)

  return {
    minters,
    minterInfos,
    totalCount: minterInfos.length,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

/**
 * Hook to fetch minter allowance
 */
export function useMinterAllowance(minter: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MINTER_ALLOWANCE, {
    variables: { minter },
    skip: !minter,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const allowance: string | null = effectiveData?.minterAllowance ?? null

  return {
    allowance,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch minter configuration history
 */
export function useMinterHistory(minter: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MINTER_HISTORY, {
    variables: { minter },
    skip: !minter,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: MinterConfigEvent[] = effectiveData?.minterHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
  }
}

// ============================================================================
// React Hooks - GovValidator (0x1001)
// ============================================================================

/**
 * Hook to fetch active validators
 * Returns ValidatorInfo objects (address, isActive)
 */
export function useActiveValidators() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_VALIDATORS, {
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const validatorInfos: ValidatorInfo[] = effectiveData?.activeValidators ?? []

  // Also provide legacy string array for backward compatibility
  const validators: string[] = validatorInfos.map(v => v.address)

  return {
    validators,
    validatorInfos,
    totalCount: validatorInfos.length,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

/**
 * Hook to fetch gas tip update history
 * Uses SystemContractEventFilter
 */
export function useGasTipHistory(params: {
  fromBlock?: string
  toBlock?: string
} = {}) {
  const { fromBlock = '0', toBlock = '999999999' } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_GAS_TIP_HISTORY, {
    variables: { fromBlock, toBlock },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const rawHistory = effectiveData?.gasTipHistory ?? []

  // Transform to add legacy txHash field
  const history: GasTipUpdateEvent[] = rawHistory.map((e: GasTipUpdateEvent) => ({
    ...e,
    txHash: e.transactionHash,
  }))

  return {
    history,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

/**
 * Hook to fetch validator history
 */
export function useValidatorHistory(validator: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_VALIDATOR_HISTORY, {
    variables: { validator },
    skip: !validator,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: ValidatorHistoryEvent[] = effectiveData?.validatorHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
  }
}

// ============================================================================
// React Hooks - GovMasterMinter (0x1002)
// ============================================================================

/**
 * Hook to fetch minter config history across all minters
 * NOTE: This query is not available in the backend GraphQL schema yet.
 * Returns empty data until the backend implements minterConfigHistory query.
 */
export function useMinterConfigHistory(_params: {
  fromBlock?: string
  toBlock?: string
} = {}) {
  // Query not available in schema - return empty data
  return {
    history: [] as MinterConfigEvent[],
    loading: false,
    error: undefined,
    refetch: async () => ({ data: undefined }),
  }
}

/**
 * Hook to fetch emergency pause history
 */
export function useEmergencyPauseHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_EMERGENCY_PAUSE_HISTORY, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: EmergencyPauseEvent[] = effectiveData?.emergencyPauseHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
  }
}

// ============================================================================
// React Hooks - GovMinter (0x1003)
// ============================================================================

/**
 * Hook to fetch deposit mint proposals
 */
export function useDepositMintProposals(params: {
  fromBlock?: string
  toBlock?: string
  status?: ProposalStatus
} = {}) {
  const { fromBlock = '0', toBlock = '999999999', status } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_DEPOSIT_MINT_PROPOSALS_CENTRAL, {
    variables: { fromBlock, toBlock, status },
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const proposals: DepositMintProposal[] = effectiveData?.depositMintProposals ?? []

  return {
    proposals,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch burn history with external TX IDs
 * Note: Uses burnEvents query since burnHistory is not exposed in backend
 */
export function useBurnHistory(params: {
  fromBlock?: string
  toBlock?: string
  user?: string
} = {}) {
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

  // Transform to BurnHistoryEvent format
  const history: BurnHistoryEvent[] = (burnEventsData?.nodes ?? []).map((e: BurnEvent) => ({
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
// React Hooks - GovCouncil (0x1004)
// ============================================================================

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
    totalCount: addresses.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch blacklist history for an address
 */
export function useBlacklistHistory(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLACKLIST_HISTORY, {
    variables: { address },
    skip: !address,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: BlacklistHistoryEvent[] = effectiveData?.blacklistHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch authorized accounts (council members)
 * NOTE: This query is not available in the backend GraphQL schema yet.
 * Returns empty data until the backend implements authorizedAccounts query.
 */
export function useAuthorizedAccounts() {
  // Query not available in schema - return empty data
  return {
    accounts: [] as string[],
    totalCount: 0,
    loading: false,
    error: undefined,
    refetch: async () => ({ data: undefined }),
  }
}

// ============================================================================
// React Hooks - MaxProposalsUpdate (GovBase 공통)
// ============================================================================

/**
 * Hook to fetch max proposals update history for a governance contract
 * Returns history of changes to the maximum number of proposals per member
 */
export function useMaxProposalsUpdateHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MAX_PROPOSALS_UPDATE_HISTORY_CENTRAL, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const history: MaxProposalsUpdateEvent[] = effectiveData?.maxProposalsUpdateHistory ?? []

  return {
    history,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

// ============================================================================
// React Hooks - ProposalExecutionSkipped (GovCouncil)
// ============================================================================

/**
 * Hook to fetch proposal execution skipped events
 * Returns events when proposal execution was skipped due to conditions not being met
 * @param contract - The contract address
 * @param proposalId - Optional proposal ID to filter by
 */
export function useProposalExecutionSkipped(contract: string, proposalId?: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_EXECUTION_SKIPPED_CENTRAL, {
    variables: { contract, proposalId },
    skip: !contract,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const events: ProposalExecutionSkippedEvent[] = effectiveData?.proposalExecutionSkippedEvents ?? []

  return {
    events,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

// ============================================================================
// React Hooks - Common Governance
// ============================================================================

/**
 * Hook to fetch governance proposals
 * Uses ProposalFilter with pagination
 * Accepts ProposalStatusFilter for UI convenience (converts to backend ProposalStatus)
 * contract is now optional (nullable in backend ProposalFilter)
 */
export function useProposals(params: {
  contract?: string
  status?: ProposalStatusFilter
  proposer?: string
  limit?: number
  offset?: number
} = {}) {
  const {
    contract,
    status,
    proposer,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  // Convert UI filter to backend status (undefined for 'all' means no filter)
  const backendStatus = status ? filterToBackendStatus(status) : undefined

  // Build filter with required contract field
  // Note: Skip query if no contract provided (schema requires contract: Address!)
  const filter = contract ? {
    contract,
    ...(backendStatus && { status: backendStatus }),
    ...(proposer && { proposer }),
  } : null

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_PROPOSALS_LOCAL, {
    variables: {
      filter: filter ?? { contract: '' },
      pagination: { limit, offset },
    },
    skip: !filter,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const proposalsData = effectiveData?.proposals
  const proposals: Proposal[] = proposalsData?.nodes ?? []

  return {
    proposals,
    totalCount: proposalsData?.totalCount ?? 0,
    pageInfo: proposalsData?.pageInfo,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch votes for a specific proposal
 */
export function useProposalVotes(contract: string, proposalId: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_VOTES_LOCAL, {
    variables: { contract, proposalId },
    skip: !contract || !proposalId,
    returnPartialData: true,
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
 * Hook to fetch member history for a governance contract
 */
export function useMemberHistory(contract: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MEMBER_HISTORY, {
    variables: { contract },
    skip: !contract,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: MemberHistoryEvent[] = effectiveData?.memberHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if an address is blacklisted
 */
export function isAddressBlacklisted(
  address: string,
  blacklistedAddresses: string[]
): boolean {
  return blacklistedAddresses
    .map((addr) => addr.toLowerCase())
    .includes(address.toLowerCase())
}

/**
 * Convert UI filter status to backend ProposalStatus
 * Returns undefined for 'all' to not filter by status
 */
export function filterToBackendStatus(filter: ProposalStatusFilter): ProposalStatus | undefined {
  if (filter === 'all') {return undefined}
  const mapping: Record<Exclude<ProposalStatusFilter, 'all'>, ProposalStatus> = {
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

/**
 * Get proposal status label (accepts both backend ProposalStatus and UI ProposalStatusFilter)
 */
export function getProposalStatusLabel(status: ProposalStatus | ProposalStatusFilter): string {
  const labels: Record<string, string> = {
    // UI filter values (lowercase)
    all: 'All',
    none: 'Initial',
    voting: 'Voting',
    approved: 'Approved',
    executed: 'Executed',
    cancelled: 'Cancelled',
    expired: 'Expired',
    failed: 'Failed',
    rejected: 'Rejected',
    // Backend values (uppercase)
    NONE: 'Initial',
    VOTING: 'Voting',
    APPROVED: 'Approved',
    EXECUTED: 'Executed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    FAILED: 'Failed',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

/**
 * Get proposal status color (accepts both backend ProposalStatus and UI ProposalStatusFilter)
 */
export function getProposalStatusColor(status: ProposalStatus | ProposalStatusFilter): string {
  const colors: Record<string, string> = {
    // UI filter values (lowercase)
    all: 'text-text-secondary',
    none: 'text-text-muted',
    voting: 'text-accent-blue',
    approved: 'text-accent-cyan',
    executed: 'text-accent-green',
    cancelled: 'text-text-muted',
    expired: 'text-yellow-500',
    failed: 'text-accent-red',
    rejected: 'text-accent-red',
    // Backend values (uppercase)
    NONE: 'text-text-muted',
    VOTING: 'text-accent-blue',
    APPROVED: 'text-accent-cyan',
    EXECUTED: 'text-accent-green',
    CANCELLED: 'text-text-muted',
    EXPIRED: 'text-yellow-500',
    FAILED: 'text-accent-red',
    REJECTED: 'text-accent-red',
  }
  return colors[status] || 'text-text-secondary'
}

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * Filter for system contract event subscriptions
 */
export interface SystemContractSubscriptionFilter {
  /** Filter by specific contract address (optional) */
  contract?: string
  /** Filter by specific event types (optional) */
  eventTypes?: string[]
}

/**
 * System contract event message received via WebSocket subscription
 */
export interface SystemContractEventMessage {
  contract: string
  eventName: string
  blockNumber: string
  transactionHash: string
  logIndex: number
  data: string  // JSON string - needs JSON.parse()
  timestamp: string
}

/**
 * Parsed system contract event with typed data
 */
export interface ParsedSystemContractEvent<T = Record<string, unknown>> {
  contract: string
  eventName: string
  blockNumber: string
  transactionHash: string
  logIndex: number
  data: T
  timestamp: string
}

// ============================================================================
// React Hooks - System Contract Event Subscriptions
// ============================================================================

/**
 * Parse the data field from a SystemContractEventMessage
 * @param message - The event message with JSON data string
 * @returns Parsed event with typed data
 */
export function parseSystemContractEvent<T = Record<string, unknown>>(
  message: SystemContractEventMessage
): ParsedSystemContractEvent<T> {
  let parsedData: T
  try {
    parsedData = JSON.parse(message.data) as T
  } catch {
    parsedData = {} as T
  }

  return {
    contract: message.contract,
    eventName: message.eventName,
    blockNumber: message.blockNumber,
    transactionHash: message.transactionHash,
    logIndex: message.logIndex,
    data: parsedData,
    timestamp: message.timestamp,
  }
}

/**
 * Hook to subscribe to system contract events via WebSocket
 *
 * @example
 * // Subscribe to all events
 * const { event, loading, error } = useSystemContractEvents()
 *
 * @example
 * // Subscribe to specific contract events
 * const { event } = useSystemContractEvents({
 *   contract: SYSTEM_CONTRACTS.NativeCoinAdapter
 * })
 *
 * @example
 * // Subscribe to specific event types
 * const { event } = useSystemContractEvents({
 *   eventTypes: ['Mint', 'Burn']
 * })
 *
 * @example
 * // Subscribe with callback
 * const { event } = useSystemContractEvents({
 *   eventTypes: ['ProposalCreated', 'ProposalVoted'],
 *   onEvent: (event) => {
 *     console.log('New event:', event.eventName, event.data)
 *   }
 * })
 */
export function useSystemContractEvents(params: {
  contract?: string
  eventTypes?: string[]
  onEvent?: (event: ParsedSystemContractEvent) => void
  skip?: boolean
} = {}) {
  const { contract, eventTypes, onEvent, skip = false } = params

  const { data, loading, error } = useSubscription<{
    systemContractEvents: SystemContractEventMessage
  }>(SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION, {
    variables: {
      filter: {
        ...(contract && { contract }),
        ...(eventTypes && eventTypes.length > 0 && { eventTypes }),
      },
    },
    skip,
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.systemContractEvents && onEvent) {
        const parsedEvent = parseSystemContractEvent(subscriptionData.data.systemContractEvents)
        onEvent(parsedEvent)
      }
    },
  })

  const rawEvent = data?.systemContractEvents
  const event = rawEvent ? parseSystemContractEvent(rawEvent) : null

  return {
    event,
    rawEvent,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to mint/burn events from NativeCoinAdapter
 */
export function useMintBurnEvents(params: {
  onEvent?: (event: ParsedSystemContractEvent) => void
  skip?: boolean
} = {}) {
  return useSystemContractEvents({
    contract: SYSTEM_CONTRACTS.NativeCoinAdapter,
    eventTypes: ['Mint', 'Burn'],
    ...params,
  })
}

/**
 * Hook to subscribe to governance proposal events
 */
export function useGovernanceEvents(params: {
  contract?: string
  onEvent?: (event: ParsedSystemContractEvent) => void
  skip?: boolean
} = {}) {
  const { contract, onEvent, skip } = params
  return useSystemContractEvents({
    ...(contract && { contract }),
    eventTypes: [
      'ProposalCreated',
      'ProposalVoted',
      'ProposalApproved',
      'ProposalRejected',
      'ProposalExecuted',
      'ProposalFailed',
      'ProposalExpired',
      'ProposalCancelled',
    ],
    ...(onEvent && { onEvent }),
    ...(skip !== undefined && { skip }),
  })
}

/**
 * Hook to subscribe to blacklist events from GovCouncil
 */
export function useBlacklistEvents(params: {
  onEvent?: (event: ParsedSystemContractEvent) => void
  skip?: boolean
} = {}) {
  return useSystemContractEvents({
    contract: SYSTEM_CONTRACTS.GovCouncil,
    eventTypes: ['AddressBlacklisted', 'AddressUnblacklisted'],
    ...params,
  })
}

// ============================================================================
// Dynamic Contract Types
// ============================================================================

/**
 * Input for registering a dynamic contract
 */
export interface RegisterContractInput {
  /** Contract address to register */
  address: string
  /** Contract name */
  name: string
  /** Contract ABI as JSON string */
  abi: string
  /** Optional starting block number (defaults to current block) */
  blockNumber?: string
}

/**
 * Registered contract information
 */
export interface RegisteredContract {
  address: string
  name: string
  abi?: string
  blockNumber?: string
  isVerified: boolean
  registeredAt: string
  events: string[]
}

/**
 * Filter for dynamic contract event subscriptions
 */
export interface DynamicContractSubscriptionFilter {
  /** Filter by specific contract address (optional) */
  contract?: string
  /** Filter by specific event names (optional) */
  eventNames?: string[]
}

/**
 * Dynamic contract event message received via WebSocket subscription
 */
export interface DynamicContractEventMessage {
  contract: string
  contractName: string
  eventName: string
  blockNumber: string
  txHash: string
  logIndex: number
  data: string  // JSON string - needs JSON.parse()
  timestamp: string
}

/**
 * Parsed dynamic contract event with typed data
 */
export interface ParsedDynamicContractEvent<T = Record<string, unknown>> {
  contract: string
  contractName: string
  eventName: string
  blockNumber: string
  txHash: string
  logIndex: number
  data: T
  timestamp: string
}

// ============================================================================
// React Hooks - Dynamic Contract Registration
// ============================================================================

/**
 * Parse the data field from a DynamicContractEventMessage
 * @param message - The event message with JSON data string
 * @returns Parsed event with typed data
 */
export function parseDynamicContractEvent<T = Record<string, unknown>>(
  message: DynamicContractEventMessage
): ParsedDynamicContractEvent<T> {
  let parsedData: T
  try {
    parsedData = JSON.parse(message.data) as T
  } catch {
    parsedData = {} as T
  }

  return {
    contract: message.contract,
    contractName: message.contractName,
    eventName: message.eventName,
    blockNumber: message.blockNumber,
    txHash: message.txHash,
    logIndex: message.logIndex,
    data: parsedData,
    timestamp: message.timestamp,
  }
}

/**
 * Hook to manage contract registration
 *
 * @example
 * const { registerContract, unregisterContract, loading, error } = useContractRegistration()
 *
 * // Register a new contract
 * await registerContract({
 *   address: '0x...',
 *   abi: JSON.stringify(contractAbi),
 *   name: 'MyToken'
 * })
 *
 * // Unregister a contract
 * await unregisterContract('0x...')
 */
export function useContractRegistration() {
  const [registerMutation, { loading: registerLoading, error: registerError }] =
    useMutation<{ registerContract: RegisteredContract }>(REGISTER_CONTRACT_CENTRAL)

  const [unregisterMutation, { loading: unregisterLoading, error: unregisterError }] =
    useMutation<{ unregisterContract: boolean }>(UNREGISTER_CONTRACT_CENTRAL)

  const registerContract = async (input: RegisterContractInput) => {
    const result = await registerMutation({
      variables: { input },
      refetchQueries: [{ query: GET_REGISTERED_CONTRACTS_CENTRAL }],
    })
    return result.data?.registerContract
  }

  const unregisterContract = async (address: string) => {
    const result = await unregisterMutation({
      variables: { address },
      refetchQueries: [{ query: GET_REGISTERED_CONTRACTS_CENTRAL }],
    })
    return result.data?.unregisterContract
  }

  return {
    registerContract,
    unregisterContract,
    loading: registerLoading || unregisterLoading,
    error: registerError || unregisterError,
  }
}

/**
 * Hook to fetch all registered contracts
 *
 * @example
 * const { contracts, loading, error, refetch } = useRegisteredContracts()
 */
export function useRegisteredContracts() {
  const { data, loading, error, refetch, previousData } = useQuery<{
    registeredContracts: RegisteredContract[]
  }>(GET_REGISTERED_CONTRACTS_CENTRAL, {
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const contracts: RegisteredContract[] = effectiveData?.registeredContracts ?? []

  return {
    contracts,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

/**
 * Hook to fetch a specific registered contract
 *
 * @example
 * const { contract, loading, error } = useRegisteredContract('0x...')
 */
export function useRegisteredContract(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery<{
    registeredContract: RegisteredContract | null
  }>(GET_REGISTERED_CONTRACT_CENTRAL, {
    variables: { address },
    skip: !address,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const contract = effectiveData?.registeredContract ?? null

  return {
    contract,
    loading,
    error: isUnsupportedQueryError(error) ? undefined : error,
    refetch,
  }
}

/**
 * Hook to subscribe to events from dynamically registered contracts
 *
 * @example
 * // Subscribe to all dynamic contract events
 * const { event, loading, error } = useDynamicContractEvents()
 *
 * @example
 * // Subscribe to specific contract events
 * const { event } = useDynamicContractEvents({
 *   contract: '0x...'
 * })
 *
 * @example
 * // Subscribe to specific event types
 * const { event } = useDynamicContractEvents({
 *   eventNames: ['Transfer', 'Approval']
 * })
 *
 * @example
 * // Subscribe with callback
 * const { event } = useDynamicContractEvents({
 *   onEvent: (event) => {
 *     console.log('New event:', event.eventName, event.data)
 *   }
 * })
 */
export function useDynamicContractEvents(params: {
  contract?: string
  eventNames?: string[]
  onEvent?: (event: ParsedDynamicContractEvent) => void
  skip?: boolean
} = {}) {
  const { contract, eventNames, onEvent, skip = false } = params

  const { data, loading, error } = useSubscription<{
    dynamicContractEvents: DynamicContractEventMessage
  }>(DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION, {
    variables: {
      filter: {
        ...(contract && { contract }),
        ...(eventNames && eventNames.length > 0 && { eventNames }),
      },
    },
    skip,
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.dynamicContractEvents && onEvent) {
        const parsedEvent = parseDynamicContractEvent(subscriptionData.data.dynamicContractEvents)
        onEvent(parsedEvent)
      }
    },
  })

  const rawEvent = data?.dynamicContractEvents
  const event = rawEvent ? parseDynamicContractEvent(rawEvent) : null

  return {
    event,
    rawEvent,
    loading,
    error,
  }
}
