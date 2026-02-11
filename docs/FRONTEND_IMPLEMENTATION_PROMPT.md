# Blockchain Explorer Frontend - Complete Implementation Guide

## Project Overview

Build a production-ready blockchain explorer frontend for StableNet (Ethereum-based) chain using Next.js 14+, TypeScript, and modern React patterns. This frontend consumes GraphQL/JSON-RPC APIs from the indexer-go backend and provides users with comprehensive blockchain data visualization similar to Etherscan.

---

## Design Philosophy: Crystalline Infrastructure

**Core Aesthetic Principles:**

- **Precision & Clarity**: Complex blockchain data becomes comprehensible through geometric rigor and spatial intelligence
- **Minimal Text**: Typography appears only when necessary—small, technical, serving as coordinate markers
- **Functional Color**: Restrained palette (cool grays, blacks, precise blue accents) creates zones of meaning through chromatic coding
- **Geometric Language**: Monospace fonts, hexadecimal patterns, modular repetition inspired by circuit boards and technical drawings
- **Spatial Communication**: Information organizes through careful stratification—layers of meaning stacked with precision
- **Master Craftsmanship**: Every alignment, spacing, and color choice meticulously calibrated for clarity and authority

**Visual Language:**

- Blues suggest flow and movement (transactions, real-time data)
- Structural grays anchor static elements (blocks, architecture)
- Warm accents (orange) mark critical nodes requiring attention
- Monospaced fonts honor the machine's perspective
- Shapes remain geometric: squares, circles, perfect angles—no organic curves

See `frontend-design-philosophy.md` and `blockchain-explorer-visual.pdf` for complete design reference.

---

## Technical Stack

### Core Framework

- **Next.js 14+**: App Router, Server Components, Server Actions
- **TypeScript 5.3+**: Strict mode enabled
- **React 18+**: Hooks, Suspense, Error Boundaries

### State Management & Data Fetching

- **Apollo Client**: GraphQL client with caching
- **TanStack Query (React Query)**: Server state management
- **Zustand**: Lightweight client state (theme, UI preferences)

### UI & Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component primitives (customized to design system)
- **Framer Motion**: Subtle animations for data transitions
- **Recharts/Victory**: Data visualization (blocks, transactions over time)

### Code Quality

- **ESLint**: Airbnb config + Next.js rules
- **Prettier**: Code formatting
- **Husky + lint-staged**: Pre-commit hooks
- **Vitest**: Unit testing
- **Playwright**: E2E testing

---

## Architecture Principles (SOLID)

### Single Responsibility Principle

- Each component has one reason to change
- Separate data fetching from presentation
- Distinct layers: API → Services → Hooks → Components

### Open/Closed Principle

- Components open for extension via composition
- Closed for modification through prop interfaces
- Use render props and HOCs for extensibility

### Liskov Substitution

- All component variants interchangeable
- Consistent prop interfaces across similar components
- Proper TypeScript generics for type safety

### Interface Segregation

- Small, focused interfaces
- No component forced to implement unused props
- Separate read/write interfaces where applicable

### Dependency Inversion

- Depend on abstractions (hooks, contexts)
- No direct storage/API access in components
- Inject dependencies via props/context

---

## Code Quality Standards (from system_prompt_additions.md)

### Error Handling

```typescript
// ❌ NEVER: Silent error swallowing
try {
  fetchData()
} catch (e) {
  console.log(e) // NO
}

// ✅ DO: Explicit error types
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

async function fetchBlock(height: bigint): Promise<Result<Block, AppError>> {
  try {
    const result = await client.query({
      query: GET_BLOCK,
      variables: { number: height.toString() },
    })
    return { ok: true, value: result.data.block }
  } catch (error) {
    if (error instanceof ApolloError) {
      return { ok: false, error: new AppError('GRAPHQL_ERROR', error.message, error) }
    }
    return { ok: false, error: new AppError('UNKNOWN_ERROR', 'Failed to fetch block', error) }
  }
}
```

