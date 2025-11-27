# Frontend-Backend GraphQL Schema Audit Report

> **Date**: 2025-11-27
> **Purpose**: Compare frontend queries with backend GraphQL schema
> **Backend Schema Location**: `/indexer-go/api/graphql/schema.graphql`

---

## Executive Summary

프론트엔드와 백엔드 간의 GraphQL 스키마를 비교한 결과, **다수의 불일치점**이 발견되었습니다.

| Category | Critical | High | Medium | Total |
|----------|----------|------|--------|-------|
| Query Name Mismatch | 6 | - | - | 6 |
| Field Name Mismatch | 3 | - | - | 3 |
| Type Mismatch | 4 | - | - | 4 |
| Return Type Mismatch | 3 | - | - | 3 |
| Missing Queries | 5 | - | - | 5 |
| Structure Mismatch | 4 | - | - | 4 |

---

## 1. WBFT/Consensus Page Issues

### 1.1 Query Name: `wbftBlock` vs `wbftBlockExtra` ❌ CRITICAL

**Frontend** (`lib/hooks/useWBFT.ts:7-23`):
```graphql
query GetWBFTBlock($number: String!) {
  wbftBlock(number: $number) {
    number
    round
    step
    proposer
    lockRound
    lockHash
    commitRound
    commitHash
    validatorSet
    voterBitmap
    timestamp
  }
}
```

**Backend** (`schema.graphql:499-500`):
```graphql
wbftBlockExtra(blockNumber: BigInt!): WBFTBlockExtra
```

**Backend WBFTBlockExtra Type**:
```graphql
type WBFTBlockExtra {
  blockNumber: BigInt!
  blockHash: Hash!
  randaoReveal: Bytes!
  prevRound: Int!
  prevPreparedSeal: WBFTAggregatedSeal
  prevCommittedSeal: WBFTAggregatedSeal
  round: Int!
  preparedSeal: WBFTAggregatedSeal
  committedSeal: WBFTAggregatedSeal
  gasTip: BigInt
  epochInfo: EpochInfo
  timestamp: BigInt!
}
```

**Issues**:
- Query name: `wbftBlock` → `wbftBlockExtra`
- Parameter name: `number` → `blockNumber`
- Missing fields in backend: `step`, `proposer`, `lockRound`, `lockHash`, `commitRound`, `commitHash`, `validatorSet`, `voterBitmap`
- Additional fields in backend: `blockHash`, `randaoReveal`, `prevRound`, `prevPreparedSeal`, `prevCommittedSeal`, `preparedSeal`, `committedSeal`, `gasTip`, `epochInfo`

---

### 1.2 Query Name: `latestEpochData` vs `latestEpochInfo` ❌ CRITICAL

**Frontend** (`lib/hooks/useWBFT.ts:27-44`):
```graphql
query GetLatestEpoch {
  latestEpochData {
    epochNumber
    validatorCount
    candidateCount
    validators { address, index, blsPubKey }
    candidates { address, diligence }
  }
}
```

**Backend** (`schema.graphql:509`):
```graphql
latestEpochInfo: EpochInfo
```

**Backend EpochInfo Type**:
```graphql
type EpochInfo {
  epochNumber: BigInt!
  blockNumber: BigInt!
  candidates: [Candidate!]!
  validators: [Int!]!        # Note: This is an array of indices, not objects!
  blsPublicKeys: [Bytes!]!
}
```

**Issues**:
- Query name: `latestEpochData` → `latestEpochInfo`
- `validatorCount`, `candidateCount` not in backend
- `validators` returns `[Int!]!` (indices), not objects with `{address, index, blsPubKey}`
- `blsPublicKeys` is a separate array, not part of validator object

---

### 1.3 Query Name: `epochByNumber` vs `epochInfo` ❌ CRITICAL

**Frontend** (`lib/hooks/useWBFT.ts:47-65`):
```graphql
query GetEpochByNumber($epochNumber: String!) {
  epochByNumber(epochNumber: $epochNumber) {
    epochNumber
    startBlock
    endBlock
    startTime
    endTime
    validatorCount
    totalStake
    status
    validators { address, stake, votingPower }
  }
}
```

**Backend** (`schema.graphql:506`):
```graphql
epochInfo(epochNumber: BigInt!): EpochInfo
```

**Issues**:
- Query name: `epochByNumber` → `epochInfo`
- Parameter type: `String!` → `BigInt!`
- Fields `startBlock`, `endBlock`, `startTime`, `endTime`, `totalStake`, `status` don't exist in backend

