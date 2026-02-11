# Backend Integration Status

> **Last Updated**: 2026-02-12
> **Project**: indexer-frontend ↔ indexer-go
> **Purpose**: 백엔드 연동 현황의 단일 진실 공급원 (Single Source of Truth)

---

## 1. 완료된 작업 (Resolved)

### 1.1 쿼리 동기화 완료

| Query | Frontend | Backend | 상태 |
|-------|----------|---------|------|
| `wbftBlockExtra` | `useWBFT.ts`, `useConsensus.ts` | schema:500 | ✅ Synced |
| `epochInfo` | `useWBFT.ts`, `useConsensus.ts` | schema:506 | ✅ Synced |
| `latestEpochInfo` | `useWBFT.ts`, `useConsensus.ts` | schema:509 | ✅ Synced |
| `validatorSigningStats` | `useConsensus.ts` | schema:512 | ✅ Synced |
| `allValidatorsSigningStats` | `useWBFT.ts`, `useConsensus.ts` | schema:519 | ✅ Synced |
| `validatorSigningActivity` | `useConsensus.ts` | schema:526 | ✅ Synced |
| `blockSigners` | `useWBFT.ts`, `useConsensus.ts` | schema:534 | ✅ Synced |
| `activeValidators` | `useWBFT.ts` | schema:443 | ✅ Synced |
| `totalSupply` | `useSystemContracts.ts` | schema:419 | ✅ Synced |
| `mintEvents` | `useSystemContracts.ts` | schema:422 | ✅ Synced |
| `burnEvents` | `useSystemContracts.ts` | schema:428 | ✅ Synced |
| `activeMinters` | `useSystemContracts.ts` | schema:434 | ✅ Synced |
| `minterAllowance` | `useSystemContracts.ts` | schema:437 | ✅ Synced |
| `proposals` | `useSystemContracts.ts` | schema:464 | ✅ Synced |
| `proposal` | `useSystemContracts.ts` | schema:469 | ✅ Synced |
| `proposalVotes` | `useSystemContracts.ts` | schema:476 | ✅ Synced |
| `depositMintProposals` | `useSystemContracts.ts` | schema:491 | ✅ Synced |
| `blacklistedAddresses` | `useSystemContracts.ts` | schema:456 | ✅ Synced |
| `blacklistHistory` | `useSystemContracts.ts` | schema:459 | ✅ Synced |
| `gasTipHistory` | `useSystemContracts.ts` | schema:451 | ✅ Synced |
| Search API | - | - | ✅ 연동 완료 |
| Top Miners API | - | - | ✅ 연동 완료 |
| Token Balance API | - | - | ✅ 연동 완료 |

### 1.2 타입 수정 완료

| 항목 | 내용 | 상태 |
|------|------|------|
| `ValidatorSigningStats` | counts를 `number` → `string` 변환 | ✅ Fixed |
| `EpochInfo.validators` | 인덱스 배열 (`number[]`)로 올바르게 정의 | ✅ Synced |
| `ProposalStatus` enum | UPPERCASE 값으로 통일 | ✅ Synced |
| `WBFTBlockExtra` | 프론트엔드 타입 백엔드 스키마와 일치 | ✅ Synced |

### 1.3 해결된 이슈

| 이슈 | 설명 | 상태 |
|------|------|------|
| `ProposalFilter.status` 타입 | `String` → `ProposalStatus` enum 변경 | ✅ Resolved |
| `Address` 타입 미지원 | `String` 사용으로 변경 | ✅ Resolved |
| `ProposalFilter.proposer` 미지원 | 프론트엔드에서 필터 파라미터 제거 | ✅ Resolved |
| `useBurnHistory` | `burnEvents` 쿼리 올바르게 사용 | ✅ Fixed |
| `useDepositMintProposals` | 잘못된 기본 status 값 제거 | ✅ Fixed |

---

## 2. 미해결 이슈 (Open Issues) - 우선순위별

### 2.1 Critical (Blocking)

#### Issue: Consensus Storage Not Enabled
- **에러**: `storage does not support consensus operations`
- **영향 페이지**: `/wbft`, `/epochs`, `/validators`
- **영향 쿼리**: `latestEpochInfo`, `epochInfo`, `allValidatorsSigningStats`, `blockSigners`, `wbftBlockExtra`
- **프론트엔드 워크어라운드**: `isSupported: false` 플래그로 graceful degradation 처리 중
- **필요 조치**: 백엔드에서 consensus storage 활성화

#### Issue: `ProposalFilter.contract` Non-nullable
- **에러**: `Variable "$contract" of type "String" used in position expecting type "String!"`
- **영향**: 전체 제안 목록 조회 시 에러 (계약 주소 없이 조회 불가)
- **필요 조치**: `ProposalFilter.contract`를 `String!` → `String`으로 변경

