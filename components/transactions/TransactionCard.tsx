import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatHash, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber?: string
}

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const value = BigInt(transaction.value)
  const isHighValue = value > BigInt('1000000000000000000') // > 1 ETH

  return (
    <Card className="transition-all hover:border-accent-blue/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="annotation">TX</span>
              <Link
                href={`/tx/${transaction.hash}`}
                className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
              >
                {formatHash(transaction.hash)}
              </Link>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">From:</span>
                <Link
                  href={`/address/${transaction.from}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {transaction.from.slice(0, 10)}...
                </Link>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">To:</span>
                {transaction.to ? (
                  <Link
                    href={`/address/${transaction.to}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {transaction.to.slice(0, 10)}...
                  </Link>
                ) : (
                  <span className="font-mono text-text-muted">[Contract Creation]</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">Value:</span>
                <span
                  className={`font-mono ${isHighValue ? 'text-accent-orange' : 'text-text-secondary'}`}
                >
                  {formatCurrency(value, env.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {isHighValue && (
            <div className="flex h-8 w-8 items-center justify-center border border-accent-orange/30 bg-accent-orange/10">
              <div className="h-4 w-4 border border-accent-orange/50"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