---

### 1.4 Response Type: `blockSigners` Field Mismatch ❌ CRITICAL

**Frontend** (`lib/hooks/useWBFT.ts:102-111`):
```graphql
query GetBlockSigners($blockNumber: String!) {
  blockSigners(blockNumber: $blockNumber) {
    blockNumber
    signers
    bitmap
    timestamp
  }
}
```

**Backend** (`schema.graphql:534`, `1196-1205`):
```graphql
blockSigners(blockNumber: BigInt!): BlockSigners

type BlockSigners {
  blockNumber: BigInt!
  preparers: [Address!]!
  committers: [Address!]!
}
```

**Issues**:
- Parameter type: `String!` → `BigInt!`
- Missing fields in backend: `signers`, `bitmap`, `timestamp`
- Backend provides: `preparers`, `committers` (different structure)

---

## 2. Consensus Page Issues (`useConsensus.ts`)

### 2.1 Query Does Not Exist: `consensusData` ❌ CRITICAL

**Frontend** (`lib/hooks/useConsensus.ts:27-65`):
```graphql
query GetConsensusData($blockNumber: BigInt!) {
  consensusData(blockNumber: $blockNumber) {
    blockNumber, blockHash, round, prevRound, roundChanged,
    proposer, validators, prepareSigners, commitSigners,
    prepareCount, commitCount, missedPrepare, missedCommit,
    timestamp, participationRate, isHealthy, isEpochBoundary,
    randaoReveal, gasTip, epochInfo { ... }
  }
}
```

**Backend**: Query `consensusData` does not exist.

**Similar Query in Backend**:
- `wbftBlockExtra(blockNumber: BigInt!)` provides some of this data

---

### 2.2 Query Does Not Exist: `validatorStats` ❌ CRITICAL

**Frontend** (`lib/hooks/useConsensus.ts:70-86`):
```graphql
query GetValidatorStats($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!) {
  validatorStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) { ... }
}
```

**Backend**: Query `validatorStats` does not exist.

**Similar Query in Backend**:
```graphql
validatorSigningStats(
  validatorAddress: Address!
  fromBlock: BigInt!
  toBlock: BigInt!
): ValidatorSigningStats
```

---

### 2.3 Query Does Not Exist: `validatorParticipation` ❌

**Frontend**: `lib/hooks/useConsensus.ts:91-122`

**Backend**: Does not exist.

---

### 2.4 Query Does Not Exist: `allValidatorStats` ❌

**Frontend** (`lib/hooks/useConsensus.ts:127-144`):
```graphql
query GetAllValidatorStats($fromBlock: BigInt!, $toBlock: BigInt!, ...) {
  allValidatorStats(fromBlock: $fromBlock, toBlock: $toBlock, ...) { ... }
}
```

**Backend Similar Query**:
```graphql
allValidatorsSigningStats(
  fromBlock: BigInt!
  toBlock: BigInt!
  pagination: PaginationInput
): ValidatorSigningStatsConnection!
```

---

### 2.5 Query Does Not Exist: `epochData` ❌

**Frontend** (`lib/hooks/useConsensus.ts:149-166`):
```graphql
query GetEpochData($epochNumber: BigInt!) {
  epochData(epochNumber: $epochNumber) { ... }
}
```

**Backend**: `epochInfo(epochNumber: BigInt!)` exists instead.

---

## 3. System Contracts Page Issues

### 3.1 Query Structure: `mintEvents` ❌ CRITICAL

**Frontend** (`lib/hooks/useSystemContracts.ts:28-51`):
```graphql
query GetMintEvents(
  $fromBlock: BigInt!
  $toBlock: BigInt!
  $minter: Address
  $limit: Int!
  $offset: Int!
) {
  mintEvents(
    fromBlock: $fromBlock
    toBlock: $toBlock
    minter: $minter
    limit: $limit
    offset: $offset
  ) {
    blockNumber
    txHash           # ← Wrong field name
    minter
    to
    amount
    timestamp
  }
}
```

**Backend** (`schema.graphql:421-425`):
```graphql
mintEvents(
  filter: SystemContractEventFilter!
  pagination: PaginationInput
): MintEventConnection!

type MintEvent {
  blockNumber: BigInt!
  transactionHash: Hash!  # ← Correct field name
  minter: Address!
  to: Address!
  amount: BigInt!
  timestamp: BigInt!
}

input SystemContractEventFilter {
  fromBlock: BigInt!
  toBlock: BigInt!
  address: Address
}
```

