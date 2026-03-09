'use client'

interface UserOpStatusBadgeProps {
  success: boolean
  className?: string
}

/**
 * Status badge for UserOperation success/failure
 */
export function UserOpStatusBadge({ success, className = '' }: UserOpStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium ${
        success
          ? 'bg-status-success/10 text-status-success'
          : 'bg-status-error/10 text-status-error'
      } ${className}`}
    >
      {success ? 'Success' : 'Failed'}
    </span>
  )
}
