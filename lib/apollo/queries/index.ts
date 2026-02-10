/**
 * GraphQL Queries - Domain-based Organization
 *
 * This file re-exports all GraphQL queries from domain-specific modules.
 * Import queries from this file for a centralized access point.
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

// Block queries
export {
  GET_LATEST_HEIGHT,
  GET_BLOCK,
  GET_BLOCK_BY_HASH,
  GET_BLOCKS_BY_TIME_RANGE,
  GET_BLOCK_COUNT,
} from './block'

// Transaction queries
export {
  GET_TRANSACTION,
  GET_TRANSACTIONS_BY_ADDRESS,
  GET_TRANSACTION_COUNT,
  GET_SETCODE_TRANSACTIONS,
} from './transaction'

// Address queries
export {
  GET_ADDRESS_BALANCE,
  GET_ADDRESS_OVERVIEW,
  GET_LIVE_BALANCE,
  GET_BALANCE_HISTORY,
  GET_TOKEN_BALANCES,
  GET_ADDRESS_SETCODE_INFO,
} from './address'

// Receipt and log queries
export {
  GET_RECEIPT,
  GET_RECEIPTS_BY_BLOCK,
  GET_LOGS,
} from './receipt'

// Real-time subscriptions
export {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_PENDING_TRANSACTIONS,
  SUBSCRIBE_LOGS,
  SUBSCRIBE_CHAIN_CONFIG,
  SUBSCRIBE_VALIDATOR_SET,
} from './subscription'

// Consensus subscriptions (WBFT monitoring)
export {
  SUBSCRIBE_CONSENSUS_BLOCK,
  SUBSCRIBE_CONSENSUS_FORK,
  SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE,
  SUBSCRIBE_CONSENSUS_ERROR,
} from './consensus'

// Fee delegation analytics
export {
  GET_FEE_DELEGATION_STATS,
  GET_TOP_FEE_PAYERS,
  GET_FEE_PAYER_STATS,
} from './fee-delegation'

// Gas tracker queries
export {
  GET_RECENT_BLOCKS_FOR_GAS,
  GET_LATEST_BLOCK_GAS,
  SUBSCRIBE_NEW_BLOCK_GAS,
} from './gas'
