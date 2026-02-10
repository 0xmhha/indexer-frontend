'use client'

/**
 * Validator & Minter Governance Hooks
 * Hooks for GovValidator (0x1001), GovMasterMinter (0x1002), GovMinter (0x1003),
 * and common governance operations
 */

import { gql, useQuery } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_ACTIVE_VALIDATORS,
  GET_DEPOSIT_MINT_PROPOSALS,
  GET_MAX_PROPOSALS_UPDATE_HISTORY,
  GET_PROPOSAL_EXECUTION_SKIPPED,
} from '@/lib/graphql/queries/system-contracts'
import type { BackendProposalStatus } from './useGovernanceProposals'

// ============================================================================
// Types
// ============================================================================

export interface Validator {
  address: string
  isActive: boolean
}

export interface ValidatorInfo {
  address: string
  isActive: boolean
}

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

// ============================================================================
// GraphQL Queries - Local
// ============================================================================

const GET_GAS_TIP_HISTORY = gql`
  query GetGasTipHistoryLocal($fromBlock: String!, $toBlock: String!) {
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
  query GetValidatorHistoryLocal($validator: String!) {
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
  query GetEmergencyPauseHistoryLocal($contract: String!) {
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

const GET_MEMBER_HISTORY = gql`
  query GetMemberHistoryLocal($contract: String!) {
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
