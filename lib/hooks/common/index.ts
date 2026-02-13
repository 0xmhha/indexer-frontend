/**
 * Common Hooks
 * 공통 유틸리티 훅
 *
 * 이 훅들은 특정 도메인에 종속되지 않는 공통 기능을 제공합니다.
 *
 * Note: 네이밍 충돌 방지를 위해 namespace exports 사용
 */

// UI & Theme
export * as theme from '@/lib/hooks/useTheme'

// Pagination utilities
export * as pagination from '@/lib/hooks/usePagination'
export * as paginationKeyboard from '@/lib/hooks/usePaginationKeyboard'

// User preferences & settings
export * as userPreferences from '@/lib/hooks/useUserPreferences'

// Analytics
export * as analytics from '@/lib/hooks/useAnalytics'

// Filter utilities
export * as filteredTransactions from '@/lib/hooks/useFilteredTransactions'
export * as logFilters from '@/lib/hooks/useLogFilters'
export * as urlFilters from '@/lib/hooks/useURLFilters'
export * as pendingTxFilters from '@/lib/hooks/usePendingTxFilters'
