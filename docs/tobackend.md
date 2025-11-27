# Backend GraphQL Schema Issues

> **Date**: 2025-11-27
> **Reporter**: Frontend Team
> **Priority**: High
> **Full Audit Report**: See [FRONTEND_BACKEND_AUDIT.md](./FRONTEND_BACKEND_AUDIT.md) for complete schema comparison

---

## Issue #0: Consensus Storage Not Enabled (WBFT/Epoch Data)

### Error Message
```
[GraphQL error]: storage does not support consensus operations
Operation: GetLatestEpoch
```

### Affected Pages
- `/wbft` - WBFT Consensus page (Epoch data not displayed)
- `/epochs` - Epochs list page
- `/validators` - Validator signing statistics

### Current Behavior
Backend returns error "storage does not support consensus operations" for all consensus-related queries.

### Affected Queries

#### 1. `latestEpochData` - Current/Latest Epoch
```graphql
query GetLatestEpoch {
  latestEpochData {
    epochNumber
    validatorCount
    candidateCount
    validators {
      address
      index
      blsPubKey
    }
    candidates {
      address
      diligence
    }
  }
}
```

#### 2. `epochByNumber` - Specific Epoch Details
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
    validators {
      address
      stake
      votingPower
    }
  }
}
```

#### 3. `allValidatorsSigningStats` - Validator Signing Statistics
```graphql
query GetAllValidatorsSigningStats($fromBlock: String!, $toBlock: String!, $limit: Int, $offset: Int) {
  allValidatorsSigningStats(fromBlock: $fromBlock, toBlock: $toBlock, pagination: { limit: $limit, offset: $offset }) {
    nodes {
      validatorAddress
      validatorIndex
      fromBlock
      toBlock
      signingRate
      prepareSignCount
      prepareMissCount
      commitSignCount
      commitMissCount
    }
    totalCount
    pageInfo { hasNextPage, hasPreviousPage }
  }
}
```

#### 4. `blockSigners` - Block Signers Information
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

#### 5. `wbftBlock` - WBFT Block Metadata
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

### Expected Behavior
Backend should enable consensus storage and return valid epoch/WBFT data.

### Questions for Backend Team
1. Is consensus storage intended to be enabled for this environment?
2. What configuration is needed to enable consensus operations?
3. Are the query schemas above correct and matching the backend implementation?

### Frontend Workaround (Current)
Frontend gracefully handles the error by:
- Suppressing console error messages
- Showing "Epoch data is not available. The backend storage does not support consensus operations." message
- Setting `isSupported: false` flag to disable consensus-related UI

---

## Issue #0.5: Consensus Queries - Type Mismatches (BigInt, Address)

### Problem
The consensus-related queries in frontend use custom scalar types (`BigInt!`, `Address!`) that may not match the backend schema.

### Affected Queries

#### 1. `GetConsensusData`
```graphql
# Current (potentially incorrect)
query GetConsensusData($blockNumber: BigInt!) {
  consensusData(blockNumber: $blockNumber) { ... }
}

# Expected (if backend uses String)
query GetConsensusData($blockNumber: String!) {
  consensusData(blockNumber: $blockNumber) { ... }
}
```

#### 2. `GetValidatorStats`
```graphql
# Current (potentially incorrect)
query GetValidatorStats($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!) {
  validatorStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) { ... }
}

# Expected (if backend uses String)
query GetValidatorStats($address: String!, $fromBlock: String!, $toBlock: String!) {
  validatorStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) { ... }
}
```

#### 3. `GetValidatorParticipation`
```graphql
# Current
query GetValidatorParticipation($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!, ...) { ... }

# Expected
query GetValidatorParticipation($address: String!, $fromBlock: String!, $toBlock: String!, ...) { ... }
```

#### 4. `GetAllValidatorStats`
```graphql
# Current
query GetAllValidatorStats($fromBlock: BigInt!, $toBlock: BigInt!, ...) { ... }

# Expected
query GetAllValidatorStats($fromBlock: String!, $toBlock: String!, ...) { ... }
```

#### 5. `GetEpochData`
```graphql
# Current
query GetEpochData($epochNumber: BigInt!) { ... }

