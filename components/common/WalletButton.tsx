'use client'

import { useState, useRef, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useChainSync } from '@/lib/hooks/useChainSync'

// ============================================================================
// Constants & Helpers
// ============================================================================

const ADDRESS_PREFIX_LENGTH = 6
const ADDRESS_SUFFIX_LENGTH = 4
const COPY_FEEDBACK_DURATION = 1500

function truncateAddress(address: string): string {
  return `${address.slice(0, ADDRESS_PREFIX_LENGTH)}...${address.slice(-ADDRESS_SUFFIX_LENGTH)}`
}

function getConnectorLabel(connectorName: string): string {
  const lower = connectorName.toLowerCase()
  if (lower.includes('metamask') || lower === 'injected') { return 'MetaMask' }
  if (lower.includes('walletconnect')) { return 'WalletConnect' }
  if (lower.includes('coinbase')) { return 'Coinbase Wallet' }
  return connectorName
}

// ============================================================================
// Sub-Components
// ============================================================================

function ConnectorIcon({ name }: { name: string }) {
  const lower = name.toLowerCase()

  if (lower.includes('walletconnect')) {
    return (
      <svg className="h-4 w-4 text-accent-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.09 10.56c3.26-3.2 8.56-3.2 11.82 0l.39.38a.4.4 0 010 .58l-1.34 1.32a.21.21 0 01-.3 0l-.54-.53c-2.28-2.23-5.97-2.23-8.24 0l-.58.56a.21.21 0 01-.3 0L5.66 11.6a.4.4 0 010-.58l.43-.46zm14.6 2.72l1.2 1.17a.4.4 0 010 .58l-5.38 5.28a.42.42 0 01-.59 0l-3.82-3.74a.1.1 0 00-.15 0l-3.82 3.74a.42.42 0 01-.59 0L2.16 15.03a.4.4 0 010-.58l1.2-1.17a.42.42 0 01.59 0l3.82 3.74a.1.1 0 00.15 0l3.82-3.74a.42.42 0 01.59 0l3.82 3.74a.1.1 0 00.15 0l3.82-3.74a.42.42 0 01.59 0z" />
      </svg>
    )
  }

  if (lower.includes('coinbase')) {
    return (
      <svg className="h-4 w-4 text-accent-blue" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="8" width="8" height="8" rx="1" />
      </svg>
    )
  }

  // MetaMask / Injected / Fallback
  return (
    <svg className="h-4 w-4 text-accent-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M22 10H2" />
    </svg>
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

// ---- Connector Selection (not connected) ----

function ConnectorSelector({
  connectors,
  onSelect,
}: {
  connectors: readonly Connector[]
  onSelect: (connector: Connector) => void
}) {
  return (
    <>
      <div className="border-b border-bg-tertiary px-4 py-2">
        <div className="font-mono text-xs text-text-muted">SELECT WALLET</div>
      </div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => onSelect(connector)}
          className="flex w-full items-center gap-3 px-4 py-3 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
          role="menuitem"
        >
          <ConnectorIcon name={connector.name} />
          {getConnectorLabel(connector.name)}
        </button>
      ))}
    </>
  )
}

// ---- Connected Account Menu ----

function AccountMenu({
  address,
  connectorName,
  onCopy,
  copied,
  onDisconnect,
  isMismatched,
}: {
  address: string
  connectorName: string | undefined
  onCopy: () => void
  copied: boolean
  onDisconnect: () => void
  isMismatched: boolean
}) {
  return (
    <>
      {isMismatched && (
        <div className="border-b border-accent-orange bg-accent-orange/10 px-4 py-2">
          <div className="font-mono text-xs text-accent-orange">
            ⚠ Wrong network — switch in your wallet
          </div>
        </div>
      )}

      <div className="border-b border-bg-tertiary px-4 py-2">
        <div className="font-mono text-xs text-text-muted">
          {connectorName ? getConnectorLabel(connectorName) : 'CONNECTED'}
        </div>
        <div className="mt-1 break-all font-mono text-xs text-accent-blue">{address}</div>
      </div>

      <button
        onClick={onCopy}
        className="flex w-full items-center gap-2 px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        role="menuitem"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        {copied ? 'Copied!' : 'Copy Address'}
      </button>

      <button
        onClick={onDisconnect}
        className="flex w-full items-center gap-2 px-4 py-2 font-mono text-xs text-error transition-colors hover:bg-bg-secondary"
        role="menuitem"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Disconnect
      </button>
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WalletButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { address, isConnected, connector: activeConnector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const { isMismatched, isSwitching } = useChainSync()
  useClickOutside(dropdownRef, useCallback(() => setIsOpen(false), []), isOpen)

  const handleCopyAddress = useCallback(async () => {
    if (!address) { return }
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION)
  }, [address])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { setIsOpen(false) }
  }

  const buttonLabel = isConnected
    ? truncateAddress(address ?? '')
    : isPending ? 'CONNECTING...' : 'CONNECT'

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs transition-colors hover:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isConnected ? `Wallet menu. Address: ${address}` : 'Connect wallet'}
      >
        {isConnected && (
          <div
            className={`h-2 w-2 rounded-full ${isMismatched ? 'bg-accent-orange' : 'bg-success'}`}
            aria-hidden="true"
            title={isMismatched ? 'Chain mismatch — switch network in your wallet' : 'Connected'}
          />
        )}
        <span className="text-text-primary">
          {isSwitching ? 'SWITCHING...' : buttonLabel}
        </span>
        {isConnected && <DropdownArrow isOpen={isOpen} />}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 min-w-[220px] border border-bg-tertiary bg-bg-primary shadow-lg"
          role="menu"
          aria-label={isConnected ? 'Wallet actions' : 'Select wallet'}
        >
          {isConnected ? (
            <AccountMenu
              address={address ?? ''}
              connectorName={activeConnector?.name}
              onCopy={handleCopyAddress}
              copied={copied}
              onDisconnect={() => { disconnect(); setIsOpen(false) }}
              isMismatched={isMismatched}
            />
          ) : (
            <ConnectorSelector
              connectors={connectors}
              onSelect={(connector) => { connect({ connector }); setIsOpen(false) }}
            />
          )}
        </div>
      )}
    </div>
  )
}
