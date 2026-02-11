# StableNet Explorer Frontend

> **Crystalline Infrastructure** - Production-ready blockchain explorer for StableNet (Ethereum-based) chain

A modern, high-performance blockchain explorer frontend built with Next.js 14+, TypeScript, and GraphQL. Features real-time updates, comprehensive blockchain data visualization, and a sophisticated technical aesthetic.

## Overview

This frontend consumes GraphQL/JSON-RPC APIs from the indexer-go backend and provides users with comprehensive blockchain data visualization similar to Etherscan, following the "Crystalline Infrastructure" design philosophy.

## Features

- **Real-time Data**: WebSocket integration for live block and transaction updates
- **GraphQL API**: Apollo Client with type-safe queries and caching
- **Block Explorer**: View blocks, transactions, addresses, and contract interactions
- **Search**: Global search with autocomplete for addresses, transactions, and blocks
- **Contract Interaction**: Read/write contract functions with MetaMask integration
- **Governance**: Proposal viewing and voting interface
- **Validators**: Validator set monitoring and statistics
- **Gas Estimation**: Real-time gas price recommendations
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: WCAG 2.1 AA compliant

## Tech Stack

### Core
- **Next.js 14+**: App Router, Server Components
- **React 18+**: Hooks, Suspense, Error Boundaries
- **TypeScript 5.3+**: Strict mode with comprehensive type safety

### State & Data
- **Apollo Client**: GraphQL client with intelligent caching
- **Zustand**: Lightweight client state management

### UI & Styling
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Customized component primitives
- **Recharts**: Data visualization

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your backend URLs
```

## Usage

```bash
# Start development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
indexer-frontend/
├── app/                          # Next.js App Router (pages)
├── components/
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Header, Footer, Navigation
│   ├── common/                   # Shared components
│   └── [feature]/                # Feature-specific components
├── lib/
│   ├── apollo/                   # Apollo Client & GraphQL queries
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   └── config/                   # Configuration
├── types/                        # TypeScript type definitions
├── stores/                       # Zustand state stores
└── public/                       # Static assets
```

## API Integration

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

## Environment Variables

| Variable                         | Description              | Default                         |
| -------------------------------- | ------------------------ | ------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT`   | GraphQL API endpoint     | `http://localhost:8080/graphql` |
| `NEXT_PUBLIC_WS_ENDPOINT`        | WebSocket endpoint       | `ws://localhost:8080/ws`        |
| `NEXT_PUBLIC_JSONRPC_ENDPOINT`   | JSON-RPC endpoint        | `http://localhost:8080/rpc`     |
| `NEXT_PUBLIC_CHAIN_NAME`         | Blockchain name          | `StableNet`                     |
| `NEXT_PUBLIC_CHAIN_ID`           | Chain identifier         | `111133`                        |
| `NEXT_PUBLIC_CURRENCY_SYMBOL`    | Native currency symbol   | `WKRC`                          |

> 기본값은 `config/app.config.json`에서 관리됩니다. 환경 변수를 지정하면 해당 값이 우선합니다.

## Pages

| Route                      | Description                          |
| -------------------------- | ------------------------------------ |
| `/`                        | Dashboard with latest blocks & txs   |
| `/blocks`                  | Block list with pagination           |
| `/block/[numberOrHash]`    | Block detail page                    |
| `/txs`                     | Transaction list                     |
| `/tx/[hash]`               | Transaction detail page              |
| `/address/[address]`       | Address detail with balance & txs    |
| `/contract`                | Contract interaction interface       |
| `/governance`              | Governance proposals                 |
| `/validators`              | Validator set information            |
| `/epochs`                  | Epoch history                        |
| `/gas`                     | Gas price estimation                 |
| `/stats`                   | Network statistics                   |
| `/consensus`               | Consensus monitoring                 |
| `/wbft`                    | WBFT consensus details               |
| `/search`                  | Search results page                  |
| `/settings`                | User settings                        |

## Design Philosophy

### Crystalline Infrastructure

The UI follows the "Crystalline Infrastructure" design philosophy:

- **Precision & Clarity**: Geometric rigor and spatial intelligence
- **Minimal Text**: Typography as coordinate markers, not decoration
- **Functional Color**: Restrained palette with chromatic meaning zones
- **Technical Aesthetic**: Monospace fonts, hexadecimal patterns, modular grids

### Color Palette

```
Background:   #0A0E14 (primary), #1C2128 (secondary), #21262D (tertiary)
Accent:       #00D4FF (blue), #4DD0E1 (cyan), #FFA726 (orange)
Text:         #E6EDF3 (primary), #8B949E (secondary), #6E7681 (muted)
Semantic:     #2EA043 (success), #F85149 (error), #FFA726 (warning)
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Related Projects

- **indexer-go**: Backend GraphQL API and blockchain indexer

---

**CRYSTALLINE INFRASTRUCTURE** • StableNet Explorer
