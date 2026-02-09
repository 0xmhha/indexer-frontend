# Blockscout Frontend 참조 분석 및 개선 계획

> **작성일**: 2026-02-08
> **분석 대상**: Blockscout Frontend vs Indexer-Frontend (Stable-One Explorer)
> **목적**: 오픈소스 참조를 통한 기능 개선 및 신규 기능 도출
> **라이센스**: ⚠️ Blockscout는 GPL-v3 - 코드 복사 금지, 개념만 참조

---

## 목차

1. [라이센스 준수 가이드라인](#1-라이센스-준수-가이드라인)
2. [프로젝트 특성 및 적합성 분석](#2-프로젝트-특성-및-적합성-분석)
3. [기술 스택 비교](#3-기술-스택-비교)
4. [아키텍처 비교](#4-아키텍처-비교)
5. [기능 Gap 분석](#5-기능-gap-분석)
6. [상세 개선 항목](#6-상세-개선-항목)
7. [구현 우선순위 및 로드맵](#7-구현-우선순위-및-로드맵)
8. [네이밍 및 구현 가이드](#8-네이밍-및-구현-가이드)

---

## 1. 라이센스 준수 가이드라인

### 1.1 GPL-v3 라이센스 제약

Blockscout 프론트엔드는 **GPL-v3** 라이센스입니다. 이 라이센스는 파생 작업물에도 동일한 GPL 라이센스를 적용해야 하는 강력한 Copyleft 조항을 포함합니다.

**⚠️ 핵심 제약:**
- 코드를 직접 복사하면 전체 프로젝트가 GPL-v3를 따라야 함
- 함수, 클래스, 알고리즘 구조를 그대로 가져오면 파생물로 간주될 수 있음

### 1.2 안전한 참조 원칙

| ✅ 허용 | ❌ 금지 |
|---------|---------|
| 기능 개념/아이디어 참조 | 코드 직접 복사 |
| UI/UX 패턴에서 영감 | 함수/클래스 구조 복제 |
| 아키텍처 아이디어 | 변수명/함수명 그대로 사용 |
| 데이터 구조 개념 | 알고리즘 로직 그대로 복사 |
| 기능 목록 참조 | CSS/스타일 직접 복사 |

### 1.3 Clean Room 구현 원칙

```
1. 기능 명세 추출
   - Blockscout에서 "무엇을 하는지" 파악
   - "어떻게 하는지"는 독자적으로 설계

2. 독립적 구현
   - 완전히 다른 코드 구조 사용
   - 다른 라이브러리/패턴 선택
   - 고유한 네이밍 컨벤션 적용

3. 문서화
   - 참조한 개념과 독자 구현 부분 명확히 구분
   - 구현 결정 사항 기록
```

---

## 2. 프로젝트 특성 및 적합성 분석

### 2.1 Indexer-Frontend (Stable-One Explorer) 특성

| 특성 | 설명 |
|------|------|
| **블록체인** | Stable-One (EVM 호환 L1) |
| **합의 알고리즘** | WBFT (Weighted Byzantine Fault Tolerance) |
| **특수 기능** | Fee Delegation (Type 0x16), 거버넌스, Epoch 시스템 |
| **백엔드 통신** | GraphQL (Apollo Client) |
| **실시간 업데이트** | GraphQL Subscriptions + Zustand |

### 2.2 Blockscout 기능 적합성 매트릭스

#### ✅ 적합한 기능 (도입 권장)

| 기능 | 적합성 | 이유 |
|------|--------|------|
| Block 상세 정보 확장 | ✅ 높음 | 범용적 블록 데이터 |
| Transaction 상세 | ✅ 높음 | EVM 호환 트랜잭션 |
| State Changes 표시 | ✅ 높음 | 상태 변화 추적 필수 |
| Contract 읽기/쓰기 | ✅ 높음 | 스마트 컨트랙트 상호작용 |
| Proxy 패턴 감지 | ✅ 높음 | 프록시 컨트랙트 지원 |
| Gas Tracker | ✅ 높음 | 가스 비용 추적 필요 |
| Token 상세 | ✅ 높음 | ERC-20/721 지원 |
| Method Signature 해석 | ✅ 중간 | 함수 호출 가독성 |
| CSV Export | ✅ 중간 | 데이터 내보내기 |
| EIP-7702 지원 | ✅ 중간 | SetCode 트랜잭션 |
| EIP-4337 (AA) | ⚠️ 조건부 | 백엔드 지원 확인 필요 |

#### ❌ 부적합한 기능 (제외)

| 기능 | 적합성 | 이유 |
|------|--------|------|
| L2 Rollup (Arbitrum/Optimism) | ❌ 불필요 | Stable-One은 L1 |
| Deposits/Withdrawals | ❌ 불필요 | L2 브릿지 기능 |
| Output Roots | ❌ 불필요 | Rollup 전용 |
| Dispute Games | ❌ 불필요 | Optimistic Rollup 전용 |
| ENS 통합 | ❌ 불필요 | 자체 네임 서비스 없음 |
| Marketplace (dApp 목록) | ❌ 불필요 | 범위 외 |
| Celo/Zilliqa 특화 | ❌ 불필요 | 다른 체인 전용 |
| MUD Framework | ❌ 불필요 | 사용하지 않음 |
| ZetaChain CCTX | ❌ 불필요 | 크로스체인 불필요 |
| Beacon Chain 연동 | ❌ 불필요 | Ethereum 2.0 전용 |

### 2.3 현재 프로젝트 강점 (유지할 기능)

| 기능 | 설명 |
|------|------|
| **WBFT 합의 정보** | 블록 서명자, Preparer/Committer 표시 |
| **Fee Delegation** | Type 0x16 트랜잭션 지원 및 대시보드 |
| **거버넌스** | 제안/투표 시스템 |
| **Epoch 시스템** | 에폭 및 검증자 세트 변경 |
| **검증자 통계** | Diligence Score, 서명 통계 |
| **System Contracts** | 토큰 발행/소각 이벤트 |
| **GraphQL 타입 안전성** | 코드젠 기반 완벽한 타입 |
| **Zustand 실시간 상태** | 중앙화된 실시간 데이터 관리 |

---

## 3. 기술 스택 비교

### 3.1 핵심 프레임워크

| 영역 | Blockscout | Indexer-Frontend | 비고 |
|------|-----------|------------------|------|
| 프레임워크 | Next.js 15 (Pages Router) | Next.js 16 (App Router) | **우리가 최신** |
| React | 19.1.4 | 18.x | Blockscout 최신 |
| TypeScript | 5.9.2 | 5.x | 동등 |
| 라우팅 | Pages Router | App Router | **우리가 현대적** |

### 3.2 상태 관리 비교

| 영역 | Blockscout | Indexer-Frontend |
|------|-----------|------------------|
| 서버 상태 | TanStack Query (REST) | Apollo Client (GraphQL) |
| 클라이언트 상태 | React Context | Zustand |
| 캐싱 | TanStack Query Cache | Apollo InMemoryCache |
| 실시간 | Phoenix Socket → Query Cache | GraphQL-WS → Zustand |

**분석:**
- GraphQL은 타입 안전성과 단일 엔드포인트의 장점
- Zustand는 Context보다 성능과 DevTools 지원 우수
- **현재 스택 유지가 적절**

### 3.3 UI 및 디자인 시스템

| 영역 | Blockscout | Indexer-Frontend |
|------|-----------|------------------|
| 디자인 시스템 | Chakra UI 3.15.0 | Custom + Tailwind |
| 아이콘 | react-icons | Lucide React |
| 테이블 | 커스텀 구현 | react-window (가상화) |
| 차트 | D3.js | Recharts |

**분석:**
- Custom 컴포넌트는 Chakra보다 유연하지만 일관성 관리 필요
- react-window 가상화 테이블은 **성능 측면에서 우수**

### 3.4 실시간 통신

| 영역 | Blockscout | Indexer-Frontend |
|------|-----------|------------------|
| 프로토콜 | Phoenix WebSocket | GraphQL-WS |
| 채널 관리 | Channel Registry (다중) | 단일 구독자 + Zustand |
| 재연결 | Phoenix 내장 | 커스텀 구현 |

**분석:**
- Phoenix Socket의 Channel Registry 패턴은 참조할 가치 있음
- 현재 RealtimeProvider + Zustand 패턴도 효과적
- 다중 구독 시나리오에서 Registry 패턴 도입 고려

---

## 4. 아키텍처 비교

### 4.1 프로바이더 스택 비교

```
Blockscout:                          Indexer-Frontend:
┌─────────────────────┐              ┌─────────────────────┐
│ ChakraProvider      │              │ Providers           │
│ └─ RollbarProvider  │              │ └─ NetworkProvider  │
│    └─ ErrorBoundary │              │    └─ RealtimeProvider
│       └─ Web3Modal  │              │       └─ NotificationProvider
│          └─ AppCtx  │              │          └─ Layout  │
│             └─ Query│              └─────────────────────┘
│                └─ GrowthBook
│                   └─ Socket
│                      └─ ...
└─────────────────────┘
```

**분석:**
- Blockscout: 많은 레이어, 피처 플래그/보상/마켓플레이스 등 복잡
- Indexer-Frontend: 단순하고 명확한 구조
- **현재 구조 유지**, 필요시 ErrorBoundary/모니터링만 추가

### 4.2 데이터 플로우 비교

#### Blockscout: REST + Phoenix Socket

```
Component
  ├─► useApiQuery() ──► REST API ──► TanStack Cache
  └─► useSocketChannel() ──► Phoenix ──► queryClient.setQueryData()
```

#### Indexer-Frontend: GraphQL + Subscriptions

```
Component
  ├─► useQuery() ──► GraphQL API ──► Apollo Cache
  └─► useNewBlocks() ──► Zustand Store ◄── RealtimeProvider ◄── GraphQL-WS
```

**분석:**
- 두 접근법 모두 유효
- GraphQL은 타입 안전성 + 단일 엔드포인트 장점
- Zustand 중앙화 패턴으로 "maximum update depth" 문제 해결

### 4.3 디렉토리 구조 비교

| Blockscout | Indexer-Frontend | 비고 |
|-----------|------------------|------|
| `ui/` (66개 피처 폴더) | `components/` | 유사 |
| `ui/shared/entities/` | `components/common/` | **개선 기회** |
| `lib/socket/` | `stores/realtimeStore.ts` | 다른 접근 |
| `lib/errors/` (세분화) | `lib/errors/` (기본) | **개선 기회** |
| `pages/` (Pages Router) | `app/` (App Router) | 우리가 현대적 |

---

## 5. 기능 Gap 분석

### 5.1 Block 정보 Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| 기본 정보 (번호, 해시, 시간) | ✅ | ✅ | - |
| Gas 사용량/한도 | ✅ | ✅ | - |
| Miner/Validator 주소 | ✅ | ✅ | - |
| Blob Gas (EIP-4844) | ✅ | ✅ | - |
| **Block Reward 분석** | ✅ 상세 | ❌ 없음 | 🔴 |
| **Proposer 상세 (통계, 이력)** | ✅ 상세 | ⚠️ 기본 | 🟡 |
| Withdrawals 목록 | ✅ 목록 | ⚠️ 루트만 | 🟢 |
| Uncle Blocks | ✅ | ❌ | - (WBFT 불필요) |

**개선 항목:**
1. 🔴 Block Reward 분석 추가 (기본 보상 + 트랜잭션 수수료)
2. 🟡 Proposer 통계 확장 (총 생성 블록, 최근 활동)

### 5.2 Transaction 정보 Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| 기본 정보 | ✅ | ✅ | - |
| 상태 (Success/Failed) | ✅ | ✅ | - |
| Internal Transactions | ✅ | ✅ | - |
| Token Transfers | ✅ | ✅ | - |
| Logs/Events | ✅ | ✅ | - |
| Fee Delegation (Type 0x16) | ❌ | ✅ | **우리 강점** |
| **State Changes** | ✅ 상세 | ❌ 없음 | 🔴 |
| **Raw Trace** | ✅ 전체 | ⚠️ Internal만 | 🟡 |
| **Method Decoder** | ✅ 시그니처 DB | ⚠️ 기본 | 🟡 |
| Action 해석 (자연어) | ✅ | ❌ | 🟢 |
| **EIP-7702 Authorization** | ✅ | ⚠️ 백엔드 대기 | 🔴 |
| **EIP-4337 UserOps** | ✅ 상세 | ❌ 없음 | 🔴 |
| Blob Data (EIP-4844) | ✅ | ⚠️ 기본 | 🟡 |

**개선 항목:**
1. 🔴 **State Changes 탭 추가** - Storage/Balance 변경 추적
2. 🔴 **EIP-4337 UserOps 지원** - Account Abstraction
3. 🔴 **EIP-7702 완성** - Authorization List 표시
4. 🟡 Method Signature 데이터베이스 연동

### 5.3 Contract 정보 Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| 소스 코드 보기 | ✅ | ✅ | - |
| Read/Write 함수 | ✅ | ✅ | - |
| 검증 상태 | ✅ | ✅ | - |
| ABI 상호작용 | ✅ | ✅ | - |
| **Proxy 패턴 감지** | ✅ 상세 | ❌ 없음 | 🔴 |
| **Implementation 분리** | ✅ | ❌ 없음 | 🔴 |
| 생성자 인자 디코딩 | ✅ 상세 | ⚠️ 기본 | 🟡 |
| 바이트코드 비교 | ✅ | ❌ | 🟢 |
| 외부 라이브러리 | ✅ | ❌ | 🟢 |

**개선 항목:**
1. 🔴 **Proxy 패턴 감지** (EIP-1967, UUPS, Beacon)
2. 🔴 **Implementation 주소 자동 탐지 및 연결**
3. 🟡 생성자 인자 디코딩 개선

### 5.4 Address/Balance Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| 잔액 표시 | ✅ | ✅ | - |
| 토큰 목록 | ✅ | ✅ | - |
| NFT 목록 | ✅ | ✅ | - |
| 잔액 히스토리 | ✅ | ✅ | - |
| SetCode Delegation | ✅ | ✅ | - |
| 포트폴리오 비율 | ✅ | ❌ | 🟢 |
| 토큰 가치 (USD) | ✅ | ❌ | 🟢 (외부 API 필요) |
| 주소 라벨링 | ✅ Public Tags | ❌ | 🟢 |

### 5.5 Gas Tracker Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| **현재 Gas Price** | ✅ 실시간 | ⚠️ 계산기만 | 🔴 |
| **Safe/Standard/Fast** | ✅ | ❌ 없음 | 🔴 |
| **Gas Price 히스토리** | ✅ 차트 | ❌ 없음 | 🟡 |
| **네트워크 사용률** | ✅ | ❌ 없음 | 🟡 |
| 다음 블록 예측 | ✅ | ❌ | 🟢 |
| Fee Delegation 통계 | ❌ | ✅ | **우리 강점** |

**개선 항목:**
1. 🔴 **실시간 Gas Price 표시** (Safe/Standard/Fast)
2. 🟡 **Gas Price 히스토리 차트**
3. 🟡 네트워크 블록 사용률 표시

### 5.6 Advanced Features Gap

| 항목 | Blockscout | 현재 | Gap |
|------|-----------|------|-----|
| **EIP-4337 Account Abstraction** | | | |
| - UserOps 목록 | ✅ | ❌ | 🔴 |
| - UserOp 상세 | ✅ | ❌ | 🔴 |
| - Bundler 정보 | ✅ | ❌ | 🔴 |
| - Paymaster 추적 | ✅ | ❌ | 🔴 |
| **EIP-7702 SetCode** | | | |
| - Authorization List | ✅ | ⚠️ 백엔드 대기 | 🔴 |
| - Delegation 표시 | ✅ | ✅ | - |
| **CSV Export** | ✅ 다양 | ⚠️ 블록만 | 🟡 |
| **API 문서** | ✅ 상세 | ❌ 없음 | 🟢 |

---

## 6. 상세 개선 항목

### 6.1 🔴 P0: State Changes 탭 추가

**목표**: 트랜잭션으로 인한 상태 변경 시각화

**독자적 구현 설계**:

```typescript
// components/transactions/StateModificationViewer.tsx
// 완전히 새로운 네이밍과 구조

interface StorageModification {
  slotKey: string;           // Storage slot (hex)
  valueBefore: string;       // Previous value
  valueAfter: string;        // New value
  interpretation?: {         // 해석된 정보
    fieldName?: string;
    dataType?: string;
  };
}

interface AccountModification {
  accountAddress: string;
  accountType: 'eoa' | 'contract';
  accountLabel?: string;

  storageModifications: StorageModification[];
  balanceModification?: {
    before: bigint;
    after: bigint;
    difference: bigint;
  };
  nonceModification?: {
    before: number;
    after: number;
  };
}

interface TransactionStateResult {
  transactionHash: string;
  blockHeight: number;
  modifiedAccounts: AccountModification[];
}
```

**UI 레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│ State Modifications                                      │
├─────────────────────────────────────────────────────────┤
│ Summary: 3 accounts modified, 5 storage writes          │
│                                                         │
│ ▼ 0x1234...5678 (Contract: StableToken)                │
│   ├─ Balance: 100 → 95 STABLE (-5)                     │
│   ├─ Storage[0x01]: 0x00 → 0x64                        │
│   │   └─ totalSupply: 0 → 100                          │
│   └─ Storage[0x02]: 0x00 → 0x0a                        │
│       └─ balances[sender]: 0 → 10                      │
│                                                         │
│ ▼ 0xabcd...efgh (EOA)                                  │
│   ├─ Balance: 10 → 15 STABLE (+5)                      │
│   └─ Nonce: 5 → 6                                       │
└─────────────────────────────────────────────────────────┘
```

### 6.2 🔴 P0: Gas Price Tracker 구현

**목표**: 실시간 가스 가격 및 네트워크 상태 표시

**독자적 구현 설계**:

```typescript
// components/gas/NetworkGasMonitor.tsx
// Blockscout의 GasTracker와 완전히 다른 네이밍

interface GasPriceLevel {
  tier: 'economy' | 'standard' | 'priority';
  maxFeePerGas: bigint;
  maxPriorityFee: bigint;
  estimatedSeconds: number;
  displayLabel: string;      // "~5분", "~30초"
}

interface NetworkGasState {
  currentBaseFee: bigint;
  priceLevels: GasPriceLevel[];
  blockUtilization: number;  // 0-100
  pendingCount: number;
  lastUpdated: Date;
}

// Hook: useNetworkGasState (not useGasTracker)
function useNetworkGasState(refreshMs = 12000) {
  // 독자적 구현
}
```

**UI 레이아웃**:
```
┌─────────────────────────────────────────────────────────┐
│ Network Gas Monitor                              🔄 Live │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 🐢 Economy  │ │ 🚗 Standard │ │ 🚀 Priority │       │
│  │   12 Gwei   │ │   15 Gwei   │ │   20 Gwei   │       │
│  │   ~5 min    │ │   ~2 min    │ │   ~30 sec   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  Base Fee: 10 Gwei          Block Usage: ████████░░ 78%│
│  Pending Txs: 1,234                                    │
│                                                         │
│  [24h Gas Price History Chart]                         │
└─────────────────────────────────────────────────────────┘
```

### 6.3 🔴 P0: Proxy Contract 감지

**목표**: Proxy 컨트랙트 자동 감지 및 Implementation 연결

**독자적 구현 설계**:

```typescript
// lib/contracts/proxyAnalyzer.ts
// 완전히 새로운 네이밍

type ProxyArchitecture =
  | 'transparent-eip1967'
  | 'uups-eip1967'
  | 'beacon-eip1967'
  | 'uups-eip1822'
  | 'diamond-eip2535'
  | 'minimal-proxy-eip1167'
  | 'custom'
  | 'none';

interface ProxyAnalysisResult {
  isProxyContract: boolean;
  architecture: ProxyArchitecture;
  addresses: {
    implementation?: string;
    admin?: string;
    beacon?: string;
  };
  reliability: 'confirmed' | 'probable' | 'uncertain';
}

// 구현 로직은 EIP 스펙에 따라 독자적으로 작성
// Storage slot 주소는 EIP 표준이므로 사용 가능
const STANDARD_SLOTS = {
  // EIP-1967 정의 슬롯 (표준 스펙)
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
};
```

### 6.4 🔴 P0: EIP-4337 Account Abstraction 지원

**목표**: UserOperation 및 Bundler 정보 표시

**독자적 구현 설계**:

```typescript
// 파일 구조 (Blockscout의 userOps와 다른 네이밍)
app/
├── account-operations/       // not user-ops
│   └── page.tsx
├── account-operation/        // not user-op
│   └── [opHash]/
│       └── page.tsx
└── bundlers/
    └── page.tsx

components/
├── accountOperations/        // not userOps
│   ├── AccountOperationList.tsx
│   ├── AccountOperationDetail.tsx
│   ├── OperationCallDataPanel.tsx
│   └── PaymasterInfoCard.tsx
└── bundlers/
    ├── BundlerList.tsx
    └── BundlerStatsCard.tsx
```

```typescript
// types/accountAbstraction.ts
// 완전히 독자적인 타입 정의

interface AccountOperation {
  operationHash: string;
  smartAccountAddress: string;
  operationNonce: bigint;

  // 생성 관련
  initializationCode?: string;

  // 실행 관련
  executionCallData: string;
  executionGasLimit: bigint;

  // 검증 관련
  verificationGasLimit: bigint;
  preVerificationGas: bigint;

  // 수수료 관련
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;

  // Paymaster 관련
  paymasterInfo?: {
    address: string;
    sponsoredAmount: bigint;
  };

  // 서명
  authorizationSignature: string;

  // 실행 결과
  execution: {
    bundlerAddress: string;
    entryPointAddress: string;
    includedInTxHash: string;
    includedInBlock: number;
    wasSuccessful: boolean;
    actualGasSpent: bigint;
  };
}
```

### 6.5 🟡 P1: Error Handling 개선

**독자적 구현 설계**:

```typescript
// lib/errors/errorAnalyzer.ts
// Blockscout의 getErrorCause 등과 다른 접근

interface ErrorAnalysis {
  originalError: unknown;
  category: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  httpStatus?: number;
  userMessage: string;
  technicalDetails: string;
  isRetryable: boolean;
  suggestedAction?: string;
}

function analyzeError(error: unknown): ErrorAnalysis {
  // 독자적 분석 로직
}

// components/common/ApplicationErrorBoundary.tsx
// Blockscout의 AppErrorBoundary와 다른 네이밍
class ApplicationErrorBoundary extends Component<Props, State> {
  // 독자적 구현
}
```

---

## 7. 구현 우선순위 및 로드맵

### 7.1 우선순위 매트릭스

| 우선순위 | 항목 | 복잡도 | 사용자 가치 | 백엔드 의존성 |
|---------|------|--------|------------|--------------|
| 🔴 P0-1 | Gas Price Tracker | 중 | 높음 | 낮음 |
| 🔴 P0-2 | Proxy 감지 | 낮 | 높음 | 없음 |
| 🔴 P0-3 | State Changes | 중 | 높음 | 중간 |
| 🔴 P0-4 | EIP-7702 완성 | 낮 | 중간 | 높음 |
| 🔴 P0-5 | EIP-4337 | 높 | 중간 | 높음 |
| 🟡 P1-1 | Block Proposer 확장 | 낮 | 중간 | 낮음 |
| 🟡 P1-2 | Method Signature | 중 | 중간 | 낮음 |
| 🟡 P1-3 | Error Handling | 중 | 중간 | 없음 |
| 🟡 P1-4 | CSV Export 확장 | 낮 | 낮음 | 없음 |
| 🟢 P2-1 | Gas History 차트 | 중 | 낮음 | 낮음 |
| 🟢 P2-2 | 포트폴리오 비율 | 낮 | 낮음 | 없음 |

### 7.2 구현 로드맵

#### Phase 1: 핵심 기능 (1-2주)

```
Week 1:
├─ Day 1-2: Gas Price Tracker
│   ├─ NetworkGasMonitor 컴포넌트
│   ├─ useNetworkGasState 훅
│   └─ 가격 레벨 카드 UI
│
├─ Day 3-4: Proxy 감지
│   ├─ proxyAnalyzer 유틸리티
│   ├─ 컨트랙트 페이지 배너
│   └─ Implementation 링크
│
└─ Day 5: EIP-7702 완성
    ├─ 백엔드 API 연동
    └─ Authorization List UI

Week 2:
├─ Day 1-3: State Changes
│   ├─ 백엔드 API 확인/협의
│   ├─ StateModificationViewer 컴포넌트
│   └─ Storage 디코딩 로직
│
└─ Day 4-5: Block Proposer 확장
    ├─ 검증자 통계 연동
    └─ WBFT 정보 통합 표시
```

#### Phase 2: Account Abstraction (2-3주)

```
Week 3-4:
├─ 백엔드 팀과 스키마 협의
├─ EntryPoint 이벤트 인덱싱 확인
├─ AccountOperation 목록 페이지
├─ AccountOperation 상세 페이지
├─ Bundler 정보 표시
└─ Paymaster 추적
```

#### Phase 3: 품질 개선 (1주)

```
Week 5:
├─ Error Handling 개선
├─ Method Signature 해석기
├─ CSV Export 확장
├─ 테스트 작성
└─ 문서화
```

---

## 8. 네이밍 및 구현 가이드

### 8.1 네이밍 규칙 (GPL 준수)

**원칙**: Blockscout 네이밍과 **완전히 다른** 이름 사용

| Blockscout 패턴 | 우리 프로젝트 패턴 |
|----------------|-------------------|
| `TxDetails` | `TransactionDetailPanel` |
| `TxInfo` | `TransactionInfoCard` |
| `TxState` | `StateModificationViewer` |
| `TxLogs` | `TransactionEventLogs` |
| `useSocketChannel` | `useSubscriptionManager` |
| `useSocketMessage` | `useRealtimeEventHandler` |
| `GasTrackerPrices` | `GasPriceLevelCards` |
| `GasTrackerChart` | `GasPriceHistoryChart` |
| `ContractMethodsProxy` | `ProxyContractInterface` |
| `UserOpDetails` | `AccountOperationDetail` |
| `userOps/` | `accountOperations/` |
| `AppErrorBoundary` | `ApplicationErrorBoundary` |
| `getErrorCause` | `extractErrorOrigin` |
| `ChannelRegistry` | `SubscriptionRegistry` |

### 8.2 파일 구조 가이드

```
components/
├── transactions/
│   ├── TransactionDetailPanel.tsx     (not TxDetails)
│   ├── StateModificationViewer.tsx    (not TxState)
│   ├── TransactionEventLogs.tsx       (not TxLogs)
│   └── TransactionTraceExplorer.tsx   (not TxRawTrace)
├── blocks/
│   ├── BlockDetailPanel.tsx           (not BlockDetails)
│   ├── BlockProposerCard.tsx          (새로운 이름)
│   └── BlockConsensusInfo.tsx         (WBFT 전용)
├── contracts/
│   ├── ContractSourcePanel.tsx        (not ContractSourceCode)
│   ├── ContractMethodsPanel.tsx       (not ContractMethods)
│   ├── ProxyContractBanner.tsx        (새로운 이름)
│   └── ImplementationResolver.tsx     (새로운 이름)
├── gas/
│   ├── NetworkGasMonitor.tsx          (not GasTracker)
│   ├── GasPriceLevelCards.tsx         (not GasTrackerPrices)
│   └── GasPriceHistoryChart.tsx       (not GasTrackerChart)
├── accountOperations/                 (not userOps)
│   ├── AccountOperationList.tsx
│   ├── AccountOperationDetail.tsx
│   └── BundlerInfoCard.tsx
└── common/
    └── ApplicationErrorBoundary.tsx   (not AppErrorBoundary)

lib/
├── errors/
│   ├── errorAnalyzer.ts               (not getErrorCause 등)
│   └── types.ts
├── contracts/
│   └── proxyAnalyzer.ts               (새로운 이름)
├── subscriptions/
│   └── subscriptionRegistry.ts        (not channelRegistry)
└── gas/
    └── gasPriceCalculator.ts          (새로운 이름)
```

### 8.3 구현 원칙

1. **개념만 참조, 코드는 독자 작성**
   - Blockscout에서 "무엇을 하는지" 파악
   - "어떻게 하는지"는 독자적으로 설계

2. **EIP 표준은 사용 가능**
   - EIP-1967 storage slot 주소 (표준 스펙)
   - EIP-4337 UserOperation 구조 (표준 스펙)
   - 이들은 공개 표준이므로 사용 가능

3. **다른 라이브러리 활용**
   - Blockscout: Phoenix Socket → 우리: GraphQL-WS
   - Blockscout: TanStack Query → 우리: Apollo Client
   - Blockscout: Chakra UI → 우리: Tailwind + Custom

4. **프로젝트 특성 반영**
   - WBFT 합의 정보 통합
   - Fee Delegation 강조
   - 거버넌스/Epoch 연계

---

## 부록

### A. 백엔드 API 요구사항

| 기능 | 필요한 API | 현재 상태 |
|------|-----------|----------|
| State Changes | `debug_traceTransaction` (stateDiff) | 확인 필요 |
| Gas Price | 최근 블록 분석 또는 `eth_feeHistory` | 확인 필요 |
| EIP-4337 | EntryPoint 이벤트 인덱싱 | 확인 필요 |
| EIP-7702 | `authorizationList` 필드 | 백엔드 작업 필요 |
| Proxy Detection | `eth_getStorageAt` | 사용 가능 |

### B. 참조 EIP 문서

- [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
- [EIP-4337: Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337)
- [EIP-7702: Set EOA Code](https://eips.ethereum.org/EIPS/eip-7702)
- [EIP-1559: Fee Market](https://eips.ethereum.org/EIPS/eip-1559)
- [EIP-4844: Blob Transactions](https://eips.ethereum.org/EIPS/eip-4844)

### C. 테스트 계획

```
tests/
├── unit/
│   ├── lib/
│   │   ├── proxyAnalyzer.test.ts
│   │   ├── gasPriceCalculator.test.ts
│   │   └── errorAnalyzer.test.ts
│   └── hooks/
│       ├── useNetworkGasState.test.ts
│       └── useStateModifications.test.ts
└── e2e/
    ├── gas-monitor.spec.ts
    ├── proxy-contract.spec.ts
    ├── state-changes.spec.ts
    └── account-operations.spec.ts
```

### D. 상세 구현 명세

#### D.1 Gas Price Tracker 전체 명세

**파일 구조**:
```
components/gas/
├── index.ts
├── NetworkGasMonitor.tsx           # 메인 컴포넌트
├── GasPriceLevelCard.tsx           # Safe/Standard/Fast 카드
├── GasPriceHistoryChart.tsx        # 히스토리 차트
├── NetworkBlockUtilization.tsx     # 네트워크 사용률
├── BaseFeeDisplay.tsx              # Base Fee 표시
└── types.ts                        # 타입 정의

lib/hooks/
└── useNetworkGasState.ts           # 데이터 fetching hook

lib/utils/
└── gasPriceCalculator.ts           # 가격 계산 유틸리티
```

**타입 정의**:
```typescript
// components/gas/types.ts

export interface GasPriceLevel {
  tier: 'economy' | 'standard' | 'priority';
  maxFeePerGas: bigint;
  maxPriorityFee: bigint;
  estimatedSeconds: number;
  displayLabel: string;    // "~5분", "~30초"
}

export interface NetworkGasMetrics {
  baseFee: bigint;
  priceLevels: GasPriceLevel[];
  networkUtilization: number;  // 0-100
  pendingTransactionCount: number;
  lastBlockGasUsed: bigint;
  lastBlockGasLimit: bigint;
  updatedAt: Date;
}

export interface GasPriceHistoryPoint {
  timestamp: Date;
  baseFee: bigint;
  avgPriorityFee: bigint;
  blockUtilization: number;
}

export interface GasPriceHistoryData {
  period: '1h' | '24h' | '7d';
  dataPoints: GasPriceHistoryPoint[];
}
```

**메인 컴포넌트**:
```typescript
// components/gas/NetworkGasMonitor.tsx

'use client';

import { useNetworkGasState } from '@/lib/hooks/useNetworkGasState';
import { GasPriceLevelCard } from './GasPriceLevelCard';
import { GasPriceHistoryChart } from './GasPriceHistoryChart';
import { NetworkBlockUtilization } from './NetworkBlockUtilization';
import { BaseFeeDisplay } from './BaseFeeDisplay';
import type { NetworkGasMetrics } from './types';

interface NetworkGasMonitorProps {
  refreshInterval?: number;  // ms, default 12000 (1 block)
  showHistory?: boolean;
  historyPeriod?: '1h' | '24h' | '7d';
}

export function NetworkGasMonitor({
  refreshInterval = 12000,
  showHistory = true,
  historyPeriod = '24h'
}: NetworkGasMonitorProps) {
  const {
    metrics,
    history,
    isLoading,
    error,
    refetch
  } = useNetworkGasState({
    refreshInterval,
    historyPeriod
  });

  if (isLoading) {
    return <NetworkGasMonitorSkeleton />;
  }

  if (error) {
    return <NetworkGasMonitorError error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Network Gas Monitor</h2>
        <span className="text-sm text-muted-foreground">
          Updated {formatTimeAgo(metrics.updatedAt)}
        </span>
      </div>

      {/* Base Fee & Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseFeeDisplay baseFee={metrics.baseFee} />
        <NetworkBlockUtilization
          utilization={metrics.networkUtilization}
          gasUsed={metrics.lastBlockGasUsed}
          gasLimit={metrics.lastBlockGasLimit}
        />
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.priceLevels.map((level) => (
          <GasPriceLevelCard
            key={level.tier}
            level={level}
          />
        ))}
      </div>

      {/* History Chart */}
      {showHistory && history && (
        <GasPriceHistoryChart
          data={history}
          onPeriodChange={handlePeriodChange}
        />
      )}
    </div>
  );
}
```

#### D.2 Proxy Detector 전체 명세

**파일 구조**:
```
lib/contracts/
├── proxyAnalyzer.ts              # 메인 감지 로직
└── proxyStorageSlots.ts          # 스토리지 슬롯 상수

components/contracts/
├── ProxyContractBanner.tsx       # Proxy 알림 배너
├── ImplementationLink.tsx        # Implementation 링크
└── ProxyMethodsTabs.tsx          # Proxy/Implementation 탭
```

**감지 로직**:
```typescript
// lib/contracts/proxyAnalyzer.ts

import { STANDARD_SLOTS } from './proxyStorageSlots';

export type ProxyArchitecture =
  | 'transparent-eip1967'
  | 'uups-eip1967'
  | 'beacon-eip1967'
  | 'uups-eip1822'
  | 'diamond-eip2535'
  | 'minimal-proxy-eip1167'
  | 'custom'
  | 'none';

export interface ProxyAnalysisResult {
  isProxyContract: boolean;
  architecture: ProxyArchitecture;
  addresses: {
    implementation?: string;
    admin?: string;
    beacon?: string;
  };
  reliability: 'confirmed' | 'probable' | 'uncertain';
}

export async function analyzeProxyContract(
  contractAddress: string,
  rpcProvider: JsonRpcProvider
): Promise<ProxyAnalysisResult> {
  const results = await Promise.all([
    checkEIP1967Implementation(contractAddress, rpcProvider),
    checkEIP1967Admin(contractAddress, rpcProvider),
    checkEIP1967Beacon(contractAddress, rpcProvider),
    checkEIP1822(contractAddress, rpcProvider),
  ]);

  // EIP-1967 Implementation Slot 확인
  const implResult = results[0];
  if (implResult.found) {
    const adminResult = results[1];
    const beaconResult = results[2];

    if (beaconResult.found) {
      return {
        isProxyContract: true,
        architecture: 'beacon-eip1967',
        addresses: {
          beacon: beaconResult.address,
          implementation: implResult.address,
        },
        reliability: 'confirmed'
      };
    }

    if (adminResult.found) {
      return {
        isProxyContract: true,
        architecture: 'transparent-eip1967',
        addresses: {
          implementation: implResult.address,
          admin: adminResult.address,
        },
        reliability: 'confirmed'
      };
    }

    return {
      isProxyContract: true,
      architecture: 'uups-eip1967',
      addresses: {
        implementation: implResult.address,
      },
      reliability: 'confirmed'
    };
  }

  // EIP-1822 확인
  const eip1822Result = results[3];
  if (eip1822Result.found) {
    return {
      isProxyContract: true,
      architecture: 'uups-eip1822',
      addresses: {
        implementation: eip1822Result.address,
      },
      reliability: 'confirmed'
    };
  }

  // 바이트코드 패턴 분석 (fallback)
  const bytecodePattern = await analyzeBytecodeForProxy(
    contractAddress,
    rpcProvider
  );

  if (bytecodePattern.isProxy) {
    return {
      ...bytecodePattern,
      reliability: 'uncertain'
    };
  }

  return {
    isProxyContract: false,
    architecture: 'none',
    addresses: {},
    reliability: 'confirmed'
  };
}

async function checkEIP1967Implementation(
  address: string,
  provider: JsonRpcProvider
): Promise<{ found: boolean; address?: string }> {
  try {
    const slot = await provider.getStorage(
      address,
      STANDARD_SLOTS.IMPLEMENTATION
    );

    const implAddress = extractAddressFromSlot(slot);
    if (implAddress && implAddress !== ZERO_ADDRESS) {
      return { found: true, address: implAddress };
    }
  } catch (e) {
    // Storage read failed
  }
  return { found: false };
}

// EIP 표준 슬롯 (표준 스펙이므로 사용 가능)
// lib/contracts/proxyStorageSlots.ts
export const STANDARD_SLOTS = {
  // EIP-1967
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
  // EIP-1822
  PROXIABLE: '0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7',
};
```

#### D.3 State Changes Viewer 전체 명세

**파일 구조**:
```
components/transactions/stateModifications/
├── index.ts
├── StateModificationViewer.tsx   # 메인 컴포넌트
├── AccountModificationEntry.tsx  # 개별 계정 항목
├── StorageModificationRow.tsx    # 스토리지 변경 행
├── BalanceModificationRow.tsx    # 잔액 변경 행
└── types.ts

lib/hooks/
└── useTransactionStateModifications.ts   # 상태 변경 조회 hook
```

**타입 정의**:
```typescript
// components/transactions/stateModifications/types.ts

export type ModificationType =
  | 'storage'
  | 'balance'
  | 'nonce'
  | 'code';

export interface StorageModification {
  slotKey: string;          // storage slot (hex)
  valueBefore: string;      // hex
  valueAfter: string;       // hex
  interpretation?: {
    fieldName?: string;
    fieldType?: string;
    decodedBefore?: string;
    decodedAfter?: string;
  };
}

export interface BalanceModification {
  valueBefore: bigint;
  valueAfter: bigint;
  difference: bigint;
  tokenAddress?: string;    // undefined = native token
  tokenSymbol?: string;
}

export interface AccountModification {
  accountAddress: string;
  accountLabel?: string;    // 알려진 컨트랙트명
  accountType: 'eoa' | 'contract';

  storageModifications: StorageModification[];
  balanceModification?: BalanceModification;
  nonceModification?: {
    before: number;
    after: number;
  };
  codeModification?: {
    previousCodeHash: string;
    newCodeHash: string;
  };
}

export interface TransactionStateResult {
  transactionHash: string;
  blockHeight: number;
  modifiedAccounts: AccountModification[];
  totalStorageWrites: number;
  totalBalanceChanges: number;
}
```

**메인 컴포넌트**:
```typescript
// components/transactions/stateModifications/StateModificationViewer.tsx

'use client';

import { useState } from 'react';
import { useTransactionStateModifications } from '@/lib/hooks/useTransactionStateModifications';
import { AccountModificationEntry } from './AccountModificationEntry';
import { Database, Coins } from 'lucide-react';
import type { TransactionStateResult } from './types';

interface StateModificationViewerProps {
  txHash: string;
}

export function StateModificationViewer({ txHash }: StateModificationViewerProps) {
  const { data, isLoading, error } = useTransactionStateModifications(txHash);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <StateModificationViewerSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg">
        <p className="text-destructive">
          Failed to load state modifications: {error.message}
        </p>
      </div>
    );
  }

  if (!data || data.modifiedAccounts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No state modifications recorded for this transaction.
      </div>
    );
  }

  const toggleAccount = (address: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Database className="h-4 w-4" />
          {data.totalStorageWrites} storage writes
        </span>
        <span className="flex items-center gap-1">
          <Coins className="h-4 w-4" />
          {data.totalBalanceChanges} balance changes
        </span>
      </div>

      {/* Account List */}
      <div className="space-y-2">
        {data.modifiedAccounts.map((account) => (
          <AccountModificationEntry
            key={account.accountAddress}
            account={account}
            isExpanded={expandedAccounts.has(account.accountAddress)}
            onToggle={() => toggleAccount(account.accountAddress)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### D.4 Account Abstraction (EIP-4337) 명세

**파일 구조**:
```
app/
├── account-operations/           # not user-ops (GPL 준수)
│   └── page.tsx
├── account-operation/
│   └── [opHash]/
│       └── page.tsx
└── bundlers/
    └── page.tsx

components/accountOperations/     # not userOps
├── AccountOperationList.tsx
├── AccountOperationDetail.tsx
├── OperationCallDataPanel.tsx
├── PaymasterInfoCard.tsx
└── types.ts

components/bundlers/
├── BundlerList.tsx
└── BundlerStatsCard.tsx
```

**타입 정의**:
```typescript
// components/accountOperations/types.ts

export interface AccountOperation {
  operationHash: string;
  smartAccountAddress: string;
  operationNonce: bigint;

  // 생성 관련
  initializationCode?: string;

  // 실행 관련
  executionCallData: string;
  executionGasLimit: bigint;

  // 검증 관련
  verificationGasLimit: bigint;
  preVerificationGas: bigint;

  // 수수료 관련
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;

  // Paymaster 관련
  paymasterInfo?: {
    address: string;
    sponsoredAmount: bigint;
  };

  // 서명
  authorizationSignature: string;

  // 실행 결과
  execution: {
    bundlerAddress: string;
    entryPointAddress: string;
    includedInTxHash: string;
    includedInBlock: number;
    wasSuccessful: boolean;
    actualGasSpent: bigint;
  };
}

export interface BundlerInfo {
  address: string;
  name?: string;
  totalOperationsProcessed: number;
  totalGasSponsored: bigint;
  successRate: number;
  recentOperations: AccountOperation[];
}
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-02-08 | 3.0 | feature-enhancement-plan.md 통합, 상세 구현 명세 추가 |
| 2026-02-08 | 2.0 | GPL 라이센스 가이드, 적합성 분석, Gap 분석, 네이밍 가이드 추가 |
| 2026-02-07 | 1.0 | 초기 비교 분석 문서 |

---

*이 문서는 GPL-v3 라이센스 준수를 위해 Blockscout 코드를 직접 참조하지 않고, 기능 개념만 참조하여 독자적으로 구현하는 것을 전제로 작성되었습니다.*
