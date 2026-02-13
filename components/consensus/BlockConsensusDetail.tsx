'use client'

import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DataCard } from '@/components/ui/DataCard'
import { useConsensusData } from '@/lib/hooks/useConsensus'
import { truncateAddress } from '@/lib/utils/format'
import { RoundIndicator } from './RoundIndicator'
import { ParticipationRate } from './ParticipationRate'

interface BlockConsensusDetailProps {
  blockNumber: string
}

/**
 * Block Consensus Detail Component
 *
 * Displays detailed consensus information for a specific block including:
 * - Round information
 * - Proposer
 * - Prepare/Commit signers
 * - Missed validators
 * - Participation rate
 */
export function BlockConsensusDetail({ blockNumber }: BlockConsensusDetailProps) {
  const { consensusData, loading, error } = useConsensusData(blockNumber)

  if (loading || error || !consensusData) {
    return (
      <DataCard
        title="CONSENSUS DATA"
        loading={loading}
        error={error}
        isEmpty={!consensusData}
        emptyMessage="No consensus data available"
      />
    )
  }

  return (
    <DataCard title="CONSENSUS DATA">
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>CONSENSUS DATA</CardTitle>
          <div className="flex items-center gap-3">
            <RoundIndicator round={consensusData.round} size="sm" />
            {consensusData.isHealthy ? (
              <span className="rounded border border-accent-green bg-accent-green/10 px-2 py-1 font-mono text-xs text-accent-green">
                HEALTHY
              </span>
            ) : (
              <span className="rounded border border-accent-red bg-accent-red/10 px-2 py-1 font-mono text-xs text-accent-red">
                UNHEALTHY
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Overview */}
          <div className="space-y-4">
            {/* Proposer */}
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
              <div className="mb-2 font-mono text-xs text-text-muted">PROPOSER</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent-cyan" />
                <span className="font-mono text-sm text-text-primary" title={consensusData.proposer}>
                  {truncateAddress(consensusData.proposer)}
                </span>
              </div>
            </div>

            {/* Round Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                <div className="mb-1 font-mono text-xs text-text-muted">CURRENT ROUND</div>
                <div className="font-mono text-xl font-bold text-text-primary">{consensusData.round}</div>
              </div>
              <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                <div className="mb-1 font-mono text-xs text-text-muted">PREV ROUND</div>
                <div className="font-mono text-xl font-bold text-text-primary">{consensusData.prevRound}</div>
              </div>
            </div>

            {/* Gas Tip */}
            {consensusData.gasTip && (
              <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                <div className="mb-1 font-mono text-xs text-text-muted">GAS TIP</div>
                <div className="font-mono text-sm text-text-primary">{consensusData.gasTip}</div>
              </div>
            )}

            {/* Epoch Boundary */}
            {consensusData.isEpochBoundary && (
              <div className="rounded border border-accent-blue bg-accent-blue/10 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-accent-blue">⚡</span>
                  <span className="font-mono text-sm text-accent-blue">EPOCH BOUNDARY BLOCK</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Participation */}
          <div className="space-y-4">
            {/* Participation Rate */}
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
              <ParticipationRate
                rate={consensusData.participationRate}
                size="lg"
                label="PARTICIPATION RATE"
              />
            </div>

            {/* Signers Count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                <div className="mb-1 font-mono text-xs text-text-muted">PREPARE SIGNERS</div>
                <div className="font-mono text-lg font-bold text-accent-green">
                  {consensusData.prepareCount}/{consensusData.validators.length}
                </div>
              </div>
              <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
                <div className="mb-1 font-mono text-xs text-text-muted">COMMIT SIGNERS</div>
                <div className="font-mono text-lg font-bold text-accent-green">
                  {consensusData.commitCount}/{consensusData.validators.length}
                </div>
              </div>
            </div>

            {/* Missed Validators */}
            {(consensusData.missedPrepare.length > 0 || consensusData.missedCommit.length > 0) && (
              <div className="space-y-3">
                {consensusData.missedPrepare.length > 0 && (
                  <div className="rounded border border-accent-red/30 bg-accent-red/5 p-3">
                    <div className="mb-2 font-mono text-xs text-accent-red">
                      MISSED PREPARE ({consensusData.missedPrepare.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {consensusData.missedPrepare.map((addr) => (
                        <span
                          key={addr}
                          className="rounded bg-accent-red/10 px-2 py-0.5 font-mono text-xs text-accent-red"
                          title={addr}
                        >
                          {truncateAddress(addr)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {consensusData.missedCommit.length > 0 && (
                  <div className="rounded border border-yellow-500/30 bg-yellow-500/5 p-3">
                    <div className="mb-2 font-mono text-xs text-yellow-500">
                      MISSED COMMIT ({consensusData.missedCommit.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {consensusData.missedCommit.map((addr) => (
                        <span
                          key={addr}
                          className="rounded bg-yellow-500/10 px-2 py-0.5 font-mono text-xs text-yellow-500"
                          title={addr}
                        >
                          {truncateAddress(addr)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Validator Participation Matrix */}
        <div className="mt-6">
          <div className="mb-3 font-mono text-xs text-text-muted">VALIDATOR PARTICIPATION MATRIX</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bg-tertiary">
                  <th className="py-2 text-left font-mono text-xs font-normal text-text-muted">Validator</th>
                  <th className="py-2 text-center font-mono text-xs font-normal text-text-muted">Prepare</th>
                  <th className="py-2 text-center font-mono text-xs font-normal text-text-muted">Commit</th>
                  <th className="py-2 text-center font-mono text-xs font-normal text-text-muted">Role</th>
                </tr>
              </thead>
              <tbody>
                {consensusData.validators.map((validator) => {
                  const signedPrepare = consensusData.prepareSigners.includes(validator)
                  const signedCommit = consensusData.commitSigners.includes(validator)
                  const isProposer = validator === consensusData.proposer

                  return (
                    <tr key={validator} className="border-b border-bg-tertiary hover:bg-bg-secondary">
                      <td className="py-2 font-mono text-xs text-text-secondary" title={validator}>
                        {truncateAddress(validator)}
                      </td>
                      <td className="py-2 text-center">
                        {signedPrepare ? (
                          <span className="text-accent-green">&#10003;</span>
                        ) : (
                          <span className="text-accent-red">&#10007;</span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {signedCommit ? (
                          <span className="text-accent-green">&#10003;</span>
                        ) : (
                          <span className="text-accent-red">&#10007;</span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {isProposer && (
                          <span className="rounded bg-accent-cyan/10 px-2 py-0.5 font-mono text-xs text-accent-cyan">
                            Proposer
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </DataCard>
  )
}
