/**
 * Formatting utilities for blockchain data
 */

import { FORMATTING } from '@/lib/config/constants'

/**
 * Format Ethereum address (0x prefixed, 40 hex characters)
 * @param address - Full address string
 * @param short - Whether to shorten the address
 * @returns Formatted address
 */
export function formatAddress(address: string, short = true): string {
  if (!address || !address.startsWith('0x')) {
    throw new Error('Invalid address format')
  }

  if (!short) {return address}

  return `${address.slice(0, FORMATTING.ADDRESS_START_CHARS)}...${address.slice(-FORMATTING.ADDRESS_END_CHARS)}`
}

/**
 * Format transaction/block hash
 * @param hash - Full hash string
 * @param short - Whether to shorten the hash
 * @returns Formatted hash
 */
export function formatHash(hash: string, short = true): string {
  if (!hash || !hash.startsWith('0x')) {
    throw new Error('Invalid hash format')
  }

  if (!short) {return hash}

  return `${hash.slice(0, FORMATTING.HASH_START_CHARS)}...${hash.slice(-FORMATTING.HASH_END_CHARS)}`
}

/**
 * Format BigInt value to decimal string with specified decimals
 * @param value - BigInt value (wei)
 * @param decimals - Number of decimals (default 18 for ETH)
 * @returns Formatted decimal string (trailing zeros trimmed)
 */
export function formatValue(value: bigint | string, decimals: number = FORMATTING.DEFAULT_DECIMALS): string {
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value
  const divisor = BigInt(10 ** decimals)
  const integerPart = bigIntValue / divisor
  const fractionalPart = bigIntValue % divisor

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmed = fractionalStr.replace(/0+$/, '')

  if (trimmed === '') {
    return integerPart.toString()
  }

  return `${integerPart}.${trimmed}`
}

/**
 * Format BigInt value to decimal string with full decimal places (no trimming)
 * Shows all 18 decimal places with padding zeros
 * @param value - BigInt value (wei)
 * @param decimals - Number of decimals (default 18 for ETH)
 * @returns Formatted decimal string with all decimal places
 */
export function formatValueFull(value: bigint | string, decimals: number = FORMATTING.DEFAULT_DECIMALS): string {
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value
  const divisor = BigInt(10 ** decimals)
  const integerPart = bigIntValue / divisor
  const fractionalPart = bigIntValue % divisor

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')

  return `${integerPart}.${fractionalStr}`
}

/**
 * Format value with currency symbol (full decimal places)
 * @param value - BigInt value
 * @param symbol - Currency symbol (default WEMIX)
 * @param decimals - Number of decimals
 * @returns Formatted value with symbol and all decimal places
 */
export function formatCurrencyFull(value: bigint | string, symbol = 'WEMIX', decimals: number = FORMATTING.DEFAULT_DECIMALS): string {
  const formatted = formatValueFull(value, decimals)
  return `${formatted} ${symbol}`
}

/**
 * Format value with currency symbol
 * @param value - BigInt value
 * @param symbol - Currency symbol (default WEMIX)
 * @param decimals - Number of decimals
 * @returns Formatted value with symbol
 */
