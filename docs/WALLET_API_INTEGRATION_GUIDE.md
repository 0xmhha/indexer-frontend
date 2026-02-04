# Wallet API Integration Guide

> **Version**: 1.0.0
> **Last Updated**: 2025-02-03
> **Target**: StableNet Wallet Extension & Wallet SDK

## Overview

This guide documents how the StableNet wallet extension and SDK should integrate with the new API Relay endpoints to provide enhanced functionality with improved performance.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Wallet Extension                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Token     │  │ Transaction  │  │   Gas Fee    │          │
│  │  Controller  │  │  Controller  │  │  Controller  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              API Relay Client                        │       │
│  │  (Replaces direct IndexerClient + RPC calls)         │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Indexer Frontend API                             │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/v1/account/{address}/balances                         │
│  GET /api/v1/account/{address}/transactions                     │
│  GET /api/v1/account/{address}/transfers                        │
│  GET /api/v1/token/{address}                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Mapping

### Current vs New Implementation

| Wallet Feature | Current Implementation | New API Endpoint | Performance Gain |
|----------------|----------------------|------------------|------------------|
| Token Balances | `IndexerClient.getTokenBalances()` | `GET /api/v1/account/{address}/balances` | ~85% reduction |
| Native Balance | `eth_getBalance` RPC | `GET /api/v1/account/{address}/balances` | Bundled request |
| Transaction History | `IndexerClient.getTransactionsByAddress()` | `GET /api/v1/account/{address}/transactions` | ~70% reduction |
| Token Transfers | `IndexerClient.getAllERC20Transfers()` | `GET /api/v1/account/{address}/transfers` | ~70% reduction |
| Token Discovery | Multiple RPC calls | `GET /api/v1/account/{address}/balances` | ~95% reduction |
| Token Info | Manual contract calls | `GET /api/v1/token/{address}` | Single request |

---

## Integration Examples

### 1. Token Controller Integration

**Current Implementation** (`apps/wallet-extension/src/background/controllers/TokenController.ts`):

```typescript
// Current: Multiple separate calls
async refreshBalances(address: string) {
  const nativeBalance = await this.provider.getBalance(address)
  const tokenBalances = await this.indexerClient.getTokenBalances(address)
  // Process each token individually...
}
```

**New Implementation**:

```typescript
import type { AccountBalancesData } from '@/lib/api/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class TokenController {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  /**
   * Fetch all balances (native + tokens) in a single API call
   */
  async refreshBalances(address: string): Promise<AccountBalancesData> {
    const response = await fetch(
      `${this.apiBaseUrl}/api/v1/account/${address}/balances`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch balances: ${response.status}`)
    }

    const result: ApiResponse<AccountBalancesData> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown error')
    }

    return result.data
  }

  /**
   * Get balances with zero-balance tokens included
   */
  async getAllTokenBalances(address: string): Promise<AccountBalancesData> {
    const response = await fetch(
      `${this.apiBaseUrl}/api/v1/account/${address}/balances?include_zero=true`
    )

    const result: ApiResponse<AccountBalancesData> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown error')
    }

    return result.data
  }
}
```

### 2. Transaction Controller Integration

**Current Implementation** (`apps/wallet-extension/src/background/controllers/transactionController.ts`):

```typescript
// Current: Direct indexer client usage
async getTransactionHistory(address: string) {
  return this.indexerClient.getTransactionsByAddress(address, {
    limit: 50,
    offset: 0
  })
}
```

**New Implementation**:

```typescript
import type { TransactionInList, PaginatedResponse } from '@/lib/api/types'

type TransactionFilter = 'all' | 'in' | 'out' | 'self'