#### Issue: Blocks Pagination Empty with Offset
- **증상**: offset > 0일 때 빈 결과 및 `totalCount: 0` 반환
- **영향**: 블록 목록 2페이지 이상 조회 불가
- **필요 조치**: 백엔드 blocks 쿼리 페이지네이션 수정

### 2.2 High Priority

#### 누락된 GraphQL 타입 확장 필드

| 타입 | 필드 | 설명 | 용도 |
|------|------|------|------|
| `ValidatorSigningStats` | `blocksProposed` (BigInt!) | 제안한 블록 수 | ValidatorHeatmap |
| `ValidatorSigningStats` | `totalBlocks` (BigInt!) | 총 블록 수 | ValidatorHeatmap |
| `ValidatorSigningStats` | `proposalRate` (Float) | 블록 제안 비율 | ValidatorHeatmap |
| `EpochInfo` | `previousEpochValidatorCount` (Int) | 이전 에포크 검증자 수 | EpochTimeline |
| `EpochInfo` | `timestamp` (BigInt) | 에포크 시작 타임스탬프 | EpochTimeline |
| `EpochInfo` | `validatorCount` (Int!) | 검증자 수 | EpochTimeline |
| `EpochInfo` | `candidateCount` (Int!) | 후보자 수 | EpochTimeline |
| `Transaction` | `blockTimestamp` (BigInt) | 블록 타임스탬프 | TX 목록 시간 표시 |

#### 누락된 필터 확장

| 필터 | 설명 | 우선순위 |
|------|------|----------|
| `HistoricalTransactionFilter.isFeeDelegated` (Boolean) | Fee Delegation 필터 | **High** |
| `HistoricalTransactionFilter.methodId` (String) | 함수 셀렉터 필터 | Medium |
| `HistoricalTransactionFilter.minGasUsed/maxGasUsed` (BigInt) | 가스 사용량 범위 | Medium |
| `HistoricalTransactionFilter.direction` (TransactionDirection) | SENT/RECEIVED/ALL | Medium |
| `HistoricalTransactionFilter.fromTime/toTime` (BigInt) | 시간 기반 필터 | Medium |
| `FeeDelegationStats fromTime/toTime` (BigInt) | Fee Delegation 시간 필터 | Medium |

### 2.3 Medium Priority

#### 누락된 신규 쿼리

| 쿼리 | 설명 | 백엔드 구현 상태 |
|------|------|-----------------|
| `epochs` (paginated) | 에포크 목록 페이지네이션 | ❌ 스키마 미등록 |
| `addressStats` | 주소별 집계 통계 | ❌ 스키마 미등록 |
| `consensusData` | 특정 블록 합의 데이터 | storage에 구현됨, GraphQL 미노출 |
| `validatorStats` | 개별 검증자 상세 통계 | storage에 구현됨, GraphQL 미노출 |
| `validatorParticipation` | 검증자 참여 상세 | storage에 구현됨, GraphQL 미노출 |
| `minterConfigHistory` | 민터 설정 이력 | ❌ 스키마 미등록 |
| `authorizedAccounts` | GovCouncil 인가 계정 | ❌ 스키마 미등록 |
| `activeMinterAddresses` | 활성 민터 주소 (단순화) | ❌ 스키마 미등록 |
| `activeValidatorAddresses` | 활성 검증자 주소 (단순화) | ❌ 스키마 미등록 |
| `blockByTimestamp` | 타임스탬프→블록 변환 | ❌ 스키마 미등록 |

#### 누락된 신규 타입

| 타입 | 설명 |
|------|------|
| `AddressStats` | 주소 집계 통계 타입 |
| `EpochSummary` | 경량 에포크 정보 (목록용) |
| `EpochSummaryConnection` | 에포크 목록 페이지네이션 |
| `TransactionDirection` enum | SENT/RECEIVED/ALL |

#### 필드 별칭 (호환성)

| 타입 | 별칭 필드 | 원본 필드 | 프론트엔드 상태 |
|------|-----------|-----------|----------------|
| `MintEvent` | `txHash` | `transactionHash` | ❌ 누락 |
| `BurnEvent` | `txHash` | `transactionHash` | ❌ 누락 |
| `BurnEvent` | `burnTxId` | `withdrawalId` | ❌ 누락 |
| `MinterConfigEvent` | `txHash` | `transactionHash` | ❌ 누락 |
| `MinterConfigEvent` | `isActive` | action 파생 | ❌ 누락 |

### 2.4 확인 필요 (Clarification Needed)

| 항목 | 질문 | 영향 |
|------|------|------|
| BigInt vs String 파라미터 | `BigInt!`가 문자열로 전달되는 것이 호환되는지? | 컨센서스 쿼리 전체 |
| 컨센서스 구독 | `consensusBlock`, `consensusError` 등 구독 추가 예정? | 실시간 컨센서스 모니터링 |
| `minterHistory` vs `minterConfigHistory` | 프론트엔드 쿼리명 수정 필요? | useGovernance.ts |

---

