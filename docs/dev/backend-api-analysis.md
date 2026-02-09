# Backend API 분석 및 프론트엔드 구현 가능성

> **작성일**: 2026-02-08
> **목적**: 백엔드 API 현황 파악 및 프론트엔드 기능 구현 가능성 분석
> **분석 대상**: indexer-go (우리 백엔드), blockscout-backend (참조용)

---

## 목차

1. [indexer-go API 현황](#1-indexer-go-api-현황)
2. [기능별 API 가용성 분석](#2-기능별-api-가용성-분석)
3. [구현 가능 기능 vs 백엔드 작업 필요 기능](#3-구현-가능-기능-vs-백엔드-작업-필요-기능)
4. [프론트엔드 구현 계획](#4-프론트엔드-구현-계획)
5. [백엔드 요청 사항](#5-백엔드-요청-사항)

---

## 1. indexer-go API 현황

### 1.1 API 구조

indexer-go는 세 가지 API 인터페이스를 제공합니다:

| API | 엔드포인트 | 설명 |
|-----|-----------|------|
| **GraphQL** | `/graphql` | 메인 API, 실시간 구독 지원 |
| **JSON-RPC** | `/rpc` | 50+ 커스텀 메서드 |
| **Etherscan 호환** | `/api` | 컨트랙트 검증 등 |

**추가 엔드포인트:**
- WebSocket: `/graphql/ws` (실시간 구독)
- Playground: `/playground` (개발용)
- Health: `/health`
- Metrics: `/metrics` (Prometheus)

### 1.2 GraphQL 스키마 주요 타입

#### Block 타입
```graphql
type Block {
  number: Int!
  hash: String!
  parentHash: String!
  miner: Address!              # Block proposer
  timestamp: BigInt!
  baseFeePerGas: BigInt        # EIP-1559
  gasLimit: BigInt!
  gasUsed: BigInt!
  blobGasUsed: BigInt          # EIP-4844
  excessBlobGas: BigInt
  transactions: [Transaction!]
}
```

#### Transaction 타입
```graphql
type Transaction {
  hash: String!
  blockNumber: Int!
  from: Address!
  to: Address
  value: BigInt!
  gas: BigInt!
  gasPrice: BigInt
  maxFeePerGas: BigInt         # EIP-1559
  maxPriorityFeePerGas: BigInt # EIP-1559
  type: Int!                   # 0x00-0x16

  # Fee Delegation (Type 0x16)
  feePayer: Address
  feePayerSignatures: [FeePayerSignature!]

  # EIP-7702 (Type 0x04)
  authorizationList: [SetCodeAuthorization!]

  # Receipt
  receipt: Receipt
}
```

#### Receipt 타입
```graphql
type Receipt {
  transactionHash: String!
  blockNumber: Int!
  gasUsed: BigInt!
  effectiveGasPrice: BigInt!
  status: Int!                 # 1=success, 0=failed
  logs: [Log!]
  contractAddress: Address     # For contract creation
}
```

### 1.3 주요 Query 목록

```graphql
# Block 관련
block(number: Int!): Block
blockByHash(hash: String!): Block
blocks(fromBlock: Int!, toBlock: Int!): [Block!]
blocksByTimeRange(from: BigInt!, to: BigInt!): [Block!]
latestBlock: Block

# Transaction 관련
transaction(hash: String!): Transaction
transactionsByAddress(address: String!, ...): TransactionConnection
transactionsByAddressFiltered(address: String!, filter: TxFilter!): TransactionConnection

# WBFT 합의 관련
wbftBlockExtra(blockNumber: Int!): WBFTBlockExtra
blockSigners(blockNumber: Int!): BlockSigners
epochInfo(epochNumber: Int!): EpochInfo
validatorSigningStats(address: String!, fromBlock: Int!, toBlock: Int!): ValidatorStats

# EIP-7702 관련
setCodeAuthorization(txHash: String!, authIndex: Int!): SetCodeAuthorization
setCodeAuthorizationsByTx(txHash: String!): [SetCodeAuthorization!]
setCodeAuthorizationsByTarget(address: String!): [SetCodeAuthorization!]
setCodeAuthorizationsByAuthority(address: String!): [SetCodeAuthorization!]
addressSetCodeInfo(address: String!): AddressSetCodeInfo
recentSetCodeTransactions(limit: Int!): [Transaction!]

# 잔액/토큰 관련
addressBalance(address: String!, blockNumber: Int): BigInt!
balanceHistory(address: String!, fromBlock: Int!, toBlock: Int!): [BalanceSnapshot!]
tokenBalances(address: String!): [TokenBalance!]
erc20Transfers(address: String!, ...): [ERC20Transfer!]
erc721Transfers(address: String!, ...): [ERC721Transfer!]

# 컨트랙트 관련
contractCreation(address: String!): ContractCreation
contractCall(address: String!, method: String!, params: [String!]!, abi: String!): ContractCallResult
internalTransactionsRPC(txHash: String!): InternalTransactionsResult
```

### 1.4 Subscription 목록

```graphql
# 실시간 구독
subscription {
  newBlock: Block
  newTransaction: Transaction
  pendingTransaction: Transaction
  logs(filter: LogFilter!): Log
  consensusBlock: ConsensusBlockSub
  consensusFork: ConsensusForkSub
  consensusValidatorChange: ValidatorChangeSub
  systemContractEvent(eventType: String!): SystemContractEvent
  dynamicContractEvent(contractId: String!): DynamicContractEvent
}
```

---

## 2. 기능별 API 가용성 분석

### 2.1 State Changes (상태 변경 추적)

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| Balance 변경 | ✅ 있음 | `balanceHistory` | 블록별 잔액 스냅샷 |
| Token 변경 | ✅ 있음 | `erc20Transfers`, `erc721Transfers` | 토큰 전송 기록 |
| Transaction Logs | ✅ 있음 | `transaction.receipt.logs` | 이벤트 로그 |
| Storage 변경 | ⚠️ 간접 | `internalTransactionsRPC` | RPC Proxy 필요 |
| **State Diff** | ❌ 없음 | - | 백엔드 작업 필요 |

**현재 상태:**
- 잔액 변경과 토큰 전송은 조회 가능
- **Storage 변경 (State Diff)는 전용 API 없음**
- `debug_traceTransaction` with `prestateTracer`가 필요하나 현재 미지원

**필요한 백엔드 작업:**
```graphql
# 제안: 새로운 Query 추가
type StateModification {
  address: String!
  accountType: String!  # eoa | contract
  balanceChange: BalanceChange
  storageChanges: [StorageChange!]
  nonceChange: NonceChange
}

type StorageChange {
  slot: String!
  valueBefore: String!
  valueAfter: String!
}

query transactionStateChanges(txHash: String!): [StateModification!]
```

### 2.2 Gas Tracker (가스 추적기)

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| 현재 Base Fee | ✅ 있음 | `latestBlock.baseFeePerGas` | 최신 블록에서 조회 |
| Block Gas Used | ✅ 있음 | `block.gasUsed`, `block.gasLimit` | 블록별 가스 사용량 |
| Tx Gas Price | ✅ 있음 | `transaction.gasPrice`, `effectiveGasPrice` | 트랜잭션별 가격 |
| **Gas 추천** | ❌ 없음 | - | 계산 로직 필요 |
| **Gas History** | ⚠️ 계산 필요 | 블록 조회 후 계산 | 전용 API 없음 |
| Pending Tx Count | ⚠️ 미확인 | - | 확인 필요 |

**현재 상태:**
- 기본 가스 데이터는 모두 조회 가능
- **Safe/Standard/Fast 추천값은 프론트엔드에서 계산해야 함**
- 네트워크 사용률은 `gasUsed / gasLimit`으로 계산 가능

**프론트엔드 구현 가능:**
```typescript
// 최근 N개 블록의 가스 데이터로 추천값 계산
async function calculateGasRecommendations(recentBlocks: Block[]): GasPriceLevel[] {
  const baseFee = recentBlocks[0].baseFeePerGas;

  // 최근 트랜잭션의 priority fee 분포 분석
  const priorityFees = extractPriorityFees(recentBlocks);
  const percentiles = calculatePercentiles(priorityFees, [25, 50, 75]);

  return [
    { tier: 'economy', maxPriorityFee: percentiles[25], estimatedSeconds: 300 },
    { tier: 'standard', maxPriorityFee: percentiles[50], estimatedSeconds: 60 },
    { tier: 'priority', maxPriorityFee: percentiles[75], estimatedSeconds: 15 },
  ];
}
```

### 2.3 Proxy Contract Detection (프록시 감지)

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| Storage Slot 조회 | ✅ 있음 | `contractCall` (eth_getStorageAt) | RPC Proxy 경유 |
| Bytecode 조회 | ✅ 있음 | `contractCreation` | 컨트랙트 코드 |
| **Proxy 타입 분류** | ❌ 없음 | - | 프론트엔드 구현 필요 |
| Implementation 주소 | ⚠️ 계산 필요 | Storage 조회 후 추출 | |

**현재 상태:**
- Storage slot 조회가 가능하므로 **프론트엔드에서 Proxy 감지 구현 가능**
- EIP-1967 표준 슬롯 주소는 공개 스펙이므로 사용 가능

**프론트엔드 구현 가능:**
```typescript
// RPC Proxy를 통한 Storage 조회
const SLOTS = {
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
};

async function detectProxy(address: string): Promise<ProxyAnalysisResult> {
  // contractCall로 eth_getStorageAt 호출
  const implSlot = await rpcCall('eth_getStorageAt', [address, SLOTS.IMPLEMENTATION, 'latest']);
  // ... 분석 로직
}
```

### 2.4 EIP-7702 (SetCode Authorization)

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| Authorization List | ✅ 있음 | `transaction.authorizationList` | 완전 지원 |
| SetCode Tx 목록 | ✅ 있음 | `recentSetCodeTransactions` | |
| Authority 조회 | ✅ 있음 | `setCodeAuthorizationsByAuthority` | |
| Target 조회 | ✅ 있음 | `setCodeAuthorizationsByTarget` | |
| Address 위임 정보 | ✅ 있음 | `addressSetCodeInfo` | |

**현재 상태: ✅ 완전 지원**

indexer-go는 EIP-7702를 완전히 지원합니다:

```graphql
type SetCodeAuthorization {
  chainId: BigInt!
  address: String!        # 위임 대상 컨트랙트
  nonce: BigInt!
  yParity: Int!
  r: String!
  s: String!
  authority: String!      # 서명자 (EOA)
  applied: Boolean!       # 적용 성공 여부
  error: String           # 실패 시 에러
  txHash: String!
  blockNumber: Int!
  authorizationIndex: Int!
}

type AddressSetCodeInfo {
  address: String!
  hasDelegation: Boolean!
  delegationTarget: String
  asTargetCount: Int!
  asAuthorityCount: Int!
  lastActivityBlock: Int
  lastActivityTimestamp: BigInt
}
```

**프론트엔드 구현: 즉시 가능**

### 2.5 EIP-4337 Account Abstraction

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| UserOperation 목록 | ❌ 없음 | - | 백엔드 작업 필요 |
| Bundler 정보 | ❌ 없음 | - | 백엔드 작업 필요 |
| Paymaster 정보 | ❌ 없음 | - | 백엔드 작업 필요 |
| EntryPoint 이벤트 | ⚠️ 간접 | `logs` 필터링 | 파싱 필요 |

**현재 상태: ❌ 지원 안됨**

- indexer-go에 EIP-4337 전용 인덱싱 없음
- **Blockscout는 별도 마이크로서비스로 처리**
- 현재 구현하려면:
  1. EntryPoint 컨트랙트를 `registerContract`로 등록
  2. `dynamicContractEvents` 구독으로 이벤트 수신
  3. 프론트엔드에서 UserOperation 파싱

**필요한 백엔드 작업:**
```graphql
# 제안: EIP-4337 전용 타입 및 쿼리
type AccountOperation {
  operationHash: String!
  smartAccountAddress: String!
  nonce: BigInt!
  callData: String!
  callGasLimit: BigInt!
  verificationGasLimit: BigInt!
  preVerificationGas: BigInt!
  maxFeePerGas: BigInt!
  maxPriorityFeePerGas: BigInt!
  paymasterAddress: String
  bundlerAddress: String!
  entryPointAddress: String!
  txHash: String!
  blockNumber: Int!
  success: Boolean!
  actualGasUsed: BigInt!
}

query accountOperations(limit: Int!, offset: Int!): [AccountOperation!]
query accountOperation(opHash: String!): AccountOperation
query bundlers(limit: Int!): [BundlerInfo!]
query paymasters(limit: Int!): [PaymasterInfo!]
```

### 2.6 Block Proposer Details

| 요구 데이터 | 가용성 | API | 비고 |
|------------|--------|-----|------|
| Proposer 주소 | ✅ 있음 | `block.miner`, `wbftBlockExtra.proposer` | |
| 서명자 목록 | ✅ 있음 | `blockSigners` | WBFT 전용 |
| 검증자 통계 | ✅ 있음 | `validatorSigningStats` | |
| 합의 참여율 | ✅ 있음 | `wbftBlockExtra.participationRate` | |
| Epoch 정보 | ✅ 있음 | `epochInfo` | |

**현재 상태: ✅ 완전 지원**

```graphql
type WBFTBlockExtra {
  blockNumber: Int!
  blockHash: String!
  proposer: String!
  validatorCount: Int!
  prepareCount: Int!
  commitCount: Int!
  participationRate: Float!
  missedValidatorRate: Float!
  isEpochBoundary: Boolean!
  epochNumber: Int!
  epochValidators: [String!]
}

type BlockSigners {
  blockNumber: Int!
  proposer: String!
  signers: [String!]!
  signerCount: Int!
}
```

**프론트엔드 구현: 즉시 가능**

---

## 3. 구현 가능 기능 vs 백엔드 작업 필요 기능

### 3.1 즉시 구현 가능 (프론트엔드만)

| 기능 | 복잡도 | 예상 기간 | 비고 |
|------|--------|----------|------|
| **Gas Tracker** | 중 | 2-3일 | 블록 데이터로 계산 |
| **Proxy Detection** | 중 | 2-3일 | Storage 조회 후 분석 |
| **EIP-7702 표시** | 낮 | 1-2일 | API 완전 지원 |
| **Block Proposer 확장** | 낮 | 1일 | WBFT API 활용 |
| **Gas History Chart** | 낮 | 1일 | 블록 히스토리 조회 |

### 3.2 백엔드 작업 필요

| 기능 | 백엔드 작업 | 프론트엔드 작업 | 우선순위 |
|------|-----------|---------------|---------|
| **State Changes** | `transactionStateChanges` API 추가 | StateModificationViewer | 🔴 높음 |
| **EIP-4337** | UserOperation 인덱싱 + API | AccountOperation 페이지 | 🔴 높음 |
| **Method Signature DB** | 시그니처 저장/조회 API | 디코더 UI | 🟡 중간 |

### 3.3 구현 우선순위 재조정

**Phase 1: 프론트엔드만으로 구현 (1주)**
1. Gas Tracker (2-3일)
2. Proxy Detection (2-3일)
3. Block Proposer 확장 (1일)

**Phase 2: EIP-7702 완성 (2-3일)**
- Authorization List UI 연동 (API 이미 지원)

**Phase 3: 백엔드 협업 필요 (2-3주)**
1. State Changes (백엔드 + 프론트엔드)
2. EIP-4337 (백엔드 선행 필수)

---

## 4. 프론트엔드 구현 계획

### 4.1 Gas Tracker 구현

**사용할 API:**
```graphql
query GasTrackerData {
  latestBlock {
    number
    baseFeePerGas
    gasUsed
    gasLimit
    timestamp
  }
  blocks(fromBlock: $from, toBlock: $to) {
    number
    baseFeePerGas
    gasUsed
    gasLimit
    transactions {
      maxPriorityFeePerGas
      gasPrice
    }
  }
}
```

**계산 로직:**
```typescript
interface GasPriceLevel {
  tier: 'economy' | 'standard' | 'priority';
  maxFeePerGas: bigint;
  maxPriorityFee: bigint;
  estimatedSeconds: number;
}

function calculateGasLevels(blocks: Block[]): GasPriceLevel[] {
  const baseFee = blocks[0].baseFeePerGas;
  const allPriorityFees = blocks.flatMap(b =>
    b.transactions.map(tx => tx.maxPriorityFeePerGas || tx.gasPrice - baseFee)
  );

  const sorted = allPriorityFees.sort((a, b) => Number(a - b));
  const p25 = sorted[Math.floor(sorted.length * 0.25)];
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];

  return [
    { tier: 'economy', maxFeePerGas: baseFee + p25, maxPriorityFee: p25, estimatedSeconds: 300 },
    { tier: 'standard', maxFeePerGas: baseFee + p50, maxPriorityFee: p50, estimatedSeconds: 60 },
    { tier: 'priority', maxFeePerGas: baseFee + p75, maxPriorityFee: p75, estimatedSeconds: 15 },
  ];
}
```

### 4.2 Proxy Detection 구현

**사용할 API:**
```graphql
mutation ProxyStorageCheck($address: String!, $slot: String!) {
  contractCall(
    address: $address,
    method: "eth_getStorageAt",
    params: [$address, $slot, "latest"],
    abi: ""
  ) {
    rawResult
  }
}
```

**구현 로직:**
```typescript
const EIP1967_SLOTS = {
  IMPLEMENTATION: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  ADMIN: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103',
  BEACON: '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50',
};

async function analyzeProxyContract(address: string): Promise<ProxyAnalysisResult> {
  const [implSlot, adminSlot, beaconSlot] = await Promise.all([
    getStorageAt(address, EIP1967_SLOTS.IMPLEMENTATION),
    getStorageAt(address, EIP1967_SLOTS.ADMIN),
    getStorageAt(address, EIP1967_SLOTS.BEACON),
  ]);

  const implAddress = extractAddress(implSlot);
  const adminAddress = extractAddress(adminSlot);
  const beaconAddress = extractAddress(beaconSlot);

  if (beaconAddress && beaconAddress !== ZERO_ADDRESS) {
    return { isProxy: true, architecture: 'beacon-eip1967', addresses: { beacon: beaconAddress, implementation: implAddress } };
  }

  if (implAddress && implAddress !== ZERO_ADDRESS) {
    if (adminAddress && adminAddress !== ZERO_ADDRESS) {
      return { isProxy: true, architecture: 'transparent-eip1967', addresses: { implementation: implAddress, admin: adminAddress } };
    }
    return { isProxy: true, architecture: 'uups-eip1967', addresses: { implementation: implAddress } };
  }

  return { isProxy: false, architecture: 'none', addresses: {} };
}
```

### 4.3 EIP-7702 UI 구현

**사용할 API:**
```graphql
query TransactionWithAuth($hash: String!) {
  transaction(hash: $hash) {
    hash
    type
    authorizationList {
      chainId
      address
      nonce
      yParity
      r
      s
      authority
      applied
      error
      authorizationIndex
    }
  }
}

query AddressSetCodeInfo($address: String!) {
  addressSetCodeInfo(address: $address) {
    address
    hasDelegation
    delegationTarget
    asTargetCount
    asAuthorityCount
    lastActivityBlock
    lastActivityTimestamp
  }
}
```

---

## 5. 백엔드 요청 사항

### 5.1 State Changes API (🔴 높은 우선순위)

**요청 사항:**
트랜잭션 실행으로 인한 상태 변경을 조회할 수 있는 API가 필요합니다.

**제안 스키마:**
```graphql
type StateModification {
  address: String!
  accountType: AccountType!  # EOA | CONTRACT
  label: String              # 알려진 컨트랙트명

  balanceChange: BalanceChange
  storageChanges: [StorageChange!]
  nonceChange: NonceChange
  codeChange: CodeChange
}

type BalanceChange {
  before: BigInt!
  after: BigInt!
  delta: BigInt!
}

type StorageChange {
  slot: String!
  before: String!
  after: String!
}

type NonceChange {
  before: Int!
  after: Int!
}

type CodeChange {
  beforeHash: String!
  afterHash: String!
}

type TransactionStateResult {
  txHash: String!
  blockNumber: Int!
  modifications: [StateModification!]!
  totalStorageWrites: Int!
  totalBalanceChanges: Int!
}

# Query
query transactionStateChanges(txHash: String!): TransactionStateResult
```

**구현 방법 제안:**
- `debug_traceTransaction` with `prestateTracer` 또는 `stateDiffTracer` 활용
- 또는 트랜잭션 실행 시 상태 변경 인덱싱

### 5.2 EIP-4337 Account Abstraction API (🔴 높은 우선순위)

**요청 사항:**
EIP-4337 UserOperation 인덱싱 및 조회 API가 필요합니다.

**제안 스키마:**
```graphql
type AccountOperation {
  operationHash: String!
  smartAccount: String!
  nonce: BigInt!

  # 실행 데이터
  initCode: String
  callData: String!
  callGasLimit: BigInt!
  verificationGasLimit: BigInt!
  preVerificationGas: BigInt!

  # 수수료
  maxFeePerGas: BigInt!
  maxPriorityFeePerGas: BigInt!

  # Paymaster
  paymaster: String
  paymasterData: String
  sponsoredAmount: BigInt

  # 실행 결과
  bundler: String!
  entryPoint: String!
  txHash: String!
  blockNumber: Int!
  success: Boolean!
  actualGasUsed: BigInt!
  revertReason: String
}

type BundlerInfo {
  address: String!
  totalOperations: Int!
  successRate: Float!
  totalGasUsed: BigInt!
}

type PaymasterInfo {
  address: String!
  totalOperations: Int!
  totalSponsored: BigInt!
}

# Queries
query accountOperations(
  smartAccount: String
  bundler: String
  paymaster: String
  limit: Int!
  offset: Int!
): AccountOperationConnection

query accountOperation(opHash: String!): AccountOperation
query bundlers(limit: Int!): [BundlerInfo!]
query paymasters(limit: Int!): [PaymasterInfo!]

# Subscription
subscription newAccountOperation: AccountOperation
```

**구현 방법 제안:**
- EntryPoint 컨트랙트 (0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 등) 이벤트 인덱싱
- `UserOperationEvent` 파싱
- Bundler 트랜잭션 분류

### 5.3 Method Signature Database (🟡 중간 우선순위)

**요청 사항:**
함수 시그니처 저장 및 조회 API

**제안:**
```graphql
type MethodSignature {
  selector: String!      # 4 bytes (0x12345678)
  name: String!          # transfer
  signature: String!     # transfer(address,uint256)
  parameters: [MethodParameter!]!
}

type MethodParameter {
  name: String!
  type: String!
  indexed: Boolean
}

# Queries
query methodSignature(selector: String!): MethodSignature
query methodSignatures(selectors: [String!]!): [MethodSignature!]

# Mutation (for contract verification)
mutation registerMethodSignature(signature: String!): MethodSignature
```

---

## 요약

### 즉시 구현 가능 (이번 주)

| 기능 | 복잡도 | 예상 일수 |
|------|--------|----------|
| Gas Tracker | 중 | 2-3일 |
| Proxy Detection | 중 | 2-3일 |
| EIP-7702 UI | 낮 | 1-2일 |
| Block Proposer 확장 | 낮 | 1일 |

### 백엔드 작업 대기

| 기능 | 백엔드 작업량 | 프론트엔드 작업량 |
|------|-------------|-----------------|
| State Changes | 중-높 | 중 |
| EIP-4337 | 높 | 중 |
| Method Signature | 낮 | 낮 |

---

*이 문서는 indexer-go 백엔드 API 분석 결과를 기반으로 작성되었습니다.*
