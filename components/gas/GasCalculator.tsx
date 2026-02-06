'use client'

import { useState, useEffect } from 'react'
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
  // Input values (in Gwei for user convenience)
  const [gasLimit, setGasLimit] = useState<number>(defaultGasLimit)
  const [baseFeeGwei, setBaseFeeGwei] = useState<number>(defaultBaseFee)
  const [priorityFeeGwei, setPriorityFeeGwei] = useState<number>(defaultPriorityFee)
  const [maxFeeGwei, setMaxFeeGwei] = useState<number>(defaultBaseFee + defaultPriorityFee + 10)

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
          <span className="font-mono text-xs text-text-secondary">ESTIMATE TRANSACTION COSTS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
                onChange={(e) => setGasLimit(Number(e.target.value))}
                className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                min="21000"
                step="1000"
              />
              <div className="mt-1 font-mono text-xs text-text-muted">
                Standard transfer: 21,000 • Contract interaction: 50,000+
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
