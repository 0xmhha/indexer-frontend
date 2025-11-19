'use client'

import { gql, useQuery } from '@apollo/client'
import { transformTransactions, type TransformedTransaction } from '@/lib/utils/graphql-transforms'

// Query for transactions with pagination
const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $limit: Int
    $offset: Int
    $blockNumberFrom: String
    $blockNumberTo: String
    $from: String
    $to: String
    $type: Int
  ) {
    transactions(
      pagination: { limit: $limit, offset: $offset }
      filter: {
        blockNumberFrom: $blockNumberFrom
        blockNumberTo: $blockNumberTo
        from: $from
        to: $to
        type: $type
      }
    ) {
      nodes {
        hash
        blockNumber
        from
        to
        value
        gas
        gasPrice
        type
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

interface UseTransactionsParams {
  limit?: number
  offset?: number
  blockNumberFrom?: string
  blockNumberTo?: string
  from?: string
  to?: string
  type?: number
}

/**
 * Hook to fetch transactions with pagination and filtering
 */
export function useTransactions(params: UseTransactionsParams = {}) {
  const { limit = 20, offset = 0, blockNumberFrom, blockNumberTo, from, to, type } = params

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_TRANSACTIONS, {
    variables: {
      limit,
      offset,
      blockNumberFrom,
      blockNumberTo,
      from,
      to,
      type,
    },
  })

  const rawTransactions = data?.transactions?.nodes ?? []
  const transactions: TransformedTransaction[] = transformTransactions(rawTransactions)
  const totalCount = data?.transactions?.totalCount ?? 0
  const pageInfo = data?.transactions?.pageInfo

  return {
    transactions,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}
