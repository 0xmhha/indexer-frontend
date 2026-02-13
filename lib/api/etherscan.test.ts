import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getApiBaseUrl,
  parseAbi,
  fetchContractVerification,
  parseEtherscanResponse,
} from './etherscan'
import type { EtherscanApiResponse } from './etherscan'

describe('getApiBaseUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
    }
  })

  it('should strip /graphql from the endpoint', () => {
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'http://example.com:8080/graphql'
    expect(getApiBaseUrl()).toBe('http://example.com:8080')
  })

  it('should return endpoint as-is when no /graphql suffix', () => {
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'http://example.com:8080/api'
    expect(getApiBaseUrl()).toBe('http://example.com:8080/api')
  })

  it('should fallback to localhost when env is not set', () => {
    delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
    expect(getApiBaseUrl()).toBe('http://localhost:8080')
  })
})

describe('parseAbi', () => {
  it('should parse valid JSON ABI array', () => {
    const abi = JSON.stringify([{ type: 'function', name: 'balanceOf' }])
    const result = parseAbi(abi)
    expect(result).toEqual([{ type: 'function', name: 'balanceOf' }])
  })

  it('should return null for null input', () => {
    expect(parseAbi(null)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseAbi('')).toBeNull()
  })

  it('should return null for invalid JSON', () => {
    expect(parseAbi('not valid json')).toBeNull()
  })

  it('should return null when parsed result is not an array', () => {
    expect(parseAbi('{"type": "function"}')).toBeNull()
  })

  it('should return null for JSON number', () => {
    expect(parseAbi('42')).toBeNull()
  })

  it('should return null for JSON string', () => {
    expect(parseAbi('"hello"')).toBeNull()
  })
})

describe('fetchContractVerification', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'http://test:8080/graphql'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
  })

  it('should fetch from the correct URL', async () => {
    const mockResponse = { status: '1', message: 'OK', result: [] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await fetchContractVerification('0x1234')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test:8080/api?module=contract&action=getsourcecode&address=0x1234'
    )
  })

  it('should return the parsed response', async () => {
    const mockResponse = { status: '1', message: 'OK', result: [] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchContractVerification('0x1234')
    expect(result).toEqual(mockResponse)
  })

  it('should throw on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    await expect(fetchContractVerification('0x1234')).rejects.toThrow('HTTP error! status: 500')
  })

  it('should throw on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(fetchContractVerification('0x1234')).rejects.toThrow('Network error')
  })
})

describe('parseEtherscanResponse', () => {
  const makeVerifiedResponse = (overrides = {}): EtherscanApiResponse => ({
    status: '1',
    message: 'OK',
    result: [{
      SourceCode: 'pragma solidity ^0.8.0;',
      ABI: JSON.stringify([{ type: 'function', name: 'transfer' }]),
      ContractName: 'TestToken',
      CompilerVersion: 'v0.8.19',
      OptimizationUsed: '1',
      Runs: '200',
      ConstructorArguments: '0x000',
      EVMVersion: 'paris',
      Library: '',
      LicenseType: 'MIT',
      Proxy: '0',
      Implementation: '',
      SwarmSource: '',
      ...overrides,
    }],
  })

  it('should parse a verified contract response', () => {
    const response = makeVerifiedResponse()
    const result = parseEtherscanResponse(response, null, null)

    expect(result).not.toBeNull()
    expect(result!.isVerified).toBe(true)
    expect(result!.contractName).toBe('TestToken')
    expect(result!.compilerVersion).toBe('v0.8.19')
    expect(result!.optimizationEnabled).toBe(true)
    expect(result!.optimizationRuns).toBe(200)
    expect(result!.sourceCode).toBe('pragma solidity ^0.8.0;')
    expect(result!.abi).toEqual([{ type: 'function', name: 'transfer' }])
    expect(result!.constructorArguments).toBe('0x000')
    expect(result!.licenseType).toBe('MIT')
  })

  it('should return null for status 0 response', () => {
    const response: EtherscanApiResponse = {
      status: '0',
      message: 'NOTOK',
      result: 'Contract source code not verified',
    }
    expect(parseEtherscanResponse(response, null, null)).toBeNull()
  })

  it('should return null for empty result array', () => {
    const response: EtherscanApiResponse = {
      status: '1',
      message: 'OK',
      result: [],
    }
    expect(parseEtherscanResponse(response, null, null)).toBeNull()
  })

  it('should return null when ABI says not verified', () => {
    const response = makeVerifiedResponse({ ABI: 'Contract source code not verified' })
    expect(parseEtherscanResponse(response, null, null)).toBeNull()
  })

  it('should return null when ABI is empty', () => {
    const response = makeVerifiedResponse({ ABI: '' })
    expect(parseEtherscanResponse(response, null, null)).toBeNull()
  })

  it('should use fallback name when ContractName is empty', () => {
    const response = makeVerifiedResponse({ ContractName: '' })
    const result = parseEtherscanResponse(response, null, 'FallbackName')
    expect(result!.contractName).toBe('FallbackName')
  })

  it('should use fallback ABI when parsed ABI is null', () => {
    const fallbackAbi = [{ type: 'function' as const, name: 'test', inputs: [], outputs: [], stateMutability: 'view' as const }]
    const response = makeVerifiedResponse({ ABI: 'invalid-json' })
    const result = parseEtherscanResponse(response, fallbackAbi, null)
    expect(result!.abi).toEqual(fallbackAbi)
  })

  it('should handle OptimizationUsed = 0', () => {
    const response = makeVerifiedResponse({ OptimizationUsed: '0' })
    const result = parseEtherscanResponse(response, null, null)
    expect(result!.optimizationEnabled).toBe(false)
  })

  it('should return null optimizationRuns when Runs is empty', () => {
    const response = makeVerifiedResponse({ Runs: '' })
    const result = parseEtherscanResponse(response, null, null)
    expect(result!.optimizationRuns).toBeNull()
  })
})
