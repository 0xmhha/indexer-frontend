'use client'

import Link from 'next/link'
import { useValidatorStats, useValidatorParticipation } from '@/lib/hooks/useConsensus'
import { ValidatorStatsOverview } from './ValidatorStatsOverview'
import { ValidatorParticipationHistory } from './ValidatorParticipationHistory'

interface ValidatorDetailProps {
  address: string
}

export function ValidatorDetail({ address }: ValidatorDetailProps) {
  const blockRange = {
    fromBlock: '0',
    toBlock: '999999999',
  }

  const {
    validatorStats,
    loading: statsLoading,
    error: statsError,
  } = useValidatorStats({
    address,
    fromBlock: blockRange.fromBlock,
    toBlock: blockRange.toBlock,
  })

  const {
    participation,
    loading: participationLoading,
    error: participationError,
  } = useValidatorParticipation({
    address,
    fromBlock: blockRange.fromBlock,
    toBlock: blockRange.toBlock,
    limit: 50,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/validators" className="font-mono text-sm text-text-muted hover:text-accent-blue">
              ← Validators
            </Link>
          </div>
          <h1 className="mb-2 font-mono text-2xl font-bold text-text-primary">VALIDATOR</h1>
          <p className="font-mono text-sm text-text-secondary" title={address}>
            {address}
          </p>
        </div>
      </div>

      <ValidatorStatsOverview stats={validatorStats} loading={statsLoading} error={statsError} />
      <ValidatorParticipationHistory participation={participation} loading={participationLoading} error={participationError} />
    </div>
  )
}
