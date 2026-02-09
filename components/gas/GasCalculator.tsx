'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  calculateEffectiveGasPrice,
  calculateTxCost,
  calculateRefund,
  calculatePriorityFee,
  gweiToWei,
  weiToGwei,
} from '@/lib/utils/gas'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { useGasTracker } from '@/lib/hooks/useGasTracker'
import { cn } from '@/lib/utils'

/**
 * Common transaction type presets with typical gas limits
 */
const TX_PRESETS = [
  { id: 'transfer', label: 'Transfer', gasLimit: 21000, icon: '💸', description: 'Simple native token transfer' },
  { id: 'erc20', label: 'ERC20 Transfer', gasLimit: 65000, icon: '🪙', description: 'Token transfer' },
  { id: 'swap', label: 'DEX Swap', gasLimit: 150000, icon: '🔄', description: 'Decentralized exchange swap' },
  { id: 'nft', label: 'NFT Mint', gasLimit: 120000, icon: '🎨', description: 'Mint NFT token' },
  { id: 'deploy', label: 'Contract Deploy', gasLimit: 500000, icon: '📜', description: 'Deploy smart contract' },
  { id: 'custom', label: 'Custom', gasLimit: 21000, icon: '⚙️', description: 'Custom gas limit' },
] as const

type TxPresetId = typeof TX_PRESETS[number]['id']

interface GasCalculatorProps {
  defaultGasLimit?: number
  defaultBaseFee?: number
  defaultPriorityFee?: number
  className?: string
}

/**
 * EIP-1559 Gas Calculator
 *
 * Interactive calculator for estimating transaction costs using EIP-1559 fee mechanism.
 * Allows users to input gas parameters and see real-time cost estimates.
 *
 * @param defaultGasLimit - Default gas limit (default: 21000 for simple transfer)
 * @param defaultBaseFee - Default base fee in Gwei (default: 25)
 * @param defaultPriorityFee - Default priority fee in Gwei (default: 2)
 * @param className - Additional CSS classes
 */
