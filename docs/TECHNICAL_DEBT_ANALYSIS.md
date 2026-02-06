# Technical Debt Analysis Report

> **Generated**: 2026-02-06
> **Project**: indexer-frontend
> **Analysis Scope**: SOLID Principles, Clean Code, Naming Conventions, TODO/Deferred Code

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [1. TODO and Deferred Implementations](#1-todo-and-deferred-implementations)
- [2. SOLID Principle Violations](#2-solid-principle-violations)
- [3. Naming Convention Issues](#3-naming-convention-issues)
- [4. Clean Code Violations](#4-clean-code-violations)
- [5. Priority Matrix](#5-priority-matrix)
- [6. Remediation Roadmap](#6-remediation-roadmap)

---

## Executive Summary

### Overview

This report identifies **173 technical debt items** across the codebase, categorized by type and severity.

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| TODO/Deferred Code | 10 | 0 | 0 | 10 | 0 |
| SOLID Violations | 20 | 1 | 4 | 14 | 1 |
| Naming Conventions | 0 | 0 | 0 | 0 | 0 |
| Clean Code Violations | 130 | 5 | 15 | 90 | 20 |
| **Total** | **160** | **6** | **19** | **114** | **21** |

### Key Findings

1. **Large Files**: 5 files exceed 500 lines (~~`useSystemContracts.ts` at 1,606 lines~~ ✅ RESOLVED)
2. **Console Statements**: 45+ files contain `console.log/error/warn` statements
3. **Single Responsibility Violations**: Core hooks manage 5+ responsibilities each
4. **Interface Bloat**: Props interfaces combine unrelated concerns (up to 14 props)
5. **Inconsistent File Naming**: 11 UI component files use kebab-case instead of PascalCase

### Completed Refactoring

| Date | Task | Details |
|------|------|---------|
| 2026-02-06 | Split `useSystemContracts.ts` | Split 1,606 lines into 3 domain-specific modules: `useNativeCoinAdapter.ts` (230 lines), `useContractSubscriptions.ts` (349 lines), `useGovernance.ts` (649 lines) |
| 2026-02-06 | Rename UI component files (NC-001) | Renamed 11 files from kebab-case to PascalCase, updated 80+ import statements |
| 2026-02-06 | Split `useConsensus.ts` (SRP-002) | Split 906 lines into 3 domain-specific modules: `consensus.types.ts` (145 lines), `useConsensusQueries.ts` (353 lines), `useConsensusSubscriptions.ts` (321 lines) |
| 2026-02-06 | Split `constants.ts` (CC-001) | Split 843 lines into 6 domain-specific modules: pagination, realtime, consensus, blockchain, system-contracts, ui |

---

## 1. TODO and Deferred Implementations

### 1.1 TODO Comments

| ID | File | Line | Description | Status |
|----|------|------|-------------|--------|
| TD-001 | `lib/network/api/index.ts` | 8 | API functions not implemented (fetchBlock, fetchTransaction, etc.) | Waiting |
| TD-002 | `lib/graphql/queries/relay.ts` | 174 | `networkStats` query - backend support needed | Blocked |
| TD-003 | `lib/graphql/queries/rpcProxy.ts` | 95 | `ethGetBalance` query - suggests using `addressBalance` instead | Blocked |

### 1.2 Backend-Blocked Features (NOTE Comments)

| ID | File | Line | Feature | Dependency |
|----|------|------|---------|------------|
| BF-001 | `lib/hooks/useGovernance.ts` | 487 | `useMinterConfigHistory()` hook | Backend GraphQL schema |
| BF-002 | `lib/hooks/useGovernance.ts` | 595 | `useAuthorizedAccounts()` hook | Backend GraphQL schema |
| BF-003 | `lib/graphql/queries/relay.ts` | 173 | `networkStats` query | Backend GraphQL schema |
| BF-004 | `lib/graphql/queries/rpcProxy.ts` | 94 | `ethGetBalance` query | Backend GraphQL schema |
| BF-005 | `app/contracts/page.tsx` | 82 | Contracts list feature | Backend support |

### 1.3 Impact Assessment

```
Backend Dependencies: 7 features blocked
API Completeness: ~60% (core functions pending)
User-Facing Impact: 2 features unavailable (Contracts, Search fallback)
```

---

## 2. SOLID Principle Violations

### 2.1 Single Responsibility Principle (SRP)

#### Critical Violations

| ID | File | Lines | Responsibilities | Severity |
|----|------|-------|------------------|----------|
| SRP-001 | `lib/hooks/useAddress.ts` | 79-449 | Balance fetching, Balance history, Token balances, Address overview, SetCode delegation, Comparison logic | **HIGH** |
| SRP-002 | `lib/hooks/usePagination.ts` | 49-222 | URL parsing, URL updating, Pagination state, User preferences, Validation | **HIGH** |
| SRP-003 | `components/consensus/ConsensusDashboard.tsx` | 35-160+ | Consensus monitoring, Error alerts, Block data, Epoch data, Network health | **HIGH** |
| SRP-004 | `lib/hooks/useWalletConnection.ts` | 44-133 | Wallet connection, Signer retrieval, Provider detection, State management | **MEDIUM** |

#### Recommended Refactoring

```
useAddress.ts → Split into:
├── useAddressBalance.ts
├── useAddressOverview.ts
├── useBalanceHistory.ts
└── useSetCodeDelegation.ts

usePagination.ts → Split into:
├── usePaginationState.ts
├── useURLSync.ts
└── usePaginationPreferences.ts
```

### 2.2 Open/Closed Principle (OCP)

| ID | File | Issue | Severity |
|----|------|-------|----------|
| OCP-001 | `components/transactions/TxDetailCards.tsx:53-72` | Status badge colors hardcoded; requires modification for new statuses | **MEDIUM** |
| OCP-002 | `components/address/AddressTransactionsSection.tsx:43-52` | Export format hardcoded; cannot extend without modification | **LOW** |

#### Recommended Solution

```typescript
// Before (OCP violation)
const getStatusColor = (status: string) => {
  if (status === 'success') return 'green'
  if (status === 'pending') return 'yellow'
  // Must modify this function to add new status
}

// After (OCP compliant)
const STATUS_CONFIG: Record<string, StatusConfig> = {
  success: { color: 'green', label: 'Success' },
  pending: { color: 'yellow', label: 'Pending' },
  // Can extend without modifying existing code
}
```

### 2.3 Interface Segregation Principle (ISP)

#### Critical Violations

| ID | File | Interface | Props Count | Issue |
|----|------|-----------|-------------|-------|
| ISP-001 | `AddressTransactionsSection.tsx:13-27` | `AddressTransactionsSectionProps` | 14 | Combines display, pagination, filter, and state props |
| ISP-002 | `TxDetailCards.tsx:19-43` | `TransactionData` | 20+ | Monolithic interface used by all card components |

#### Current Interface (ISP-001)

```typescript
// VIOLATION: 14 unrelated props in single interface
interface AddressTransactionsSectionProps {
  // Display props
  address: string
  transactions: Transaction[]
  totalCount: number

  // State props
  loading: boolean
  error: Error | null

  // Filter props
  activeFilters: TransactionFilterValues | null
  onApplyFilters: (filters: TransactionFilterValues) => void
  onResetFilters: () => void

  // Pagination props
  currentPage: number
  itemsPerPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}
```

#### Recommended Refactoring

```typescript
// COMPLIANT: Segregated interfaces
interface TransactionDataProps {
  address: string
  transactions: Transaction[]
  totalCount: number
}

interface LoadingStateProps {
  loading: boolean
  error: Error | null
}

interface FilterProps {
  activeFilters: TransactionFilterValues | null
  onApplyFilters: (filters: TransactionFilterValues) => void
  onResetFilters: () => void
}

interface PaginationProps {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

// Compose as needed
type AddressTransactionsSectionProps =
  TransactionDataProps &
  LoadingStateProps &
  FilterProps &
  PaginationProps
```

### 2.4 Dependency Inversion Principle (DIP)

| ID | File | Lines | Violation | Severity |
|----|------|-------|-----------|----------|
| DIP-001 | `lib/api/relay.ts` | 19-56 | Hard-coded Apollo Client creation | **MEDIUM** |
| DIP-002 | `lib/hooks/useWalletConnection.ts` | 31-35 | Direct `window.ethereum` access | **MEDIUM** |
| DIP-003 | `lib/hooks/usePagination.ts` | 51 | Direct `getPreference()` call | **MEDIUM** |
| DIP-004 | `lib/config/constants.ts` | - | Hard-coded constants used directly | **MEDIUM** |

#### Recommended Solution

```typescript
// Before (DIP violation)
const getEthereumProvider = () => {
  return window.ethereum // Hard dependency
}

// After (DIP compliant)
interface WalletProvider {
  request: (args: RequestArguments) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
}

const useWalletConnection = (provider?: WalletProvider) => {
  const walletProvider = provider ?? window.ethereum
  // ...
}
```

### 2.5 Liskov Substitution Principle (LSP)

| ID | File | Issue | Severity |
|----|------|-------|----------|
| LSP-001 | `lib/utils/graphql-transforms.ts:10-35` | Inconsistent null handling (`?? null` vs `?? undefined` mixed) | **MEDIUM** |

---

## 3. Naming Convention Issues

### 3.1 File Naming Violations

**Standard**: Component files should use PascalCase per project conventions (CLAUDE.md)

| Current Name | Expected Name | Path | Status |
|--------------|---------------|------|--------|
| ~~`button.tsx`~~ | `Button.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`card.tsx`~~ | `Card.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`checkbox.tsx`~~ | `Checkbox.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`input.tsx`~~ | `Input.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`select.tsx`~~ | `Select.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`table.tsx`~~ | `Table.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`tabs.tsx`~~ | `Tabs.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`pagination.tsx`~~ | `Pagination.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`pagination-buttons.tsx`~~ | `PaginationButtons.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`pagination-controls.tsx`~~ | `PaginationControls.tsx` | `components/ui/` | ✅ RESOLVED |
| ~~`virtualized-table.tsx`~~ | `VirtualizedTable.tsx` | `components/ui/` | ✅ RESOLVED |

### 3.2 Compliance Summary

| Convention | Status | Notes |
|------------|--------|-------|
| Component Files (PascalCase) | ✅ Compliant | Resolved 2026-02-06 |
| Function Names (camelCase) | ✅ Compliant | - |
| Hook Names (`use` prefix) | ✅ Compliant | - |
| Types/Interfaces (PascalCase) | ✅ Compliant | - |
| Constants (UPPER_SNAKE_CASE) | ✅ Compliant | - |
| Utility Files (camelCase) | ✅ Compliant | - |

---

## 4. Clean Code Violations

### 4.1 Large Files (>400 lines)

| File | Lines | Severity | Recommended Action |
|------|-------|----------|-------------------|
| ~~`lib/hooks/useSystemContracts.ts`~~ | ~~1,606~~ | ~~**CRITICAL**~~ | ✅ **RESOLVED** - Split into 3 domain-specific files |
| ~~`lib/hooks/useConsensus.ts`~~ | ~~906~~ | ~~**HIGH**~~ | ✅ **RESOLVED** - Split into 3 domain-specific files |
| ~~`lib/config/constants.ts`~~ | ~~843~~ | ~~**HIGH**~~ | ✅ **RESOLVED** - Split into 6 domain-specific files |
| `lib/apollo/queries.ts` | 734 | **HIGH** | Split by entity (block, transaction, address, etc.) |
| `lib/hooks/useGovernance.ts` | 649 | **MEDIUM** | Extracted from useSystemContracts, acceptable size |
| `components/transactions/TxDetailCards.tsx` | 619 | **MEDIUM** | Extract individual card components |
| `components/settings/NetworkSettings.tsx` | 523 | **MEDIUM** | Extract form and card sub-components |
| `components/systemContracts/GovernanceProposalsViewer.tsx` | 502 | **MEDIUM** | Extract table and filter components |
| `components/validators/ValidatorDetail.tsx` | 446 | **MEDIUM** | Extract detail sections |
| `stores/consensusStore.ts` | 422 | **LOW** | Consider splitting by concern |
| `components/layout/Header.tsx` | 407 | **LOW** | Extract navigation sub-components |

### 4.2 Console Statements

**Total: 36 files remaining** (originally 45+, 18 statements converted to errorLogger)

#### High-Impact Files (RESOLVED)

| File | Count | Type | Status |
|------|-------|------|--------|
| ~~`stores/networkStore.ts`~~ | ~~6~~ | ~~`console.error`~~ | ✅ Converted to errorLogger |
| ~~`lib/apollo/client.ts`~~ | ~~5~~ | ~~`console.error`~~ | ✅ Converted to errorLogger |
| ~~`lib/hooks/useSubscriptions.ts`~~ | ~~4~~ | ~~`console.error`~~ | ✅ Converted to errorLogger |
| `components/settings/NotificationSettings.tsx` | 3 | `console.error` |
| `components/providers/RealtimeProvider.tsx` | 3 | `console.error` |

#### API Routes with Console Statements

```
app/api/v1/token/[address]/transfers/route.ts:104
app/api/v1/token/[address]/route.ts:89
app/api/v1/contract/[address]/source/route.ts:79
app/api/v1/contract/[address]/abi/route.ts:76
app/api/v1/contract/[address]/route.ts:80
app/api/v1/tx/[hash]/logs/route.ts:62
app/api/v1/tx/[hash]/route.ts:69
```

#### Recommended Solution

```typescript
// Create a logging utility
// lib/utils/logger.ts
const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ERROR] ${message}`, ...args)
    }
    // In production: send to logging service
  },
  warn: (message: string, ...args: unknown[]) => { /* ... */ },
  info: (message: string, ...args: unknown[]) => { /* ... */ },
}

export { logger }
```

### 4.3 ESLint Disable Directives

| File | Directive | Reason |
|------|-----------|--------|
| `lib/apollo/queries.ts:1` | `/* eslint-disable max-lines */` | File is 734 lines |
| `lib/hooks/useSubscriptions.ts` | `eslint-disable-next-line` (4x) | React hooks dependency warnings |
| `lib/hooks/useLatestHeight.ts` | `eslint-disable-next-line` (2x) | Dependency warnings |
| `lib/hooks/usePagination.ts` | `eslint-disable-next-line` (2x) | `exhaustive-deps` warnings |
| `lib/hooks/useAnalytics.ts:98` | `/* eslint-disable no-magic-numbers */` | Mock data |
| `components/gas/TransactionSimulator.tsx` | `eslint-disable-next-line` (2x) | `exhaustive-deps` warnings |

### 4.4 Commented Code Blocks

| File | Lines | Content |
|------|-------|---------|
| `lib/apollo/client.ts` | 63-69 | GraphQL request logging code |

### 4.5 Functions with Excessive Parameters

| File | Function | Parameters | Recommended |
|------|----------|------------|-------------|
| `NetworkSettings.tsx:232` | `NetworkForm()` | 6 | Use options object |
| `NetworkSettings.tsx:185` | `CustomNetworkCard()` | 5 | Use options object |

#### Recommended Refactoring

```typescript
// Before
function NetworkForm({
  formData,
  formErrors,
  editingId,
  onInputChange,
  onSave,
  onCancel,
}) { /* ... */ }

// After
interface NetworkFormProps {
  formData: FormData
  formErrors: FormErrors
  editingId: string | null
  handlers: {
    onInputChange: (field: string, value: string) => void
    onSave: () => void
    onCancel: () => void
  }
}

function NetworkForm({ formData, formErrors, editingId, handlers }: NetworkFormProps) {
  const { onInputChange, onSave, onCancel } = handlers
  /* ... */
}
```

### 4.6 Magic Numbers/Strings

| File | Line | Value | Suggested Constant |
|------|------|-------|-------------------|
| `lib/hooks/useConsensus.ts` | 237 | `66.7` | `CONSENSUS.PARTICIPATION_THRESHOLD` |
| `lib/apollo/client.ts` | 86-100 | Various merge policies | `APOLLO_MERGE_POLICIES` |
| `TxDetailCards.tsx` | 321 | `max-h-32` | CSS variable or constant |

---

## 5. Priority Matrix

### Critical (Fix Immediately)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| ~~SRP-001~~ | ~~`useSystemContracts.ts` - 1,606 lines~~ | ~~Maintainability~~ | ✅ **RESOLVED** |
| ~~SRP-002~~ | ~~`useConsensus.ts` - 906 lines~~ | ~~Maintainability~~ | ✅ **RESOLVED** |
| ISP-001 | `AddressTransactionsSectionProps` - 14 props | Reusability | Medium |

### High (Fix This Sprint)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| ~~NC-001~~ | ~~UI component file naming (11 files)~~ | ~~Consistency~~ | ✅ **RESOLVED** |
| ~~CC-001~~ | ~~`constants.ts` - 843 lines~~ | ~~Maintainability~~ | ✅ **RESOLVED** |
| CC-002 | Console statements (45+ files) | Production quality | Medium |

### Medium (Fix This Month)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| DIP-001 | Apollo Client hard dependency | Testability | Medium |
| OCP-001 | Status badge hardcoding | Extensibility | Low |
| CC-002 | ESLint disable directives (11) | Code quality | Low |

### Low (Backlog)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| LSP-001 | Inconsistent null handling | Predictability | Low |
| CC-003 | Commented code blocks | Cleanliness | Low |
| CC-004 | Magic numbers | Maintainability | Low |

---

## 6. Remediation Roadmap

### Phase 1: Critical Refactoring (Week 1-2)

```
1. Split large hook files
   ├── ✅ useSystemContracts.ts → 3 files (COMPLETED 2026-02-06)
   │   ├── useNativeCoinAdapter.ts (230 lines)
   │   ├── useContractSubscriptions.ts (349 lines)
   │   └── useGovernance.ts (649 lines)
   ├── ✅ useConsensus.ts → 3 files (COMPLETED 2026-02-06)
   │   ├── consensus.types.ts (145 lines)
   │   ├── useConsensusQueries.ts (353 lines)
   │   └── useConsensusSubscriptions.ts (321 lines)
   └── ✅ constants.ts → 6 domain files (COMPLETED 2026-02-06)
       ├── pagination.ts (28 lines)
       ├── realtime.ts (195 lines)
       ├── consensus.ts (107 lines)
       ├── blockchain.ts (236 lines)
       ├── system-contracts.ts (82 lines)
       └── ui.ts (131 lines)

2. Segregate bloated interfaces
   └── AddressTransactionsSectionProps → 4 focused interfaces
```

### Phase 2: Code Quality (Week 2-3)

```
1. Remove/replace console statements
   └── Implement logger utility

2. ✅ Rename UI component files (COMPLETED 2026-02-06)
   └── kebab-case → PascalCase (11 files)

3. Document or remove ESLint disables
```

### Phase 3: Architecture Improvements (Week 3-4)

```
1. Implement dependency injection
   ├── Apollo Client factory
   └── Wallet provider abstraction

2. Create configuration providers
   └── Constants → Context-based config

3. Standardize null handling
   └── Consistent transform functions
```

### Phase 4: Cleanup (Ongoing)

```
1. Remove commented code
2. Extract magic numbers to constants
3. Reduce function parameters
4. Add missing error handling
```

---

## Appendix A: File Impact Summary

### Files Requiring Major Refactoring

| File | Issues | Priority |
|------|--------|----------|
| ~~`lib/hooks/useSystemContracts.ts`~~ | ~~SRP, Size (1,606 lines)~~ | ✅ **RESOLVED** |
| ~~`lib/hooks/useConsensus.ts`~~ | ~~SRP, Size (906 lines)~~ | ✅ **RESOLVED** |
| `lib/hooks/useAddress.ts` | SRP (6 responsibilities) | **HIGH** |
| `lib/hooks/usePagination.ts` | SRP, DIP | **MEDIUM** |
| ~~`lib/config/constants.ts`~~ | ~~Size (843 lines)~~ | ✅ **RESOLVED** |
| `components/address/AddressTransactionsSection.tsx` | ISP (14 props) | **HIGH** |
| `components/transactions/TxDetailCards.tsx` | ISP, Size (619 lines) | **MEDIUM** |

### Files Requiring Minor Updates

| File | Issues | Priority |
|------|--------|----------|
| ~~`components/ui/*.tsx` (11 files)~~ | ~~File naming~~ | ✅ **RESOLVED** |
| `lib/utils/graphql-transforms.ts` | LSP (null handling) | **MEDIUM** |
| `stores/networkStore.ts` | Console statements (6) | **MEDIUM** |
| `lib/apollo/client.ts` | Console statements (5), Commented code | **MEDIUM** |

---

## Appendix B: Metrics Targets

| Metric | Current | Target | Timeline | Progress |
|--------|---------|--------|----------|----------|
| Files >400 lines | 10 | 0 | 4 weeks | 3 resolved |
| Console statements | 36 files | 0 | 2 weeks | 18 statements converted |
| ESLint disables | 11 | 3 (documented) | 2 weeks | - |
| SRP violations | 6 major | 0 | 4 weeks | 2 resolved |
| ISP violations | 3 major | 0 | 3 weeks | - |
| Naming violations | 0 | 0 | ~~1 week~~ | ✅ 11 resolved |

---

*This document should be reviewed and updated after each refactoring phase.*

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-06 | Initial document creation | - |
| 2026-02-06 | Updated: Completed `useSystemContracts.ts` split into 3 domain-specific modules | - |
| 2026-02-06 | Updated: Completed NC-001 - UI component files renamed to PascalCase (11 files) | - |
| 2026-02-06 | Updated: Completed SRP-002 - `useConsensus.ts` split into 3 domain-specific modules | - |
| 2026-02-06 | Updated: Completed CC-001 - `constants.ts` split into 6 domain-specific modules | - |
| 2026-02-06 | Updated: CC-002 in progress - Converted 18 console statements in high-impact files to errorLogger | - |