export function formatCurrency(value: bigint | string, symbol = 'WEMIX', decimals: number = FORMATTING.DEFAULT_DECIMALS): string {
  const formatted = formatValue(value, decimals)
  return `${formatted} ${symbol}`
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp (seconds) as BigInt or number
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: bigint | number): string {
  const now = BigInt(Math.floor(Date.now() / FORMATTING.MS_PER_SECOND))
  const timestampBigInt = typeof timestamp === 'number' ? BigInt(timestamp) : timestamp
  const diff = Number(now - timestampBigInt)

  if (diff < 0) {return 'in the future'}
  if (diff < FORMATTING.SECONDS_PER_MINUTE) {return `${diff} seconds ago`}
  if (diff < FORMATTING.SECONDS_PER_HOUR) {return `${Math.floor(diff / FORMATTING.SECONDS_PER_MINUTE)} minutes ago`}
  if (diff < FORMATTING.SECONDS_PER_DAY) {return `${Math.floor(diff / FORMATTING.SECONDS_PER_HOUR)} hours ago`}
  if (diff < FORMATTING.SECONDS_PER_WEEK) {return `${Math.floor(diff / FORMATTING.SECONDS_PER_DAY)} days ago`}
  if (diff < FORMATTING.SECONDS_PER_MONTH) {return `${Math.floor(diff / FORMATTING.SECONDS_PER_WEEK)} weeks ago`}

  return `${Math.floor(diff / FORMATTING.SECONDS_PER_MONTH)} months ago`
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp (seconds)
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatDate(timestamp: bigint | number, includeTime = true): string {
  const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const date = new Date(timestampNum * FORMATTING.MS_PER_SECOND)

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  if (!includeTime) {return dateStr}

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return `${dateStr} ${timeStr}`
}

/**
 * Format timestamp to date and time string (alias for formatDate with time)
 * @param timestamp - Unix timestamp (seconds) or ISO string
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: bigint | number | string): string {
  if (typeof timestamp === 'string') {
    // If ISO string, parse it
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  return formatDate(timestamp, true)
}

/**
 * Truncate address to show first and last characters
 * Alias for formatAddress for better semantics
 * @param address - Full address string
 * @returns Truncated address
 */
export function truncateAddress(address: string): string {
  return formatAddress(address, true)
}

/**
 * Format number with thousand separators
 * @param num - Number to format (accepts number, bigint, or string)
 * @returns Formatted number string
 */
export function formatNumber(num: number | bigint | string): string {
  if (typeof num === 'string') {
    const parsed = Number(num)
    if (Number.isNaN(parsed)) {return num}
    return parsed.toLocaleString('en-US')
  }
  return num.toLocaleString('en-US')
}

/**
 * Format gas price (wei to Gwei)
 * @param gasPrice - Gas price in wei
 * @returns Formatted gas price in Gwei
 */
export function formatGasPrice(gasPrice: bigint | string): string {
  const gwei = formatValue(gasPrice, FORMATTING.GWEI_DECIMALS)
  return `${gwei} Gwei`
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @returns Formatted size string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {return '0 Bytes'}

  const k = FORMATTING.BYTES_PER_KB
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(FORMATTING.DECIMAL_PLACES_PERCENTAGE))} ${sizes[i]}`
}

/**
 * Shorten hex data for display
 * @param data - Hex data string
 * @param maxLength - Maximum display length
 * @returns Shortened hex string
 */
export function shortenHex(data: string, maxLength: number = FORMATTING.HEX_MAX_LENGTH): string {
  if (data.length <= maxLength) {return data}

  const ellipsisLength = 3 // for "..."
  const prefixLength = Math.floor(maxLength / 2)
  const suffixLength = maxLength - prefixLength - ellipsisLength

  return `${data.slice(0, prefixLength)}...${data.slice(-suffixLength)}`
}

/**
 * Format token amount with proper decimal handling
 * Handles large amounts with K/M/B suffixes and small amounts with decimal precision
 * @param amount - Token amount in wei (18 decimals) as string or bigint
 * @param decimals - Token decimals (default 18)
 * @param symbol - Optional token symbol
 * @returns Formatted token amount string
 */
export function formatTokenAmount(amount: string | bigint, decimals: number = FORMATTING.DEFAULT_DECIMALS, symbol?: string): string {
  // Handle negative values
  const amountStr = amount.toString()
  const isNegative = amountStr.startsWith('-')
  const absoluteAmount = isNegative ? amountStr.slice(1) : amountStr

  try {
    const bigIntAmount = BigInt(absoluteAmount)

    // If zero, return immediately
    if (bigIntAmount === BigInt(0)) {
      return symbol ? `0 ${symbol}` : '0'
    }

    const divisor = BigInt(10 ** decimals)
    const integerPart = bigIntAmount / divisor
    const fractionalPart = bigIntAmount % divisor

    // Convert to number for easier formatting
    const fullValue = Number(integerPart) + Number(fractionalPart) / Math.pow(10, decimals)

    let formatted: string

    // Use K/M/B suffixes for large amounts
    if (fullValue >= FORMATTING.BILLION) {
      formatted = `${(fullValue / FORMATTING.BILLION).toFixed(FORMATTING.DECIMAL_PLACES_PERCENTAGE)}B`
    } else if (fullValue >= FORMATTING.MILLION) {
      formatted = `${(fullValue / FORMATTING.MILLION).toFixed(FORMATTING.DECIMAL_PLACES_PERCENTAGE)}M`
    } else if (fullValue >= FORMATTING.THOUSAND) {
      formatted = `${(fullValue / FORMATTING.THOUSAND).toFixed(FORMATTING.DECIMAL_PLACES_PERCENTAGE)}K`
    } else if (fullValue >= 1) {
      // Show up to 4 decimal places for amounts >= 1
      formatted = fullValue.toFixed(FORMATTING.DECIMAL_PLACES_STANDARD).replace(/\.?0+$/, '')
    } else if (fullValue > 0) {
      // Show up to 8 decimal places for small amounts
      formatted = fullValue.toFixed(FORMATTING.DECIMAL_PLACES_PRECISE).replace(/\.?0+$/, '')
    } else {
      formatted = '0'
    }

    // Add negative sign back if needed
    if (isNegative) {
      formatted = `-${formatted}`
    }

    return symbol ? `${formatted} ${symbol}` : formatted
  } catch {
    // Fallback for invalid amounts
    return symbol ? `0 ${symbol}` : '0'
  }
}
