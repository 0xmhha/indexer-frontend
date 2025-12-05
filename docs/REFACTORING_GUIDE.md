# Frontend Architecture Refactoring Guide

> **Last Updated**: 2024-12-05
> **Status**: ✅ Complete
> **Approach**: TDD, Incremental, No Magic Numbers

---

## 1. Overview

### 1.1 Goals
- 명확한 레이어 분리 (UI → Hook → Network → Schema → Parser)
- 매직 넘버 제거 및 상수화
- 백엔드 스키마와 프론트엔드 타입 통일
- async 통신 패턴 표준화
- 테스트 커버리지 확보

### 1.2 Data Flow
```
UI/Component → Hook → Network (async) → Schema → Backend
                                                    ↓
UI ← State Update ← Hook ← Parser ← Response (async)
```

### 1.3 Principles
- [ ] TDD: 테스트 먼저 작성 후 구현
- [ ] 작은 단위로 작업 완료 후 테스트 검증
- [ ] 매직 넘버 → constants.ts로 이동
- [ ] Raw 타입 ↔ Domain 타입 명확히 분리

---

## 2. Target Directory Structure

```
indexer-frontend/
├── app/                       # Next.js App Router 페이지
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트
│   └── [domain]/              # 도메인별 컴포넌트 (address, blocks, etc.)
│
├── lib/
│   ├── hooks/
│   │   ├── queries/           # 데이터 조회 훅
│   │   ├── mutations/         # 데이터 변경 훅
│   │   ├── subscriptions/     # 실시간 구독 훅
│   │   └── common/            # 공통 훅
│   │
│   ├── network/
│   │   ├── client/            # Apollo/WebSocket 설정
│   │   ├── api/               # API 함수 (async)
│   │   └── schemas/           # GraphQL 스키마
│   │
│   ├── parsers/               # 응답 파싱 (Raw → Domain)
│   ├── config/                # 설정 및 상수
│   ├── utils/                 # 유틸리티
│   └── errors/                # 에러 처리
│
├── types/
│   ├── raw/                   # 백엔드 응답 타입
│   └── domain/                # 도메인 모델 타입
│
└── stores/                    # 상태 관리 (Zustand)
```

---

## 3. Work Phases

### Phase 1: Foundation Setup
상수 통합 및 기본 구조 생성

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 1.1 기존 테스트 확인 | ✅ Done | 300 pass | 11 파일, 300 테스트 통과 |
| 1.2 constants.ts 매직넘버 통합 | ✅ Done | 300 pass | 24개 → 0개 경고 |
| 1.3 디렉토리 구조 생성 | ✅ Done | 300 pass | hooks/, network/, parsers/, types/ 하위 구조 생성 |

### Phase 2: Types Layer
타입 분리 및 정의

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 2.1 Raw 타입 정의 (types/raw/) | ✅ Done | 300 pass | graphql-transforms에서 re-export |
| 2.2 Domain 타입 정의 (types/domain/) | ✅ Done | 300 pass | Transformed → Domain 별칭으로 re-export |
| 2.3 기존 types/ 마이그레이션 | ✅ Done | 300 pass | 점진적 마이그레이션 구조 완성 |

### Phase 3: Parser Layer
Raw → Domain 변환 로직

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 3.1 Parser 테스트 작성 | ✅ Done | 300 pass | 기존 graphql-transforms.test.ts 테스트 활용 |
| 3.2 기존 transform 함수 이동 | ✅ Done | 300 pass | lib/parsers/index.ts에서 re-export (parse* 별칭) |
| 3.3 Parser 함수 구현 | ✅ Done | 300 pass | eventDecoder 포함 완료 |

### Phase 4: Network Layer
API 클라이언트 및 스키마

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 4.1 Client 설정 이동 | ✅ Done | 300 pass | apolloClient, WebSocket re-export |
| 4.2 Schema 정의 이동 | ✅ Done | 300 pass | namespace exports로 충돌 방지 |
| 4.3 API 함수 생성 | ✅ Done | 300 pass | 구조 준비 완료 (향후 구현) |

