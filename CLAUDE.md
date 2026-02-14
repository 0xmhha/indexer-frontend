# CLAUDE.md - indexer-frontend

> StableNet Block Explorer
> Next.js 16 + TypeScript 5 + Apollo Client + wagmi/viem + Tailwind CSS + Zustand

## Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (0 errors, 0 warnings)
npx tsc --noEmit     # Type check (0 errors)
npx vitest run       # Unit tests (47 files, 1337 tests)
npx playwright test  # E2E tests
```

## Architecture

```
app/                  # Next.js App Router pages (21 routes)
components/           # React components (154 files)
  ├── charts/         # Recharts wrappers
  ├── common/         # Shared UI (WalletButton, EmptyState, etc.)
  ├── contract/       # ContractReader/Writer (wagmi)
  ├── consensus/      # WBFT/Validator components
  ├── gas/            # Gas tools, simulator
  ├── layout/         # Header, Footer, Sidebar
  ├── providers/      # RealtimeProvider (single WS source)
  └── ui/             # Base UI primitives
lib/
  ├── apollo/         # Apollo Client, GraphQL queries (35 ops)
  ├── config/         # Constants, env, networks
  ├── errors/         # AppError, recovery, logger
  ├── hooks/          # Custom hooks (70 files)
  ├── providers/      # Providers, WagmiProvider
  ├── utils/          # Formatters, parsers
  └── wagmi/          # wagmi config, chain definitions
stores/               # Zustand stores (network, realtime, theme, settings)
```

## Conventions

- **TypeScript**: Strict mode, no `any`, interfaces for shapes, type aliases for unions
- **Naming**: PascalCase components, camelCase utils/hooks, UPPER_SNAKE_CASE constants
- **Components**: Named exports, one per file, co-located tests (`*.test.tsx`)
- **State**: Apollo Cache (server) + Zustand (client) + React Context (theme/network)
- **Errors**: Use `errorLogger` from `@/lib/errors/logger`, never raw `console.error`
- **Imports**: External first, then `@/` aliases; group by type

## Commit Format

```
type(scope): subject
```

Types: feat, fix, docs, style, refactor, test, chore

## Key Patterns

- **RealtimeProvider**: Single WebSocket subscription source → Zustand store
- **Network switching**: NetworkProvider creates new Apollo Client per network
- **Wallet**: wagmi `useAccount`/`useConnect`/`useWriteContract`, chain sync with network store
- **Subscriptions**: `replayLast` param for instant data on connection
- **Error boundaries**: Every route has `error.tsx`