### Resource Management

```typescript
// ✅ Proper cleanup with try-finally
async function subscribeToBlocks(callback: (block: Block) => void): Promise<void> {
  const ws = new WebSocket('ws://localhost:8080/ws')
  try {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = reject
    })
  } finally {
    ws.close() // Always executed
  }
}
```

### Input Validation

```typescript
// ✅ Runtime validation at API boundaries
import { z } from 'zod'

const BlockFilterSchema = z.object({
  numberFrom: z.bigint().optional(),
  numberTo: z.bigint().optional(),
  miner: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
})

type BlockFilter = z.infer<typeof BlockFilterSchema>

function validateBlockFilter(input: unknown): Result<BlockFilter, ValidationError> {
  const result = BlockFilterSchema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: new ValidationError(result.error.message) }
  }
  return { ok: true, value: result.data }
}
```

### TypeScript Strict Mode

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Backend API Reference

### GraphQL Endpoint

**URL**: `http://localhost:8080/graphql`
**Playground**: `http://localhost:8080/playground`

### Core GraphQL Queries

```graphql
# Get latest indexed block height
query GetLatestHeight {
  latestHeight
}

# Get block by number
query GetBlock($number: BigInt!) {
  block(number: $number) {
    number
    hash
    parentHash
    timestamp
    miner
    gasUsed
    gasLimit
    size
    transactionCount
    transactions {
      hash
      from
      to
      value
      gas
      gasPrice
      type
      nonce
    }
  }
}

# Get block by hash
query GetBlockByHash($hash: Hash!) {
  blockByHash(hash: $hash) {
    number
    hash
    timestamp
    miner
    transactions {
      hash
      from
      to
      value
    }
  }
}

# Get transaction by hash
query GetTransaction($hash: Hash!) {
  transaction(hash: $hash) {
    hash
    blockNumber
    blockHash
    transactionIndex
    from
    to
    value
    gas
    gasPrice
    maxFeePerGas
    maxPriorityFeePerGas
    type
    input
    nonce
    v
    r
    s
    chainId
    receipt {
      status
      gasUsed
      cumulativeGasUsed
      effectiveGasPrice
      contractAddress
      logs {
        address
        topics
        data
        logIndex
      }
    }
  }
}

# Get transactions by address
query GetTransactionsByAddress($address: Address!, $limit: Int, $offset: Int) {
  transactionsByAddress(address: $address, pagination: { limit: $limit, offset: $offset }) {
    nodes {
      hash
      blockNumber
      from
      to
      value
      gasUsed
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}

# Get address balance at block
query GetAddressBalance($address: Address!, $blockNumber: BigInt) {
  addressBalance(address: $address, blockNumber: $blockNumber)
}

# Get balance history
query GetBalanceHistory(
  $address: Address!
  $fromBlock: BigInt!
  $toBlock: BigInt!
  $limit: Int
  $offset: Int
) {
  balanceHistory(
    address: $address
    fromBlock: $fromBlock
    toBlock: $toBlock
    pagination: { limit: $limit, offset: $offset }
  ) {
    nodes {
      blockNumber
      balance
      delta
      transactionHash
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}

# Get logs with filtering
query GetLogs(
  $address: Address
  $topics: [Hash!]
  $blockNumberFrom: BigInt
  $blockNumberTo: BigInt
  $limit: Int
  $offset: Int
) {
  logs(
    filter: {
      address: $address
      topics: $topics
      blockNumberFrom: $blockNumberFrom
      blockNumberTo: $blockNumberTo
    }
    pagination: { limit: $limit, offset: $offset }
  ) {
    nodes {
      address
      topics
      data
      blockNumber
      transactionHash
      logIndex
    }
    totalCount
  }
}
```

### WebSocket Subscriptions

**URL**: `ws://localhost:8080/ws`

