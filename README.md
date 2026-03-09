# StableNet Explorer Frontend

> Blockchain explorer for StableNet — Next.js 16 + TypeScript 5 + Apollo Client + wagmi/viem

## Quick Start

```bash
npm install
cp .env.example .env.local   # edit with your backend URLs
npm run dev                   # http://localhost:3000
```

## Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npx tsc --noEmit     # Type check
npx vitest run       # Unit tests (46 files, 1,328 tests)
npx playwright test  # E2E tests
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (Strict Mode) |
| Data | Apollo Client 3 (GraphQL + WebSocket) |
| Wallet | wagmi v3 + viem v2 |
| Styling | Tailwind CSS 3 |
| State | Apollo Cache + Zustand + React Context |
| Charts | Recharts |
| Testing | Vitest (unit) + Playwright (E2E) |
| Icons | Lucide Icons |

## Pages

### Core Explorer

| Route | Description |
|-------|-------------|
| `/` | Dashboard — network stats, recent blocks, AA activity |
| `/blocks` | Block list with pagination |
| `/block/[numberOrHash]` | Block detail |
| `/txs` | Transaction list with filters |
| `/tx/[hash]` | Transaction detail + AA bundle card |
| `/address/[address]` | Address detail — balance, txs, tokens, UserOps tab |
| `/search` | Search by address, hash, block number |

### Account Abstraction (EIP-4337)

| Route | Description |
|-------|-------------|
| `/userops` | UserOperation list with status filter |
| `/userop/[hash]` | UserOp detail — overview, gas, paymaster, account, revert |
| `/bundlers` | Bundler list (mock until backend adds list query) |
| `/paymasters` | Paymaster list (mock until backend adds list query) |

### StableNet Features

| Route | Description |
|-------|-------------|
| `/validators` | Validator set, status, statistics |
| `/validators/[address]` | Validator detail |
| `/consensus` | WBFT consensus monitoring |
| `/wbft` | WBFT block details |
| `/epochs` | Epoch history |
| `/epochs/[number]` | Epoch detail |
| `/governance` | Governance proposals, voting |
| `/governance/[contract]/[proposalId]` | Proposal detail |
| `/system-contracts` | System contract tracking |
| `/gas` | Gas tools, simulator, fee analysis |
| `/stats` | Network statistics |
| `/contract` | Contract read/write interaction |
| `/contracts` | Verified contracts list |
| `/settings` | User preferences, network config |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL API | `http://localhost:8080/graphql` |
| `NEXT_PUBLIC_WS_ENDPOINT` | WebSocket | `ws://localhost:8080/ws` |
| `NEXT_PUBLIC_JSONRPC_ENDPOINT` | JSON-RPC | `http://localhost:8080/rpc` |
| `NEXT_PUBLIC_CHAIN_NAME` | Chain name | `StableNet` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID | `111133` |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol | `WKRC` |

> Defaults are managed in `config/app.config.json`. Environment variables take precedence.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | Code structure, patterns, state management |
| [Setup Guide](docs/setup.md) | Environment setup, configuration, deployment |
| [AA Integration](docs/aa-graphql-integration.md) | Account Abstraction backend schema mapping |

## Related Projects

- **indexer-go**: Backend GraphQL API and blockchain indexer

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.
