# Frontend-Backend GraphQL Sync Analysis

> **Date**: 2025-11-27
> **Status**: Waiting for Backend Completion
> **Purpose**: 백엔드 작업 완료 후 프론트엔드 수정을 위한 분석 문서

---

## 1. Analysis Summary

백엔드 GraphQL 스키마(`indexer-go/api/graphql/schema.graphql`)와 프론트엔드 hooks 코드를 비교 분석한 결과입니다.

### 1.1 Backend Schema Location
```
/Users/wm-it-22-00661/Work/github/stable-net/test/indexer-go/api/graphql/schema.graphql
```

### 1.2 Frontend Hooks Locations
```
lib/hooks/useConsensus.ts      - Consensus/WBFT 관련 hooks
lib/hooks/useWBFT.ts           - WBFT block/epoch 관련 hooks
lib/hooks/useSystemContracts.ts - System contract 관련 hooks
lib/hooks/useAnalytics.ts      - Analytics 관련 hooks
lib/hooks/useNetworkMetrics.ts - Network metrics 관련 hooks
```

---

## 2. Query Sync Status

### 2.1 WBFT/Consensus Queries

| Query Name | Frontend | Backend | Status | Notes |
|------------|----------|---------|--------|-------|
| `wbftBlockExtra` | `useWBFT.ts:8`, `useConsensus.ts:29` | schema:500 | ✅ Synced | 파라미터 타입 확인 필요 |
| `wbftBlockExtraByHash` | Not used | schema:503 | ➖ N/A | 필요시 추가 |
| `epochInfo` | `useWBFT.ts:57`, `useConsensus.ts:149` | schema:506 | ✅ Synced | |
| `latestEpochInfo` | `useWBFT.ts:41`, `useConsensus.ts:167` | schema:509 | ✅ Synced | |
| `validatorSigningStats` | `useConsensus.ts:64` | schema:512 | ✅ Synced | |
| `allValidatorsSigningStats` | `useWBFT.ts:73`, `useConsensus.ts:118` | schema:519 | ✅ Synced | |
| `validatorSigningActivity` | `useConsensus.ts:82` | schema:526 | ✅ Synced | |
| `blockSigners` | `useWBFT.ts:106`, `useConsensus.ts:184` | schema:534 | ✅ Synced | |
| `activeValidators` | `useWBFT.ts:118` | schema:443 | ✅ Synced | |

### 2.2 System Contract Queries

| Query Name | Frontend | Backend | Status | Notes |
|------------|----------|---------|--------|-------|
| `totalSupply` | `useSystemContracts.ts` | schema:419 | ✅ Synced | |
| `mintEvents` | `useSystemContracts.ts` | schema:422 | ✅ Synced | |
| `burnEvents` | `useSystemContracts.ts` | schema:428 | ✅ Synced | |
| `activeMinters` | `useSystemContracts.ts` | schema:434 | ✅ Synced | |
| `minterAllowance` | `useSystemContracts.ts` | schema:437 | ✅ Synced | |
| `minterHistory` | Not used correctly | schema:440 | ⚠️ Mismatch | Frontend uses different query name |
| `proposals` | `useSystemContracts.ts` | schema:464 | ✅ Synced | |
| `proposal` | `useSystemContracts.ts` | schema:469 | ✅ Synced | |
| `proposalVotes` | `useSystemContracts.ts` | schema:476 | ✅ Synced | |
| `depositMintProposals` | `useSystemContracts.ts` | schema:491 | ✅ Synced | |
| `blacklistedAddresses` | `useSystemContracts.ts` | schema:456 | ✅ Synced | |
| `blacklistHistory` | `useSystemContracts.ts` | schema:459 | ✅ Synced | |
| `gasTipHistory` | `useSystemContracts.ts` | schema:451 | ✅ Synced | |

### 2.3 Missing/Unavailable Queries

| Query Name | Frontend Location | Backend Status | Action Required |
|------------|-------------------|----------------|-----------------|
| `consensusData` | Not used (removed) | ❌ Not in schema | None - already removed |
| `minterConfigHistory` | `useSystemContracts.ts:168` | ❌ Not in schema | Use `minterHistory` instead |
| `burnHistory` | `useSystemContracts.ts:220` | ❌ Not in schema | Use `burnEvents` - FIXED |
| `authorizedAccounts` | `useSystemContracts.ts:267` | ❌ Not in schema | Remove or graceful handling |

