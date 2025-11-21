'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  calculateEffectiveGasPrice,
  calculateTxCost,
  gweiToWei,
  weiToGwei,
} from '@/lib/utils/gas'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface TransactionSimulatorProps {
  className?: string
}

type TransactionType = 'transfer' | 'contract' | 'token' | 'nft'
type NetworkCondition = 'low' | 'medium' | 'high' | 'extreme'

interface SimulationResult {
  effectiveGasPrice: bigint
  totalCost: bigint
  estimatedConfirmTime: string
  successProbability: number
  recommendation: string
}

/**
 * Transaction Simulator
 *
 * Interactive simulator for estimating transaction costs and confirmation times
 * under different network conditions and transaction types.
 *
 * @param className - Additional CSS classes
 */
export function TransactionSimulator({ className }: TransactionSimulatorProps) {
  // Transaction configuration
  const [txType, setTxType] = useState<TransactionType>('transfer')
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>('medium')

  // Gas parameters
  const [baseFeeGwei, setBaseFeeGwei] = useState<number>(25)
  const [priorityFeeGwei, setPriorityFeeGwei] = useState<number>(2)
  const [maxFeeGwei, setMaxFeeGwei] = useState<number>(35)

  // Gas limits by transaction type
  const gasLimits: Record<TransactionType, number> = {
    transfer: 21000,
    contract: 100000,
    token: 65000,
    nft: 150000,
  }

  // Network condition base fees (simulated)
  const networkBaseFees: Record<NetworkCondition, number> = {
    low: 15,
    medium: 25,
    high: 50,
    extreme: 100,
  }

  // Update base fee when network condition changes
  useEffect(() => {
    setBaseFeeGwei(networkBaseFees[networkCondition])
    setMaxFeeGwei(networkBaseFees[networkCondition] + priorityFeeGwei + 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkCondition])

  // Calculate simulation results
  const result = useMemo<SimulationResult>(() => {
    const gasLimit = gasLimits[txType]
    const baseFeeWei = gweiToWei(baseFeeGwei)
    const maxFeeWei = gweiToWei(maxFeeGwei)
    const priorityFeeWei = gweiToWei(priorityFeeGwei)
    const gasLimitBigInt = BigInt(gasLimit)

    const effectiveGasPrice = calculateEffectiveGasPrice(baseFeeWei, maxFeeWei, priorityFeeWei)
    const totalCost = calculateTxCost(gasLimitBigInt, effectiveGasPrice)

    // Estimate confirmation time based on priority fee
    let estimatedConfirmTime: string
    let successProbability: number
    let recommendation: string

    if (priorityFeeGwei < 1) {
      estimatedConfirmTime = '5-10 minutes'
      successProbability = 60
      recommendation = 'Low priority - may take longer during high network activity'
    } else if (priorityFeeGwei < 2) {
      estimatedConfirmTime = '2-5 minutes'
      successProbability = 75
      recommendation = 'Standard priority - reasonable for most transactions'
    } else if (priorityFeeGwei < 5) {
      estimatedConfirmTime = '30-120 seconds'
      successProbability = 90
      recommendation = 'High priority - good for time-sensitive transactions'
    } else {
      estimatedConfirmTime = '< 30 seconds'
      successProbability = 98
      recommendation = 'Very high priority - fast confirmation guaranteed'
    }

    // Adjust for network conditions
    if (networkCondition === 'extreme') {
      successProbability = Math.max(successProbability - 20, 50)
      recommendation += '. Consider waiting for network to stabilize.'
    } else if (networkCondition === 'high') {
      successProbability = Math.max(successProbability - 10, 60)
    }

    return {
      effectiveGasPrice,
      totalCost,
      estimatedConfirmTime,
      successProbability,
      recommendation,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, baseFeeGwei, priorityFeeGwei, maxFeeGwei, networkCondition])

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>TRANSACTION SIMULATOR</span>
          <span className="font-mono text-xs text-text-secondary">ESTIMATE COSTS & TIMING</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="annotation mb-4">CONFIGURATION</div>

            {/* Transaction Type */}
            <div>
              <label className="mb-2 block font-mono text-xs text-text-secondary">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: 'transfer', label: 'Transfer', icon: '💸' },
                    { value: 'contract', label: 'Contract', icon: '📜' },
                    { value: 'token', label: 'Token', icon: '🪙' },
                    { value: 'nft', label: 'NFT', icon: '🖼️' },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTxType(type.value)}
                    className={`rounded border px-4 py-3 font-mono text-xs transition-colors ${
                      txType === type.value
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                        : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue/50'
                    }`}
                  >
                    <div className="mb-1 text-lg">{type.icon}</div>
                    <div>{type.label}</div>
                    <div className="mt-1 text-xs text-text-muted">
                      {gasLimits[type.value].toLocaleString()} gas
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Condition */}
            <div>
              <label className="mb-2 block font-mono text-xs text-text-secondary">
                Network Condition
              </label>
              <div className="space-y-2">
                {(
                  [
                    { value: 'low', label: 'Low Activity', color: 'accent-green' },
                    { value: 'medium', label: 'Medium Activity', color: 'accent-blue' },
                    { value: 'high', label: 'High Activity', color: 'accent-orange' },
                    { value: 'extreme', label: 'Extreme Congestion', color: 'accent-red' },
                  ] as const
                ).map((condition) => (
                  <button
                    key={condition.value}
                    onClick={() => setNetworkCondition(condition.value)}
                    className={`w-full rounded border px-4 py-2 text-left font-mono text-xs transition-colors ${
                      networkCondition === condition.value
                        ? `border-${condition.color} bg-${condition.color}/10 text-${condition.color}`
                        : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{condition.label}</span>
                      <span className="text-xs text-text-muted">
                        ~{networkBaseFees[condition.value]} Gwei
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gas Parameters */}
            <div className="space-y-3 rounded border border-bg-tertiary bg-bg-secondary p-4">
              <div className="annotation">GAS PARAMETERS</div>

              <div>
                <label
                  htmlFor="priorityFee"
                  className="mb-1 block font-mono text-xs text-text-secondary"
                >
                  Priority Fee (Gwei)
                </label>
                <input
                  id="priorityFee"
                  type="number"
                  value={priorityFeeGwei}
                  onChange={(e) => setPriorityFeeGwei(Number(e.target.value))}
                  className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="maxFee" className="mb-1 block font-mono text-xs text-text-secondary">
                  Max Fee (Gwei)
                </label>
                <input
                  id="maxFee"
                  type="number"
                  value={maxFeeGwei}
                  onChange={(e) => setMaxFeeGwei(Number(e.target.value))}
                  className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="annotation mb-4">SIMULATION RESULTS</div>

            {/* Cost Estimate */}
            <div className="rounded border border-accent-cyan/30 bg-accent-cyan/5 p-4">
              <div className="mb-1 font-mono text-xs text-text-muted">Estimated Cost</div>
              <div className="mb-2 font-mono text-3xl font-bold text-accent-cyan">
                {formatCurrency(result.totalCost, env.currencySymbol)}
              </div>
              <div className="font-mono text-xs text-text-secondary">
                {weiToGwei(result.effectiveGasPrice).toFixed(2)} Gwei effective gas price
              </div>
            </div>

            {/* Confirmation Time */}
            <div className="rounded border border-accent-blue/30 bg-accent-blue/5 p-4">
              <div className="mb-1 font-mono text-xs text-text-muted">Estimated Confirmation</div>
              <div className="mb-2 font-mono text-2xl font-bold text-accent-blue">
                {result.estimatedConfirmTime}
              </div>
              <div className="font-mono text-xs text-text-secondary">
                Based on current network conditions
              </div>
            </div>

            {/* Success Probability */}
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
              <div className="mb-2 flex justify-between font-mono text-xs text-text-muted">
                <span>Success Probability</span>
                <span>{result.successProbability}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-bg-primary">
                <div
                  className={`h-full transition-all ${
                    result.successProbability >= 90
                      ? 'bg-accent-green'
                      : result.successProbability >= 75
                        ? 'bg-accent-blue'
                        : result.successProbability >= 60
                          ? 'bg-accent-orange'
                          : 'bg-accent-red'
                  }`}
                  style={{ width: `${result.successProbability}%` }}
                />
              </div>
            </div>

            {/* Recommendation */}
            <div
              className={`rounded border p-4 ${
                result.successProbability >= 90
                  ? 'border-accent-green/30 bg-accent-green/5'
                  : result.successProbability >= 75
                    ? 'border-accent-blue/30 bg-accent-blue/5'
                    : 'border-accent-orange/30 bg-accent-orange/5'
              }`}
            >
              <div className="mb-2 font-mono text-xs font-bold text-text-secondary">
                RECOMMENDATION
              </div>
              <div className="font-mono text-xs text-text-secondary">{result.recommendation}</div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
              <div className="annotation mb-3">COST BREAKDOWN</div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Gas Limit:</span>
                  <span className="text-text-primary">{gasLimits[txType].toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Base Fee:</span>
                  <span className="text-text-primary">{baseFeeGwei.toFixed(2)} Gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Priority Fee:</span>
                  <span className="text-text-primary">{priorityFeeGwei.toFixed(2)} Gwei</span>
                </div>
                <div className="flex justify-between border-t border-bg-tertiary pt-2">
                  <span className="text-text-muted">Effective Price:</span>
                  <span className="text-accent-cyan">
                    {weiToGwei(result.effectiveGasPrice).toFixed(2)} Gwei
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
