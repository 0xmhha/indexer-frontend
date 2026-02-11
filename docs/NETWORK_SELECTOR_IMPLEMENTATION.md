# Dynamic Network Selector Implementation Guide

> **Status**: ✅ Implementation Complete
> **Created**: 2025-01-23
> **Completed**: 2026-02-12
> **TDD Approach**: RED → GREEN pattern
>
> **Note**: All 5 phases have been implemented. This document is retained as architecture reference for the dynamic network selector system. Key files: `stores/networkStore.ts`, `lib/providers/NetworkProvider.tsx`, `components/common/NetworkSelector.tsx`, `components/settings/NetworkSettings.tsx`

## Overview

런타임에 네트워크(Anvil, StableNet 등)를 선택할 수 있는 UI를 추가합니다. 설정 파일에 여러 체인 정보를 정의하고, Header에서 드롭다운으로 선택하면 Apollo client가 재구성됩니다.

## Architecture

```
[Network Config] → [Network Store (Zustand)] → [NetworkProvider]
                                                    ↓
                                            [Apollo Client Factory]
                                                    ↓
                                            [Apollo Provider] → [App]
```

---

## Implementation Phases

### Phase 1: Foundation (New Files)

| File | Type | Description |
|------|------|-------------|
| `lib/config/networks.types.ts` | NEW | Network 타입 정의 |
| `config/networks.config.ts` | NEW | 네트워크 프리셋 설정 |
| `stores/networkStore.ts` | NEW | 네트워크 상태 관리 |

### Phase 2: Apollo Client Refactoring

| File | Type | Description |
|------|------|-------------|
| `lib/apollo/client.ts` | MODIFY | Factory 패턴 추가 |

### Phase 3: Provider Integration

| File | Type | Description |
|------|------|-------------|
| `lib/providers/NetworkProvider.tsx` | NEW | 네트워크 인식 Provider |
| `lib/providers/Providers.tsx` | MODIFY | NetworkProvider 통합 |
| `lib/providers/ApolloProvider.tsx` | DELETE | NetworkProvider로 대체 |

### Phase 4: UI Integration

| File | Type | Description |
|------|------|-------------|
| `components/common/NetworkSelector.tsx` | NEW | 네트워크 선택 드롭다운 |
| `components/layout/Header.tsx` | MODIFY | NetworkSelector 추가 |

### Phase 5: Custom Network Management

| File | Type | Description |
|------|------|-------------|
| `components/settings/NetworkSettings.tsx` | NEW | 커스텀 네트워크 추가/수정/삭제 UI |
| `app/settings/page.tsx` | MODIFY | NetworkSettings 섹션 추가 |

---

## Detailed Specifications

### 1. `lib/config/networks.types.ts`

```typescript
/**
 * Network endpoint configuration
 */
export interface NetworkEndpoints {
  graphqlEndpoint: string
  wsEndpoint: string
  jsonRpcEndpoint: string
}

/**
 * Chain information
 */
export interface NetworkChain {
  name: string
  id: string
  currencySymbol: string
}

/**
 * Complete network configuration
 */
export interface NetworkConfig {
  /** Unique network identifier */
  id: string
  /** Human-readable name */
  name: string
  /** Network type for grouping */
  type: 'mainnet' | 'testnet' | 'devnet' | 'custom'
  /** API endpoints */
  endpoints: NetworkEndpoints
  /** Chain information */
  chain: NetworkChain
  /** Optional icon/logo path */
  icon?: string
  /** Whether this is a user-defined custom network */
  isCustom?: boolean
  /** Network description */
  description?: string
}

/**
 * Preset network (built-in)
 */
export interface NetworkPreset extends NetworkConfig {
  isCustom: false
}

/**
 * Custom network (user-defined)
 */
export interface CustomNetwork extends NetworkConfig {
  isCustom: true
  createdAt: string
}

export type Network = NetworkPreset | CustomNetwork
```

**Tests (RED):**
- `networks.types.test.ts`: Type validation with Zod schemas

---

### 2. `config/networks.config.ts`

네트워크 프리셋 정의:

