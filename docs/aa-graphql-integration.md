# Account Abstraction (EIP-4337) — Frontend GraphQL Integration Guide

> Backend: `indexer-go` v0.8.0 | Frontend: `indexer-frontend`
> Date: 2026-03-09

## Architecture Note

The backend indexes AA data using an **event-only** approach — it parses `UserOperationEvent`, `AccountDeployed`, `UserOperationRevertReason`, and `PostOpRevertReason` logs from EntryPoint contracts. It does **not** decode UserOperation calldata. This means fields like `initCode`, `callData`, `callGasLimit`, etc. are not available from the backend.

---

## 1. Schema Gap Analysis

### Frontend Expected vs Backend Actual

| Frontend Query | Frontend Field | Backend Query | Backend Field | Status |
|---|---|---|---|---|
| `userOperations(filter, pagination)` | unified filter query | `userOpsBySender` / `userOpsByBundler` / `userOpsByPaymaster` | separate per-dimension queries | **Rewrite needed** |
| `userOperation(hash)` | `userOpHash` | `userOp(userOpHash)` | `userOpHash` | Field name match |
| — | `initCode` | — | — | **Not available** |
| — | `callData` | — | — | **Not available** |
| — | `callGasLimit` | — | — | **Not available** |
| — | `verificationGasLimit` | — | — | **Not available** |
| — | `preVerificationGas` | — | — | **Not available** |
| — | `maxFeePerGas` | — | — | **Not available** |
| — | `maxPriorityFeePerGas` | — | — | **Not available** |
| — | `paymasterAndData` | — | — | **Not available** |
| — | `signature` | — | — | **Not available** |
| — | `actualGasUsed` | — | `actualUserOpFeePerGas` | **Different field** |
| — | `bundleTxHash` | — | `txHash` | **Rename** |
| — | `blockTimestamp` | — | `timestamp` | **Rename** |
| — | `factory` | — | — | **Not on UserOp** (see `accountDeployment`) |
| — | `accountDeployed` (bool) | — | — | **Not on UserOp** (separate query) |
| — | `revertReason` | — | — | **Not on UserOp** (see `userOpRevert`) |
| `bundlers(pagination)` | list of bundlers | — | — | **Not available** (only `bundlerStats(address)`) |
| `bundler(address)` | full detail + recentBundles | `bundlerStats(bundler)` | stats only | **Partial match** |
| `paymasters(pagination)` | list of paymasters | — | — | **Not available** (only `paymasterStats(address)`) |
| `paymaster(address)` | full detail + deposit events | `paymasterStats(paymaster)` | stats only | **Partial match** |
| `smartAccount(address)` | EIP-7579 modules | — | — | **Not available** |
| `aaStats` | overview aggregates | `userOpCount` | total count only | **Partial** |
| `bundleByTxHash(txHash)` | bundled userOps in tx | `userOpsByTx(txHash)` | same concept | **Match** (different name) |

---

## 2. Backend Available Queries

### 2.1 Single UserOperation

```graphql
query GetUserOp($hash: String!) {
  userOp(userOpHash: $hash) {
    userOpHash
    txHash              # frontend: bundleTxHash
    blockNumber
    blockHash
    txIndex
    logIndex
    sender
    paymaster           # zero address if no paymaster
    nonce
    success
    actualGasCost
    actualUserOpFeePerGas
    bundler
    entryPoint
    timestamp           # frontend: blockTimestamp
  }
}
```

### 2.2 UserOperations by Sender (Paginated)

