'use client'

/**
 * Governance Blacklist Hooks
 * Hooks for GovCouncil (0x1004) blacklist operations
 */

import { gql, useQuery } from '@apollo/client'
import {
  GET_BLACKLISTED_ADDRESSES,
} from '@/lib/graphql/queries/system-contracts'

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// GraphQL Queries - Local
// ============================================================================

const GET_BLACKLIST_HISTORY = gql`
  query GetBlacklistHistoryLocal($address: String!) {
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

// ============================================================================
// Hooks
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