```typescript
export const NETWORK_PRESETS: Record<string, NetworkPreset> = {
  'anvil-local': {
    id: 'anvil-local',
    name: 'Anvil (Local)',
    type: 'devnet',
    endpoints: {
      graphqlEndpoint: 'http://localhost:8080/graphql',
      wsEndpoint: 'ws://localhost:8080/graphql/ws',
      jsonRpcEndpoint: 'http://localhost:8545',
    },
    chain: {
      name: 'Anvil',
      id: '31337',
      currencySymbol: 'ETH',
    },
    description: 'Foundry Anvil Local Development',
    isCustom: false,
  },
  'stablenet-local': {
    id: 'stablenet-local',
    name: 'StableNet (Local)',
    type: 'devnet',
    endpoints: {
      graphqlEndpoint: 'http://localhost:8080/graphql',
      wsEndpoint: 'ws://localhost:8080/graphql/ws',
      jsonRpcEndpoint: 'http://localhost:8080/rpc',
    },
    chain: {
      name: 'StableNet',
      id: '8283',
      currencySymbol: 'WKRC',
    },
    description: 'StableNet Local Development',
    isCustom: false,
  },
  'stablenet-testnet': {
    id: 'stablenet-testnet',
    name: 'StableNet Testnet',
    type: 'testnet',
    endpoints: {
      graphqlEndpoint: 'https://testnet-explorer.stablenet.io/graphql',
      wsEndpoint: 'wss://testnet-explorer.stablenet.io/graphql/ws',
      jsonRpcEndpoint: 'https://testnet-rpc.stablenet.io',
    },
    chain: {
      name: 'StableNet Testnet',
      id: '8284',
      currencySymbol: 'tSTABLE',
    },
    description: 'StableNet Test Network',
    isCustom: false,
  },
  'stablenet-mainnet': {
    id: 'stablenet-mainnet',
    name: 'StableNet Mainnet',
    type: 'mainnet',
    endpoints: {
      graphqlEndpoint: 'https://explorer.stablenet.io/graphql',
      wsEndpoint: 'wss://explorer.stablenet.io/graphql/ws',
      jsonRpcEndpoint: 'https://rpc.stablenet.io',
    },
    chain: {
      name: 'StableNet',
      id: '8283',
      currencySymbol: 'STABLE',
    },
    description: 'StableNet Production Network',
    isCustom: false,
  },
}

export const DEFAULT_NETWORK_ID = 'stablenet-local'

export function getNetworkPresets(): NetworkPreset[] {
  return Object.values(NETWORK_PRESETS)
}

export function getNetworkPreset(id: string): NetworkPreset | undefined {
  return NETWORK_PRESETS[id]
}
```

**Tests (RED):**
- `networks.config.test.ts`: Preset validation, getNetworkPreset(), getNetworkPresets()

---

### 3. `stores/networkStore.ts`

Zustand store with persistence:

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface NetworkState {
  // State
  currentNetworkId: string
  currentNetwork: Network | null
  customNetworks: Record<string, CustomNetwork>
  isConnecting: boolean
  connectionError: string | null
  lastConnectedAt: Date | null

  // Actions
  selectNetwork: (networkId: string) => void
  addCustomNetwork: (network: Omit<CustomNetwork, 'createdAt' | 'isCustom'>) => string
  updateCustomNetwork: (networkId: string, updates: Partial<NetworkConfig>) => void
  removeCustomNetwork: (networkId: string) => void
  setConnecting: (isConnecting: boolean) => void
  setConnectionError: (error: string | null) => void
  setConnected: () => void
  getAllNetworks: () => Network[]
  getNetworkById: (id: string) => Network | undefined
  reset: () => void
}

// Storage key
const STORAGE_KEY = 'indexer-network-store'

// Max custom networks
const MAX_CUSTOM_NETWORKS = 10
```

**Tests (RED):**
- `networkStore.test.ts`:
  - Initial state
  - selectNetwork() changes current network
  - addCustomNetwork() adds and returns ID
  - addCustomNetwork() throws when max reached
  - updateCustomNetwork() updates existing
  - removeCustomNetwork() removes and switches to default if current
  - getAllNetworks() returns presets + custom
  - getNetworkById() returns correct network
  - Persistence to localStorage
  - Hydration restores state

---

### 4. `lib/apollo/client.ts` (MODIFY)

Factory 패턴 추가:

```typescript
export interface ApolloClientInstance {
  client: ApolloClient<NormalizedCacheObject>
  wsClient: WsClient | null
  dispose: () => void
}

