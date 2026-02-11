export const TIME_PERIODS = [
  { id: '24h', label: '24H', description: 'Last 24 hours' },
  { id: '7d', label: '7D', description: 'Last 7 days' },
  { id: '30d', label: '30D', description: 'Last 30 days' },
  { id: 'all', label: 'ALL', description: 'All time' },
] as const

export type TimePeriodId = typeof TIME_PERIODS[number]['id']

export interface FeeDelegationDashboardProps {
  className?: string
}
