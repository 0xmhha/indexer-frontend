import { describe, it, expect } from 'vitest'
import {
  toBigInt,
  toNumber,
  toDate,
  transformBlock,
  transformTransaction,
  transformReceipt,
  transformLog,
  transformBalanceSnapshot,
  transformBlocks,
  transformTransactions,
  type RawBlock,
  type RawTransaction,
  type RawReceipt,
  type RawLog,
  type RawBalanceSnapshot,
} from '@/lib/utils/graphql-transforms'

describe('toBigInt', () => {
  it('should convert string to BigInt', () => {
    expect(toBigInt('123')).toBe(BigInt(123))
    expect(toBigInt('1000000000000000000')).toBe(BigInt('1000000000000000000'))
  })

  it('should return 0n for null or undefined', () => {
    expect(toBigInt(null)).toBe(BigInt(0))
    expect(toBigInt(undefined)).toBe(BigInt(0))
  })

  it('should return 0n for invalid string', () => {
    expect(toBigInt('invalid')).toBe(BigInt(0))
    expect(toBigInt('')).toBe(BigInt(0))
  })
})

describe('toNumber', () => {
  it('should convert string to number', () => {
    expect(toNumber('123')).toBe(123)
    expect(toNumber('3.14')).toBe(3.14)
  })

  it('should return 0 for null or undefined', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
  })

  it('should return 0 for invalid string', () => {
    expect(toNumber('invalid')).toBe(0)
  })
})

describe('toDate', () => {
  it('should convert timestamp string to Date', () => {
    const result = toDate('1704067200')
    expect(result).toBeInstanceOf(Date)
    expect(result.getUTCFullYear()).toBe(2024)
  })

  it('should return epoch for null or undefined', () => {
    const result = toDate(null)
    expect(result.getTime()).toBe(0)
  })
})

describe('transformBlock', () => {
  it('should transform raw block to typed block', () => {
    const rawBlock: RawBlock = {
      number: '1000',
      hash: '0xabc123',
      parentHash: '0xdef456',
      timestamp: '1704067200',
      miner: '0x1234567890123456789012345678901234567890',
      gasUsed: '21000',
      gasLimit: '8000000',
      size: '1024',
      transactionCount: 5,
    }

    const result = transformBlock(rawBlock)

    expect(result.number).toBe(BigInt(1000))
    expect(result.hash).toBe('0xabc123')
    expect(result.parentHash).toBe('0xdef456')
    expect(result.timestamp).toBe(BigInt(1704067200))
    expect(result.miner).toBe('0x1234567890123456789012345678901234567890')
    expect(result.gasUsed).toBe(BigInt(21000))
    expect(result.gasLimit).toBe(BigInt(8000000))
    expect(result.size).toBe(BigInt(1024))
    expect(result.transactionCount).toBe(5)
  })

  it('should handle block with transactions', () => {
    const rawBlock: RawBlock = {
      number: '1000',
      hash: '0xabc123',
      timestamp: '1704067200',
      miner: '0x1234567890123456789012345678901234567890',
      gasUsed: '21000',
      gasLimit: '8000000',
      transactionCount: 1,
      transactions: [
        {
          hash: '0xtx123',
          blockNumber: '1000',
          from: '0xfrom',
          to: '0xto',
          value: '1000000000000000000',
          gas: '21000',
          type: 0,
        },
      ],
    }

    const result = transformBlock(rawBlock)

    expect(result.transactions).toBeDefined()
    expect(result.transactions?.length).toBe(1)
    expect(result.transactions?.[0]?.hash).toBe('0xtx123')
  })
})

describe('transformTransaction', () => {
  it('should transform raw transaction to typed transaction', () => {
    const rawTx: RawTransaction = {
      hash: '0xtx123',
      blockNumber: '1000',
      blockHash: '0xblock123',
      transactionIndex: 0,
      from: '0xfrom',
      to: '0xto',
      value: '1000000000000000000',
      gas: '21000',
      gasPrice: '20000000000',
      type: 2,
      input: '0x',
      nonce: '5',
    }

    const result = transformTransaction(rawTx)

    expect(result.hash).toBe('0xtx123')
    expect(result.blockNumber).toBe(BigInt(1000))
    expect(result.value).toBe(BigInt('1000000000000000000'))
    expect(result.gas).toBe(BigInt(21000))
    expect(result.gasPrice).toBe(BigInt('20000000000'))
    expect(result.nonce).toBe(BigInt(5))
    expect(result.type).toBe(2)
  })

  it('should handle null values', () => {
    const rawTx: RawTransaction = {
      hash: '0xtx123',
      blockNumber: '1000',
      from: '0xfrom',
      to: null,
      value: '0',
      gas: '21000',
      gasPrice: null,
      type: 0,
    }

    const result = transformTransaction(rawTx)

    expect(result.to).toBeNull()
    expect(result.gasPrice).toBeNull()
  })

  it('should transform receipt if present', () => {
    const rawTx: RawTransaction = {
      hash: '0xtx123',
      blockNumber: '1000',
      from: '0xfrom',
      to: '0xto',
      value: '0',
      gas: '21000',
      type: 0,
      receipt: {
        status: 1,
        gasUsed: '21000',
        cumulativeGasUsed: '21000',
        effectiveGasPrice: '20000000000',
        contractAddress: null,
        logs: [],
      },
    }

    const result = transformTransaction(rawTx)

    expect(result.receipt).toBeDefined()
    expect(result.receipt?.status).toBe(1)
    expect(result.receipt?.gasUsed).toBe(BigInt(21000))
  })
})

