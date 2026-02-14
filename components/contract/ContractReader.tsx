'use client'

import { useState } from 'react'
import { type Abi } from 'viem'
import { readContract } from '@wagmi/core'
import { wagmiConfig } from '@/lib/wagmi/config'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ContractABI, AbiFunction } from '@/types/contract'

// ============================================================
// Types
// ============================================================

interface ContractReaderProps {
  contractAddress: string
  abi: ContractABI
}

interface FunctionCall {
  name: string
  result: string | null
  loading: boolean
  error: string | null
}

// ============================================================
// Input Conversion
// ============================================================

function convertInputValue(value: string, type: string): unknown {
  if (!value) { return value }

  if (type === 'bool') {
    return value.toLowerCase() === 'true'
  }

  if (type.includes('[]')) {
    try {
      return JSON.parse(value)
    } catch {
      return value.split(',').map((v) => v.trim())
    }
  }

  return value
}

// ============================================================
// Result Formatting
// ============================================================

function formatValue(value: unknown): string {
  if (value === null || value === undefined) { return 'null' }
  if (typeof value === 'boolean') { return value.toString() }
  if (typeof value === 'string') { return value }
  if (typeof value === 'number' || typeof value === 'bigint') { return value.toString() }

  if (Array.isArray(value)) {
    return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)
  }

  return String(value)
}

function formatDecodedResult(result: unknown, outputs?: AbiFunction['outputs']): string {
  if (!outputs || outputs.length <= 1) {
    return formatValue(result)
  }

  if (Array.isArray(result)) {
    return outputs
      .map((output, i) => {
        const name = output.name || `output${i}`
        return `${name}: ${formatValue(result[i])}`
      })
      .join('\n')
  }

  return formatValue(result)
}

// ============================================================
// Placeholder
// ============================================================

function getPlaceholder(type: string): string {
  if (type === 'address') { return '0x...' }
  if (type.includes('uint') || type.includes('int')) { return '0' }
  if (type === 'bool' || type === 'boolean') { return 'true or false' }
  if (type === 'string') { return 'Enter string' }
  if (type.includes('bytes')) { return '0x...' }
  if (type.includes('[]')) { return '[value1, value2, ...]' }
  return `Enter ${type}`
}

// ============================================================
// Sub-Components
// ============================================================

function ReadFunctionInput({
  id,
  inputType,
  value,
  onValueChange,
}: {
  id?: string
  inputType: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={getPlaceholder(inputType)}
      className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
    />
  )
}

// ============================================================
// Main Component
// ============================================================

export function ContractReader({ contractAddress, abi }: ContractReaderProps) {
  const [functionCalls, setFunctionCalls] = useState<Record<string, FunctionCall>>({})
  const [inputValues, setInputValues] = useState<Record<string, string[]>>({})

  const readFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      (item.stateMutability === 'view' || item.stateMutability === 'pure')
  ) as AbiFunction[]

  const handleInputChange = (funcName: string, inputIndex: number, value: string, inputCount: number) => {
    setInputValues((prev) => {
      const current = prev[funcName] || Array.from({ length: inputCount }, () => '')
      const updated = [...current]
      updated[inputIndex] = value
      return { ...prev, [funcName]: updated }
    })
  }

  const handleCallFunction = async (func: AbiFunction) => {
    const functionName = func.name || 'unknown'
    setFunctionCalls((prev) => ({
      ...prev,
      [functionName]: {
        name: functionName,
        result: prev[functionName]?.result ?? null,
        loading: true,
        error: null,
      },
    }))

    try {
      const inputs = inputValues[functionName] || func.inputs.map(() => '')
      const typedInputs = inputs.map((value, index) => {
        const inputType = func.inputs[index]?.type || 'string'
        return convertInputValue(value, inputType)
      })

      // Direct RPC call via wagmi/viem public client
      const result = await readContract(wagmiConfig, {
        address: contractAddress as `0x${string}`,
        abi: abi as Abi,
        functionName,
        args: typedInputs.length > 0 ? typedInputs : undefined,
      })

      const formattedResult = formatDecodedResult(result, func.outputs)

      setFunctionCalls((prev) => ({
        ...prev,
        [functionName]: {
          name: functionName,
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
                  {func.inputs.map((input, inputIndex: number) => {
                    const inputId = `read-input-${funcName}-${input.name || `param${inputIndex}`}`
                    return (
                      <div key={inputIndex}>
                        <label htmlFor={inputId} className="annotation mb-1 block">
                          {input.name || `param${inputIndex}`} ({input.type})
                        </label>
                        <ReadFunctionInput
                          id={inputId}
                          inputType={input.type}
                          value={inputValues[funcName]?.[inputIndex] ?? ''}
                          onValueChange={(value) => handleInputChange(funcName, inputIndex, value, func.inputs.length)}
                        />
                      </div>
                    )
                  })}
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