**Issues**:
- Query structure is completely different (separate arguments vs filter object)
- Field name: `txHash` → `transactionHash`

---

### 3.2 Query Structure: `burnEvents` ❌ CRITICAL

Same structure issue as `mintEvents`.

---

### 3.3 Return Type: `activeMinters` ❌ CRITICAL

**Frontend** (`lib/hooks/useSystemContracts.ts:77-81`):
```graphql
query GetActiveMinters {
  activeMinters  # Expects [String!]! (address array)
}
```

**Backend** (`schema.graphql:434`):
```graphql
activeMinters: [MinterInfo!]!

type MinterInfo {
  address: Address!
  allowance: BigInt!
  isActive: Boolean!
}
```

**Issue**: Frontend expects array of addresses, backend returns array of objects.

---

### 3.4 Return Type: `activeValidators` (in useSystemContracts.ts) ❌

**Frontend** (`lib/hooks/useSystemContracts.ts:106-110`):
```graphql
query GetActiveValidators {
  activeValidators  # Expects [String!]! (address array)
}
```

**Backend** (`schema.graphql:443`):
```graphql
activeValidators: [ValidatorInfo!]!

type ValidatorInfo {
  address: Address!
  isActive: Boolean!
}
```

**Note**: `useWBFT.ts` correctly expects objects, but `useSystemContracts.ts` expects strings.

---

### 3.5 Query Structure: `gasTipHistory` ❌

**Frontend** (`lib/hooks/useSystemContracts.ts:112-123`):
```graphql
query GetGasTipHistory($fromBlock: BigInt!, $toBlock: BigInt!) {
  gasTipHistory(fromBlock: $fromBlock, toBlock: $toBlock) { ... }
}
```

**Backend** (`schema.graphql:451-453`):
```graphql
gasTipHistory(
  filter: SystemContractEventFilter!
): [GasTipUpdateEvent!]!
```

**Issue**: Different parameter structure (separate args vs filter object).

---

### 3.6 Queries Do Not Exist ❌

- `minterConfigHistory` - Does not exist in backend
- `burnHistory` - Does not exist in backend
- `authorizedAccounts` - Does not exist in backend

---

### 3.7 Query Structure: `proposals` (in useSystemContracts.ts) ❌

**Frontend** (`lib/hooks/useSystemContracts.ts:235-256`):
```graphql
query GetProposals(
  $contract: Address!
  $status: ProposalStatus!
  $limit: Int!
  $offset: Int!
) {
  proposals(contract: $contract, status: $status, limit: $limit, offset: $offset) {
    proposalId
    contract
    proposer
    targetFunction     # ← Not in backend
    calldata           # ← Named differently
    createdAt          # ← Different type (timestamp vs BigInt)
    votingEndsAt       # ← Not in backend
    executedAt
    status
    yesVotes           # ← Not in backend
    noVotes            # ← Not in backend
  }
}
```

**Backend** (`schema.graphql:464-467`):
```graphql
proposals(
  filter: ProposalFilter!
  pagination: PaginationInput
): ProposalConnection!

type Proposal {
  contract: Address!
  proposalId: BigInt!
  proposer: Address!
  actionType: Bytes!     # ← Different name
  callData: Bytes!       # ← CamelCase
  memberVersion: BigInt!
  requiredApprovals: Int!
  approved: Int!         # ← Different from yesVotes
  rejected: Int!         # ← Different from noVotes
  status: ProposalStatus!
  createdAt: BigInt!
  executedAt: BigInt
  blockNumber: BigInt!
  transactionHash: Hash!
}
```

---

## 4. Governance Page Issues (`useGovernance.ts`)

### 4.1 ProposalFilter.contract Nullability ⚠️ HIGH

**Frontend** (`lib/hooks/useGovernance.ts:21-23`):
```graphql
query GetProposals($contract: String, $status: ProposalStatus, ...) {
  proposals(filter: { contract: $contract, status: $status }, ...) { ... }
}
```

**Backend** (`schema.graphql:1050-1059`):
```graphql
input ProposalFilter {
  contract: Address!    # Required, not nullable
  status: ProposalStatus
  proposer: Address
}
```

**Issue**: Frontend treats `contract` as optional, but backend requires it.

---

### 4.2 proposalVotes Parameter Type ❌

**Frontend** (`lib/hooks/useGovernance.ts:73-84`):
```graphql
query GetProposalVotes($contract: String!, $proposalId: String!) {
  proposalVotes(contract: $contract, proposalId: $proposalId) { ... }
}
```