---

## 3. Type Definitions Comparison

### 3.1 ValidatorSigningStats

**Backend Schema (lines 1138-1166):**
```graphql
type ValidatorSigningStats {
  validatorAddress: Address!
  validatorIndex: Int!
  prepareSignCount: BigInt!      # String in JSON
  prepareMissCount: BigInt!      # String in JSON
  commitSignCount: BigInt!       # String in JSON
  commitMissCount: BigInt!       # String in JSON
  fromBlock: BigInt!
  toBlock: BigInt!
  signingRate: Float!            # Number
}
```

**Frontend Type (useWBFT.ts:186-197):**
```typescript
export interface ValidatorSigningStats {
  validatorAddress: string
  validatorIndex: number
  fromBlock: string
  toBlock: string
  signingRate: number
  prepareSignCount: string    // ✅ Fixed - was number
  prepareMissCount: string    // ✅ Fixed - was number
  commitSignCount: string     // ✅ Fixed - was number
  commitMissCount: string     // ✅ Fixed - was number
}
```

**Status**: ✅ Fixed in this session

### 3.2 WBFTBlockExtra

**Backend Schema (lines 1099-1136):**
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

**Frontend Type (useWBFT.ts:150-162):**
```typescript
export interface WBFTBlockExtra {
  blockNumber: string
  blockHash: string
  randaoReveal: string
  prevRound: number
  round: number
  preparedSeal?: WBFTAggregatedSeal
  committedSeal?: WBFTAggregatedSeal
  gasTip?: string
  epochInfo?: EpochInfo
  timestamp: string
}
```

**Status**: ✅ Synced (missing `prevPreparedSeal`, `prevCommittedSeal` but not used)

### 3.3 EpochInfo

**Backend Schema (lines 1081-1097):**
```graphql
type EpochInfo {
  epochNumber: BigInt!
  blockNumber: BigInt!
  candidates: [Candidate!]!
  validators: [Int!]!           # Array of indices, NOT objects
  blsPublicKeys: [Bytes!]!
}
```

**Frontend Type (useWBFT.ts:141-148):**
```typescript
export interface EpochInfo {
  epochNumber: string
  blockNumber: string
  candidates: CandidateInfo[]
  validators: number[]          // ✅ Correct - indices
  blsPublicKeys: string[]
}
```

**Status**: ✅ Synced

### 3.4 ProposalStatus Enum

**Backend Schema (lines 709-719):**
```graphql
enum ProposalStatus {
  NONE
  VOTING
  APPROVED
  EXECUTED
  CANCELLED
  EXPIRED
  FAILED
  REJECTED
}
```

**Frontend Type (useSystemContracts.ts):**
```typescript
export type ProposalStatus =
  | 'NONE' | 'VOTING' | 'APPROVED' | 'EXECUTED'
  | 'CANCELLED' | 'EXPIRED' | 'FAILED' | 'REJECTED'
```

**Status**: ✅ Synced (UPPERCASE)

---

## 4. Parameter Type Analysis

### 4.1 BigInt vs String Issue

Backend GraphQL scalar definition (schema:8):
```graphql
# BigInt represents large integers as strings
scalar BigInt
```

Frontend queries use `String!` while backend expects `BigInt!`:

| Query | Frontend Param | Backend Param | Risk Level |
|-------|---------------|---------------|------------|
| `wbftBlockExtra` | `$blockNumber: String!` | `blockNumber: BigInt!` | Low* |
| `epochInfo` | `$epochNumber: String!` | `epochNumber: BigInt!` | Low* |
| `validatorSigningStats` | `$fromBlock: String!` | `fromBlock: BigInt!` | Low* |

*Low risk because `BigInt` scalar is defined to represent strings in this schema.

**Recommendation**: Verify with backend team if `String!` parameters are accepted or if we need to use `BigInt!` in frontend queries.

---

## 5. Subscription Analysis

### 5.1 Backend Subscriptions (schema:316-328)
```graphql
type Subscription {
  newBlock: Block!
  newTransaction: Transaction!
  newPendingTransactions(limit: Int): Transaction!
  logs(filter: LogFilter!): Log!
}
```