```javascript
// Subscribe to new blocks
const ws = new WebSocket('ws://localhost:8080/ws')
ws.send(
  JSON.stringify({
    jsonrpc: '2.0',
    method: 'subscribe',
    params: ['newBlock'],
    id: 1,
  })
)

// Subscribe to new transactions
ws.send(
  JSON.stringify({
    jsonrpc: '2.0',
    method: 'subscribe',
    params: ['newTransaction'],
    id: 2,
  })
)
```

### JSON-RPC Endpoint

**URL**: `http://localhost:8080/rpc`

```javascript
// Get block
POST /rpc
{
  "jsonrpc": "2.0",
  "method": "getBlock",
  "params": [1000],
  "id": 1
}

// Get transaction
POST /rpc
{
  "jsonrpc": "2.0",
  "method": "getTxResult",
  "params": ["0xabc..."],
  "id": 1
}

// Get latest height
POST /rpc
{
  "jsonrpc": "2.0",
  "method": "getLatestHeight",
  "params": [],
  "id": 1
}
```

---

## Feature List & User Stories

### 1. Homepage / Dashboard

**User Story**: As a user, I want to see the current state of the blockchain at a glance.

**Features**:

- Latest block height with real-time updates
- Recent blocks (last 10) with time, miner, transaction count
- Recent transactions (last 10) with from/to/value
- Network statistics (total blocks, total transactions, avg block time)
- Real-time block/transaction feed via WebSocket
- Search bar (block number, block hash, transaction hash, address)

**Components**:

- `<Dashboard />`: Main layout
- `<LatestBlockCard />`: Display latest block info
- `<RecentBlocksList />`: List of recent blocks
- `<RecentTransactionsList />`: List of recent transactions
- `<NetworkStats />`: Network-wide statistics
- `<SearchBar />`: Global search component
- `<LiveFeed />`: Real-time WebSocket feed

**Design Notes**:

- Grid layout with geometric precision
- Monospace fonts for hashes and addresses
- Blue accents for real-time updates
- Orange highlights for high-value transactions

---

### 2. Block Detail Page

**URL**: `/block/[numberOrHash]`

**User Story**: As a user, I want to view complete information about a specific block.

**Features**:

- Block header information (number, hash, parent hash, timestamp)
- Miner address with link to address page
- Gas information (used/limit/base fee)
- Block size, difficulty, nonce
- List of transactions in the block
- Pagination for large transaction lists
- Navigation to previous/next block

**Components**:

- `<BlockDetailPage />`: Main layout
- `<BlockHeader />`: Block metadata
- `<BlockTransactionsList />`: Transactions in block
- `<BlockNavigation />`: Prev/next block links

**Design Notes**:

- Hexagonal layout echoing the visual design
- Technical annotations style for metadata
- Systematic grid for transaction list

---

### 3. Transaction Detail Page

**URL**: `/tx/[hash]`

**User Story**: As a user, I want to view complete information about a specific transaction.

**Features**:

- Transaction hash, status (success/failure)
- Block number and timestamp
- From/to addresses with links
- Value transferred (in ETH and USD if price API available)
- Gas information (limit, used, price, max fee, priority fee)
- Transaction type (legacy, EIP-1559, EIP-4844, etc.)
- Input data (hex view + decoded if possible)
- Logs/Events emitted
- Signature components (v, r, s)

**Components**:

- `<TransactionDetailPage />`: Main layout
- `<TransactionHeader />`: Hash, status, block
- `<TransactionFlow />`: Visual from → to representation
- `<TransactionDetails />`: Complete metadata
- `<TransactionLogs />`: Event logs with decoding
- `<InputDataViewer />`: Hex + ASCII + decoded view

**Design Notes**:

- Flow visualization using connection lines
- Color-coded status (green for success, red for failure)
- Logs displayed as systematic data blocks

---

### 4. Address Page

