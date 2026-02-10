'use client'

import { useMemo } from 'react'
import type { AdvancedTransactionFilterValues } from './types'

/**
 * Hook to convert filter values to query parameters
 */
export function useFilterQueryParams(filters: AdvancedTransactionFilterValues) {
  return useMemo(() => {
    const params: Record<string, string> = {}

    if (filters.fromBlock) params.fromBlock = filters.fromBlock
    if (filters.toBlock) params.toBlock = filters.toBlock
    if (filters.minValue) params.minValue = filters.minValue
    if (filters.maxValue) params.maxValue = filters.maxValue
    if (filters.direction !== 'all') params.direction = filters.direction
    if (filters.status !== 'all') params.status = filters.status
    if (filters.eipType !== -1) params.type = filters.eipType.toString()
    if (filters.contractInteraction !== 'all') params.interaction = filters.contractInteraction
    if (filters.feeDelegated !== 'all') params.feeDelegated = filters.feeDelegated
    if (filters.fromAddress) params.from = filters.fromAddress
    if (filters.toAddress) params.to = filters.toAddress
    if (filters.methodId) params.methodId = filters.methodId
    if (filters.minGasUsed) params.minGas = filters.minGasUsed
    if (filters.maxGasUsed) params.maxGas = filters.maxGasUsed
    if (filters.timeRange !== 'all') params.time = filters.timeRange

    return params
  }, [filters])
}
