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
  const [inputValues, setInputValues] = useState<Record<string, string[]>>({})
  const [payableValues, setPayableValues] = useState<Record<string, string>>({})

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
        const inputs = inputValues[functionName] || func.inputs.map(() => '')

        let value: bigint | undefined
        if (func.stateMutability === 'payable') {
          const valueStr = payableValues[functionName] || '0'
          value = ethers.parseEther(valueStr)
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
    [walletState.isConnected, getSigner, contractAddress, abi, inputValues, payableValues]
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
