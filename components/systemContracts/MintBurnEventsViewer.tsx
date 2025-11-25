'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useMintEvents, useBurnEvents, type MintEvent, type BurnEvent } from '@/lib/hooks/useSystemContracts'
import { formatNumber, formatDateTime, truncateAddress } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

type EventType = 'mint' | 'burn'

interface MintBurnEventsViewerProps {
  maxEvents?: number
}

/**
 * Mint/Burn Events Viewer
 *
 * Displays mint and burn events with filtering capabilities.
 * Allows switching between mint and burn events.
 */
export function MintBurnEventsViewer({ maxEvents = UI.MAX_VIEWER_ITEMS }: MintBurnEventsViewerProps) {
  const [activeTab, setActiveTab] = useState<EventType>('mint')
  const [addressFilter, setAddressFilter] = useState('')

  // Mint events query
  const {
    mintEvents,
    totalCount: mintTotalCount,
    loading: mintLoading,
    error: mintError,
  } = useMintEvents({
    limit: maxEvents,
    ...(addressFilter && { minter: addressFilter }),
  })

  // Burn events query
  const {
    burnEvents,
    totalCount: burnTotalCount,
    loading: burnLoading,
    error: burnError,
  } = useBurnEvents({
    limit: maxEvents,
    ...(addressFilter && { burner: addressFilter }),
  })

  const loading = activeTab === 'mint' ? mintLoading : burnLoading
  const error = activeTab === 'mint' ? mintError : burnError

  const handleAddressFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFilter(e.target.value)
  }

  const handleClearFilter = () => {
    setAddressFilter('')
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>TOKEN EVENTS VIEWER</CardTitle>

          {/* Tab Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('mint')}
              className={`rounded border px-4 py-2 font-mono text-xs transition-colors ${
                activeTab === 'mint'
                  ? 'border-accent-green bg-accent-green/10 text-accent-green'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-green hover:text-accent-green'
              }`}
            >
              MINT ({formatNumber(mintTotalCount)})
            </button>
            <button
              onClick={() => setActiveTab('burn')}
              className={`rounded border px-4 py-2 font-mono text-xs transition-colors ${
                activeTab === 'burn'
                  ? 'border-accent-red bg-accent-red/10 text-accent-red'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-red hover:text-accent-red'
              }`}
            >
              BURN ({formatNumber(burnTotalCount)})
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="border-b border-bg-tertiary bg-bg-secondary p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={addressFilter}
              onChange={handleAddressFilterChange}
              placeholder={`Filter by ${activeTab === 'mint' ? 'minter' : 'burner'} address...`}
              className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
            />
          </div>
          {addressFilter && (
            <button
              onClick={handleClearFilter}
              className="rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay title={`Failed to load ${activeTab} events`} message={error.message} />
          </div>
        ) : activeTab === 'mint' ? (
          <MintEventsList events={mintEvents} />
        ) : (
          <BurnEventsList events={burnEvents} />
        )}
      </CardContent>
    </Card>
  )
}

function MintEventsList({ events }: { events: MintEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="font-mono text-sm text-text-muted">No mint events found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-bg-tertiary">
      {events.map((event, idx) => (
        <div
          key={`${event.transactionHash}-${event.logIndex}-${idx}`}
          className="p-4 transition-colors hover:bg-bg-secondary"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Amount:</span>
                <span className="font-mono text-sm font-bold text-accent-green">
                  +{formatNumber(BigInt(event.amount))} tokens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Block:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {formatNumber(BigInt(event.blockNumber))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Time:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Minter:</span>
                <span className="font-mono text-xs text-text-secondary">{truncateAddress(event.minter)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Recipient:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {truncateAddress(event.recipient)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Tx Hash:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {truncateAddress(event.transactionHash)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BurnEventsList({ events }: { events: BurnEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="font-mono text-sm text-text-muted">No burn events found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-bg-tertiary">
      {events.map((event, idx) => (
        <div
          key={`${event.transactionHash}-${event.logIndex}-${idx}`}
          className="p-4 transition-colors hover:bg-bg-secondary"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Amount:</span>
                <span className="font-mono text-sm font-bold text-accent-red">
                  -{formatNumber(BigInt(event.amount))} tokens
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Block:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {formatNumber(BigInt(event.blockNumber))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Time:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Burner:</span>
                <span className="font-mono text-xs text-text-secondary">{truncateAddress(event.burner)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">Tx Hash:</span>
                <span className="font-mono text-xs text-text-secondary">
                  {truncateAddress(event.transactionHash)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
