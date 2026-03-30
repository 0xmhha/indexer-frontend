/**
 * Hook to detect ERC-20 token payments related to a Paymaster
 *
 * Scans transaction receipt logs for ERC-20 Transfer events where
 * from/to matches the paymaster address, indicating token-based gas payment.
 */

'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_RECEIPT } from '@/lib/apollo/queries'
import { ABI, FORMATTING } from '@/lib/config/constants'
import { useTokenInfoCache } from '@/lib/hooks/useTokenInfoCache'
import type { TokenPayment } from '@/types/aa'
import type { Log } from '@/types/graphql'

/** ERC-20 Transfer event signature hash */
const TRANSFER_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

/** Minimum topics for an ERC-20 Transfer (sig + from + to) */
const MIN_TRANSFER_TOPICS = ABI.ERC20_TOPICS_COUNT

interface UseUserOpTokenPaymentsResult {
  tokenPayments: TokenPayment[]
  loading: boolean
  error: Error | null
}

/**
 * Extract address from a 32-byte topic (last 20 bytes)
 */
function addressFromTopic(topic: string): string {
  const cleaned = topic.startsWith('0x') ? topic.slice(2) : topic
  return `0x${cleaned.slice(ABI.ADDRESS_OFFSET)}`.toLowerCase()
}

/**
 * Find ERC-20 Transfer logs involving a paymaster address.
 */
function findPaymasterTransfers(logs: Log[], pmLower: string): Log[] {
  return logs.filter((log) => {
    if (!log.topics || log.topics.length < MIN_TRANSFER_TOPICS) { return false }
    const sig = log.topics[0]?.toLowerCase()
    if (sig !== TRANSFER_SIG) { return false }

    const from = log.topics[1] ? addressFromTopic(log.topics[1]) : ''
    const to = log.topics[2] ? addressFromTopic(log.topics[2]) : ''

    return from === pmLower || to === pmLower
  })
}

/**
 * Convert Transfer logs into TokenPayment objects.
 */
function buildTokenPayments(
  transferLogs: Log[],
  tokenInfoMap: Map<string, { name: string; symbol: string; decimals: number }>,
  pmLower: string
): TokenPayment[] {
  return transferLogs.map((log) => {
    const to = log.topics[2] ? addressFromTopic(log.topics[2]) : ''
    const direction: 'in' | 'out' = to === pmLower ? 'in' : 'out'

    const cleanData = log.data.startsWith('0x') ? log.data.slice(2) : log.data
    const amountHex = cleanData.slice(0, ABI.WORD_SIZE).replace(/^0+/, '') || '0'
    const amount = BigInt(`0x${amountHex}`)

    const info = tokenInfoMap.get(log.address.toLowerCase())

    return {
      token: {
        name: info?.name ?? 'Unknown Token',
        symbol: info?.symbol ?? '???',
        decimals: info?.decimals ?? FORMATTING.DEFAULT_DECIMALS,
      },
      amount,
      direction,
    }
  }).filter((p) => p.amount > BigInt(0))
}

export function useUserOpTokenPayments(
  bundleTxHash: string,
  paymasterAddress: string | null
): UseUserOpTokenPaymentsResult {
  const skip = !bundleTxHash || !paymasterAddress

  const { data, loading, error } = useQuery(GET_RECEIPT, {
    variables: { hash: bundleTxHash },
    skip,
    fetchPolicy: 'cache-first',
  })

  const receiptLogs = useMemo(
    () => (data?.receipt?.logs ?? []) as Log[],
    [data]
  )
  const pmLower = paymasterAddress?.toLowerCase() ?? ''

  const transferLogs = useMemo(
    () => (skip ? [] : findPaymasterTransfers(receiptLogs, pmLower)),
    [receiptLogs, pmLower, skip]
  )

  const tokenAddresses = useMemo(
    () => [...new Set(transferLogs.map((log) => log.address))],
    [transferLogs]
  )

  const tokenInfoMap = useTokenInfoCache(tokenAddresses)

  const tokenPayments = useMemo(
    () => buildTokenPayments(transferLogs, tokenInfoMap, pmLower),
    [transferLogs, tokenInfoMap, pmLower]
  )

  return {
    tokenPayments,
    loading,
    error: error ?? null,
  }
}
