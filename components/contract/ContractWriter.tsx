'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { parseEther, type Abi } from 'viem'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { simulateContract } from '@wagmi/core'
import { wagmiConfig } from '@/lib/wagmi/config'
import { useNotifications } from '@/lib/contexts/NotificationContext'
import {
  WalletConnectionCard,
  WriteFunctionCard,
  NoWriteFunctionsCard,
  ConnectWalletPromptCard,
  type TransactionResult,
} from '@/components/contract/ContractWriterComponents'
import type { ContractABI, AbiFunction } from '@/types/contract'

// ============================================================
// Types
// ============================================================

interface ContractWriterProps {
  contractAddress: string
  abi: ContractABI
}

// ============================================================
// Error Classification
// ============================================================

interface ClassifiedError {
  title: string
  message: string
}

function classifyTransactionError(error: unknown): ClassifiedError {
  const raw = error instanceof Error ? error.message : String(error)
  const lower = raw.toLowerCase()

  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return { title: 'Transaction Rejected', message: 'You rejected the transaction in your wallet.' }
  }

  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
    return { title: 'Insufficient Funds', message: 'Your wallet does not have enough funds to cover the transaction and gas costs.' }
  }

  if (lower.includes('gas required exceeds') || lower.includes('out of gas') || lower.includes('intrinsic gas too low')) {
    return { title: 'Gas Limit Exceeded', message: 'The transaction requires more gas than the limit allows.' }
  }

  if (lower.includes('nonce too low') || lower.includes('nonce has already been used')) {
    return { title: 'Nonce Conflict', message: 'A transaction with this nonce was already submitted. Try again.' }
  }

  if (lower.includes('execution reverted')) {
    // Extract revert reason if available
    const reasonMatch = raw.match(/reason:\s*(.+?)(?:\n|$)/i)
      ?? raw.match(/reverted with reason string '(.+?)'/i)
      ?? raw.match(/execution reverted:\s*(.+?)(?:\n|$)/i)
    const reason = reasonMatch?.[1]?.trim()
    return {
      title: 'Contract Reverted',
      message: reason ? `The contract reverted: ${reason}` : 'The contract reverted the transaction. Check your inputs.',
    }
  }

  if (lower.includes('network') || lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('fetch failed')) {
    return { title: 'Network Error', message: 'Could not reach the network. Check your connection and try again.' }
  }

  // Truncate long error messages
  const MAX_ERROR_LENGTH = 200
  const truncated = raw.length > MAX_ERROR_LENGTH ? `${raw.slice(0, MAX_ERROR_LENGTH)}...` : raw
  return { title: 'Transaction Error', message: truncated }
}

// ============================================================
// Helper Functions
// ============================================================

function getWriteFunctions(abi: ContractABI): AbiFunction[] {
  return abi.filter(
    (item) =>
      item.type === 'function' &&
      item.stateMutability !== 'view' &&
      item.stateMutability !== 'pure'
  ) as AbiFunction[]
}

function getLatestTransaction(
  transactions: Record<string, TransactionResult>,
  funcName: string
): TransactionResult | undefined {
  return Object.entries(transactions)
    .filter(([key]) => key.startsWith(funcName))
    .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1]
}

// ============================================================
// Transaction Tracker Sub-Component
// ============================================================

function TransactionTracker({
  txHash,
  txKey,
  onResult,
}: {
  txHash: `0x${string}`
  txKey: string
  onResult: (key: string, result: TransactionResult) => void
}) {
  const { data: receipt, isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash })
  const { showSuccess, showError } = useNotifications()
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (notifiedRef.current) { return }

    if (isSuccess && receipt) {
      notifiedRef.current = true
      const success = receipt.status === 'success'
      onResult(txKey, {
        hash: txHash,
        loading: false,
        success,
        error: success ? null : 'Transaction reverted',
        gasEstimate: null,
      })
      if (success) {
        showSuccess('Transaction Confirmed', `Hash: ${txHash.slice(0, 10)}...`)
      } else {
        showError('Transaction Reverted', 'The transaction was mined but reverted')
      }
    }

    if (isError) {
      notifiedRef.current = true
      onResult(txKey, {
        hash: txHash,
        loading: false,
        success: false,
        error: 'Failed to confirm transaction',
        gasEstimate: null,
      })
      showError('Transaction Failed', 'Could not confirm the transaction')
    }
  }, [isSuccess, isError, receipt, txHash, txKey, onResult, showSuccess, showError])

  return null
}

