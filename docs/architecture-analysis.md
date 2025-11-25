# 프론트엔드 아키텍처 분석 및 개선 방안

> 📅 **분석 일자**: 2025-11-25
> 🎯 **목적**: 데이터 업데이트 문제 및 매직넘버 과다 사용 개선

---

## 📊 현황 분석

### 1. 데이터 업데이트 문제 🔴

#### 1.1 Apollo Client 캐시 정책 문제

**위치**: `lib/apollo/client.ts:156-173`

**현재 설정**:
```typescript
defaultOptions: {
  watchQuery: {
    fetchPolicy: 'cache-first',        // ❌ 캐시 우선 - 새 데이터 안 가져옴
    notifyOnNetworkStatusChange: false, // ❌ 네트워크 변경 알림 없음
  },
  query: {
    fetchPolicy: 'cache-first',        // ❌ 캐시 우선
  },
}
```

**문제점**:
- `cache-first` 정책으로 인해 한 번 캐시된 데이터는 새로 가져오지 않음
- 사용자가 페이지를 새로고침하지 않는 한 오래된 데이터 표시
- 실시간성이 중요한 블록체인 explorer에 치명적

#### 1.2 폴링(Polling) 설정 부재

**대부분의 Hook에 pollInterval이 없음**:

| Hook | 폴링 설정 | 영향 받는 페이지 |
|------|---------|-------------|
| `useBlocks` | ❌ 없음 | `/blocks` (블록 목록) |
| `useTransactions` | ❌ 없음 | `/txs` (트랜잭션 목록) |
| `useAddress` | ❌ 없음 | `/address/[address]` (주소 상세) |
| `useAddressTransactions` | ❌ 없음 | `/address/[address]` (주소 트랜잭션) |
| `useBalanceHistory` | ❌ 없음 | `/address/[address]` (잔액 히스토리) |
| `useTokenBalances` | ❌ 없음 | `/address/[address]` (토큰 잔액) |
| `useSystemContracts` | ❌ 없음 | `/system-contracts` (시스템 컨트랙트) |
| `useGovernance` | ❌ 없음 | `/governance` (거버넌스) |
| `useWBFT` | ❌ 없음 | `/wbft`, `/validators` |
| `useStats` | ⚠️ 옵션만 | `/stats` (통계) |
| `useNetworkStats` | ❌ 없음 | 홈, 여러 페이지 |

**결과**: 페이지가 "멈춰있는" 것처럼 보임 - 새 블록/트랜잭션이 생성되어도 화면에 반영 안 됨

#### 1.3 WebSocket 구독 사용 제한적

**WebSocket 구독이 있는 컴포넌트** (✅ 실시간 업데이트됨):
- ✅ `LatestBlockCard` - useNewBlocks(1)
- ✅ `RecentBlocksList` - useNewBlocks(10)
- ✅ `AdvancedPendingTransactionsPanel` - usePendingTransactions(20)
- ✅ `LiveIndicator` - SUBSCRIBE_NEW_BLOCK
- ✅ `RealtimeActivityChart` - usePendingTransactions
- ✅ `LogsViewer` - useLogs

**WebSocket 구독이 없는 주요 페이지** (❌ 업데이트 안 됨):
- ❌ `/blocks` - 블록 목록 페이지
- ❌ `/txs` - 트랜잭션 목록 페이지
- ❌ `/address/[address]` - 주소 상세 페이지
- ❌ `/stats` - 통계 페이지
- ❌ `/governance` - 거버넌스 페이지
- ❌ `/system-contracts` - 시스템 컨트랙트 페이지

---

### 2. 매직넘버 과다 사용 🔴

#### 2.1 Pagination Limits (페이지네이션 제한)

**동일한 값(20)을 여러 곳에 하드코딩**:
```typescript
// lib/hooks/useBlocks.ts:50
const { limit = 20, ... } = params

// lib/hooks/useTransactions.ts:60
const { limit = 20, ... } = params

// lib/hooks/useSystemContracts.ts:158, 194, 236
const { limit = 20, ... } = params

// lib/hooks/useFilteredTransactions.ts:78
limit = 20,

// lib/hooks/useGovernance.ts:154
const { contract, status, proposer, limit = 20, ... } = params

// lib/hooks/useWBFT.ts:264, 326
const { ..., limit = 20, ... } = params

// app/blocks/page.tsx:33, 51
const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : 20
defaultItemsPerPage: 20,

// components/address/*.tsx
limit = 20
```

