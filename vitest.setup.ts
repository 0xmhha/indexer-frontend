import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: unknown; href: string }) => {
    return { props: { href }, children }
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql'
process.env.NEXT_PUBLIC_WS_ENDPOINT = 'ws://localhost:8080/ws'
process.env.NEXT_PUBLIC_JSONRPC_ENDPOINT = 'http://localhost:8080/rpc'
process.env.NEXT_PUBLIC_CHAIN_NAME = 'Stable-One'
process.env.NEXT_PUBLIC_CHAIN_ID = '111133'
process.env.NEXT_PUBLIC_CURRENCY_SYMBOL = 'WEMIX'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