// ============================================================
// Main Component
// ============================================================

export function ContractWriter({ contractAddress, abi }: ContractWriterProps) {
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { showWarning, showError, showInfo } = useNotifications()
  const [transactions, setTransactions] = useState<Record<string, TransactionResult>>({})
  const [inputValues, setInputValues] = useState<Record<string, string[]>>({})
  const [payableValues, setPayableValues] = useState<Record<string, string>>({})
  const [pendingTxs, setPendingTxs] = useState<{ key: string; hash: `0x${string}` }[]>([])

  const writeFunctions = getWriteFunctions(abi)

  const handleTxResult = useCallback((key: string, result: TransactionResult) => {
    setTransactions((prev) => {
      if (prev[key] && !prev[key].loading) { return prev }
      return { ...prev, [key]: result }
    })
    setPendingTxs((prev) => prev.filter((tx) => tx.key !== key))
  }, [])

  const handleWriteFunction = useCallback(
    async (func: AbiFunction) => {
      if (!isConnected) {
        showWarning('Wallet Not Connected', 'Please connect your wallet first')
        return
      }

      const functionName = func.name || 'unknown'
      const txKey = `${functionName}-${Date.now()}`

      try {
        const inputs = inputValues[functionName] || func.inputs.map(() => '')

        let value: bigint | undefined
        if (func.stateMutability === 'payable') {
          const valueStr = payableValues[functionName] || '0'
          value = parseEther(valueStr)
        }

        const contractCallParams = {
          address: contractAddress as `0x${string}`,
          abi: abi as Abi,
          functionName,
          args: inputs,
          value,
        }

        // Pre-flight simulation to catch reverts before sending
        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash: '', loading: true, success: null, error: null, gasEstimate: null },
        }))

        let gasEstimate: string | null = null
        try {
          const simulation = await simulateContract(wagmiConfig, contractCallParams)
          gasEstimate = simulation.request.gas?.toString() ?? null
        } catch (simError) {
          const classified = classifyTransactionError(simError)
          setTransactions((prev) => ({
            ...prev,
            [txKey]: { hash: '', loading: false, success: false, error: classified.message, gasEstimate: null },
          }))
          showError(`Simulation: ${classified.title}`, classified.message)
          return
        }

        // Simulation passed — send the actual transaction
        const hash = await writeContractAsync(contractCallParams)

        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash, loading: true, success: null, error: null, gasEstimate },
        }))

        setPendingTxs((prev) => [...prev, { key: txKey, hash }])
        showInfo('Transaction Submitted', `Waiting for confirmation...`)
      } catch (error) {
        const classified = classifyTransactionError(error)
        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash: '', loading: false, success: false, error: classified.message, gasEstimate: null },
        }))
        showError(classified.title, classified.message)
      }
    },
    [isConnected, writeContractAsync, contractAddress, abi, inputValues, payableValues, showWarning, showError, showInfo]
  )

  return (
    <div className="space-y-4">
      {pendingTxs.map((tx) => (
        <TransactionTracker key={tx.key} txHash={tx.hash} txKey={tx.key} onResult={handleTxResult} />
      ))}

      <WalletConnectionCard
        isConnected={isConnected}
        address={address ?? ''}
      />

      {writeFunctions.length === 0 ? (
        <NoWriteFunctionsCard />
      ) : isConnected ? (
        writeFunctions.map((func, index) => {
          const funcName = func.name || `function-${index}`
          const latestTx = getLatestTransaction(transactions, funcName)

          return (
            <WriteFunctionCard
              key={`${funcName}-${index}`}
              func={func}
              index={index}
              latestTx={latestTx}
              onWrite={() => handleWriteFunction(func)}
              inputValues={inputValues[funcName] || []}
              onInputChange={(inputIndex, value) => {
                setInputValues((prev) => {
                  const current = prev[funcName] || func.inputs.map(() => '')
                  const updated = [...current]
                  updated[inputIndex] = value
                  return { ...prev, [funcName]: updated }
                })
              }}
              payableValue={payableValues[funcName] || ''}
              onPayableValueChange={(value) => {
                setPayableValues((prev) => ({ ...prev, [funcName]: value }))
              }}
            />
          )
        })
      ) : (
        <ConnectWalletPromptCard />
      )}
    </div>
  )
}
