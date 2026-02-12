# Project Status

> **Last Updated**: 2025-02-13
> **Repository**: indexer-frontend (StableNet Block Explorer)

---

## 1. 구현 완료 기능

### 핵심 탐색기 (Core Explorer)

| 기능 | 페이지/컴포넌트 | 비고 |
|------|-----------------|------|
| 블록 목록 | `/blocks` | 페이지네이션, 실시간 업데이트 |
| 블록 상세 | `/block/[numberOrHash]` | 가스 통계, 트랜잭션 목록 |
| 트랜잭션 목록 | `/txs` | 필터링, 정렬 |
| 트랜잭션 상세 | `/tx/[hash]` | Receipt, Internal Calls, Logs, InputDataViewer |
| 주소 페이지 | `/address/[address]` | 잔액, 트랜잭션, ERC20/721, 내부TX |
| 컨트랙트 조회 | `/contract` | 소스코드, Read 함수 호출 |
| 검색 | `/search` | 주소/해시/블록번호 감지, 히스토리 |
| Home (Dashboard) | `/` | 네트워크 개요, 최근 블록/TX |

### StableNet 특화 기능

| 기능 | 페이지 | 비고 |
|------|--------|------|
| Fee Delegation | 대시보드 내 | 수수료 대납 TX, 채택률, 절감액 |
| EIP-7702 SetCode | TX 상세 내 | Authorization List 표시 |
| WBFT 컨센서스 | `/wbft` | 참여율, 검증자 통계, 에포크 |
| 거버넌스 | `/governance` | 제안 조회, 투표 현황 |
| 시스템 컨트랙트 | `/system-contracts` | Wrapper, Governance 추적 |
| Validators | `/validators` | 검증자 목록, 상태 |
| 멀티 네트워크 | 전역 | 동적 네트워크 전환, 커스텀 추가 |

### 실시간 기능 (WebSocket)

| 기능 | 비고 |
|------|------|
| 새 블록 구독 | GraphQL Subscriptions + replayLast |
| 새 트랜잭션 구독 | 실시간 피드 |
| 펜딩 트랜잭션 | 멤풀 모니터링 |
| 로그 구독 | 이벤트 필터링 |
| 라이브 인디케이터 | 실시간 상태 표시, Exponential backoff 재연결 |

### 통계 및 분석

| 기능 | 비고 |
|------|------|
| 네트워크 통계 | `/stats` — 블록/트랜잭션 카운트 |
| 가스 도구 | `/gas` — 기본 가스 차트 |
| 마이너/검증자 순위 | Top miners |
| Fee Delegation 분석 | 채택률, 절감액 통계 |

### 인프라 및 품질

| 영역 | 상태 |
|------|------|
| 구현 페이지 | 19개 (SEO, 404 포함) |
| 컴포넌트 | 151개 |
| 커스텀 Hooks | 63개 |
| GraphQL Hooks | 24+ 쿼리/구독 |
| 테스트 | 28 파일, **666 테스트** (Vitest) |
| TypeScript | Strict Mode, **0 에러** |
| ESLint | **0 에러, 0 워닝** (복잡도 규칙 포함) |
| 에러 처리 | AppError, Recovery (withRetry, CircuitBreaker) |
| 코드 품질 | SOLID 분석기, Clean Code 메트릭, A-F 등급 |
| 상태 관리 | Apollo Cache + Zustand + Context |
| 번들 | First Load JS: 87.7 kB, 최대 249 kB |

---

## 2. 필수 남은 작업

### E2E 테스트 (우선순위: 높음)

**상태**: Playwright 설정 완료, 테스트 케이스 미작성

필요 파일:
```
tests/e2e/
├── block-detail.spec.ts
├── transaction-detail.spec.ts
├── address-page.spec.ts
├── search.spec.ts
└── realtime-updates.spec.ts
```

핵심 시나리오:
- 블록/트랜잭션 상세 페이지 렌더링 및 네비게이션
- 주소 페이지 트랜잭션 목록 및 필터링
- 검색 (블록 번호, 해시, 주소)
- WebSocket 실시간 블록 업데이트

### WCAG 2.1 AA 접근성 (우선순위: 높음)

**상태**: 기본 시맨틱 HTML/ARIA 구현, 포괄적 검증 미완료

필요 작업:
- 색상 대비 비율 검증 (텍스트 4.5:1, 대형 3:1)
- 스크린 리더 테스트 (VoiceOver)
- 터치 타겟 크기 검증 (최소 44x44px)
- 키보드 네비게이션 전체 테스트
- 포커스 관리 검증

