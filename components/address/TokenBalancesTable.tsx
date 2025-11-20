import Link from 'next/link'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { formatHash, formatNumber } from '@/lib/utils/format'
import type { TokenBalance } from '@/types/graphql'

interface TokenBalancesTableProps {
  balances: TokenBalance[]
  loading?: boolean
}

function formatTokenBalance(balance: bigint, decimals: number | null): string {
  if (decimals === null || decimals === 0) {
    return formatNumber(balance)
  }

  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = balance / divisor
  const fractionalPart = balance % divisor

  if (fractionalPart === BigInt(0)) {
    return formatNumber(integerPart)
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmedFractional = fractionalStr.replace(/0+$/, '')

  return `${formatNumber(integerPart)}.${trimmedFractional}`
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
        {balances.map((token) => (
          <TableRow key={token.contractAddress}>
            <TableCell>
              <div className="flex flex-col">
                {token.name ? (
                  <>
                    <span className="font-mono font-bold text-accent-blue">{token.name}</span>
                    {token.symbol && (
                      <span className="font-mono text-xs text-text-muted">{token.symbol}</span>
                    )}
                  </>
                ) : (
                  <span className="font-mono text-text-muted">Unknown Token</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`/address/${token.contractAddress}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {formatHash(token.contractAddress)}
              </Link>
            </TableCell>
            <TableCell>
              <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-text-secondary">
                {token.tokenType}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatTokenBalance(token.balance, token.decimals)}
              {token.symbol && <span className="ml-1 text-text-muted">{token.symbol}</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