describe('transformReceipt', () => {
  it('should transform raw receipt to typed receipt', () => {
    const rawReceipt: RawReceipt = {
      status: 1,
      gasUsed: '21000',
      cumulativeGasUsed: '42000',
      effectiveGasPrice: '20000000000',
      contractAddress: '0xcontract',
      logs: [],
    }

    const result = transformReceipt(rawReceipt)

    expect(result.status).toBe(1)
    expect(result.gasUsed).toBe(BigInt(21000))
    expect(result.cumulativeGasUsed).toBe(BigInt(42000))
    expect(result.effectiveGasPrice).toBe(BigInt('20000000000'))
    expect(result.contractAddress).toBe('0xcontract')
    expect(result.logs).toEqual([])
  })
})

describe('transformLog', () => {
  it('should transform raw log to typed log', () => {
    const rawLog: RawLog = {
      address: '0xcontract',
      topics: ['0xtopic1', '0xtopic2'],
      data: '0xdata',
      blockNumber: '1000',
      transactionHash: '0xtx123',
      logIndex: 0,
    }

    const result = transformLog(rawLog)

    expect(result.address).toBe('0xcontract')
    expect(result.topics).toEqual(['0xtopic1', '0xtopic2'])
    expect(result.data).toBe('0xdata')
    expect(result.blockNumber).toBe(BigInt(1000))
    expect(result.transactionHash).toBe('0xtx123')
    expect(result.logIndex).toBe(0)
  })
})

describe('transformBalanceSnapshot', () => {
  it('should transform raw balance snapshot to typed snapshot', () => {
    const rawSnapshot: RawBalanceSnapshot = {
      blockNumber: '1000',
      balance: '1000000000000000000',
      delta: '500000000000000000',
      transactionHash: '0xtx123',
    }

    const result = transformBalanceSnapshot(rawSnapshot)

    expect(result.blockNumber).toBe(BigInt(1000))
    expect(result.balance).toBe(BigInt('1000000000000000000'))
    expect(result.delta).toBe(BigInt('500000000000000000'))
    expect(result.transactionHash).toBe('0xtx123')
  })

  it('should handle null transaction hash', () => {
    const rawSnapshot: RawBalanceSnapshot = {
      blockNumber: '1000',
      balance: '1000000000000000000',
      delta: '0',
      transactionHash: null,
    }

    const result = transformBalanceSnapshot(rawSnapshot)

    expect(result.transactionHash).toBeNull()
  })
})

describe('transformBlocks', () => {
  it('should transform array of raw blocks', () => {
    const rawBlocks: RawBlock[] = [
      {
        number: '1000',
        hash: '0xabc',
        timestamp: '1704067200',
        miner: '0xminer',
        gasUsed: '21000',
        gasLimit: '8000000',
        transactionCount: 1,
      },
      {
        number: '1001',
        hash: '0xdef',
        timestamp: '1704067212',
        miner: '0xminer',
        gasUsed: '42000',
        gasLimit: '8000000',
        transactionCount: 2,
      },
    ]

    const result = transformBlocks(rawBlocks)

    expect(result.length).toBe(2)
    expect(result[0]?.number).toBe(BigInt(1000))
    expect(result[1]?.number).toBe(BigInt(1001))
  })
})

describe('transformTransactions', () => {
  it('should transform array of raw transactions', () => {
    const rawTxs: RawTransaction[] = [
      {
        hash: '0xtx1',
        blockNumber: '1000',
        from: '0xfrom',
        to: '0xto',
        value: '1000000000000000000',
        gas: '21000',
        type: 0,
      },
      {
        hash: '0xtx2',
        blockNumber: '1001',
        from: '0xfrom2',
        to: '0xto2',
        value: '2000000000000000000',
        gas: '42000',
        type: 2,
      },
    ]

    const result = transformTransactions(rawTxs)

    expect(result.length).toBe(2)
    expect(result[0]?.hash).toBe('0xtx1')
    expect(result[1]?.hash).toBe('0xtx2')
  })
})
