/**
 * System Contracts Constants & Utilities
 */

// ============================================================================
// System Contracts
// ============================================================================

/**
 * System contract addresses as named constants
 */
export const SYSTEM_CONTRACT_ADDRESSES = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

/**
 * System contract metadata type
 */
export interface SystemContractInfo {
  name: string
  symbol: string
  decimals: number
  description: string
  isNativeWrapper?: boolean
}

/**
 * Known system contract addresses and their metadata
 *
 * These are pre-deployed contracts that are part of the blockchain network.
 * Used for displaying fallback names when token metadata is not available.
 */
export const SYSTEM_CONTRACTS: Record<string, SystemContractInfo> = {
  // Native Coin Adapter (WKRC wrapper)
  '0x0000000000000000000000000000000000001000': {
    name: 'Wrapped KRC',
    symbol: 'WKRC',
    decimals: 18,
    description: 'Native coin ERC20 wrapper',
    isNativeWrapper: true,
  },
  // Add more system contracts as needed
  '0x0000000000000000000000000000000000001001': {
    name: 'Staking Manager',
    symbol: 'STKM',
    decimals: 18,
    description: 'Validator staking management contract',
  },
  '0x0000000000000000000000000000000000001002': {
    name: 'Account Manager',
    symbol: 'ACTM',
    decimals: 0,
    description: 'Account blacklist and management',
  },
  '0x0000000000000000000000000000000000001003': {
    name: 'Governance',
    symbol: 'GOV',
    decimals: 0,
    description: 'Network governance proposals',
  },
} as const

/**
 * Get system contract metadata by address
 */
export function getSystemContractInfo(address: string): SystemContractInfo | null {
  const normalizedAddress = address.toLowerCase()
  for (const [contractAddress, info] of Object.entries(SYSTEM_CONTRACTS)) {
    if (contractAddress.toLowerCase() === normalizedAddress) {
      return info
    }
  }
  return null
}

/**
 * Check if an address is a known system contract
 */
export function isSystemContract(address: string): boolean {
  return getSystemContractInfo(address) !== null
}
