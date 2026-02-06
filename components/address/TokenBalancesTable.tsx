import Link from 'next/link'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatHash, formatNumber } from '@/lib/utils/format'
import { getSystemContractInfo } from '@/lib/config/constants'
import type { TokenBalance } from '@/types/graphql'

interface TokenBalancesTableProps {
  balances: TokenBalance[]
  loading?: boolean
}

/**
 * Format token balance with full decimal places (no trimming)
 * Shows all decimal places with padding zeros
 */
function formatTokenBalance(balance: bigint, decimals: number | null): string {
  if (decimals === null || decimals === 0) {
    return formatNumber(balance)
  }

  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = balance / divisor
  const fractionalPart = balance % divisor

  // Pad fractional part with leading zeros to match decimal places
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')

  // Format integer part with thousand separators
  const formattedInteger = formatNumber(integerPart)

  return `${formattedInteger}.${fractionalStr}`
}

export function TokenBalancesTable({ balances, loading }: TokenBalancesTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">Loading...</div>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">No token balances found</div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TOKEN</TableHead>
          <TableHead>CONTRACT ADDRESS</TableHead>
          <TableHead>TYPE</TableHead>
          <TableHead className="text-right">BALANCE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((token) => {
          // Get fallback metadata from system contracts if token name is not available
          const systemInfo = getSystemContractInfo(token.address)
          const displayName = token.name || systemInfo?.name
          const displaySymbol = token.symbol || systemInfo?.symbol
          const displayDecimals = token.decimals ?? systemInfo?.decimals ?? null
          const isSystemToken = !!systemInfo

          return (
            <TableRow key={token.address}>
              <TableCell>
                <div className="flex flex-col">
                  {displayName ? (
                    <>
                      <span className="font-mono font-bold text-accent-blue">
                        {displayName}
                        {isSystemToken && !token.name && (
                          <span className="ml-1 text-xs text-accent-cyan" title="System Contract">
                            [SYS]
                          </span>
                        )}
                      </span>
                      {displaySymbol && (
                        <span className="font-mono text-xs text-text-muted">{displaySymbol}</span>
                      )}
                    </>
                  ) : (
                    <span className="font-mono text-text-muted">Unknown Token</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/address/${token.address}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {formatHash(token.address)}
                </Link>
              </TableCell>
              <TableCell>
                <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-text-secondary">
                  {token.tokenType}
                </span>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatTokenBalance(token.balance, displayDecimals)}
                {displaySymbol && <span className="ml-1 text-text-muted">{displaySymbol}</span>}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
