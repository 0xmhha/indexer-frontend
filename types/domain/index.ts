/**
 * Domain Types
 * 프론트엔드 도메인 모델 타입 정의
 * UI에서 사용하기 적합한 형태 - BigInt, Date 등 적절한 타입 사용
 */

// Re-export transformed (domain) types from graphql-transforms
// 향후 마이그레이션 시 이 파일로 직접 이동
export type {
  TransformedBlock as Block,
  TransformedTransaction as Transaction,
  TransformedReceipt as Receipt,
  TransformedLog as Log,
  TransformedBalanceSnapshot as BalanceSnapshot,
  TransformedFeePayerSignature as FeePayerSignature,
  TransformedChainConfigChange as ChainConfigChange,
  TransformedValidatorSetChange as ValidatorSetChange,
  ValidatorChangeType,
  DecodedLog,
  DecodedParam,
} from '@/lib/utils/graphql-transforms'

// Re-export transformed types from graphql.ts
export type {
  FeeDelegationStats,
  FeePayerStats,
  MinerStats,
  TokenBalance,
} from '@/types/graphql'

// Re-export pagination types from index.ts
export type {
  PaginationParams,
  PageInfo,
  PaginatedResult,
} from '@/types/index'