**문제점**:
- 전역적으로 limit을 변경하려면 20군데 이상 수정 필요
- 실수로 일부만 수정하면 일관성 깨짐
- 유지보수 어려움

#### 2.2 기타 매직넘버

| 값 | 사용 위치 | 의미 |
|----|---------|-----|
| `10` | useStats, useAddress, useSearch, useAnalytics | 기본 검색/통계 제한 |
| `5` | useSearchAutocomplete | 자동완성 결과 수 |
| `50` | usePendingTransactions, useNewTransactions | 메모리에 보관할 트랜잭션 수 |
| `100` | useLogs, useBalanceHistory | 로그/히스토리 제한 |
| `1000` | useAnalytics | 블록 분석 제한 |
| `300` | useSearch | 검색 디바운스 (ms) |
| `10_000` | apollo/client.ts:47 | WebSocket keepAlive (ms) |
| `3` | apollo/client.ts:48 | WebSocket 재시도 횟수 |
| `4000` | apollo/client.ts:51 | WebSocket 재시도 최대 대기 (ms) |

#### 2.3 하드코딩된 API 엔드포인트

**위치**: `lib/hooks/useSubscriptions.ts:188`
```typescript
const response = await fetch(
  `http://localhost:8080/graphql`,  // ❌ 하드코딩
  { ... }
)
```

**문제점**:
- 환경별(dev/staging/prod) 엔드포인트 변경 불가
- env.graphqlEndpoint 있는데 사용 안 함

---

## 🎯 개선 방안

### Phase 1: 설정 중앙화 (Constants Configuration)

#### 1.1 설정 파일 생성

**파일**: `lib/config/constants.ts`

```typescript
/**
 * Application-wide constants and configuration
 */

// ============================================================================
// Pagination & Limits
// ============================================================================

export const PAGINATION = {
  /** 기본 페이지당 아이템 수 (블록, 트랜잭션, 시스템 컨트랙트 등) */
  DEFAULT_PAGE_SIZE: 20,

  /** 검색 결과 기본 제한 */
  SEARCH_LIMIT: 10,

  /** 자동완성 결과 제한 */
  AUTOCOMPLETE_LIMIT: 5,

  /** 주소 트랜잭션 기본 제한 */
  ADDRESS_TX_LIMIT: 10,

  /** 통계/분석 기본 제한 */
  STATS_LIMIT: 10,

  /** 대량 분석용 블록 제한 */
  ANALYTICS_BLOCK_LIMIT: 1000,

  /** 잔액 히스토리 기본 제한 */
  BALANCE_HISTORY_LIMIT: 100,
} as const

// ============================================================================
// Real-time Updates (WebSocket & Polling)
// ============================================================================

export const REALTIME = {
  /** 메모리에 보관할 최대 pending 트랜잭션 수 */
  MAX_PENDING_TRANSACTIONS: 50,

  /** 메모리에 보관할 최대 블록 수 */
  MAX_BLOCKS: 20,

  /** 메모리에 보관할 최대 트랜잭션 수 */
  MAX_TRANSACTIONS: 50,

  /** 메모리에 보관할 최대 로그 수 */
  MAX_LOGS: 100,

  /** WebSocket keepAlive 간격 (ms) */
  WS_KEEPALIVE_INTERVAL: 10_000,

  /** WebSocket 재시도 횟수 */
  WS_RETRY_ATTEMPTS: 3,

  /** WebSocket 재시도 최대 대기 시간 (ms) */
  WS_RETRY_MAX_WAIT: 4_000,
} as const

// ============================================================================
// Polling Intervals (ms)
// ============================================================================

