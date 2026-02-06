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
| SOLID Violations | 21 | 2 | 4 | 14 | 1 |
| Naming Conventions | 11 | 0 | 11 | 0 | 0 |
| Clean Code Violations | 131 | 6 | 15 | 90 | 20 |
| **Total** | **173** | **8** | **30** | **114** | **21** |

### Key Findings

1. **Large Files**: 6 files exceed 500 lines, with `useSystemContracts.ts` at 1,606 lines
2. **Console Statements**: 45+ files contain `console.log/error/warn` statements
3. **Single Responsibility Violations**: Core hooks manage 5+ responsibilities each
4. **Interface Bloat**: Props interfaces combine unrelated concerns (up to 14 props)
5. **Inconsistent File Naming**: 11 UI component files use kebab-case instead of PascalCase

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
| BF-001 | `lib/hooks/useSystemContracts.ts` | 83 | `minterConfigHistory` query | Backend GraphQL schema |
| BF-002 | `lib/hooks/useSystemContracts.ts` | 143 | `authorizedAccounts` query | Backend GraphQL schema |
| BF-003 | `lib/hooks/useSystemContracts.ts` | 733 | `useMinterConfigHistory()` hook | Backend GraphQL schema |
| BF-004 | `lib/hooks/useSystemContracts.ts` | 892 | `useAuthorizedAccounts()` hook | Backend GraphQL schema |
| BF-005 | `lib/graphql/queries/relay.ts` | 173 | `networkStats` query | Backend GraphQL schema |
| BF-006 | `lib/graphql/queries/rpcProxy.ts` | 94 | `ethGetBalance` query | Backend GraphQL schema |
| BF-007 | `app/contracts/page.tsx` | 82 | Contracts list feature | Backend support |

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

| Current Name | Expected Name | Path |
|--------------|---------------|------|
| `button.tsx` | `Button.tsx` | `components/ui/` |
| `card.tsx` | `Card.tsx` | `components/ui/` |
| `checkbox.tsx` | `Checkbox.tsx` | `components/ui/` |
| `input.tsx` | `Input.tsx` | `components/ui/` |
| `select.tsx` | `Select.tsx` | `components/ui/` |
| `table.tsx` | `Table.tsx` | `components/ui/` |
| `tabs.tsx` | `Tabs.tsx` | `components/ui/` |
| `pagination.tsx` | `Pagination.tsx` | `components/ui/` |
| `pagination-buttons.tsx` | `PaginationButtons.tsx` | `components/ui/` |
| `pagination-controls.tsx` | `PaginationControls.tsx` | `components/ui/` |
| `virtualized-table.tsx` | `VirtualizedTable.tsx` | `components/ui/` |

### 3.2 Compliance Summary

| Convention | Status | Notes |
|------------|--------|-------|
| Component Files (PascalCase) | ❌ 11 violations | `components/ui/` directory |
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
| `lib/hooks/useSystemContracts.ts` | 1,606 | **CRITICAL** | Split into 4 domain-specific files |
| `lib/hooks/useConsensus.ts` | 906 | **HIGH** | Split into 3 feature-specific files |
| `lib/config/constants.ts` | 843 | **HIGH** | Split by domain (pagination, polling, features, etc.) |
| `lib/apollo/queries.ts` | 734 | **HIGH** | Split by entity (block, transaction, address, etc.) |
| `components/transactions/TxDetailCards.tsx` | 619 | **MEDIUM** | Extract individual card components |
| `components/settings/NetworkSettings.tsx` | 523 | **MEDIUM** | Extract form and card sub-components |
| `components/systemContracts/GovernanceProposalsViewer.tsx` | 502 | **MEDIUM** | Extract table and filter components |
| `components/validators/ValidatorDetail.tsx` | 446 | **MEDIUM** | Extract detail sections |
| `stores/consensusStore.ts` | 422 | **LOW** | Consider splitting by concern |
| `components/layout/Header.tsx` | 407 | **LOW** | Extract navigation sub-components |

### 4.2 Console Statements

**Total: 45+ files affected**

#### High-Impact Files

| File | Count | Type |
|------|-------|------|
| `stores/networkStore.ts` | 6 | `console.error` |
| `lib/apollo/client.ts` | 5 | `console.error` |
| `lib/hooks/useSubscriptions.ts` | 4 | `console.error` |
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
| `lib/hooks/useSystemContracts.ts` | 84-96 | `minterConfigHistory` GraphQL query |
| `lib/hooks/useSystemContracts.ts` | 144-156 | `authorizedAccounts` GraphQL query |

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
| SRP-001 | `useSystemContracts.ts` - 1,606 lines | Maintainability | High |
| SRP-002 | `useConsensus.ts` - 906 lines | Maintainability | Medium |
| ISP-001 | `AddressTransactionsSectionProps` - 14 props | Reusability | Medium |

### High (Fix This Sprint)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| NC-001 | UI component file naming (11 files) | Consistency | Low |
| CC-001 | Console statements (45+ files) | Production quality | Medium |
| SRP-003 | `constants.ts` - 843 lines | Maintainability | Medium |

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
   ├── useSystemContracts.ts → 4 files (~400 lines each)
   ├── useConsensus.ts → 3 files (~300 lines each)
   └── constants.ts → 5 domain files

2. Segregate bloated interfaces
   └── AddressTransactionsSectionProps → 4 focused interfaces
```

### Phase 2: Code Quality (Week 2-3)

```
1. Remove/replace console statements
   └── Implement logger utility

2. Rename UI component files
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
| `lib/hooks/useSystemContracts.ts` | SRP, Size (1,606 lines) | **CRITICAL** |
| `lib/hooks/useConsensus.ts` | SRP, Size (906 lines) | **HIGH** |
| `lib/hooks/useAddress.ts` | SRP (6 responsibilities) | **HIGH** |
| `lib/hooks/usePagination.ts` | SRP, DIP | **MEDIUM** |
| `lib/config/constants.ts` | Size (843 lines) | **HIGH** |
| `components/address/AddressTransactionsSection.tsx` | ISP (14 props) | **HIGH** |
| `components/transactions/TxDetailCards.tsx` | ISP, Size (619 lines) | **MEDIUM** |

### Files Requiring Minor Updates

| File | Issues | Priority |
|------|--------|----------|
| `components/ui/*.tsx` (11 files) | File naming | **HIGH** |
| `lib/utils/graphql-transforms.ts` | LSP (null handling) | **MEDIUM** |
| `stores/networkStore.ts` | Console statements (6) | **MEDIUM** |
| `lib/apollo/client.ts` | Console statements (5), Commented code | **MEDIUM** |

---

## Appendix B: Metrics Targets

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Files >400 lines | 11 | 0 | 4 weeks |
| Console statements | 45+ files | 0 | 2 weeks |
| ESLint disables | 11 | 3 (documented) | 2 weeks |
| SRP violations | 7 major | 0 | 4 weeks |
| ISP violations | 3 major | 0 | 3 weeks |
| Naming violations | 11 | 0 | 1 week |

---

*This document should be reviewed and updated after each refactoring phase.*
