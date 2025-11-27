# Missing GraphQL Queries - Backend Request

> **Date**: 2025-11-27
> **From**: Frontend Team
> **To**: Backend Team
> **Priority**: High

---

## Summary

프론트엔드에서 사용하는 GraphQL 쿼리 중 백엔드 스키마에 정의되지 않았거나, 이름이 다른 쿼리들의 목록입니다.

---

## Category A: Query Name Mismatches (쿼리 이름 불일치)

프론트엔드가 사용하는 쿼리 이름과 백엔드 스키마의 쿼리 이름이 다릅니다.

### A1. `wbftBlock` → `wbftBlockExtra`

| Item | Frontend | Backend |
|------|----------|---------|
| Query Name | `wbftBlock` | `wbftBlockExtra` |
| Parameter | `number: String!` | `blockNumber: BigInt!` |
| File | `lib/hooks/useWBFT.ts:7` | `schema.graphql:499` |

**Frontend Query:**
```graphql
query GetWBFTBlock($number: String!) {
  wbftBlock(number: $number) {
    number, round, step, proposer, lockRound, lockHash,
    commitRound, commitHash, validatorSet, voterBitmap, timestamp
  }
}
```

**Request**:
1. 쿼리 이름을 `wbftBlock`으로 alias 추가 또는
2. 프론트엔드가 필요로 하는 필드들 (`step`, `proposer`, `lockRound`, `lockHash`, `commitRound`, `commitHash`, `validatorSet`, `voterBitmap`) 추가

---

### A2. `latestEpochData` → `latestEpochInfo`

| Item | Frontend | Backend |
|------|----------|---------|
| Query Name | `latestEpochData` | `latestEpochInfo` |
| File | `lib/hooks/useWBFT.ts:27` | `schema.graphql:509` |

**Frontend Expected Response:**
```graphql
{
  epochNumber
  validatorCount
  candidateCount
  validators { address, index, blsPubKey }
  candidates { address, diligence }
}
```

**Backend EpochInfo Type:**
```graphql
type EpochInfo {
  epochNumber: BigInt!
  blockNumber: BigInt!
  candidates: [Candidate!]!
  validators: [Int!]!        # 인덱스 배열
  blsPublicKeys: [Bytes!]!
}
```

**Request**:
1. `latestEpochData` alias 추가 또는
2. `EpochInfo` 타입에 `validatorCount`, `candidateCount` 필드 추가
3. `validators` 필드를 객체 배열로 변경 (현재는 인덱스 배열)

---

### A3. `epochByNumber` → `epochInfo`

| Item | Frontend | Backend |
|------|----------|---------|
| Query Name | `epochByNumber` | `epochInfo` |
| Parameter | `epochNumber: String!` | `epochNumber: BigInt!` |
| File | `lib/hooks/useWBFT.ts:47` | `schema.graphql:506` |

**Request**: `epochByNumber` alias 추가

---

### A4. `allValidatorStats` → `allValidatorsSigningStats`

| Item | Frontend | Backend |
|------|----------|---------|
| Query Name | `allValidatorStats` | `allValidatorsSigningStats` |
| File | `lib/hooks/useConsensus.ts:127` | `schema.graphql:519` |

**Note**: 백엔드에 유사한 기능이 존재하지만 이름과 반환 필드가 다릅니다.

---

## Category B: Missing Queries (존재하지 않는 쿼리)

백엔드 스키마에 정의되지 않은 쿼리들입니다.

### B1. `consensusData` - 특정 블록의 합의 데이터 조회

**Frontend Location**: `lib/hooks/useConsensus.ts:27-65`

```graphql
query GetConsensusData($blockNumber: BigInt!) {
  consensusData(blockNumber: $blockNumber) {
    blockNumber
    blockHash
    round
    prevRound
    roundChanged
    proposer
    validators
    prepareSigners
    commitSigners
    prepareCount
    commitCount
    missedPrepare
    missedCommit
    timestamp
    participationRate
    isHealthy
    isEpochBoundary
    randaoReveal
    gasTip
    epochInfo {
      epochNumber
      validatorCount
      candidateCount
      validators { address, index, blsPubKey }
      candidates { address, diligence }
    }
  }
}
```

**Backend Status**:
- `storage/consensus.go`에 `GetConsensusData()` 메서드가 구현되어 있음
- GraphQL 스키마에는 노출되지 않음

**Request**: GraphQL 스키마에 `consensusData` 쿼리 추가

---

### B2. `validatorStats` - 개별 검증자 통계 조회

**Frontend Location**: `lib/hooks/useConsensus.ts:70-86`

```graphql
query GetValidatorStats($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!) {
  validatorStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) {
    address
    totalBlocks
    blocksProposed
    preparesSigned
    commitsSigned
    preparesMissed
    commitsMissed
    participationRate
    lastProposedBlock
    lastCommittedBlock
    lastSeenBlock
  }
}
```

**Backend Status**:
- `storage/consensus.go`에 `GetValidatorStats()` 메서드가 구현되어 있음
- GraphQL 스키마에는 `validatorSigningStats`가 있지만 반환 필드가 다름

**Request**: GraphQL 스키마에 `validatorStats` 쿼리 추가 또는 `validatorSigningStats`에 필드 추가

---

### B3. `validatorParticipation` - 검증자 참여 상세 조회

**Frontend Location**: `lib/hooks/useConsensus.ts:91-122`

```graphql
query GetValidatorParticipation(
  $address: Address!
  $fromBlock: BigInt!
  $toBlock: BigInt!
  $limit: Int
  $offset: Int
) {
  validatorParticipation(
    address: $address
    fromBlock: $fromBlock
    toBlock: $toBlock
    pagination: { limit: $limit, offset: $offset }
  ) {
    address
    startBlock
    endBlock
    totalBlocks
    blocksProposed
    blocksCommitted
    blocksMissed
    participationRate
    blocks {
      blockNumber
      wasProposer
      signedPrepare
      signedCommit
      round
    }
  }
}
```