export const POLLING_INTERVALS = {
  /** 매우 빠른 폴링 - 블록 목록, 트랜잭션 목록 (5초) */
  VERY_FAST: 5_000,

  /** 빠른 폴링 - 주소 상세, 잔액 (10초) */
  FAST: 10_000,

  /** 일반 폴링 - 통계, 거버넌스 (30초) */
  NORMAL: 30_000,

  /** 느린 폴링 - 시스템 정보, WBFT (60초) */
  SLOW: 60_000,

  /** 사용 안 함 (WebSocket만 사용) */
  DISABLED: 0,
} as const

// ============================================================================
// Debounce & Throttle
// ============================================================================

export const TIMING = {
  /** 검색 입력 디바운스 (ms) */
  SEARCH_DEBOUNCE: 300,

  /** 필터 변경 디바운스 (ms) */
  FILTER_DEBOUNCE: 500,

  /** 스크롤 쓰로틀 (ms) */
  SCROLL_THROTTLE: 100,
} as const

// ============================================================================
// Cache Policies
// ============================================================================

export const CACHE_POLICIES = {
  /** 실시간 데이터 - 항상 네트워크에서 최신 데이터 가져옴 */
  REALTIME: 'network-only' as const,

  /** 자주 변경되는 데이터 - 캐시와 네트워크 동시 사용 */
  DYNAMIC: 'cache-and-network' as const,

  /** 정적 데이터 - 캐시 우선 */
  STATIC: 'cache-first' as const,

  /** 캐시 없음 - 구독 데이터 */
  NO_CACHE: 'no-cache' as const,
} as const

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  /** WebSocket 실시간 업데이트 사용 여부 */
  ENABLE_WEBSOCKET: true,

  /** 폴링 사용 여부 (WebSocket 미지원 환경용) */
  ENABLE_POLLING: true,

  /** 자동 새로고침 사용 여부 */
  ENABLE_AUTO_REFRESH: true,

  /** 개발 모드 로깅 */
  ENABLE_DEV_LOGGING: process.env.NODE_ENV === 'development',
} as const

// ============================================================================
// Type Exports
// ============================================================================

export type CachePolicy = typeof CACHE_POLICIES[keyof typeof CACHE_POLICIES]
export type PollingInterval = typeof POLLING_INTERVALS[keyof typeof POLLING_INTERVALS]
```

---

### Phase 2: Apollo Client 설정 개선

#### 2.1 캐시 정책 변경

**파일**: `lib/apollo/client.ts` 수정

```typescript
import { CACHE_POLICIES, REALTIME } from '@/lib/config/constants'

export const apolloClient = new ApolloClient({
  link: from([errorLink, loggingLink, splitLink]),
  cache: new InMemoryCache({
    // ... existing typePolicies
  }),
  defaultOptions: {
    watchQuery: {
      // ✅ 캐시와 네트워크 동시 사용으로 변경
      fetchPolicy: CACHE_POLICIES.DYNAMIC,
      // ✅ 네트워크 상태 변경 알림 활성화
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: CACHE_POLICIES.DYNAMIC,
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})
```

---

### Phase 3: Hook 폴링 설정 추가

#### 3.1 useBlocks Hook 개선

**파일**: `lib/hooks/useBlocks.ts` 수정

```typescript
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

interface UseBlocksParams {
  limit?: number
  offset?: number
  numberFrom?: string
  numberTo?: string
  miner?: string
  pollInterval?: number  // ✅ 추가
}

export function useBlocks(params: UseBlocksParams = {}) {
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,  // ✅ 상수 사용
    offset = 0,
    numberFrom,
    numberTo,
    miner,
    pollInterval = POLLING_INTERVALS.VERY_FAST,  // ✅ 기본 5초 폴링
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_BLOCKS, {
    variables: { limit, offset, numberFrom, numberTo, miner },
    returnPartialData: true,
    pollInterval,  // ✅ 폴링 활성화
  })

  // ... rest of the code
}
```

#### 3.2 useTransactions Hook 개선

```typescript
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

interface UseTransactionsParams {
  // ... existing params
  pollInterval?: number  // ✅ 추가
}

export function useTransactions(params: UseTransactionsParams = {}) {
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,  // ✅ 상수 사용
    // ... other params
    pollInterval = POLLING_INTERVALS.VERY_FAST,  // ✅ 기본 5초 폴링
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_TRANSACTIONS, {
    variables: { /* ... */ },
    returnPartialData: true,
    pollInterval,  // ✅ 폴링 활성화
  })

  // ... rest
}
```

#### 3.3 useAddress Hook 개선

```typescript
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

