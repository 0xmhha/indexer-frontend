# Stable-One Explorer Frontend

> **Crystalline Infrastructure** - Production-ready blockchain explorer for Stable-One (Ethereum-based) chain

A modern, high-performance blockchain explorer frontend built with Next.js 14+, TypeScript, and GraphQL. Features real-time updates, comprehensive blockchain data visualization, and a sophisticated technical aesthetic.

## 🎯 Overview

This frontend consumes GraphQL/JSON-RPC APIs from the indexer-go backend and provides users with comprehensive blockchain data visualization similar to Etherscan, following the "Crystalline Infrastructure" design philosophy.

## ✨ Features

- **Real-time Data**: WebSocket integration for live block and transaction updates
- **GraphQL API**: Apollo Client with type-safe queries and caching
- **Design System**: Crystalline Infrastructure aesthetic with geometric precision
- **Type Safety**: Full TypeScript with strict mode enabled
- **Error Handling**: Comprehensive error boundaries and Result types
- **Responsive**: Mobile-first design with Tailwind CSS
- **Performance**: Optimized builds, code splitting, and lazy loading
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠 Tech Stack

### Core

- **Next.js 14+**: App Router, Server Components, Server Actions
- **React 18+**: Hooks, Suspense, Error Boundaries
- **TypeScript 5.3+**: Strict mode with comprehensive type safety

### State & Data

- **Apollo Client**: GraphQL client with intelligent caching
- **TanStack Query**: Server state management
- **Zustand**: Lightweight client state

### UI & Styling

- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Customized component primitives
- **Framer Motion**: Subtle animations
- **Recharts**: Data visualization

### Code Quality

- **ESLint**: Linting with Next.js and TypeScript rules
- **Prettier**: Code formatting with Tailwind plugin
- **Vitest**: Unit testing
- **Playwright**: E2E testing (coming soon)

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your backend URLs
# NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
# NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8080/ws
# NEXT_PUBLIC_JSONRPC_ENDPOINT=http://localhost:8080/rpc
```

## 🚀 Development

```bash
# Start development server
npm run dev
# Open http://localhost:3000

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
indexer-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage/Dashboard
│   ├── error.tsx                # Error page
│   └── not-found.tsx            # 404 page
├── components/
│   ├── ui/                      # shadcn/ui components (customized)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── table.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── ErrorBoundary.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── apollo/                  # Apollo Client setup
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── graphql/                 # Generated GraphQL types
│   ├── utils/
│   │   ├── format.ts            # Formatting utilities
│   │   └── validation.ts        # Input validation
│   ├── hooks/                   # Custom React hooks
│   └── config/
│       └── env.ts               # Environment configuration
├── types/                       # TypeScript type definitions
├── styles/
│   └── globals.css              # Global styles + Tailwind
└── public/                      # Static assets
```

## 🎨 Design Philosophy

### Crystalline Infrastructure

The UI follows the "Crystalline Infrastructure" design philosophy:

- **Precision & Clarity**: Geometric rigor and spatial intelligence
- **Minimal Text**: Typography as coordinate markers, not decoration
- **Functional Color**: Restrained palette with chromatic meaning zones
- **Technical Aesthetic**: Monospace fonts, hexadecimal patterns, modular grids

### Color Palette

```typescript
// Background layers
bg-primary: #0A0E14      // Main background
bg-secondary: #1C2128    // Card backgrounds
bg-tertiary: #21262D     // Subtle elevation

// Accent colors
accent-blue: #00D4FF     // Primary actions, links
accent-cyan: #4DD0E1     // Secondary highlights
accent-orange: #FFA726   // Warnings, high-value

// Text colors
text-primary: #E6EDF3    // Main text
text-secondary: #8B949E  // Secondary text
text-muted: #6E7681      // Disabled text

// Semantic colors
success: #2EA043
error: #F85149
warning: #FFA726
info: #00D4FF
```

## 🔌 API Integration

### GraphQL Endpoint

```
http://localhost:8080/graphql
```

### WebSocket Endpoint

```
ws://localhost:8080/ws
```

### JSON-RPC Endpoint

```
http://localhost:8080/rpc
```

See `lib/apollo/queries.ts` for available GraphQL queries.

## 📝 Code Quality Standards

This project follows strict code quality guidelines:

### Error Handling

This project implements a comprehensive error handling system with custom error types, centralized logging, and recovery strategies:

**Custom Error Types** (`lib/errors/types.ts`):
- `AppError`: Base application error with code and status
- `NetworkError`: Network-related failures
- `GraphQLError`: GraphQL API errors
- `ValidationError`: Input validation errors
- `NotFoundError`: Resource not found errors
- `TimeoutError`: Operation timeout errors
- `Web3Error`: Wallet/contract interaction errors

**Error Logging** (`lib/errors/logger.ts`):
- Centralized error logging service
- Automatic console logging in development
- Production-ready with monitoring service integration (Sentry, LogRocket)
- Error context tracking (component, action, metadata)

**Error Recovery** (`lib/errors/recovery.ts`):
- Retry logic with exponential backoff
- Timeout handling
- Circuit breaker pattern for preventing cascading failures
- Fallback strategies

```typescript
import { withRetry, NetworkError, errorLogger } from '@/lib/errors'

// Retry failed requests
const data = await withRetry(
  () => fetchData(),
  { maxRetries: 3, delayMs: 1000 }
)