**Backend Status**:
- `storage/consensus.go`에 `GetValidatorParticipation()` 메서드가 구현되어 있음
- GraphQL 스키마에는 노출되지 않음

**Request**: GraphQL 스키마에 `validatorParticipation` 쿼리 추가

---

### B4. `epochData` - 특정 에포크 데이터 조회

**Frontend Location**: `lib/hooks/useConsensus.ts:149-166`

```graphql
query GetEpochData($epochNumber: BigInt!) {
  epochData(epochNumber: $epochNumber) {
    epochNumber
    validatorCount
    candidateCount
    validators { address, index, blsPubKey }
    candidates { address, diligence }
  }
}
```

**Backend Status**:
- `epochInfo` 쿼리가 존재하지만 반환 타입이 다름
- `storage/consensus.go`에 `GetEpochInfo()` 메서드가 구현되어 있음

**Request**: `epochInfo`의 반환 타입을 프론트엔드 요구사항에 맞게 수정

---

## Category C: Missing System Contract Queries (시스템 컨트랙트 관련 누락 쿼리)

### C1. `minterConfigHistory` - 민터 설정 이력 조회

**Frontend Location**: `lib/hooks/useSystemContracts.ts:142-153`

```graphql
query GetMinterConfigHistory($fromBlock: BigInt!, $toBlock: BigInt!) {
  minterConfigHistory(fromBlock: $fromBlock, toBlock: $toBlock) {
    blockNumber
    txHash
    minter
    allowance
    isActive
    timestamp
  }
}
```

**Backend Status**: 스키마에 없음

**Request**: `minterConfigHistory` 쿼리 추가

---

### C2. `burnHistory` - 소각 이력 조회 (GovMinter용)

**Frontend Location**: `lib/hooks/useSystemContracts.ts:189-199`

```graphql
query GetBurnHistory($fromBlock: BigInt!, $toBlock: BigInt!, $user: Address) {
  burnHistory(fromBlock: $fromBlock, toBlock: $toBlock, user: $user) {
    blockNumber
    txHash
    burner
    amount
    burnTxId
    timestamp
  }
}
```

**Backend Status**: 스키마에 없음 (기존 `burnEvents`와 다름 - `burnTxId` 필드 필요)

**Request**: `burnHistory` 쿼리 추가 또는 `burnEvents`에 `burnTxId` 필드 추가

---

### C3. `authorizedAccounts` - 승인된 계정 목록 조회 (GovCouncil)

**Frontend Location**: `lib/hooks/useSystemContracts.ts:225-229`

```graphql
query GetAuthorizedAccounts {
  authorizedAccounts
}
```

**Backend Status**: 스키마에 없음

**Request**: `authorizedAccounts` 쿼리 추가

---

## Category D: Field Name Mismatches (필드 이름 불일치)

### D1. Subscription `newBlock.txCount` → `transactionCount`

**Frontend** (`lib/apollo/queries.ts:261`): `txCount`
**Backend** (`schema.graphql:70`): `transactionCount`

---

### D2. MintEvent/BurnEvent `txHash` → `transactionHash`

**Frontend**: `txHash`
**Backend**: `transactionHash`

---

## Summary Table

| # | Query | Frontend Name | Backend Name | Status |
|---|-------|---------------|--------------|--------|
| A1 | WBFT Block | `wbftBlock` | `wbftBlockExtra` | Name mismatch |
| A2 | Latest Epoch | `latestEpochData` | `latestEpochInfo` | Name mismatch |
| A3 | Epoch by Number | `epochByNumber` | `epochInfo` | Name mismatch |
| A4 | All Validator Stats | `allValidatorStats` | `allValidatorsSigningStats` | Name mismatch |
| B1 | Consensus Data | `consensusData` | - | Missing (implemented in storage) |
| B2 | Validator Stats | `validatorStats` | - | Missing (implemented in storage) |
| B3 | Validator Participation | `validatorParticipation` | - | Missing (implemented in storage) |
| B4 | Epoch Data | `epochData` | - | Missing |
| C1 | Minter Config History | `minterConfigHistory` | - | Missing |
| C2 | Burn History | `burnHistory` | - | Missing |
| C3 | Authorized Accounts | `authorizedAccounts` | - | Missing |

---

## Recommended Actions

### Option 1: Backend Adds Aliases (권장)

백엔드에서 기존 쿼리에 alias를 추가하여 프론트엔드가 사용하는 이름도 지원:

```graphql
type Query {
  # Existing
  wbftBlockExtra(blockNumber: BigInt!): WBFTBlockExtra
  latestEpochInfo: EpochInfo
  epochInfo(epochNumber: BigInt!): EpochInfo

  # Aliases for frontend compatibility
  wbftBlock(number: BigInt!): WBFTBlockExtra  # alias
  latestEpochData: EpochInfo                   # alias
  epochByNumber(epochNumber: BigInt!): EpochInfo  # alias
}
```

### Option 2: Frontend Updates Query Names

프론트엔드에서 백엔드 스키마에 맞게 쿼리 이름을 변경.
(이 경우 필드 구조 불일치도 함께 수정 필요)

### Option 3: Add Missing GraphQL Resolvers

`storage/consensus.go`에 이미 구현된 메서드들을 GraphQL에 노출:
- `consensusData`
- `validatorStats`
- `validatorParticipation`

---

## Contact

질문이 있으시면 프론트엔드 팀에 연락해 주세요.
