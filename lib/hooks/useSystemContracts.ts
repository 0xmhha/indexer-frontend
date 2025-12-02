'use client'

import { gql, useQuery, useSubscription } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'

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
// GraphQL Queries - NativeCoinAdapter (0x1000)
// ============================================================================

const GET_TOTAL_SUPPLY = gql`
  query GetTotalSupply {
    totalSupply
  }
`

// Backend uses SystemContractEventFilter: { fromBlock, toBlock, address }
// and returns transactionHash (not txHash)
const GET_MINT_EVENTS = gql`
  query GetMintEvents(
    $fromBlock: String!
    $toBlock: String!
    $address: String
    $limit: Int
    $offset: Int
  ) {
    mintEvents(
      filter: { fromBlock: $fromBlock, toBlock: $toBlock, address: $address }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        blockNumber
        transactionHash
        minter
        to
        amount
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const GET_BURN_EVENTS = gql`
  query GetBurnEvents(
    $fromBlock: String!
    $toBlock: String!
    $address: String
    $limit: Int
    $offset: Int
  ) {
    burnEvents(
      filter: { fromBlock: $fromBlock, toBlock: $toBlock, address: $address }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        blockNumber
        transactionHash
        burner
        amount
        timestamp
        withdrawalId
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Backend returns [MinterInfo!]! with address, allowance, isActive
const GET_ACTIVE_MINTERS = gql`
  query GetActiveMinters {
    activeMinters {
      address
      allowance
      isActive
    }
  }
`

const GET_MINTER_ALLOWANCE = gql`
  query GetMinterAllowance($minter: String!) {
    minterAllowance(minter: $minter)
  }
`

// Backend returns [MinterConfigEvent!]! with action field
const GET_MINTER_HISTORY = gql`
  query GetMinterHistory($minter: String!) {
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

// ============================================================================
// GraphQL Queries - GovValidator (0x1001)
// ============================================================================

// Backend returns [ValidatorInfo!]! with address, isActive
const GET_ACTIVE_VALIDATORS = gql`
  query GetActiveValidators {
    activeValidators {
      address
      isActive
    }
  }
`

// Backend uses SystemContractEventFilter
const GET_GAS_TIP_HISTORY = gql`
  query GetGasTipHistory($fromBlock: String!, $toBlock: String!) {
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
  query GetValidatorHistory($validator: String!) {
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

// ============================================================================
// GraphQL Queries - GovMasterMinter (0x1002)
// NOTE: minterConfigHistory query is not exposed in backend GraphQL yet
// ============================================================================

// NOTE: This query may not be available - backend needs to expose it
const GET_MINTER_CONFIG_HISTORY = gql`
  query GetMinterConfigHistory($fromBlock: String!, $toBlock: String!) {
    minterConfigHistory(fromBlock: $fromBlock, toBlock: $toBlock) {
      blockNumber
      transactionHash
      minter
      allowance
      action
      timestamp
    }
  }
`

// Backend returns [EmergencyPauseEvent!]!
const GET_EMERGENCY_PAUSE_HISTORY = gql`
  query GetEmergencyPauseHistory($contract: String!) {
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

// ============================================================================
// GraphQL Queries - GovMinter (0x1003)
// ============================================================================

// Backend uses SystemContractEventFilter and optional status
const GET_DEPOSIT_MINT_PROPOSALS = gql`
  query GetDepositMintProposals(
    $fromBlock: String!
    $toBlock: String!
    $status: ProposalStatus
  ) {
    depositMintProposals(
      filter: { fromBlock: $fromBlock, toBlock: $toBlock }
      status: $status
    ) {
      proposalId
      requester
      beneficiary
      amount
      depositId
      bankReference
      status
      blockNumber
      transactionHash
      timestamp
    }
  }
`

// NOTE: burnHistory query is not exposed in backend GraphQL yet
// Using burnEvents query instead for burn data
const GET_BURN_HISTORY = gql`
  query GetBurnHistory($fromBlock: String!, $toBlock: String!, $address: String) {
    burnEvents(
      filter: { fromBlock: $fromBlock, toBlock: $toBlock, address: $address }
    ) {
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

// ============================================================================
// GraphQL Queries - GovCouncil (0x1004)
// ============================================================================

const GET_BLACKLISTED_ADDRESSES = gql`
  query GetBlacklistedAddresses {
    blacklistedAddresses
  }
`

// Backend returns [BlacklistEvent!]!
const GET_BLACKLIST_HISTORY = gql`
  query GetBlacklistHistory($address: String!) {
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
const GET_AUTHORIZED_ACCOUNTS = gql`
  query GetAuthorizedAccounts {
    authorizedAccounts
  }
`

// ============================================================================
// GraphQL Queries - MaxProposalsUpdate (GovBase 공통)
// ============================================================================

const GET_MAX_PROPOSALS_UPDATE_HISTORY = gql`
  query GetMaxProposalsUpdateHistory($contract: String!) {
    maxProposalsUpdateHistory(contract: $contract) {
      contract
      blockNumber
      transactionHash
      oldMax
      newMax
      timestamp
    }
  }
`

// ============================================================================
// GraphQL Queries - ProposalExecutionSkipped (GovCouncil)
// ============================================================================

const GET_PROPOSAL_EXECUTION_SKIPPED = gql`
  query GetProposalExecutionSkippedEvents($contract: String!, $proposalId: String) {
    proposalExecutionSkippedEvents(contract: $contract, proposalId: $proposalId) {
      contract
      blockNumber
      transactionHash
      account
      proposalId
      reason
      timestamp
    }
  }
`

// ============================================================================
// GraphQL Queries - Common Governance
// ============================================================================

// Backend uses ProposalFilter: { contract (nullable), status, proposer }
const GET_PROPOSALS = gql`
  query GetProposals(
    $contract: String
    $status: ProposalStatus
    $proposer: String
    $limit: Int
    $offset: Int
  ) {
    proposals(
      filter: { contract: $contract, status: $status, proposer: $proposer }
      pagination: { limit: $limit, offset: $offset }
    ) {
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
const GET_PROPOSAL_VOTES = gql`
  query GetProposalVotes($contract: String!, $proposalId: String!) {
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
  query GetMemberHistory($contract: String!) {
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
      fromBlock,
      toBlock,
      address: minter,
      limit,
      offset,
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
      fromBlock,
      toBlock,
      address: burner,
      limit,
      offset,
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
 */
export function useMinterConfigHistory(params: {
  fromBlock?: string
  toBlock?: string
} = {}) {
  const { fromBlock = '0', toBlock = '999999999' } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_MINTER_CONFIG_HISTORY, {
    variables: { fromBlock, toBlock },
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: MinterConfigEvent[] = effectiveData?.minterConfigHistory ?? []

  return {
    history,
    loading,
    error,
    refetch,
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

  const { data, loading, error, refetch, previousData } = useQuery(GET_DEPOSIT_MINT_PROPOSALS, {
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
      fromBlock,
      toBlock,
      address: user,
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
 * Note: Partially implemented in backend, may return empty array
 */
export function useAuthorizedAccounts() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_AUTHORIZED_ACCOUNTS, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const accounts: string[] = effectiveData?.authorizedAccounts ?? []

  return {
    accounts,
    totalCount: accounts.length,
    loading,
    error,
    refetch,
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
  const { data, loading, error, refetch, previousData } = useQuery(GET_MAX_PROPOSALS_UPDATE_HISTORY, {
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
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_EXECUTION_SKIPPED, {
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

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_PROPOSALS, {
    variables: { contract, status: backendStatus, proposer, limit, offset },
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
  const { data, loading, error, refetch, previousData } = useQuery(GET_PROPOSAL_VOTES, {
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
  if (filter === 'all') return undefined
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
// GraphQL Subscription - System Contract Events (WebSocket)
// ============================================================================

const SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION = gql`
  subscription SystemContractEvents($filter: SystemContractSubscriptionFilter) {
    systemContractEvents(filter: $filter) {
      contract
      eventName
      blockNumber
      transactionHash
      logIndex
      data
      timestamp
    }
  }
`

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
