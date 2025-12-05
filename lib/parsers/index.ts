/**
 * Parsers
 * Raw 백엔드 응답을 Domain 모델로 변환하는 파서
 *
 * 데이터 흐름:
 * Backend Response (Raw) → Parser → Domain Model
 *
 * Parser 네이밍 규칙:
 * - parse{Entity}: 단일 객체 변환
 * - parse{Entity}s: 배열 변환
 * - to{Type}: 기본 타입 변환 (toBigInt, toNumber, toDate)
 */

// Re-export transform functions as parsers
// 기존 graphql-transforms.ts의 함수들을 파서로 재정의
export {
  // 기본 타입 변환
  toBigInt,
  toNumber,
  toDate,
  // 단일 객체 파싱
  transformBlock as parseBlock,
  transformTransaction as parseTransaction,
  transformReceipt as parseReceipt,
  transformLog as parseLog,
  transformBalanceSnapshot as parseBalanceSnapshot,
  transformFeePayerSignature as parseFeePayerSignature,
  transformChainConfigChange as parseChainConfigChange,
  transformValidatorSetChange as parseValidatorSetChange,
  // 배열 파싱
  transformBlocks as parseBlocks,
  transformTransactions as parseTransactions,
} from '@/lib/utils/graphql-transforms'

// Event decoder parser
export {
  decodeEventLog,
  getEventName,
  formatDecodedValue,
  isLikelyTokenAmount,
  formatTokenAmount,
  type DecodedParam,
  type DecodedLog,
} from '@/lib/utils/eventDecoder'
