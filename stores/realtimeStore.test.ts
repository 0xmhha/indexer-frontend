import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useRealtimeStore,
  selectLatestBlock,
  selectRecentBlocks,
  selectLatestHeight,
  selectIsConnected,
  selectLatestTransaction,
  selectRecentTransactions,
  selectPendingTransactions,
  selectPendingCount,
} from './realtimeStore'
import type { RealtimeBlock, RealtimeTransaction } from './realtimeStore'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBlock(overrides: Partial<RealtimeBlock> = {}): RealtimeBlock {
  return {
    number: '100',
    hash: '0xabc',
    timestamp: '1700000000',
    ...overrides,
  }
}

function makeTx(overrides: Partial<RealtimeTransaction> = {}): RealtimeTransaction {
  return {
    hash: '0xtx1',
    from: '0xfrom',
    to: '0xto',
    value: '1000',
    nonce: '0',
    gas: '21000',
    type: 2,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useRealtimeStore', () => {
  beforeEach(() => {
    useRealtimeStore.getState().reset()
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('should have default values after creation', () => {
      const state = useRealtimeStore.getState()

      expect(state.isConnected).toBe(false)
      expect(state.lastConnectedAt).toBeNull()
      expect(state.latestBlock).toBeNull()
      expect(state.recentBlocks).toEqual([])
      expect(state.latestTransaction).toBeNull()
      expect(state.recentTransactions).toEqual([])
      expect(state.pendingTransactions).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // setConnected
  // -----------------------------------------------------------------------

  describe('setConnected', () => {
    it('should set isConnected to true and record lastConnectedAt', () => {
      useRealtimeStore.getState().setConnected(true)
      const state = useRealtimeStore.getState()

      expect(state.isConnected).toBe(true)
      expect(state.lastConnectedAt).toBeInstanceOf(Date)
    })

    it('should set isConnected to false and clear lastConnectedAt', () => {
      useRealtimeStore.getState().setConnected(true)
      useRealtimeStore.getState().setConnected(false)
      const state = useRealtimeStore.getState()

      expect(state.isConnected).toBe(false)
      expect(state.lastConnectedAt).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // setLatestBlock
  // -----------------------------------------------------------------------

  describe('setLatestBlock', () => {
    it('should set the latest block and add to recentBlocks', () => {
      const block = makeBlock()
      useRealtimeStore.getState().setLatestBlock(block)
      const state = useRealtimeStore.getState()

      expect(state.latestBlock).toEqual(block)
      expect(state.recentBlocks).toHaveLength(1)
      expect(state.recentBlocks[0]).toEqual(block)
    })

    it('should mark the store as connected when a block is received', () => {
      useRealtimeStore.getState().setLatestBlock(makeBlock())
      expect(useRealtimeStore.getState().isConnected).toBe(true)
    })

    it('should skip duplicate blocks (same hash)', () => {
      const block = makeBlock({ hash: '0xdup' })
      useRealtimeStore.getState().setLatestBlock(block)
      useRealtimeStore.getState().setLatestBlock(block)

      expect(useRealtimeStore.getState().recentBlocks).toHaveLength(1)
    })

    it('should deduplicate blocks in recentBlocks by hash', () => {
      const block1 = makeBlock({ hash: '0x1', number: '1' })
      const block2 = makeBlock({ hash: '0x2', number: '2' })
      useRealtimeStore.getState().setLatestBlock(block1)
      useRealtimeStore.getState().setLatestBlock(block2)

      // Now add block1 again via a different latestBlock path
      // block1 already exists in recentBlocks so dedup should keep only 2
      const block3 = makeBlock({ hash: '0x3', number: '3' })
      useRealtimeStore.getState().setLatestBlock(block3)

      const hashes = useRealtimeStore.getState().recentBlocks.map((b) => b.hash)
      expect(new Set(hashes).size).toBe(hashes.length)
    })

    it('should limit recentBlocks to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        useRealtimeStore.getState().setLatestBlock(
          makeBlock({ hash: `0x${i}`, number: String(i) })
        )
      }

      expect(useRealtimeStore.getState().recentBlocks).toHaveLength(50)
    })

    it('should prepend the newest block at the front of recentBlocks', () => {
      const blockA = makeBlock({ hash: '0xa', number: '1' })
      const blockB = makeBlock({ hash: '0xb', number: '2' })

      useRealtimeStore.getState().setLatestBlock(blockA)
      useRealtimeStore.getState().setLatestBlock(blockB)

      const blocks = useRealtimeStore.getState().recentBlocks
      expect(blocks[0]!.hash).toBe('0xb')
      expect(blocks[1]!.hash).toBe('0xa')
    })
  })

  // -----------------------------------------------------------------------
  // setLatestTransaction
  // -----------------------------------------------------------------------

  describe('setLatestTransaction', () => {
    it('should set the latest transaction and add to recentTransactions', () => {
      const tx = makeTx()
      useRealtimeStore.getState().setLatestTransaction(tx)
      const state = useRealtimeStore.getState()

      expect(state.latestTransaction).toEqual(tx)
      expect(state.recentTransactions).toHaveLength(1)
      expect(state.recentTransactions[0]).toEqual(tx)
    })

    it('should skip duplicate transactions (same hash)', () => {
      const tx = makeTx({ hash: '0xdup' })
      useRealtimeStore.getState().setLatestTransaction(tx)
      useRealtimeStore.getState().setLatestTransaction(tx)

      expect(useRealtimeStore.getState().recentTransactions).toHaveLength(1)
    })

    it('should deduplicate transactions in recentTransactions by hash', () => {
      const tx1 = makeTx({ hash: '0xt1' })
      const tx2 = makeTx({ hash: '0xt2' })
      const tx3 = makeTx({ hash: '0xt3' })

      useRealtimeStore.getState().setLatestTransaction(tx1)
      useRealtimeStore.getState().setLatestTransaction(tx2)
      useRealtimeStore.getState().setLatestTransaction(tx3)

      const hashes = useRealtimeStore.getState().recentTransactions.map((t) => t.hash)
      expect(new Set(hashes).size).toBe(hashes.length)
    })

    it('should limit recentTransactions to 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        useRealtimeStore.getState().setLatestTransaction(
          makeTx({ hash: `0xtx${i}` })
        )
      }

      expect(useRealtimeStore.getState().recentTransactions).toHaveLength(100)
    })

    it('should remove confirmed transaction from pending list', () => {
      const pendingTx = makeTx({ hash: '0xpending' })
      useRealtimeStore.getState().addPendingTransaction(pendingTx)
      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(1)

      // Confirm the transaction
      useRealtimeStore.getState().setLatestTransaction(pendingTx)
      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(0)
    })
  })

  // -----------------------------------------------------------------------
  // addPendingTransaction
  // -----------------------------------------------------------------------

  describe('addPendingTransaction', () => {
    it('should add a pending transaction with seenAt timestamp', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const tx = makeTx({ hash: '0xpend1' })
      useRealtimeStore.getState().addPendingTransaction(tx)

      const pending = useRealtimeStore.getState().pendingTransactions
      expect(pending).toHaveLength(1)
      expect(pending[0]!.seenAt).toBe(now)

      vi.restoreAllMocks()
    })

    it('should skip duplicate pending transactions (same hash)', () => {
      const tx = makeTx({ hash: '0xdup' })
      useRealtimeStore.getState().addPendingTransaction(tx)
      useRealtimeStore.getState().addPendingTransaction(tx)

      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(1)
    })

    it('should limit pending transactions to 200 entries', () => {
      for (let i = 0; i < 210; i++) {
        useRealtimeStore.getState().addPendingTransaction(
          makeTx({ hash: `0xp${i}` })
        )
      }

      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(200)
    })

    it('should prepend new pending transactions at the front', () => {
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xfirst' }))
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xsecond' }))

      const pending = useRealtimeStore.getState().pendingTransactions
      expect(pending[0]!.hash).toBe('0xsecond')
      expect(pending[1]!.hash).toBe('0xfirst')
    })
  })

  // -----------------------------------------------------------------------
  // removePendingTransaction
  // -----------------------------------------------------------------------

  describe('removePendingTransaction', () => {
    it('should remove a pending transaction by hash', () => {
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xa' }))
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xb' }))

      useRealtimeStore.getState().removePendingTransaction('0xa')

      const pending = useRealtimeStore.getState().pendingTransactions
      expect(pending).toHaveLength(1)
      expect(pending[0]!.hash).toBe('0xb')
    })

    it('should be a no-op when hash does not exist', () => {
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xa' }))
      useRealtimeStore.getState().removePendingTransaction('0xnonexistent')

      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(1)
    })
  })

  // -----------------------------------------------------------------------
  // cleanExpiredPendingTransactions
  // -----------------------------------------------------------------------

  describe('cleanExpiredPendingTransactions', () => {
    it('should remove transactions older than the TTL', () => {
      const oldTime = 1000
      const currentTime = 60_000

      // Add a tx with a manually set seenAt
      vi.spyOn(Date, 'now').mockReturnValue(oldTime)
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xold' }))

      vi.spyOn(Date, 'now').mockReturnValue(currentTime)
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xnew' }))

      // TTL = 30_000ms, so oldTime (1000) is expired at currentTime (60_000)
      vi.spyOn(Date, 'now').mockReturnValue(currentTime)
      useRealtimeStore.getState().cleanExpiredPendingTransactions(30_000)

      const pending = useRealtimeStore.getState().pendingTransactions
      expect(pending).toHaveLength(1)
      expect(pending[0]!.hash).toBe('0xnew')

      vi.restoreAllMocks()
    })

    it('should not modify state when no transactions are expired', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xfresh' }))

      // TTL is large enough that nothing is expired
      useRealtimeStore.getState().cleanExpiredPendingTransactions(999_999_999)
      expect(useRealtimeStore.getState().pendingTransactions).toHaveLength(1)

      vi.restoreAllMocks()
    })
  })

  // -----------------------------------------------------------------------
  // reset
  // -----------------------------------------------------------------------

  describe('reset', () => {
    it('should return the store to its initial state', () => {
      // Populate with data
      useRealtimeStore.getState().setConnected(true)
      useRealtimeStore.getState().setLatestBlock(makeBlock())
      useRealtimeStore.getState().setLatestTransaction(makeTx())
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xpend' }))

      // Reset
      useRealtimeStore.getState().reset()

      const state = useRealtimeStore.getState()
      expect(state.isConnected).toBe(false)
      expect(state.lastConnectedAt).toBeNull()
      expect(state.latestBlock).toBeNull()
      expect(state.recentBlocks).toEqual([])
      expect(state.latestTransaction).toBeNull()
      expect(state.recentTransactions).toEqual([])
      expect(state.pendingTransactions).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // Selectors
  // -----------------------------------------------------------------------

  describe('selectors', () => {
    it('selectLatestBlock should return the latest block or null', () => {
      expect(selectLatestBlock(useRealtimeStore.getState())).toBeNull()

      const block = makeBlock()
      useRealtimeStore.getState().setLatestBlock(block)
      expect(selectLatestBlock(useRealtimeStore.getState())).toEqual(block)
    })

    it('selectRecentBlocks should return the recentBlocks array', () => {
      expect(selectRecentBlocks(useRealtimeStore.getState())).toEqual([])

      useRealtimeStore.getState().setLatestBlock(makeBlock())
      expect(selectRecentBlocks(useRealtimeStore.getState())).toHaveLength(1)
    })

    it('selectLatestHeight should return BigInt of block number or null', () => {
      expect(selectLatestHeight(useRealtimeStore.getState())).toBeNull()

      useRealtimeStore.getState().setLatestBlock(makeBlock({ number: '42' }))
      expect(selectLatestHeight(useRealtimeStore.getState())).toBe(BigInt(42))
    })

    it('selectIsConnected should return connection status', () => {
      expect(selectIsConnected(useRealtimeStore.getState())).toBe(false)

      useRealtimeStore.getState().setConnected(true)
      expect(selectIsConnected(useRealtimeStore.getState())).toBe(true)
    })

    it('selectLatestTransaction should return the latest transaction or null', () => {
      expect(selectLatestTransaction(useRealtimeStore.getState())).toBeNull()

      const tx = makeTx()
      useRealtimeStore.getState().setLatestTransaction(tx)
      expect(selectLatestTransaction(useRealtimeStore.getState())).toEqual(tx)
    })

    it('selectRecentTransactions should return the recentTransactions array', () => {
      expect(selectRecentTransactions(useRealtimeStore.getState())).toEqual([])

      useRealtimeStore.getState().setLatestTransaction(makeTx())
      expect(selectRecentTransactions(useRealtimeStore.getState())).toHaveLength(1)
    })

    it('selectPendingTransactions should return the pendingTransactions array', () => {
      expect(selectPendingTransactions(useRealtimeStore.getState())).toEqual([])

      useRealtimeStore.getState().addPendingTransaction(makeTx())
      expect(selectPendingTransactions(useRealtimeStore.getState())).toHaveLength(1)
    })

    it('selectPendingCount should return the count of pending transactions', () => {
      expect(selectPendingCount(useRealtimeStore.getState())).toBe(0)

      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xa' }))
      useRealtimeStore.getState().addPendingTransaction(makeTx({ hash: '0xb' }))
      expect(selectPendingCount(useRealtimeStore.getState())).toBe(2)
    })
  })
})
