'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UI, getSystemContractInfo } from '@/lib/config/constants'
import { useContractVerification } from '@/lib/hooks/useContractVerification'
import { parseSourceCodeFiles } from '@/lib/utils/source-code-parser'

interface SourceCodeViewerProps {
  address: string
}

export function SourceCodeViewer({ address }: SourceCodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState(0)
  const [copied, setCopied] = useState(false)
  const { verification, isVerified, loading, error, isSystemContract } = useContractVerification(address)
  const systemInfo = getSystemContractInfo(address)

  // Parse source code into files
  const files = parseSourceCodeFiles(
    verification?.sourceCode ?? '',
    verification?.name ?? null
  )

  if (!isVerified) {
    return null
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>SOURCE CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
            <span className="text-sm text-text-muted">Loading source code...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>SOURCE CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-error">Failed to load source code: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (files.length === 0 || !verification?.sourceCode) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>SOURCE CODE</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-text-muted">Source code not available</p>
        </CardContent>
      </Card>
    )
  }

  const currentFile = files[selectedFile]

  if (!currentFile) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), UI.COPY_TIMEOUT)
    } catch {
      // Clipboard API not available
    }
  }

  const handleCopyAll = async () => {
    try {
      // Combine all files with headers for easy identification
      const allContent = files
        .map(file => `// ===== ${file.name} =====\n\n${file.content}`)
        .join('\n\n')
      await navigator.clipboard.writeText(allContent)
      setCopied(true)
      setTimeout(() => setCopied(false), UI.COPY_TIMEOUT)
    } catch {
      // Clipboard API not available
    }
  }

  const lineCount = currentFile.content.split('\n').length
  // Calculate total lines from all parsed files (not raw JSON)
  const totalLines = files.reduce((sum, file) => sum + file.content.split('\n').length, 0)

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>SOURCE CODE</span>
            {isSystemContract && systemInfo && (
              <span
                className="rounded bg-accent-cyan/20 px-2 py-0.5 text-xs text-accent-cyan"
                title={systemInfo.description}
              >
                System Contract
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal text-text-muted">
              {files.length} file{files.length > 1 ? 's' : ''} • {totalLines.toLocaleString()} lines total
            </span>
            {files.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                aria-label="Copy all source code"
                className="text-xs"
              >
                COPY ALL
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* File Tabs */}
        {files.length > 1 && (
          <div className="flex flex-wrap border-b border-bg-tertiary bg-bg-secondary" role="tablist">
            {files.map((file, index) => {
              // Extract filename from path (e.g., "src/Contract.sol" -> "Contract.sol")
              const fileName = file.name.split('/').pop() ?? file.name
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      setSelectedFile((index + 1) % files.length)
                    } else if (e.key === 'ArrowLeft') {
                      setSelectedFile((index - 1 + files.length) % files.length)
                    }
                  }}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    index === selectedFile
                      ? 'bg-bg-primary text-accent-blue border-b-2 border-accent-blue'
                      : 'text-text-secondary hover:text-text-primary'
                  } ${file.isMain ? 'font-bold' : ''}`}
                  aria-selected={index === selectedFile}
                  role="tab"
                  tabIndex={index === selectedFile ? 0 : -1}
                  title={file.name}
                >
                  {fileName}
                  {file.isMain && <span className="ml-1 text-accent-green">●</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-bg-tertiary bg-bg-secondary px-4 py-2">
          <span className="text-xs text-text-muted" title={currentFile.name}>
            {currentFile.name.split('/').pop() ?? currentFile.name} • {lineCount.toLocaleString()} lines
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : 'Copy source code'}
          >
            {copied ? 'COPIED!' : 'COPY'}
          </Button>
        </div>

        {/* Code Display - scrollable container (both vertical and horizontal) */}
        <div className="max-h-[600px] overflow-auto">
          <pre className="p-4 text-sm leading-relaxed min-w-max">
            <code className="font-mono text-text-primary">
              {currentFile.content.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="mr-4 select-none text-right text-text-muted shrink-0" style={{ minWidth: '4ch' }}>
                    {index + 1}
                  </span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
