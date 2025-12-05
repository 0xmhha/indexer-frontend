/**
 * Mutation Hooks
 * 데이터 변경을 위한 React Query 훅
 *
 * 이 훅들은 백엔드에 데이터를 전송하고 상태를 변경합니다.
 *
 * Note: 네이밍 충돌 방지를 위해 namespace exports 사용
 */

// Contract verification mutation
export * as contractVerification from '@/lib/hooks/useContractVerification'

// RPC proxy for contract interactions
export * as rpcProxy from '@/lib/hooks/useRpcProxy'
