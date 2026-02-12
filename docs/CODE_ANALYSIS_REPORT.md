# Code Analysis Report

> **Date**: 2026-02-12
> **Project**: indexer-frontend (StableNet Blockchain Explorer)
> **Scope**: 구조, 코딩 스타일, 메모리/성능 최적화, SOLID 원칙, Clean Code

---

## 1. 프로젝트 구조 개요

| 항목 | 수치 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| React / TypeScript | 18.3 / 5.6 (Strict Mode) |
| 페이지/라우트 | 26+ |
| 컴포넌트 | 120+ (TSX 150개) |
| 커스텀 훅 | 60+ |
| Zustand 스토어 | 3개 (network, consensus, realtime) |
| GraphQL 데이터 | Apollo Client 3.11 + WebSocket |
| 테스트 | Vitest 300+, Playwright (E2E 미작성) |

디렉토리 구조는 `app/`, `components/`, `lib/`, `stores/`로 잘 분리되어 있고, 기능별 서브 디렉토리 구성이 명확함.

---

## 2. Critical 이슈 (P0 — 즉시 수정)

### 2.1 Unsafe Fallback Values — 사일런트 데이터 손상

**파일**: `lib/utils/graphql-transforms.ts`

`toBigInt()` 실패 시 `BigInt(0)` 반환, `toNumber()` 실패 시 `0` 반환. 실제 0과 변환 실패를 구분할 수 없어 잔액, 가스비 등에서 **사일런트 데이터 손상** 발생 가능.

```typescript
// 문제 코드
function toBigInt(value: unknown): bigint {
  try { return BigInt(String(value)) }
  catch { return BigInt(0) }  // ← 실패를 숨김
}
```

**수정 방향**: `null` 반환 또는 명시적 에러 전파

### 2.2 Type Assertion 무검증

**파일**: `lib/api/cache.ts`

`as MemoryCache` 타입 단언을 런타임 검증 없이 사용. 타입 불일치 시 런타임 크래시.

**수정 방향**: `instanceof` 또는 타입 가드 적용

### 2.3 Race Condition — Error Logger Batch

**파일**: `lib/errors/logger.ts`

batch timeout과 batch send가 동시 실행 가능 → 에러 로그 중복 전송 또는 유실.

**수정 방향**: flushing 플래그 기반 동기화

### 2.4 Apollo Cache 무한 증가

**파일**: `lib/apollo/client.ts`

merge 정책에 TTL/eviction 전략 없음. 장시간 사용 시 캐시 무한 증가 → 브라우저 메모리 소진.

**수정 방향**: 캐시 크기 상한 적용 (slice)

---

## 3. SOLID 원칙 위반

### 3.1 SRP (단일 책임 원칙)

| 파일 | 책임 수 | 내용 |
|------|---------|------|
| `lib/hooks/usePagination.ts` (223줄) | 5 | URL 상태, 로컬 상태, 페이지네이션 로직, 스크롤, 사용자 설정 |
| `components/contract/ContractReader.tsx` (352줄) | 4 | 입력 변환, 결과 포맷, placeholder 생성, 렌더링 |
| `components/contract/SourceCodeViewer.tsx` (373줄) | 5 | JSON 파싱, 파일 파싱, 구문 강조, 탭 상태, UI |
| `stores/consensusStore.ts` (423줄) | 5 | 상태 관리, 통계 계산, 네트워크 헬스, 정렬, 필터링 |

### 3.2 OCP (개방-폐쇄 원칙)

- `graphql-transforms.ts`의 변환 함수: 하드코딩 필드 매핑 → 새 필드 추가 시 기존 코드 수정 필요

### 3.3 ISP (인터페이스 분리 원칙)

| 컴포넌트 | Props 수 | 문제 |
|----------|----------|------|
| `AddressTransactionsSection` | 13개 | 대부분 사용처에서 절반만 필요 |

### 3.4 DIP (의존성 역전 원칙)

- `cache.ts`, `wallet` 코드가 구체 구현에 직접 의존. 인터페이스 추상화 부재

---

## 4. Clean Code 위반

### 4.1 DRY 위반

| 파일 | 문제 |
|------|------|
| `useERC20Hooks.ts` / `useERC721Hooks.ts` | 3개의 거의 동일한 함수 패턴 반복 |
| 여러 컴포넌트 에러 핸들링 | try-catch 패턴 중복 |
| Loading/Empty/Error 상태 | 12+ 곳에서 동일 패턴 반복 |

### 4.2 대형 파일 (>300줄)

| 파일 | 라인 수 |
|------|---------|
| `stores/consensusStore.ts` | 423 |
| `SourceCodeViewer.tsx` | 373 |
| `PaginationControls.tsx` | 356 |
| `FeeEfficiencyAnalyzer.tsx` | 353 |
| `ContractReader.tsx` | 352 |
| `TransactionSimulator.tsx` | 336 |

### 4.3 Magic Numbers

- `graphql-transforms.ts`, `cache.ts`, `rate-limit.ts`에서 상수 없이 직접 숫자 사용
- 캐시 TTL, 배치 크기, 타임아웃 값 등

### 4.4 Cleanup Interval 누수

- `cache.ts`, `rate-limit.ts`: `setInterval` 사용 후 모듈 언로드 시 정리 로직 부재
- 싱글톤 패턴 없이 여러 인스턴스 생성 가능