**URL**: `/address/[address]`

**User Story**: As a user, I want to view all activity for a specific address.

**Features**:

- Address overview (balance, transaction count)
- Balance history chart
- Transaction list (sent/received) with filtering
- Filter by transaction type (sent, received, all)
- Filter by value range
- Filter by date/block range
- Contract information if address is a contract
- Token balances (if contract implements ERC-20/721/1155)

**Components**:

- `<AddressPage />`: Main layout
- `<AddressHeader />`: Address, balance, QR code
- `<BalanceHistoryChart />`: Visual balance over time
- `<AddressTransactionsList />`: Transactions with advanced filtering
- `<TransactionFilters />`: Filter UI component
- `<ContractInfo />`: Contract-specific information

**Design Notes**:

- Balance chart using blue gradients
- Transaction list with alternating row highlighting
- Filter interface using geometric compartments

---

### 5. Blocks List Page

**URL**: `/blocks`

**User Story**: As a user, I want to browse all blocks with filtering options.

**Features**:

- Paginated list of all blocks
- Filter by block number range
- Filter by timestamp range
- Filter by miner address
- Sort by number (ascending/descending)
- Display block metadata (number, age, miner, transactions, gas used)

**Components**:

- `<BlocksListPage />`: Main layout
- `<BlocksTable />`: Paginated table
- `<BlockFilters />`: Filter controls
- `<Pagination />`: Reusable pagination component

**Design Notes**:

- Grid-based table layout
- Technical coordinate markers for block numbers
- Color-coded gas usage (gradient from low to high)

---

### 6. Transactions List Page

**URL**: `/txs`

**User Story**: As a user, I want to browse all transactions with filtering options.

**Features**:

- Paginated list of all transactions
- Filter by block number range
- Filter by from/to address
- Filter by transaction type
- Filter by status (success/failure)
- Sort options (timestamp, value, gas used)

**Components**:

- `<TransactionsListPage />`: Main layout
- `<TransactionsTable />`: Paginated table
- `<TransactionFilters />`: Filter controls

**Design Notes**:

- Systematic arrangement of transaction data
- High-value transactions highlighted with warm accents
- Status indicators using color coding

---

### 7. Contract Interaction Page (Advanced)

**URL**: `/contract/[address]`

**User Story**: As a user, I want to interact with smart contracts.

**Features**:

- Contract ABI import/input
- Read contract methods (view/pure functions)
- Write contract methods (with wallet connection)
- Event logs display
- Contract verification status

**Components**:

- `<ContractPage />`: Main layout
- `<ABIInput />`: ABI entry component
- `<ReadFunctions />`: Display read-only methods
- `<WriteFunctions />`: Display state-changing methods
- `<WalletConnect />`: Wallet connection component

**Design Notes**:

- Technical interface with function signatures
- Input fields styled as system terminals
- Clear visual separation between read/write operations

---

### 8. Network Statistics Page

**URL**: `/stats`

**User Story**: As a user, I want to see comprehensive network analytics.

**Features**:

- Blocks over time chart
- Transactions over time chart
- Average block time trend
- Gas usage trends
- Top miners by block count
- Network hash rate (if available)

**Components**:

- `<StatsPage />`: Main layout
- `<BlocksChart />`: Time-series visualization
- `<TransactionsChart />`: Time-series visualization
- `<TopMinersTable />`: Leaderboard display
- `<NetworkMetrics />`: Key performance indicators

**Design Notes**:

- Charts using blueprint/technical drawing aesthetic
- Grid overlays on all visualizations
- Minimal color palette for clarity

---

### 9. Search Functionality

**Global Feature**: Available on all pages via header

**User Story**: As a user, I want to quickly find blocks, transactions, or addresses.

**Features**:

- Auto-detect input type (block number, hash, address)
- Instant search with debouncing
- Search suggestions/autocomplete
- Recent searches history
- Redirect to appropriate detail page