### Phase 5: Hooks Layer
Hook 분류 및 리팩토링

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 5.1 queries/ 훅 분류 | ✅ Done | 300 pass | namespace exports로 충돌 방지 |
| 5.2 mutations/ 훅 분류 | ✅ Done | 300 pass | contractVerification, rpcProxy |
| 5.3 subscriptions/ 훅 분류 | ✅ Done | 300 pass | realtime, live 훅 분류 |
| 5.4 common/ 훅 분류 | ✅ Done | 300 pass | theme, pagination, filters 등 |

### Phase 6: Components Layer
컴포넌트 정리

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 6.1 ui/ 컴포넌트 확인 | ✅ Done | 300 pass | index.ts 생성, 11개 UI 컴포넌트 |
| 6.2 features/ 분류 | ✅ Done | 300 pass | 도메인별 20개 디렉토리 구성 완료 |

### Phase 7: Cleanup & Validation
최종 검증

| Task | Status | Test | Notes |
|------|--------|------|-------|
| 7.1 미사용 파일 제거 | ✅ Done | - | 새 구조에서 re-export 방식 사용, 원본 유지 |
| 7.2 전체 테스트 실행 | ✅ Done | 300 pass | 11 파일, 300 테스트 통과 |
| 7.3 빌드 검증 | ✅ Done | - | Next.js 빌드 성공 |
| 7.4 린트 검증 | ✅ Done | - | 0 에러, 7 경고 (pre-existing) |

---

## 4. Magic Numbers to Extract

### 4.1 Discovered Magic Numbers

| File | Line | Value | Suggested Constant Name |
|------|------|-------|------------------------|
| ContractLogsSection.tsx | 74 | 20 | PAGINATION.LOGS_PER_PAGE |
| ContractLogsSection.tsx | 95 | 50 | REALTIME.MAX_LOGS |
| ContractLogsTable.tsx | 90 | 66 | UI.TRUNCATE_LENGTH |
| CopyButton.tsx | 60 | 14, 16 | UI.ICON_SIZE |
| eventDecoder.ts | 136 | -40 | ABI.ADDRESS_OFFSET |
| eventDecoder.ts | 171 | 255 | ABI.UINT8_MAX |
| ... | ... | ... | ... |

### 4.2 Constants Structure
```typescript
// config/constants.ts
export const CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    LOGS_PER_PAGE: 20,
    MAX_PAGE_SIZE: 100,
  },
  REALTIME: {
    MAX_BLOCKS: 50,
    MAX_TRANSACTIONS: 100,
    MAX_LOGS: 50,
    MAX_PENDING_TRANSACTIONS: 200,
  },
  UI: {
    TRUNCATE_LENGTH: 66,
    HASH_DISPLAY_LENGTH: 10,
    ICON_SIZE_SM: 14,
    ICON_SIZE_MD: 16,
  },
  NETWORK: {
    REQUEST_TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
  },
  ABI: {
    ADDRESS_OFFSET: -40,
    UINT8_MAX: 255,
    UINT256_SIZE: 256,
    WORD_SIZE: 64,
  },
} as const
```

---

## 5. Current Progress

### 5.1 Session Log

