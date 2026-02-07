/**
 * GraphQL Queries - Re-export from domain-based modules
 *
 * This file re-exports all queries for backwards compatibility.
 * New code should import from '@/lib/apollo/queries' (this file)
 * or directly from domain-specific modules like '@/lib/apollo/queries/block'.
 *
 * Query modules:
 * - block.ts: Block-related queries
 * - transaction.ts: Transaction-related queries
 * - address.ts: Address and token queries
 * - receipt.ts: Receipt and log queries
 * - subscription.ts: Real-time subscriptions
 * - consensus.ts: WBFT consensus subscriptions
 * - fee-delegation.ts: Fee delegation analytics
 */

export * from './queries/index'
