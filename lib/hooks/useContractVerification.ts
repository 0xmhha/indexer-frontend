'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSystemContractInfo } from '@/lib/config/constants'
import { getSystemContractAbi } from '@/lib/config/abis/system-contracts'
import { fetchContractVerification, parseEtherscanResponse } from '@/lib/api/etherscan'
import { errorLogger } from '@/lib/errors/logger'
import type { ContractABI } from '@/types/contract'

// ============================================================================
// Types
// ============================================================================

export interface ContractVerification {
  address: string
  isVerified: boolean
  name: string | null
  compilerVersion: string | null
  optimizationEnabled: boolean
  optimizationRuns: number | null
  sourceCode: string | null
  abi: ContractABI | null
  constructorArguments: string | null
  verifiedAt: string | null
  licenseType: string | null
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if address is a known system contract
 */
function isKnownSystemContract(address: string): boolean {
  return getSystemContractInfo(address) !== null
}

/**
 * Build verification object for system contracts without backend data
 */
function buildSystemContractVerification(
  address: string,
  systemContractAbi: ContractABI | null,
  systemInfo: ReturnType<typeof getSystemContractInfo>
): ContractVerification {
  return {
    address,
    isVerified: true,
    name: systemInfo?.name ?? null,
    compilerVersion: 'v0.8.14',
    optimizationEnabled: true,
    optimizationRuns: 200,
    sourceCode: null,
    abi: systemContractAbi,
    constructorArguments: null,
    verifiedAt: null,
    licenseType: 'Apache-2.0',
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch contract verification data including ABI
 * Uses Etherscan-compatible REST API (/api?module=contract&action=getsourcecode)
 * Falls back to system contract ABIs for known system contracts
 */
export function useContractVerification(address: string) {
  const [verification, setVerification] = useState<ContractVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  // Check if this is a system contract first
  const isSystemContract = isKnownSystemContract(address)
  const systemContractAbi = getSystemContractAbi(address)
  const systemInfo = getSystemContractInfo(address)

  const fetchData = useCallback(async () => {
    if (!address) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const response = await fetchContractVerification(address)
      const parsed = parseEtherscanResponse(
        response,
        systemContractAbi,
        systemInfo?.name ?? null,
      )

      if (parsed) {
        setVerification({
          address,
          isVerified: parsed.isVerified,
          name: parsed.contractName,
          compilerVersion: parsed.compilerVersion,
          optimizationEnabled: parsed.optimizationEnabled,
          optimizationRuns: parsed.optimizationRuns,
          sourceCode: parsed.sourceCode,
          abi: parsed.abi,
          constructorArguments: parsed.constructorArguments,
          verifiedAt: null,
          licenseType: parsed.licenseType,
        })
      } else if (isSystemContract) {
        // Fallback to system contract verification
        setVerification(buildSystemContractVerification(address, systemContractAbi, systemInfo))
      } else {
        setVerification(null)
      }
    } catch (err) {
      errorLogger.error(err, { component: 'useContractVerification', action: 'fetch-verification' })
      setError(err instanceof Error ? err : new Error('Unknown error'))

      // Still provide system contract data on error
      if (isSystemContract) {
        setVerification(buildSystemContractVerification(address, systemContractAbi, systemInfo))
      }
    } finally {
      setLoading(false)
    }
  }, [address, isSystemContract, systemContractAbi, systemInfo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Determine if we have a usable ABI
  const hasAbi = (verification?.abi?.length ?? 0) > 0

  return {
    verification,
    isVerified: verification?.isVerified ?? false,
    abi: verification?.abi ?? null,
    hasAbi,
    isSystemContract,
    loading: loading && !isSystemContract,
    error,
    refetch: fetchData,
  }
}
