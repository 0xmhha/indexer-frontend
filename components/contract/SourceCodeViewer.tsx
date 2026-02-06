'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UI, getSystemContractInfo } from '@/lib/config/constants'
import { useContractVerification } from '@/lib/hooks/useContractVerification'

interface SourceCodeViewerProps {
  address: string
}

/**
 * Standard JSON Input format from solc
 * Used by forge verify-contract --verifier custom
 */
interface StandardJsonInput {
  language: string
  sources: Record<string, { content: string }>
  settings?: unknown
}

/**
 * Check if source code is in Standard JSON Input format
 */
function isStandardJsonInput(sourceCode: string): boolean {
  const trimmed = sourceCode.trim()
  if (!trimmed.startsWith('{')) {
    return false
  }
  return trimmed.includes('"language"') && trimmed.includes('"sources"')
}

/**
 * Parse Standard JSON Input format into separate files
 */
function parseStandardJsonInput(sourceCode: string, contractName: string | null): { name: string; content: string; isMain: boolean }[] {
  try {
    const json = JSON.parse(sourceCode) as StandardJsonInput

    if (!json.sources || typeof json.sources !== 'object') {
      return []
    }

    const files: { name: string; content: string; isMain: boolean }[] = []

    for (const [filePath, source] of Object.entries(json.sources)) {
      if (!source.content) {
        continue
      }

      // Extract filename from path (e.g., "src/Contract.sol" -> "Contract.sol")
      const fileName = filePath.split('/').pop() ?? filePath

      // Determine if this is the main contract file
      // Match by contract name in the file path
      const isMain = contractName
        ? filePath.toLowerCase().includes(contractName.toLowerCase()) ||
          fileName.toLowerCase().replace('.sol', '') === contractName.toLowerCase()
        : false

      files.push({
        name: filePath, // Keep full path for display
        content: source.content,
        isMain,
      })
    }

    // If no main contract was identified, mark the first file as main
    if (files.length > 0 && !files.some(f => f.isMain)) {
      // Try to find a file that looks like the main contract
      const mainIndex = files.findIndex(f =>
        !f.name.includes('lib/') &&
        !f.name.includes('node_modules/') &&
        !f.name.toLowerCase().includes('interface') &&
        !f.name.toLowerCase().includes('abstract')
      )
      if (mainIndex >= 0 && files[mainIndex]) {
        files[mainIndex].isMain = true
      } else if (files[0]) {
        files[0].isMain = true
      }
    }

    // Sort: main contract first, then by path
    return files.sort((a, b) => {
      if (a.isMain && !b.isMain) { return -1 }
      if (!a.isMain && b.isMain) { return 1 }
      return a.name.localeCompare(b.name)
    })
  } catch {
    // JSON parse failed, return empty
    return []
  }
}

/**
 * Parse source code into separate files if it contains multiple contracts
 * Supports:
 * 1. Standard JSON Input format (from forge verify-contract)
 * 2. Custom marker format (system contracts):
 *    // === Abstract Contracts ===
 *    // --- GovBase.sol ---
 *    ...
 *    // === Main Contract: NativeCoinAdapter ===
 * 3. Plain Solidity source code
 */
function parseSourceCodeFiles(sourceCode: string, contractName: string | null): { name: string; content: string; isMain: boolean }[] {
  if (!sourceCode) {
    return []
  }

  // 1. Check for Standard JSON Input format (from forge)
  if (isStandardJsonInput(sourceCode)) {
    const files = parseStandardJsonInput(sourceCode, contractName)
    if (files.length > 0) {
      return files
    }
    // If parsing failed, fall through to other methods
  }

  // 2. Check for custom marker format (system contracts)
  const hasAbstractMarker = sourceCode.includes('// === Abstract Contracts ===')
  const hasMainMarker = sourceCode.includes('// === Main Contract:')

  if (!hasAbstractMarker && !hasMainMarker) {
    // 3. Plain Solidity source code - single file
    return [{
      name: contractName ? `${contractName}.sol` : 'Contract.sol',
      content: sourceCode,
      isMain: true,
    }]
  }

  const files: { name: string; content: string; isMain: boolean }[] = []

  // Split by main contract marker first
  const mainContractMarkerRegex = /\/\/ === Main Contract: (\w+) ===/
  const mainMatch = sourceCode.match(mainContractMarkerRegex)

  if (mainMatch) {
    const mainContractIndex = sourceCode.indexOf(mainMatch[0])
    const abstractsSection = sourceCode.substring(0, mainContractIndex)
    const mainSection = sourceCode.substring(mainContractIndex + mainMatch[0].length).trim()

    // Parse main contract
    const mainContractName = mainMatch[1]
    files.push({
      name: `${mainContractName}.sol`,
      content: mainSection,
      isMain: true,
    })

    // Parse abstract contracts section
    const abstractFileRegex = /\/\/ --- ([\w/]+\.sol) ---\n([\s\S]*?)(?=\/\/ ---|\/\/ ===|$)/g
    let match = abstractFileRegex.exec(abstractsSection)
    while (match !== null) {
      const fileName = match[1] ?? 'Unknown.sol'
      const rawContent = match[2] ?? ''
      const content = rawContent.trim()
      if (content) {
        files.push({
          name: fileName,
          content,
          isMain: false,
        })
      }
      match = abstractFileRegex.exec(abstractsSection)
    }
  } else {
    // No main contract marker, treat as single file
    files.push({
      name: contractName ? `${contractName}.sol` : 'Contract.sol',
      content: sourceCode,
      isMain: true,
    })
  }

  // Sort: main contract first, then alphabetically
  return files.sort((a, b) => {
    if (a.isMain && !b.isMain) { return -1 }
    if (!a.isMain && b.isMain) { return 1 }
    return a.name.localeCompare(b.name)
  })
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
          <div className="flex flex-wrap border-b border-bg-tertiary bg-bg-secondary">
            {files.map((file, index) => {
              // Extract filename from path (e.g., "src/Contract.sol" -> "Contract.sol")
              const fileName = file.name.split('/').pop() ?? file.name
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(index)}
                  className={`px-4 py-2 text-xs font-mono transition-colors ${
                    index === selectedFile
                      ? 'bg-bg-primary text-accent-blue border-b-2 border-accent-blue'
                      : 'text-text-secondary hover:text-text-primary'
                  } ${file.isMain ? 'font-bold' : ''}`}
                  aria-selected={index === selectedFile}
                  role="tab"
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
