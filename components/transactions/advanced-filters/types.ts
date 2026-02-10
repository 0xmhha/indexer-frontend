/**
 * Advanced Transaction Filters - Types and Constants
 */

export const TX_TYPE_OPTIONS = [
  { value: -1, label: 'All Types' },
  { value: 0, label: 'Legacy (Type 0)' },
  { value: 1, label: 'Access List (Type 1)' },
  { value: 2, label: 'EIP-1559 (Type 2)' },
  { value: 3, label: 'Blob (Type 3)' },
  { value: 4, label: 'SetCode (Type 4)' },
] as const

export const QUICK_FILTERS = [
  { id: 'contract-calls', label: 'Contract Calls', icon: '📜', description: 'Transactions calling contracts' },
  { id: 'contract-deploy', label: 'Deployments', icon: '🚀', description: 'Contract creation transactions' },
  { id: 'fee-delegated', label: 'Fee Delegated', icon: '💳', description: 'Sponsored transactions' },
  { id: 'high-value', label: 'High Value', icon: '💰', description: 'Transactions > 1 ETH' },
  { id: 'failed', label: 'Failed', icon: '❌', description: 'Reverted transactions' },
  { id: 'eip-7702', label: 'EIP-7702', icon: '🔐', description: 'SetCode transactions' },
] as const

export type QuickFilterId = typeof QUICK_FILTERS[number]['id']

export interface AdvancedTransactionFilterValues {
  fromBlock: string
  toBlock: string
  minValue: string
  maxValue: string
  direction: 'all' | 'sent' | 'received'
  status: 'all' | 'success' | 'failed' | 'pending'
  eipType: number
  contractInteraction: 'all' | 'contract-call' | 'contract-deploy' | 'transfer'
  feeDelegated: 'all' | 'yes' | 'no'
  fromAddress: string
  toAddress: string
  methodId: string
  minGasUsed: string
  maxGasUsed: string
  timeRange: 'all' | '1h' | '24h' | '7d' | '30d' | 'custom'
}

export const defaultFilters: AdvancedTransactionFilterValues = {
  fromBlock: '',
  toBlock: '',
  minValue: '',
  maxValue: '',
  direction: 'all',
  status: 'all',
  eipType: -1,
  contractInteraction: 'all',
  feeDelegated: 'all',
  fromAddress: '',
  toAddress: '',
  methodId: '',
  minGasUsed: '',
  maxGasUsed: '',
  timeRange: 'all',
}
