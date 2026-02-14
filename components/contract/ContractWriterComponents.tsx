'use client'

import { useConnect, useDisconnect } from 'wagmi'
import { injected } from '@wagmi/connectors'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { AbiFunction, AbiInput } from '@/types/contract'

// ============================================================
// Types
// ============================================================

export interface TransactionResult {
  hash: string
  loading: boolean
  success: boolean | null
  error: string | null
  gasEstimate: string | null
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get placeholder text for input based on type
 */
export function getPlaceholder(type: string): string {
  if (type === 'address') { return '0x...' }
  if (type.includes('uint') || type.includes('int')) { return '0' }
  if (type === 'bool' || type === 'boolean') { return 'true or false' }
  if (type === 'string') { return 'Enter string' }
  if (type.includes('bytes')) { return '0x...' }
  if (type.includes('[]')) { return '[value1, value2, ...]' }
  return `Enter ${type}`
}

const ADDRESS_HEX_LENGTH = 42
const HEX_PREFIX_LENGTH = 2

function validateNumericInput(value: string, type: string): string | null {
  if (!/^-?\d+$/.test(value)) { return 'Must be an integer' }
  if (type.includes('uint') && value.startsWith('-')) { return 'Unsigned integer cannot be negative' }
  return null
}

function validateBytesInput(value: string, type: string): string | null {
  if (!/^0x[0-9a-fA-F]*$/i.test(value)) { return 'Must be hex (0x...)' }

  // Fixed-size bytes (bytes1..bytes32)
  if (/^bytes\d+$/.test(type)) {
    const byteSize = parseInt(type.replace('bytes', ''), 10)
    const expectedHexLen = HEX_PREFIX_LENGTH + byteSize * 2
    if (value.length !== expectedHexLen) {
      return `Expected ${expectedHexLen} chars for ${type} (got ${value.length})`
    }
  } else if (value.length % 2 !== 0) {
    return 'Hex must have even length'
  }

  return null
}

function validateCompositeInput(value: string, type: string): string | null {
  if (type.includes('[]')) {
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) { return 'Must be a JSON array' }
    } catch {
      if (!value.includes(',') && !value.startsWith('[')) {
        return 'Must be a JSON array or comma-separated values'
      }
    }
    return null
  }

  if (type === 'tuple' || type.startsWith('tuple')) {
    try { JSON.parse(value) } catch { return 'Must be valid JSON for tuple type' }
    return null
  }

  return null
}

/**
 * Validate an ABI input value based on its Solidity type.
 * Returns null if valid, or an error message string.
 */
export function validateAbiInput(value: string, type: string): string | null {
  if (!value) { return null }

  if (type === 'address') {
    return /^0x[0-9a-fA-F]{40}$/i.test(value) ? null : `Must be a ${ADDRESS_HEX_LENGTH}-char hex address (0x...)`
  }

  if (type === 'bool' || type === 'boolean') {
    return value === 'true' || value === 'false' ? null : 'Must be "true" or "false"'
  }

  if (type.includes('uint') || type.includes('int')) {
    return validateNumericInput(value, type)
  }

  if (type.includes('bytes')) {
    return validateBytesInput(value, type)
  }

  if (type.includes('[]') || type.startsWith('tuple')) {
    return validateCompositeInput(value, type)
  }

  return null
}


// ============================================================
// Wallet Connection Card
// ============================================================

interface WalletConnectionCardProps {
  isConnected: boolean
  address: string
}

