# Project Status

> **Last Updated**: 2026-02-12
> **Project**: indexer-frontend (StableNet Blockchain Explorer)
> **명세 준수율**: ~95%

---

## 1. 구현 완료 기능

### 핵심 탐색기 (Core Explorer) ✅

| 기능 | 페이지 | 설명 |
|------|--------|------|
| 블록 목록 | `/blocks` | 페이지네이션, 실시간 업데이트 |
| 블록 상세 | `/block/[numberOrHash]` | 가스 통계, 트랜잭션 목록 |
| 트랜잭션 목록 | `/txs` | 필터링, 정렬 |
| 트랜잭션 상세 | `/tx/[hash]` | Receipt, Internal Calls, Logs, InputData |
| 주소 페이지 | `/address/[address]` | 잔액, TX 히스토리, 내부 TX, ERC20/721 전송 |
| 컨트랙트 조회 | `/contract` | 소스코드, Read 함수 호출 |
| 검색 | `/search` | 주소/해시/블록번호 감지 |
| 통계 | `/stats` | 블록/트랜잭션 카운트, Top Miners |
| Gas Tools | `/gas` | Gas Calculator, Fee Delegation Dashboard |
| 설정 | `/settings` | 테마, 네트워크 관리 |
| 404 페이지 | `/_not-found` | 커스텀 에러 페이지 |
| SEO | `/robots.txt`, `/sitemap.xml` | 검색엔진 최적화 |

### StableNet 특화 기능 ✅

| 기능 | 페이지 | 설명 |
|------|--------|------|
| Fee Delegation | `/gas` | 수수료 대납 TX, 채택률, 절감액 분석 |
| EIP-7702 SetCode | TX 상세 | Authorization List 표시 |
| 컨센서스 모니터링 | `/wbft` | WBFT 참여율, 검증자 통계 |
| 에포크 모니터링 | `/validators` | 검증자 교체 추적 |
| 시스템 컨트랙트 | `/system-contracts` | Wrapper, Governance 추적 |
| 거버넌스 | `/governance` | 제안 조회, 투표 현황 |
| 멀티 네트워크 | Header | 동적 네트워크 전환 (Zustand 기반) |

### 실시간 기능 (WebSocket) ✅

- 새 블록 구독 (replayLast)
- 새 트랜잭션 구독
- 펜딩 트랜잭션 모니터링
- 로그 구독 (이벤트 필터링)
- 라이브 인디케이터

### 인프라 및 품질 ✅

| 항목 | 상태 | 세부 |
|------|------|------|
| 기술 스택 | ✅ | Next.js 14, React 18, TypeScript 5, Apollo Client 3 |
| UI/Styling | ✅ | Tailwind CSS, Radix UI, Lucide Icons, Recharts |
| 상태관리 | ✅ | Apollo Cache, Zustand, React Context, localStorage |
| 코드 품질 | ✅ | ESLint 복잡도 규칙, SOLID 분석기, 품질 점수 시스템 (A-F) |
| 단위 테스트 | ✅ | Vitest - 300+ 테스트 통과 |
| 에러 핸들링 | ✅ | AppError, Recovery, errorLogger |
| TypeScript Strict | ✅ | 모든 옵션 활성화 |
| GraphQL Hooks | ✅ | 24개 커스텀 훅 |
| 빌드 | ✅ | TypeScript, ESLint, 빌드 모두 통과 |

---

## 2. 진행 중 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| Contract Verification API | ⚠️ Mock 사용 중 | 백엔드 API 완료, Mock→실제 API 교체 필요 |
| 가스 트렌드 차트 | ⚠️ 기본만 구현 | 실시간 가격, 히스토리, Guzzlers/Spenders 미구현 |

---

## 3. 미구현/계획 기능 (Etherscan 대비)

### Phase 1: 핵심 UX 개선

| 기능 | 난이도 | 백엔드 의존 |
|------|--------|------------|
| 검색 자동완성 | 중 | 토큰 검색 시 필요 |
| CSV Export (트랜잭션) | 하 | ❌ |
| Gas Tracker 개선 (Low/Avg/High) | 중 | ❌ |
| 모바일 테이블 UX | 하 | ❌ |

### Phase 2: 토큰 기능

| 기능 | 난이도 | 백엔드 의존 |
|------|--------|------------|
| Token Tracker 페이지 (ERC-20/721/1155) | 상 | ✅ tokens 쿼리 필요 |
| Token Holders 분석 | 중 | ✅ |
| NFT Gallery View | 중 | ✅ |
| Token Approvals 조회 | 중 | ✅ |

