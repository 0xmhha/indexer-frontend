# Setup Guide

> Environment setup, configuration, and deployment

## Prerequisites

- Node.js 20+
- npm 10+
- indexer-go backend running (GraphQL + WebSocket)

## Installation

```bash
git clone <repository-url>
cd indexer-frontend
npm install
```

## Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Required — Backend API endpoints
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:8080/ws
NEXT_PUBLIC_JSONRPC_ENDPOINT=http://localhost:8080/rpc

# Required — Chain identity
NEXT_PUBLIC_CHAIN_NAME=StableNet
NEXT_PUBLIC_CHAIN_ID=111133
NEXT_PUBLIC_CURRENCY_SYMBOL=WKRC

# Optional — Price conversion
NEXT_PUBLIC_PRICE_API_URL=https://api.coingecko.com/api/v3

# Optional — Multi-wallet support
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # from https://cloud.walletconnect.com
```

### Config Priority

Environment variables override defaults in `config/app.config.json`.

### Multi-Network Setup

The explorer supports dynamic network switching. Additional networks can be configured in the Settings page at `/settings`, or defined in `lib/config/networks.ts`.

## Development

```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
```

### Code Quality

```bash
npm run lint         # ESLint — must be 0 errors
npx tsc --noEmit     # TypeScript — must be 0 errors
npx vitest run       # Unit tests — 46 files, 1,328 tests
npx playwright test  # E2E tests (requires running backend)
```

### Port Configuration

```bash
PORT=3001 npm run dev    # Custom port
npm run dev:clean        # Kill existing process on port, then start
```

## Production Build

```bash
npm run build        # Next.js production build
npm run start        # Start production server
```

### Build Output

The build generates static pages (pre-rendered) and dynamic pages (server-rendered on demand):

- **Static**: Dashboard, block list, tx list, settings, etc.
- **Dynamic**: Detail pages (`/tx/[hash]`, `/block/[number]`, `/address/[addr]`, etc.)

## Backend Requirements

The frontend requires indexer-go with these API endpoints:

| Endpoint | Protocol | Purpose |
|----------|----------|---------|
| `/graphql` | HTTP POST | GraphQL queries and mutations |
| `/ws` | WebSocket | GraphQL subscriptions (real-time updates) |
| `/rpc` | HTTP POST | JSON-RPC proxy to blockchain node |

### CORS

The backend must allow requests from the frontend origin. In development, this is typically `http://localhost:3000`.

### Account Abstraction

AA features require indexer-go v0.8.0+ with EIP-4337 event indexing enabled. See [aa-graphql-integration.md](aa-graphql-integration.md) for the complete schema mapping.

## Wallet Integration

MetaMask is supported out of the box via wagmi's `injected` connector.

For WalletConnect multi-wallet support:

1. Register at [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a project and get the Project ID
3. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

## Troubleshooting

### Backend connection failed

- Verify indexer-go is running and accessible
- Check `NEXT_PUBLIC_GRAPHQL_ENDPOINT` matches the actual backend URL
- Check CORS settings on the backend

### WebSocket disconnects

The frontend uses exponential backoff with jitter for automatic reconnection. If issues persist:

- Verify `NEXT_PUBLIC_WS_ENDPOINT` is correct
- Check if a reverse proxy is terminating WebSocket connections
- Check browser console for connection errors

### Build errors

```bash
npx tsc --noEmit     # Check for type errors first
npm run lint         # Check for lint errors
npm run build        # Full production build
```