export function GasCalculator({
  defaultGasLimit = 21000,
  defaultBaseFee = 25,
  defaultPriorityFee = 2,
  className,
}: GasCalculatorProps) {
  // Get real-time gas data from network
  const { metrics } = useGasTracker({ blockCount: 10, enableSubscription: true })

  // Selected transaction preset
  const [selectedPreset, setSelectedPreset] = useState<TxPresetId>('transfer')

  // Input values (in Gwei for user convenience)
  const [gasLimit, setGasLimit] = useState<number>(defaultGasLimit)
  const [baseFeeGwei, setBaseFeeGwei] = useState<number>(defaultBaseFee)
  const [priorityFeeGwei, setPriorityFeeGwei] = useState<number>(defaultPriorityFee)
  const [maxFeeGwei, setMaxFeeGwei] = useState<number>(defaultBaseFee + defaultPriorityFee + 10)

  // Sync with real-time network data when available
  useEffect(() => {
    if (metrics?.baseFeeGwei) {
      setBaseFeeGwei(Number(metrics.baseFeeGwei.toFixed(2)))
      // Find standard tier priority fee
      const standardLevel = metrics.priceLevels.find(l => l.tier === 'standard')
      if (standardLevel) {
        const priorityGwei = weiToGwei(standardLevel.maxPriorityFee)
        setPriorityFeeGwei(Number(priorityGwei.toFixed(2)))
        setMaxFeeGwei(Number((metrics.baseFeeGwei + priorityGwei + 10).toFixed(2)))
      }
    }
  }, [metrics?.baseFeeGwei, metrics?.priceLevels])

  // Handle preset selection
  const handlePresetSelect = (presetId: TxPresetId) => {
    setSelectedPreset(presetId)
    const preset = TX_PRESETS.find(p => p.id === presetId)
    if (preset && presetId !== 'custom') {
      setGasLimit(preset.gasLimit)
    }
  }

  // Get network comparison data
  const networkComparison = useMemo(() => {
    if (!metrics) return null

    const economyLevel = metrics.priceLevels.find(l => l.tier === 'economy')
    const standardLevel = metrics.priceLevels.find(l => l.tier === 'standard')
    const priorityLevel = metrics.priceLevels.find(l => l.tier === 'priority')

    return {
      economy: economyLevel ? weiToGwei(economyLevel.maxPriorityFee) : 1,
      standard: standardLevel ? weiToGwei(standardLevel.maxPriorityFee) : 2,
      priority: priorityLevel ? weiToGwei(priorityLevel.maxPriorityFee) : 3,
      utilization: metrics.networkUtilization,
    }
  }, [metrics])

  // Calculated values
  const [effectiveGasPrice, setEffectiveGasPrice] = useState<bigint>(BigInt(0))
  const [totalCost, setTotalCost] = useState<bigint>(BigInt(0))
  const [maxCost, setMaxCost] = useState<bigint>(BigInt(0))
  const [refund, setRefund] = useState<bigint>(BigInt(0))
  const [priorityFee, setPriorityFee] = useState<bigint>(BigInt(0))

  // Recalculate when inputs change
  useEffect(() => {
    // Convert Gwei to Wei
    const baseFeeWei = gweiToWei(baseFeeGwei)
    const maxFeeWei = gweiToWei(maxFeeGwei)
    const priorityFeeWei = gweiToWei(priorityFeeGwei)
    const gasLimitBigInt = BigInt(gasLimit)

    // Calculate effective gas price
    const effective = calculateEffectiveGasPrice(baseFeeWei, maxFeeWei, priorityFeeWei)
    setEffectiveGasPrice(effective)

    // Calculate total cost with effective gas price
    const total = calculateTxCost(gasLimitBigInt, effective)
    setTotalCost(total)

    // Calculate maximum possible cost
    const max = calculateTxCost(gasLimitBigInt, maxFeeWei)
    setMaxCost(max)

    // Calculate refund
    const refundAmount = calculateRefund(maxFeeWei, effective, gasLimitBigInt)
    setRefund(refundAmount)

    // Calculate priority fee
    const priority = calculatePriorityFee(effective, baseFeeWei, gasLimitBigInt)
    setPriorityFee(priority)
  }, [gasLimit, baseFeeGwei, priorityFeeGwei, maxFeeGwei])

  // Auto-adjust max fee when base fee or priority fee changes
  const handleBaseFeeChange = (value: number) => {
    setBaseFeeGwei(value)
    // Suggest max fee as base + priority + 10 Gwei buffer
    setMaxFeeGwei(value + priorityFeeGwei + 10)
  }

  const handlePriorityFeeChange = (value: number) => {
    setPriorityFeeGwei(value)
    // Suggest max fee as base + priority + 10 Gwei buffer
    setMaxFeeGwei(baseFeeGwei + value + 10)
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>EIP-1559 GAS CALCULATOR</span>
          <div className="flex items-center gap-2">
            {metrics && (
              <span className="flex items-center gap-1 rounded bg-accent-green/20 px-2 py-0.5 text-xs text-accent-green">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
                </span>
                LIVE
              </span>
            )}
            <span className="font-mono text-xs text-text-secondary">ESTIMATE TRANSACTION COSTS</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Transaction Type Presets */}
        <div className="mb-6">
          <div className="annotation mb-3">TRANSACTION TYPE</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TX_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  'flex flex-col items-center rounded border p-2 transition-colors',
                  selectedPreset === preset.id
                    ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                    : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue/50'
                )}
                title={preset.description}
              >
                <span className="text-lg">{preset.icon}</span>
                <span className="mt-1 font-mono text-[10px]">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Network Status */}
        {networkComparison && (
          <div className="mb-6 rounded border border-bg-tertiary bg-bg-secondary/50 p-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-text-muted">Network Priority Fees (Gwei)</div>
              <div className="font-mono text-xs text-text-muted">
                Utilization: <span className={cn(
                  networkComparison.utilization > 80 ? 'text-accent-red' :
                  networkComparison.utilization > 50 ? 'text-accent-yellow' : 'text-accent-green'
                )}>{networkComparison.utilization}%</span>
              </div>
            </div>
            <div className="mt-2 flex gap-4">
              <button
                onClick={() => setPriorityFeeGwei(Number(networkComparison.economy.toFixed(2)))}
                className="flex-1 rounded bg-accent-green/10 p-2 text-center font-mono text-xs text-accent-green hover:bg-accent-green/20"
              >
                Economy: {networkComparison.economy.toFixed(2)}
              </button>
              <button
                onClick={() => setPriorityFeeGwei(Number(networkComparison.standard.toFixed(2)))}
                className="flex-1 rounded bg-accent-blue/10 p-2 text-center font-mono text-xs text-accent-blue hover:bg-accent-blue/20"
              >
                Standard: {networkComparison.standard.toFixed(2)}
              </button>
              <button
                onClick={() => setPriorityFeeGwei(Number(networkComparison.priority.toFixed(2)))}
                className="flex-1 rounded bg-accent-purple/10 p-2 text-center font-mono text-xs text-accent-purple hover:bg-accent-purple/20"
              >
                Priority: {networkComparison.priority.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="annotation mb-4">INPUT PARAMETERS</div>

            {/* Gas Limit */}
            <div>
              <label htmlFor="gasLimit" className="mb-2 block font-mono text-xs text-text-secondary">
                Gas Limit
              </label>
              <input
                id="gasLimit"
                type="number"
                value={gasLimit}
                onChange={(e) => {
                  setGasLimit(Number(e.target.value))
                  setSelectedPreset('custom')
                }}
                className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                min="21000"
                step="1000"
              />
              <div className="mt-1 font-mono text-xs text-text-muted">
                {TX_PRESETS.find(p => p.id === selectedPreset)?.description || 'Enter custom gas limit'}
              </div>
            </div>

            {/* Base Fee Per Gas */}
            <div>
              <label htmlFor="baseFee" className="mb-2 block font-mono text-xs text-text-secondary">
                Base Fee Per Gas (Gwei)
              </label>
              <input
                id="baseFee"
                type="number"
                value={baseFeeGwei}
                onChange={(e) => handleBaseFeeChange(Number(e.target.value))}
                className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                min="0"
                step="0.1"
              />
              <div className="mt-1 font-mono text-xs text-text-muted">
                Current network base fee (dynamically adjusted)
              </div>
            </div>

            {/* Max Priority Fee Per Gas */}
            <div>
              <label htmlFor="priorityFee" className="mb-2 block font-mono text-xs text-text-secondary">
                Max Priority Fee Per Gas (Gwei)
              </label>
              <input
                id="priorityFee"
                type="number"
                value={priorityFeeGwei}
                onChange={(e) => handlePriorityFeeChange(Number(e.target.value))}
                className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                min="0"
                step="0.1"
              />
              <div className="mt-1 font-mono text-xs text-text-muted">
                Tip to miner for transaction priority
              </div>
            </div>

            {/* Max Fee Per Gas */}
            <div>
              <label htmlFor="maxFee" className="mb-2 block font-mono text-xs text-text-secondary">
                Max Fee Per Gas (Gwei)
              </label>
              <input
                id="maxFee"
                type="number"
                value={maxFeeGwei}
                onChange={(e) => setMaxFeeGwei(Number(e.target.value))}
                className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                min="0"
                step="0.1"
              />
              <div className="mt-1 font-mono text-xs text-text-muted">
                Maximum you are willing to pay (base + priority + buffer)
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="annotation mb-4">CALCULATED RESULTS</div>

            {/* Effective Gas Price */}
            <ResultItem
              label="Effective Gas Price"
              value={`${weiToGwei(effectiveGasPrice).toFixed(2)} Gwei`}
              description="Actual gas price that will be paid"
              color="text-accent-blue"
            />

            {/* Total Transaction Cost */}
            <ResultItem
              label="Total Transaction Cost"
              value={formatCurrency(totalCost, env.currencySymbol)}
              description="Expected cost based on effective gas price"
              color="text-accent-cyan"
            />

            {/* Max Possible Cost */}
            <ResultItem
              label="Max Possible Cost"
              value={formatCurrency(maxCost, env.currencySymbol)}
              description="Maximum cost if base fee rises to max fee"
              color="text-accent-purple"
            />

            {/* Potential Refund */}
            <ResultItem
              label="Potential Refund"
              value={formatCurrency(refund, env.currencySymbol)}
              description="Amount refunded if not all max fee is used"
              color="text-accent-green"
            />

            {/* Priority Fee to Miner */}
            <ResultItem
              label="Priority Fee to Miner"
              value={formatCurrency(priorityFee, env.currencySymbol)}
              description="Tip paid to miner for transaction inclusion"
              color="text-accent-orange"
            />

            {/* Savings Percentage */}
            {maxCost > BigInt(0) && (
              <div className="mt-6 rounded border border-accent-green/20 bg-accent-green/5 p-4">
                <div className="font-mono text-xs text-accent-green">
                  SAVINGS: {((Number(refund) / Number(maxCost)) * 100).toFixed(1)}%
                </div>
                <div className="mt-1 font-mono text-xs text-text-muted">
                  You save {formatCurrency(refund, env.currencySymbol)} compared to max cost
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="mt-6 border-t border-bg-tertiary pt-6">
          <div className="annotation mb-3">EIP-1559 FORMULA</div>
          <div className="space-y-2 font-mono text-xs text-text-secondary">
            <div>
              <span className="text-accent-blue">Effective Gas Price</span> = min(Max Fee Per Gas,
              Base Fee + Priority Fee)
            </div>
            <div>
              <span className="text-accent-cyan">Total Cost</span> = Gas Limit × Effective Gas Price
            </div>
            <div>
              <span className="text-accent-green">Refund</span> = (Max Fee - Effective Gas Price) × Gas
              Limit
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ResultItemProps {
  label: string
  value: string
  description: string
  color: string
}

function ResultItem({ label, value, description, color }: ResultItemProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-1 font-mono text-xs text-text-muted">{label}</div>
      <div className={`mb-2 font-mono text-xl font-bold ${color}`}>{value}</div>
      <div className="font-mono text-xs text-text-secondary">{description}</div>
    </div>
  )
}
