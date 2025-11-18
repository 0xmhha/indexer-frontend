'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { isValidAddress } from '@/lib/utils/validation'
import type { ContractABI } from '@/types/contract'

// Lazy load contract interaction components
const ContractReader = dynamic(
  () => import('@/components/contract/ContractReader').then((mod) => ({ default: mod.ContractReader })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

const ContractWriter = dynamic(
  () => import('@/components/contract/ContractWriter').then((mod) => ({ default: mod.ContractWriter })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

export default function ContractPage() {
  const [contractAddress, setContractAddress] = useState('')
  const [abi, setAbi] = useState('')
  const [isAbiValid, setIsAbiValid] = useState(false)
  const [parsedAbi, setParsedAbi] = useState<ContractABI>([])
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read')
  const [error, setError] = useState('')

  const handleLoadContract = () => {
    setError('')

    // Validate contract address
    if (!isValidAddress(contractAddress)) {
      setError('Invalid contract address')
      return
    }

    // Validate and parse ABI
    try {
      const parsed = JSON.parse(abi)
      if (!Array.isArray(parsed)) {
        setError('ABI must be an array')
        return
      }
      setParsedAbi(parsed)
      setIsAbiValid(true)
    } catch (e) {
      setError('Invalid JSON ABI format')
      return
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">CONTRACT INTERACTION</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          READ / WRITE CONTRACT
        </h1>
        <p className="font-mono text-xs text-text-secondary">
          Interact with smart contracts on the blockchain
        </p>
      </div>

      {/* Contract Setup */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>CONTRACT SETUP</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="annotation mb-2 block">CONTRACT ADDRESS</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="annotation mb-2 block">
              CONTRACT ABI (JSON FORMAT)
            </label>
            <textarea
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
              placeholder='[{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
              rows={8}
              className="w-full border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
            />
            <p className="mt-2 font-mono text-xs text-text-muted">
              Paste the contract ABI in JSON format
            </p>
          </div>

          {error && (
            <div className="font-mono text-xs text-error">{error}</div>
          )}

          <Button onClick={handleLoadContract}>LOAD CONTRACT</Button>
        </CardContent>
      </Card>

      {/* Contract Interaction Tabs */}
      {isAbiValid && parsedAbi.length > 0 && (
        <>
          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab('read')}
              className={`border px-6 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'read'
                  ? 'border-accent-blue bg-accent-blue text-bg-primary'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:text-accent-blue'
              }`}
            >
              READ CONTRACT
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`border px-6 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'write'
                  ? 'border-accent-blue bg-accent-blue text-bg-primary'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:text-accent-blue'
              }`}
            >
              WRITE CONTRACT
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'read' && (
            <ContractReader
              contractAddress={contractAddress}
              abi={parsedAbi}
            />
          )}
          {activeTab === 'write' && (
            <ContractWriter
              contractAddress={contractAddress}
              abi={parsedAbi}
            />
          )}
        </>
      )}
    </div>
  )
}