---

## 5. 성능 최적화

### 5.1 React.memo 사용 부족

| 지표 | 값 |
|------|-----|
| 전체 TSX 파일 | 150개 |
| React.memo 사용 | 2개 (1.3%) |
| useMemo/useCallback 사용 | 31개 (20.7%) |

테이블 행, 대시보드 카드, 리스트 아이템에서 불필요한 리렌더 다수 발생.

### 5.2 O(n²) 통계 계산

**파일**: `stores/consensusStore.ts`

`computeStats()`, `computeNetworkHealth()`가 블록 도착마다 전체 데이터 재계산.

### 5.3 Apollo Cache 정책 비일관

- 일부 쿼리: `cache-and-network`, 일부: `network-only`
- 일관된 전략 없이 혼용 → 불필요한 네트워크 요청 또는 stale 데이터

### 5.4 Over-fetching

- 필터링된 트랜잭션 쿼리에서 전체 필드 조회 후 클라이언트 필터링

### 5.5 Zustand 셀렉터 비일관

- 개별 셀렉터 다수 사용 → `useShallow` 미사용 → 불필요 리렌더

---

## 6. 추가 이슈

### 6.1 Rate Limiter 비원자적 증가

**파일**: `lib/api/rate-limit.ts`

`state.count++` → `store.set()` 비원자적. concurrent request 시 rate limit 우회 가능.

### 6.2 WebSocket 훅 메모리 누수 위험

**파일**: `lib/hooks/useRealtimeTransactions.ts`

`useRef` 콜백 패턴에서 subscription cleanup 누락 시 이전 콜백 참조 유지.

### 6.3 접근성 (Accessibility)

- 일부 form input에 aria-label 누락
- 시맨틱 HTML (article, section, nav) 미사용
- heading 계층 불일관

---

## 7. 긍정적 평가

| 항목 | 평가 |
|------|------|
| TypeScript Strict Mode | 전체 활성화, any 최소 |
| 에러 클래스 계층구조 | AppError 기반 우수 |
| Dynamic Import | 페이지별 코드 스플리팅 적절 |
| 환경 변수 검증 | env 검증 로직 존재 |
| 디렉토리 구조 | 기능별 분리 명확, 확장 용이 |
| GraphQL 훅 | 24개 커스텀 훅으로 데이터 계층 추상화 |
| Error Boundary | 에러 경계 컴포넌트 구현 |
| WebSocket 실시간 | Subscription 기반 아키텍처 |
| Zustand 스토어 | 중복 방지, 메모리 바운딩, 순수 함수 계산 |
| 테스트 | Vitest 300+ 통과 |

---

## 8. 우선순위별 개선 로드맵

### P0 — Critical (1주 이내)

1. `graphql-transforms.ts` unsafe fallback → `null` 반환 또는 Optional 타입
2. `cache.ts` 타입 단언 → 런타임 검증 추가
3. `logger.ts` race condition → flushing 플래그 동기화
4. Apollo cache eviction 정책 추가 (maxSize)

### P1 — High (2주 이내)

5. `useRealtimeTransactions` subscription cleanup 강화
6. `consensusStore` 통계 계산 → 증분 계산 패턴
7. `usePagination` SRP 분리 (URL / 페이지네이션 / 스크롤)
8. `useERC20/721` 공통 팩토리 함수로 DRY 적용
9. `rate-limit.ts` 원자적 연산 + cleanup 개선

### P2 — Medium (4주 이내)

10. 핫 컴포넌트에 React.memo 적용
11. `ContractReader`, `SourceCodeViewer` 서브 컴포넌트 분리
12. `AddressTransactionsSection` props 인터페이스 분리 (ISP)
13. Magic numbers → named constants 추출
14. Apollo fetchPolicy 전략 통일

### P3 — Low (백로그)

15. `cache.ts`, `rate-limit.ts` 싱글톤 패턴 + interval cleanup
16. React.memo 적용 확대 (1.3% → 20%+ 목표)
17. 접근성 개선 (aria-label, 시맨틱 HTML)
18. GraphQL over-fetching → 서버사이드 필터링

---

## 9. 코드 품질 점수

**종합: 7.5 / 10**

| 영역 | 점수 | 비고 |
|------|------|------|
| 구조/아키텍처 | 8.5 | 기능별 분리 우수, 모듈 구조 명확 |
| 타입 안전성 | 8.0 | Strict Mode, 일부 unsafe assertion 존재 |
| 에러 처리 | 7.5 | 계층적 에러 클래스, race condition 존재 |
| 성능 최적화 | 6.5 | React.memo 부족, O(n²) 계산, 캐시 무한 증가 |
| SOLID 준수 | 7.0 | SRP/ISP 위반 일부 존재 |
| Clean Code | 7.0 | DRY 위반, 대형 파일, magic numbers |
| 접근성 | 6.0 | 기본 구현됨, 포괄적 검증 필요 |
| 테스트 커버리지 | 7.5 | 단위 테스트 충분, E2E 미작성 |

---

*이 문서는 4개 병렬 분석 에이전트(구조, 훅/데이터, 컴포넌트, 유틸/설정)의 결과를 종합한 것입니다.*
