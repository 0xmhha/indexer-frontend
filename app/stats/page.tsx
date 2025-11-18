'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">NETWORK STATISTICS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          NETWORK ANALYTICS
        </h1>
        <p className="font-mono text-xs text-text-secondary">
          Real-time statistics and historical data
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="TOTAL BLOCKS"
          value="Coming Soon"
          icon="□"
          color="text-accent-blue"
        />
        <StatCard
          label="TOTAL TRANSACTIONS"
          value="Coming Soon"
          icon="→"
          color="text-accent-cyan"
        />
        <StatCard
          label="AVG BLOCK TIME"
          value="Coming Soon"
          icon="◷"
          color="text-text-secondary"
        />
        <StatCard
          label="AVG GAS PRICE"
          value="Coming Soon"
          icon="⚡"
          color="text-accent-orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Blocks Over Time */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>BLOCKS OVER TIME</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-primary">
              <p className="font-mono text-xs text-text-muted">
                Chart visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Over Time */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TRANSACTIONS OVER TIME</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-primary">
              <p className="font-mono text-xs text-text-muted">
                Chart visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gas Usage Trends */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>GAS USAGE TRENDS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-primary">
              <p className="font-mono text-xs text-text-muted">
                Chart visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Miners */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TOP MINERS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-primary">
              <p className="font-mono text-xs text-text-muted">
                Top miners leaderboard coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="mt-8 text-center">
        <p className="font-mono text-xs text-text-muted">
          Advanced analytics and visualizations require backend aggregation queries
        </p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