// Log errors with context
errorLogger.error(error, {
  component: 'UserProfile',
  action: 'fetchUserData',
  metadata: { userId: '123' }
})
```

**Best Practices**:
- ✅ Use custom error types for type-safe error handling
- ✅ Log errors with context using errorLogger
- ✅ Implement retry logic for network errors
- ✅ Use Error Boundaries for React component errors
- ❌ Never swallow errors silently
- ❌ Never use generic try-catch without logging

### Resource Management

- ✅ Always use try-finally for cleanup
- ✅ Implement proper async cleanup patterns
- ❌ Never leak resources (connections, files, etc.)

### Type Safety

- ✅ TypeScript strict mode enabled
- ✅ No `any` types in production code
- ✅ Runtime validation at API boundaries with Zod

See `.claude/system_prompt_additions.md` for complete guidelines.

## ⚡ Performance Optimization

This project implements several performance optimization strategies:

### Code Splitting & Lazy Loading

Heavy components are dynamically imported to reduce initial bundle size:

- **Charts**: `BalanceHistoryChart`, `BlocksOverTimeChart` - Recharts library loaded on demand
- **Contract Components**: `ContractReader`, `ContractWriter` - Only loaded on contract interaction page
- **Data Tables**: `TopMinersTable` - Loaded when needed for statistics

```typescript
// Example: Dynamic import with loading state
const BalanceHistoryChart = dynamic(
  () => import('@/components/address/BalanceHistoryChart').then((mod) => ({ default: mod.BalanceHistoryChart })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Client-side only for interactive charts
  }
)
```

### Next.js Configuration Optimizations

- **Package Import Optimization**: Recharts, Apollo Client, date-fns optimized for tree-shaking
- **SWC Minification**: Fast Rust-based minifier
- **Console Log Removal**: Production builds remove console.log (keeps error/warn)
- **Compression**: Gzip compression enabled
- **Image Optimization**: WebP and AVIF format support

### Bundle Size Monitoring

To analyze bundle sizes:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Build with analysis
ANALYZE=true npm run build
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests (coming soon)
npm run test:e2e
```

## 🌐 Environment Variables

| Variable                       | Description            | Default                         |
| ------------------------------ | ---------------------- | ------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL API endpoint   | `http://localhost:8080/graphql` |
| `NEXT_PUBLIC_WS_ENDPOINT`      | WebSocket endpoint     | `ws://localhost:8080/ws`        |
| `NEXT_PUBLIC_JSONRPC_ENDPOINT` | JSON-RPC endpoint      | `http://localhost:8080/rpc`     |
| `NEXT_PUBLIC_CHAIN_NAME`       | Blockchain name        | `Stable-One`                    |
| `NEXT_PUBLIC_CHAIN_ID`         | Chain identifier       | `111133`                        |
| `NEXT_PUBLIC_CURRENCY_SYMBOL`  | Native currency symbol | `WEMIX`                         |

## 📋 Implementation Status

### ✅ Phase 1: Foundation (Complete)

- [x] Next.js 14+ project setup with TypeScript
- [x] Tailwind CSS + Design system implementation
- [x] Apollo Client setup with GraphQL
- [x] Basic layout (Header, Footer)
- [x] Error boundaries and loading states
- [x] Environment configuration
- [x] Base UI components (Button, Card, Table)
- [x] Utilities (format, validation)

### ✅ Phase 2: Core Pages (Complete)

- [x] Homepage/Dashboard with live feed
- [x] Block detail page with navigation
- [x] Transaction detail page with logs
- [x] Address page with balance and transactions
- [x] WebSocket integration with auto-reconnect
- [x] Real-time updates for latest blocks
- [x] Network statistics display

### ✅ Phase 3: Lists & Filtering (Complete)

- [x] Blocks list with pagination and sorting
- [x] Transactions list with pagination and filtering
- [x] Global search with autocomplete
- [x] Network statistics page with charts
- [x] Gas usage visualization
- [x] Transaction type indicators

### ✅ Phase 4: Advanced Features (Complete)

- [x] Balance history charts (last 1000 blocks)
- [x] Network statistics with real-time data
- [x] Blocks over time chart (24-hour view)
- [x] Top miners leaderboard
- [x] Contract interaction (read functions)
- [x] Contract interaction (write functions with MetaMask)
- [x] Search autocomplete with recent blocks

### 🚧 Phase 5: Polish & Optimization (In Progress)

- [x] Loading skeletons for all pages
- [x] SEO optimization (meta tags, Open Graph, Twitter Cards)
- [x] Comprehensive README documentation
- [x] Code splitting and lazy loading (dynamic imports for charts and contract components)
- [x] Enhanced error handling (custom error types, centralized logging, retry logic)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Unit tests (>80% coverage)
- [ ] E2E tests for critical flows
- [ ] Performance optimization

## 🤝 Contributing

1. Follow the code quality standards in `.claude/system_prompt_additions.md`
2. Use TypeScript strict mode
3. Write tests for new features
4. Format code with Prettier: `npm run format`
5. Ensure linting passes: `npm run lint`
6. Build successfully: `npm run build`

## 📖 Documentation

- [Implementation Guide](docs/FRONTEND_IMPLEMENTATION_PROMPT.md)
- [Design Philosophy](docs/frontend-design-philosophy.md)
- [Visual Reference](docs/blockchain-explorer-visual.pdf)
- [AI Assistant Guide](CLAUDE.md)

## 📄 License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- **indexer-go**: Backend GraphQL API and blockchain indexer

---

**CRYSTALLINE INFRASTRUCTURE v0.1.0** • BLOCK_MATRIX • HEIGHT: 0x000000 → 0xFFFFFF
