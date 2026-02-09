# Backend Sync Requirements

> **문서 작성일**: 2026-02-09
> **분석 대상**: `indexer-go` (poc/indexer-go) → `indexer-frontend` (test/indexer-frontend)
> **목적**: 백엔드 서버 변경 사항 대비 프론트엔드 수정 필요 항목 정리

---

## 개요

`indexer-go` 서버의 최근 변경 사항을 분석한 결과, 프론트엔드에서 다음과 같은 수정이 필요합니다.

### 주요 변경 사항 요약

| 카테고리 | 항목 수 | 우선순위 |
|----------|---------|----------|
| 새로운 필드 추가 | 15+ | 높음 |
| 필터 확장 | 7 | 중간 |
| 새로운 Query | 5 | 중간 |
| 새로운 타입 | 4 | 중간 |

---

## 1. 누락된 새 필드 (GraphQL 타입 업데이트)

### 1.1 Transaction 타입

```graphql
type Transaction {
  # ... 기존 필드들 ...

  # [NEW] 블록 타임스탬프 - 트랜잭션이 포함된 블록의 타임스탬프
  blockTimestamp: BigInt
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `blockTimestamp` | `BigInt` | 트랜잭션 포함 블록의 타임스탬프 | ❌ 누락 |

**활용 방안**: 트랜잭션 목록/상세 페이지에서 블록 조회 없이 바로 시간 표시 가능

---

### 1.2 Block 타입

```graphql
type Block {
  # ... 기존 필드들 ...

  # [NEW] transactionCount의 별칭 (프론트엔드 호환성)
  txCount: Int!
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `txCount` | `Int!` | `transactionCount`의 별칭 | ✅ 이미 있음 |

---

### 1.3 MintEvent 타입

```graphql
type MintEvent {
  blockNumber: BigInt!
  transactionHash: Hash!

  # [NEW] transactionHash의 별칭 (프론트엔드 호환성)
  txHash: Hash!

  minter: Address!
  to: Address!
  amount: BigInt!
  timestamp: BigInt!
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `txHash` | `Hash!` | `transactionHash`의 별칭 | ❌ 누락 |

---

### 1.4 BurnEvent 타입

```graphql
type BurnEvent {
  blockNumber: BigInt!
  transactionHash: Hash!

  # [NEW] transactionHash의 별칭 (프론트엔드 호환성)
  txHash: Hash!

  burner: Address!
  amount: BigInt!
  timestamp: BigInt!
  withdrawalId: String

  # [NEW] withdrawalId의 별칭 (프론트엔드 호환성)
  burnTxId: String
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `txHash` | `Hash!` | `transactionHash`의 별칭 | ❌ 누락 |
| `burnTxId` | `String` | `withdrawalId`의 별칭 | ❌ 누락 |

---

### 1.5 MinterConfigEvent 타입

```graphql
type MinterConfigEvent {
  blockNumber: BigInt!
  transactionHash: Hash!

  # [NEW] transactionHash의 별칭 (프론트엔드 호환성)
  txHash: Hash!

  minter: Address!
  allowance: BigInt!
  action: String!

  # [NEW] action에서 파생된 활성 상태
  isActive: Boolean!

  timestamp: BigInt!
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `txHash` | `Hash!` | `transactionHash`의 별칭 | ❌ 누락 |
| `isActive` | `Boolean!` | action에서 파생된 활성 상태 | ❌ 누락 |

---

### 1.6 ValidatorSigningStats 타입 확장

```graphql
type ValidatorSigningStats {
  validatorAddress: Address!
  validatorIndex: Int!
  prepareSignCount: BigInt!
  prepareMissCount: BigInt!
  commitSignCount: BigInt!
  commitMissCount: BigInt!
  fromBlock: BigInt!
  toBlock: BigInt!
  signingRate: Float!

  # [NEW] 블록 제안 통계
  blocksProposed: BigInt!
  totalBlocks: BigInt!
  proposalRate: Float
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `blocksProposed` | `BigInt!` | 검증자가 제안한 블록 수 | ❌ 누락 |
| `totalBlocks` | `BigInt!` | 쿼리 범위 내 총 블록 수 | ❌ 누락 |
| `proposalRate` | `Float` | 블록 제안 비율 (%) | ❌ 누락 |

---

### 1.7 EpochInfo 타입 확장

```graphql
type EpochInfo {
  epochNumber: BigInt!
  blockNumber: BigInt!
  candidates: [Candidate!]!
  validators: [Int!]!
  blsPublicKeys: [Bytes!]!

  # [NEW] 검증자/후보자 수 통계
  validatorCount: Int!
  candidateCount: Int!
  previousEpochValidatorCount: Int
  timestamp: BigInt
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `validatorCount` | `Int!` | 현재 Epoch 검증자 수 | ❌ 확인 필요 |
| `candidateCount` | `Int!` | 현재 Epoch 후보자 수 | ❌ 확인 필요 |
| `previousEpochValidatorCount` | `Int` | 이전 Epoch 검증자 수 | ❌ 누락 |
| `timestamp` | `BigInt` | Epoch 경계 블록 타임스탬프 | ❌ 누락 |

---

## 2. HistoricalTransactionFilter 확장

기존 필터에 새로운 필터링 옵션이 추가되었습니다.

```graphql
input HistoricalTransactionFilter {
  # 기존 필드
  fromBlock: BigInt!
  toBlock: BigInt!
  minValue: BigInt
  maxValue: BigInt
  txType: Int
  successOnly: Boolean

  # [NEW] Fee Delegation 필터
  isFeeDelegated: Boolean

  # [NEW] 함수 셀렉터 필터 (예: "0xa9059cbb" for transfer)
  methodId: String

  # [NEW] 가스 사용량 범위 필터
  minGasUsed: BigInt
  maxGasUsed: BigInt

  # [NEW] 트랜잭션 방향 필터 (txType 대체)
  direction: TransactionDirection

  # [NEW] 시간 기반 필터 (블록 범위 대신 사용 가능)
  fromTime: BigInt
  toTime: BigInt
}

# [NEW] 트랜잭션 방향 enum
enum TransactionDirection {
  SENT
  RECEIVED
  ALL
}
```

| 필드 | 타입 | 설명 | Frontend 상태 |
|------|------|------|---------------|
| `isFeeDelegated` | `Boolean` | Fee Delegation 트랜잭션만 필터 | ❌ 누락 |
| `methodId` | `String` | 함수 셀렉터로 필터 (예: ERC20 transfer) | ❌ 누락 |
| `minGasUsed` | `BigInt` | 최소 가스 사용량 | ❌ 누락 |
| `maxGasUsed` | `BigInt` | 최대 가스 사용량 | ❌ 누락 |
| `direction` | `TransactionDirection` | SENT/RECEIVED/ALL | ❌ 누락 |
| `fromTime` | `BigInt` | 시작 시간 (Unix timestamp) | ❌ 누락 |
| `toTime` | `BigInt` | 종료 시간 (Unix timestamp) | ❌ 누락 |

**활용 방안**: 주소 상세 페이지에서 고급 트랜잭션 필터링 UI 구현

---

## 3. 새로운 Query 추가

### 3.1 addressStats

주소에 대한 집계 통계를 조회합니다.

```graphql
query GetAddressStats($address: Address!) {
  addressStats(address: $address) {
    address
    totalTransactions
    sentCount
    receivedCount
    successCount
    failedCount
    totalGasUsed
    totalGasCost
    totalValueSent
    totalValueReceived
    contractInteractionCount
    uniqueAddressCount
    firstTransactionTimestamp
    lastTransactionTimestamp
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `totalTransactions` | `Int!` | 총 트랜잭션 수 |
| `sentCount` | `Int!` | 보낸 트랜잭션 수 |
| `receivedCount` | `Int!` | 받은 트랜잭션 수 |
| `successCount` | `Int!` | 성공한 트랜잭션 수 |
| `failedCount` | `Int!` | 실패한 트랜잭션 수 |
| `totalGasUsed` | `BigInt!` | 총 가스 사용량 |
| `totalGasCost` | `BigInt!` | 총 가스 비용 (wei) |
| `totalValueSent` | `BigInt!` | 총 보낸 금액 (wei) |
| `totalValueReceived` | `BigInt!` | 총 받은 금액 (wei) |
| `contractInteractionCount` | `Int!` | 컨트랙트 상호작용 수 |
| `uniqueAddressCount` | `Int!` | 상호작용한 고유 주소 수 |
| `firstTransactionTimestamp` | `BigInt` | 첫 트랜잭션 시간 |
| `lastTransactionTimestamp` | `BigInt` | 마지막 트랜잭션 시간 |

**Frontend 상태**: ❌ 누락

---

### 3.2 epochs (페이지네이션 지원)

Epoch 목록을 페이지네이션으로 조회합니다.

```graphql
query GetEpochs($pagination: PaginationInput) {
  epochs(pagination: $pagination) {
    nodes {
      epochNumber
      blockNumber
      validatorCount
      candidateCount
      timestamp
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Frontend 상태**: ❌ 누락

---

### 3.3 authorizedAccounts

GovCouncil 컨트랙트의 인가된 계정 목록을 조회합니다.

```graphql
query GetAuthorizedAccounts {
  authorizedAccounts
}
```

**반환 타입**: `[Address!]!`

**Frontend 상태**: ❌ 누락

---

### 3.4 activeMinterAddresses

활성 민터의 주소만 간단히 조회합니다 (activeMinters의 단순화 버전).

```graphql
query GetActiveMinterAddresses {
  activeMinterAddresses
}
```

**반환 타입**: `[Address!]!`

**Frontend 상태**: ❌ 누락

---

### 3.5 activeValidatorAddresses

활성 검증자의 주소만 간단히 조회합니다 (activeValidators의 단순화 버전).

```graphql
query GetActiveValidatorAddresses {
  activeValidatorAddresses
}
```

**반환 타입**: `[Address!]!`

**Frontend 상태**: ❌ 누락

---

## 4. 새로운 타입 정의

### 4.1 AddressStats

```graphql
type AddressStats {
  address: Address!
  totalTransactions: Int!
  sentCount: Int!
  receivedCount: Int!
  successCount: Int!
  failedCount: Int!
  totalGasUsed: BigInt!
  totalGasCost: BigInt!
  totalValueSent: BigInt!
  totalValueReceived: BigInt!
  contractInteractionCount: Int!
  uniqueAddressCount: Int!
  firstTransactionTimestamp: BigInt
  lastTransactionTimestamp: BigInt
}
```

**Frontend 상태**: ❌ 누락

---

### 4.2 EpochSummary

경량화된 Epoch 정보입니다 (목록 조회용).

```graphql
type EpochSummary {
  epochNumber: BigInt!
  blockNumber: BigInt!
  validatorCount: Int!
  candidateCount: Int!
  timestamp: BigInt
}
```

**Frontend 상태**: ❌ 누락

---

### 4.3 EpochSummaryConnection

```graphql
type EpochSummaryConnection {
  nodes: [EpochSummary!]!
  totalCount: Int!
  pageInfo: PageInfo!
}
```

**Frontend 상태**: ❌ 누락

---

### 4.4 TransactionDirection (Enum)

```graphql
enum TransactionDirection {
  SENT
  RECEIVED
  ALL
}
```

**Frontend 상태**: ❌ 누락

---

## 5. Fee Delegation 쿼리 확장

기존 Fee Delegation 관련 쿼리에 시간 기반 필터가 추가되었습니다.

### 5.1 feeDelegationStats

```graphql
query GetFeeDelegationStats(
  $fromBlock: BigInt
  $toBlock: BigInt
  $fromTime: BigInt  # [NEW]
  $toTime: BigInt    # [NEW]
) {
  feeDelegationStats(
    fromBlock: $fromBlock
    toBlock: $toBlock
    fromTime: $fromTime
    toTime: $toTime
  ) {
    totalFeeDelegatedTxs
    totalFeesSaved
    adoptionRate
    avgFeeSaved
  }
}
```

### 5.2 topFeePayers

```graphql
query GetTopFeePayers(
  $limit: Int
  $fromBlock: BigInt
  $toBlock: BigInt
  $fromTime: BigInt  # [NEW]
  $toTime: BigInt    # [NEW]
) {
  topFeePayers(
    limit: $limit
    fromBlock: $fromBlock
    toBlock: $toBlock
    fromTime: $fromTime
    toTime: $toTime
  ) {
    nodes {
      address
      txCount
      totalFeesPaid
      percentage
    }
    totalCount
  }
}
```

### 5.3 feePayerStats

```graphql
query GetFeePayerStats(
  $address: Address!
  $fromBlock: BigInt
  $toBlock: BigInt
  $fromTime: BigInt  # [NEW]
  $toTime: BigInt    # [NEW]
) {
  feePayerStats(
    address: $address
    fromBlock: $fromBlock
    toBlock: $toBlock
    fromTime: $fromTime
    toTime: $toTime
  ) {
    address
    txCount
    totalFeesPaid
    percentage
  }
}
```

| 파라미터 | 타입 | 설명 | Frontend 상태 |
|----------|------|------|---------------|
| `fromTime` | `BigInt` | 시작 시간 (Unix timestamp) | ❌ 누락 |
| `toTime` | `BigInt` | 종료 시간 (Unix timestamp) | ❌ 누락 |

---

## 6. 수정 작업 체크리스트

### 6.1 필수 작업 (높은 우선순위)

- [ ] GraphQL codegen 재실행 (`npm run codegen` 또는 `pnpm codegen`)
- [ ] `Transaction.blockTimestamp` 필드 쿼리에 추가
- [ ] `AddressStats` 타입 및 `addressStats` 쿼리 추가
- [ ] `HistoricalTransactionFilter` 확장 필드 추가

### 6.2 권장 작업 (중간 우선순위)

- [ ] `EpochSummary`, `EpochSummaryConnection` 타입 추가
- [ ] `epochs` 페이지네이션 쿼리 추가
- [ ] `TransactionDirection` enum 추가
- [ ] Fee Delegation 쿼리에 시간 필터 파라미터 추가
- [ ] `ValidatorSigningStats` 확장 필드 활용

### 6.3 선택 작업 (낮은 우선순위)

- [ ] `MintEvent.txHash`, `BurnEvent.txHash` 별칭 필드 활용
- [ ] `BurnEvent.burnTxId` 별칭 필드 활용
- [ ] `MinterConfigEvent.isActive` 필드 활용
- [ ] `activeMinterAddresses`, `activeValidatorAddresses` 단순화 쿼리 활용
- [ ] `authorizedAccounts` 쿼리 추가

---

## 7. codegen 실행 방법

```bash
# 프로젝트 루트에서 실행
cd /Users/wm-it-22-00661/Work/github/stable-net/test/indexer-frontend

# GraphQL 스키마 다운로드 및 코드 생성
npm run codegen
# 또는
pnpm codegen
```

**주의사항**:
- codegen 실행 전 백엔드 서버가 실행 중이어야 합니다.
- `codegen.yml` 또는 `codegen.ts` 설정 파일에서 스키마 엔드포인트를 확인하세요.

---

## 8. 참고: 최근 백엔드 커밋 이력

```
54bfa32 test: improve test coverage across multiple packages (Phase 4)
f1d9492 test: add tests for search, analytics, token metadata, and token holder
b08287a test: add storage tests for governance events and fee delegation
f0c191e feat: implement authorized accounts persistence and fix skipped test
d57457f feat(jsonrpc): implement fee delegation field extraction from storage
99566a7 feat: implement fee delegation field extraction from storage (I-1)
e25d565 feat(graphql): add dynamic contract and governance queries (H-1, H-2)
70d703d feat(graphql): add blockTimestamp field to Transaction type
a0d05e7 feat(graphql): sync consensus queries and add frontend field aliases
24089f5 fix(graphql): resolve blocks pagination bug and improve frontend compatibility
e68f649 feat(graphql): add Phase 2-A frontend support queries and filters
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-02-09 | 1.0.0 | 초기 문서 작성 |