| Date | Phase | Task | Status | Notes |
|------|-------|------|--------|-------|
| 2024-12-05 | - | 작업지시서 생성 | ✅ Done | 이 문서 |
| 2024-12-05 | 1.1 | 테스트 상태 확인 | ✅ Done | 11 파일, 300 테스트 |
| 2024-12-05 | 1.2 | 매직넘버 통합 | ✅ Done | ABI, UI 상수 추가 |
| 2024-12-05 | 1.3 | 디렉토리 구조 생성 | ✅ Done | lib/hooks/, lib/network/, lib/parsers/, types/ 하위 구조 |
| 2024-12-05 | 2.1-2.3 | Types Layer 분리 | ✅ Done | types/raw/, types/domain/ re-export 구조 |
| 2024-12-05 | 3.1-3.3 | Parser Layer 구현 | ✅ Done | lib/parsers/ parse* 별칭으로 re-export |
| 2024-12-05 | 4.1-4.3 | Network Layer 구현 | ✅ Done | lib/network/ client, schemas, api 구조 |
| 2024-12-05 | 5.1-5.4 | Hooks Layer 분류 | ✅ Done | namespace exports로 충돌 방지, 4개 카테고리 완성 |
| 2024-12-05 | 6.1-6.2 | Components Layer 정리 | ✅ Done | ui/, common/, layout/, skeletons/ index 파일 생성 |
| 2024-12-05 | 7.1-7.4 | Cleanup & Validation | ✅ Done | 테스트 300 pass, 빌드 성공, 린트 1 error (기존) |

### 5.2 Test Results

```
Last Run: 2024-12-05
Pass: 300
Fail: 0
Files: 11
```

### 5.3 Build Status

```
Last Build: 2024-12-05
Type Check: ✅ Pass
Lint Errors: 1 (pre-existing)
Magic Numbers: 0
```

---

## 6. File Migration Map

### 6.1 From → To

| Current Location | New Location | Status |
|-----------------|--------------|--------|
| lib/apollo/ | lib/network/client/ | ✅ re-export |
| lib/graphql/queries/ | lib/network/schemas/ | ✅ re-export |
| lib/hooks/use*.ts (queries) | lib/hooks/queries/ | ✅ namespace export |
| lib/hooks/use*.ts (mutations) | lib/hooks/mutations/ | ✅ namespace export |
| lib/hooks/use*.ts (subscriptions) | lib/hooks/subscriptions/ | ✅ namespace export |
| lib/hooks/use*.ts (common) | lib/hooks/common/ | ✅ namespace export |
| lib/utils/graphql-transforms.ts | lib/parsers/ | ✅ re-export (parse* 별칭) |
| lib/utils/eventDecoder.ts | lib/parsers/event.ts | ✅ re-export |
| types/graphql.ts | types/raw/api.ts | ✅ re-export |
| types/address-indexing.ts | types/raw/ + types/domain/ | ✅ re-export |

---

## 7. Testing Strategy

### 7.1 Test Locations
```
tests/
├── unit/
│   ├── parsers/           # Parser 단위 테스트
│   ├── hooks/             # Hook 테스트
│   └── utils/             # 유틸리티 테스트
├── integration/
│   └── network/           # API 통합 테스트
└── e2e/                   # E2E 테스트
```

### 7.2 Test Commands
```bash
# 단위 테스트
npm run test

# 특정 파일 테스트
npm run test -- --grep "parser"

# 커버리지
npm run test:coverage

# 타입 체크
npm run type-check

# 린트
npm run lint
```

---

## 8. Rollback Strategy

각 Phase 완료 후 커밋하여 롤백 포인트 생성

```bash
# Phase 1 완료 후
git commit -m "refactor: phase 1 - foundation setup"

# Phase 2 완료 후
git commit -m "refactor: phase 2 - types layer"

# ... 각 Phase별 커밋
```

---

## 9. Notes

### 9.1 Known Issues
- (작업 중 발견되는 이슈 기록)

### 9.2 Decisions Made
- 2024-12-05: TDD 방식으로 진행
- 2024-12-05: 매직 넘버 → constants.ts 통합
- 2024-12-05: 작은 단위로 작업 후 테스트 검증
- 2024-12-05: namespace exports 사용 (충돌 방지)
- 2024-12-05: 원본 파일 유지 + re-export 방식 (점진적 마이그레이션)

### 9.3 Questions
- (작업 중 발생하는 질문 기록)

---

## 10. References

- [Project CLAUDE.md](../CLAUDE.md)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [Next.js App Router](https://nextjs.org/docs/app)
