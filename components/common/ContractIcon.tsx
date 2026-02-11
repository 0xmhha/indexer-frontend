import { UI } from '@/lib/config/constants'

const SIZES = {
  xs: UI.ICON_SIZE_XS,
  sm: UI.ICON_SIZE_SM,
  md: UI.ICON_SIZE_MD,
} as const

interface ContractIconProps {
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

/**
 * Small code-document SVG icon indicating a contract address.
 * Uses accent-cyan to match existing system contract badge styling.
 */
export function ContractIcon({ size = 'sm', className = '' }: ContractIconProps) {
  const px = SIZES[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-accent-cyan ${className}`}
      aria-hidden="true"
    >
      <title>Contract</title>
      {/* Document outline */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* Code lines */}
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}
