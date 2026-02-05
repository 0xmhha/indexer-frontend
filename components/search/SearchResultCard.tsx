'use client'

import Link from 'next/link'
import { formatHash, formatNumber } from '@/lib/utils/format'
import type { SearchResult, SearchResultType } from '@/lib/graphql/queries/search'
import { parseSearchMetadata } from '@/lib/graphql/queries/search'

// ============================================================
// Constants
// ============================================================

export const TYPE_LABELS: Record<SearchResultType, string> = {
  block: 'Blocks',
  transaction: 'Transactions',
  address: 'Addresses',
  contract: 'Contracts',
}

export const TYPE_ICONS: Record<SearchResultType, string> = {
  block: '▣',
  transaction: '⇄',
  address: '◈',
  contract: '⚙',
}

// ============================================================
// Base Result Card
// ============================================================

interface ResultCardWrapperProps {
  href: string
  children: React.ReactNode
}

function ResultCardWrapper({ href, children }: ResultCardWrapperProps) {
  return (
    <Link
      href={href}
      className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
        <div className="ml-4 font-mono text-xs text-text-muted">→</div>
      </div>
    </Link>
  )
}

// ============================================================
// Block Result
// ============================================================

function BlockResultCard({ result }: { result: SearchResult }) {
  const metadata = parseSearchMetadata(result.metadata)
  const displayLabel = result.label || result.value

  return (
    <ResultCardWrapper href={`/block/${result.value}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-text-muted" aria-hidden="true">
          {TYPE_ICONS.block}
        </span>
        <span className="font-mono text-sm font-medium text-accent-blue">{displayLabel}</span>
      </div>
      <div className="mt-2 space-y-1">
        {metadata?.timestamp && (
          <div className="font-mono text-xs text-text-secondary">
            Block #{formatNumber(BigInt(result.value))}
          </div>
        )}
        {metadata?.transactionCount !== undefined && (
          <div className="font-mono text-xs text-text-muted">
            {metadata.transactionCount} transactions
          </div>
        )}
        {metadata?.miner && (
          <div className="font-mono text-xs text-text-muted">
            Miner: {formatHash(metadata.miner)}
          </div>
        )}
      </div>
    </ResultCardWrapper>
  )
}

// ============================================================
// Transaction Result
// ============================================================

function TransactionResultCard({ result }: { result: SearchResult }) {
  const metadata = parseSearchMetadata(result.metadata)

  return (
    <ResultCardWrapper href={`/tx/${result.value}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-text-muted" aria-hidden="true">
          {TYPE_ICONS.transaction}
        </span>
        <span className="font-mono text-sm font-medium text-accent-blue">
          Transaction {formatHash(result.value)}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {metadata?.from && (
          <div className="font-mono text-xs text-text-secondary">
            From: {formatHash(metadata.from)}
          </div>
        )}
        {metadata?.to ? (
          <div className="font-mono text-xs text-text-secondary">
            To: {formatHash(metadata.to)}
          </div>
        ) : metadata?.contractAddress ? (
          <div className="font-mono text-xs text-text-secondary">
            To: <span className="text-accent-orange">[Created]</span>{' '}
            <Link href={`/address/${metadata.contractAddress}`} className="text-accent-blue hover:text-accent-cyan">
              {formatHash(metadata.contractAddress)}
            </Link>
          </div>
        ) : metadata?.from ? (
          <div className="font-mono text-xs text-text-secondary">
            To: <span className="text-accent-orange">Contract Creation</span>
          </div>
        ) : null}
        {metadata?.blockNumber && (
          <div className="font-mono text-xs text-text-muted">
            Block: #{formatNumber(BigInt(metadata.blockNumber))}
          </div>
        )}
      </div>
    </ResultCardWrapper>
  )
}

// ============================================================
// Address/Contract Result
// ============================================================

function AddressResultCard({ result }: { result: SearchResult }) {
  const metadata = parseSearchMetadata(result.metadata)
  const typeLabel = result.type === 'contract' ? 'Contract' : 'Address'
  const icon = result.type === 'contract' ? TYPE_ICONS.contract : TYPE_ICONS.address

  return (
    <ResultCardWrapper href={`/address/${result.value}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-text-muted" aria-hidden="true">
          {icon}
        </span>
        <span className="font-mono text-sm font-medium text-accent-blue">
          {typeLabel} {formatHash(result.value)}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="font-mono text-xs text-text-secondary">{formatHash(result.value)}</div>
        {metadata?.balance && metadata.balance !== '0' && (
          <div className="font-mono text-xs text-text-muted">
            Balance: {formatNumber(BigInt(metadata.balance))} wei
          </div>
        )}
      </div>
    </ResultCardWrapper>
  )
}

// ============================================================
// Main Export
// ============================================================

/**
 * Render a search result card based on type (SRP: Only renders single result)
 */
export function SearchResultCard({ result }: { result: SearchResult }) {
  switch (result.type) {
    case 'block':
      return <BlockResultCard result={result} />
    case 'transaction':
      return <TransactionResultCard result={result} />
    case 'address':
    case 'contract':
      return <AddressResultCard result={result} />
    default:
      return null
  }
}
