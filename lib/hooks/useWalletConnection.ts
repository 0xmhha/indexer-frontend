'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers, BrowserProvider } from 'ethers'

// ============================================================
// Types
// ============================================================

interface WindowWithEthereum extends Window {
  ethereum?: ethers.Eip1193Provider
}

export interface WalletState {
  isConnected: boolean
  address: string
  provider: BrowserProvider | null
}

export interface UseWalletConnectionResult {
  walletState: WalletState
  connect: () => Promise<void>
  disconnect: () => void
  getSigner: () => Promise<ethers.Signer | null>
}

// ============================================================
// Helper Functions
// ============================================================

function getEthereumProvider(): ethers.Eip1193Provider | null {
  if (typeof window === 'undefined') return null
  const windowWithEth = window as WindowWithEthereum
  return windowWithEth.ethereum ?? null
}

// ============================================================
// Hook
// ============================================================

/**
 * Custom hook for wallet connection management
 */
export function useWalletConnection(): UseWalletConnectionResult {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: '',
    provider: null,
  })

  // Check existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereumProvider()
      if (!ethereum) return

      try {
        const provider = new BrowserProvider(ethereum)
        const accounts = await provider.listAccounts()
        const firstAccount = accounts[0]

        if (firstAccount) {
          const address = await firstAccount.getAddress()
          setWalletState({
            isConnected: true,
            address,
            provider,
          })
        }
      } catch {
        // Wallet not connected - silently ignore
      }
    }

    checkConnection()
  }, [])

  const connect = useCallback(async () => {
    const ethereum = getEthereumProvider()
    if (!ethereum) {
      alert('Please install MetaMask or another Web3 wallet to use write functions')
      return
    }

    try {
      const provider = new BrowserProvider(ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setWalletState({
        isConnected: true,
        address,
        provider,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      alert(`Error: ${errorMessage}`)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: '',
      provider: null,
    })
  }, [])

  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    const ethereum = getEthereumProvider()
    if (!ethereum) return null

    try {
      const provider = new BrowserProvider(ethereum)
      return await provider.getSigner()
    } catch {
      return null
    }
  }, [])

  return {
    walletState,
    connect,
    disconnect,
    getSigner,
  }
}
