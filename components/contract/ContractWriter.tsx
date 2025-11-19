'use client'

import { useState, useEffect } from 'react'
import { ethers, BrowserProvider } from 'ethers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ContractABI, AbiFunction } from '@/types/contract'

interface ContractWriterProps {
  contractAddress: string
  abi: ContractABI
}

interface WindowWithEthereum extends Window {
  ethereum?: ethers.Eip1193Provider
}

interface TransactionResult {
  hash: string
  loading: boolean
  success: boolean | null
  error: string | null
}

export function ContractWriter({ contractAddress, abi }: ContractWriterProps) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [transactions, setTransactions] = useState<Record<string, TransactionResult>>({})

  // Filter write functions from ABI
  const writeFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      item.stateMutability !== 'view' &&
      item.stateMutability !== 'pure'
  ) as AbiFunction[]

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      const windowWithEth = window as WindowWithEthereum
      if (typeof window !== 'undefined' && windowWithEth.ethereum) {
        try {
          const ethereum = windowWithEth.ethereum
          if (!ethereum) return
          const provider = new BrowserProvider(ethereum)
          const accounts = await provider.listAccounts()
          const firstAccount = accounts[0]
          if (firstAccount) {
            const address = await firstAccount.getAddress()
            setWalletAddress(address)
            setWalletConnected(true)
          }
        } catch (error) {
          // Not connected
          console.debug('Wallet not connected:', error)
        }
      }
    }

    checkConnection()
  }, [])

  const handleConnectWallet = async () => {
    const windowWithEth = window as WindowWithEthereum
    if (typeof window !== 'undefined' && windowWithEth.ethereum) {
      try {
        const provider = new BrowserProvider(windowWithEth.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setWalletAddress(address)
        setWalletConnected(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
        alert(`Error: ${errorMessage}`)
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet to use write functions')
    }
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress('')
  }

  const handleWriteFunction = async (func: AbiFunction) => {
    if (!walletConnected) {
      alert('Please connect your wallet first')
      return
    }

    const functionName = func.name || 'unknown'
    const txKey = `${functionName}-${Date.now()}`

    try {
      // Get input values
      const inputs = func.inputs.map((_input, index: number) => {
        const inputElement = document.getElementById(
          `write-input-${functionName}-${index}`
        ) as HTMLInputElement
        return inputElement?.value || ''
      })

      // Get value for payable functions
      let value: bigint | undefined
      if (func.stateMutability === 'payable') {
        const valueElement = document.getElementById(`value-${functionName}`) as HTMLInputElement
        const valueStr = valueElement?.value || '0'
        try {
          value = ethers.parseEther(valueStr)
        } catch {
          throw new Error('Invalid ETH value')
        }
      }

      // Create provider and signer
      const windowWithEth = window as WindowWithEthereum
      if (!windowWithEth.ethereum) {
        throw new Error('No Web3 provider found')
      }

      const provider = new BrowserProvider(windowWithEth.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      // Set initial transaction state
      setTransactions((prev) => ({
        ...prev,
        [txKey]: {
          hash: '',
          loading: true,
          success: null,
          error: null,
        },
      }))

      // Call the function with optional value
      const contractFunction = contract[functionName]
      if (typeof contractFunction !== 'function') {
        throw new Error(`Function ${functionName} not found in contract`)
      }
      const tx = await contractFunction(...inputs, value ? { value } : {})

      // Update with transaction hash
      setTransactions((prev) => ({
        ...prev,
        [txKey]: {
          hash: tx.hash,
          loading: true,
          success: null,
          error: null,
        },
      }))

      // Wait for transaction to be mined
      const receipt = await tx.wait()

      // Update with success
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
        [txKey]: {
          hash: '',
          loading: false,
          success: false,
          error: errorMessage,
        },
      }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Wallet Connection */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>WALLET CONNECTION</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!walletConnected ? (
            <div className="space-y-4">
              <p className="font-mono text-xs text-text-secondary">
                Connect your wallet to write to the contract
              </p>
              <Button onClick={handleConnectWallet}>CONNECT WALLET</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="annotation">CONNECTED ADDRESS</div>
              <div className="font-mono text-sm text-accent-blue break-all">{walletAddress}</div>
              <Button onClick={handleDisconnect}>DISCONNECT</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Write Functions */}
      {writeFunctions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="font-mono text-xs text-text-muted">
              No write functions found in contract ABI
            </p>
          </CardContent>
        </Card>
      ) : walletConnected ? (
        writeFunctions.map((func: AbiFunction, index: number) => {
          const funcName = func.name || `function-${index}`
          // Get latest transaction for this function
          const latestTx = Object.entries(transactions)
            .filter(([key]) => key.startsWith(funcName))
            .sort((a, b) => b[0].localeCompare(a[0]))[0]?.[1]

          return (
            <Card key={`${funcName}-${index}`}>
              <CardHeader className="border-b border-bg-tertiary">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm">{funcName}</CardTitle>
                  {func.stateMutability === 'payable' && (
                    <span className="font-mono text-xs text-accent-orange">PAYABLE</span>
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
                          id={`write-input-${funcName}-${inputIndex}`}
                          type="text"
                          placeholder={getPlaceholder(input.type)}
                          className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
                          disabled={latestTx?.loading}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Payable Amount */}
                {func.stateMutability === 'payable' && (
                  <div>
                    <label className="annotation mb-1 block">VALUE (ETH)</label>
                    <input
                      id={`value-${funcName}`}
                      type="text"
                      placeholder="0.0"
                      className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
                      disabled={latestTx?.loading}
                    />
                  </div>
                )}

                {/* Write Button */}
                <Button onClick={() => handleWriteFunction(func)} disabled={latestTx?.loading}>
                  {latestTx?.loading ? 'PROCESSING...' : 'WRITE'}
                </Button>

                {/* Transaction Result */}
                {latestTx && latestTx.hash && (
                  <div className="border-t border-bg-tertiary pt-4">
                    <div className="annotation mb-2">TRANSACTION</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-secondary">Hash:</span>
                        <a
                          href={`/tx/${latestTx.hash}`}
                          className="font-mono text-xs text-accent-blue hover:text-accent-cyan break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {latestTx.hash}
                        </a>
                      </div>
                      {latestTx.success !== null && (
                        <div
                          className={`font-mono text-xs ${latestTx.success ? 'text-success' : 'text-error'}`}
                        >
                          {latestTx.success ? '✓ Success' : '✗ Failed'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error */}
                {latestTx?.error && (
                  <div className="border-t border-bg-tertiary pt-4">
                    <div className="annotation mb-2">ERROR</div>
                    <div className="rounded border border-error bg-error/10 p-4">
                      <p className="font-mono text-xs text-error">{latestTx.error}</p>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="border-t border-bg-tertiary pt-4">
                  <p className="font-mono text-xs text-accent-orange">
                    ⚠ This will execute a transaction and consume gas
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="font-mono text-xs text-text-muted">
              Connect your wallet to interact with write functions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
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