### Contract Verification 실제 API 연동 (우선순위: 중간)

**상태**: Mock 데이터 사용 중 → 백엔드 API 완료됨

필요 작업:
- `GET_CONTRACT_VERIFICATION` 쿼리 사용으로 변경
- Mock 로직 제거, 로딩/에러 처리

---

## 3. 미구현 / 계획 기능 (Etherscan 비교)

### Phase 1: 핵심 UX 개선

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| 검색 자동완성 | 중 | 실시간 결과, 타입별 아이콘, 키보드 네비 |
| Gas Tracker 개선 | 중 | 실시간 Low/Avg/High, 히스토리 차트, Guzzlers |

### Phase 2: 토큰 기능

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| Token Tracker 페이지 | 상 | ERC-20/721/1155 목록, 홀더 수, 전송 횟수 |
| Token Holders 분석 | 중 | Top 홀더, 분포 차트, 고래 추적 |
| NFT Gallery | 중 | 이미지 갤러리, 메타데이터, 소유권 이력 |
| Token Approvals | 중 | 승인 목록, Unlimited 경고 |

### Phase 3: 컨트랙트 기능

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| 지갑 연결 (Web3) | 상 | MetaMask, WalletConnect (wagmi/viem) |
| Write Contract | 상 | ABI 기반 함수, 가스 예측, TX 서명 |
| Contract Verification UI | 상 | 웹 업로드, 컴파일러 선택, Multi-file |
| Proxy Contract 감지 | 중 | 자동 감지, Implementation 로드 |

### Phase 4: 사용자 기능 (Backend 필요)

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| 계정 시스템 | 상 | 회원가입/로그인, API Key 관리 |
| Watch List | 중 | 주소 모니터링 |
| 이메일 알림 | 상 | TX/토큰/가격/이벤트 알림 |
| Address Notes | 하 | 개인 메모, 태깅 |

### Phase 5: 분석 도구

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| Gas Guzzlers/Spenders | 중 | Top 가스 소비 컨트랙트/주소 |
| Top Accounts | 중 | 상위 계정 순위 |
| Advanced Charts | 중 | 다양한 분석 차트 |

---

## 4. Etherscan 대비 우수 기능

| 기능 | 설명 |
|------|------|
| **실시간 WebSocket** | 네이티브 GraphQL Subscriptions (Etherscan은 폴링) |
| **WBFT 컨센서스** | 검증자 참여율, 에포크, 포크 감지 — Etherscan에 없음 |
| **Fee Delegation** | 수수료 대납 TX, 채택률 분석 — StableNet 고유 |
| **EIP-7702 SetCode** | Authorization List, 서명 데이터 표시 — 최신 EIP |
| **멀티 네트워크** | 단일 앱에서 동적 전환, 커스텀 네트워크 추가 |
| **시스템 컨트랙트** | 거버넌스, Mint/Burn, Token Supply 추적 |

---

## 5. 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (Strict Mode) |
| Data | Apollo Client 3 (GraphQL + WebSocket) |
| Styling | Tailwind CSS 3 + Radix UI |
| State | Apollo Cache + Zustand + React Context |
| Charts | Recharts |
| Testing | Vitest (unit) + Playwright (E2E) |
| Quality | ESLint 9 + SOLID Analyzer + Clean Code Metrics |
| Icons | Lucide Icons |

---

## 6. 명세 준수 현황

`FRONTEND_IMPLEMENTATION_PROMPT.md` 대비 구현율: **~95%**

| 영역 | 상태 | 비고 |
|------|:----:|------|
| 기술 스택 | ✅ | 모든 기술 스택 적용 |
| 디자인 시스템 | ✅ | Crystalline Infrastructure |
| 핵심 페이지 | ✅ | 10개 명세 + 9개 추가 |
| 컴포넌트 | ✅ | 151개 |
| 커스텀 훅 | ✅ | 63개 |
| GraphQL | ✅ | 24+ 쿼리/구독 |
| WebSocket | ✅ | 실시간 업데이트 |
| 에러 핸들링 | ✅ | AppError, Recovery, CircuitBreaker |
| TypeScript | ✅ | Strict 모든 옵션 활성화 |
| 코드 품질 | ✅ | SOLID, Clean Code, 666 테스트 |
| **E2E 테스트** | ⚠️ | 설정 완료, 케이스 미작성 |
| **접근성** | ⚠️ | 기본 구현, 포괄적 감사 미완료 |