**Components**:

- `<GlobalSearch />`: Header search bar
- `<SearchSuggestions />`: Dropdown with results
- `<SearchHistory />`: Recent searches

**Design Notes**:

- Monospace input for technical data
- Search results styled as coordinate markers
- Instant visual feedback on input type detection

---

### 10. Real-Time Updates

**Global Feature**: WebSocket integration throughout app

**User Story**: As a user, I want to see new blocks and transactions as they occur.

**Features**:

- Real-time block updates on homepage
- Real-time transaction updates
- Visual notifications for new data
- Auto-refresh of current page data
- Connection status indicator

**Components**:

- `<WebSocketProvider />`: Context for WS connection
- `<LiveIndicator />`: Connection status component
- `<NewDataNotification />`: Toast/banner for updates

**Design Notes**:

- Subtle pulse animations for new data
- Blue accent color for live indicators
- Non-intrusive notification system

---

## Design System & Style Guide

### Color Palette

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Background layers
        bg: {
          primary: '#0A0E14', // Main background
          secondary: '#1C2128', // Card backgrounds
          tertiary: '#21262D', // Subtle elevation
        },
        // Accent colors
        accent: {
          blue: '#00D4FF', // Primary actions, links
          cyan: '#4DD0E1', // Secondary highlights
          orange: '#FFA726', // Warnings, high-value indicators
        },
        // Text colors
        text: {
          primary: '#E6EDF3', // Main text
          secondary: '#8B949E', // Secondary text
          muted: '#6E7681', // Muted/disabled text
        },
        // Semantic colors
        success: '#2EA043',
        error: '#F85149',
        warning: '#FFA726',
        info: '#00D4FF',
      },
    },
  },
}
```

### Typography

```typescript
// Font configuration
const fontConfig = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Courier New', 'monospace'],
}

// Usage guidelines
// - Use mono for: addresses, hashes, block numbers, hex data
// - Use sans for: UI labels, descriptions, body text
// - Font sizes: Follow 8px baseline grid (12px, 16px, 20px, 24px, 32px, 48px)
```

### Spacing System

```typescript
// 8px baseline grid
const spacing = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
}
```

### Component Patterns

```typescript
// Card Component
<Card className="bg-bg-secondary border border-bg-tertiary rounded-none">
  <CardHeader className="border-b border-bg-tertiary pb-4">
    <CardTitle className="font-mono text-sm text-text-secondary uppercase tracking-wider">
      Block #123456
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-4 font-mono text-xs">
    {/* Content */}
  </CardContent>
</Card>

// Button Component
<Button className="bg-accent-blue text-bg-primary font-mono text-xs uppercase tracking-wider hover:bg-accent-cyan transition-colors rounded-none">
  View Details
</Button>

// Table Component
<Table className="font-mono text-xs">
  <TableHeader>
    <TableRow className="border-b border-bg-tertiary">
      <TableHead className="text-text-secondary uppercase tracking-wider">Hash</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-b border-bg-tertiary hover:bg-bg-tertiary transition-colors">
      <TableCell className="text-accent-blue">0xabc...</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Layout Patterns

