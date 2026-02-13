'use client'

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
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get placeholder text for input based on type
 */
export function getPlaceholder(type: string): string {
  if (type === 'address') {return '0x...'}
  if (type.includes('uint') || type.includes('int')) {return '0'}
  if (type === 'bool' || type === 'boolean') {return 'true or false'}
  if (type === 'string') {return 'Enter string'}
  if (type.includes('bytes')) {return '0x...'}
  if (type.includes('[]')) {return '[value1, value2, ...]'}
  return `Enter ${type}`
}

// ============================================================
// Wallet Connection Card
// ============================================================

interface WalletConnectionCardProps {
  isConnected: boolean
  address: string
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnectionCard({
  isConnected,
  address,
  onConnect,
  onDisconnect,
}: WalletConnectionCardProps) {
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
            <Button onClick={onConnect}>CONNECT WALLET</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="annotation">CONNECTED ADDRESS</div>
            <div className="break-all font-mono text-sm text-accent-blue">{address}</div>
            <Button onClick={onDisconnect}>DISCONNECT</Button>
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
  return (
    <div>
      <label className="annotation mb-1 block">
        {input.name || `param${index}`} ({input.type})
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder(input.type)}
        className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
        disabled={disabled}
      />
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

export function TransactionErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="border-t border-bg-tertiary pt-4">
      <div className="annotation mb-2">ERROR</div>
      <div className="rounded border border-error bg-error/10 p-4">
        <p className="font-mono text-xs text-error">{error}</p>
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

        {/* Transaction Result */}
        {latestTx && <TransactionResultDisplay result={latestTx} />}

        {/* Error */}
        {latestTx?.error && <TransactionErrorDisplay error={latestTx.error} />}

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
