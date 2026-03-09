/**
 * Account Abstraction (EIP-4337) Types
 *
 * Types matching the actual indexer-go backend schema (event-only approach).
 * The backend parses UserOperationEvent, AccountDeployed, UserOperationRevertReason,
 * and PostOpRevertReason logs. Calldata fields are NOT available.
 *
 * Field mapping notes:
 *   Backend "txHash"    → Frontend "bundleTxHash"
 *   Backend "timestamp" → Frontend "blockTimestamp" (unix seconds → Date)
 */

// ============================================================================
// UserOperation Types
// ============================================================================

/** Raw UserOperation from GraphQL (string-based values) */
export interface RawUserOperation {
  userOpHash: string
  txHash: string // backend field name (= bundleTxHash)
  blockNumber: string
  blockHash: string
  txIndex: string
  logIndex: string
  sender: string
  paymaster: string // zero address if no paymaster
  nonce: string
  success: boolean
  actualGasCost: string
  actualUserOpFeePerGas: string
  bundler: string
  entryPoint: string
  timestamp: string // backend field name (unix seconds)
}

/** Transformed UserOperation with proper types */
export interface UserOperation {
  userOpHash: string
  bundleTxHash: string // mapped from backend "txHash"
  blockNumber: number
  blockHash: string
  txIndex: number
  logIndex: number
  sender: string
  paymaster: string | null // null if backend returns zero address
  nonce: bigint
  success: boolean
  actualGasCost: bigint
  actualUserOpFeePerGas: bigint
  bundler: string
  entryPoint: string
  blockTimestamp: Date // mapped from backend "timestamp"
}

/** UserOperation list item (lighter version for tables) */
export interface UserOperationListItem {
  userOpHash: string
  sender: string
  success: boolean
  paymaster: string | null
  bundler: string
  blockNumber: number
  blockTimestamp: Date
  actualGasCost: bigint
  entryPoint: string
}

/** Raw list item from paginated queries (no blockHash/txIndex/logIndex) */
export interface RawUserOperationListItem {
  userOpHash: string
  txHash: string
  blockNumber: string
  sender: string
  paymaster: string
  nonce?: string
  success: boolean
  actualGasCost: string
  actualUserOpFeePerGas?: string
  bundler: string
  entryPoint: string
  timestamp: string
}

// ============================================================================
// Bundler / Paymaster Stats Types (Single Address)
// ============================================================================

/** Raw bundler stats from backend */
export interface RawBundlerStats {
  address: string
  totalOps: string
  successfulOps: string
  failedOps: string
  totalGasSponsored: string
  lastActivityBlock: string
  lastActivityTime: string
}

/** Transformed bundler stats */
export interface BundlerStats {
  address: string
  totalOps: number
  successfulOps: number
  failedOps: number
  totalGasSponsored: bigint
  lastActivityBlock: number
  lastActivityTime: Date
}

/** Bundler for list pages (mock data until backend adds list query) */
export interface Bundler {
  address: string
  totalBundles: number
  totalUserOps: number
  successRate: number
  totalGasUsed: bigint
  firstSeen: Date
  lastSeen: Date
}

/** Raw paymaster stats from backend */
export interface RawPaymasterStats {
  address: string
  totalOps: string
  successfulOps: string
  failedOps: string
  totalGasSponsored: string
  lastActivityBlock: string
  lastActivityTime: string
}

/** Transformed paymaster stats */
export interface PaymasterStats {
  address: string
  totalOps: number
  successfulOps: number
  failedOps: number
  totalGasSponsored: bigint
  lastActivityBlock: number
  lastActivityTime: Date
}

/** Paymaster for list pages (mock data until backend adds list query) */
export interface Paymaster {
  address: string
  totalSponsored: number
  totalGasPaid: bigint
  successRate: number
  firstSeen: Date
  lastSeen: Date
}

// ============================================================================
// Account Deployment Types
// ============================================================================

export interface RawAccountDeployment {
  userOpHash: string
  sender: string
  factory: string
  paymaster: string
  txHash: string
  blockNumber: string
  logIndex: string
  timestamp: string
}

export interface AccountDeployment {
  userOpHash: string
  sender: string
  factory: string
  paymaster: string | null
  txHash: string
  blockNumber: number
  logIndex: number
  timestamp: Date
}

// ============================================================================
// Revert Reason Types
// ============================================================================

export interface RawUserOpRevert {
  userOpHash: string
  sender: string
  nonce: string
  revertReason: string
  txHash: string
  blockNumber: string
  logIndex: string
  revertType: 'execution' | 'postop'
  timestamp: string
}

export interface UserOpRevert {
  userOpHash: string
  sender: string
  nonce: bigint
  revertReason: string
  txHash: string
  blockNumber: number
  logIndex: number
  revertType: 'execution' | 'postop'
  timestamp: Date
}

// ============================================================================
// Bundle (UserOps in Transaction) Types
// ============================================================================

export interface RawBundleUserOp {
  userOpHash: string
  sender: string
  paymaster: string
  success: boolean
  actualGasCost: string
  bundler: string
  entryPoint: string
}

export interface BundleUserOp {
  userOpHash: string
  sender: string
  paymaster: string | null
  success: boolean
  actualGasCost: bigint
  bundler: string
  entryPoint: string
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResult<T> {
  nodes: T[]
  totalCount: number
  pageInfo: PageInfo
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UserOpFilter {
  sender?: string
  bundler?: string
  paymaster?: string
  status?: 'success' | 'failed'
}

// ============================================================================
// Zero Address Constant
// ============================================================================

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
