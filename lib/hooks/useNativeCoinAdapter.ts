'use client'

/**
 * NativeCoinAdapter (0x1000) Hooks
 * Token-related operations: total supply, mint/burn events, minter management
 */

import { gql, useQuery } from '@apollo/client'
import { PAGINATION } from '@/lib/config/constants'
import {
  GET_TOTAL_SUPPLY,
  GET_ACTIVE_MINTERS,
  GET_MINTER_ALLOWANCE,
  GET_MINT_EVENTS,
  GET_BURN_EVENTS,
} from '@/lib/graphql/queries/system-contracts'

// ============================================================================
// Types
// ============================================================================

export interface MinterInfo {
  address: string
  allowance: string
  isActive: boolean
}

export interface MintEvent {
  blockNumber: string
  transactionHash: string
  minter: string
  to: string
  amount: string
  timestamp: string
  txHash?: string
}

export interface BurnEvent {
  blockNumber: string
  transactionHash: string
  burner: string
  amount: string
  timestamp: string
  withdrawalId?: string
  txHash?: string
}

export interface MinterConfigEvent {
  blockNumber: string
  transactionHash: string
  minter: string
  allowance: string
  action: string
  timestamp: string
  txHash?: string
  isActive?: boolean
}

// ============================================================================
// GraphQL Queries - Local
// ============================================================================

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

// ============================================================================
// Helper
// ============================================================================

const isUnsupportedQueryError = (error: Error | undefined): boolean => {
  const msg = error?.message ?? ''
  return msg.includes('Cannot query field') || msg.includes('Unknown field')
}

// ============================================================================
// Hooks
// ============================================================================

export function useTotalSupply() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_TOTAL_SUPPLY, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const totalSupply: string | null = effectiveData?.totalSupply ?? null

  return { totalSupply, loading, error, refetch }
}

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

export function useActiveMinters() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_MINTERS, {
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const minterInfos: MinterInfo[] = effectiveData?.activeMinters ?? []
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

export function useMinterAllowance(minter: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MINTER_ALLOWANCE, {
    variables: { minter },
    skip: !minter,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const allowance: string | null = effectiveData?.minterAllowance ?? null

  return { allowance, loading, error, refetch }
}

export function useMinterHistory(minter: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_MINTER_HISTORY, {
    variables: { minter },
    skip: !minter,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const history: MinterConfigEvent[] = effectiveData?.minterHistory ?? []

  return { history, loading, error, refetch }
}
