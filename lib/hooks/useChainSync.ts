'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useChainId, useSwitchChain, useAccount } from 'wagmi'
import { useNetworkStore, selectCurrentNetwork, selectCustomNetworks } from '@/stores/networkStore'
import { useNotifications } from '@/lib/contexts/NotificationContext'
import { getNetworkIdByChainId } from '@/config/chains.config'

// ============================================================================
// Types
// ============================================================================

export interface ChainSyncState {
  /** Whether the wallet chain differs from the app's selected network */
  isMismatched: boolean
  /** Whether a chain switch is currently in progress */
  isSwitching: boolean
  /** The wallet's current chain ID */
  walletChainId: number
  /** The app's desired chain ID */
  desiredChainId: number | null
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Synchronizes the wallet chain with the network store.
 *
 * - When the user changes network in the selector -> switches the wallet chain
 * - When the user changes chain in the wallet -> updates the network store
 * - Shows toast on chain switch failure (user rejection, unsupported chain)
 * - Supports both preset and custom networks
 * - Returns mismatch/switching state for UI indicators
 */
export function useChainSync(): ChainSyncState {
  const walletChainId = useChainId()
  const { switchChain, error: switchError, isError: isSwitchError, isPending: isSwitching } = useSwitchChain()
  const { isConnected } = useAccount()
  const currentNetwork = useNetworkStore(selectCurrentNetwork)
  const customNetworks = useNetworkStore(selectCustomNetworks)
  const selectNetwork = useNetworkStore((s) => s.selectNetwork)
  const { showError } = useNotifications()

  // Track last notified error to avoid duplicate toasts
  const lastErrorRef = useRef<string | null>(null)

  const desiredChainId = currentNetwork ? Number(currentNetwork.chain.id) : null

  // Network selector change -> switch wallet chain
  useEffect(() => {
    if (!isConnected || !currentNetwork) { return }

    if (desiredChainId !== null && walletChainId !== desiredChainId) {
      switchChain?.({ chainId: desiredChainId })
    }
  }, [currentNetwork?.chain.id, isConnected]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wallet chain change -> sync network store (preset + custom)
  useEffect(() => {
    if (!isConnected) { return }

    const networkId = getNetworkIdByChainId(walletChainId, customNetworks)
    if (networkId && networkId !== currentNetwork?.id) {
      selectNetwork(networkId)
    }
  }, [walletChainId, isConnected, customNetworks]) // eslint-disable-line react-hooks/exhaustive-deps

  // Chain switch error -> notify user
  useEffect(() => {
    if (!isSwitchError || !switchError) { return }

    const errorMsg = switchError.message
    // Avoid showing the same error repeatedly
    if (lastErrorRef.current === errorMsg) { return }
    lastErrorRef.current = errorMsg

    const isUserRejection = errorMsg.toLowerCase().includes('user rejected')
      || errorMsg.toLowerCase().includes('user denied')

    if (isUserRejection) {
      showError('Chain Switch Cancelled', 'You rejected the network switch request')
    } else {
      showError('Chain Switch Failed', 'Could not switch to the selected network. Please switch manually in your wallet.')
    }
  }, [isSwitchError, switchError, showError])

  // Reset error tracking when switch succeeds
  useEffect(() => {
    if (!isSwitchError) {
      lastErrorRef.current = null
    }
  }, [isSwitchError])

  return useMemo(() => ({
    isMismatched: isConnected && desiredChainId !== null && walletChainId !== desiredChainId,
    isSwitching,
    walletChainId,
    desiredChainId,
  }), [isConnected, walletChainId, desiredChainId, isSwitching])
}
