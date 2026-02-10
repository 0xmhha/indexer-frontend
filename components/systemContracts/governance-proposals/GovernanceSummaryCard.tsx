'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useProposals, SYSTEM_CONTRACTS } from '@/lib/hooks/useGovernance'

/**
 * Compact Governance Summary Card
 * For use in dashboards showing quick proposal overview
 */
export function GovernanceSummaryCard() {
  const { proposals: masterMinterProposals, loading: mmLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovMasterMinter,
    status: 'voting',
    limit: 10,
  })

  const { proposals: minterProposals, loading: mLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovMinter,
    status: 'voting',
    limit: 10,
  })

  const { proposals: councilProposals, loading: cLoading } = useProposals({
    contract: SYSTEM_CONTRACTS.GovCouncil,
    status: 'voting',
    limit: 10,
  })

  const loading = mmLoading || mLoading || cLoading

  const totalActiveVoting =
    masterMinterProposals.length + minterProposals.length + councilProposals.length

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>GOVERNANCE</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-accent-blue">
                {totalActiveVoting}
              </div>
              <div className="font-mono text-xs text-text-muted">Active Proposals</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {masterMinterProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">MasterMinter</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {minterProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">Minter</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-text-secondary">
                  {councilProposals.length}
                </div>
                <div className="font-mono text-xs text-text-muted">Council</div>
              </div>
            </div>
            <Link
              href="/system-contracts"
              className="block rounded border border-bg-tertiary bg-bg-secondary p-2 text-center font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
            >
              View All Proposals
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
