'use client'

import { gql, useQuery } from '@apollo/client'
import { transformTransactions, type TransformedTransaction } from '@/lib/utils/graphql-transforms'
import { PAGINATION } from '@/lib/config/constants'

// Query for filtered transactions by address using HistoricalTransactionFilter
const GET_FILTERED_TRANSACTIONS = gql`
  query GetFilteredTransactions(
    $address: String!
    $fromBlock: String!
    $toBlock: String!
    $minValue: String
    $maxValue: String
    $txType: Int
    $successOnly: Boolean
    $isFeeDelegated: Boolean
    $methodId: String
    $minGasUsed: String
    $maxGasUsed: String
    $direction: TransactionDirection
    $fromTime: String
    $toTime: String
    $limit: Int
    $offset: Int
  ) {
    transactionsByAddressFiltered(
      address: $address
      filter: {
        fromBlock: $fromBlock
        toBlock: $toBlock
        minValue: $minValue
        maxValue: $maxValue
        txType: $txType
        successOnly: $successOnly
        isFeeDelegated: $isFeeDelegated
        methodId: $methodId
        minGasUsed: $minGasUsed
        maxGasUsed: $maxGasUsed
        direction: $direction
        fromTime: $fromTime
        toTime: $toTime
      }
      pagination: { limit: $limit, offset: $offset }
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
        blockTimestamp
        receipt {
          status
          gasUsed
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export interface FilteredTransactionsParams {
  address: string
  fromBlock: string
  toBlock: string
  minValue?: string | undefined
  maxValue?: string | undefined
  txType?: number | undefined
  successOnly?: boolean | undefined
  isFeeDelegated?: boolean | undefined
  methodId?: string | undefined
  minGasUsed?: string | undefined
  maxGasUsed?: string | undefined
  direction?: 'SENT' | 'RECEIVED' | 'ALL' | undefined
  fromTime?: string | undefined
  toTime?: string | undefined
  limit?: number
  offset?: number
}

/**
 * Hook to fetch filtered transactions for an address using HistoricalTransactionFilter
 */
export function useFilteredTransactions(params: FilteredTransactionsParams) {
  const {
    address,
    fromBlock,
    toBlock,
    minValue,
    maxValue,
    txType,
    successOnly,
    isFeeDelegated,
    methodId,
    minGasUsed,
    maxGasUsed,
    direction,
    fromTime,
    toTime,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_FILTERED_TRANSACTIONS, {
    variables: {
      address,
      fromBlock,
      toBlock,
      minValue: minValue || undefined,
      maxValue: maxValue || undefined,
      txType: txType ?? undefined,
      successOnly: successOnly ?? undefined,
      isFeeDelegated: isFeeDelegated ?? undefined,
      methodId: methodId || undefined,
      minGasUsed: minGasUsed || undefined,
      maxGasUsed: maxGasUsed || undefined,
      direction: direction || undefined,
      fromTime: fromTime || undefined,
      toTime: toTime || undefined,
      limit,
      offset,
    },
    skip: !address || !fromBlock || !toBlock,
    returnPartialData: true,
  })

  // Use previous data while loading new data to prevent flickering
  const effectiveData = data ?? previousData

  const rawTransactions = effectiveData?.transactionsByAddressFiltered?.nodes ?? []
  const transactions: TransformedTransaction[] = transformTransactions(rawTransactions)
  const totalCount = effectiveData?.transactionsByAddressFiltered?.totalCount ?? 0
  const pageInfo = effectiveData?.transactionsByAddressFiltered?.pageInfo

  return {
    transactions,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
  }
}
