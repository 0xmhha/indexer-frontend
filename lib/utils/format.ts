/**
 * Formatting utilities for blockchain data
 */

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

  if (!short) return address

  return `${address.slice(0, 6)}...${address.slice(-4)}`
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

  if (!short) return hash

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

/**
 * Format BigInt value to decimal string with specified decimals
 * @param value - BigInt value (wei)
 * @param decimals - Number of decimals (default 18 for ETH)
 * @returns Formatted decimal string
 */
export function formatValue(value: bigint | string, decimals = 18): string {
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
 * Format value with currency symbol
 * @param value - BigInt value
 * @param symbol - Currency symbol (default WEMIX)
 * @param decimals - Number of decimals
 * @returns Formatted value with symbol
 */
export function formatCurrency(value: bigint | string, symbol = 'WEMIX', decimals = 18): string {
  const formatted = formatValue(value, decimals)
  return `${formatted} ${symbol}`
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp (seconds) as BigInt or number
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: bigint | number): string {
  const now = BigInt(Math.floor(Date.now() / 1000))
  const timestampBigInt = typeof timestamp === 'number' ? BigInt(timestamp) : timestamp
  const diff = Number(now - timestampBigInt)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30

  if (diff < 0) return 'in the future'
  if (diff < minute) return `${diff} seconds ago`
  if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`
  if (diff < week) return `${Math.floor(diff / day)} days ago`
  if (diff < month) return `${Math.floor(diff / week)} weeks ago`

  return `${Math.floor(diff / month)} months ago`
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp (seconds)
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatDate(timestamp: bigint | number, includeTime = true): string {
  const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const date = new Date(timestampNum * 1000)

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  if (!includeTime) return dateStr

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
    if (Number.isNaN(parsed)) return num
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
  const gwei = formatValue(gasPrice, 9)
  return `${gwei} Gwei`
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @returns Formatted size string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Shorten hex data for display
 * @param data - Hex data string
 * @param maxLength - Maximum display length
 * @returns Shortened hex string
 */
export function shortenHex(data: string, maxLength = 20): string {
  if (data.length <= maxLength) return data

  const prefixLength = Math.floor(maxLength / 2)
  const suffixLength = maxLength - prefixLength - 3 // 3 for "..."

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
export function formatTokenAmount(amount: string | bigint, decimals = 18, symbol?: string): string {
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
    if (fullValue >= 1_000_000_000) {
      formatted = `${(fullValue / 1_000_000_000).toFixed(2)}B`
    } else if (fullValue >= 1_000_000) {
      formatted = `${(fullValue / 1_000_000).toFixed(2)}M`
    } else if (fullValue >= 1_000) {
      formatted = `${(fullValue / 1_000).toFixed(2)}K`
    } else if (fullValue >= 1) {
      // Show up to 4 decimal places for amounts >= 1
      formatted = fullValue.toFixed(4).replace(/\.?0+$/, '')
    } else if (fullValue > 0) {
      // Show up to 8 decimal places for small amounts
      formatted = fullValue.toFixed(8).replace(/\.?0+$/, '')
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
