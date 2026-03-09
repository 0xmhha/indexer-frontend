/**
 * Mock data for Account Abstraction UI development
 *
 * Used for bundlers/paymasters list pages until backend adds list queries.
 * UserOperations now use real GraphQL queries.
 */

import type { Bundler, Paymaster } from '@/types/aa'

// ============================================================================
// Mock Bundlers (until backend adds list query)
// ============================================================================

const NOW = Date.now()

function mockTimestamp(minutesAgo: number): Date {
  return new Date(NOW - minutesAgo * 60 * 1000)
}

export const MOCK_BUNDLERS: Bundler[] = [
  {
    address: '0xBD01234567890abcdef1234567890abcdef1234',
    totalBundles: 1234,
    totalUserOps: 5678,
    successRate: 99.2,
    totalGasUsed: BigInt('123400000000000000000'),
    firstSeen: mockTimestamp(60 * 24 * 30),
    lastSeen: mockTimestamp(2),
  },
  {
    address: '0xBD02345678901bcdef02345678901bcdef02345',
    totalBundles: 456,
    totalUserOps: 1234,
    successRate: 98.5,
    totalGasUsed: BigInt('45600000000000000000'),
    firstSeen: mockTimestamp(60 * 24 * 20),
    lastSeen: mockTimestamp(15),
  },
]

// ============================================================================
// Mock Paymasters (until backend adds list query)
// ============================================================================

export const MOCK_PAYMASTERS: Paymaster[] = [
  {
    address: '0xPM01234567890abcdef1234567890abcdef1234',
    totalSponsored: 3456,
    totalGasPaid: BigInt('45600000000000000000'),
    successRate: 97.8,
    firstSeen: mockTimestamp(60 * 24 * 30),
    lastSeen: mockTimestamp(2),
  },
  {
    address: '0xPM02345678901bcdef02345678901bcdef02345',
    totalSponsored: 789,
    totalGasPaid: BigInt('12300000000000000000'),
    successRate: 99.1,
    firstSeen: mockTimestamp(60 * 24 * 15),
    lastSeen: mockTimestamp(10),
  },
]
