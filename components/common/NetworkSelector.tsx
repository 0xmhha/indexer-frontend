'use client'

import { useState, useRef, useCallback } from 'react'
import { useSwitchChain, useAccount } from 'wagmi'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import Link from 'next/link'
import { useNetworkStore, selectCurrentNetwork, selectConnectionStatus } from '@/stores/networkStore'
import { PRESET_NETWORKS, NETWORK_TYPE_LABELS, NETWORK_TYPE_ORDER } from '@/config/networks.config'
import type { NetworkConfig, NetworkType, ConnectionStatus } from '@/lib/config/networks.types'

// ============================================================================
// Helper Functions
// ============================================================================

function groupNetworksByType(networks: NetworkConfig[]): Record<NetworkType, NetworkConfig[]> {
  const groups: Record<NetworkType, NetworkConfig[]> = {
    mainnet: [],
    testnet: [],
    devnet: [],
    custom: [],
  }
  networks.forEach((network) => {
    groups[network.type].push(network)
  })
  return groups
}

function getStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'bg-success'
    case 'connecting':
      return 'bg-warning animate-pulse'
    case 'error':
      return 'bg-error'
    default:
      return 'bg-text-muted'
  }
}

function getStatusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'error':
      return 'Error'
    default:
      return 'Disconnected'
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <div
      className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
      title={getStatusLabel(status)}
      aria-hidden="true"
    />
  )
}

function DropdownArrow({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-3 w-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function NetworkItem({
  network,
  isSelected,
  onSelect,
}: {
  network: NetworkConfig
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(network.id)}
      className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-bg-secondary ${
        isSelected ? 'bg-bg-secondary' : ''
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex flex-col">
        <span className="font-mono text-xs text-text-primary">{network.name}</span>
        <span className="font-mono text-xs text-text-muted">
          Chain: {network.chain.id} · {network.chain.currencySymbol}
        </span>
      </div>
      {isSelected && <CheckIcon />}
    </button>
  )
}

function NetworkGroup({
  type,
  networks,
  currentNetworkId,
  onSelectNetwork,
}: {
  type: NetworkType
  networks: NetworkConfig[]
  currentNetworkId: string | undefined
  onSelectNetwork: (id: string) => void
}) {
  if (networks.length === 0) {
    return null
  }

  return (
    <div className="border-b border-bg-tertiary last:border-b-0">
      <div className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-muted">
        {NETWORK_TYPE_LABELS[type]}
      </div>
      {networks.map((network) => (
        <NetworkItem
          key={network.id}
          network={network}
          isSelected={currentNetworkId === network.id}
          onSelect={onSelectNetwork}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Network Selector Component
 *
 * Dropdown for selecting the active network.
 * Shows current network, connection status, and available networks grouped by type.
 */
export function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentNetwork = useNetworkStore(selectCurrentNetwork)
  const connectionStatus = useNetworkStore(selectConnectionStatus)
  const customNetworks = useNetworkStore((state) => state.customNetworks)
  const selectNetwork = useNetworkStore((state) => state.selectNetwork)
  const { isPending: isChainSwitching } = useSwitchChain()
  const { isConnected } = useAccount()

  const allNetworks = [...PRESET_NETWORKS, ...customNetworks]
  const groupedNetworks = groupNetworksByType(allNetworks)

  useClickOutside(dropdownRef, useCallback(() => setIsOpen(false), []), isOpen)

  const handleSelectNetwork = (networkId: string) => {
    selectNetwork(networkId)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {setIsOpen(false)}
  }

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs transition-colors hover:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select network. Current: ${currentNetwork?.name ?? 'None'}`}
      >
        <StatusIndicator status={isConnected && isChainSwitching ? 'connecting' : connectionStatus} />
        <div className="flex items-center gap-1">
          <span className="text-text-primary">
            {isConnected && isChainSwitching ? 'Switching...' : (currentNetwork?.name ?? 'Select Network')}
          </span>
          <span className="text-text-muted">({currentNetwork?.chain.id ?? '-'})</span>
        </div>
        <DropdownArrow isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 min-w-[280px] border border-bg-tertiary bg-bg-primary shadow-lg"
          role="listbox"
          aria-label="Available networks"
        >
          <div className="border-b border-bg-tertiary px-4 py-2">
            <div className="flex items-center gap-2">
              <StatusIndicator status={connectionStatus} />
              <span className="font-mono text-xs text-text-muted">{getStatusLabel(connectionStatus)}</span>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {NETWORK_TYPE_ORDER.map((type) => (
              <NetworkGroup
                key={type}
                type={type}
                networks={groupedNetworks[type]}
                currentNetworkId={currentNetwork?.id}
                onSelectNetwork={handleSelectNetwork}
              />
            ))}
          </div>

          <div className="border-t border-bg-tertiary">
            <Link
              href="/settings#networks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
            >
              <PlusIcon />
              Add Custom Network
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