# Expected
query GetEpochData($epochNumber: String!) { ... }
```

### Questions for Backend Team
1. Does the backend support `BigInt` custom scalar type?
2. Does the backend support `Address` custom scalar type?
3. If not, confirm that all these parameters should use `String` type instead.

### Type Mapping Reference
Based on `lib/apollo/queries.ts`, other queries use:
- Block numbers: `String!` (e.g., `GetBlock($number: String!)`)
- Addresses: `String!` (e.g., `GetTransactionsByAddress($address: String!)`)
- Timestamps: `String!`

This suggests consensus queries should also use `String!` instead of `BigInt!` and `Address!`.

---

## Issue #0.6: Blocks Pagination Returns Empty Results with Offset

### Problem
When requesting blocks with an offset (e.g., page 2, 3, 4...), the backend returns empty results and `totalCount: 0`.

### Request Example
```graphql
query GetBlocks($limit: Int, $offset: Int) {
  blocks(pagination: { limit: $limit, offset: $offset }) {
    nodes { ... }
    totalCount
    pageInfo { hasNextPage, hasPreviousPage }
  }
}

# Variables: { "limit": 20, "offset": 60 }  # Page 4
```

### Current Response (Incorrect)
```json
{
  "data": {
    "blocks": {
      "nodes": [],
      "pageInfo": {
        "hasNextPage": false,
        "hasPreviousPage": true
      },
      "totalCount": 0
    }
  }
}
```

### Expected Response
```json
{
  "data": {
    "blocks": {
      "nodes": [/* 20 blocks from offset 60 */],
      "pageInfo": {
        "hasNextPage": true,
        "hasPreviousPage": true
      },
      "totalCount": 12345  // Total count should always be accurate
    }
  }
}
```

### Analysis
- `nodes: []` - No blocks returned for page 4
- `totalCount: 0` - Should return total count regardless of pagination offset
- `hasPreviousPage: true` - Correctly indicates previous pages exist, but data is missing

### Impact
- Users cannot navigate to any page other than page 1
- Pagination feature is broken for blocks list

---

## Issue #1: ProposalFilter.contract should be nullable

### Error Message
```
[GraphQL error]: Variable "$contract" of type "String" used in position expecting type "String!".
Operation: GetProposals
```

### Current Schema (Problem)
```graphql
input ProposalFilter {
  contract: String!   # Required - causes error when filtering without contract
  status: ProposalStatus
}
```

### Expected Schema (Solution)
```graphql
input ProposalFilter {
  contract: String    # Nullable - allows querying all proposals without contract filter
  status: ProposalStatus
}
```

### Reason
Frontend needs to query proposals with optional filters:
- Query all proposals (no filter)
- Query by contract only
- Query by status only
- Query by both contract and status

Making `contract` required prevents querying all proposals without specifying a contract address.

### Frontend Query
```graphql
query GetProposals($contract: String, $status: ProposalStatus, $limit: Int, $offset: Int) {
  proposals(filter: { contract: $contract, status: $status }, pagination: { limit: $limit, offset: $offset }) {
    nodes { ... }
    totalCount
    pageInfo { hasNextPage hasPreviousPage }
  }
}
```

---

## Issue #2: ProposalFilter.status type inconsistency (Resolved)

### Previous Error
```
[GraphQL error]: Variable "$status" of type "String" used in position expecting type "ProposalStatus".
```

### Resolution
Frontend updated to use `ProposalStatus` enum instead of `String`.

**Note**: Please confirm the `ProposalStatus` enum values match:
```typescript
enum ProposalStatus {
  NONE = 'none',
  VOTING = 'voting',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed',
  REJECTED = 'rejected',
}
```

---

## Issue #3: Address type not supported (Resolved)

### Previous Error
```
[GraphQL error]: Unknown type "Address".
```

### Resolution
Frontend updated to use `String` instead of custom `Address` scalar type.

**Note**: If `Address` scalar is intended to be used, please add it to the GraphQL schema and document its format/validation rules.

---

## Issue #4: ProposalFilter.proposer field not supported (Resolved)

### Previous Error
```
[GraphQL error]: Unknown field "proposer" on type "ProposalFilter".
```

### Resolution
Frontend removed `proposer` from filter parameters.

**Feature Request**: Consider adding `proposer` filter support if filtering by proposal creator is needed:
```graphql
input ProposalFilter {
  contract: String
  status: ProposalStatus
  proposer: String    # New: filter by proposal creator address
}
```

---

## Summary Table

| Issue | Field/Feature | Current | Expected | Status |
|-------|---------------|---------|----------|--------|
| #0 | Consensus Storage | Disabled | Enabled | **Action Required** |
| #0.5 | Consensus Query Types | `BigInt!`, `Address!` | `String!` | **Clarification Needed** |
| #0.6 | Blocks Pagination | Empty results with offset | Return blocks for all pages | **Action Required** |
| #1 | `ProposalFilter.contract` | `String!` | `String` | **Action Required** |
| #2 | `ProposalFilter.status` | `ProposalStatus` | `ProposalStatus` | Resolved (Frontend) |
| #3 | Address type | Not defined | `String` | Resolved (Frontend) |
| #4 | `ProposalFilter.proposer` | Not supported | Optional feature | Resolved (Frontend) |

---

## Action Items

### Required (Blocking)

#### Issue #0 - Consensus Storage
- [ ] Enable consensus storage on backend
- [ ] Verify `latestEpochData` query returns valid data
- [ ] Verify `epochByNumber` query returns valid data
- [ ] Verify `allValidatorsSigningStats` query returns valid data
- [ ] Verify `blockSigners` query returns valid data
- [ ] Verify `wbftBlock` query returns valid data

#### Issue #0.5 - Consensus Query Types (Clarification Needed)
- [ ] Confirm if backend supports `BigInt` scalar type
- [ ] Confirm if backend supports `Address` scalar type
- [ ] If not supported, frontend will update queries to use `String!` instead

#### Issue #0.6 - Blocks Pagination
- [ ] Fix blocks query to return correct results when `offset > 0`
- [ ] Ensure `totalCount` is always returned regardless of pagination offset
- [ ] Verify pagination works correctly for all list endpoints (blocks, transactions, etc.)

#### Issue #1 - Proposal Filter
- [ ] Change `ProposalFilter.contract` from `String!` to `String`

### Optional (Enhancement)
- [ ] Add `Address` scalar type with validation
- [ ] Add `proposer` filter support to `ProposalFilter`

---

## Affected Pages Summary

| Page | Issue | Current Status |
|------|-------|----------------|
| `/blocks` | #0.6 Pagination | Only page 1 works, other pages return empty |
| `/consensus` | #0, #0.5 | GraphQL type errors, no data |
| `/wbft` | #0 Consensus Storage | Shows "not available" message |
| `/epochs` | #0 Consensus Storage | Shows "not available" message |
| `/validators` | #0 Consensus Storage | Signing stats unavailable |
| `/governance` | #1 ProposalFilter | GraphQL error on load |

---

## Frontend Fixes (To Be Done)

The following frontend changes will be made to improve error handling and user experience:

### 1. Update `useConsensus.ts` - Error Handling
Add graceful error handling for "storage does not support consensus operations" error:
```typescript
// Add isSupported flag like useCurrentEpoch() in useWBFT.ts
export function useLatestEpochData() {
  const { data, loading, error, ... } = useQuery(GET_LATEST_EPOCH_DATA, {
    errorPolicy: 'all',
  })

  const isUnsupportedError = error?.message?.includes('storage does not support consensus operations')

  return {
    latestEpochData,
    loading,
    error: isUnsupportedError ? undefined : error,
    isSupported: !isUnsupportedError,
  }
}
```

### 2. Update `useConsensus.ts` - Query Type Fixes
Change `BigInt!` and `Address!` to `String!` to match backend schema:
```typescript
// Before
query GetConsensusData($blockNumber: BigInt!) { ... }
query GetValidatorStats($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!) { ... }

// After
query GetConsensusData($blockNumber: String!) { ... }
query GetValidatorStats($address: String!, $fromBlock: String!, $toBlock: String!) { ... }
```

### 3. Update `ConsensusDashboard.tsx` - Fallback UI
Add fallback UI when consensus operations are not supported:
```typescript
if (!isSupported && !loading) {
  return (
    <Card>
      <CardContent>
        <p>Consensus data is not available. Backend does not support consensus operations.</p>
      </CardContent>
    </Card>
  )
}
```

### Frontend Fix Status
| File | Fix | Status |
|------|-----|--------|
| `lib/hooks/useConsensus.ts` | Add `isSupported` flag | Pending |
| `lib/hooks/useConsensus.ts` | Change `BigInt!` → `String!` | Pending (waiting for backend confirmation) |
| `lib/hooks/useConsensus.ts` | Change `Address!` → `String!` | Pending (waiting for backend confirmation) |
| `components/consensus/ConsensusDashboard.tsx` | Add fallback UI | Pending |

---

## Contact
For questions, please contact the frontend team.
