'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { truncateAddress } from '@/lib/utils/format'
import type { ValidatorDisplayInfo, Epoch } from '@/lib/hooks/useWBFT'

// ============================================================
// Stat Card
// ============================================================

interface StatCardProps {
  label: string
  value: string
  icon: string
  color: string
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
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

// ============================================================
// Stats Grid
// ============================================================

interface StatsGridProps {
  currentEpoch: Epoch | null
  currentLoading: boolean
}

export function EpochStatsGrid({ currentEpoch, currentLoading }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="CURRENT EPOCH"
        value={currentLoading ? '...' : currentEpoch?.epochNumber || 'N/A'}
        icon="📅"
        color="text-accent-blue"
      />
      <StatCard
        label="VALIDATORS"
        value={currentLoading ? '...' : currentEpoch?.validatorCount?.toString() || 'N/A'}
        icon="⚡"
        color="text-accent-green"
      />
      <StatCard
        label="CANDIDATES"
        value={currentLoading ? '...' : currentEpoch?.candidateCount?.toString() || 'N/A'}
        icon="👥"
        color="text-accent-cyan"
      />
      <StatCard
        label="ACTIVE"
        value={currentLoading ? '...' : currentEpoch ? 'ACTIVE' : 'N/A'}
        icon="🔄"
        color="text-accent-purple"
      />
    </div>
  )
}

// ============================================================
// Search Form
// ============================================================

interface SearchFormProps {
  searchInput: string
  searchEpoch: string
  onSearchInputChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onViewCurrent: () => void
}

export function EpochSearchForm({
  searchInput,
  searchEpoch,
  onSearchInputChange,
  onSearch,
  onViewCurrent,
}: SearchFormProps) {
  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>EPOCH SEARCH</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Enter epoch number..."
            className="flex-1 rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
          />
          <button
            type="submit"
            className="rounded border border-accent-blue bg-accent-blue/10 px-6 py-2 font-mono text-sm text-accent-blue transition-colors hover:bg-accent-blue/20"
          >
            SEARCH
          </button>
          {searchEpoch && (
            <button
              type="button"
              onClick={onViewCurrent}
              className="rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
            >
              VIEW CURRENT
            </button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Info Item
// ============================================================

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{label}</div>
      <div className="font-mono text-sm text-text-secondary">{value}</div>
    </div>
  )
}

// ============================================================
// Epoch Info Grid
// ============================================================

export function EpochInfoGrid({ epoch }: { epoch: Epoch }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">EPOCH INFORMATION</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Epoch Number" value={epoch.epochNumber} />
        <InfoItem label="Validator Count" value={epoch.validatorCount.toString()} />
        <InfoItem label="Candidate Count" value={epoch.candidateCount.toString()} />
      </div>
    </div>
  )
}

// ============================================================
// Validator Item
// ============================================================

function ValidatorItem({ validator }: { validator: ValidatorDisplayInfo }) {
  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-blue bg-accent-blue/10">
            <span className="font-mono text-xs font-bold text-accent-blue">{validator.index}</span>
          </div>
          <div>
            <div className="font-mono text-xs text-text-muted">Address</div>
            <div className="font-mono text-sm text-text-secondary" title={validator.address}>
              {truncateAddress(validator.address)}
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="font-mono text-xs text-text-muted">BLS Public Key</div>
          <div className="font-mono text-xs text-text-secondary break-all" title={validator.blsPubKey}>
            {validator.blsPubKey ? `${validator.blsPubKey.slice(0, 32)}...` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Validators List
// ============================================================

export function ValidatorsList({ validators }: { validators: ValidatorDisplayInfo[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">
        VALIDATORS ({validators.length})
      </h3>
      <div className="divide-y divide-bg-tertiary rounded border border-bg-tertiary">
        {validators.map((validator) => (
          <ValidatorItem key={`${validator.address}-${validator.index}`} validator={validator} />
        ))}
      </div>
    </div>
  )
}
