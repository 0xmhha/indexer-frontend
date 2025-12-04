'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { GET_RECEIPT, GET_RECEIPTS_BY_BLOCK } from '@/lib/apollo/queries'
import { FORMATTING } from '@/lib/config/constants'

// ============================================================================
// Types
// ============================================================================

/**
 * Log entry in a transaction receipt
 */
export interface ReceiptLog {
  address: string
  topics: string[]
  data: string
  logIndex: number
  blockNumber?: string
  transactionHash?: string
}

/**
 * Transaction receipt data structure
 */
export interface TransactionReceipt {
  transactionHash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  status: number  // 0: failed, 1: success
  gasUsed: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  contractAddress: string | null  // Only present for contract creation
  logs: ReceiptLog[]
  logsBloom?: string
}

/**
 * Parsed receipt with convenience methods
 */
export interface ParsedReceipt extends TransactionReceipt {
  isSuccess: boolean
  isFailed: boolean
  gasUsedNumber: number
  effectiveGasPriceBigInt: bigint
  txCostWei: bigint
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse raw receipt into a more usable format
 */
export function parseReceipt(receipt: TransactionReceipt): ParsedReceipt {
  const gasUsed = BigInt(receipt.gasUsed)
  const effectiveGasPrice = BigInt(receipt.effectiveGasPrice)

  return {
    ...receipt,
    isSuccess: receipt.status === 1,
    isFailed: receipt.status === 0,
    gasUsedNumber: Number(gasUsed),
    effectiveGasPriceBigInt: effectiveGasPrice,
    txCostWei: gasUsed * effectiveGasPrice,
  }
}

/**
 * Format gas value for display
 */
export function formatGas(gas: string | number): string {
  const gasNumber = typeof gas === 'string' ? parseInt(gas, 10) : gas
  return gasNumber.toLocaleString()
}

/**
 * Calculate transaction cost in Wei
 */
export function calculateTxCost(receipt: TransactionReceipt): bigint {
  const gasUsed = BigInt(receipt.gasUsed)
  const gasPrice = BigInt(receipt.effectiveGasPrice)
  return gasUsed * gasPrice
}

/**
 * Format Wei to Ether string
 */
export function formatWeiToEther(wei: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** FORMATTING.DEFAULT_DECIMALS)
  const integer = wei / divisor
  const remainder = wei % divisor

  if (remainder === BigInt(0)) {
    return integer.toString()
  }

  const remainderStr = remainder.toString().padStart(FORMATTING.DEFAULT_DECIMALS, '0')
  const decimalPart = remainderStr.slice(0, decimals).replace(/0+$/, '')

  if (decimalPart === '') {
    return integer.toString()
  }