class TransactionController {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  /**
   * Get paginated transaction history
   */
  async getTransactionHistory(
    address: string,
    options: {
      page?: number
      limit?: number
      filter?: TransactionFilter
    } = {}
  ): Promise<PaginatedResponse<TransactionInList>> {
    const { page = 1, limit = 20, filter = 'all' } = options

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      filter
    })

    const response = await fetch(
      `${this.apiBaseUrl}/api/v1/account/${address}/transactions?${params}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get incoming transactions only
   */
  async getIncomingTransactions(
    address: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TransactionInList>> {
    return this.getTransactionHistory(address, { page, limit, filter: 'in' })
  }

  /**
   * Get outgoing transactions only
   */
  async getOutgoingTransactions(
    address: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TransactionInList>> {
    return this.getTransactionHistory(address, { page, limit, filter: 'out' })
  }
}
```

### 3. Token Transfer History Integration

**Current Implementation**:

```typescript
// Current: Separate call for ERC20 transfers
async getTokenTransfers(address: string) {
  return this.indexerClient.getAllERC20Transfers(address)
}
```

**New Implementation**:

```typescript
import type { TokenTransferInList, PaginatedResponse } from '@/lib/api/types'

type TokenType = 'all' | 'ERC20' | 'ERC721'

class TransferController {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
  }

  /**
   * Get token transfer history with filtering
   */
  async getTransfers(
    address: string,
    options: {
      page?: number
      limit?: number
      type?: TokenType
      token?: string  // Filter by specific token contract
    } = {}
  ): Promise<PaginatedResponse<TokenTransferInList>> {
    const { page = 1, limit = 20, type = 'all', token } = options

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      type
    })

    if (token) {
      params.set('token', token)
    }

    const response = await fetch(
      `${this.apiBaseUrl}/api/v1/account/${address}/transfers?${params}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch transfers: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get ERC20 transfers only
   */
  async getERC20Transfers(
    address: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TokenTransferInList>> {
    return this.getTransfers(address, { page, limit, type: 'ERC20' })
  }

  /**
   * Get NFT (ERC721) transfers only
   */
  async getNFTTransfers(
    address: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TokenTransferInList>> {
    return this.getTransfers(address, { page, limit, type: 'ERC721' })
  }

  /**
   * Get transfers for a specific token
   */
  async getTransfersForToken(
    address: string,
    tokenContract: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<TokenTransferInList>> {
    return this.getTransfers(address, { page, limit, token: tokenContract })
  }
}
```

### 4. Token Info Integration

**New Implementation**:

```typescript
import type { TokenInfoData } from '@/lib/api/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class TokenInfoController {
  private apiBaseUrl: string
  private cache: Map<string, { data: TokenInfoData; expiry: number }>

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
    this.cache = new Map()
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfoData | null> {
    // Check cache first (5 minute TTL)
    const cached = this.cache.get(tokenAddress.toLowerCase())
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/v1/token/${tokenAddress}`
      )

      if (response.status === 404) {
        return null  // Token not found
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch token info: ${response.status}`)
      }

      const result: ApiResponse<TokenInfoData> = await response.json()

      if (!result.success || !result.data) {
        return null
      }

      // Cache the result
      this.cache.set(tokenAddress.toLowerCase(), {
        data: result.data,
        expiry: Date.now() + 5 * 60 * 1000  // 5 minutes
      })

      return result.data
    } catch (error) {
      console.error('Failed to get token info:', error)
      return null
    }
  }

  /**
   * Check if address is a token contract
   */
  async isTokenContract(address: string): Promise<boolean> {
    const info = await this.getTokenInfo(address)
    return info !== null && info.transfersCount > 0
  }
}
```

---

## Wallet SDK Integration

### useBalance Hook Enhancement

**Current Implementation** (`packages/wallet-sdk/src/hooks/useBalance.ts`):

```typescript
// Current: Separate RPC call
export function useBalance(address: string) {
  const [balance, setBalance] = useState<string>('0')

  useEffect(() => {
    provider.getBalance(address).then(setBalance)
  }, [address])

  return balance
}
```

**New Implementation**:

```typescript
import { useState, useEffect, useCallback } from 'react'

interface BalanceState {
  native: string
  tokens: TokenBalance[]
  loading: boolean
  error: Error | null
}

interface TokenBalance {
  contractAddress: string
  name: string | null
  symbol: string | null
  decimals: number | null
  balance: string
  type: 'ERC20' | 'ERC721' | 'ERC1155'
}

interface UseBalanceOptions {
  includeTokens?: boolean
  includeZeroBalances?: boolean
  refreshInterval?: number  // ms
}

