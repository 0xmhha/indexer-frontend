/**
 * GraphQL Schemas
 * 백엔드 스키마와 일치하는 쿼리/뮤테이션/서브스크립션 정의
 *
 * 구조:
 * - queries/: 데이터 조회 쿼리
 * - mutations/: 데이터 변경 뮤테이션
 * - subscriptions/: 실시간 구독
 *
 * Note: 타입 충돌 방지를 위해 namespace exports 사용
 * import { queries, subscriptions, generated } from '@/lib/network/schemas'
 */

// Main queries (from lib/apollo/queries.ts)
export * as mainQueries from '@/lib/apollo/queries'

// Feature-specific queries as namespaces
export * as statsQueries from '@/lib/graphql/queries/stats'
export * as searchQueries from '@/lib/graphql/queries/search'
export * as systemContractQueries from '@/lib/graphql/queries/system-contracts'
export * as contractVerificationQueries from '@/lib/graphql/queries/contractVerification'
export * as rpcProxyQueries from '@/lib/graphql/queries/rpcProxy'
export * as addressIndexingQueries from '@/lib/graphql/queries/address-indexing'

// Subscriptions
export * as subscriptions from '@/lib/graphql/subscriptions'

// Generated types (from codegen)
export * as generated from '@/lib/graphql/generated'
