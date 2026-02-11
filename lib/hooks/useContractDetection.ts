'use client'

import { useState, useEffect, useRef } from 'react'
import { useApolloClient } from '@apollo/client'
import { GET_ADDRESS_OVERVIEW } from '@/lib/apollo/queries'

/**
 * Module-level cache: persists for the browser session.
 * Maps lowercase address -> isContract boolean.
 */
const contractCache = new Map<string, boolean>()

/** Max concurrent queries to avoid overwhelming the backend */
const MAX_CONCURRENT = 5

/**
 * Batch hook: resolves isContract for a list of addresses efficiently.
 *
 * - Deduplicates and lowercases addresses
 * - Checks module-level cache first (+ Apollo cache underneath)
 * - Queries only unknown addresses, max 5 in parallel
 * - On failure, treats address as non-contract (graceful degradation)
 *
 * @param addresses - array of hex addresses to check
 * @returns Map<string(lowercase), boolean>
 */
export function useContractDetection(addresses: string[]): Map<string, boolean> {
  const client = useApolloClient()
  const [result, setResult] = useState<Map<string, boolean>>(() => new Map())
  const inflightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (addresses.length === 0) {
      return
    }

    // Unique lowercase addresses that aren't cached yet and not in-flight
    const uncached = [
      ...new Set(
        addresses
          .filter(Boolean)
          .map((a) => a.toLowerCase())
          .filter((a) => !contractCache.has(a) && !inflightRef.current.has(a)),
      ),
    ]

    // Build a snapshot from cache for all requested addresses
    const snapshot = new Map<string, boolean>()
    for (const addr of addresses) {
      if (!addr) { continue }
      const key = addr.toLowerCase()
      const cached = contractCache.get(key)
      if (cached !== undefined) {
        snapshot.set(key, cached)
      }
    }

    // If everything is cached, set immediately and return
    if (uncached.length === 0) {
      setResult(snapshot)
      return
    }

    // Set what we have from cache right away
    setResult(snapshot)

    let cancelled = false

    async function fetchBatch(batch: string[]) {
      const promises = batch.map(async (addr) => {
        try {
          inflightRef.current.add(addr)
          const { data } = await client.query({
            query: GET_ADDRESS_OVERVIEW,
            variables: { address: addr },
            // Leverage Apollo cache; won't re-fetch if already cached
            fetchPolicy: 'cache-first',
          })
          const isContract: boolean = data?.addressOverview?.isContract ?? false
          contractCache.set(addr, isContract)
        } catch {
          // Graceful degradation: treat as non-contract
          contractCache.set(addr, false)
        } finally {
          inflightRef.current.delete(addr)
        }
      })
      await Promise.all(promises)
    }

    async function run() {
      // Process in chunks of MAX_CONCURRENT
      for (let i = 0; i < uncached.length; i += MAX_CONCURRENT) {
        if (cancelled) { return }
        const chunk = uncached.slice(i, i + MAX_CONCURRENT)
        await fetchBatch(chunk)

        if (cancelled) { return }

        // Build updated snapshot
        const updated = new Map<string, boolean>()
        for (const addr of addresses) {
          if (!addr) { continue }
          const key = addr.toLowerCase()
          const cached = contractCache.get(key)
          if (cached !== undefined) {
            updated.set(key, cached)
          }
        }
        setResult(updated)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [addresses, client])

  return result
}

/**
 * Synchronous cache lookup (no query). Returns undefined if not cached.
 * Useful for components that already know the answer or want an instant check.
 */
export function getContractCached(address: string): boolean | undefined {
  return contractCache.get(address.toLowerCase())
}
