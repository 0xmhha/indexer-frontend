# Project Status

> **Last Updated**: 2026-02-14
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
| 컨트랙트 조회 | `/contract` | 소스코드, Read/Write 함수 호출 |
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

### 지갑 연결 (wagmi/viem)

| 기능 | 비고 |
|------|------|
| MetaMask 연결 | injected connector |
| 체인 자동 전환 | 네트워크 선택기 ↔ 지갑 동기화 |
| 자동 재연결 | 세션 간 연결 유지 |
| ContractWriter | wagmi writeContract + viem 유틸리티 |
| WalletButton | Header에 통합, 주소 축약 표시 |

### 실시간 기능 (WebSocket)

| 기능 | 비고 |
|------|------|
| 새 블록 구독 | GraphQL Subscriptions + replayLast |
| 새 트랜잭션 구독 | 실시간 피드 |
| 펜딩 트랜잭션 | 멤풀 모니터링 |
| 로그 구독 | 이벤트 필터링 |
| 라이브 인디케이터 | Exponential backoff + jitter 재연결 |

### 통계 및 분석

| 기능 | 비고 |
|------|------|
| 네트워크 통계 | `/stats` — 블록/트랜잭션 카운트 |
| 가스 도구 | `/gas` — 가스 차트, 시뮬레이터, Fee 분석 |
| 마이너/검증자 순위 | Top miners |
| Fee Delegation 분석 | 채택률, 절감액 통계 |

### 인프라 및 품질

| 영역 | 상태 |
|------|------|
| 구현 페이지 | 21개 (SEO, 404 포함) |
| 컴포넌트 | 154개 |
| 커스텀 Hooks | 70개 |
| GraphQL | 35개 쿼리/구독 |
| 테스트 | 47 파일, **1,337 테스트** (Vitest) |
| 에러 바운더리 | 21개 (모든 라우트) |
| TypeScript | Strict Mode, **0 에러** |
| ESLint | **0 에러, 0 워닝** |
| 에러 처리 | AppError, Recovery (withRetry, CircuitBreaker) |
| 상태 관리 | Apollo Cache + Zustand + Context |
| 지갑 연결 | wagmi v3 + viem v2 (ethers 제거) |

---

## 2. 필수 남은 작업

### WCAG 2.1 AA 접근성

**상태**: 주요 수정 완료

완료:
- 터치 타겟 크기 44px 이상 적용
- 차트 텍스트 대비 개선 (opacity 0.7→0.9)
- 폼 라벨 htmlFor/id 연결
- 범위 입력 aria-label 추가
- 시맨틱 HTML, ARIA live regions, skip-to-content, focus-visible

남은 작업:
- 스크린 리더 실제 테스트 (VoiceOver)
- text-muted / text-secondary 색상 대비 실측 검증

### E2E 테스트

**상태**: 10개 파일 작성 완료 (Playwright)

남은 작업:
- 실제 백엔드 연결 후 E2E 테스트 실행 및 통과 확인
- CI/CD 파이프라인에 E2E 테스트 통합

### WalletConnect 멀티월렛

**상태**: wagmi 설정 완료, projectId 미등록

남은 작업:
- WalletConnect Cloud에서 projectId 발급
- `walletConnect` connector 활성화

---

## 3. 미구현 / 계획 기능 (Etherscan 비교)

### Phase 1: 핵심 UX 개선

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| 검색 자동완성 | 중 | 실시간 결과, 타입별 아이콘 |
| Gas Tracker 개선 | 중 | Low/Avg/High, Guzzlers |

### Phase 2: 토큰 기능

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| Token Tracker 페이지 | 상 | ERC-20/721/1155 목록, 홀더 수 |
| Token Holders 분석 | 중 | Top 홀더, 분포 차트 |
| NFT Gallery | 중 | 이미지 갤러리, 메타데이터 |
| Token Approvals | 중 | 승인 목록, Unlimited 경고 |

### Phase 3: 컨트랙트 기능

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| Contract Verification UI | 상 | 웹 업로드, 컴파일러 선택 |
| Proxy Contract 감지 | 중 | 자동 감지, Implementation 로드 |

### Phase 4: 사용자 기능 (Backend 필요)

| 기능 | 난이도 | 비고 |
|------|:------:|------|
| 계정 시스템 | 상 | 회원가입/로그인, API Key 관리 |
| Watch List | 중 | 주소 모니터링 |
| 이메일 알림 | 상 | TX/토큰/이벤트 알림 |

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
| **WBFT 컨센서스** | 검증자 참여율, 에포크, 포크 감지 |
| **Fee Delegation** | 수수료 대납 TX, 채택률 분석 — StableNet 고유 |
| **EIP-7702 SetCode** | Authorization List, 서명 데이터 표시 |
| **멀티 네트워크** | 단일 앱에서 동적 전환, 커스텀 네트워크 추가 |
| **시스템 컨트랙트** | 거버넌스, Mint/Burn, Token Supply 추적 |
| **wagmi/viem 지갑** | 네트워크 ↔ 지갑 체인 자동 동기화 |

---

## 5. 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (Strict Mode) |
| Data | Apollo Client 3 (GraphQL + WebSocket) |
| Wallet | wagmi v3 + viem v2 |
| Styling | Tailwind CSS 3 + Radix UI |
| State | Apollo Cache + Zustand + React Context |
| Charts | Recharts |
| Testing | Vitest (unit) + Playwright (E2E) |
| Quality | ESLint 9 |
| Icons | Lucide Icons |