```typescript
// Grid-based layout
<div className="grid grid-cols-12 gap-4 p-4">
  {/* Main content spans 8 columns */}
  <div className="col-span-12 lg:col-span-8">
    <MainContent />
  </div>
  {/* Sidebar spans 4 columns */}
  <div className="col-span-12 lg:col-span-4">
    <Sidebar />
  </div>
</div>

// Hexagonal coordinate system (CSS Grid)
.hex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}
```

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Homepage/Dashboard
│   ├── block/
│   │   └── [numberOrHash]/
│   │       └── page.tsx          # Block detail page
│   ├── tx/
│   │   └── [hash]/
│   │       └── page.tsx          # Transaction detail page
│   ├── address/
│   │   └── [address]/
│   │       └── page.tsx          # Address page
│   ├── blocks/
│   │   └── page.tsx              # Blocks list page
│   ├── txs/
│   │   └── page.tsx              # Transactions list page
│   ├── contract/
│   │   └── [address]/
│   │       └── page.tsx          # Contract interaction page
│   └── stats/
│       └── page.tsx              # Network statistics page
├── components/
│   ├── ui/                       # shadcn/ui components (customized)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── blocks/
│   │   ├── BlockCard.tsx
│   │   ├── BlocksList.tsx
│   │   └── BlockDetail.tsx
│   ├── transactions/
│   │   ├── TransactionCard.tsx
│   │   ├── TransactionsList.tsx
│   │   └── TransactionDetail.tsx
│   ├── address/
│   │   ├── AddressOverview.tsx
│   │   ├── BalanceChart.tsx
│   │   └── AddressTransactions.tsx
│   ├── search/
│   │   ├── GlobalSearch.tsx
│   │   └── SearchSuggestions.tsx
│   └── common/
│       ├── CopyButton.tsx
│       ├── AddressLink.tsx
│       ├── HashDisplay.tsx
│       ├── TimeAgo.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── apollo/                   # Apollo Client setup
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── graphql/                  # Generated GraphQL types
│   │   └── types.ts
│   ├── utils/
│   │   ├── format.ts             # Formatting utilities (addresses, values, time)
│   │   ├── validation.ts         # Input validation
│   │   └── errors.ts             # Error handling utilities
│   └── hooks/
│       ├── useBlock.ts
│       ├── useTransaction.ts
│       ├── useAddress.ts
│       └── useWebSocket.ts
├── services/
│   ├── api.ts                    # API service layer
│   ├── websocket.ts              # WebSocket service
│   └── storage.ts                # Local storage service (preferences)
├── types/
│   ├── block.ts
│   ├── transaction.ts
│   ├── address.ts
│   └── index.ts
├── styles/
│   └── globals.css               # Global styles + Tailwind imports
├── public/
│   └── assets/
│       ├── logo.svg
│       └── icons/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.local                    # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8080/ws
NEXT_PUBLIC_JSONRPC_ENDPOINT=http://localhost:8080/rpc
NEXT_PUBLIC_CHAIN_NAME=StableNet
NEXT_PUBLIC_CHAIN_ID=111133
NEXT_PUBLIC_CURRENCY_SYMBOL=WKRC

# Optional: Price API for fiat conversion
NEXT_PUBLIC_PRICE_API_URL=https://api.coingecko.com/api/v3
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Next.js project setup with TypeScript
- [ ] Tailwind + shadcn/ui installation and customization
- [ ] Apollo Client setup with GraphQL codegen
- [ ] Design system implementation (colors, typography, components)
- [ ] Basic layout (Header, Footer, responsive grid)
- [ ] Global search component
- [ ] Error boundaries and loading states

### Phase 2: Core Pages (Week 2)

- [ ] Homepage/Dashboard with live feed
- [ ] Block detail page with navigation
- [ ] Transaction detail page with logs
- [ ] Address page with basic transaction list
- [ ] WebSocket integration for real-time updates

### Phase 3: Lists & Filtering (Week 3)

- [ ] Blocks list page with pagination
- [ ] Transactions list page with pagination
- [ ] Advanced filtering on all list pages
- [ ] Sorting functionality
- [ ] URL-based filter persistence

### Phase 4: Advanced Features (Week 4)

- [ ] Balance history chart on address page
- [ ] Network statistics page with charts
- [ ] Contract interaction page (read/write)
- [ ] Search autocomplete and suggestions
- [ ] Dark/light theme toggle (if desired)

### Phase 5: Polish & Optimization (Week 5)

- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility audit and fixes (WCAG 2.1 AA)
- [ ] Comprehensive error handling
- [ ] Loading skeletons for all pages
- [ ] Unit tests (>80% coverage)
- [ ] E2E tests for critical flows
- [ ] SEO optimization (meta tags, structured data)
- [ ] Documentation (README, component docs)

---

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

```typescript
// Example: BlockCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BlockCard } from '@/components/blocks/BlockCard';

describe('BlockCard', () => {
  it('renders block number and hash', () => {
    const block = {
      number: 123456n,
      hash: '0xabc123...',
      timestamp: 1234567890n,
      miner: '0xdef456...',
      transactionCount: 42,
    };

    render(<BlockCard block={block} />);

    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('0xabc123...')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const block = {
      number: 123456n,
      hash: '0xabc123...',
      timestamp: 1234567890n,
      miner: '0xdef456...',
      transactionCount: 42,
    };

    render(<BlockCard block={block} />);

    // Should display relative time
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// Example: block-detail.spec.ts
import { test, expect } from '@playwright/test'

test('block detail page displays correct information', async ({ page }) => {
  await page.goto('/block/1000')

  // Check block number
  await expect(page.locator('h1')).toContainText('Block #1000')

  // Check transactions list
  const txList = page.locator('[data-testid="transactions-list"]')
  await expect(txList).toBeVisible()

  // Check navigation links
  await expect(page.locator('[data-testid="prev-block"]')).toHaveAttribute('href', '/block/999')
  await expect(page.locator('[data-testid="next-block"]')).toHaveAttribute('href', '/block/1001')
})

test('real-time block updates work', async ({ page }) => {
  await page.goto('/')

  // Wait for WebSocket connection
  await page.waitForSelector('[data-testid="live-indicator"][data-status="connected"]')

  const initialBlock = await page.locator('[data-testid="latest-block"]').textContent()

  // Wait for new block (max 30 seconds)
  await page.waitForFunction(
    (initial) => {
      const current = document.querySelector('[data-testid="latest-block"]')?.textContent
      return current !== initial
    },
    initialBlock,
    { timeout: 30000 }
  )

  const newBlock = await page.locator('[data-testid="latest-block"]').textContent()
  expect(newBlock).not.toBe(initialBlock)
})
```

---

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

**Optimization Strategies**:

- Next.js Image optimization for all images
- Code splitting by route
- Lazy loading for charts and heavy components
- Apollo Client caching and pagination
- Debounced search and filter inputs
- Virtual scrolling for large lists (react-window)
- Service Worker for offline functionality (optional)

---

## Accessibility Requirements (WCAG 2.1 AA)

### Color Contrast

- Text on background: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Keyboard Navigation

- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip navigation links

### Screen Reader Support

- Semantic HTML (header, nav, main, footer, article)
- ARIA labels for complex components
- Descriptive alt text for images
- Live regions for real-time updates

### Responsive Design

- Minimum target size: 44x44px for touch targets
- Text zoom up to 200% without horizontal scrolling
- Mobile-first responsive design
- Support for screen readers and assistive technologies

---

## Deployment Guide

### Build for Production

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Builds

```bash
# Development
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql npm run dev

# Staging
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://staging-api.example.com/graphql npm run build

# Production
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.example.com/graphql npm run build
```

---

## Code Examples

### Custom Hook: useBlock

```typescript
// lib/hooks/useBlock.ts
import { useQuery } from '@apollo/client'
import { GET_BLOCK } from '@/lib/apollo/queries'
import type { Block } from '@/types/block'

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export function useBlock(numberOrHash: bigint | string): Result<Block | null, Error> {
  const isHash = typeof numberOrHash === 'string' && numberOrHash.startsWith('0x')

  const { data, loading, error } = useQuery(GET_BLOCK, {
    variables: isHash ? { hash: numberOrHash } : { number: numberOrHash.toString() },
    skip: !numberOrHash,
  })

  if (loading) return { ok: true, value: null }
  if (error) return { ok: false, error }

  return { ok: true, value: data?.block ?? null }
}
```

