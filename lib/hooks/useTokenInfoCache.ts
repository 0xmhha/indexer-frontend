/**
 * Token Info Cache Hook
 *
 * Resolves token metadata (name, symbol, decimals) for contract addresses.
 * Uses a two-tier strategy:
 *   1. Static known-tokens registry (instant)
 *   2. RPC proxy CONTRACT_CALL for name()/symbol()/decimals() (async fallback)
 *
 * Follows the module-level Map cache pattern from useContractDetection.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client'
import { CONTRACT_CALL } from '@/lib/graphql/queries/rpcProxy'
import { FORMATTING } from '@/lib/config/constants'
import { getKnownToken, type TokenInfo } from '@/lib/config/known-tokens'

/** Module-level cache: persists for the browser session */
const tokenCache = new Map<string, TokenInfo>()

/** Max concurrent RPC queries per batch */
const MAX_CONCURRENT = 5

/** Addresses currently being fetched (prevent duplicates) */
const inflight = new Set<string>()

/**
 * Parse a CONTRACT_CALL result into a string value.
 */
function parseContractCallResult(data: Record<string, unknown>): string | null {
  const call = data?.contractCall as { result: string | null; decoded: boolean } | undefined
  if (!call?.decoded || !call.result) { return null }
  try {
    return JSON.parse(call.result)
  } catch {
    return call.result
  }
}

/**
 * Batch hook: resolves TokenInfo for a list of contract addresses.
 *
 * - Deduplicates and lowercases addresses
 * - Checks known-tokens registry + module-level cache first
 * - Queries only unknown addresses via RPC proxy, max 5 in parallel
 * - On failure, skips the address (graceful degradation)
 *
 * @param addresses - array of contract addresses to resolve
 * @returns Map<string(lowercase), TokenInfo>
 */
export function useTokenInfoCache(addresses: string[]): Map<string, TokenInfo> {
  const client = useApolloClient()
  const [result, setResult] = useState<Map<string, TokenInfo>>(() => new Map())
  const prevAddressesRef = useRef<string>('')

  useEffect(() => {
    const addressKey = addresses.join(',')
    if (addressKey === prevAddressesRef.current) { return undefined }
    prevAddressesRef.current = addressKey

    if (addresses.length === 0) { return undefined }

    // Build snapshot from known-tokens + cache
    const snapshot = new Map<string, TokenInfo>()
    const uncached: string[] = []

    for (const addr of addresses) {
      if (!addr) { continue }
      const key = addr.toLowerCase()

      // Check module cache first
      const cached = tokenCache.get(key)
      if (cached) {
        snapshot.set(key, cached)
        continue
      }

      // Check static registry
      const known = getKnownToken(key)
      if (known) {
        tokenCache.set(key, known)
        snapshot.set(key, known)
        continue
      }

      // Needs RPC lookup
      if (!inflight.has(key)) {
        uncached.push(key)
      }
    }

    setResult(new Map(snapshot))

    if (uncached.length === 0) { return undefined }

    let cancelled = false

    async function fetchTokenInfo(addr: string): Promise<void> {
      inflight.add(addr)
      try {
        const [nameRes, symbolRes, decimalsRes] = await Promise.all([
          client.query({ query: CONTRACT_CALL, variables: { address: addr, method: 'name' }, fetchPolicy: 'cache-first' }),
          client.query({ query: CONTRACT_CALL, variables: { address: addr, method: 'symbol' }, fetchPolicy: 'cache-first' }),
          client.query({ query: CONTRACT_CALL, variables: { address: addr, method: 'decimals' }, fetchPolicy: 'cache-first' }),
        ])

        const name = parseContractCallResult(nameRes.data as Record<string, unknown>)
        const symbol = parseContractCallResult(symbolRes.data as Record<string, unknown>)
        const decimalsStr = parseContractCallResult(decimalsRes.data as Record<string, unknown>)

        if (symbol) {
          const info: TokenInfo = {
            name: name ?? symbol,
            symbol,
            decimals: decimalsStr ? Number(decimalsStr) : FORMATTING.DEFAULT_DECIMALS,
          }
          tokenCache.set(addr, info)
        }
      } catch {
        // Graceful degradation: skip this address
      } finally {
        inflight.delete(addr)
      }
    }

    async function run() {
      // Process in chunks of MAX_CONCURRENT
      const unique = [...new Set(uncached)]
      for (let i = 0; i < unique.length; i += MAX_CONCURRENT) {
        if (cancelled) { return }
        const chunk = unique.slice(i, i + MAX_CONCURRENT)
        await Promise.all(chunk.map(fetchTokenInfo))

        if (cancelled) { return }

        // Build updated snapshot
        const updated = new Map<string, TokenInfo>()
        for (const addr of addresses) {
          if (!addr) { continue }
          const key = addr.toLowerCase()
          const cached = tokenCache.get(key)
          if (cached) { updated.set(key, cached) }
        }
        setResult(updated)
      }
    }

    run()

    return () => { cancelled = true }
  }, [addresses, client])

  return result
}

/**
 * Synchronous cache lookup (no query). Returns undefined if not cached.
 */
export function getTokenInfoCached(address: string): TokenInfo | undefined {
  return tokenCache.get(address.toLowerCase()) ?? getKnownToken(address)
}