/**
 * Create a new Apollo Client instance for the given endpoints
 */
export function createApolloClient(endpoints: NetworkEndpoints): ApolloClientInstance {
  // Create HTTP Link
  const httpLink = new HttpLink({
    uri: endpoints.graphqlEndpoint,
    credentials: 'same-origin',
  })

  // Create WebSocket client and link
  let wsClient: WsClient | null = null
  let wsLink: GraphQLWsLink | null = null

  if (typeof window !== 'undefined') {
    wsClient = createClient({
      url: endpoints.wsEndpoint,
      lazy: true,
      keepAlive: REALTIME.WS_KEEPALIVE_INTERVAL,
      retryAttempts: REALTIME.WS_RETRY_ATTEMPTS,
      // ... retry config
    })
    wsLink = new GraphQLWsLink(wsClient)
  }

  // Split link for subscriptions vs queries/mutations
  const splitLink = /* ... */

  // Create client
  const client = new ApolloClient({
    link: from([errorLink, loggingLink, splitLink]),
    cache: new InMemoryCache({ /* type policies */ }),
    defaultOptions: { /* ... */ },
  })

  // Dispose function
  const dispose = () => {
    if (wsClient) wsClient.dispose()
    client.clearStore()
    client.stop()
  }

  return { client, wsClient, dispose }
}

// Legacy singleton for backward compatibility
export const apolloClient = createApolloClient({
  graphqlEndpoint: env.graphqlEndpoint,
  wsEndpoint: env.wsEndpoint,
  jsonRpcEndpoint: env.jsonRpcEndpoint,
}).client
```

**Tests (RED):**
- `apolloClient.test.ts`:
  - createApolloClient() returns valid client instance
  - dispose() cleans up WebSocket connection
  - dispose() clears cache
  - Multiple clients can be created independently

---

### 5. `lib/providers/NetworkProvider.tsx`

```typescript
'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { ApolloProvider as BaseApolloProvider, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { createApolloClient, ApolloClientInstance } from '@/lib/apollo/client'
import { useNetworkStore } from '@/stores/networkStore'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { useConsensusStore } from '@/stores/consensusStore'

interface NetworkContextValue {
  network: Network | null
  apolloClient: ApolloClient<NormalizedCacheObject> | null
  isReconnecting: boolean
  switchNetwork: (networkId: string) => Promise<void>
}

const NetworkContext = createContext<NetworkContextValue>(/* ... */)

export const useNetwork = () => useContext(NetworkContext)

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Subscribe to network store
  const currentNetwork = useNetworkStore((s) => s.currentNetwork)
  const currentNetworkId = useNetworkStore((s) => s.currentNetworkId)

  // Track Apollo instance
  const apolloInstanceRef = useRef<ApolloClientInstance | null>(null)
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)

  // Initialize/switch client when network changes
  useEffect(() => {
    if (!currentNetwork) return

    const initializeClient = async () => {
      setIsReconnecting(true)

      // Dispose previous
      if (apolloInstanceRef.current) {
        apolloInstanceRef.current.dispose()
      }

      // Clear stores
      useRealtimeStore.getState().reset()
      useConsensusStore.getState().clearAll?.()

      // Create new client
      const instance = createApolloClient(currentNetwork.endpoints)
      apolloInstanceRef.current = instance
      setApolloClient(instance.client)

      setIsReconnecting(false)
    }

    initializeClient()

    return () => {
      apolloInstanceRef.current?.dispose()
    }
  }, [currentNetworkId])

  // Show loading during initial connection
  if (!apolloClient) {
    return <LoadingSpinner message={`Connecting to ${currentNetwork?.name}...`} />
  }

  return (
    <NetworkContext.Provider value={{ network: currentNetwork, apolloClient, isReconnecting, switchNetwork }}>
      <BaseApolloProvider client={apolloClient}>
        {children}
      </BaseApolloProvider>
    </NetworkContext.Provider>
  )
}
```

**Tests (RED):**
- `NetworkProvider.test.tsx`:
  - Renders children when connected
  - Shows loading state initially
  - Disposes previous client on network change
  - Resets realtime store on network change
  - switchNetwork() triggers reconnection

---

### 6. `lib/providers/Providers.tsx` (MODIFY)

```typescript
'use client'

