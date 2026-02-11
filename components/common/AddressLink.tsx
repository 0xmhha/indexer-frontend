'use client'

import Link from 'next/link'
import { formatHash } from '@/lib/utils/format'
import { ContractIcon } from './ContractIcon'

interface AddressLinkProps {
  /** Hex address to display and link to */
  address: string
  /** Truncate the address for display (default true) */
  truncate?: boolean
  /** Explicitly mark as contract. undefined = no icon shown */
  isContract?: boolean | undefined
  /** Show the contract icon when isContract is true (default true) */
  showContractIcon?: boolean
  /** Additional CSS classes on the outer wrapper */
  className?: string
  /** Text size override (default matches table rows: text-xs) */
  textSize?: string
}

/**
 * Unified address link with optional contract indicator icon.
 *
 * Renders a monospace link to `/address/{address}` and, when the address
 * is known to be a contract, shows a small ContractIcon before the text.
 */
export function AddressLink({
  address,
  truncate = true,
  isContract,
  showContractIcon = true,
  className = '',
  textSize = 'text-xs',
}: AddressLinkProps) {
  const display = truncate ? formatHash(address, true) : address

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {showContractIcon && isContract === true && (
        <ContractIcon size="xs" />
      )}
      <Link
        href={`/address/${address}`}
        className={`font-mono ${textSize} text-accent-blue hover:text-accent-cyan`}
        title={address}
      >
        {display}
      </Link>
    </span>
  )
}
