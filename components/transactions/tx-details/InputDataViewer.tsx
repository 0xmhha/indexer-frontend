'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { CopyButton } from '@/components/common/CopyButton'
import { ABI } from '@/lib/config/constants'

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'raw' | 'utf8' | 'decoded'

interface InputDataViewerProps {
  input: string
}

interface DecodedInputData {
  methodId: string
  params: string[]
}

// ============================================================================
// Constants
// ============================================================================

const FUNCTION_SELECTOR_HEX_LENGTH = ABI.SELECTOR_LENGTH * 2 // 8 hex chars
const PARAM_HEX_LENGTH = ABI.WORD_SIZE // 64 hex chars
/** Collapsed height threshold in pixels - content taller than this gets a toggle */
const COLLAPSE_THRESHOLD_PX = 320

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Decode hex string to UTF-8 text
 * Filters out non-printable characters
 */
function hexToUtf8(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  if (cleaned.length === 0) {return ''}

  try {
    const bytes: number[] = []
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.slice(i, i + 2), 16))
    }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(
      new Uint8Array(bytes)
    )
    // Replace non-printable characters (except newline, tab) with dots
    return text.replace(/[^\x20-\x7E\n\t\r]/g, '.')
  } catch {
    return '(Unable to decode as UTF-8)'
  }
}

/**
 * Parse input data into function selector and parameter chunks
 */
function decodeInputData(input: string): DecodedInputData | null {
  const cleaned = input.startsWith('0x') ? input.slice(2) : input

  // Must have at least a function selector (4 bytes = 8 hex chars)
  if (cleaned.length < FUNCTION_SELECTOR_HEX_LENGTH) {return null}

  const methodId = `0x${cleaned.slice(0, FUNCTION_SELECTOR_HEX_LENGTH)}`
  const paramData = cleaned.slice(FUNCTION_SELECTOR_HEX_LENGTH)
  const params: string[] = []

  // Split remaining data into 32-byte (64 hex char) chunks
  for (let i = 0; i < paramData.length; i += PARAM_HEX_LENGTH) {
    const chunk = paramData.slice(i, i + PARAM_HEX_LENGTH)
    params.push(`0x${chunk}`)
  }

  return { methodId, params }
}

// ============================================================================
// Sub-Components
// ============================================================================

function ViewModeButton({
  mode,
  activeMode,
  onClick,
  label,
}: {
  mode: ViewMode
  activeMode: ViewMode
  onClick: (mode: ViewMode) => void
  label: string
}) {
  const isActive = mode === activeMode
  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
        isActive
          ? 'bg-accent-blue text-bg-primary'
          : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * Collapsible wrapper - shows full content but collapses if taller than threshold.
 * Height grows naturally with content; only adds scroll + toggle for very long data.
 */
function CollapsibleContent({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) {return}
    setNeedsCollapse(el.scrollHeight > COLLAPSE_THRESHOLD_PX)
  }, [children])

  const toggle = useCallback(() => setExpanded((prev) => !prev), [])

  return (
    <div>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-[max-height] duration-200 ${
          !expanded && needsCollapse ? 'max-h-80' : ''
        }`}
        style={
          expanded || !needsCollapse ? { maxHeight: 'none' } : undefined
        }
      >
        {children}
      </div>
      {needsCollapse && (
        <button
          type="button"
          onClick={toggle}
          className="mt-1 w-full rounded-b bg-bg-tertiary py-1.5 text-center font-mono text-xs text-accent-blue transition-colors hover:bg-bg-secondary hover:text-accent-cyan"
        >
          {expanded ? 'Collapse' : 'Expand all'}
        </button>
      )}
    </div>
  )
}

function RawView({ input }: { input: string }) {
  return (
    <CollapsibleContent>
      <pre className="whitespace-pre-wrap break-all rounded bg-bg-primary p-3 font-mono text-xs leading-relaxed text-text-secondary">
        {input || '0x'}
      </pre>
    </CollapsibleContent>
  )
}

function Utf8View({ input }: { input: string }) {
  const decoded = useMemo(() => hexToUtf8(input), [input])

  return (
    <CollapsibleContent>
      <pre className="whitespace-pre-wrap break-all rounded bg-bg-primary p-3 font-mono text-xs leading-relaxed text-text-secondary">
        {decoded || '(empty)'}
      </pre>
    </CollapsibleContent>
  )
}

function DecodedView({ input }: { input: string }) {
  const decoded = useMemo(() => decodeInputData(input), [input])

  if (!decoded) {
    return (
      <div className="rounded bg-bg-primary p-3 text-xs text-text-muted">
        Unable to decode: input data too short
      </div>
    )
  }

  return (
    <CollapsibleContent>
      <div className="rounded bg-bg-primary p-3">
        {/* Function Selector */}
        <div className="mb-3">
          <span className="text-xs font-bold text-text-muted">
            Function Selector (Method ID)
          </span>
          <div className="mt-1 flex items-center gap-2">
            <code className="rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-accent-blue">
              {decoded.methodId}
            </code>
            <CopyButton text={decoded.methodId} size="sm" />
          </div>
        </div>

        {/* Parameters */}
        {decoded.params.length > 0 && (
          <div>
            <span className="text-xs font-bold text-text-muted">
              Parameters ({decoded.params.length})
            </span>
            <div className="mt-1 space-y-1">
              {decoded.params.map((param, index) => (
                <div
                  key={`param-${index}`}
                  className="flex items-start gap-2"
                >
                  <span className="shrink-0 pt-1 font-mono text-xs text-text-muted">
                    [{index}]
                  </span>
                  <code className="min-w-0 flex-1 break-all rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-text-secondary">
                    {param}
                  </code>
                  <div className="shrink-0 pt-0.5">
                    <CopyButton text={param} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleContent>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function InputDataViewer({ input }: InputDataViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('raw')

  const isSimpleInput = !input || input === '0x' || input === '0x00'

  // For simple inputs (no data), show inline without tabs
  if (isSimpleInput) {
    return (
      <code className="rounded bg-bg-primary px-2 py-1 font-mono text-xs text-text-secondary">
        {input || '0x'}
      </code>
    )
  }

  return (
    <div className="w-full min-w-0">
      {/* View mode tabs + copy button */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex overflow-hidden rounded">
          <ViewModeButton
            mode="raw"
            activeMode={viewMode}
            onClick={setViewMode}
            label="Raw"
          />
          <ViewModeButton
            mode="utf8"
            activeMode={viewMode}
            onClick={setViewMode}
            label="UTF-8"
          />
          <ViewModeButton
            mode="decoded"
            activeMode={viewMode}
            onClick={setViewMode}
            label="Decoded"
          />
        </div>
        <CopyButton text={input} size="sm" showLabel />
      </div>

      {/* Content */}
      {viewMode === 'raw' && <RawView input={input} />}
      {viewMode === 'utf8' && <Utf8View input={input} />}
      {viewMode === 'decoded' && <DecodedView input={input} />}
    </div>
  )
}
