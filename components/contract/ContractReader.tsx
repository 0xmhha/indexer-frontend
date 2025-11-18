'use client'

import { useState } from 'react'
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
  )

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

      // Call the contract function using JSON-RPC
      const response = await fetch(env.jsonRpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: contractAddress,
              data: encodeFunctionCall(func, inputs),
            },
            'latest',
          ],
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message || 'Failed to call function')
      }

      // Decode the result
      const result = decodeFunctionResult(func, data.result)

      setFunctionCalls((prev) => ({
        ...prev,
        [functionName]: {
          name: functionName,
          inputs,
          result,
          loading: false,
          error: null,
        },
      }))
    } catch (error) {
      setFunctionCalls((prev) => ({
        ...prev,
        [functionName]: {
          name: functionName,
          inputs: [],
          result: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to call function',
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
              <CardTitle className="font-mono text-sm">{funcName}</CardTitle>
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
                        placeholder={input.type}
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
                    <pre className="font-mono text-xs text-accent-blue overflow-x-auto">
                      {call.result}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error */}
              {call?.error && (
                <div className="border-t border-bg-tertiary pt-4">
                  <div className="annotation mb-2">ERROR</div>
                  <div className="font-mono text-xs text-error">{call.error}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Simple function encoding (for demonstration - in production use ethers.js or web3.js)
function encodeFunctionCall(func: AbiFunction, _inputs: string[]): string {
  // This is a simplified implementation
  // In production, use proper ABI encoding from ethers.js or web3.js
  const signature = `${func.name}(${func.inputs.map((i) => i.type).join(',')})`
  const hash = keccak256().slice(0, 10) // First 4 bytes

  // For now, just return the function selector
  // TODO: Properly encode parameters using ethers.js
  return hash + signature // Include signature for reference
}

function decodeFunctionResult(func: AbiFunction, data: string): string {
  // This is a simplified implementation
  // In production, use proper ABI decoding from ethers.js or web3.js

  if (!data || data === '0x') {
    return 'No data returned'
  }

  // Simple hex to decimal conversion for uint256
  if (func.outputs && func.outputs.length === 1 && func.outputs[0] && func.outputs[0].type === 'uint256') {
    try {
      const value = BigInt(data)
      return value.toString()
    } catch {
      return data
    }
  }

  // Return raw data for other types
  return data
}

// Simple keccak256 implementation (for demonstration)
function keccak256(): string {
  // This is a placeholder - in production, use proper keccak256 from ethers.js
  // For now, return a mock hash
  return '0x' + '00'.repeat(32)
}
