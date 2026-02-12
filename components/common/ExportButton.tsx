'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportData, type ExportFormat } from '@/lib/utils/export'
import { errorLogger } from '@/lib/errors/logger'
import { TIMING } from '@/lib/config/constants'

export interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[]
  filename: string
  headers?: string[]
  className?: string
  disabled?: boolean
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  headers,
  className = '',
  disabled = false,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    if (data.length === 0) {
      return
    }

    setIsExporting(format)
    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, TIMING.EXPORT_LOADING_DELAY))
      exportData(data, filename, format, headers)
    } catch (error) {
      errorLogger.error(error, { component: 'ExportButton', action: 'export' })
    } finally {
      setIsExporting(null)
    }
  }

  const isEmpty = data.length === 0
  const isDisabled = disabled || isEmpty || isExporting !== null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleExport('csv')}
        disabled={isDisabled}
        className="inline-flex items-center gap-2 rounded border border-bg-tertiary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:bg-bg-tertiary disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Export as CSV"
      >
        <Download className="h-3 w-3" aria-hidden="true" />
        <span>{isExporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={isDisabled}
        className="inline-flex items-center gap-2 rounded border border-bg-tertiary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:bg-bg-tertiary disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Export as JSON"
      >
        <Download className="h-3 w-3" aria-hidden="true" />
        <span>{isExporting === 'json' ? 'Exporting...' : 'JSON'}</span>
      </button>
    </div>
  )
}