export function useAddressBalance(address: string | null, blockNumber?: string) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_BALANCE, {
    variables: { address: address ?? '', blockNumber: blockNumber ?? null },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.FAST,  // ✅ 10초 폴링 추가
  })
  // ... rest
}

export function useAddressTransactions(address: string | null, limit = PAGINATION.ADDRESS_TX_LIMIT, offset = 0) {
  const { data, loading, error, fetchMore, previousData } = useQuery(GET_TRANSACTIONS_BY_ADDRESS, {
    variables: { address: address ?? '', limit, offset },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.FAST,  // ✅ 10초 폴링 추가
  })
  // ... rest
}
```

---

### Phase 4: 하드코딩 제거

#### 4.1 API 엔드포인트 수정

**파일**: `lib/hooks/useSubscriptions.ts:188` 수정

```typescript
import { env } from '@/lib/config/env'

// Before ❌
const response = await fetch(
  `http://localhost:8080/graphql`,
  { ... }
)

// After ✅
const response = await fetch(
  env.graphqlEndpoint,
  { ... }
)
```

#### 4.2 모든 매직넘버를 constants로 변경

**적용 대상 파일들**:
- `lib/hooks/useStats.ts`
- `lib/hooks/useNetworkStats.ts`
- `lib/hooks/useSystemContracts.ts`
- `lib/hooks/useFilteredTransactions.ts`
- `lib/hooks/useSearch.ts`
- `lib/hooks/useBalanceHistory.ts`
- `lib/hooks/useWBFT.ts`
- `lib/hooks/useGovernance.ts`
- `lib/hooks/useAnalytics.ts`
- `lib/hooks/useSubscriptions.ts`
- `components/address/*.tsx`
- `app/*/page.tsx`

---

### Phase 5: 페이지별 최적화 전략

#### 5.1 실시간성이 중요한 페이지

**적용 대상**: `/` (홈), `/blocks`, `/txs`

**전략**: WebSocket 구독 + 빠른 폴링 (5초)
```typescript
pollInterval: POLLING_INTERVALS.VERY_FAST
```

#### 5.2 자주 업데이트되는 페이지

**적용 대상**: `/address/[address]`, `/stats`

**전략**: 일반 폴링 (10-30초)
```typescript
pollInterval: POLLING_INTERVALS.FAST  // 주소: 10초
pollInterval: POLLING_INTERVALS.NORMAL  // 통계: 30초
```

#### 5.3 가끔 업데이트되는 페이지

**적용 대상**: `/governance`, `/system-contracts`, `/wbft`

**전략**: 느린 폴링 (60초)
```typescript
pollInterval: POLLING_INTERVALS.SLOW
```

#### 5.4 사용자 액션으로만 업데이트

**적용 대상**: `/block/[id]`, `/tx/[hash]` (상세 페이지)

**전략**: 폴링 없음, refetch만 사용
```typescript
pollInterval: POLLING_INTERVALS.DISABLED
```

---

## 📋 실행 체크리스트

### Step 1: 설정 파일 생성
- [ ] `lib/config/constants.ts` 파일 생성
- [ ] 모든 매직넘버를 상수로 정의
- [ ] 타입 export 추가

### Step 2: Apollo Client 수정
- [ ] `lib/apollo/client.ts`의 fetchPolicy를 `cache-and-network`로 변경
- [ ] `notifyOnNetworkStatusChange: true` 설정
- [ ] WebSocket 설정에 constants 적용

### Step 3: Hook 수정 (우선순위 높음)
- [ ] `useBlocks` - pollInterval 추가 (5초)
- [ ] `useTransactions` - pollInterval 추가 (5초)
- [ ] `useAddress` 관련 hook들 - pollInterval 추가 (10초)
- [ ] `useStats` - 기본 pollInterval 설정 (30초)
- [ ] constants import 및 매직넘버 제거

### Step 4: Hook 수정 (우선순위 보통)
- [ ] `useSystemContracts` - pollInterval 추가 (60초)
- [ ] `useGovernance` - pollInterval 추가 (60초)
- [ ] `useWBFT` - pollInterval 추가 (60초)
- [ ] `useBalanceHistory` - pollInterval 추가 (10초)
- [ ] constants import 및 매직넘버 제거

### Step 5: 하드코딩 제거
- [ ] `useSubscriptions.ts`의 하드코딩된 API 엔드포인트 수정
- [ ] 모든 component와 page의 매직넘버를 constants로 변경

### Step 6: 테스트
- [ ] 각 페이지에서 실시간 업데이트 확인
- [ ] 네트워크 탭에서 폴링 간격 확인
- [ ] WebSocket 연결 상태 확인
- [ ] 성능 영향 측정 (Network waterfall)

### Step 7: 문서화
- [ ] `README.md`에 폴링 설정 가이드 추가
- [ ] `constants.ts`에 각 상수 의미 주석 추가
- [ ] 환경별 설정 방법 문서화

---

## ⚡ 예상 효과

### 개선 효과

1. **실시간성 향상** 🚀
   - 모든 페이지에서 5-60초 간격으로 자동 업데이트
   - 사용자가 "새로고침" 버튼 누를 필요 없음
   - 블록체인 explorer로서의 실시간성 확보

2. **유지보수성 향상** 🛠️
   - 모든 설정값이 한 곳(`constants.ts`)에 집중
   - 전역 설정 변경 시 한 파일만 수정
   - 일관성 보장 및 실수 방지

3. **성능 최적화** ⚡
   - 페이지별로 적절한 폴링 간격 설정
   - 불필요한 요청 최소화
   - 네트워크 부하 분산

4. **개발 생산성** 💻
   - 새로운 hook 추가 시 constants import만으로 표준 설정 적용
   - 환경별 설정 변경 용이
   - Feature flag로 기능 제어 가능

### 잠재적 고려사항

1. **네트워크 트래픽 증가**
   - 폴링으로 인한 추가 요청 발생
   - GraphQL 서버 부하 증가 가능
   - 해결: 적절한 폴링 간격 조정, 서버 캐싱 활용

2. **배터리 소모 (모바일)**
   - 지속적인 네트워크 요청으로 배터리 소모 증가
   - 해결: 모바일에서는 폴링 간격 늘리기 또는 Page Visibility API 사용

3. **초기 로딩**
   - `cache-and-network` 정책으로 초기 로딩 시간 약간 증가 가능
   - 해결: skeleton loading UI로 UX 개선

---

## 🎯 권장 실행 순서

### 1단계 (즉시 실행 가능) - 1-2시간
- [ ] `constants.ts` 파일 생성
- [ ] Apollo Client 설정 변경
- [ ] `useBlocks`, `useTransactions` hook에 pollInterval 추가

### 2단계 (우선순위 높음) - 2-3시간
- [ ] 주소 관련 hook들(`useAddress`, `useAddressTransactions` 등) pollInterval 추가
- [ ] `useStats`, `useNetworkStats` pollInterval 기본값 설정
- [ ] 하드코딩된 API 엔드포인트 수정

### 3단계 (전체 매직넘버 제거) - 4-6시간
- [ ] 모든 hook의 매직넘버를 constants로 교체
- [ ] 모든 component의 매직넘버를 constants로 교체
- [ ] 모든 page의 매직넘버를 constants로 교체

### 4단계 (테스트 및 최적화) - 2-3시간
- [ ] 각 페이지별 실시간 업데이트 테스트
- [ ] 네트워크 성능 측정 및 폴링 간격 조정
- [ ] 문서화 및 팀 공유

---

## 📚 참고 자료

- [Apollo Client Caching](https://www.apollographql.com/docs/react/caching/cache-configuration/)
- [Apollo Client Polling](https://www.apollographql.com/docs/react/data/queries/#polling)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)
- [Next.js Real-time Data](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
