'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useWBFTBlock, useBlockSigners } from '@/lib/hooks/useWBFT'
import { formatNumber, formatDateTime, truncateAddress, formatHash } from '@/lib/utils/format'

interface WBFTBlockViewerProps {
  initialBlockNumber?: string
}

/**
 * WBFT Block Metadata Viewer
 *
 * Displays detailed WBFT consensus information for a specific block,
 * including round, step, proposer, validator set, and signers.
 */
export function WBFTBlockViewer({ initialBlockNumber = '' }: WBFTBlockViewerProps) {
  const [blockNumber, setBlockNumber] = useState(initialBlockNumber)
  const [searchInput, setSearchInput] = useState(initialBlockNumber)

  const { wbftBlock, loading: wbftLoading, error: wbftError, refetch: refetchWBFT } = useWBFTBlock(blockNumber)
  const { blockSigners, loading: signersLoading, error: signersError } = useBlockSigners(blockNumber)

  const loading = wbftLoading || signersLoading
  const error = wbftError || signersError

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setBlockNumber(searchInput.trim())
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>WBFT BLOCK METADATA</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter block number..."
              className="flex-1 rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-accent-blue bg-accent-blue/10 px-6 py-2 font-mono text-sm text-accent-blue transition-colors hover:bg-accent-blue/20"
            >
              SEARCH
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Block Metadata */}
      {blockNumber && (
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <div className="flex items-center justify-between">
              <CardTitle>BLOCK #{formatNumber(BigInt(blockNumber))}</CardTitle>
              <button
                onClick={() => refetchWBFT()}
                className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
                aria-label="Refresh block data"
              >
                ↻
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-6">
                <ErrorDisplay title="Failed to load block data" message={error.message} />
              </div>
            ) : !wbftBlock ? (
              <div className="flex h-64 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">Block not found or not a WBFT block</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Consensus Information */}
                <div>
                  <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">CONSENSUS INFORMATION</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Block Number" value={formatNumber(wbftBlock.blockNumber)} />
                    <InfoItem label="Round" value={wbftBlock.round.toString()} />
                    <InfoItem label="Prev Round" value={wbftBlock.prevRound.toString()} />
                    {wbftBlock.gasTip && (
                      <InfoItem label="Gas Tip" value={wbftBlock.gasTip} />
                    )}
                    <InfoItem label="Timestamp" value={formatDateTime(wbftBlock.timestamp)} />
                  </div>
                </div>

                {/* Block Hashes */}
                <div>
                  <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">BLOCK HASHES</h3>
                  <div className="grid gap-4 sm:grid-cols-1">
                    <InfoItem
                      label="Block Hash"
                      value={formatHash(wbftBlock.blockHash)}
                      fullValue={wbftBlock.blockHash}
                      copyable
                    />
                    <InfoItem
                      label="Randao Reveal"
                      value={formatHash(wbftBlock.randaoReveal)}
                      fullValue={wbftBlock.randaoReveal}
                      copyable
                    />
                  </div>
                </div>

                {/* Prepared Seal Info */}
                {wbftBlock.preparedSeal && (
                  <div>
                    <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">PREPARED SEAL</h3>
                    <div className="space-y-4">
                      <InfoItem
                        label="Sealers Bitmap"
                        value={formatHash(wbftBlock.preparedSeal.sealers)}
                        fullValue={wbftBlock.preparedSeal.sealers}
                        copyable
                      />
                      <InfoItem
                        label="Signature"
                        value={formatHash(wbftBlock.preparedSeal.signature)}
                        fullValue={wbftBlock.preparedSeal.signature}
                        copyable
                      />
                    </div>
                  </div>
                )}

                {/* Committed Seal Info */}
                {wbftBlock.committedSeal && (
                  <div>
                    <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">COMMITTED SEAL</h3>
                    <div className="space-y-4">
                      <InfoItem
                        label="Sealers Bitmap"
                        value={formatHash(wbftBlock.committedSeal.sealers)}
                        fullValue={wbftBlock.committedSeal.sealers}
                        copyable
                      />
                      <InfoItem
                        label="Signature"
                        value={formatHash(wbftBlock.committedSeal.signature)}
                        fullValue={wbftBlock.committedSeal.signature}
                        copyable
                      />
                    </div>
                  </div>
                )}

                {/* Block Signers - Preparers */}
                {blockSigners && blockSigners.preparers?.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">
                      PREPARE SIGNERS ({blockSigners.preparers.length})
                    </h3>
                    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {blockSigners.preparers.map((signer, idx) => (
                          <div
                            key={`preparer-${signer}-${idx}`}
                            className="flex items-center gap-2 font-mono text-xs text-text-secondary"
                            title={signer}
                          >
                            <div className="h-2 w-2 rounded-full bg-accent-blue" />
                            <span>{truncateAddress(signer)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Block Signers - Committers */}
                {blockSigners && blockSigners.committers?.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">
                      COMMIT SIGNERS ({blockSigners.committers.length})
                    </h3>
                    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {blockSigners.committers.map((signer, idx) => (
                          <div
                            key={`committer-${signer}-${idx}`}
                            className="flex items-center gap-2 font-mono text-xs text-text-secondary"
                            title={signer}
                          >
                            <div className="h-2 w-2 rounded-full bg-accent-green" />
                            <span>{truncateAddress(signer)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoItem({
  label,
  value,
  fullValue,
  copyable = false,
}: {
  label: string
  value: string
  fullValue?: string
  copyable?: boolean
}) {
  const handleCopy = () => {
    if (fullValue) {
      navigator.clipboard.writeText(fullValue)
    }
  }

  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-text-secondary" title={fullValue}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="rounded border border-bg-tertiary bg-bg-primary px-2 py-0.5 font-mono text-xs text-text-muted transition-colors hover:border-accent-blue hover:text-accent-blue"
            aria-label={`Copy ${label}`}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}
