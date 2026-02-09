'use client'

import { useState, useEffect, useMemo } from 'react'
import { env } from '@/lib/config/env'

/**
 * EIP-1967 Storage Slots for Proxy Contracts
 * @see https://eips.ethereum.org/EIPS/eip-1967
 */
export const EIP_1967_SLOTS = {
  // bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  // bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
  // bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
} as const

/**
 * Proxy contract types
 */
export type ProxyType =
  | 'transparent' // Has implementation + admin
  | 'uups' // Has implementation, no admin
  | 'beacon' // Has beacon address
  | 'unknown' // Has implementation but type unclear
  | 'none' // Not a proxy

/**
 * Proxy detection result
 */
export interface ProxyInfo {
  isProxy: boolean
  proxyType: ProxyType
  implementationAddress: string | null
  adminAddress: string | null
  beaconAddress: string | null
}

/**
 * Check if value is a valid non-zero address from storage
 */
function isValidStorageAddress(value: string | null): boolean {
  if (!value) return false
  // Storage returns 32 bytes, extract last 20 bytes (40 hex chars)
  const cleanValue = value.toLowerCase()
  // Check if it's all zeros or empty
  if (cleanValue === '0x' || cleanValue === '0x0') return false
  // Extract address portion (last 40 chars after 0x prefix for 32-byte storage)
  const addressPart = cleanValue.slice(-40)
  return addressPart !== '0000000000000000000000000000000000000000'
}

/**
 * Extract address from 32-byte storage value
 */
function extractAddressFromStorage(value: string | null): string | null {
  if (!value || !isValidStorageAddress(value)) return null
  // Take last 40 hex chars (20 bytes) and format as address
  const addressPart = value.slice(-40)
  return `0x${addressPart}`
}

/**
 * Make JSON-RPC call to get storage at slot
 */
async function getStorageAt(
  rpcUrl: string,
  address: string,
  slot: string
): Promise<string | null> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getStorageAt',
        params: [address, slot, 'latest'],
        id: 1,
      }),
    })

    const data = await response.json()
    if (data.error) {
      console.warn('Storage read error:', data.error)
      return null
    }
    return data.result
  } catch (error) {
    console.warn('Failed to read storage:', error)
    return null
  }
}

/**
 * Determine proxy type based on detected addresses
 */
function determineProxyType(
  implementation: string | null,
  admin: string | null,
  beacon: string | null
): ProxyType {
  if (beacon) {
    return 'beacon'
  }
  if (implementation) {
    if (admin) {
      return 'transparent'
    }
    return 'uups'
  }
  return 'none'
}

/**
 * Hook for detecting proxy contracts using EIP-1967 storage slots
 *
 * Reads the following slots:
 * - Implementation slot (0x360894...)
 * - Admin slot (0xb53127...)
 * - Beacon slot (0xa3f0ad...)
 *
 * @param address - Contract address to check
 * @param isContract - Whether the address is a contract (skip if not)
 */
export function useProxyDetection(
  address: string | null,
  isContract: boolean = true
): {
  proxyInfo: ProxyInfo | null
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    if (!address || !isContract) {
      setProxyInfo(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const detectProxy = async () => {
      setLoading(true)
      setError(null)

      try {
        const rpcUrl = env.jsonRpcEndpoint
        if (!rpcUrl) {
          throw new Error('JSON-RPC endpoint not configured')
        }

        // Read all storage slots in parallel
        const [implementationStorage, adminStorage, beaconStorage] = await Promise.all([
          getStorageAt(rpcUrl, address, EIP_1967_SLOTS.IMPLEMENTATION),
          getStorageAt(rpcUrl, address, EIP_1967_SLOTS.ADMIN),
          getStorageAt(rpcUrl, address, EIP_1967_SLOTS.BEACON),
        ])

        if (cancelled) return

        // Extract addresses from storage values
        const implementationAddress = extractAddressFromStorage(implementationStorage)
        const adminAddress = extractAddressFromStorage(adminStorage)
        const beaconAddress = extractAddressFromStorage(beaconStorage)

        // Determine proxy type
        const proxyType = determineProxyType(implementationAddress, adminAddress, beaconAddress)

        setProxyInfo({
          isProxy: proxyType !== 'none',
          proxyType,
          implementationAddress,
          adminAddress,
          beaconAddress,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to detect proxy'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    detectProxy()

    return () => {
      cancelled = true
    }
  }, [address, isContract, refreshKey])

  return { proxyInfo, loading, error, refetch }
}

/**
 * Hook for getting proxy type label
 */
export function useProxyTypeLabel(proxyType: ProxyType): string {
  return useMemo(() => {
    switch (proxyType) {
      case 'transparent':
        return 'Transparent Proxy (EIP-1967)'
      case 'uups':
        return 'UUPS Proxy (EIP-1967)'
      case 'beacon':
        return 'Beacon Proxy (EIP-1967)'
      case 'unknown':
        return 'Proxy Contract'
      case 'none':
        return 'Not a Proxy'
      default:
        return 'Unknown'
    }
  }, [proxyType])
}
