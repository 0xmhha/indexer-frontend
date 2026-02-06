'use client'

/**
 * Contract Subscription Hooks
 * System contract events and dynamic contract management
 */

import { useQuery, useSubscription, useMutation } from '@apollo/client'
import {
  SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION,
  REGISTER_CONTRACT,
  UNREGISTER_CONTRACT,
  GET_REGISTERED_CONTRACTS,
  GET_REGISTERED_CONTRACT,
  DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION,
} from '@/lib/graphql/queries/system-contracts'

// ============================================================================
// System Contract Constants
// ============================================================================

export const SYSTEM_CONTRACTS = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

// ============================================================================
// Types - System Contract Subscriptions
// ============================================================================

export interface SystemContractSubscriptionFilter {
  contract?: string
  eventTypes?: string[]
}

export interface SystemContractEventMessage {
  contract: string
  eventName: string
  blockNumber: string
  transactionHash: string
  logIndex: number
  data: string
  timestamp: string
}

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
// Types - Dynamic Contracts
// ============================================================================

export interface RegisterContractInput {
  address: string
  name: string
  abi: string
  blockNumber?: string
}

export interface RegisteredContract {
  address: string
  name: string
  abi?: string
  blockNumber?: string
  isVerified: boolean
  registeredAt: string
  events: string[]
}

export interface DynamicContractSubscriptionFilter {
  contract?: string
  eventNames?: string[]
}

export interface DynamicContractEventMessage {
  contract: string
  contractName: string
  eventName: string
  blockNumber: string
  txHash: string
  logIndex: number
  data: string
  timestamp: string
}

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
// Helper
// ============================================================================

const isUnsupportedQueryError = (error: Error | undefined): boolean => {
  const msg = error?.message ?? ''
  return msg.includes('Cannot query field') || msg.includes('Unknown field')
}

// ============================================================================
// Parsing Functions
// ============================================================================

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

// ============================================================================
// System Contract Event Subscriptions
// ============================================================================

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

  return { event, rawEvent, loading, error }
}

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
// Dynamic Contract Registration
// ============================================================================

export function useContractRegistration() {
  const [registerMutation, { loading: registerLoading, error: registerError }] =
    useMutation<{ registerContract: RegisteredContract }>(REGISTER_CONTRACT)

  const [unregisterMutation, { loading: unregisterLoading, error: unregisterError }] =
    useMutation<{ unregisterContract: boolean }>(UNREGISTER_CONTRACT)

  const registerContract = async (input: RegisterContractInput) => {
    const result = await registerMutation({
      variables: { input },
      refetchQueries: [{ query: GET_REGISTERED_CONTRACTS }],
    })
    return result.data?.registerContract
  }

  const unregisterContract = async (address: string) => {
    const result = await unregisterMutation({
      variables: { address },
      refetchQueries: [{ query: GET_REGISTERED_CONTRACTS }],
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

export function useRegisteredContracts() {
  const { data, loading, error, refetch, previousData } = useQuery<{
    registeredContracts: RegisteredContract[]
  }>(GET_REGISTERED_CONTRACTS, {
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

export function useRegisteredContract(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery<{
    registeredContract: RegisteredContract | null
  }>(GET_REGISTERED_CONTRACT, {
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

  return { event, rawEvent, loading, error }
}
