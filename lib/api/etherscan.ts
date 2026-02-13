/**
 * Etherscan-compatible API client
 *
 * Types and functions for fetching contract verification data from
 * the backend's Etherscan-compatible REST API endpoint.
 */

import type { ContractABI } from '@/types/contract'

// ============================================================================
// Types
// ============================================================================

/**
 * Etherscan-compatible API response format
 * Used by backend's /api?module=contract&action=getsourcecode endpoint
 */
export interface EtherscanApiResponse {
  status: '1' | '0'
  message: string
  result: EtherscanContractResult[] | string // string when error (e.g., "Contract source code not verified")
}

export interface EtherscanContractResult {
  SourceCode: string
  ABI: string
  ContractName: string
  CompilerVersion: string
  OptimizationUsed: string // "0" or "1"
  Runs: string
  ConstructorArguments: string
  EVMVersion: string
  Library: string
  LicenseType: string
  Proxy: string
  Implementation: string
  SwarmSource: string
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the backend API base URL from environment
 * Uses the GraphQL endpoint but strips /graphql to get the base URL
 */
export function getApiBaseUrl(): string {
  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
  // Remove /graphql to get base URL (e.g., http://localhost:8080)
  return graphqlEndpoint.replace(/\/graphql$/, '')
}

/**
 * Parse ABI from JSON string to ContractABI array
 */
export function parseAbi(abiString: string | null): ContractABI | null {
  if (!abiString) {
    return null
  }
  try {
    const parsed = JSON.parse(abiString)
    if (Array.isArray(parsed)) {
      return parsed as ContractABI
    }
    return null
  } catch {
    return null
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch contract verification data from Etherscan-compatible REST API
 */
export async function fetchContractVerification(address: string): Promise<EtherscanApiResponse> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api?module=contract&action=getsourcecode&address=${address}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Parse Etherscan API response to a normalized verification result.
 * Returns null when the contract is not verified or the response is invalid.
 */
export interface ParsedVerification {
  isVerified: true
  contractName: string | null
  compilerVersion: string | null
  optimizationEnabled: boolean
  optimizationRuns: number | null
  sourceCode: string | null
  abi: ContractABI | null
  constructorArguments: string | null
  licenseType: string | null
}

export function parseEtherscanResponse(
  response: EtherscanApiResponse,
  fallbackAbi: ContractABI | null,
  fallbackName: string | null,
): ParsedVerification | null {
  // Check if result is an array (verified contract) or string (error message)
  if (response.status !== '1' || !Array.isArray(response.result) || response.result.length === 0) {
    return null
  }

  const result = response.result[0]
  if (!result) {
    return null
  }

  // Check if ABI is valid (not "Contract source code not verified")
  const isVerified = result.ABI !== 'Contract source code not verified' && result.ABI !== ''

  if (!isVerified) {
    return null
  }

  const abi = parseAbi(result.ABI)

  return {
    isVerified: true,
    contractName: result.ContractName || fallbackName,
    compilerVersion: result.CompilerVersion || null,
    optimizationEnabled: result.OptimizationUsed === '1',
    optimizationRuns: result.Runs ? parseInt(result.Runs, 10) : null,
    sourceCode: result.SourceCode || null,
    abi: abi ?? fallbackAbi,
    constructorArguments: result.ConstructorArguments || null,
    licenseType: result.LicenseType || null,
  }
}
