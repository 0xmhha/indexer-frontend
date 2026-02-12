/**
 * Validation utilities for blockchain data
 */

import { PAGINATION } from '@/lib/config/constants'

/**
 * Check if string is valid Ethereum address
 * @param address - Address to validate
 * @returns True if valid address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if string is valid transaction/block hash
 * @param hash - Hash to validate
 * @returns True if valid hash
 */
export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

/**
 * Alias for isValidHash - validates transaction hash
 * @param hash - Transaction hash to validate
 * @returns True if valid transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return isValidHash(hash)
}

/**
 * Check if string is valid block number
 * @param blockNumber - Block number to validate
 * @returns True if valid block number
 */
export function isValidBlockNumber(blockNumber: string): boolean {
  // Can be decimal or hex (with 0x prefix)
  if (blockNumber.startsWith('0x')) {
    return /^0x[a-fA-F0-9]+$/.test(blockNumber)
  }
  return /^\d+$/.test(blockNumber)
}

/**
 * Detect input type (address, hash, or block number)
 * @param input - User input string
 * @returns Type of input or null if invalid
 */
export function detectInputType(input: string): 'address' | 'hash' | 'blockNumber' | null {
  const trimmed = input.trim()

  if (isValidAddress(trimmed)) {
    return 'address'
  }

  if (isValidHash(trimmed)) {
    return 'hash'
  }

  if (isValidBlockNumber(trimmed)) {
    return 'blockNumber'
  }

  return null
}

/**
 * Parse block number from string (supports decimal and hex)
 * @param blockNumber - Block number string
 * @returns Parsed BigInt or null if invalid
 */
export function parseBlockNumber(blockNumber: string): bigint | null {
  try {
    if (blockNumber.startsWith('0x')) {
      return BigInt(blockNumber)
    }
    return BigInt(blockNumber)
  } catch {
    return null
  }
}

/**
 * Validate pagination parameters
 * @param limit - Page size
 * @param offset - Offset
 * @returns Validation result
 */
export function validatePagination(
  limit?: number,
  offset?: number
): {
  valid: boolean
  error?: string
} {
  if (limit !== undefined) {
    if (limit < PAGINATION.MIN_LIMIT || limit > PAGINATION.MAX_LIMIT) {
      return { valid: false, error: `Limit must be between ${PAGINATION.MIN_LIMIT} and ${PAGINATION.MAX_LIMIT}` }
    }
  }

  if (offset !== undefined) {
    if (offset < 0) {
      return { valid: false, error: 'Offset must be non-negative' }
    }
  }

  return { valid: true }
}
