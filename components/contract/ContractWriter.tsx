'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWalletConnection } from '@/lib/hooks/useWalletConnection'
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
// Helper Functions
// ============================================================

/**
 * Filter write functions from ABI
 */
function getWriteFunctions(abi: ContractABI): AbiFunction[] {
  return abi.filter(
    (item) =>
      item.type === 'function' &&
      item.stateMutability !== 'view' &&
      item.stateMutability !== 'pure'
  ) as AbiFunction[]
}

/**
 * Get input values from DOM
 */
function getInputValues(funcName: string, inputs: { name?: string; type: string }[]): string[] {
  return inputs.map((_, index) => {
    const inputElement = document.getElementById(
      `write-input-${funcName}-${index}`
    ) as HTMLInputElement
    return inputElement?.value || ''
  })
}

/**
 * Get ETH value for payable functions
 */
function getPayableValue(funcName: string): bigint {
  const valueElement = document.getElementById(`value-${funcName}`) as HTMLInputElement
  const valueStr = valueElement?.value || '0'
  return ethers.parseEther(valueStr)
}

/**
 * Get latest transaction for a function
 */
function getLatestTransaction(
  transactions: Record<string, TransactionResult>,
  funcName: string
): TransactionResult | undefined {
  return Object.entries(transactions)
    .filter(([key]) => key.startsWith(funcName))
    .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1]
}

// ============================================================
// Main Component
// ============================================================

export function ContractWriter({ contractAddress, abi }: ContractWriterProps) {
  const { walletState, connect, disconnect, getSigner } = useWalletConnection()
  const [transactions, setTransactions] = useState<Record<string, TransactionResult>>({})

  const writeFunctions = getWriteFunctions(abi)

  const handleWriteFunction = useCallback(
    async (func: AbiFunction) => {
      if (!walletState.isConnected) {
        alert('Please connect your wallet first')
        return
      }

      const functionName = func.name || 'unknown'
      const txKey = `${functionName}-${Date.now()}`

      try {
        const inputs = getInputValues(functionName, func.inputs)

        let value: bigint | undefined
        if (func.stateMutability === 'payable') {
          value = getPayableValue(functionName)
        }

        const signer = await getSigner()
        if (!signer) {throw new Error('No Web3 provider found')}

        const contract = new ethers.Contract(contractAddress, abi, signer)

        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash: '', loading: true, success: null, error: null },
        }))

        const contractFunction = contract[functionName]
        if (typeof contractFunction !== 'function') {
          throw new Error(`Function ${functionName} not found in contract`)
        }

        const tx = await contractFunction(...inputs, value ? { value } : {})

        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash: tx.hash, loading: true, success: null, error: null },
        }))

        const receipt = await tx.wait()

        setTransactions((prev) => ({
          ...prev,
          [txKey]: {
            hash: receipt.hash,
            loading: false,
            success: receipt.status === 1,
            error: receipt.status === 1 ? null : 'Transaction failed',
          },
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
        setTransactions((prev) => ({
          ...prev,
          [txKey]: { hash: '', loading: false, success: false, error: errorMessage },
        }))
      }
    },
    [walletState.isConnected, getSigner, contractAddress, abi]
  )

  return (
    <div className="space-y-4">
      <WalletConnectionCard
        isConnected={walletState.isConnected}
        address={walletState.address}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      {writeFunctions.length === 0 ? (
        <NoWriteFunctionsCard />
      ) : walletState.isConnected ? (
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
            />
          )
        })
      ) : (
        <ConnectWalletPromptCard />
      )}
    </div>
  )
}
