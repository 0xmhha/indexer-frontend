/**
 * Raw Types
 * 백엔드 GraphQL 응답의 원시 타입 정의
 * 백엔드 스키마와 1:1 대응 - 모든 숫자 값은 string으로 전달됨
 */

// Re-export raw types from graphql-transforms
// 향후 마이그레이션 시 이 파일로 직접 이동
export type {
  RawBlock,
  RawTransaction,
  RawReceipt,
  RawLog,
  RawBalanceSnapshot,
  RawFeePayerSignature,
  RawChainConfigChange,
  RawValidatorSetChange,
} from '@/lib/utils/graphql-transforms'

// Re-export raw types from graphql.ts
export type {
  RawFeeDelegationStats,
  RawFeePayerStats,
} from '@/types/graphql'