## 3. 누락 쿼리 상세 (Missing Queries Detail)

### 3.1 `epochs` - 에포크 목록 조회

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
    pageInfo { hasNextPage, hasPreviousPage }
  }
}
```

### 3.2 `addressStats` - 주소 통계 조회

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

### 3.3 `consensusData` - 블록 합의 데이터

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
    epochInfo { epochNumber, validatorCount, candidateCount }
  }
}
```
> **Note**: `storage/consensus.go`에 `GetConsensusData()` 구현됨. GraphQL resolver만 추가 필요.

### 3.4 `validatorStats` - 개별 검증자 통계

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
> **Note**: `storage/consensus.go`에 `GetValidatorStats()` 구현됨. GraphQL resolver만 추가 필요.

### 3.5 `validatorParticipation` - 검증자 참여 상세

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
> **Note**: `storage/consensus.go`에 `GetValidatorParticipation()` 구현됨. GraphQL resolver만 추가 필요.

---

## 4. 다음 작업 (Next Steps)

### 백엔드 팀 Action Items

#### P1 - 즉시 (Blocking Issues)
- [ ] Consensus storage 활성화
- [ ] `ProposalFilter.contract`를 nullable로 변경 (`String!` → `String`)
- [ ] Blocks pagination offset 버그 수정
- [ ] `blocksProposed`, `totalBlocks` 필드를 `ValidatorSigningStats`에 추가
- [ ] `isFeeDelegated` 필터를 `HistoricalTransactionFilter`에 추가

#### P2 - 다음 스프린트
- [ ] `epochs` paginated 쿼리 추가
- [ ] Fee Delegation 쿼리에 `fromTime`/`toTime` 파라미터 추가
- [ ] `EpochInfo`에 `previousEpochValidatorCount`, `timestamp` 추가
- [ ] `consensusData`, `validatorStats`, `validatorParticipation` GraphQL resolver 추가
- [ ] `Transaction.blockTimestamp` 필드 추가

#### P3 - 향후
- [ ] `addressStats` dedicated 쿼리 추가
- [ ] `blockByTimestamp` helper 쿼리 추가
- [ ] `minterConfigHistory` 쿼리 추가
- [ ] `authorizedAccounts` 쿼리 추가
- [ ] `activeMinterAddresses`, `activeValidatorAddresses` 단순화 쿼리 추가
- [ ] MintEvent/BurnEvent 별칭 필드(`txHash`, `burnTxId`) 추가

### 프론트엔드 팀 Action Items (백엔드 완료 후)

- [ ] GraphQL codegen 재실행 (`pnpm codegen`)
- [ ] `minterConfigHistory` → `minterHistory` 쿼리명 수정 (useGovernance.ts)
- [ ] `authorizedAccounts` 누락 쿼리 처리 (graceful handling)
- [ ] 컨센서스 쿼리 BigInt/String 파라미터 호환성 확인 후 수정
- [ ] 새 필드/쿼리 추가 시 관련 컴포넌트 업데이트
- [ ] Contract Verification API Mock → 실제 API 교체

---

## 참고: 백엔드 커밋 이력

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

## 참고: 프론트엔드 파일 위치

| 파일 | 용도 |
|------|------|
| `lib/hooks/useConsensusQueries.ts` | 컨센서스 쿼리 hooks |
| `lib/hooks/useConsensusSubscriptions.ts` | 컨센서스 구독 hooks |
| `lib/hooks/useWBFT.ts` | WBFT/에포크 hooks |
| `lib/hooks/useGovernance.ts` | 거버넌스 hooks |
| `lib/hooks/useNativeCoinAdapter.ts` | 토큰 래퍼 hooks |
| `lib/hooks/useContractSubscriptions.ts` | 시스템 컨트랙트 구독 |
| `lib/apollo/queries.ts` | GraphQL 쿼리 정의 |

---

## Notes for Backend Team

1. **BigInt Handling**: 모든 큰 숫자 필드(블록 번호, 가스 값, wei 금액)는 JavaScript 정밀도 보존을 위해 `String`으로 반환
2. **Timestamp Format**: 모든 타임스탬프 필드는 Unix timestamp (BigInt) 사용
3. **Backward Compatibility**: 시간 기반 필터 추가 시 기존 블록 범위 파라미터 유지
4. **Pagination**: 모든 목록 쿼리에 `limit`, `offset`, `totalCount`, `pageInfo` 지원

---

*이 문서는 백엔드-프론트엔드 동기화 상태의 단일 진실 공급원입니다. 변경 시 이 문서를 업데이트하세요.*
*통합 원본: BACKEND_REQUIREMENTS.md, BACKEND_SYNC_REQUIREMENTS.md, MISSING_QUERIES_FOR_BACKEND.md, tobackend.md, FRONTEND_BACKEND_SYNC_ANALYSIS.md, FEATURE_ANALYSIS.md (백엔드 의존 항목)*
