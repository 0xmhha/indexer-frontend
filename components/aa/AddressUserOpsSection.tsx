'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { UserOpTable } from '@/components/aa/userops/UserOpTable'
import { useUserOperations } from '@/lib/hooks/aa'

interface AddressUserOpsSectionProps {
  address: string
}

const PAGE_SIZE = 20

/**
 * UserOperations section for Address detail page.
 * Shows UserOps where the address is the sender.
 */
export function AddressUserOpsSection({ address }: AddressUserOpsSectionProps) {
  const [page, setPage] = useState(0)

  const { userOps, totalCount, loading, error } = useUserOperations({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    filter: { sender: address },
  })

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>USER OPERATIONS</CardTitle>
          {totalCount > 0 && (
            <span className="font-mono text-xs text-text-secondary">
              {totalCount} total
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && userOps.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-status-error">Failed to load user operations</p>
          </div>
        ) : userOps.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-text-muted">No user operations found for this address</p>
          </div>
        ) : (
          <>
            <UserOpTable userOps={userOps} />

            {/* Simple pagination */}
            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-bg-tertiary px-4 py-3">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan disabled:text-text-muted disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="font-mono text-xs text-text-secondary">
                  Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= totalCount}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan disabled:text-text-muted disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