**Backend** (`schema.graphql:476-479`):
```graphql
proposalVotes(
  contract: Address!
  proposalId: BigInt!  # ← Not String!
): [ProposalVote!]!
```

---

## 5. Subscriptions Issues (`queries.ts`)

### 5.1 newBlock Field Name ❌

**Frontend** (`lib/apollo/queries.ts:253-264`):
```graphql
subscription NewBlock {
  newBlock {
    number
    hash
    parentHash
    timestamp
    miner
    txCount        # ← Wrong field name
  }
}
```

**Backend** (`schema.graphql:17-74`):
```graphql
type Block {
  ...
  transactionCount: Int!  # ← Correct field name
}
```

---

### 5.2 logs Subscription Filter Type ❌

**Frontend** (`lib/apollo/queries.ts:316-330`):
```graphql
subscription Logs($filter: LogFilterInput!) {
  logs(filter: $filter) { ... }
}
```

**Backend** (`schema.graphql:327`):
```graphql
logs(filter: LogFilter!): Log!  # LogFilter, not LogFilterInput
```

---

## 6. General Type Inconsistencies

### 6.1 String vs BigInt/Address Scalar Types

Many frontend queries use `String!` where backend uses `BigInt!` or `Address!`:

| Hook | Parameter | Frontend Type | Backend Type |
|------|-----------|---------------|--------------|
| useWBFT.ts | blockNumber | String! | BigInt! |
| useConsensus.ts | blockNumber | BigInt! | BigInt! (correct) |
| useConsensus.ts | address | Address! | Address! (correct) |
| useGovernance.ts | contract | String! | Address! |
| useGovernance.ts | proposalId | String! | BigInt! |

**Note**: Apollo Client may serialize these correctly, but type consistency is recommended.

---

## 7. Summary of Required Changes

### Backend Changes Required

1. **Add Queries** (if needed for frontend features):
   - `consensusData` - Or provide alternative endpoint
   - `validatorStats` - Or rename frontend to use `validatorSigningStats`
   - `validatorParticipation`
   - `minterConfigHistory`
   - `burnHistory`
   - `authorizedAccounts`

2. **Fix ProposalFilter.contract** - Make nullable if frontend needs to query all proposals

3. **Verify Feature Support** - Some queries require consensus storage or address indexing to be enabled

### Frontend Changes Required

1. **Query Names**:
   - `wbftBlock` → `wbftBlockExtra`
   - `latestEpochData` → `latestEpochInfo`
   - `epochByNumber` → `epochInfo`
   - `allValidatorStats` → `allValidatorsSigningStats`

2. **Field Names**:
   - `txHash` → `transactionHash` (in mintEvents, burnEvents)
   - `txCount` → `transactionCount` (in newBlock subscription)

3. **Query Structures**:
   - Update `mintEvents`, `burnEvents`, `gasTipHistory` to use `filter` object pattern
   - Update `proposals` query to use `ProposalFilter` input type

4. **Return Type Handling**:
   - `activeMinters` returns objects, extract `.address` if needed
   - `activeValidators` returns objects, extract `.address` if needed

5. **Type Consistency**:
   - Use `BigInt!` or `Address!` instead of `String!` where appropriate
   - Or ensure backend accepts String serialization for scalars

---

## 8. Affected Pages

| Page | Severity | Issues Count | Status |
|------|----------|--------------|--------|
| `/wbft` | Critical | 4 | Queries don't match |
| `/epochs` | Critical | 2 | Queries don't match |
| `/consensus` | Critical | 5 | Many queries don't exist |
| `/system-contracts` | Critical | 7 | Structure mismatches |
| `/governance` | High | 2 | Filter issues |
| `/blocks` | Low | 0 | Working (after cache fix) |
| `/txs` | Low | 0 | Working |
| `/stats` | Low | 0 | Working |

---

## 9. Recommended Action Plan

### Phase 1: Critical Fixes (Blocking)
1. Fix subscription `txCount` → `transactionCount`
2. Fix `activeMinters` and `activeValidators` response handling
3. Update `mintEvents`, `burnEvents` query structures

### Phase 2: Schema Alignment
1. Rename queries to match backend naming
2. Update field names in queries
3. Fix parameter types

### Phase 3: Feature Completion
1. Decide on missing queries (add to backend or remove from frontend)
2. Enable consensus storage if needed for WBFT features
3. Enable address indexing if needed

---

## Contact

For questions about this audit, please contact the frontend team.
