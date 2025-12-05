'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ExportButton } from '@/components/common/ExportButton'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { ContractLogsTable } from './ContractLogsTable'
import { useContractLogs } from '@/lib/hooks/useContractLogs'
import { useLogs } from '@/lib/hooks/useSubscriptions'
import { formatNumber } from '@/lib/utils/format'
import { PAGINATION, REALTIME } from '@/lib/config/constants'
import type { Log } from '@/types/graphql'

interface ContractLogsSectionProps {
  address: string
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-text-muted">No event logs found for this contract</p>
    </div>
  )
}

/**
 * Live toggle button component
 */
function LiveToggle({
  isLive,
  onClick,
}: {
  isLive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2"
      title={isLive ? 'Click to disable live updates' : 'Click to enable live updates'}
    >
      <div
        className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-accent-green' : 'bg-text-muted'}`}
      />
      <span className={`font-mono text-xs ${isLive ? 'text-accent-green' : 'text-text-muted'}`}>
        {isLive ? 'LIVE' : 'PAUSED'}
      </span>
    </button>
  )
}

/**
 * Format logs for CSV export
 */
function formatExportData(logs: Log[]) {
  return logs.map((log) => ({
    transactionHash: log.transactionHash,
    blockNumber: log.blockNumber.toString(),
    address: log.address,
    topics: log.topics.join(','),
    data: log.data,
    logIndex: log.logIndex,
  }))
}

/**
 * Contract event logs section with pagination and real-time updates
 */
export function ContractLogsSection({ address }: ContractLogsSectionProps) {
  const [itemsPerPage, setItemsPerPageState] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLiveEnabled, setIsLiveEnabled] = useState(true)

  const offset = (currentPage - 1) * itemsPerPage

  // Historical logs query
  const {
    logs: historicalLogs,
    totalCount,
    loading,
    error,
    refetch,
  } = useContractLogs(address, {
    limit: itemsPerPage,
    offset,
  })

  // Real-time logs subscription
  const { logs: realtimeLogs, clearLogs } = useLogs(
    isLiveEnabled ? { address: address.toLowerCase() } : {},
    REALTIME.MAX_PENDING_TRANSACTIONS
  )

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))

  // Reset page when address changes
  useEffect(() => {
    // Reset pagination on address change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
    clearLogs()
  }, [address, clearLogs])

  // Merge realtime logs with historical (avoid duplicates)
  const mergedLogs: Log[] = useMemo(() => {
    if (!isLiveEnabled || currentPage !== 1) {
      return historicalLogs
    }

    // On first page, prepend new realtime logs
    const historicalHashes = new Set(
      historicalLogs.map((l) => `${l.transactionHash}-${l.logIndex}`)
    )
    const newLogs = realtimeLogs.filter(
      (l) => !historicalHashes.has(`${l.transactionHash}-${l.logIndex}`)
    )

    return [...newLogs, ...historicalLogs].slice(0, itemsPerPage)
  }, [historicalLogs, realtimeLogs, isLiveEnabled, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPageState(items)
    setCurrentPage(1)
  }

  const toggleLive = () => {
    setIsLiveEnabled(!isLiveEnabled)
    if (!isLiveEnabled) {
      clearLogs()
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>EVENT LOGS</span>
              <LiveToggle isLive={isLiveEnabled} onClick={toggleLive} />
              {isLiveEnabled && realtimeLogs.length > 0 && (
                <span className="rounded bg-accent-green/20 px-2 py-0.5 text-xs text-accent-green">
                  +{realtimeLogs.length} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {totalCount > 0 && (
                <span className="font-mono text-xs text-text-secondary">
                  {formatNumber(totalCount)} total
                </span>
              )}
              <button
                onClick={() => refetch()}
                className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                disabled={loading}
              >
                Refresh
              </button>
              <ExportButton
                data={formatExportData(mergedLogs)}
                filename={`contract-${address}-logs`}
                headers={['transactionHash', 'blockNumber', 'address', 'topics', 'data', 'logIndex']}
                disabled={loading}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && historicalLogs.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load event logs" message={error.message} />
            </div>
          ) : mergedLogs.length === 0 ? (
            <EmptyState />
          ) : (
            <ContractLogsTable logs={mergedLogs} />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            showResultsInfo={true}
            showPageInput={false}
          />
        </div>
      )}
    </>
  )
}