import { ReactNode } from 'react'
import { NetworkProvider } from './NetworkProvider'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NetworkProvider>
      <RealtimeProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </RealtimeProvider>
    </NetworkProvider>
  )
}
```

---

### 7. `components/common/NetworkSelector.tsx`

```typescript
'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useNetworkStore } from '@/stores/networkStore'
import { useNetwork } from '@/lib/providers/NetworkProvider'
import { getNetworkPresets } from '@/config/networks.config'

// Network type badge component
function NetworkTypeBadge({ type }: { type: Network['type'] }) {
  const colors = {
    mainnet: 'bg-success/20 text-success',
    testnet: 'bg-warning/20 text-warning',
    devnet: 'bg-accent-blue/20 text-accent-blue',
    custom: 'bg-accent-purple/20 text-accent-purple',
  }
  return <span className={`px-1.5 py-0.5 text-[10px] font-mono uppercase ${colors[type]}`}>{type}</span>
}

// Connection status indicator
function ConnectionIndicator({ isConnecting, error }: { isConnecting: boolean; error: string | null }) {
  if (isConnecting) return <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
  if (error) return <div className="h-2 w-2 rounded-full bg-error" />
  return <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
}

export function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentNetwork = useNetworkStore((s) => s.currentNetwork)
  const isConnecting = useNetworkStore((s) => s.isConnecting)
  const connectionError = useNetworkStore((s) => s.connectionError)
  const customNetworks = useNetworkStore((s) => s.customNetworks)
  const { switchNetwork, isReconnecting } = useNetwork()

  // Group networks by type
  const groupedNetworks = useMemo(() => {
    const all = [...getNetworkPresets(), ...Object.values(customNetworks)]
    return all.reduce((acc, network) => {
      if (!acc[network.type]) acc[network.type] = []
      acc[network.type].push(network)
      return acc
    }, {} as Record<string, Network[]>)
  }, [customNetworks])

  // Click outside to close
  useEffect(() => { /* ... */ }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isReconnecting}
        className="flex items-center gap-2 border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs ..."
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ConnectionIndicator isConnecting={isConnecting || isReconnecting} error={connectionError} />
        <span className="max-w-[120px] truncate">{currentNetwork?.chain.name || 'Select Network'}</span>
        <span className="text-text-muted">ID: {currentNetwork?.chain.id || '---'}</span>
        <ChevronIcon rotated={isOpen} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 border border-bg-tertiary bg-bg-primary shadow-lg z-50">
          {/* Network groups: mainnet, testnet, devnet, custom */}
          {['mainnet', 'testnet', 'devnet', 'custom'].map(type => (
            <NetworkGroup
              key={type}
              type={type}
              networks={groupedNetworks[type]}
              currentId={currentNetwork?.id}
              onSelect={handleNetworkSelect}
            />
          ))}

          {/* Add custom network link */}
          <a href="/settings#networks" className="block px-4 py-3 font-mono text-xs text-accent-blue">
            + Add Custom Network
          </a>
        </div>
      )}
    </div>
  )
}
```

**Tests (RED):**
- `NetworkSelector.test.tsx`:
  - Renders current network name and chain ID
  - Opens dropdown on click
  - Closes dropdown on outside click
  - Groups networks by type
  - Calls switchNetwork on selection
  - Shows connection status indicator
  - Disables button when reconnecting

---

### 8. `components/layout/Header.tsx` (MODIFY)

**변경 위치**: Line 261-264

```diff
- <div className="hidden items-center gap-2 md:flex" role="status" aria-live="polite">
-   <div className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true"></div>
-   <span className="font-mono text-xs text-text-secondary">Chain ID: {env.chainId}</span>
- </div>
+ <div className="hidden items-center md:flex">
+   <NetworkSelector />
+ </div>
```

**Import 추가**:
```typescript
import { NetworkSelector } from '@/components/common/NetworkSelector'
```

---

### 9. `components/settings/NetworkSettings.tsx`

커스텀 네트워크 관리 UI:

```typescript
'use client'

import { useState } from 'react'
import { useNetworkStore } from '@/stores/networkStore'
import { z } from 'zod'

