# Feature Analysis: Etherscan 비교 및 개선 로드맵

> **작성일**: 2024-01-30
> **목적**: 현재 프론트엔드와 Etherscan 비교 분석 및 기능 개선 로드맵 수립

---

## 목차

1. [현재 구현 현황](#1-현재-구현-현황)
2. [Etherscan 대비 부족한 기능](#2-etherscan-대비-부족한-기능)
3. [Etherscan보다 우수한 기능](#3-etherscan보다-우수한-기능)
4. [기능 개선 로드맵](#4-기능-개선-로드맵)
5. [세부 기능 명세](#5-세부-기능-명세)

---

## 1. 현재 구현 현황

### 1.1 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS + Custom Design System |
| Data Fetching | Apollo Client (GraphQL + WebSocket) |
| State Management | Zustand |
| Charts | Recharts |
| Testing | Vitest + Playwright |

### 1.2 핵심 기능 구현 상태

#### 블록체인 탐색 (Core Explorer)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 블록 목록 | ✅ | 페이지네이션, 실시간 업데이트 |
| 블록 상세 | ✅ | 가스 통계, 트랜잭션 목록 |
| 트랜잭션 목록 | ✅ | 필터링, 정렬 |
| 트랜잭션 상세 | ✅ | Receipt, Internal Calls, Logs |
| 주소 페이지 | ✅ | 잔액, 트랜잭션 히스토리 |
| 컨트랙트 조회 | ✅ | 소스코드, Read 함수 호출 |
| 검색 | ✅ | 주소/해시/블록번호 감지 |

#### 실시간 기능 (Real-time)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 새 블록 구독 | ✅ | WebSocket + replayLast |
| 새 트랜잭션 구독 | ✅ | 실시간 피드 |
| 펜딩 트랜잭션 | ✅ | 멤풀 모니터링 |
| 로그 구독 | ✅ | 이벤트 필터링 |
| 라이브 인디케이터 | ✅ | 실시간 상태 표시 |

#### StableNet 특화 기능

| 기능 | 상태 | 설명 |
|------|:----:|------|
| Fee Delegation | ✅ | 수수료 대납 트랜잭션 지원 |
| EIP-7702 SetCode | ✅ | Authorization List 표시 |
| 컨센서스 모니터링 | ✅ | WBFT 참여율, 검증자 통계 |
| 에포크 모니터링 | ✅ | 검증자 교체 추적 |
| 시스템 컨트랙트 | ✅ | Wrapper, Governance 추적 |
| 거버넌스 | ✅ | 제안 조회, 투표 현황 |
| 멀티 네트워크 | ✅ | 동적 네트워크 전환 |

#### 통계 및 분석

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 네트워크 통계 | ✅ | 블록/트랜잭션 카운트 |
| 가스 트렌드 | ⚠️ | 기본 차트만 구현 |
| 마이너/검증자 순위 | ✅ | Top miners |
| Fee Delegation 분석 | ✅ | 채택률, 절감액 |

---

## 2. Etherscan 대비 부족한 기능

### 2.1 토큰 생태계

#### Token Tracker
```
현재 상태: 미구현
Etherscan 기능:
- ERC-20 토큰 전체 목록 (시가총액/거래량 순위)
- ERC-721 NFT 컬렉션 목록
- ERC-1155 멀티토큰 목록
- 토큰별 홀더 수, 전송 횟수
- 토큰 가격 차트 (외부 API 연동)
```

#### Token Holders 분석
```
현재 상태: 미구현
Etherscan 기능:
- 상위 홀더 목록 (Top 100/1000)
- 홀더 분포 파이 차트
- 홀더 수 변화 추이
- 고래 추적 (Large Holders)
```

#### NFT Gallery
```
현재 상태: 미구현
Etherscan 기능:
- NFT 이미지 갤러리 뷰
- 메타데이터 표시
- 소유권 이력
- 거래 히스토리
```

#### Token Approvals
```
현재 상태: 미구현
Etherscan 기능:
- 지갑별 승인된 토큰 목록
- Unlimited Approval 경고
- 승인 취소 가이드
```

### 2.2 가스 분석 도구

#### Gas Tracker
```
현재 상태: 기본 차트만 구현
Etherscan 기능:
- 실시간 가스 가격 (Low/Average/High)
- 예상 확인 시간
- 가스 가격 히스토리 (7일/30일)
- 가스 Guzzlers (높은 가스 소비 컨트랙트)
- 가스 Spenders (많은 가스 지출 주소)
```

#### Gas Estimator
```
현재 상태: 미구현
Etherscan 기능:
- 트랜잭션 유형별 가스 예측
- 최적 가스 가격 추천
- 비용 계산기 (USD 환산)
```

### 2.3 컨트랙트 기능

#### Write Contract
```
현재 상태: Read만 구현
필요 기능:
- 지갑 연결 (MetaMask, WalletConnect)
- Write 함수 호출 UI
- 트랜잭션 서명 및 전송
- 트랜잭션 상태 추적
```

#### Proxy Contract
```
현재 상태: 미확인
Etherscan 기능:
- Proxy 패턴 자동 감지
- Implementation 컨트랙트 로드
- Read/Write as Proxy
```

#### Contract Verification
```
현재 상태: CLI 안내만 제공
Etherscan 기능:
- 웹 UI로 소스코드 업로드
- 컴파일러 버전 선택
- 최적화 설정
- 생성자 인자 입력
- Multi-file 지원
```

### 2.4 사용자 기능

#### 계정 시스템
```
현재 상태: 미구현
Etherscan 기능:
- 회원가입/로그인
- API Key 관리
- Watch List (주소 모니터링)
- Transaction Notes (개인 메모)
- Address Tags (주소 태깅)
- Favorites (즐겨찾기)
```

#### 알림 시스템
```
현재 상태: 미구현
Etherscan 기능:
- 이메일 알림 (트랜잭션, 토큰 전송)
- 가격 알림
- 컨트랙트 이벤트 알림
- Webhook 지원
```

#### 데이터 Export
```
현재 상태: 미구현
Etherscan 기능:
- CSV 다운로드 (트랜잭션, 토큰 전송)
- 세금 보고용 리포트
- API를 통한 대량 데이터 조회
```

### 2.5 검색 기능

#### 고급 검색
```
현재 상태: 기본 타입 감지만 구현
Etherscan 기능:
- 자동완성 (주소, 토큰, 컨트랙트)
- ENS 이름 검색
- 토큰 이름/심볼 검색
- 컨트랙트 이름 검색
- 부분 매칭
- 검색 히스토리
```

### 2.6 분석 도구

#### Advanced Analytics
```
현재 상태: 기본 통계만 구현
Etherscan 기능:
- DEX Tracker (탈중앙화 거래소)
- Yield Farms (수익률 팜)
- Label Cloud (주소 라벨링)
- Top Accounts (상위 계정)
- Charts & Stats (다양한 차트)
```

### 2.7 개발자 도구

#### Public API
```
현재 상태: GraphQL만 제공
Etherscan 기능:
- REST API
- 상세 API 문서
- Rate Limit 정책
- API Key 발급
```

#### Multichain API
```
현재 상태: 단일 체인만 지원
Etherscan 기능:
- 50+ EVM 체인 통합 API
- 단일 API Key로 멀티체인 쿼리
```

---

## 3. Etherscan보다 우수한 기능

### 3.1 실시간 데이터 (WebSocket)

```
장점:
- 네이티브 WebSocket 구독 (Etherscan은 폴링)
- replayLast로 연결 시 즉시 데이터 수신
- 펜딩 트랜잭션 실시간 피드
- 라이브 인디케이터로 상태 가시화

기술 구현:
- GraphQL Subscriptions
- Exponential backoff 재연결
- 10초 keepalive ping
```

### 3.2 컨센서스 모니터링

```
장점: Etherscan에 없는 고유 기능
구현 기능:
- WBFT 컨센서스 데이터 추적
- 검증자 서명 참여율
- 에포크 경계 모니터링
- 검증자 교체 추적
- 포크 감지 및 알림
- 컨센서스 오류 실시간 알림
```

### 3.3 Fee Delegation 지원

```
장점: StableNet 커스텀 트랜잭션 타입
구현 기능:
- 수수료 대납자 정보 표시
- Fee Payer Signatures 표시
- 채택률 분석 대시보드
- 절감액 통계
```

### 3.4 EIP-7702 SetCode 트랜잭션

```
장점: 최신 EIP 지원 (Etherscan 미지원)
구현 기능:
- Authorization List 표시
- Authority (서명자) → Delegate (대상) 관계
- 서명 데이터 (chainId, nonce, r, s)
```

### 3.5 멀티 네트워크 아키텍처

```
장점: 단일 앱에서 네트워크 전환
구현 기능:
- 동적 Apollo Client 관리
- 네트워크별 클라이언트 캐싱
- 커스텀 네트워크 추가
- 연결 상태 추적
- 네트워크 전환 시 상태 리셋
```

### 3.6 시스템 컨트랙트 모니터링

```
장점: 프라이빗 체인 거버넌스 추적
구현 기능:
- Native Coin Wrapper
- Governance Contract
- Mint/Burn 이벤트
- Token Supply 대시보드
- 제안 및 투표 현황
```

### 3.7 현대적 기술 스택

```
장점: 개발 생산성 및 유지보수성
- Next.js 14 App Router
- TypeScript Strict Mode
- GraphQL Code Generator
- Zustand 상태관리
- 80% 테스트 커버리지 목표
- 구조화된 에러 처리
```

---

## 4. 기능 개선 로드맵

### Phase 1: 핵심 UX 개선 (1-2주)

| 우선순위 | 기능 | 난이도 | 예상 공수 |
|:--------:|------|:------:|:---------:|
| P0 | 검색 자동완성 | 중 | 3일 |
| P0 | CSV Export (트랜잭션) | 하 | 2일 |
| P0 | Gas Tracker 개선 | 중 | 3일 |
| P1 | 모바일 테이블 UX | 하 | 2일 |

### Phase 2: 토큰 기능 (2-3주)

| 우선순위 | 기능 | 난이도 | 예상 공수 |
|:--------:|------|:------:|:---------:|
| P0 | Token Tracker 페이지 | 상 | 5일 |
| P1 | Token Holders 분석 | 중 | 3일 |
| P1 | NFT Gallery View | 중 | 3일 |
| P2 | Token Approvals 조회 | 중 | 2일 |

### Phase 3: 컨트랙트 기능 (2-3주)

| 우선순위 | 기능 | 난이도 | 예상 공수 |
|:--------:|------|:------:|:---------:|
| P0 | 지갑 연결 (Web3) | 상 | 4일 |
| P0 | Write Contract | 상 | 4일 |
| P1 | Contract Verification UI | 상 | 5일 |
| P2 | Proxy Contract 감지 | 중 | 3일 |

### Phase 4: 사용자 기능 (3-4주)

| 우선순위 | 기능 | 난이도 | 예상 공수 |
|:--------:|------|:------:|:---------:|
| P1 | 계정 시스템 (Backend 필요) | 상 | 10일 |
| P1 | Watch List | 중 | 3일 |
| P2 | 이메일 알림 (Backend 필요) | 상 | 5일 |
| P2 | Address Notes | 하 | 2일 |

### Phase 5: 분석 도구 (2-3주)

| 우선순위 | 기능 | 난이도 | 예상 공수 |
|:--------:|------|:------:|:---------:|
| P1 | Gas Guzzlers/Spenders | 중 | 3일 |
| P2 | DEX Tracker | 상 | 5일 |
| P2 | Top Accounts | 중 | 2일 |
| P2 | Advanced Charts | 중 | 3일 |

---

## 5. 세부 기능 명세

### 5.1 검색 자동완성

#### 요구사항
```yaml
기능:
  - 입력 시 실시간 검색 결과 표시
  - 타입별 아이콘 표시 (주소/트랜잭션/블록/토큰)
  - 최근 검색 히스토리
  - 키보드 네비게이션 (화살표, Enter)

검색 대상:
  - 주소 (0x...)
  - 트랜잭션 해시
  - 블록 번호
  - 토큰 이름/심볼 (Backend 지원 필요)
  - ENS 이름 (선택적)

UI/UX:
  - 디바운스 300ms
  - 최대 10개 결과 표시
  - 로딩 인디케이터
  - 결과 없음 메시지
```

#### 구현 방안
```typescript
// 컴포넌트 구조
components/
  search/
    SearchInput.tsx        // 입력 필드
    SearchDropdown.tsx     // 자동완성 드롭다운
    SearchResultItem.tsx   // 개별 결과 항목
    SearchHistory.tsx      // 최근 검색

// 훅
hooks/
  useSearchAutocomplete.ts // 검색 로직
  useSearchHistory.ts      // 히스토리 관리 (localStorage)

// GraphQL
queries/
  search.ts               // 검색 쿼리 (Backend 확장 필요)
```

### 5.2 CSV Export

#### 요구사항
```yaml
Export 대상:
  - 주소별 트랜잭션 목록
  - 주소별 토큰 전송 목록
  - 주소별 Internal Transactions

Export 필드:
  - Txn Hash
  - Block
  - Timestamp (UTC, Local)
  - From
  - To
  - Value
  - Gas Used
  - Gas Price
  - Fee
  - Status

제한사항:
  - 최대 10,000건
  - 날짜 범위 필터
```

#### 구현 방안
```typescript
// 유틸리티
lib/utils/
  csv-export.ts           // CSV 생성 로직

// 컴포넌트
components/common/
  ExportButton.tsx        // Export 버튼 (드롭다운)
  ExportModal.tsx         // 옵션 선택 모달

// 사용 예시
<ExportButton
  data={transactions}
  filename="transactions"
  columns={['hash', 'block', 'from', 'to', 'value']}
/>
```

### 5.3 Gas Tracker 개선

#### 요구사항
```yaml
실시간 가스 가격:
  - Low (느림): 30분 이내 확인
  - Average (보통): 3분 이내 확인
  - High (빠름): 30초 이내 확인
  - 각 옵션별 Gwei 표시

히스토리:
  - 24시간 차트
  - 7일 차트
  - 평균/최고/최저 표시

분석:
  - Gas Guzzlers (Top 10 컨트랙트)
  - Gas Spenders (Top 10 주소)
  - 시간대별 가스 패턴
```

#### 구현 방안
```typescript
// 컴포넌트
components/gas/
  GasTracker.tsx          // 메인 대시보드
  GasPriceCard.tsx        // 가격 카드 (Low/Avg/High)
  GasHistoryChart.tsx     // 히스토리 차트
  GasGuzzlers.tsx         // Top 가스 소비 컨트랙트
  GasSpenders.tsx         // Top 가스 지출 주소

// 훅
hooks/
  useGasPrice.ts          // 실시간 가스 가격
  useGasHistory.ts        // 가스 히스토리

// 페이지
app/gas/page.tsx          // 기존 페이지 확장
```

### 5.4 Token Tracker

#### 요구사항
```yaml
토큰 목록:
  - ERC-20 목록 (페이지네이션)
  - ERC-721 NFT 컬렉션
  - ERC-1155 멀티토큰

정렬 옵션:
  - 홀더 수
  - 전송 횟수
  - 생성일

토큰 상세:
  - 기본 정보 (name, symbol, decimals)
  - Total Supply
  - 홀더 목록
  - 전송 히스토리
  - 컨트랙트 정보
```

#### 구현 방안
```typescript
// 페이지
app/
  tokens/
    page.tsx              // 토큰 목록
    [address]/
      page.tsx            // 토큰 상세

// 컴포넌트
components/tokens/
  TokenList.tsx           // 토큰 목록 테이블
  TokenCard.tsx           // 토큰 카드
  TokenHolders.tsx        // 홀더 목록
  TokenTransfers.tsx      // 전송 히스토리
  TokenInfo.tsx           // 기본 정보

// GraphQL (Backend 확장 필요)
query GetTokens($type: TokenType, $limit: Int, $offset: Int) {
  tokens(type: $type, pagination: { limit: $limit, offset: $offset }) {
    nodes {
      address
      name
      symbol
      decimals
      totalSupply
      holderCount
      transferCount
    }
    totalCount
  }
}
```

### 5.5 Write Contract (지갑 연결)

#### 요구사항
```yaml
지갑 지원:
  - MetaMask
  - WalletConnect
  - Coinbase Wallet
  - 기타 EIP-1193 호환 지갑

기능:
  - 연결/해제
  - 네트워크 확인/전환
  - 주소 표시
  - 잔액 표시

Write Contract:
  - ABI 기반 함수 목록
  - 파라미터 입력 폼
  - 가스 예측
  - 트랜잭션 서명
  - 트랜잭션 상태 추적
```

#### 구현 방안
```typescript
// 의존성
"wagmi": "^2.x"
"viem": "^2.x"
"@rainbow-me/rainbowkit": "^2.x"  // 또는 직접 구현

// 프로바이더
providers/
  WalletProvider.tsx      // Wagmi 설정

// 컴포넌트
components/wallet/
  ConnectButton.tsx       // 연결 버튼
  AccountInfo.tsx         // 계정 정보
  NetworkSwitch.tsx       // 네트워크 전환

components/contract/
  ContractWrite.tsx       // Write 함수 목록
  FunctionForm.tsx        // 파라미터 입력
  TransactionStatus.tsx   // 트랜잭션 상태

// 훅
hooks/
  useWallet.ts            // 지갑 상태
  useContractWrite.ts     // 컨트랙트 호출
```

### 5.6 Contract Verification UI

#### 요구사항
```yaml
지원 컴파일러:
  - Solidity (0.4.x - 0.8.x)
  - Vyper

입력 필드:
  - 컨트랙트 주소
  - 컴파일러 버전 (드롭다운)
  - 최적화 여부 및 runs
  - EVM 버전
  - 라이선스 타입
  - 소스코드 (단일 파일 / Multi-file)
  - 생성자 인자 (ABI 인코딩)

검증 과정:
  1. 소스코드 업로드
  2. 컴파일 (서버사이드)
  3. 바이트코드 비교
  4. 결과 표시 (성공/실패)
```

#### 구현 방안
```typescript
// 페이지
app/
  verify/
    page.tsx              // 검증 폼
    [address]/
      page.tsx            // 특정 주소 검증

// 컴포넌트
components/contract/
  VerifyForm.tsx          // 메인 폼
  CompilerSelect.tsx      // 컴파일러 선택
  SourceUpload.tsx        // 소스 업로드
  ConstructorArgs.tsx     // 생성자 인자
  VerifyResult.tsx        // 검증 결과

// API (Backend 필요)
POST /api/verify
{
  address: string
  compilerVersion: string
  optimization: boolean
  runs: number
  sourceCode: string
  constructorArgs: string
}
```

---

## 부록: 참고 자료

### Etherscan 기능 목록
- [Etherscan 24 Features in 2024](https://info.etherscan.com/24-etherscan-features-in-2024/)
- [Etherscan API Documentation](https://docs.etherscan.io/)

### 기술 참고
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Viem](https://viem.sh/)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-01-30 | 1.0 | 초안 작성 |
