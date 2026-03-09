# Architecture

> Code structure, patterns, and conventions for indexer-frontend

## Directory Structure

```
indexer-frontend/
├── app/                          # Next.js App Router (29 routes)
│   ├── page.tsx                  # Dashboard
│   ├── tx/[hash]/                # Transaction detail
│   ├── block/[numberOrHash]/     # Block detail
│   ├── address/[address]/        # Address detail
│   ├── userop/[hash]/            # UserOp detail (AA)
│   ├── userops/                  # UserOps list (AA)
│   ├── bundlers/                 # Bundler list (AA)
│   ├── paymasters/               # Paymaster list (AA)
│   └── api/v1/                   # REST API routes
├── components/                   # React components (~158 files)
│   ├── aa/                       # Account Abstraction (EIP-4337)
│   │   ├── userops/              # UserOp table, row, detail cards
│   │   ├── bundlers/             # Bundler table
│   │   ├── paymasters/           # Paymaster table
│   │   ├── common/               # StatusBadge, HashLink
│   │   ├── TxBundleCard.tsx      # AA bundle card for tx detail
│   │   ├── AddressUserOpsSection.tsx  # UserOps tab for address detail
│   │   └── AADashboardSection.tsx     # AA stats for dashboard
│   ├── charts/                   # Recharts wrappers
│   ├── common/                   # Shared UI (WalletButton, EmptyState, etc.)
│   ├── contract/                 # ContractReader/Writer (wagmi)
│   ├── consensus/                # WBFT/Validator components
│   ├── gas/                      # Gas tools, simulator
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── providers/                # RealtimeProvider (single WS source)
│   ├── skeletons/                # Loading skeletons
│   └── ui/                       # Base UI primitives (Card, Table, Tabs, etc.)
├── lib/
│   ├── apollo/                   # Apollo Client setup
│   │   └── queries/              # GraphQL queries (48 operations)
│   │       ├── block.ts
│   │       ├── transaction.ts
│   │       ├── address.ts
│   │       ├── aa.ts             # Account Abstraction queries
│   │       ├── subscription.ts
│   │       └── index.ts          # Central re-exports
│   ├── config/                   # Constants, env, network definitions
│   ├── errors/                   # AppError, recovery (withRetry, CircuitBreaker), logger
│   ├── hooks/                    # Custom hooks (76 files)
│   │   └── aa/                   # AA hooks (useUserOperations, useUserOperation, etc.)
│   ├── providers/                # WagmiProvider, NetworkProvider
│   ├── utils/                    # Formatters, parsers, transforms
│   │   ├── format.ts             # Number/value formatting
│   │   ├── graphql-transforms.ts # Raw→Typed conversion (toBigInt, toDate, etc.)
│   │   └── aa-transforms.ts      # AA-specific transforms
│   └── wagmi/                    # wagmi config, chain definitions
├── stores/                       # Zustand stores
│   ├── networkStore.ts           # Network selection state
│   ├── realtimeStore.ts          # WebSocket data (blocks, txs)
│   ├── themeStore.ts             # Theme state
│   └── consensusStore.ts         # Consensus data
├── types/                        # TypeScript type definitions
│   ├── graphql.ts                # Core GraphQL types
│   └── aa.ts                     # Account Abstraction types
└── public/                       # Static assets
```

## Key Patterns

### State Management

```
Apollo Cache   — Server state (GraphQL query results)
Zustand        — Client state (network, theme, realtime data)
React Context  — Component tree state (theme, network provider)
```

- **Apollo Cache**: Primary store for all backend data. Queries auto-cache and deduplicate.
- **Zustand**: Lightweight stores for UI state that doesn't come from the server.
- **React Context**: Used sparingly for provider wrappers (WagmiProvider, NetworkProvider).

### Data Flow

```
GraphQL Backend → Apollo Client → Custom Hooks → Components
                                       ↕
WebSocket       → RealtimeProvider → Zustand Store → Components
```

### GraphQL Transform Pattern

Backend returns string-based values. Transform layer converts to proper types:

```typescript
// Raw from GraphQL (strings)
interface RawBlock {
  number: string
  timestamp: string
  gasUsed: string
}

// Transformed (proper types)
interface Block {
  number: number
  timestamp: Date
  gasUsed: bigint
}

// Transform function
function transformBlock(raw: RawBlock): Block {
  return {
    number: toNumber(raw.number),
    timestamp: toDate(raw.timestamp),
    gasUsed: toBigInt(raw.gasUsed),
  }
}
```

### Component Patterns

- **Named exports**, one component per file
- **Card container**: `Card > CardHeader + CardContent` for all detail sections
- **Table pattern**: `Table > TableHeader + TableBody > TableRow > TableCell`
- **Error boundaries**: Every route has `error.tsx` for graceful error handling
- **Loading skeletons**: Suspense fallbacks with skeleton components
- **Tabs**: `Tabs > TabsList + TabsTrigger + TabsContent` for sectioned views

### Account Abstraction (EIP-4337)

The AA integration uses the indexer-go **event-only** approach:

```
Backend parses logs:
  UserOperationEvent, AccountDeployed,
  UserOperationRevertReason, PostOpRevertReason

Available queries:
  userOp(hash)           — single UserOp detail
  userOpsBySender        — paginated by sender
  userOpsByBundler       — paginated by bundler
  userOpsByPaymaster     — paginated by paymaster
  recentUserOps          — latest UserOps
  userOpsByTx            — bundle view (UserOps in a transaction)
  userOpsByBlock         — block-level view
  bundlerStats(address)  — single bundler stats
  paymasterStats(address)— single paymaster stats
  accountDeployment      — factory/deployment info
  userOpRevert           — revert reason lookup
```

The `useUserOperations` hook routes to the correct query based on active filter dimension (sender/bundler/paymaster/none).

### Wallet Integration

```
wagmi v3 + viem v2
  ├── useAccount / useConnect     — wallet connection
  ├── useWriteContract            — contract writes
  └── chain sync                  — network store ↔ wallet chain
```

### Real-time Updates

```
Single WebSocket → RealtimeProvider → Zustand realtimeStore
  ├── newBlock subscription
  ├── newTransaction subscription
  ├── pendingTransactions subscription
  └── logs subscription

replayLast parameter for instant data on connection.
```

### Error Handling

```
lib/errors/
  ├── types.ts      — AppError hierarchy (Network, GraphQL, Validation, etc.)
  ├── logger.ts     — errorLogger singleton, useErrorLogger hook
  └── recovery.ts   — withRetry, withTimeout, CircuitBreaker
```

Rule: Use `errorLogger` from `@/lib/errors/logger`, never raw `console.error`.

## Conventions

- **TypeScript**: Strict mode, no `any`, interfaces for shapes, type aliases for unions
- **Naming**: PascalCase components, camelCase utils/hooks, UPPER_SNAKE_CASE constants
- **Imports**: External first, then `@/` aliases; group by type
- **Commit**: `type(scope): subject` — feat, fix, docs, style, refactor, test, chore
- **Testing**: Vitest for unit tests, co-located (`*.test.tsx`), 80%+ coverage target