// Validation schema
const customNetworkSchema = z.object({
  name: z.string().min(1).max(50),
  graphqlEndpoint: z.string().url(),
  wsEndpoint: z.string().url(),
  jsonRpcEndpoint: z.string().url(),
  chainId: z.string().regex(/^\d+$/),
  currencySymbol: z.string().min(1).max(10),
})

export function NetworkSettings() {
  const customNetworks = useNetworkStore((s) => s.customNetworks)
  const addCustomNetwork = useNetworkStore((s) => s.addCustomNetwork)
  const removeCustomNetwork = useNetworkStore((s) => s.removeCustomNetwork)
  const updateCustomNetwork = useNetworkStore((s) => s.updateCustomNetwork)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-lg text-text-primary">Custom Networks</h3>
        <button onClick={() => setIsAddModalOpen(true)} className="...">
          Add Network
        </button>
      </div>

      {/* Network list */}
      <div className="space-y-2">
        {Object.values(customNetworks).map(network => (
          <NetworkCard
            key={network.id}
            network={network}
            onEdit={() => setEditingNetwork(network.id)}
            onDelete={() => removeCustomNetwork(network.id)}
          />
        ))}
      </div>

      {/* Add/Edit modal */}
      {(isAddModalOpen || editingNetwork) && (
        <NetworkFormModal
          network={editingNetwork ? customNetworks[editingNetwork] : undefined}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
```

**Tests (RED):**
- `NetworkSettings.test.tsx`:
  - Renders list of custom networks
  - Opens add modal on button click
  - Validates form inputs with Zod
  - Calls addCustomNetwork on valid submit
  - Shows edit modal for existing network
  - Calls removeCustomNetwork on delete

---

## Implementation Order (TDD)

각 단계에서 **RED → GREEN** 패턴 적용:

1. **`lib/config/networks.types.ts`**
   - RED: 타입 테스트 작성 (Zod 스키마로 런타임 검증)
   - GREEN: 타입 정의 구현

2. **`config/networks.config.ts`**
   - RED: 프리셋 검증 테스트
   - GREEN: 프리셋 설정 구현

3. **`stores/networkStore.ts`**
   - RED: Store action 테스트 (selectNetwork, addCustomNetwork, etc.)
   - GREEN: Zustand store 구현

4. **`lib/apollo/client.ts`**
   - RED: createApolloClient, dispose 테스트
   - GREEN: Factory 패턴 구현

5. **`lib/providers/NetworkProvider.tsx`**
   - RED: Provider 렌더링, 네트워크 전환 테스트
   - GREEN: Provider 구현

6. **`lib/providers/Providers.tsx`**
   - MODIFY: NetworkProvider 통합

7. **`components/common/NetworkSelector.tsx`**
   - RED: UI 인터랙션 테스트
   - GREEN: 컴포넌트 구현

8. **`components/layout/Header.tsx`**
   - MODIFY: NetworkSelector 추가

9. **`lib/providers/ApolloProvider.tsx`**
   - DELETE

10. **`components/settings/NetworkSettings.tsx`**
    - RED: 폼 검증, CRUD 테스트
    - GREEN: 컴포넌트 구현

11. **`app/settings/page.tsx`**
    - MODIFY: NetworkSettings 섹션 추가

---

## Verification Checklist

### 기능 테스트

- [ ] 앱 시작 시 저장된 네트워크로 연결
- [ ] Header에서 네트워크 드롭다운 표시
- [ ] 네트워크 선택 시 연결 전환
- [ ] 전환 중 로딩 상태 표시
- [ ] WebSocket 실시간 업데이트 동작
- [ ] 브라우저 새로고침 후 네트워크 유지
- [ ] Settings에서 커스텀 네트워크 추가
- [ ] 커스텀 네트워크 편집/삭제

### 명령어

```bash
# TypeScript 체크
pnpm type-check

# Lint
pnpm lint

# 테스트 실행
pnpm test

# 개발 서버
pnpm dev
```

---

## Notes

- Testnet/Mainnet URL은 실제 배포 시 수정 필요
- WebSocket 연결 실패 시 graceful degradation 고려
- 모바일에서는 NetworkSelector가 md breakpoint 이상에서만 표시