export function useBalance(
  address: string | undefined,
  apiBaseUrl: string,
  options: UseBalanceOptions = {}
) {
  const {
    includeTokens = true,
    includeZeroBalances = false,
    refreshInterval = 30000
  } = options

  const [state, setState] = useState<BalanceState>({
    native: '0',
    tokens: [],
    loading: true,
    error: null
  })

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams()
      if (includeZeroBalances) {
        params.set('include_zero', 'true')
      }

      const url = `${apiBaseUrl}/api/v1/account/${address}/balances?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      setState({
        native: result.data.native.balance,
        tokens: includeTokens ? result.data.tokens : [],
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }))
    }
  }, [address, apiBaseUrl, includeTokens, includeZeroBalances])

  // Initial fetch
  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(fetchBalances, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchBalances, refreshInterval])

  return {
    ...state,
    refetch: fetchBalances
  }
}
```

### useTransactions Hook

**New Implementation**:

```typescript
import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  hash: string
  blockNumber: number
  timestamp: string | null
  from: string
  to: string | null
  value: string
  gasUsed: string | null
  gasPrice: string
  status: 'success' | 'failed' | 'pending'
  type: string
  method: string | null
}

interface TransactionsState {
  transactions: Transaction[]
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
  loading: boolean
  error: Error | null
}

interface UseTransactionsOptions {
  filter?: 'all' | 'in' | 'out' | 'self'
  limit?: number
}

export function useTransactions(
  address: string | undefined,
  apiBaseUrl: string,
  options: UseTransactionsOptions = {}
) {
  const { filter = 'all', limit = 20 } = options

  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    totalCount: 0,
    page: 1,
    limit,
    hasMore: false,
    loading: true,
    error: null
  })

  const fetchTransactions = useCallback(async (page = 1) => {
    if (!address) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        filter
      })

      const url = `${apiBaseUrl}/api/v1/account/${address}/transactions?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      setState(prev => ({
        transactions: page === 1
          ? result.data
          : [...prev.transactions, ...result.data],
        totalCount: result.pagination.total,
        page,
        limit,
        hasMore: result.pagination.hasMore,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }))
    }
  }, [address, apiBaseUrl, filter, limit])

  // Initial fetch
  useEffect(() => {
    fetchTransactions(1)
  }, [fetchTransactions])

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchTransactions(state.page + 1)
    }
  }, [state.loading, state.hasMore, state.page, fetchTransactions])

  const refetch = useCallback(() => {
    fetchTransactions(1)
  }, [fetchTransactions])

  return {
    ...state,
    loadMore,
    refetch
  }
}
```

---

## API Client Wrapper

A unified API client for the wallet extension:

```typescript
// lib/api-relay-client.ts

interface ApiRelayClientConfig {
  baseUrl: string
  timeout?: number
}

export class ApiRelayClient {
  private baseUrl: string
  private timeout: number

  constructor(config: ApiRelayClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.timeout = config.timeout || 10000
  }

  private async fetch<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      return result.data
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Get all balances for an address
   */
  async getBalances(
    address: string,
    includeZero = false
  ): Promise<AccountBalancesData> {
    return this.fetch(`/api/v1/account/${address}/balances`, {
      ...(includeZero && { include_zero: 'true' })
    })
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    address: string,
    options: {
      page?: number
      limit?: number
      filter?: 'all' | 'in' | 'out' | 'self'
    } = {}
  ): Promise<PaginatedResponse<TransactionInList>> {
    const { page = 1, limit = 20, filter = 'all' } = options
    return this.fetch(`/api/v1/account/${address}/transactions`, {
      page: String(page),
      limit: String(limit),
      filter
    })
  }

