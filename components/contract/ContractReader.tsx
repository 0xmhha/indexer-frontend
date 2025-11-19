'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/config/env'
import type { ContractABI, AbiFunction } from '@/types/contract'

interface ContractReaderProps {
  contractAddress: string
  abi: ContractABI
}

interface FunctionCall {
  name: string
  inputs: string[]
  result: string | null
  loading: boolean
  error: string | null
}

export function ContractReader({ contractAddress, abi }: ContractReaderProps) {
  const [functionCalls, setFunctionCalls] = useState<Record<string, FunctionCall>>({})

  // Filter read-only functions from ABI
  const readFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      (item.stateMutability === 'view' || item.stateMutability === 'pure')
  ) as AbiFunction[]

  const handleCallFunction = async (func: AbiFunction) => {
    const functionName = func.name || 'unknown'
    setFunctionCalls((prev) => ({
      ...prev,
      [functionName]: {
        name: functionName,
        inputs: prev[functionName]?.inputs || [],
        result: prev[functionName]?.result || null,
        loading: true,
        error: null,
      },
    }))

    try {
      // Get input values
      const inputs = func.inputs.map((_input, index: number) => {
        const inputElement = document.getElementById(
          `input-${functionName}-${index}`
        ) as HTMLInputElement
        return inputElement?.value || ''
      })

      // Create provider and contract instance
      const provider = new ethers.JsonRpcProvider(env.jsonRpcEndpoint)
      const contract = new ethers.Contract(contractAddress, abi, provider)

      // Call the function
      const contractFunction = contract[functionName]
      if (typeof contractFunction !== 'function') {
        throw new Error(`Function ${functionName} not found in contract`)
      }
      const result = await contractFunction(...inputs)

      // Format result based on output type
      let formattedResult: string
      if (func.outputs && func.outputs.length > 0) {
        if (func.outputs.length === 1) {
          const outputType = func.outputs[0]?.type ?? 'unknown'
          formattedResult = formatOutput(result, outputType)
        } else {
          // Multiple outputs
          formattedResult = func.outputs
            .map((output, i) => {
              const value = Array.isArray(result) ? result[i] : result[output.name ?? i]
              return `${output.name || `output${i}`}: ${formatOutput(value, output.type)}`
            })
            .join('\n')
        }
      } else {
        formattedResult = String(result)
      }

      setFunctionCalls((prev) => ({
        ...prev,
        [functionName]: {
          name: functionName,
          inputs,
          result: formattedResult,
          loading: false,
          error: null,
        },
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to call function'
      setFunctionCalls((prev) => ({
        ...prev,
        [functionName]: {
          name: functionName,
          inputs: [],
          result: null,
          loading: false,
          error: errorMessage,
        },
      }))
    }
  }

  if (readFunctions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="font-mono text-xs text-text-muted">
            No read functions found in contract ABI
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {readFunctions.map((func: AbiFunction, index: number) => {
        const funcName = func.name || `function-${index}`
        const call = functionCalls[funcName]
        return (
          <Card key={`${funcName}-${index}`}>
            <CardHeader className="border-b border-bg-tertiary">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm">{funcName}</CardTitle>
                {func.outputs && func.outputs.length > 0 && (
                  <span className="font-mono text-xs text-text-muted">
                    → {func.outputs.map((o) => o.type).join(', ')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Function Inputs */}
              {func.inputs.length > 0 && (
                <div className="space-y-3">
                  {func.inputs.map((input, inputIndex: number) => (
                    <div key={inputIndex}>
                      <label className="annotation mb-1 block">
                        {input.name || `param${inputIndex}`} ({input.type})
                      </label>
                      <input
                        id={`input-${funcName}-${inputIndex}`}
                        type="text"
                        placeholder={getPlaceholder(input.type)}
                        className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Call Button */}
              <Button
                onClick={() => handleCallFunction(func)}
                disabled={call?.loading}
              >
                {call?.loading ? 'CALLING...' : 'QUERY'}
              </Button>

              {/* Result */}
              {call && call.result !== null && (
                <div className="border-t border-bg-tertiary pt-4">
                  <div className="annotation mb-2">RESULT</div>
                  <div className="rounded border border-accent-blue bg-accent-blue/10 p-4">
                    <pre className="font-mono text-xs text-accent-blue overflow-x-auto whitespace-pre-wrap break-all">
                      {call.result}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error */}
              {call?.error && (
                <div className="border-t border-bg-tertiary pt-4">
                  <div className="annotation mb-2">ERROR</div>
                  <div className="rounded border border-error bg-error/10 p-4">
                    <p className="font-mono text-xs text-error">{call.error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/**
 * Format output value based on type
 */
function formatOutput(value: unknown, type: string): string {
  try {
    // Handle BigInt types
    if (type.includes('uint') || type.includes('int')) {
      return typeof value === 'bigint' ? value.toString() : String(value)
    }

    // Handle address
    if (type === 'address') {
      return String(value)
    }

    // Handle bool
    if (type === 'bool' || type === 'boolean') {
      return String(value)
    }

    // Handle bytes
    if (type.includes('bytes')) {
      return String(value)
    }

    // Handle string
    if (type === 'string') {
      return String(value)
    }

    // Handle arrays
    if (type.includes('[]')) {
      if (Array.isArray(value)) {
        return JSON.stringify(value, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v
        )
      }
    }

    // Default
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    )
  } catch {
    return String(value)
  }
}

/**
 * Get placeholder text for input based on type
 */
function getPlaceholder(type: string): string {
  if (type === 'address') {
    return '0x...'
  }
  if (type.includes('uint') || type.includes('int')) {
    return '0'
  }
  if (type === 'bool' || type === 'boolean') {
    return 'true or false'
  }
  if (type === 'string') {
    return 'Enter string'
  }
  if (type.includes('bytes')) {
    return '0x...'
  }
  if (type.includes('[]')) {
    return '[value1, value2, ...]'
  }
  return `Enter ${type}`
}
