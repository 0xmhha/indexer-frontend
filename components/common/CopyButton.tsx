'use client'

import { useState, useCallback } from 'react'
import { UI, FORMATTING } from '@/lib/config/constants'

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string
  /** Optional custom className */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
  /** Show text label instead of just icon */
  showLabel?: boolean
}

/**
 * Reusable copy-to-clipboard button
 * Shows a checkmark briefly after successful copy
 */
export function CopyButton({
  text,
  className = '',
  size = 'sm',
  showLabel = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), UI.COPY_TIMEOUT)
    } catch {
      // Clipboard API not available - fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), UI.COPY_TIMEOUT)
      } catch {
        // Copy failed
      }
      document.body.removeChild(textarea)
    }
  }, [text])

  const sizeClasses = size === 'sm'
    ? 'h-5 w-5 p-0.5'
    : 'h-6 w-6 p-1'

  const iconSize = size === 'sm' ? UI.ICON_SIZE_SM : UI.ICON_SIZE_MD

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary ${sizeClasses} ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
    >
      {copied ? (
        // Checkmark icon
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-green"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Copy icon
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {showLabel && (
        <span className="ml-1 text-xs">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      )}
    </button>
  )
}

/**
 * Address display with integrated copy button
 */
interface AddressWithCopyProps {
  address: string
  /** Truncate address for display */
  truncate?: boolean
  /** Link to address page */
  href?: string
  /** Custom className for the address text */
  className?: string
  /** Show full address on hover */
  showFullOnHover?: boolean
}

export function AddressWithCopy({
  address,
  truncate = true,
  href,
  className = '',
  showFullOnHover = true,
}: AddressWithCopyProps) {
  const displayAddress = truncate
    ? `${address.slice(0, FORMATTING.ADDRESS_START_CHARS)}...${address.slice(-FORMATTING.ADDRESS_END_CHARS)}`
    : address

  const addressElement = (
    <span
      className={`font-mono ${className}`}
      title={showFullOnHover ? address : undefined}
    >
      {displayAddress}
    </span>
  )

  return (
    <span className="inline-flex items-center gap-1">
      {href ? (
        <a
          href={href}
          className="text-accent-blue hover:text-accent-cyan hover:underline"
        >
          {addressElement}
        </a>
      ) : (
        addressElement
      )}
      <CopyButton text={address} />
    </span>
  )
}

/**
 * Hash display with integrated copy button (for transaction hashes, block hashes)
 */
interface HashWithCopyProps {
  hash: string
  /** Truncate hash for display */
  truncate?: boolean
  /** Link destination */
  href?: string
  /** Custom className */
  className?: string
  /** Label prefix (e.g., "Tx:", "Block:") */
  label?: string
}

export function HashWithCopy({
  hash,
  truncate = true,
  href,
  className = '',
  label,
}: HashWithCopyProps) {
  const displayHash = truncate
    ? `${hash.slice(0, FORMATTING.HASH_START_CHARS)}...${hash.slice(-FORMATTING.HASH_END_CHARS)}`
    : hash

  const hashElement = (
    <span className={`font-mono ${className}`} title={hash}>
      {displayHash}
    </span>
  )

  return (
    <span className="inline-flex items-center gap-1">
      {label && <span className="text-text-muted">{label}</span>}
      {href ? (
        <a
          href={href}
          className="text-accent-blue hover:text-accent-cyan hover:underline"
        >
          {hashElement}
        </a>
      ) : (
        hashElement
      )}
      <CopyButton text={hash} />
    </span>
  )
}