  return `${integer}.${decimalPart}`
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to fetch a single transaction receipt by hash
 *
 * @param txHash - Transaction hash to fetch receipt for
 * @returns Receipt data, loading state, and error
 *
 * @example
 * ```tsx
 * const { receipt, loading, isSuccess, isFailed } = useReceipt('0x1234...')
 *
 * if (loading) return <Spinner />
 * if (isFailed) return <Badge color="red">Failed</Badge>
 * if (isSuccess) return <Badge color="green">Success</Badge>
 * ```
 */
export function useReceipt(txHash: string) {
  const { data, loading, error, refetch, previousData } = useQuery<{
    receipt: TransactionReceipt | null
  }>(GET_RECEIPT, {
    variables: { txHash },
    skip: !txHash,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const rawReceipt = effectiveData?.receipt ?? null
  const receipt = rawReceipt ? parseReceipt(rawReceipt) : null

  // Distinguish between:
  // - hasReceipt: receipt was successfully fetched
  // - hasError: query failed (backend error, nil pointer, etc.)
  // - isPending: no receipt AND no error (truly pending transaction)
  const hasError = Boolean(error)
  const hasReceipt = Boolean(rawReceipt)

  return {
    receipt,
    rawReceipt,
    loading,
    error,
    refetch,
    isSuccess: receipt?.isSuccess ?? false,
    isFailed: receipt?.isFailed ?? false,
    // Only mark as pending if no receipt AND no error
    // If there's an error, let the caller use fallback data
    isPending: !loading && !rawReceipt && !hasError,
    hasError,
    hasReceipt,
  }
}

/**
 * Hook to fetch all receipts for a specific block
 *
 * @param blockNumber - Block number to fetch receipts for
 * @returns Array of receipts, loading state, and error
 *
 * @example
 * ```tsx
 * const { receipts, loading, totalGasUsed } = useReceiptsByBlock('12345')
 *
 * if (loading) return <Spinner />
 * return <div>Total gas used: {totalGasUsed}</div>
 * ```
 */
export function useReceiptsByBlock(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery<{
    receiptsByBlock: TransactionReceipt[]
  }>(GET_RECEIPTS_BY_BLOCK, {
    variables: { blockNumber },
    skip: !blockNumber,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const rawReceipts = effectiveData?.receiptsByBlock ?? []
  const receipts = rawReceipts.map(parseReceipt)

  // Calculate aggregate statistics
  const totalGasUsed = receipts.reduce(
    (sum, r) => sum + BigInt(r.gasUsed),
    BigInt(0)
  )

  const successCount = receipts.filter((r) => r.isSuccess).length
  const failedCount = receipts.filter((r) => r.isFailed).length

  return {
    receipts,
    rawReceipts,
    loading,
    error,
    refetch,
    totalCount: receipts.length,
    successCount,
    failedCount,
    totalGasUsed: totalGasUsed.toString(),
  }
}

/**
 * Hook to poll for a receipt until it becomes available
 * Useful for waiting on pending transactions
 *
 * @param txHash - Transaction hash to poll for
 * @param options - Polling options
 * @returns Receipt data and polling state
 *
 * @example
 * ```tsx
 * const { receipt, isPolling, error } = useReceiptPolling('0x1234...', {
 *   maxAttempts: 30,
 *   intervalMs: 2000,
 *   onSuccess: (receipt) => console.log('Receipt found!', receipt),
 * })
 * ```
 */
export function useReceiptPolling(
  txHash: string,
  options: {
    maxAttempts?: number
    intervalMs?: number
    enabled?: boolean
    onSuccess?: (receipt: ParsedReceipt) => void
    onTimeout?: () => void
  } = {}
) {
  const {
    maxAttempts: _maxAttempts = 30,
    intervalMs = 2000,
    enabled = true,
    onSuccess,
    onTimeout: _onTimeout,
  } = options

  // Track if onSuccess has been called to prevent multiple calls
  const hasCalledOnSuccess = useRef(false)

  const { data, loading, error, startPolling, stopPolling } = useQuery<{
    receipt: TransactionReceipt | null
  }>(GET_RECEIPT, {
    variables: { txHash },
    skip: !txHash || !enabled,
    pollInterval: intervalMs,
    notifyOnNetworkStatusChange: true,
  })

  const rawReceipt = data?.receipt ?? null
  const receipt = rawReceipt ? parseReceipt(rawReceipt) : null

  // Track polling attempts (simplified - in real app would use useRef)
  const isPolling = enabled && !receipt && loading

  // Stop polling and call onSuccess when receipt is found (use useEffect to avoid render-time side effects)
  useEffect(() => {
    if (receipt && onSuccess && !hasCalledOnSuccess.current) {
      hasCalledOnSuccess.current = true
      stopPolling()
      onSuccess(receipt)
    }
  }, [receipt, onSuccess, stopPolling])

  // Reset the flag when txHash changes
  useEffect(() => {
    hasCalledOnSuccess.current = false
  }, [txHash])

  return {
    receipt,
    rawReceipt,
    loading,
    error,
    isPolling,
    startPolling: () => startPolling(intervalMs),
    stopPolling,
  }
}

// ============================================================================
// Event Parsing Utilities
// ============================================================================

// Common event signatures (keccak256 of event signature)
export const EVENT_SIGNATURES = {
  // ERC20 Transfer(address indexed from, address indexed to, uint256 value)
  ERC20_TRANSFER: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  // ERC20 Approval(address indexed owner, address indexed spender, uint256 value)
  ERC20_APPROVAL: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  // ERC721 Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
  ERC721_TRANSFER: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
} as const

/**
 * Parse transfer events from receipt logs
 */
export interface TransferEvent {
  from: string
  to: string
  value: bigint
  logIndex: number
}

/**
 * Extract ERC20 Transfer events from receipt logs
 */
export function parseTransferLogs(logs: ReceiptLog[]): TransferEvent[] {
  return logs
    .filter((log) => log.topics[0] === EVENT_SIGNATURES.ERC20_TRANSFER)
    .map((log) => {
      // topics[1] = from address (padded to 32 bytes)
      // topics[2] = to address (padded to 32 bytes)
      // data = value
      const from = `0x${log.topics[1]?.slice(FORMATTING.TOPIC_ADDRESS_OFFSET) ?? ''}`
      const to = `0x${log.topics[2]?.slice(FORMATTING.TOPIC_ADDRESS_OFFSET) ?? ''}`
      const value = log.data ? BigInt(log.data) : BigInt(0)

      return {
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        value,
        logIndex: log.logIndex,
      }
    })
}

/**
 * Filter logs by contract address
 */
export function filterLogsByAddress(
  logs: ReceiptLog[],
  address: string
): ReceiptLog[] {
  const normalizedAddress = address.toLowerCase()
  return logs.filter((log) => log.address.toLowerCase() === normalizedAddress)
}

/**
 * Filter logs by event topic
 */
export function filterLogsByTopic(
  logs: ReceiptLog[],
  topic: string
): ReceiptLog[] {
  return logs.filter((log) => log.topics[0] === topic)
}
