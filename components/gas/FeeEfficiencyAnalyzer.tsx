'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  calculateEffectiveGasPrice,
  calculateTxCost,
  gweiToWei,
  weiToGwei,
} from '@/lib/utils/gas'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { GAS, THRESHOLDS, BLOCKCHAIN } from '@/lib/config/constants'

interface FeeEfficiencyAnalyzerProps {
  gasLimit?: number
  baseFee?: number
  className?: string
}

interface TransactionScenario {
  type: string
  name: string
  description: string
  gasPrice: bigint
  totalCost: bigint
  efficiency: number
  color: string
}

/**
 * Fee Efficiency Analyzer
 *
 * Analyzes and compares transaction fee efficiency across different transaction types
 * (Legacy, EIP-1559, Fee Delegated) and provides optimization recommendations.
 *
 * @param gasLimit - Gas limit for analysis (default: 21000)
 * @param baseFee - Current base fee in Gwei (default: 25)
 * @param className - Additional CSS classes
 */
export function FeeEfficiencyAnalyzer({
  gasLimit = GAS.GAS_LIMIT_TRANSFER,
  baseFee = GAS.BASE_FEE_MEDIUM,
  className,
}: FeeEfficiencyAnalyzerProps) {
  const [priorityFee, setPriorityFee] = useState<number>(GAS.DEFAULT_PRIORITY_FEE)
  const [legacyGasPrice, setLegacyGasPrice] = useState<number>(GAS.DEFAULT_LEGACY_GAS_PRICE)

  // Calculate scenarios
  const scenarios = useMemo<TransactionScenario[]>(() => {
    const baseFeeWei = gweiToWei(baseFee)
    const priorityFeeWei = gweiToWei(priorityFee)
    const legacyGasPriceWei = gweiToWei(legacyGasPrice)
    const gasLimitBigInt = BigInt(gasLimit)

    // EIP-1559 transaction (optimal)
    const maxFeeWei = gweiToWei(baseFee + priorityFee + GAS.FEE_BUFFER_OPTIMAL)
    const eip1559EffectivePrice = calculateEffectiveGasPrice(baseFeeWei, maxFeeWei, priorityFeeWei)
    const eip1559Cost = calculateTxCost(gasLimitBigInt, eip1559EffectivePrice)

    // EIP-1559 transaction (conservative - higher buffer)
    const maxFeeConservativeWei = gweiToWei(baseFee + priorityFee + GAS.FEE_BUFFER_CONSERVATIVE)
    const eip1559ConservativePrice = calculateEffectiveGasPrice(
      baseFeeWei,
      maxFeeConservativeWei,
      priorityFeeWei
    )
    const eip1559ConservativeCost = calculateTxCost(gasLimitBigInt, eip1559ConservativePrice)

    // Legacy transaction
    const legacyCost = calculateTxCost(gasLimitBigInt, legacyGasPriceWei)

    // Fee Delegated (user pays 0, fee payer covers the cost)
    const feeDelegatedCost = BigInt(0) // User pays nothing

    // Find minimum cost for efficiency calculation
    const minCost = Math.min(
      Number(eip1559Cost),
      Number(eip1559ConservativeCost),
      Number(legacyCost)
    )

    return [
      {
        type: 'eip1559-optimal',
        name: 'EIP-1559 (Optimal)',
        description: 'Best balance of cost and confirmation speed',
        gasPrice: eip1559EffectivePrice,
        totalCost: eip1559Cost,
        efficiency: BLOCKCHAIN.PERCENTAGE_FULL,
        color: 'text-accent-green',
      },
      {
        type: 'eip1559-conservative',
        name: 'EIP-1559 (Conservative)',
        description: 'Higher buffer for volatile network conditions',
        gasPrice: eip1559ConservativePrice,
        totalCost: eip1559ConservativeCost,
        efficiency: (minCost / Number(eip1559ConservativeCost)) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER,
        color: 'text-accent-blue',
      },
      {
        type: 'legacy',
        name: 'Legacy (Type 0)',
        description: 'Fixed gas price, no refunds',
        gasPrice: legacyGasPriceWei,
        totalCost: legacyCost,
        efficiency: (minCost / Number(legacyCost)) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER,
        color: 'text-accent-orange',
      },
      {
        type: 'fee-delegated',
        name: 'Fee Delegated (Type 0x16)',
        description: 'Third party pays gas fees',
        gasPrice: eip1559EffectivePrice,
        totalCost: feeDelegatedCost,
        efficiency: BLOCKCHAIN.PERCENTAGE_FULL,
        color: 'text-accent-purple',
      },
    ]
  }, [gasLimit, baseFee, priorityFee, legacyGasPrice])

  // Find best and worst scenarios
  const bestScenario = scenarios.reduce((best, current) =>
    Number(current.totalCost) < Number(best.totalCost) ? current : best
  )

  const worstScenario = scenarios.reduce((worst, current) =>
    Number(current.totalCost) > Number(worst.totalCost) ? current : worst
  )

  // Calculate potential savings
  const potentialSavings = Number(worstScenario.totalCost) - Number(bestScenario.totalCost)
  const savingsPercentage =
    Number(worstScenario.totalCost) > 0
      ? (potentialSavings / Number(worstScenario.totalCost)) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER
      : 0

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>FEE EFFICIENCY ANALYZER</span>
          <span className="font-mono text-xs text-text-secondary">OPTIMIZE TRANSACTION COSTS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Input Controls */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="priorityFee" className="mb-2 block font-mono text-xs text-text-secondary">
              Priority Fee (Gwei)
            </label>
            <input
              id="priorityFee"
              type="number"
              value={priorityFee}
              onChange={(e) => setPriorityFee(Number(e.target.value))}
              className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label
              htmlFor="legacyGasPrice"
              className="mb-2 block font-mono text-xs text-text-secondary"
            >
              Legacy Gas Price (Gwei)
            </label>
            <input
              id="legacyGasPrice"
              type="number"
              value={legacyGasPrice}
              onChange={(e) => setLegacyGasPrice(Number(e.target.value))}
              className="w-full rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <div className="mb-2 font-mono text-xs text-text-secondary">Base Fee (Network)</div>
              <div className="flex h-10 items-center rounded border border-bg-tertiary bg-bg-primary px-4 font-mono text-sm text-accent-cyan">
                {baseFee.toFixed(2)} Gwei
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios Comparison */}
        <div className="mb-6 space-y-4">
          <div className="annotation mb-4">TRANSACTION TYPE COMPARISON</div>

          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.type}
              scenario={scenario}
              isBest={scenario.type === bestScenario.type}
              isWorst={scenario.type === worstScenario.type}
            />
          ))}
        </div>

        {/* Efficiency Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border border-accent-green/20 bg-accent-green/5 p-4">
            <div className="mb-1 font-mono text-xs text-text-muted">MOST EFFICIENT</div>
            <div className="mb-2 font-mono text-lg font-bold text-accent-green">
              {bestScenario.name}
            </div>
            <div className="font-mono text-xs text-text-secondary">
              {formatCurrency(bestScenario.totalCost, env.currencySymbol)}
            </div>
          </div>

          <div className="rounded border border-accent-orange/20 bg-accent-orange/5 p-4">
            <div className="mb-1 font-mono text-xs text-text-muted">LEAST EFFICIENT</div>
            <div className="mb-2 font-mono text-lg font-bold text-accent-orange">
              {worstScenario.name}
            </div>
            <div className="font-mono text-xs text-text-secondary">
              {formatCurrency(worstScenario.totalCost, env.currencySymbol)}
            </div>
          </div>

          <div className="rounded border border-accent-blue/20 bg-accent-blue/5 p-4">
            <div className="mb-1 font-mono text-xs text-text-muted">POTENTIAL SAVINGS</div>
            <div className="mb-2 font-mono text-lg font-bold text-accent-blue">
              {savingsPercentage.toFixed(1)}%
            </div>
            <div className="font-mono text-xs text-text-secondary">
              Save {formatCurrency(BigInt(potentialSavings), env.currencySymbol)}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 border-t border-bg-tertiary pt-6">
          <div className="annotation mb-3">RECOMMENDATIONS</div>
          <div className="space-y-2">
            <Recommendation
              icon="✓"
              text="Use EIP-1559 (Optimal) for best cost efficiency and predictable fees"
              type="success"
            />
            <Recommendation
              icon="⚡"
              text="Increase priority fee during high network congestion for faster confirmation"
              type="info"
            />
            <Recommendation
              icon="💡"
              text="Consider Fee Delegation for sponsored transactions or gasless UX"
              type="info"
            />
            {Number(worstScenario.totalCost) > Number(bestScenario.totalCost) * GAS.COST_WARNING_THRESHOLD && (
              <Recommendation
                icon="⚠"
                text={`Avoid ${worstScenario.name} - costs ${savingsPercentage.toFixed(0)}% more than optimal`}
                type="warning"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ScenarioCardProps {
  scenario: TransactionScenario
  isBest: boolean
  isWorst: boolean
}

function ScenarioCard({ scenario, isBest, isWorst }: ScenarioCardProps) {
  return (
    <div
      className={`rounded border p-4 ${
        isBest
          ? 'border-accent-green/30 bg-accent-green/5'
          : isWorst
            ? 'border-accent-orange/30 bg-accent-orange/5'
            : 'border-bg-tertiary bg-bg-secondary'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className={`mb-1 font-mono text-sm font-bold ${scenario.color}`}>
            {scenario.name}
            {isBest && <span className="ml-2 text-xs text-accent-green">★ RECOMMENDED</span>}
            {isWorst && <span className="ml-2 text-xs text-accent-orange">⚠ EXPENSIVE</span>}
          </div>
          <div className="font-mono text-xs text-text-secondary">{scenario.description}</div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-lg font-bold ${scenario.color}`}>
            {formatCurrency(scenario.totalCost, env.currencySymbol)}
          </div>
          <div className="font-mono text-xs text-text-muted">
            {weiToGwei(scenario.gasPrice).toFixed(2)} Gwei
          </div>
        </div>
      </div>

      {/* Efficiency Bar */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between font-mono text-xs text-text-muted">
          <span>Efficiency</span>
          <span>{scenario.efficiency.toFixed(0)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-primary">
          <div
            className={`h-full transition-all ${
              scenario.efficiency >= THRESHOLDS.GAS_EFFICIENCY_EXCELLENT
                ? 'bg-accent-green'
                : scenario.efficiency >= THRESHOLDS.GAS_EFFICIENCY_GOOD
                  ? 'bg-accent-blue'
                  : scenario.efficiency >= THRESHOLDS.GAS_EFFICIENCY_FAIR
                    ? 'bg-accent-cyan'
                    : 'bg-accent-orange'
            }`}
            style={{ width: `${scenario.efficiency}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface RecommendationProps {
  icon: string
  text: string
  type: 'success' | 'info' | 'warning'
}

function Recommendation({ icon, text, type }: RecommendationProps) {
  const colorMap = {
    success: 'text-accent-green',
    info: 'text-accent-blue',
    warning: 'text-accent-orange',
  }

  return (
    <div className="flex items-start gap-2">
      <span className={`font-mono text-sm ${colorMap[type]}`}>{icon}</span>
      <span className="font-mono text-xs text-text-secondary">{text}</span>
    </div>
  )
}
