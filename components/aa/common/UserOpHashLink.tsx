'use client'

import Link from 'next/link'
import { formatHash } from '@/lib/utils/format'

interface UserOpHashLinkProps {
  hash: string
  truncate?: boolean
  className?: string
}

/**
 * Clickable link to UserOperation detail page
 */
export function UserOpHashLink({ hash, truncate = true, className = '' }: UserOpHashLinkProps) {
  const display = truncate ? formatHash(hash, true) : hash

  return (
    <Link
      href={`/userop/${hash}`}
      className={`font-mono text-xs text-accent-blue hover:text-accent-cyan ${className}`}
      title={hash}
    >
      {display}
    </Link>
  )
}
