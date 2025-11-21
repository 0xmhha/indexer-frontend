'use client'

import { gql, useQuery } from '@apollo/client'

// Query for total token supply
const GET_TOTAL_SUPPLY = gql`
  query GetTotalSupply {
    totalSupply {
      amount
      lastUpdated
    }
  }
`

// Query for active minters
const GET_ACTIVE_MINTERS = gql`
  query GetActiveMinters($limit: Int, $offset: Int) {
    activeMinters(pagination: { limit: $limit, offset: $offset }) {
      nodes {
        address
        allowance
        isActive
        addedAt
        lastMintAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Query for mint events
const GET_MINT_EVENTS = gql`
  query GetMintEvents(
    $limit: Int
    $offset: Int
    $minter: String
    $recipient: String
    $fromTimestamp: String
    $toTimestamp: String
  ) {
    mintEvents(
      pagination: { limit: $limit, offset: $offset }
      filter: {
        minter: $minter
        recipient: $recipient
        fromTimestamp: $fromTimestamp
        toTimestamp: $toTimestamp
      }
    ) {
      nodes {
        transactionHash
        blockNumber
        timestamp
        minter
        recipient
        amount
        logIndex
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Query for burn events
const GET_BURN_EVENTS = gql`
  query GetBurnEvents(
    $limit: Int
    $offset: Int
    $burner: String
    $fromTimestamp: String
    $toTimestamp: String
  ) {
    burnEvents(
      pagination: { limit: $limit, offset: $offset }
      filter: { burner: $burner, fromTimestamp: $fromTimestamp, toTimestamp: $toTimestamp }
    ) {
      nodes {
        transactionHash
        blockNumber
        timestamp
        burner
        amount
        logIndex
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Types
export interface TotalSupply {
  amount: string
  lastUpdated: string
}

export interface ActiveMinter {
  address: string
  allowance: string
  isActive: boolean
  addedAt: string
  lastMintAt?: string
}

export interface MintEvent {
  transactionHash: string
  blockNumber: string
  timestamp: string
  minter: string
  recipient: string
  amount: string
  logIndex: number
}

export interface BurnEvent {
  transactionHash: string
  blockNumber: string
  timestamp: string
  burner: string
  amount: string
  logIndex: number
}

/**
 * Hook to fetch total token supply
 */
export function useTotalSupply() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_TOTAL_SUPPLY, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const totalSupply: TotalSupply | null = effectiveData?.totalSupply ?? null

  return {
    totalSupply,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch active minters
 */
export function useActiveMinters(params: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_ACTIVE_MINTERS, {
    variables: { limit, offset },
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const minters: ActiveMinter[] = effectiveData?.activeMinters?.nodes ?? []
  const totalCount = effectiveData?.activeMinters?.totalCount ?? 0
  const pageInfo = effectiveData?.activeMinters?.pageInfo

  return {
    minters,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch mint events
 */
export function useMintEvents(
  params: {
    limit?: number
    offset?: number
    minter?: string
    recipient?: string
    fromTimestamp?: string
    toTimestamp?: string
  } = {}
) {
  const { limit = 20, offset = 0, minter, recipient, fromTimestamp, toTimestamp } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_MINT_EVENTS, {
    variables: {
      limit,
      offset,
      minter,
      recipient,
      fromTimestamp,
      toTimestamp,
    },
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const mintEvents: MintEvent[] = effectiveData?.mintEvents?.nodes ?? []
  const totalCount = effectiveData?.mintEvents?.totalCount ?? 0
  const pageInfo = effectiveData?.mintEvents?.pageInfo

  return {
    mintEvents,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch burn events
 */
export function useBurnEvents(
  params: {
    limit?: number
    offset?: number
    burner?: string
    fromTimestamp?: string
    toTimestamp?: string
  } = {}
) {
  const { limit = 20, offset = 0, burner, fromTimestamp, toTimestamp } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_BURN_EVENTS, {
    variables: {
      limit,
      offset,
      burner,
      fromTimestamp,
      toTimestamp,
    },
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const burnEvents: BurnEvent[] = effectiveData?.burnEvents?.nodes ?? []
  const totalCount = effectiveData?.burnEvents?.totalCount ?? 0
  const pageInfo = effectiveData?.burnEvents?.pageInfo

  return {
    burnEvents,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}