### Phase 3: 컨트랙트 기능

| 기능 | 난이도 | 백엔드 의존 |
|------|--------|------------|
| 지갑 연결 (wagmi/viem) | 상 | ❌ |
| Write Contract | 상 | ❌ |
| Contract Verification UI | 상 | ✅ |
| Proxy Contract 감지 | 중 | ✅ |

### Phase 4: 사용자 기능

| 기능 | 난이도 | 백엔드 의존 |
|------|--------|------------|
| 계정 시스템 | 상 | ✅ |
| Watch List | 중 | ✅ |
| 이메일 알림 | 상 | ✅ |
| Address Notes | 하 | ❌ (localStorage) |

### Phase 5: 분석 도구

| 기능 | 난이도 | 백엔드 의존 |
|------|--------|------------|
| Gas Guzzlers/Spenders | 중 | ✅ |
| DEX Tracker | 상 | ✅ |
| Top Accounts | 중 | ✅ |
| Advanced Charts | 중 | 부분 |

---

## 4. 필수 남은 작업

### 4.1 E2E 테스트 작성 (우선순위: 높음) ❌

Playwright E2E 테스트 설정 완료. 실제 테스트 케이스 미작성.

**필요 테스트**:
```
tests/e2e/
├── block-detail.spec.ts
├── transaction-detail.spec.ts
├── address-page.spec.ts
├── search.spec.ts
└── realtime-updates.spec.ts
```

**시나리오**:
- [ ] 블록 상세 페이지 렌더링 및 네비게이션
- [ ] 트랜잭션 상세 페이지 렌더링 및 로그 표시
- [ ] 주소 페이지 트랜잭션 목록 및 필터링
- [ ] 검색 기능 (블록 번호, 해시, 주소)
- [ ] 실시간 블록 업데이트 (WebSocket)

### 4.2 WCAG 2.1 AA 접근성 감사 (우선순위: 높음) ⚠️

기본 시맨틱 HTML/ARIA 구현됨. 포괄적 검증 필요.

- [ ] 색상 대비 비율 검증 (텍스트: 4.5:1, 대형: 3:1)
- [ ] 스크린 리더 테스트 (NVDA, JAWS, VoiceOver)
- [ ] 터치 타겟 크기 검증 (최소 44x44px)
- [ ] 키보드 네비게이션 전체 테스트
- [ ] 포커스 관리 검증

**도구**: axe DevTools, Lighthouse, WAVE

### 4.3 에러 모니터링 서비스 통합 (우선순위: 중간) ❌

`errorLogger` 기본 구현 완료. 프로덕션 환경 서비스 통합 필요.

- [ ] Sentry SDK 설치 및 설정 (또는 커스텀 API 엔드포인트)
- [ ] `sendToMonitoring()` 구현
- [ ] 환경별 설정 (dev/staging/prod)
- [ ] Source maps 업로드 설정

### 4.4 Contract Verification Mock 교체 (우선순위: 중간) ⚠️

- [ ] `GET_CONTRACT_VERIFICATION` 쿼리 사용으로 변경
- [ ] Mock 로직 제거
- [ ] 로딩/에러 상태 처리

---

## 5. Etherscan 대비 우위 기능

| 기능 | 설명 |
|------|------|
| 실시간 WebSocket | 네이티브 GraphQL Subscriptions (Etherscan은 폴링) |
| 컨센서스 모니터링 | WBFT 고유 기능 - 검증자 서명/참여율 추적 |
| Fee Delegation | StableNet 커스텀 TX 타입 - 수수료 대납 분석 |
| EIP-7702 SetCode | 최신 EIP 지원 (Etherscan 미지원) |
| 멀티 네트워크 | 단일 앱에서 네트워크 동적 전환 |
| 시스템 컨트랙트 | 프라이빗 체인 거버넌스 추적 |
| 현대 기술 스택 | Next.js 14 App Router, TypeScript Strict, GraphQL Codegen |

---

## 6. 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (Strict Mode) |
| Data Fetching | Apollo Client 3.11 (GraphQL + WebSocket) |
| State | Zustand, Apollo Cache, React Context |
| Styling | Tailwind CSS 3.4, Radix UI |
| Charts | Recharts |
| Testing | Vitest (Unit), Playwright (E2E) |
| Quality | ESLint 9, SOLID Analyzer, Quality Scorer |

---

*통합 원본: todolist.md, FEATURE_ANALYSIS.md*