```graphql
query GetUserOpsBySender($sender: String!, $limit: Int, $offset: Int) {
  userOpsBySender(sender: $sender, pagination: { limit: $limit, offset: $offset }) {
    nodes {
      userOpHash
      txHash
      blockNumber
      sender
      paymaster
      nonce
      success
      actualGasCost
      actualUserOpFeePerGas
      bundler
      entryPoint
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

### 2.3 UserOperations by Bundler (Paginated)

```graphql
query GetUserOpsByBundler($bundler: String!, $limit: Int, $offset: Int) {
  userOpsByBundler(bundler: $bundler, pagination: { limit: $limit, offset: $offset }) {
    nodes { ...same UserOperation fields... }
    totalCount
    pageInfo { hasNextPage hasPreviousPage }
  }
}
```

### 2.4 UserOperations by Paymaster (Paginated)

```graphql
query GetUserOpsByPaymaster($paymaster: String!, $limit: Int, $offset: Int) {
  userOpsByPaymaster(paymaster: $paymaster, pagination: { limit: $limit, offset: $offset }) {
    nodes { ...same UserOperation fields... }
    totalCount
    pageInfo { hasNextPage hasPreviousPage }
  }
}
```

### 2.5 UserOperations in a Block

```graphql
query GetUserOpsByBlock($blockNumber: String!) {
  userOpsByBlock(blockNumber: $blockNumber) {
    userOpHash
    txHash
    sender
    paymaster
    success
    actualGasCost
    bundler
    entryPoint
    timestamp
  }
}
```

### 2.6 UserOperations in a Transaction (= Bundle)

```graphql
query GetUserOpsByTx($txHash: String!) {
  userOpsByTx(txHash: $txHash) {
    userOpHash
    sender
    paymaster
    success
    actualGasCost
    bundler
    entryPoint
  }
}
```

### 2.7 Recent UserOperations

```graphql
query GetRecentUserOps($limit: Int) {
  recentUserOps(limit: $limit) {
    userOpHash
    txHash
    blockNumber
    sender
    paymaster
    success
    actualGasCost
    bundler
    entryPoint
    timestamp
  }
}
```

### 2.8 UserOp Count

```graphql
query GetUserOpCount {
  userOpCount
}
```

### 2.9 Bundler Stats (Single Address)

```graphql
query GetBundlerStats($address: String!) {
  bundlerStats(bundler: $address) {
    address
    totalOps
    successfulOps
    failedOps
    totalGasSponsored
    lastActivityBlock
    lastActivityTime
  }
}
```

### 2.10 Paymaster Stats (Single Address)

```graphql
query GetPaymasterStats($address: String!) {
  paymasterStats(paymaster: $address) {
    address
    totalOps
    successfulOps
    failedOps
    totalGasSponsored
    lastActivityBlock
    lastActivityTime
  }
}
```

### 2.11 Account Deployment

```graphql
query GetAccountDeployment($hash: String!) {
  accountDeployment(userOpHash: $hash) {
    userOpHash
    sender
    factory
    paymaster
    txHash
    blockNumber
    logIndex
    timestamp
  }
}
```

### 2.12 Account Deployments by Factory

```graphql
query GetDeploymentsByFactory($factory: String!, $limit: Int, $offset: Int) {
  accountDeploymentsByFactory(factory: $factory, pagination: { limit: $limit, offset: $offset }) {
    userOpHash
    sender
    factory
    paymaster
    txHash
    blockNumber
    logIndex
    timestamp
  }
}
```

### 2.13 UserOp Revert Reason

```graphql
query GetUserOpRevert($hash: String!) {
  userOpRevert(userOpHash: $hash) {
    userOpHash
    sender
    nonce
    revertReason
    txHash
    blockNumber
    logIndex
    revertType       # "execution" or "postop"
    timestamp
  }
}
```

---

## 3. Frontend Migration Guide

### 3.1 `useUserOperations` Hook

**Current**: Uses `MOCK_USER_OPERATIONS` with client-side filtering.

**Migration**: The backend does NOT have a unified `userOperations(filter)` query. Instead, choose the right query based on the active filter:

```typescript
// Decide which query to use based on filter
function getQueryForFilter(filter?: UserOpFilter) {
  if (filter?.sender) return { query: GET_USER_OPS_BY_SENDER, variables: { sender: filter.sender } }
  if (filter?.bundler) return { query: GET_USER_OPS_BY_BUNDLER, variables: { bundler: filter.bundler } }
  if (filter?.paymaster) return { query: GET_USER_OPS_BY_PAYMASTER, variables: { paymaster: filter.paymaster } }
  return { query: GET_RECENT_USER_OPS, variables: { limit: 100 } }
}
```

**Field mapping** for `UserOperationListItem`:
```typescript
function mapUserOp(raw: any): UserOperationListItem {
  return {
    userOpHash: raw.userOpHash,
    sender: raw.sender,
    success: raw.success,
    paymaster: raw.paymaster === '0x0000000000000000000000000000000000000000' ? null : raw.paymaster,
    bundler: raw.bundler,
    blockNumber: Number(raw.blockNumber),
    blockTimestamp: new Date(Number(raw.timestamp) * 1000), // backend: "timestamp" (unix seconds)
    actualGasCost: BigInt(raw.actualGasCost),
    entryPoint: raw.entryPoint,
  }
}
```

### 3.2 `useUserOperation` Hook (Detail View)

**Backend query name**: `userOp` (not `userOperation`)

**Available fields** (event-derived only):
- `userOpHash`, `txHash`, `blockNumber`, `blockHash`, `txIndex`, `logIndex`
- `sender`, `paymaster`, `nonce`, `success`
- `actualGasCost`, `actualUserOpFeePerGas`
- `bundler`, `entryPoint`, `timestamp`

**NOT available** (requires calldata decoding):
- `initCode`, `callData`, `callGasLimit`, `verificationGasLimit`
- `preVerificationGas`, `maxFeePerGas`, `maxPriorityFeePerGas`
- `paymasterAndData`, `signature`, `actualGasUsed`

**For revert reason**: Make a separate `userOpRevert(userOpHash)` query.
**For factory/deployment info**: Make a separate `accountDeployment(userOpHash)` query.

### 3.3 `useBundlers` Hook

**No list query available.** The backend only provides `bundlerStats(bundler: $address)` for a single address.

**Options**:
1. Keep mock data for the bundler list page until a list query is added
2. If the frontend knows bundler addresses (e.g., from UserOp results), query stats individually

**Field mapping** (BundlerStats → Bundler):
```typescript
function mapBundlerStats(raw: any): Partial<Bundler> {
  return {
    address: raw.address,
    totalUserOps: raw.totalOps,         // backend: totalOps
    // totalBundles: NOT AVAILABLE
    successRate: raw.totalOps > 0 ? raw.successfulOps / raw.totalOps : 0,  // compute from successfulOps/totalOps
    totalGasUsed: BigInt(raw.totalGasSponsored),  // backend: totalGasSponsored
    // firstSeen: NOT AVAILABLE
    lastSeen: new Date(Number(raw.lastActivityTime) * 1000),
  }
}
```

### 3.4 `usePaymasters` Hook

Same situation as bundlers — no list query. Only `paymasterStats(paymaster: $address)` for individual lookups.

**NOT available**: `deposit`, `stake`, `unstakeDelay`, `rejectionReasons`, `depositEvents` (these require on-chain state reads, not indexed from events)

### 3.5 `bundleByTxHash` → `userOpsByTx`

**Direct replacement available:**

```graphql
# Frontend expected:                    # Backend actual:
# bundleByTxHash(txHash: $txHash)   →   userOpsByTx(txHash: $txHash)
```

The response is a flat array of UserOperations (not a wrapper object with `bundler`/`entryPoint` fields). Extract bundler/entryPoint from the first UserOp in the array.

### 3.6 `aaStats`

**Only `userOpCount` is available.** The backend does not provide aggregate stats like `totalBundlers`, `activePaymasters`, `totalSmartAccounts`, etc.

### 3.7 `smartAccount`

**Not available.** The backend does not index EIP-7579 module data. Account deployment info is available via `accountDeployment(userOpHash)` and `accountDeploymentsByFactory(factory)`.

---

## 4. Updated Frontend Query File

Below are the corrected queries matching the actual backend schema. Replace `lib/apollo/queries/aa.ts`:

```typescript
import { gql } from '@apollo/client'