  /**
   * Get token transfers
   */
  async getTransfers(
    address: string,
    options: {
      page?: number
      limit?: number
      type?: 'all' | 'ERC20' | 'ERC721'
      token?: string
    } = {}
  ): Promise<PaginatedResponse<TokenTransferInList>> {
    const { page = 1, limit = 20, type = 'all', token } = options
    return this.fetch(`/api/v1/account/${address}/transfers`, {
      page: String(page),
      limit: String(limit),
      type,
      ...(token && { token })
    })
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfoData | null> {
    try {
      return await this.fetch(`/api/v1/token/${tokenAddress}`)
    } catch (error) {
      // 404 means token not found
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }
}

// Export singleton factory
let clientInstance: ApiRelayClient | null = null

export function getApiRelayClient(config?: ApiRelayClientConfig): ApiRelayClient {
  if (!clientInstance && config) {
    clientInstance = new ApiRelayClient(config)
  }

  if (!clientInstance) {
    throw new Error('ApiRelayClient not initialized. Call with config first.')
  }

  return clientInstance
}
```

---

## Migration Checklist

### Phase 1: Token Controller

- [ ] Replace `IndexerClient.getTokenBalances()` with `/api/v1/account/{address}/balances`
- [ ] Remove separate `eth_getBalance` RPC call (included in balances response)
- [ ] Update token list UI to use new response format
- [ ] Add error handling for API failures with fallback to direct RPC

### Phase 2: Transaction Controller

- [ ] Replace `IndexerClient.getTransactionsByAddress()` with `/api/v1/account/{address}/transactions`
- [ ] Implement filter parameter support (in/out/self)
- [ ] Update pagination handling for new response format
- [ ] Update transaction list UI components

### Phase 3: Transfer History

- [ ] Replace `IndexerClient.getAllERC20Transfers()` with `/api/v1/account/{address}/transfers`
- [ ] Add token type filtering (ERC20/ERC721)
- [ ] Add specific token contract filtering
- [ ] Update transfer history UI components

### Phase 4: Token Discovery

- [ ] Use balances endpoint for automatic token discovery
- [ ] Implement token info caching with `/api/v1/token/{address}`
- [ ] Remove manual token contract calls
- [ ] Update "Add Token" flow to validate via API

### Phase 5: Wallet SDK

- [ ] Update `useBalance` hook to use new API
- [ ] Create new `useTransactions` hook
- [ ] Create new `useTransfers` hook
- [ ] Export `ApiRelayClient` for direct usage
- [ ] Update documentation

---

## Error Handling

### API Error Codes

| Code | Description | Wallet Action |
|------|-------------|---------------|
| `INVALID_ADDRESS` | Invalid Ethereum address format | Show validation error |
| `INDEXER_CONNECTION_ERROR` | Cannot reach indexer backend | Fallback to RPC, retry later |
| `INDEXER_QUERY_ERROR` | GraphQL query failed | Show generic error |
| `NOT_FOUND` | Resource not found (token, etc.) | Handle gracefully |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement backoff |
| `TIMEOUT` | Request timeout | Retry with backoff |
| `INVALID_PAGINATION` | Invalid page/limit params | Use default values |

### Fallback Strategy

```typescript
async function getBalancesWithFallback(
  address: string,
  apiClient: ApiRelayClient,
  provider: Provider
): Promise<BalanceResult> {
  try {
    // Try API first
    return await apiClient.getBalances(address)
  } catch (error) {
    console.warn('API failed, falling back to RPC:', error)

    // Fallback to direct RPC
    const nativeBalance = await provider.getBalance(address)

    return {
      address: address.toLowerCase(),
      native: {
        balance: nativeBalance.toString(),
        symbol: 'STB',
        decimals: 18
      },
      tokens: []  // Cannot get token balances via RPC only
    }
  }
}
```

---

## Performance Considerations

### Request Batching

The API automatically batches related queries. For example, `/api/v1/account/{address}/balances` internally executes:
- Native balance query
- Token balances query

These run in parallel, so one API call replaces what would have been multiple sequential calls.

### Caching Recommendations

| Data Type | Recommended TTL | Notes |
|-----------|----------------|-------|
| Native Balance | 15 seconds | Changes frequently |
| Token Balances | 30 seconds | Moderate change frequency |
| Transaction History | 60 seconds | Changes with new blocks |
| Token Info | 5 minutes | Rarely changes |

### Request Debouncing

For UI components that trigger rapid updates (e.g., address input):

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

function AccountView({ address }: { address: string }) {
  const debouncedAddress = useDebouncedValue(address, 300)
  const { native, tokens, loading } = useBalance(debouncedAddress, API_URL)

  // ...
}
```

---

## Security Considerations

1. **CORS**: API supports CORS for browser-based requests
2. **Rate Limiting**: Implement client-side rate limiting to avoid 429 errors
3. **Input Validation**: Always validate addresses before API calls
4. **Error Messages**: Don't expose internal error details to users
5. **HTTPS**: Always use HTTPS in production

---

## Testing

### Unit Test Example

```typescript
import { ApiRelayClient } from './api-relay-client'

describe('ApiRelayClient', () => {
  let client: ApiRelayClient

  beforeEach(() => {
    client = new ApiRelayClient({ baseUrl: 'http://localhost:3000' })
  })

  describe('getBalances', () => {
    it('should return balances for valid address', async () => {
      const mockResponse = {
        success: true,
        data: {
          address: '0x1234...',
          native: { balance: '1000000000000000000', symbol: 'STB', decimals: 18 },
          tokens: []
        }
      }

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getBalances('0x1234567890123456789012345678901234567890')

      expect(result.native.balance).toBe('1000000000000000000')
    })

    it('should throw error for invalid address', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid address' })
      })

      await expect(client.getBalances('invalid'))
        .rejects.toThrow()
    })
  })
})
```

---

## References

- [API Reference](./API_REFERENCE.md)
- [GraphQL Schema](../lib/graphql/queries/relay.ts)
- [API Types](../lib/api/types.ts)
- [Error Handling](../lib/api/errors.ts)
