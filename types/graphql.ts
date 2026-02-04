/**
 * GraphQL Types
 * Re-export generated types and transformed types for use in components
 */
export * from '@/lib/graphql/generated'

// Re-export transformed types as the primary types for components
export type {
  TransformedBlock as Block,
  TransformedTransaction as Transaction,
  TransformedReceipt as Receipt,
  TransformedLog as Log,
  TransformedBalanceSnapshot as BalanceSnapshot,
  TransformedFeePayerSignature,
  TransformedSetCodeAuthorization,
  TransformedChainConfigChange as ChainConfigChange,
  TransformedValidatorSetChange as ValidatorSetChange,
  ValidatorChangeType,
  DecodedLog,
  DecodedParam,
} from '@/lib/utils/graphql-transforms'

// Export raw types for cases where string-based data is needed
export type {
  RawBlock,
  RawTransaction,
  RawReceipt,
  RawLog,
  RawBalanceSnapshot,
  RawSetCodeAuthorization,
  RawChainConfigChange,
  RawValidatorSetChange,
} from '@/lib/utils/graphql-transforms'

// Export transform utilities
export {
  transformBlock,
  transformBlocks,
  transformTransaction,
  transformTransactions,
  transformReceipt,
  transformLog,
  transformBalanceSnapshot,
  transformSetCodeAuthorization,
  transformChainConfigChange,
  transformValidatorSetChange,
  toBigInt,
  toNumber,
  toDate,
} from '@/lib/utils/graphql-transforms'

// Additional types for features not yet supported by backend
export interface MinerStats {
  address: string
  blockCount: number
  lastBlockNumber: bigint
  percentage: number
}

// ============================================================================
// Fee Delegation Types
// ============================================================================

/**
 * Raw Fee Delegation stats from GraphQL (string-based BigInt values)
 * All numeric values from backend are strings to preserve BigInt precision
 */
export interface RawFeeDelegationStats {
  /** Total fee delegated transactions (BigInt as string) */
  totalFeeDelegatedTxs: string
  /** Total fees saved by users in wei (BigInt as string) */
  totalFeesSaved: string
  /** Adoption rate as percentage (0-100) */
  adoptionRate: number
  /** Average fee saved per transaction in wei (BigInt as string) */
  avgFeeSaved: string
}

/**
 * Raw Fee Payer stats from GraphQL (string-based BigInt values)
 */
export interface RawFeePayerStats {
  /** Fee payer address */
  address: string
  /** Number of transactions sponsored (BigInt as string) */
  txCount: string
  /** Total fees paid in wei (BigInt as string) */
  totalFeesPaid: string
  /** Percentage of total fee delegation (0-100) */
  percentage: number
}

/**
 * Transformed Fee Delegation stats (with proper BigInt/number values)
 */
export interface FeeDelegationStats {
  /** Total fee delegated transactions */
  totalFeeDelegatedTxs: number
  /** Total fees saved by users in wei */
  totalFeesSaved: bigint
  /** Adoption rate as percentage (0-100) */
  adoptionRate: number
  /** Average fee saved per transaction in wei */
  avgFeeSaved: bigint
  /** Top fee payers list */
  topFeePayers: FeePayerStats[]
}

/**
 * Transformed Fee Payer stats (with proper BigInt/number values)
 */
export interface FeePayerStats {
  /** Fee payer address */
  address: string
  /** Number of transactions sponsored */
  txCount: number
  /** Total fees paid in wei */
  totalFeesPaid: bigint
  /** Percentage of total fee delegation (0-100) */
  percentage: number
}

export interface TokenBalance {
  address: string // Token contract address (field name from schema)
  tokenType: string
  balance: bigint
  tokenId: string | null // Token ID for NFTs (ERC-721, ERC-1155), null for ERC-20
  name: string | null
  symbol: string | null
  decimals: number | null
  metadata: string | null // JSON string for additional token metadata
}

// ============================================================================
// Receipt Types (from useReceipt hook)
// ============================================================================

export type {
  ReceiptLog,
  TransactionReceipt,
  ParsedReceipt,
  TransferEvent,
} from '@/lib/hooks/useReceipt'

export {
  parseReceipt,
  formatGas,
  calculateTxCost,
  formatWeiToEther,
  parseTransferLogs,
  filterLogsByAddress,
  filterLogsByTopic,
  EVENT_SIGNATURES,
} from '@/lib/hooks/useReceipt'

// ============================================================================
// System Contract Types (from useSystemContracts hook)
// ============================================================================

export type {
  // System Contract Event Types
  SystemContractSubscriptionFilter,
  SystemContractEventMessage,
  ParsedSystemContractEvent,
  // Dynamic Contract Types
  RegisterContractInput,
  RegisteredContract,
  DynamicContractSubscriptionFilter,
  DynamicContractEventMessage,
  ParsedDynamicContractEvent,
  // Governance Types
  Proposal,
  ProposalVote,
  ProposalStatus,
  ProposalStatusFilter,
  DepositMintProposal,
  // Event Types
  MintEvent,
  BurnEvent,
  MinterInfo,
  ValidatorInfo,
  MinterConfigEvent,
  GasTipUpdateEvent,
  ValidatorChangeEvent,
  EmergencyPauseEvent,
  BlacklistEvent,
  MemberChangeEvent,
  MaxProposalsUpdateEvent,
  ProposalExecutionSkippedEvent,
} from '@/lib/hooks/useSystemContracts'

export {
  // Constants
  SYSTEM_CONTRACTS,
  // Utility Functions
  parseSystemContractEvent,
  parseDynamicContractEvent,
  isAddressBlacklisted,
  filterToBackendStatus,
  getProposalStatusLabel,
  getProposalStatusColor,
} from '@/lib/hooks/useSystemContracts'
