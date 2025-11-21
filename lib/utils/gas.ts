/**
 * Gas Price Calculation Utilities
 *
 * Utilities for calculating gas prices, especially for EIP-1559 transactions
 */

/**
 * Calculate effective gas price for EIP-1559 transaction
 *
 * Formula: min(maxFeePerGas, baseFeePerGas + maxPriorityFeePerGas)
 *
 * @param baseFeePerGas - Block's base fee per gas
 * @param maxFeePerGas - Transaction's max fee per gas
 * @param maxPriorityFeePerGas - Transaction's max priority fee per gas
 * @returns Effective gas price that was actually paid
 */
export function calculateEffectiveGasPrice(
  baseFeePerGas: bigint,
  maxFeePerGas: bigint,
  maxPriorityFeePerGas: bigint
): bigint {
  // Calculate actual gas price (base fee + priority fee)
  const actualGasPrice = baseFeePerGas + maxPriorityFeePerGas

  // Effective gas price is minimum of maxFeePerGas and actual price
  return actualGasPrice < maxFeePerGas ? actualGasPrice : maxFeePerGas
}

/**
 * Calculate transaction cost
 *
 * @param gasUsed - Amount of gas used by transaction
 * @param gasPrice - Gas price (for legacy) or effective gas price (for EIP-1559)
 * @returns Total cost in wei
 */
export function calculateTxCost(gasUsed: bigint, gasPrice: bigint): bigint {
  return gasUsed * gasPrice
}

/**
 * Calculate refund amount for EIP-1559 transaction
 *
 * Formula: (maxFeePerGas - effectiveGasPrice) * gasUsed
 *
 * @param maxFeePerGas - Transaction's max fee per gas
 * @param effectiveGasPrice - Actual effective gas price paid
 * @param gasUsed - Amount of gas used
 * @returns Refund amount in wei
 */
export function calculateRefund(
  maxFeePerGas: bigint,
  effectiveGasPrice: bigint,
  gasUsed: bigint
): bigint {
  if (effectiveGasPrice >= maxFeePerGas) {
    return BigInt(0)
  }

  return (maxFeePerGas - effectiveGasPrice) * gasUsed
}

/**
 * Calculate priority fee (tip) actually paid to miner
 *
 * @param effectiveGasPrice - Effective gas price that was paid
 * @param baseFeePerGas - Block's base fee per gas
 * @param gasUsed - Amount of gas used
 * @returns Priority fee paid to miner in wei
 */
export function calculatePriorityFee(
  effectiveGasPrice: bigint,
  baseFeePerGas: bigint,
  gasUsed: bigint
): bigint {
  if (effectiveGasPrice <= baseFeePerGas) {
    return BigInt(0)
  }

  const priorityFeePerGas = effectiveGasPrice - baseFeePerGas
  return priorityFeePerGas * gasUsed
}

/**
 * Format gas price to Gwei string
 *
 * @param wei - Gas price in wei
 * @returns Formatted string in Gwei (e.g., "25.5 Gwei")
 */
export function formatGasPrice(wei: bigint): string {
  const gwei = Number(wei) / 1e9
  return `${gwei.toFixed(2)} Gwei`
}

/**
 * Convert wei to Gwei
 *
 * @param wei - Amount in wei
 * @returns Amount in Gwei
 */
export function weiToGwei(wei: bigint): number {
  return Number(wei) / 1e9
}

/**
 * Convert Gwei to wei
 *
 * @param gwei - Amount in Gwei
 * @returns Amount in wei
 */
export function gweiToWei(gwei: number): bigint {
  return BigInt(Math.floor(gwei * 1e9))
}
