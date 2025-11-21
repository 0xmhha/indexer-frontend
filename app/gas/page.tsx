'use client'

import { useState } from 'react'
import { GasCalculator } from '@/components/gas/GasCalculator'
import { FeeEfficiencyAnalyzer } from '@/components/gas/FeeEfficiencyAnalyzer'
import { FeeDelegationDashboard } from '@/components/gas/FeeDelegationDashboard'
import { TransactionSimulator } from '@/components/gas/TransactionSimulator'

type ActiveTool = 'calculator' | 'analyzer' | 'simulator' | 'delegation'

export default function GasToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('calculator')

  const tools = [
    { id: 'calculator' as const, label: 'Gas Calculator', icon: '🧮' },
    { id: 'analyzer' as const, label: 'Fee Analyzer', icon: '📊' },
    { id: 'simulator' as const, label: 'TX Simulator', icon: '⚡' },
    { id: 'delegation' as const, label: 'Fee Delegation', icon: '💎' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">GAS & FEE TOOLS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          ADVANCED GAS ANALYTICS
        </h1>
        <p className="font-mono text-xs text-text-secondary">
          Optimize transaction costs with EIP-1559 tools and fee delegation insights
        </p>
      </div>

      {/* Tool Navigation */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`rounded border px-4 py-3 transition-colors ${
              activeTool === tool.id
                ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue/50'
            }`}
          >
            <div className="mb-1 text-2xl">{tool.icon}</div>
            <div className="font-mono text-xs font-bold">{tool.label}</div>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="space-y-6">
        {activeTool === 'calculator' && (
          <div className="animate-fade-in">
            <GasCalculator />
          </div>
        )}

        {activeTool === 'analyzer' && (
          <div className="animate-fade-in">
            <FeeEfficiencyAnalyzer />
          </div>
        )}

        {activeTool === 'simulator' && (
          <div className="animate-fade-in">
            <TransactionSimulator />
          </div>
        )}

        {activeTool === 'delegation' && (
          <div className="animate-fade-in">
            <FeeDelegationDashboard />
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-12 border-t border-bg-tertiary pt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard
            icon="📘"
            title="EIP-1559"
            description="Dynamic base fee mechanism with priority tips and max fee caps"
          />
          <InfoCard
            icon="💸"
            title="Fee Delegation"
            description="Third-party gas payment for gasless user experience (Type 0x16)"
          />
          <InfoCard
            icon="🎯"
            title="Optimization"
            description="Tools to minimize costs while ensuring timely transaction confirmation"
          />
        </div>
      </div>
    </div>
  )
}

interface InfoCardProps {
  icon: string
  title: string
  description: string
}

function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="mb-2 font-mono text-sm font-bold text-accent-blue">{title}</div>
      <div className="font-mono text-xs text-text-secondary">{description}</div>
    </div>
  )
}
