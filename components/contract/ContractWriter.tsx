'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ContractABI, AbiFunction } from '@/types/contract'

interface ContractWriterProps {
  contractAddress: string
  abi: ContractABI
}

interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  }
}

export function ContractWriter({ abi }: ContractWriterProps) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  // Filter write functions from ABI
  const writeFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      item.stateMutability !== 'view' &&
      item.stateMutability !== 'pure'
  )

  const handleConnectWallet = async () => {
    // Check if MetaMask is installed
    const windowWithEth = window as WindowWithEthereum
    if (typeof window !== 'undefined' && windowWithEth.ethereum) {
      try {
        const accounts = await windowWithEth.ethereum.request({
          method: 'eth_requestAccounts',
        })
        const firstAccount = (accounts as string[])[0]
        if (firstAccount) {
          setWalletAddress(firstAccount)
          setWalletConnected(true)
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask to use write functions')
    }
  }

  const handleWriteFunction = async (func: AbiFunction) => {
    if (!walletConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Get input values
      const inputs = func.inputs.map((_input, index: number) => {
        const inputElement = document.getElementById(
          `write-input-${func.name}-${index}`
        ) as HTMLInputElement
        return inputElement?.value || ''
      })

      // In production, use ethers.js or web3.js to properly encode and send transaction
      alert(
        `Write function execution requires wallet integration.\nFunction: ${func.name}\nInputs: ${inputs.join(', ')}\n\nThis is a placeholder - integrate with MetaMask/WalletConnect in production.`
      )
    } catch (error) {
      console.error('Failed to execute function:', error)
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
              <div className="font-mono text-sm text-accent-blue">{walletAddress}</div>
              <Button
                onClick={() => {
                  setWalletConnected(false)
                  setWalletAddress('')
                }}
              >
                DISCONNECT
              </Button>
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
          return (
            <Card key={`${funcName}-${index}`}>
              <CardHeader className="border-b border-bg-tertiary">
                <CardTitle className="font-mono text-sm">{funcName}</CardTitle>
                {func.stateMutability === 'payable' && (
                  <span className="font-mono text-xs text-accent-orange">PAYABLE</span>
                )}
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
                          placeholder={input.type}
                          className="w-full border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
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
                    />
                  </div>
                )}

                {/* Write Button */}
                <Button onClick={() => handleWriteFunction(func)}>WRITE</Button>

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