### 5.2 Frontend Subscriptions Used
```typescript
// lib/apollo/queries.ts & useConsensus.ts
SUBSCRIBE_CONSENSUS_BLOCK      // consensusBlock
SUBSCRIBE_CONSENSUS_ERROR      // consensusError
SUBSCRIBE_CONSENSUS_FORK       // consensusFork
SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE  // consensusValidatorChange
```

**Status**: ⚠️ Frontend subscriptions (`consensusBlock`, `consensusError`, etc.) are NOT in backend schema.

**Action Required**:
- Confirm with backend if these subscriptions will be added
- Or update frontend to use `newBlock` subscription instead

---

## 6. Completed Fixes (This Session)

### 6.1 Type Fixes
- [x] `ValidatorSigningStats` counts changed from `number` to `string`
- [x] `ValidatorSigningStats.tsx` component updated to parse string counts

### 6.2 Query Fixes
- [x] `useBurnHistory` - Now uses `burnEvents` query correctly
- [x] `useDepositMintProposals` - Removed invalid default status value

### 6.3 Build Status
- [x] ESLint: Passed (warnings only)
- [x] TypeScript: Passed
- [x] Next.js Build: Passed

---

## 7. Pending Tasks (Waiting for Backend)

### 7.1 Queries to Fix After Backend Confirmation

| Task | Priority | Dependency |
|------|----------|------------|
| Fix `minterConfigHistory` → `minterHistory` | High | Backend API confirmation |
| Handle `authorizedAccounts` missing | Medium | Backend decision |
| Verify subscription queries | High | Backend subscription implementation |
| Confirm BigInt/String parameter compatibility | Medium | Backend team |

### 7.2 Frontend Code Locations to Update

```
lib/hooks/useSystemContracts.ts
  - Line ~168: GET_MINTER_CONFIG_HISTORY query
  - Line ~267: GET_AUTHORIZED_ACCOUNTS query

lib/apollo/queries.ts
  - Subscription definitions

components/ (if using missing queries)
  - Check all components that import from affected hooks
```

---

## 8. Integration Testing Checklist

When backend is ready, verify these pages work correctly:

- [ ] `/validators` - Validator list and signing stats
- [ ] `/validators/[address]` - Individual validator detail
- [ ] `/epochs` - Epoch list
- [ ] `/epochs/[number]` - Epoch detail
- [ ] `/consensus` - Consensus dashboard
- [ ] `/system-contracts` - Token supply, minters, governance
- [ ] `/wbft` - WBFT block viewer
- [ ] `/governance` - Governance proposals

---

## 9. Communication Log

### From Frontend to Backend
- Sent: `MISSING_QUERIES_FOR_BACKEND.md` documenting missing queries
- Status: Waiting for backend response

### From Backend to Frontend
- Pending: Backend completion notification
- Pending: List of changes made to schema

---

## 10. Next Steps

1. **Wait** for backend team to complete their work
2. **Receive** updated schema information from backend
3. **Merge** backend changes with this analysis
4. **Create** final task list
5. **Execute** frontend fixes
6. **Test** full integration
7. **Verify** no data sync issues remain

---

## Appendix A: File References

### Backend Files
- `indexer-go/api/graphql/schema.graphql` - GraphQL schema definition
- `indexer-go/api/graphql/resolvers_consensus.go` - Consensus resolvers
- `indexer-go/api/graphql/resolvers_wbft.go` - WBFT resolvers
- `indexer-go/storage/consensus.go` - Consensus storage methods

### Frontend Files
- `lib/hooks/useConsensus.ts` - Consensus hooks (920 lines)
- `lib/hooks/useWBFT.ts` - WBFT hooks (411 lines)
- `lib/hooks/useSystemContracts.ts` - System contract hooks
- `lib/apollo/queries.ts` - GraphQL query definitions
- `components/validators/ValidatorSigningStats.tsx` - Validator stats component
- `components/wbft/WBFTBlockViewer.tsx` - WBFT block viewer
- `components/epochs/EpochDetail.tsx` - Epoch detail component

---

*Document generated by Claude Code analysis*
*Last updated: 2025-11-27*
