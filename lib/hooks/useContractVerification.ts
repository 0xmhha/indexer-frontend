'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSystemContractInfo } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'
import type { ContractABI, AbiFunction } from '@/types/contract'

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

/**
 * Etherscan-compatible API response format
 * Used by backend's /api?module=contract&action=getsourcecode endpoint
 */
interface EtherscanApiResponse {
  status: '1' | '0'
  message: string
  result: EtherscanContractResult[] | string // string when error (e.g., "Contract source code not verified")
}

interface EtherscanContractResult {
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
// System Contract ABI Data
// Based on actual Solidity contracts from systemcontracts/solidity/
// ============================================================================

/**
 * Common GovBase ABI functions shared by all governance contracts
 * Based on GovBase.sol abstract contract
 */
const GOV_BASE_READ_ABI: AbiFunction[] = [
  { type: 'function', name: 'memberVersion', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'currentProposalId', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'quorum', inputs: [], outputs: [{ name: '', type: 'uint32' }], stateMutability: 'view' },
  { type: 'function', name: 'proposalExpiry', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'maxActiveProposalsPerMember', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMemberCount', inputs: [{ name: 'targetVersion', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMemberAt', inputs: [{ name: 'targetVersion', type: 'uint256' }, { name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'isMember', inputs: [{ name: 'account', type: 'address' }, { name: 'targetVersion', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getQuorum', inputs: [{ name: 'targetVersion', type: 'uint256' }], outputs: [{ name: '', type: 'uint32' }], stateMutability: 'view' },
  { type: 'function', name: 'isProposalInVoting', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isProposalExecutable', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'hasApproved', inputs: [{ name: 'member', type: 'address' }, { name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getMemberActiveProposalCount', inputs: [{ name: 'member', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'canCreateProposal', inputs: [{ name: 'member', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
]

const GOV_BASE_WRITE_ABI: AbiFunction[] = [
  { type: 'function', name: 'approveProposal', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'disapproveProposal', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'executeProposal', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cancelProposal', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'expireProposal', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'proposeAddMember', inputs: [{ name: 'newMember', type: 'address' }, { name: 'newQuorum', type: 'uint32' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'proposeRemoveMember', inputs: [{ name: 'member', type: 'address' }, { name: 'newQuorum', type: 'uint32' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'proposeChangeQuorum', inputs: [{ name: 'newQuorum', type: 'uint32' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'changeMember', inputs: [{ name: 'newMember', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
]

const SYSTEM_CONTRACT_ABIS: Record<string, ContractABI> = {
  // NativeCoinAdapter (0x1000) - ERC20-compatible native coin wrapper
  // Based on NativeCoinAdapter.sol, IFiatToken.sol, AbstractFiatToken.sol, Mintable.sol
  '0x0000000000000000000000000000000000001000': [
    // ERC20 standard read functions
    { type: 'function', name: 'name', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'decimals', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
    { type: 'function', name: 'currency', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    // Mintable read functions
    { type: 'function', name: 'masterMinter', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'isMinter', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'minterAllowance', inputs: [{ name: 'minter', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    // EIP-2612 Permit
    { type: 'function', name: 'nonces', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'DOMAIN_SEPARATOR', inputs: [], outputs: [{ name: '', type: 'bytes32' }], stateMutability: 'view' },
    // ERC20 write functions
    { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'transferFrom', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  ],

  // GovValidator (0x1001) - Validator governance contract
  // Based on GovValidator.sol and GovBase.sol
  '0x0000000000000000000000000000000000001001': [
    ...GOV_BASE_READ_ABI,
    // GovValidator specific read functions
    { type: 'function', name: 'getValidatorCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'isValidator', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getValidatorAt', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'getAllValidators', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    ...GOV_BASE_WRITE_ABI,
    // GovValidator specific write functions
    { type: 'function', name: 'proposeAddValidator', inputs: [{ name: 'validator', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveValidator', inputs: [{ name: 'validator', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  ],

  // GovMasterMinter (0x1002) - Master minter governance
  // Based on GovMasterMinter.sol and GovBase.sol
  '0x0000000000000000000000000000000000001002': [
    ...GOV_BASE_READ_ABI,
    // GovMasterMinter specific read functions
    { type: 'function', name: 'fiatToken', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'govMinter', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    ...GOV_BASE_WRITE_ABI,
    // GovMasterMinter specific write functions
    { type: 'function', name: 'proposeConfigureMinter', inputs: [{ name: 'minter', type: 'address' }, { name: 'allowance', type: 'uint256' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveMinter', inputs: [{ name: 'minter', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
  ],

  // GovMinter (0x1003) - Minting governance
  // Based on GovMinter.sol and GovBase.sol
  '0x0000000000000000000000000000000000001003': [
    ...GOV_BASE_READ_ABI,
    // GovMinter specific read functions
    { type: 'function', name: 'fiatToken', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'emergencyPaused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'reservedMintAmount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'burnBalance', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'usedProofHashes', inputs: [{ name: 'proofHash', type: 'bytes32' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'depositIdToProposalId', inputs: [{ name: 'depositId', type: 'string' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'executedDepositIds', inputs: [{ name: 'depositId', type: 'string' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'withdrawalIdToProposalId', inputs: [{ name: 'withdrawalId', type: 'string' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'executedWithdrawalIds', inputs: [{ name: 'withdrawalId', type: 'string' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'mintProposalAmounts', inputs: [{ name: 'proposalId', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    ...GOV_BASE_WRITE_ABI,
    // GovMinter specific write functions
    { type: 'function', name: 'proposeMint', inputs: [{ name: 'proofData', type: 'bytes' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeBurn', inputs: [{ name: 'proofData', type: 'bytes' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'payable' },
    { type: 'function', name: 'proposePause', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeUnpause', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable' },
  ],

  // GovCouncil (0x1004) - Council governance for blacklist and authorized accounts
  // Based on GovCouncil.sol and GovBase.sol
  '0x0000000000000000000000000000000000001004': [
    ...GOV_BASE_READ_ABI,
    // GovCouncil specific read functions - Blacklist
    { type: 'function', name: 'isBlacklisted', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getBlacklistCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'getBlacklistedAddress', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'getBlacklistRange', inputs: [{ name: 'startIndex', type: 'uint256' }, { name: 'endIndex', type: 'uint256' }], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'getAllBlacklisted', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    // GovCouncil specific read functions - Authorized Accounts
    { type: 'function', name: 'isAuthorizedAccount', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'getAuthorizedAccountCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'getAuthorizedAccountAddress', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'getAuthorizedAccountRange', inputs: [{ name: 'startIndex', type: 'uint256' }, { name: 'endIndex', type: 'uint256' }], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    { type: 'function', name: 'getAllAuthorizedAccounts', inputs: [], outputs: [{ name: '', type: 'address[]' }], stateMutability: 'view' },
    ...GOV_BASE_WRITE_ABI,
    // GovCouncil specific write functions - Blacklist
    { type: 'function', name: 'proposeAddBlacklist', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveBlacklist', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeAddBlacklistBatch', inputs: [{ name: 'accounts', type: 'address[]' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveBlacklistBatch', inputs: [{ name: 'accounts', type: 'address[]' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    // GovCouncil specific write functions - Authorized Accounts
    { type: 'function', name: 'proposeAddAuthorizedAccount', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveAuthorizedAccount', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeAddAuthorizedAccountBatch', inputs: [{ name: 'accounts', type: 'address[]' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
    { type: 'function', name: 'proposeRemoveAuthorizedAccountBatch', inputs: [{ name: 'accounts', type: 'address[]' }], outputs: [{ name: 'proposalId', type: 'uint256' }], stateMutability: 'nonpayable' },
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
// API Functions
// ============================================================================

/**
 * Get the backend API base URL from environment
 * Uses the GraphQL endpoint but strips /graphql to get the base URL
 */
function getApiBaseUrl(): string {
  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'
  // Remove /graphql to get base URL (e.g., http://localhost:8080)
  return graphqlEndpoint.replace(/\/graphql$/, '')
}

/**
 * Fetch contract verification data from Etherscan-compatible REST API
 */
async function fetchContractVerification(address: string): Promise<EtherscanApiResponse> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api?module=contract&action=getsourcecode&address=${address}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Parse Etherscan API response to ContractVerification
 */
function parseEtherscanResponse(
  address: string,
  response: EtherscanApiResponse,
  systemContractAbi: ContractABI | null,
  systemInfo: ReturnType<typeof getSystemContractInfo>
): ContractVerification | null {
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
    address,
    isVerified: true,
    name: result.ContractName || systemInfo?.name || null,
    compilerVersion: result.CompilerVersion || null,
    optimizationEnabled: result.OptimizationUsed === '1',
    optimizationRuns: result.Runs ? parseInt(result.Runs, 10) : null,
    sourceCode: result.SourceCode || null,
    abi: abi ?? systemContractAbi,
    constructorArguments: result.ConstructorArguments || null,
    verifiedAt: null, // Etherscan API doesn't return verification timestamp
    licenseType: result.LicenseType || null,
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
      const parsed = parseEtherscanResponse(address, response, systemContractAbi, systemInfo)

      if (parsed) {
        setVerification(parsed)
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
