'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { formatHash, formatCurrency, formatNumber } from '@/lib/utils/format'
import { usePendingTransactions } from '@/lib/hooks/useSubscriptions'
import { env } from '@/lib/config/env'
import { PAGINATION } from '@/lib/config/constants'

interface PendingTransactionsPanelProps {
  maxTransactions?: number
  className?: string
}

/**
 * Real-time pending transactions panel using WebSocket subscriptions
 *
 * Displays a live stream of pending transactions waiting to be included in blocks.
 * Transactions are shown in real-time as they arrive in the mempool.
 *
 * @param maxTransactions - Maximum number of transactions to display (default: 20)
 * @param className - Additional CSS classes
 */
export function PendingTransactionsPanel({
  maxTransactions = PAGINATION.DEFAULT_PAGE_SIZE,
  className,
}: PendingTransactionsPanelProps) {
  const { pendingTransactions, loading, error } = usePendingTransactions(maxTransactions)

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>PENDING TRANSACTIONS</span>
          <div className="flex items-center gap-2">
            {!loading && !error && (
              <span className="font-mono text-xs text-text-secondary">
                {pendingTransactions.length} transactions
              </span>
            )}
            <div className="flex h-2 w-2 animate-pulse rounded-full bg-accent-green" />
            <span className="font-mono text-[10px] text-accent-green">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0" aria-live="polite">
        {loading && pendingTransactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay
              title="WebSocket connection unavailable"
              message="Pending transactions require WebSocket connection. Please ensure the backend server is running with WebSocket support."
            />
            <div className="mt-4 rounded border border-bg-tertiary bg-bg-secondary p-4">
              <p className="font-mono text-xs text-text-secondary">
                <span className="font-bold">Backend WebSocket endpoint:</span> {env.wsEndpoint}
              </p>
              <p className="mt-2 font-mono text-xs text-text-muted">
                Real-time features will be available once WebSocket server is running.
              </p>
            </div>
          </div>
        ) : pendingTransactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-sm text-text-muted">No pending transactions</div>
              <div className="mt-2 font-mono text-xs text-text-muted">
                Waiting for new transactions...
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TX HASH</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead className="text-right">VALUE</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead className="text-right">NONCE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.map((tx) => (
                  <TableRow key={`${tx.hash}-${tx.nonce}`} className="animate-fade-in">
                    <TableCell>
                      <Link
                        href={`/tx/${tx.hash}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(tx.hash)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/address/${tx.from}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(tx.from, true)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {tx.to ? (
                        <Link
                          href={`/address/${tx.to}`}
                          className="font-mono text-accent-blue hover:text-accent-cyan"
                        >
                          {formatHash(tx.to, true)}
                        </Link>
                      ) : (
                        <span className="font-mono text-text-muted">[Contract]</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(tx.value, env.currencySymbol)}
                    </TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={tx.type} />
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatNumber(tx.nonce)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
