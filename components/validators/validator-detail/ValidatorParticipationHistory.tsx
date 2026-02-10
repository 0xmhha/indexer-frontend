'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatNumber } from '@/lib/utils/format'
import { RoundIndicator } from '@/components/consensus/RoundIndicator'

interface ValidatorParticipationHistoryProps {
  participation: {
    address: string
    startBlock: string
    endBlock: string
    totalBlocks: string
    blocksProposed: string
    blocksCommitted: string
    blocksMissed: string
    participationRate: number
    blocks: Array<{
      blockNumber: string
      wasProposer: boolean
      signedPrepare: boolean
      signedCommit: boolean
      round: number
    }>
  } | null
  loading: boolean
  error?: Error | undefined
}

export function ValidatorParticipationHistory({
  participation,
  loading,
  error,
}: ValidatorParticipationHistoryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load history" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  if (!participation || participation.blocks.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">No participation history available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
          <div className="font-mono text-xs text-text-muted">
            Blocks {formatNumber(participation.startBlock)} - {formatNumber(participation.endBlock)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-bg-tertiary bg-bg-secondary">
                <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">Block</th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">Round</th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">Role</th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">Prepare</th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">Commit</th>
              </tr>
            </thead>
            <tbody>
              {participation.blocks.map((block) => (
                <tr key={block.blockNumber} className="border-b border-bg-tertiary hover:bg-bg-secondary">
                  <td className="px-4 py-3">
                    <Link href={`/block/${block.blockNumber}`} className="font-mono text-sm text-accent-blue hover:underline">
                      #{formatNumber(block.blockNumber)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RoundIndicator round={block.round} size="sm" showLabel={false} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.wasProposer ? (
                      <span className="rounded bg-accent-cyan/10 px-2 py-0.5 font-mono text-xs text-accent-cyan">Proposer</span>
                    ) : (
                      <span className="font-mono text-xs text-text-muted">Validator</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.signedPrepare ? (
                      <span className="text-accent-green">&#10003;</span>
                    ) : (
                      <span className="text-accent-red">&#10007;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.signedCommit ? (
                      <span className="text-accent-green">&#10003;</span>
                    ) : (
                      <span className="text-accent-red">&#10007;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
