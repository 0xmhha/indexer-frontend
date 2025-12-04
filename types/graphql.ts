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
  TransformedChainConfigChange as ChainConfigChange,
  TransformedValidatorSetChange as ValidatorSetChange,
  ValidatorChangeType,
} from '@/lib/utils/graphql-transforms'

// Export raw types for cases where string-based data is needed
export type {
  RawBlock,
  RawTransaction,
  RawReceipt,
  RawLog,
  RawBalanceSnapshot,
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

export interface TokenBalance {
  contractAddress: string
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