### Utility: Format Address

```typescript
// lib/utils/format.ts
export function formatAddress(address: string, short: boolean = true): string {
  if (!address || !address.startsWith('0x')) {
    throw new Error('Invalid address format')
  }

  if (!short) return address

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatHash(hash: string, short: boolean = true): string {
  if (!hash || !hash.startsWith('0x')) {
    throw new Error('Invalid hash format')
  }

  if (!short) return hash

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export function formatValue(value: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const integerPart = value / divisor
  const fractionalPart = value % divisor

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmed = fractionalStr.replace(/0+$/, '')

  if (trimmed === '') {
    return integerPart.toString()
  }

  return `${integerPart}.${trimmed}`
}

export function formatTimeAgo(timestamp: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000))
  const diff = Number(now - timestamp)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24

  if (diff < minute) return `${diff} seconds ago`
  if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`

  return `${Math.floor(diff / day)} days ago`
}
```

### Component: AddressLink

```typescript
// components/common/AddressLink.tsx
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/format';
import { CopyButton } from './CopyButton';

interface AddressLinkProps {
  address: string;
  short?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function AddressLink({
  address,
  short = true,
  showCopy = true,
  className = ''
}: AddressLinkProps) {
  const displayAddress = short ? formatAddress(address) : address;

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={`/address/${address}`}
        className={`font-mono text-accent-blue hover:text-accent-cyan transition-colors ${className}`}
      >
        {displayAddress}
      </Link>
      {showCopy && <CopyButton value={address} />}
    </div>
  );
}
```

---

## Success Criteria

### Functional Requirements

- ✅ All pages render data from backend API correctly
- ✅ Real-time updates work via WebSocket
- ✅ Search functionality works for all input types
- ✅ Filtering and pagination work on all list pages
- ✅ Navigation between pages works seamlessly
- ✅ Error states handled gracefully

### Non-Functional Requirements

- ✅ Lighthouse score: >90 (Performance, Accessibility, Best Practices, SEO)
- ✅ Unit test coverage: >80%
- ✅ E2E tests cover critical user flows
- ✅ No TypeScript errors or warnings
- ✅ No ESLint errors
- ✅ Responsive on mobile, tablet, desktop
- ✅ Works on Chrome, Firefox, Safari, Edge (last 2 versions)

### Design Requirements

- ✅ Matches Crystalline Infrastructure design philosophy
- ✅ Consistent use of color palette and typography
- ✅ Geometric precision in layouts
- ✅ Minimal text, maximum spatial communication
- ✅ Professional, technical aesthetic throughout

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Apollo Client Docs**: https://www.apollographql.com/docs/react/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Notes for Implementation

1. **Start with the design system**: Implement colors, typography, and base components first to ensure consistency.

2. **GraphQL schema alignment**: The backend GraphQL schema is defined in `api/graphql/schema.graphql`. Ensure all queries match this schema exactly.

3. **BigInt handling**: The backend returns block numbers and values as `BigInt` scalars (strings). Use `BigInt()` constructor in TypeScript and handle serialization carefully.

4. **Error handling**: Follow the pattern from `system_prompt_additions.md` - use Result types, never swallow errors, always provide context.

5. **Testing**: Write tests as you build. TDD approach recommended for critical functionality.

6. **Accessibility**: Test with screen readers (NVDA, JAWS, VoiceOver) throughout development, not just at the end.

7. **Performance**: Use React DevTools Profiler and Lighthouse CI to catch performance regressions early.

8. **Documentation**: Document all complex logic, especially around BigInt conversions and error handling.

---

**This document provides complete specifications for building a production-ready blockchain explorer frontend. All design decisions align with SOLID principles, Clean Code practices, and the Crystalline Infrastructure design philosophy. The implementation should result in a sophisticated, professional tool that makes complex blockchain data accessible and comprehensible.**
