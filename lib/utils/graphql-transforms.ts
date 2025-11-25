/**
 * GraphQL Data Transform Utilities
 *
 * Transforms string-based GraphQL responses to appropriate TypeScript types
 */

/**
 * Transform a string to BigInt, returns 0n if invalid
 */
export function toBigInt(value: string | null | undefined): bigint {
  if (!value) return BigInt(0)
  try {
    return BigInt(value)
  } catch {
    return BigInt(0)
  }
}

/**
 * Transform a string to number, returns 0 if invalid
 */
export function toNumber(value: string | null | undefined): number {
  if (!value) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

/**
 * Transform a timestamp string to Date
 */
export function toDate(timestamp: string | null | undefined): Date {
  if (!timestamp) return new Date(0)
  const ts = toBigInt(timestamp)
  return new Date(Number(ts) * 1000)
}

/**
 * Raw block data from GraphQL (all strings)
 */
export interface RawBlock {
  number: string
  hash: string
  parentHash?: string
  timestamp: string
  miner?: string
  gasUsed?: string
  gasLimit?: string
  size?: string
  txCount?: number  // Subscription uses txCount
  transactionCount?: number  // Query uses transactionCount
  transactions?: RawTransaction[]
  // EIP-1559 fields
  baseFeePerGas?: string | null
  // Post-Shanghai fields
  withdrawalsRoot?: string | null
  // EIP-4844 Blob fields
  blobGasUsed?: string | null
  excessBlobGas?: string | null
}

/**
 * Transformed block with proper types
 */
export interface TransformedBlock {
  number: bigint
  hash: string
  parentHash?: string | undefined
  timestamp: bigint
  miner: string
  gasUsed: bigint
  gasLimit: bigint
  size: bigint
  transactionCount: number
  transactions?: TransformedTransaction[] | undefined
  // EIP-1559 fields
  baseFeePerGas: bigint | null
  // Post-Shanghai fields
  withdrawalsRoot: string | null
  // EIP-4844 Blob fields
  blobGasUsed: bigint | null
  excessBlobGas: bigint | null
}

/**
 * Raw fee payer signature from GraphQL
 */
export interface RawFeePayerSignature {
  v: string
  r: string
  s: string
}

/**
 * Transformed fee payer signature
 */
export interface TransformedFeePayerSignature {
  v: bigint
  r: string
  s: string
}

/**
 * Raw transaction data from GraphQL (all strings)
 */
export interface RawTransaction {
  hash: string
  blockNumber: string
  blockHash?: string
  transactionIndex?: number
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice?: string | null
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  type: number
  input?: string
  nonce?: string
  v?: string
  r?: string
  s?: string
  chainId?: string | null
  receipt?: RawReceipt | null
  // Fee Delegation fields (type 0x16)
  feePayer?: string | null
  feePayerSignatures?: RawFeePayerSignature[] | null
}

/**
 * Transformed transaction with proper types
 */
export interface TransformedTransaction {
  hash: string
  blockNumber: bigint
  blockHash?: string | undefined
  transactionIndex?: number | undefined
  from: string
  to: string | null
  value: bigint
  gas: bigint
  gasPrice: bigint | null
  maxFeePerGas: bigint | null
  maxPriorityFeePerGas: bigint | null
  type: number
  input?: string | undefined
  nonce: bigint
  v?: bigint | undefined
  r?: string | undefined
  s?: string | undefined
  chainId: bigint | null
  receipt?: TransformedReceipt | null | undefined
  // Fee Delegation fields (type 0x16)
  feePayer: string | null
  feePayerSignatures: TransformedFeePayerSignature[] | null
}

/**
 * Raw receipt data from GraphQL
 */
export interface RawReceipt {
  status: number
  gasUsed: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  contractAddress?: string | null
  logs?: RawLog[]
}

/**
 * Transformed receipt with proper types
 */
export interface TransformedReceipt {
  status: number
  gasUsed: bigint
  cumulativeGasUsed: bigint
  effectiveGasPrice: bigint
  contractAddress: string | null
  logs: TransformedLog[]
}

/**
 * Raw log data from GraphQL
 */
export interface RawLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  blockHash?: string
  transactionHash: string
  transactionIndex?: number
  logIndex: number
  removed?: boolean
}

/**
 * Transformed log with proper types
 */
export interface TransformedLog {
  address: string
  topics: string[]
  data: string
  blockNumber: bigint
  blockHash?: string | undefined
  transactionHash: string
  transactionIndex?: number | undefined
  logIndex: number
  removed?: boolean | undefined
}

/**
 * Raw balance snapshot from GraphQL
 */
export interface RawBalanceSnapshot {
  blockNumber: string
  balance: string
  delta: string
  transactionHash?: string | null
}

/**
 * Transformed balance snapshot
 */
export interface TransformedBalanceSnapshot {
  blockNumber: bigint
  balance: bigint
  delta: bigint
  transactionHash: string | null
}

/**
 * Transform raw block to typed block
 */
export function transformBlock(raw: RawBlock): TransformedBlock {
  return {
    number: toBigInt(raw.number),
    hash: raw.hash,
    parentHash: raw.parentHash,
    timestamp: toBigInt(raw.timestamp),
    miner: raw.miner || '',
    gasUsed: toBigInt(raw.gasUsed || '0'),
    gasLimit: toBigInt(raw.gasLimit || '0'),
    size: toBigInt(raw.size || '0'),
    // Support both txCount (subscription) and transactionCount (query)
    transactionCount: raw.txCount ?? raw.transactionCount ?? 0,
    transactions: raw.transactions?.map(transformTransaction),
    // EIP-1559 fields
    baseFeePerGas: raw.baseFeePerGas ? toBigInt(raw.baseFeePerGas) : null,
    // Post-Shanghai fields
    withdrawalsRoot: raw.withdrawalsRoot ?? null,
    // EIP-4844 Blob fields
    blobGasUsed: raw.blobGasUsed ? toBigInt(raw.blobGasUsed) : null,
    excessBlobGas: raw.excessBlobGas ? toBigInt(raw.excessBlobGas) : null,
  }
}

