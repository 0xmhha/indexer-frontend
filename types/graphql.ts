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
} from '@/lib/utils/graphql-transforms'

// Export raw types for cases where string-based data is needed
export type {
  RawBlock,
  RawTransaction,
  RawReceipt,
  RawLog,
  RawBalanceSnapshot,
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
  toBigInt,
  toNumber,
  toDate,
} from '@/lib/utils/graphql-transforms'
