'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SourceFile {
  name: string
  content: string
}

interface SourceCodeViewerProps {
  address: string
  isVerified: boolean
}

// Mock source code - replace with actual API call when backend is ready
function useContractSourceCode(_address: string, isVerified: boolean): {
  files: SourceFile[]
  loading: boolean
  error: string | null
} {
  if (!isVerified) {
    return { files: [], loading: false, error: null }
  }

  // Mock data for demonstration
  const mockSourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable
 */
contract SimpleStorage {
    uint256 private value;

    event ValueChanged(uint256 newValue);

    /**
     * @dev Store value in variable
     * @param _value value to store
     */
    function store(uint256 _value) public {
        value = _value;
        emit ValueChanged(_value);
    }

    /**
     * @dev Return value
     * @return value of 'value'
     */
    function retrieve() public view returns (uint256) {
        return value;
    }
}`

  return {
    files: [
      { name: 'SimpleStorage.sol', content: mockSourceCode },
    ],
    loading: false,
    error: null,
  }
}

export function SourceCodeViewer({ address, isVerified }: SourceCodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState(0)
  const [copied, setCopied] = useState(false)
  const { files, loading, error } = useContractSourceCode(address, isVerified)

  if (!isVerified || files.length === 0) {
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
          <p className="text-sm text-error">Failed to load source code</p>
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
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  const lineCount = currentFile.content.split('\n').length

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>SOURCE CODE</span>
          <span className="text-xs font-normal text-text-muted">
            {files.length} file{files.length > 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* File Tabs */}
        {files.length > 1 && (
          <div className="flex border-b border-bg-tertiary bg-bg-secondary">
            {files.map((file, index) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(index)}
                className={`px-4 py-2 text-xs font-mono transition-colors ${
                  index === selectedFile
                    ? 'bg-bg-primary text-accent-blue border-b-2 border-accent-blue'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-selected={index === selectedFile}
                role="tab"
              >
                {file.name}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-bg-tertiary bg-bg-secondary px-4 py-2">
          <span className="text-xs text-text-muted">
            {currentFile.name} • {lineCount} lines
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

        {/* Code Display */}
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm leading-relaxed">
            <code className="font-mono text-text-primary">
              {currentFile.content.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="mr-4 select-none text-right text-text-muted" style={{ minWidth: '3ch' }}>
                    {index + 1}
                  </span>
                  <span className="flex-1 whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