/**
 * Transform raw fee payer signature to typed signature
 */
export function transformFeePayerSignature(raw: RawFeePayerSignature): TransformedFeePayerSignature {
  return {
    v: toBigInt(raw.v),
    r: raw.r,
    s: raw.s,
  }
}

/**
 * Transform raw transaction to typed transaction
 */
export function transformTransaction(raw: RawTransaction): TransformedTransaction {
  return {
    hash: raw.hash,
    blockNumber: toBigInt(raw.blockNumber),
    blockHash: raw.blockHash,
    transactionIndex: raw.transactionIndex,
    from: raw.from,
    to: raw.to,
    value: toBigInt(raw.value),
    gas: toBigInt(raw.gas),
    gasPrice: raw.gasPrice ? toBigInt(raw.gasPrice) : null,
    maxFeePerGas: raw.maxFeePerGas ? toBigInt(raw.maxFeePerGas) : null,
    maxPriorityFeePerGas: raw.maxPriorityFeePerGas ? toBigInt(raw.maxPriorityFeePerGas) : null,
    type: raw.type,
    input: raw.input,
    nonce: toBigInt(raw.nonce),
    v: raw.v ? toBigInt(raw.v) : undefined,
    r: raw.r,
    s: raw.s,
    chainId: raw.chainId ? toBigInt(raw.chainId) : null,
    receipt: raw.receipt ? transformReceipt(raw.receipt) : null,
    // Fee Delegation fields (type 0x16)
    feePayer: raw.feePayer ?? null,
    feePayerSignatures: raw.feePayerSignatures?.map(transformFeePayerSignature) ?? null,
  }
}

/**
 * Transform raw receipt to typed receipt
 */
export function transformReceipt(raw: RawReceipt): TransformedReceipt {
  return {
    status: raw.status,
    gasUsed: toBigInt(raw.gasUsed),
    cumulativeGasUsed: toBigInt(raw.cumulativeGasUsed),
    effectiveGasPrice: toBigInt(raw.effectiveGasPrice),
    contractAddress: raw.contractAddress ?? null,
    logs: raw.logs?.map(transformLog) ?? [],
  }
}

/**
 * Transform raw log to typed log
 */
export function transformLog(raw: RawLog): TransformedLog {
  return {
    address: raw.address,
    topics: raw.topics,
    data: raw.data,
    blockNumber: toBigInt(raw.blockNumber),
    blockHash: raw.blockHash,
    transactionHash: raw.transactionHash,
    transactionIndex: raw.transactionIndex,
    logIndex: raw.logIndex,
    removed: raw.removed,
  }
}

/**
 * Transform raw balance snapshot to typed balance snapshot
 */
export function transformBalanceSnapshot(raw: RawBalanceSnapshot): TransformedBalanceSnapshot {
  return {
    blockNumber: toBigInt(raw.blockNumber),
    balance: toBigInt(raw.balance),
    delta: toBigInt(raw.delta),
    transactionHash: raw.transactionHash ?? null,
  }
}

/**
 * Transform array of raw blocks
 */
export function transformBlocks(rawBlocks: RawBlock[]): TransformedBlock[] {
  return rawBlocks.map(transformBlock)
}

/**
 * Transform array of raw transactions
 */
export function transformTransactions(rawTransactions: RawTransaction[]): TransformedTransaction[] {
  return rawTransactions.map(transformTransaction)
}

// ============================================================================
// Chain Config Subscription Types
// ============================================================================

/**
 * Raw chain config change event from GraphQL subscription
 */
export interface RawChainConfigChange {
  blockNumber: string
  blockHash: string
  parameter: string
  oldValue: string
  newValue: string
}

/**
 * Transformed chain config change event
 */
export interface TransformedChainConfigChange {
  blockNumber: bigint
  blockHash: string
  parameter: string
  oldValue: string
  newValue: string
}

/**
 * Transform raw chain config change to typed event
 */
export function transformChainConfigChange(raw: RawChainConfigChange): TransformedChainConfigChange {
  return {
    blockNumber: toBigInt(raw.blockNumber),
    blockHash: raw.blockHash,
    parameter: raw.parameter,
    oldValue: raw.oldValue,
    newValue: raw.newValue,
  }
}

// ============================================================================
// Validator Set Subscription Types
// ============================================================================

/**
 * Validator change type
 */
export type ValidatorChangeType = 'added' | 'removed' | 'updated'

/**
 * Raw validator set change event from GraphQL subscription
 */
export interface RawValidatorSetChange {
  blockNumber: string
  blockHash: string
  changeType: ValidatorChangeType
  validator: string
  validatorSetSize: number
  validatorInfo?: string
}

/**
 * Transformed validator set change event
 */
export interface TransformedValidatorSetChange {
  blockNumber: bigint
  blockHash: string
  changeType: ValidatorChangeType
  validator: string
  validatorSetSize: number
  validatorInfo?: string | undefined
}

/**
 * Transform raw validator set change to typed event
 */
export function transformValidatorSetChange(raw: RawValidatorSetChange): TransformedValidatorSetChange {
  return {
    blockNumber: toBigInt(raw.blockNumber),
    blockHash: raw.blockHash,
    changeType: raw.changeType,
    validator: raw.validator,
    validatorSetSize: raw.validatorSetSize,
    validatorInfo: raw.validatorInfo,
  }
}
