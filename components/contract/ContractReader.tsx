'use client'

import { useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CONTRACT_CALL } from '@/lib/graphql/queries/rpcProxy'
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

interface ContractCallResult {
  result: string | null
  rawResult: string
  decoded: boolean
}

interface ContractCallResponse {
  contractCall: ContractCallResult
}

export function ContractReader({ contractAddress, abi }: ContractReaderProps) {
  const [functionCalls, setFunctionCalls] = useState<Record<string, FunctionCall>>({})

  // Use Apollo Client's lazy query for on-demand contract calls
  const [executeCall] = useLazyQuery<ContractCallResponse>(CONTRACT_CALL, {
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Always fetch fresh data
  })

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

      // Convert inputs to appropriate types based on ABI
      const typedInputs = inputs.map((value, index) => {
        const inputType = func.inputs[index]?.type || 'string'
        return convertInputValue(value, inputType)
      })

      // Create minimal ABI for this function
      const functionAbi = [func]

      // Call the contract via backend RPC Proxy
      const { data, error } = await executeCall({
        variables: {
          address: contractAddress,
          method: functionName,
          params: typedInputs.length > 0 ? JSON.stringify(typedInputs) : undefined,
          abi: JSON.stringify(functionAbi),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data?.contractCall) {
        throw new Error('No response from contract call')
      }

      const { result, rawResult, decoded } = data.contractCall

      // Format result
      let formattedResult: string
      if (decoded && result) {
        // Parse decoded result
        try {
          const parsedResult = JSON.parse(result)
          formattedResult = formatDecodedResult(parsedResult, func.outputs)
        } catch {
          formattedResult = result
        }
      } else if (rawResult) {
        // Show raw hex result if not decoded
        formattedResult = `(raw) ${rawResult}`
      } else {
        formattedResult = 'No result returned'
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
 * Convert input value based on ABI type
 */
function convertInputValue(value: string, type: string): unknown {
  if (!value) {return value}

  // Boolean
  if (type === 'bool') {
    return value.toLowerCase() === 'true'
  }

  // Arrays
  if (type.includes('[]')) {
    try {
      return JSON.parse(value)
    } catch {
      // Try comma-separated values
      return value.split(',').map((v) => v.trim())
    }
  }

  // Numbers - keep as string for BigInt compatibility
  if (type.includes('uint') || type.includes('int')) {
    return value
  }

  // Address - keep as string
  if (type === 'address') {
    return value
  }

  // Bytes - keep as string
  if (type.includes('bytes')) {
    return value
  }

  return value
}

/**
 * Format decoded result based on output types
 */
function formatDecodedResult(result: unknown, outputs?: AbiFunction['outputs']): string {
  if (!outputs || outputs.length === 0) {
    return formatValue(result)
  }

  // Single output
  if (outputs.length === 1) {
    return formatValue(result)
  }

  // Multiple outputs
  if (Array.isArray(result)) {
    return outputs
      .map((output, i) => {
        const name = output.name || `output${i}`
        const value = result[i]
        return `${name}: ${formatValue(value)}`
      })
      .join('\n')
  }

  return formatValue(result)
}

/**
 * Format a single value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null'
  }

  if (typeof value === 'boolean') {
    return value.toString()
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    )
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    , 2)
  }

  return String(value)
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
