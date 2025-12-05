/**
 * Subscription Hooks
 * 실시간 데이터 구독을 위한 훅
 *
 * 이 훅들은 WebSocket/GraphQL Subscription을 통해 실시간 데이터를 제공합니다.
 *
 * Note: 네이밍 충돌 방지를 위해 namespace exports 사용
 */

// Real-time block & transaction subscriptions
export * as realtimeBlocksSub from '@/lib/hooks/useRealtimeBlocks'
export * as realtimeTransactionsSub from '@/lib/hooks/useRealtimeTransactions'

// Combined query + subscription hooks
export * as blocksWithSubscription from '@/lib/hooks/useBlocksWithSubscription'
export * as transactionsWithSubscription from '@/lib/hooks/useTransactionsWithSubscription'

// Live balance subscription
export * as liveBalanceSub from '@/lib/hooks/useLiveBalance'

// Generic subscription utilities
export * as subscriptions from '@/lib/hooks/useSubscriptions'