// ============================================================================
// UserOperation Queries
// ============================================================================

/** Get single UserOperation by hash */
export const GET_USER_OP = gql`
  query GetUserOp($hash: String!) {
    userOp(userOpHash: $hash) {
      userOpHash
      txHash
      blockNumber
      blockHash
      txIndex
      logIndex
      sender
      paymaster
      nonce
      success
      actualGasCost
      actualUserOpFeePerGas
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get UserOperations by sender (paginated) */
export const GET_USER_OPS_BY_SENDER = gql`
  query GetUserOpsBySender($sender: String!, $limit: Int, $offset: Int) {
    userOpsBySender(sender: $sender, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        nonce
        success
        actualGasCost
        actualUserOpFeePerGas
        bundler
        entryPoint
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/** Get UserOperations by bundler (paginated) */
export const GET_USER_OPS_BY_BUNDLER = gql`
  query GetUserOpsByBundler($bundler: String!, $limit: Int, $offset: Int) {
    userOpsByBundler(bundler: $bundler, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        success
        actualGasCost
        bundler
        entryPoint
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/** Get UserOperations by paymaster (paginated) */
export const GET_USER_OPS_BY_PAYMASTER = gql`
  query GetUserOpsByPaymaster($paymaster: String!, $limit: Int, $offset: Int) {
    userOpsByPaymaster(paymaster: $paymaster, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        success
        actualGasCost
        bundler
        entryPoint
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/** Get all UserOperations in a transaction (bundle view) */
export const GET_USER_OPS_BY_TX = gql`
  query GetUserOpsByTx($txHash: String!) {
    userOpsByTx(txHash: $txHash) {
      userOpHash
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
    }
  }
`

/** Get UserOperations in a block */
export const GET_USER_OPS_BY_BLOCK = gql`
  query GetUserOpsByBlock($blockNumber: String!) {
    userOpsByBlock(blockNumber: $blockNumber) {
      userOpHash
      txHash
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get most recent UserOperations */
export const GET_RECENT_USER_OPS = gql`
  query GetRecentUserOps($limit: Int) {
    recentUserOps(limit: $limit) {
      userOpHash
      txHash
      blockNumber
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get total UserOperation count */
export const GET_USER_OP_COUNT = gql`
  query GetUserOpCount {
    userOpCount
  }
`

// ============================================================================
// Bundler / Paymaster Stats (Single Address Only)
// ============================================================================

/** Get stats for a single bundler address */
export const GET_BUNDLER_STATS = gql`
  query GetBundlerStats($address: String!) {
    bundlerStats(bundler: $address) {
      address
      totalOps
      successfulOps
      failedOps
      totalGasSponsored
      lastActivityBlock
      lastActivityTime
    }
  }
`

/** Get stats for a single paymaster address */
export const GET_PAYMASTER_STATS = gql`
  query GetPaymasterStats($address: String!) {
    paymasterStats(paymaster: $address) {
      address
      totalOps
      successfulOps
      failedOps
      totalGasSponsored
      lastActivityBlock
      lastActivityTime
    }
  }
`

// ============================================================================
// Account Deployment Queries
// ============================================================================

/** Get deployment info by UserOp hash */
export const GET_ACCOUNT_DEPLOYMENT = gql`
  query GetAccountDeployment($hash: String!) {
    accountDeployment(userOpHash: $hash) {
      userOpHash
      sender
      factory
      paymaster
      txHash
      blockNumber
      logIndex
      timestamp
    }
  }
`

/** Get deployments by factory address */
export const GET_DEPLOYMENTS_BY_FACTORY = gql`
  query GetDeploymentsByFactory($factory: String!, $limit: Int, $offset: Int) {
    accountDeploymentsByFactory(factory: $factory, pagination: { limit: $limit, offset: $offset }) {
      userOpHash
      sender
      factory
      paymaster
      txHash
      blockNumber
      logIndex
      timestamp
    }
  }
`

// ============================================================================
// Revert Reason
// ============================================================================

/** Get revert reason for a failed UserOperation */
export const GET_USER_OP_REVERT = gql`
  query GetUserOpRevert($hash: String!) {
    userOpRevert(userOpHash: $hash) {
      userOpHash
      sender
      nonce
      revertReason
      txHash
      blockNumber
      logIndex
      revertType
      timestamp
    }
  }
`
```

---

## 5. Summary: What Needs to Change

### Frontend Must Rewrite
1. **`lib/apollo/queries/aa.ts`** — Replace with queries above
2. **`types/aa.ts`** — Remove calldata fields from `RawUserOperation` / `UserOperation`; remove `SmartAccount`, `AAStats` types (or keep as stubs)
3. **`useUserOperations`** — Route to correct backend query based on filter dimension
4. **`useBundlers`** / `usePaymasters`** — Keep mock data until backend adds list queries, or query individually

### Backend Not Yet Providing (Future Work)
| Feature | Priority | Effort |
|---|---|---|
| `bundlers()` list query | Medium | Need to iterate all bundler stats keys |
| `paymasters()` list query | Medium | Same as above |
| `aaStats` aggregate query | Low | Compute from existing counts |
| Calldata decoding (initCode, callData, etc.) | Low | Requires full calldata parsing, significant effort |
| Smart Account / EIP-7579 modules | Low | Requires new indexing logic |

### Ready to Use Now
- `userOp(userOpHash)` — single UserOp detail
- `userOpsBySender` / `userOpsByBundler` / `userOpsByPaymaster` — paginated lists
- `userOpsByTx` — bundle view (replaces `bundleByTxHash`)
- `userOpsByBlock` — block-level view
- `recentUserOps` — latest UserOps
- `userOpCount` — total count
- `bundlerStats` / `paymasterStats` — single address stats
- `accountDeployment` / `accountDeploymentsByFactory` — deployment data
- `userOpRevert` — revert reason lookup
