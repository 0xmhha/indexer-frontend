/**
 * Transaction Type Constants and Utilities
 *
 * Stable-One chain supports multiple transaction types including:
 * - Legacy (0x00)
 * - EIP-2930 Access List (0x01)
 * - EIP-1559 Dynamic Fee (0x02)
 * - EIP-4844 Blob (0x03)
 * - Fee Delegated Dynamic Fee (0x16/22)
 */

/**
 * Transaction type constants
 */
export const TX_TYPE = {
  LEGACY: 0,
  ACCESS_LIST: 1,
  DYNAMIC_FEE: 2,
  BLOB: 3,
  FEE_DELEGATED: 22, // 0x16
} as const

/**
 * Transaction type names for display
 */
export const TX_TYPE_NAMES: Record<number, string> = {
  [TX_TYPE.LEGACY]: 'Legacy',
  [TX_TYPE.ACCESS_LIST]: 'Access List',
  [TX_TYPE.DYNAMIC_FEE]: 'EIP-1559',
  [TX_TYPE.BLOB]: 'Blob',
  [TX_TYPE.FEE_DELEGATED]: 'Fee Delegated',
}

/**
 * Transaction type descriptions
 */
export const TX_TYPE_DESCRIPTIONS: Record<number, string> = {
  [TX_TYPE.LEGACY]: 'Traditional Ethereum transaction',
  [TX_TYPE.ACCESS_LIST]: 'EIP-2930 transaction with access list',
  [TX_TYPE.DYNAMIC_FEE]: 'EIP-1559 transaction with dynamic base fee',
  [TX_TYPE.BLOB]: 'EIP-4844 blob-carrying transaction',
  [TX_TYPE.FEE_DELEGATED]: 'Transaction with fee delegation (third-party pays gas)',
}

/**
 * Transaction type colors for UI badges
 */
export const TX_TYPE_COLORS: Record<number, string> = {
  [TX_TYPE.LEGACY]: 'bg-bg-tertiary text-text-secondary',
  [TX_TYPE.ACCESS_LIST]: 'bg-accent-blue/20 text-accent-blue',
  [TX_TYPE.DYNAMIC_FEE]: 'bg-accent-cyan/20 text-accent-cyan',
  [TX_TYPE.BLOB]: 'bg-accent-purple/20 text-accent-purple',
  [TX_TYPE.FEE_DELEGATED]: 'bg-accent-green/20 text-accent-green',
}

/**
 * Check if transaction type is valid
 */
export function isValidTxType(type: number): boolean {
  return type in TX_TYPE_NAMES
}

/**
 * Get transaction type name
 */
export function getTxTypeName(type: number): string {
  return TX_TYPE_NAMES[type] || `Unknown (${type})`
}

/**
 * Get transaction type description
 */
export function getTxTypeDescription(type: number): string {
  return TX_TYPE_DESCRIPTIONS[type] || 'Unknown transaction type'
}

/**
 * Get transaction type color class
 */
export function getTxTypeColor(type: number): string {
  return TX_TYPE_COLORS[type] || 'bg-bg-tertiary text-text-secondary'
}

/**
 * Check if transaction is fee delegated
 */
export function isFeeDelegated(type: number): boolean {
  return type === TX_TYPE.FEE_DELEGATED
}

/**
 * Check if transaction supports EIP-1559
 */
export function supportsEIP1559(type: number): boolean {
  return type === TX_TYPE.DYNAMIC_FEE || type === TX_TYPE.BLOB || type === TX_TYPE.FEE_DELEGATED
}

/**
 * Check if transaction has access list
 */
export function hasAccessList(type: number): boolean {
  return type === TX_TYPE.ACCESS_LIST || supportsEIP1559(type)
}
