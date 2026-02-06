'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useContractVerification } from '@/lib/hooks/useContractVerification'
import type { ContractABI } from '@/types/contract'

// Lazy load contract interaction components to avoid SSR issues with ethers
const ContractReader = dynamic(
  () => import('@/components/contract/ContractReader').then((mod) => ({ default: mod.ContractReader })),
  {
    loading: () => (
      <div className="flex h-32 items-center justify-center">
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
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

// ============================================================================
// Types
// ============================================================================

interface ContractInteractionSectionProps {
  address: string
}

type TabType = 'read' | 'write'

// ============================================================================
// Sub-Components
// ============================================================================

function TabButton({
  active,
  onClick,
  children,
  id,
  controls,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  id: string
  controls: string
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      id={id}
      onClick={onClick}
      className={`border px-6 py-2 font-mono text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue ${
        active
          ? 'border-accent-blue bg-accent-blue text-bg-primary'
          : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:text-accent-blue'
      }`}
    >
      {children}
    </button>
  )
}

function NoAbiMessage({ isSystemContract }: { isSystemContract: boolean }) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>CONTRACT INTERACTION</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-sm text-text-muted">
            {isSystemContract
              ? 'Contract ABI not available for direct interaction.'
              : 'Contract is not verified. Verify the contract to enable read/write interactions.'}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            You can still interact with this contract manually on the{' '}
            <a href="/contract" className="text-accent-blue hover:text-accent-cyan">
              Contract Interaction page
            </a>{' '}
            by providing the ABI.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>CONTRACT INTERACTION</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          <span className="text-sm text-text-muted">Loading contract ABI...</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadFunctionCount({ abi }: { abi: ContractABI }) {
  const readFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      (item.stateMutability === 'view' || item.stateMutability === 'pure')
  )
  return <span>{readFunctions.length} functions</span>
}

function WriteFunctionCount({ abi }: { abi: ContractABI }) {
  const writeFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      item.stateMutability !== 'view' &&
      item.stateMutability !== 'pure'
  )
  return <span>{writeFunctions.length} functions</span>
}

// ============================================================================
// Main Component
// ============================================================================

export function ContractInteractionSection({ address }: ContractInteractionSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('read')
  const { abi, hasAbi, isSystemContract, loading, error } = useContractVerification(address)

  // Show loading state
  if (loading) {
    return <LoadingState />
  }

  // Don't render anything if there's an error fetching verification data
  // This is a graceful degradation - the component won't show if the query fails
  if (error) {
    return null
  }

  // Show message if no ABI available
  if (!hasAbi || !abi) {
    return <NoAbiMessage isSystemContract={isSystemContract} />
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>CONTRACT INTERACTION</span>
            {isSystemContract && (
              <span className="rounded bg-accent-cyan/20 px-2 py-0.5 text-xs text-accent-cyan">
                System Contract
              </span>
            )}
          </div>
          <span className="text-xs font-normal text-text-muted">
            Direct RPC Calls (eth_call)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-bg-tertiary p-4" role="tablist" aria-label="Contract interaction modes">
          <TabButton
            active={activeTab === 'read'}
            onClick={() => setActiveTab('read')}
            id="read-tab"
            controls="read-panel"
          >
            READ CONTRACT (<ReadFunctionCount abi={abi} />)
          </TabButton>
          <TabButton
            active={activeTab === 'write'}
            onClick={() => setActiveTab('write')}
            id="write-tab"
            controls="write-panel"
          >
            WRITE CONTRACT (<WriteFunctionCount abi={abi} />)
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'read' && (
            <div
              role="tabpanel"
              id="read-panel"
              aria-labelledby="read-tab"
              tabIndex={0}
            >
              <ContractReader contractAddress={address} abi={abi} />
            </div>
          )}
          {activeTab === 'write' && (
            <div
              role="tabpanel"
              id="write-panel"
              aria-labelledby="write-tab"
              tabIndex={0}
            >
              <ContractWriter contractAddress={address} abi={abi} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
