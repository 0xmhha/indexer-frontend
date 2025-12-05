/**
 * Query Hooks
 * 데이터 조회를 위한 React Query 훅
 *
 * 이 훅들은 백엔드에서 데이터를 조회하고 캐싱합니다.
 * 실시간 업데이트가 필요한 경우 subscriptions/ 훅과 함께 사용합니다.
 *
 * Note: 네이밍 충돌 방지를 위해 namespace exports 사용
 */

// Block queries
export * as blockQueries from '@/lib/hooks/useBlock'
export * as blocksQueries from '@/lib/hooks/useBlocks'

// Transaction queries
export * as transactionQueries from '@/lib/hooks/useTransaction'
export * as transactionsQueries from '@/lib/hooks/useTransactions'
export * as receiptQueries from '@/lib/hooks/useReceipt'

// Address queries
export * as addressQueries from '@/lib/hooks/useAddress'
export * as addressPageDataQueries from '@/lib/hooks/useAddressPageData'
export * as addressIndexingQueries from '@/lib/hooks/useAddressIndexing'
export * as balanceHistoryQueries from '@/lib/hooks/useBalanceHistory'
export * as contractLogsQueries from '@/lib/hooks/useContractLogs'

// Stats queries
export * as statsQueries from '@/lib/hooks/useStats'
export * as networkStatsQueries from '@/lib/hooks/useNetworkStats'
export * as networkMetricsQueries from '@/lib/hooks/useNetworkMetrics'
export * as latestHeightQueries from '@/lib/hooks/useLatestHeight'

// Governance & Consensus queries
export * as governanceQueries from '@/lib/hooks/useGovernance'
export * as consensusQueries from '@/lib/hooks/useConsensus'
export * as wbftQueries from '@/lib/hooks/useWBFT'
export * as epochSearchQueries from '@/lib/hooks/useEpochSearch'
export * as systemContractsQueries from '@/lib/hooks/useSystemContracts'

// Search queries
export * as searchQueries from '@/lib/hooks/useSearch'
export * as searchSuggestionsQueries from '@/lib/hooks/useSearchSuggestions'
export * as searchHistoryQueries from '@/lib/hooks/useSearchHistory'