export function WalletConnectionCard({
  isConnected,
  address,
}: WalletConnectionCardProps) {
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>WALLET CONNECTION</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!isConnected ? (
          <div className="space-y-4">
            <p className="font-mono text-xs text-text-secondary">
              Connect your wallet to write to the contract
            </p>
            <Button onClick={() => connect({ connector: injected() })}>CONNECT WALLET</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="annotation">CONNECTED ADDRESS</div>
            <div className="break-all font-mono text-sm text-accent-blue">{address}</div>
            <Button onClick={() => disconnect()}>DISCONNECT</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Function Input Field
// ============================================================

interface FunctionInputFieldProps {
  input: AbiInput
  index: number
  disabled: boolean
  value: string
  onChange: (value: string) => void
}

export function FunctionInputField({ input, index, disabled, value, onChange }: FunctionInputFieldProps) {
  const validationError = value ? validateAbiInput(value, input.type) : null
  const inputId = `abi-input-${input.name || `param${index}`}`
  const errorId = `${inputId}-error`

  return (
    <div>
      <label htmlFor={inputId} className="annotation mb-1 block">
        {input.name || `param${index}`} ({input.type})
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder(input.type)}
        className={`w-full border bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:outline-none ${
          validationError ? 'border-error focus:border-error' : 'border-bg-tertiary focus:border-accent-blue'
        }`}
        disabled={disabled}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={validationError ? errorId : undefined}
      />
      {validationError && (
        <p id={errorId} className="mt-1 font-mono text-xs text-error" role="alert">{validationError}</p>
      )}
    </div>
  )
}

// ============================================================
// Value Input (for Payable)
// ============================================================

interface ValueInputProps {
  disabled: boolean
  value: string
  onChange: (value: string) => void
}

export function ValueInput({ disabled, value, onChange }: ValueInputProps) {
  return (
    <div>
      <label className="annotation mb-1 block">VALUE (ETH)</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.0"
        className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
        disabled={disabled}
      />
    </div>
  )
}

// ============================================================
// Transaction Result Display
// ============================================================

interface TransactionResultDisplayProps {
  result: TransactionResult
}

export function TransactionResultDisplay({ result }: TransactionResultDisplayProps) {
  if (!result.hash) {return null}

  return (
    <div className="border-t border-bg-tertiary pt-4">
      <div className="annotation mb-2">TRANSACTION</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-secondary">Hash:</span>
          <a
            href={`/tx/${result.hash}`}
            className="break-all font-mono text-xs text-accent-blue hover:text-accent-cyan"
            target="_blank"
            rel="noopener noreferrer"
          >
            {result.hash}
          </a>
        </div>
        {result.success !== null && (
          <div className={`font-mono text-xs ${result.success ? 'text-success' : 'text-error'}`}>
            {result.success ? '✓ Success' : '✗ Failed'}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Error Display
// ============================================================

interface ErrorDisplayProps {
  error: string
}

export function TransactionErrorDisplay({ error, onRetry }: ErrorDisplayProps & { onRetry?: () => void }) {
  return (
    <div className="border-t border-bg-tertiary pt-4">
      <div className="annotation mb-2">ERROR</div>
      <div className="rounded border border-error bg-error/10 p-4">
        <p className="font-mono text-xs text-error">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 border border-error px-3 py-1 font-mono text-xs text-error transition-colors hover:bg-error hover:text-white"
          >
            RETRY
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Write Function Card
// ============================================================

interface WriteFunctionCardProps {
  func: AbiFunction
  index: number
  latestTx: TransactionResult | undefined
  onWrite: () => void
  inputValues: string[]
  onInputChange: (inputIndex: number, value: string) => void
  payableValue: string
  onPayableValueChange: (value: string) => void
}

export function WriteFunctionCard({ func, index, latestTx, onWrite, inputValues, onInputChange, payableValue, onPayableValueChange }: WriteFunctionCardProps) {
  const funcName = func.name || `function-${index}`
  const isLoading = latestTx?.loading ?? false

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm">{funcName}</CardTitle>
          {func.stateMutability === 'payable' && (
            <span className="font-mono text-xs text-accent-orange">PAYABLE</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Function Inputs */}
        {func.inputs.length > 0 && (
          <div className="space-y-3">
            {func.inputs.map((input, inputIndex) => (
              <FunctionInputField
                key={inputIndex}
                input={input}
                index={inputIndex}
                disabled={isLoading}
                value={inputValues[inputIndex] ?? ''}
                onChange={(value) => onInputChange(inputIndex, value)}
              />
            ))}
          </div>
        )}

        {/* Payable Amount */}
        {func.stateMutability === 'payable' && (
          <ValueInput disabled={isLoading} value={payableValue} onChange={onPayableValueChange} />
        )}

        {/* Write Button */}
        <Button onClick={onWrite} disabled={isLoading}>
          {isLoading ? 'PROCESSING...' : 'WRITE'}
        </Button>

        {/* Gas Estimate */}
        {latestTx?.gasEstimate && (
          <div className="border-t border-bg-tertiary pt-4">
            <div className="annotation mb-1">ESTIMATED GAS</div>
            <div className="font-mono text-xs text-text-secondary">{latestTx.gasEstimate} units</div>
          </div>
        )}

        {/* Transaction Result */}
        {latestTx && <TransactionResultDisplay result={latestTx} />}

        {/* Error with Retry */}
        {latestTx?.error && <TransactionErrorDisplay error={latestTx.error} onRetry={onWrite} />}

        {/* Warning */}
        <div className="border-t border-bg-tertiary pt-4">
          <p className="font-mono text-xs text-accent-orange">
            ⚠ This will execute a transaction and consume gas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Empty States
// ============================================================

export function NoWriteFunctionsCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="font-mono text-xs text-text-muted">
          No write functions found in contract ABI
        </p>
      </CardContent>
    </Card>
  )
}

export function ConnectWalletPromptCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="font-mono text-xs text-text-muted">
          Connect your wallet to interact with write functions
        </p>
      </CardContent>
    </Card>
  )
}
