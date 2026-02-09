# Backend API Requirements Document

> **Date**: 2026-02-08
> **Project**: indexer-frontend
> **Status**: Pending Backend Implementation
> **Priority**: High

---

## Overview

This document outlines the backend API changes required to fully support frontend features implemented in Phase 2-A. The frontend UI components have been created but require backend API support to function correctly.

---

## Table of Contents

1. [Summary](#summary)
2. [Component Analysis](#component-analysis)
3. [Required GraphQL Schema Changes](#required-graphql-schema-changes)
4. [New Queries Required](#new-queries-required)
5. [Implementation Checklist](#implementation-checklist)
6. [Priority Matrix](#priority-matrix)

---

## Summary

| Component | Current Status | Blocking Issues |
|-----------|---------------|-----------------|
| GasCalculator | ✅ Complete | None |
| FeeDelegationDashboard | ⚠️ Partial | Time-based filtering not supported |
| ValidatorHeatmap | ❌ Incomplete | Missing `blocksProposed`, `totalBlocks` fields |
| EpochTimeline | ⚠️ Partial | No epoch list query, no `validatorChange` |
| AdvancedTransactionFilters | ❌ Incomplete | 5 filters not supported by backend |
| AddressStatsCard | ⚠️ Limited | Missing timestamps, no dedicated stats query |

**Total Blocking Issues: 12**

---

## Component Analysis

### 1. ValidatorHeatmap

**File**: `components/consensus/ValidatorHeatmap.tsx`

**Current Issue**: The heatmap displays validator participation rates but cannot show proposal statistics because the backend doesn't provide the required fields.

**Missing Fields in `ValidatorSigningStats`**:

| Field | Type | Description |
|-------|------|-------------|
| `blocksProposed` | BigInt! | Number of blocks proposed by this validator |
| `totalBlocks` | BigInt! | Total blocks in the queried range |
| `proposalRate` | Float | Optional: Pre-calculated proposal rate |

**Current Query**: `GET_ALL_VALIDATORS_SIGNING_STATS`

**Expected Response**:
```json
{
  "validatorAddress": "0x...",
  "validatorIndex": 1,
  "prepareSignCount": "1000",
  "prepareMissCount": "5",
  "commitSignCount": "995",
  "commitMissCount": "10",
  "signingRate": 99.5,
  "blocksProposed": "50",    // NEW
  "totalBlocks": "1000"      // NEW
}
```

---

### 2. FeeDelegationDashboard

**File**: `components/gas/FeeDelegationDashboard.tsx`

**Current Issue**: UI has time period selector (24H, 7D, 30D, ALL) but backend only supports block-based filtering.

**Current Query Parameters**:
```graphql
feeDelegationStats(fromBlock: BigInt, toBlock: BigInt)
```

**Required Query Parameters**:
```graphql
feeDelegationStats(
  fromBlock: BigInt,
  toBlock: BigInt,
  fromTime: String,    # NEW - ISO 8601 timestamp
  toTime: String       # NEW - ISO 8601 timestamp
)
```

**Alternative Solution**: Provide a helper query for timestamp-to-block conversion:
```graphql
query BlockByTimestamp($timestamp: String!) {
  blockByTimestamp(timestamp: $timestamp) {
    number
    timestamp
  }
}
```

---

### 3. EpochTimeline

**File**: `components/consensus/EpochTimeline.tsx`

**Current Issue**: Can only display current epoch. No historical epoch data available.

**Missing Query**: `GET_EPOCHS` or `epochs` paginated query

**Required New Query**:
```graphql
query GetEpochs($limit: Int!, $offset: Int!) {
  epochs(pagination: { limit: $limit, offset: $offset }) {
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

**Additional Field Needed in `latestEpochInfo`**:

| Field | Type | Description |
|-------|------|-------------|
| `previousEpochValidatorCount` | Int | Validator count from previous epoch for calculating change |

---

### 4. AdvancedTransactionFilters

**File**: `components/transactions/AdvancedTransactionFilters.tsx`

**Current Issue**: Only ~50% of filter options are supported by backend.

**Filter Support Matrix**:

| Filter | UI Status | Backend Status | Priority |
|--------|-----------|---------------|----------|
| `fromBlock` / `toBlock` | ✅ | ✅ Supported | - |
| `minValue` / `maxValue` | ✅ | ✅ Supported | - |
| `eipType` (tx type) | ✅ | ✅ Supported | - |
| `status` | ✅ | ✅ Supported | - |
| `fromAddress` / `toAddress` | ✅ | ✅ Supported | - |
| `contractInteraction` | ✅ | ⚠️ Partial | Medium |
| `isFeeDelegated` | ✅ | ❌ Not Supported | **High** |
| `methodId` | ✅ | ❌ Not Supported | Medium |
| `minGasUsed` / `maxGasUsed` | ✅ | ❌ Not Supported | Medium |
| `direction` (sent/received) | ✅ | ❌ Not Supported | Low |
| `fromTime` / `toTime` | ✅ | ❌ Not Supported | Medium |

**Required Schema Extension**:
```graphql
extend input HistoricalTransactionFilter {
  # Fee delegation filter
  isFeeDelegated: Boolean

  # Function selector filter
  methodId: String

  # Gas usage range
  minGasUsed: String
  maxGasUsed: String

  # Direction filter
  direction: TransactionDirection  # enum: SENT, RECEIVED, ALL

  # Time-based filtering
  fromTime: String
  toTime: String
}

enum TransactionDirection {
  SENT
  RECEIVED
  ALL
}
```

---

### 5. AddressStatsCard

**File**: `components/address/AddressStatsCard.tsx`

**Current Issue**: Statistics are calculated from transaction array on frontend. Missing timestamp data and no dedicated stats query for efficiency.

**Option A - Ensure Transaction Fields** (Minimum):

Ensure all transactions include these fields:
```graphql
type Transaction {
  from: String!
  to: String
  value: String!
  input: String!
  gasPrice: String
  receipt: TransactionReceipt
  blockTimestamp: String  # NEW - for activity date calculations
}
```

**Option B - Dedicated Stats Query** (Recommended for Performance):

```graphql
query GetAddressStats($address: String!) {
  addressStats(address: $address) {
    address: String!
    totalTransactions: Int!
    sentCount: Int!
    receivedCount: Int!
    successCount: Int!
    failedCount: Int!
    totalGasUsed: String!
    totalGasCost: String!
    totalValueSent: String!
    totalValueReceived: String!
    contractInteractionCount: Int!
    uniqueAddressCount: Int!
    firstTransactionTimestamp: String
    lastTransactionTimestamp: String
  }
}
```

---

## Required GraphQL Schema Changes

### Type Extensions

```graphql
# ============================================
# Validator Stats Extension
# ============================================
extend type ValidatorSigningStats {
  """Number of blocks proposed by this validator in the range"""
  blocksProposed: BigInt!

  """Total blocks in the queried range"""
  totalBlocks: BigInt!

  """Pre-calculated proposal rate (blocksProposed / totalBlocks * 100)"""
  proposalRate: Float
}

# ============================================
# Epoch Info Extension
# ============================================
extend type EpochInfo {
  """Validator count from the previous epoch for delta calculation"""
  previousEpochValidatorCount: Int

  """Timestamp when this epoch started"""
  timestamp: String
}

# ============================================
# Transaction Filter Extension
# ============================================
extend input HistoricalTransactionFilter {
  """Filter by fee delegation status"""
  isFeeDelegated: Boolean

  """Filter by function selector (first 4 bytes of input data)"""
  methodId: String

  """Minimum gas used"""
  minGasUsed: String

  """Maximum gas used"""
  maxGasUsed: String

  """Transaction direction relative to queried address"""
  direction: TransactionDirection

  """Start time filter (ISO 8601)"""
  fromTime: String

  """End time filter (ISO 8601)"""
  toTime: String
}

enum TransactionDirection {
  SENT
  RECEIVED
  ALL
}

# ============================================
# Fee Delegation Stats Extension
# ============================================
extend input FeeDelegationStatsFilter {
  """Start time filter (ISO 8601)"""
  fromTime: String

  """End time filter (ISO 8601)"""
  toTime: String
}
```

---

## New Queries Required

### 1. Epochs List Query

```graphql
"""
Paginated list of epochs for epoch timeline and history views
"""
query GetEpochs($limit: Int!, $offset: Int!) {
  epochs(pagination: { limit: $limit, offset: $offset }) {
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

### 2. Address Stats Query (Optional - Performance Optimization)

```graphql
"""
Pre-calculated statistics for an address
Reduces frontend calculation overhead for large transaction histories
"""
query GetAddressStats($address: String!) {
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

### 3. Block by Timestamp Query (Optional - Helper)

```graphql
"""
Find the closest block to a given timestamp
Useful for converting time-based filters to block ranges
"""
query GetBlockByTimestamp($timestamp: String!) {
  blockByTimestamp(timestamp: $timestamp) {
    number
    timestamp
  }
}
```

---

## Implementation Checklist

### Priority: Critical (Blocking Features)

- [ ] Add `blocksProposed` field to `ValidatorSigningStats`
- [ ] Add `totalBlocks` field to `ValidatorSigningStats`
- [ ] Add `isFeeDelegated` filter to `HistoricalTransactionFilter`

### Priority: High (Core Functionality)

- [ ] Add `epochs` paginated query
- [ ] Add `fromTime`/`toTime` to `feeDelegationStats`
- [ ] Add `previousEpochValidatorCount` to `EpochInfo`
- [ ] Add `methodId` filter to `HistoricalTransactionFilter`

### Priority: Medium (Enhanced Features)

- [ ] Add `minGasUsed`/`maxGasUsed` filters
- [ ] Add `fromTime`/`toTime` to transaction filters
- [ ] Add `blockTimestamp` to Transaction type
- [ ] Add `direction` filter to transaction queries

### Priority: Low (Optimization)

- [ ] Add `addressStats` dedicated query
- [ ] Add `blockByTimestamp` helper query
- [ ] Add `proposalRate` pre-calculated field

---

## Priority Matrix

```
                    IMPACT
                High    │    Low
              ──────────┼──────────
        High  │ P1      │  P2
   EFFORT     │         │
              ├─────────┼──────────
        Low   │ P1      │  P3
              │         │
```

### P1 - Do First
- `blocksProposed`, `totalBlocks` fields (Low effort, High impact)
- `isFeeDelegated` filter (Low effort, High impact)

### P2 - Do Next
- `epochs` query (Medium effort, High impact)
- Time-based filtering (Medium effort, Medium impact)

### P3 - Do Later
- `addressStats` query (Medium effort, Low impact)
- Helper queries (Low effort, Low impact)

---

## Notes for Backend Team

1. **BigInt Handling**: All large numeric fields (block numbers, gas values, wei amounts) should be returned as `String` to preserve precision in JavaScript.

2. **Timestamp Format**: Use ISO 8601 format (`2024-01-15T10:30:00Z`) for all timestamp fields.

3. **Backward Compatibility**: When adding time-based filters, keep existing block-range parameters for backward compatibility.

4. **Pagination**: Ensure all list queries support consistent pagination with `limit`, `offset`, `totalCount`, and `pageInfo`.

5. **Fee Delegation Detection**: The `isFeeDelegated` filter should check for presence of `feePayer` field or specific transaction type.

6. **Method ID Matching**: `methodId` filter should match the first 4 bytes (8 hex characters) of the transaction input data.

---

## Contact

For questions about these requirements, please contact the frontend team.

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-08 | 1.0 | Initial document created |
