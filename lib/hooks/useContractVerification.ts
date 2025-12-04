'use client'

import { useQuery } from '@apollo/client'
import { GET_CONTRACT_VERIFICATION } from '@/lib/graphql/queries/contractVerification'
import { getSystemContractInfo } from '@/lib/config/constants'
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

interface ContractVerificationResponse {
  contractVerification: {
    address: string
    isVerified: boolean
    name: string | null
    compilerVersion: string | null
    optimizationEnabled: boolean
    optimizationRuns: number | null
    sourceCode: string | null
    abi: string | null // JSON string
    constructorArguments: string | null
    verifiedAt: string | null
    licenseType: string | null
  } | null
}

// ============================================================================
// System Contract Addresses
// ============================================================================

const SYSTEM_CONTRACT_ADDRESSES = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

// ============================================================================
// System Contract ABI Mock Data
// For system contracts that don't have backend verification data
// ============================================================================

const SYSTEM_CONTRACT_ABIS: Record<string, ContractABI> = {
  // NativeCoinAdapter (0x1000) - ERC20 interface
  '0x0000000000000000000000000000000000001000': [
    { type: 'function', name: 'name', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'decimals', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
    { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'transferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'masterMinter', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'isMinter', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'minterAllowance', inputs: [{ name: 'minter', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  ],
  // GovValidator (0x1001)
  '0x0000000000000000000000000000000000001001': [
    { type: 'function', name: 'isValidator', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getValidators', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'validatorCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'gasTip', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  ],
  // GovMasterMinter (0x1002)
  '0x0000000000000000000000000000000000001002': [
    { type: 'function', name: 'isMember', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getMembers', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'memberCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'quorum', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  ],
  // GovMinter (0x1003)
  '0x0000000000000000000000000000000000001003': [
    { type: 'function', name: 'isMember', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getMembers', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'memberCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'quorum', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'proposalCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  ],
  // GovCouncil (0x1004)
  '0x0000000000000000000000000000000000001004': [
    { type: 'function', name: 'isMember', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getMembers', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'memberCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'quorum', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'isBlacklisted', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'proposalCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  ],
}

// Unused but kept for reference
void SYSTEM_CONTRACT_ADDRESSES

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse ABI from JSON string to ContractABI array
 */
function parseAbi(abiString: string | null): ContractABI | null {
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

/**
 * Get system contract ABI if available
 */
function getSystemContractAbi(address: string): ContractABI | null {
  const normalizedAddress = address.toLowerCase()
  for (const [contractAddress, abi] of Object.entries(SYSTEM_CONTRACT_ABIS)) {
    if (contractAddress.toLowerCase() === normalizedAddress) {
      return abi
    }
  }
  return null
}

/**
 * Check if address is a known system contract
 */
function isKnownSystemContract(address: string): boolean {
  return getSystemContractInfo(address) !== null
}

/**
 * Build verification object from backend data
 */
function buildBackendVerification(
  backendData: NonNullable<ContractVerificationResponse['contractVerification']>,
  backendAbi: ContractABI | null,
  systemContractAbi: ContractABI | null,
  systemInfo: ReturnType<typeof getSystemContractInfo>
): ContractVerification {
  return {
    address: backendData.address,
    isVerified: backendData.isVerified,
    name: backendData.name ?? systemInfo?.name ?? null,
    compilerVersion: backendData.compilerVersion,
    optimizationEnabled: backendData.optimizationEnabled,
    optimizationRuns: backendData.optimizationRuns,
    sourceCode: backendData.sourceCode,
    abi: backendAbi ?? systemContractAbi,
    constructorArguments: backendData.constructorArguments,
    verifiedAt: backendData.verifiedAt,
    licenseType: backendData.licenseType,
  }
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
 * Falls back to system contract ABIs for known system contracts
 */
export function useContractVerification(address: string) {
  // Check if this is a system contract first
  const isSystemContract = isKnownSystemContract(address)
  const systemContractAbi = getSystemContractAbi(address)
  const systemInfo = getSystemContractInfo(address)

  const { data, loading, error, refetch } = useQuery<ContractVerificationResponse>(
    GET_CONTRACT_VERIFICATION,
    {
      variables: { address },
      skip: !address,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    }
  )

  // Parse the response
  const backendData = data?.contractVerification
  const backendAbi = parseAbi(backendData?.abi ?? null)

  // Build verification object with fallbacks for system contracts
  let verification: ContractVerification | null = null
  if (backendData) {
    verification = buildBackendVerification(backendData, backendAbi, systemContractAbi, systemInfo)
  } else if (isSystemContract) {
    verification = buildSystemContractVerification(address, systemContractAbi, systemInfo)
  }

  // Determine if we have a usable ABI
  const hasAbi = (verification?.abi?.length ?? 0) > 0

  // Filter errors for unsupported query
  const filteredError =
    error?.message?.includes('Cannot query field') ||
    error?.message?.includes('Unknown field')
      ? undefined
      : error

  return {
    verification,
    isVerified: verification?.isVerified ?? false,
    abi: verification?.abi ?? null,
    hasAbi,
    isSystemContract,
    loading: loading && !isSystemContract,
    error: filteredError,
    refetch,
  }
}
