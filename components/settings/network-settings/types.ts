import { TIMEOUTS } from '@/lib/config/constants'
import type { NetworkType } from '@/lib/config/networks.types'

export const SUCCESS_MESSAGE_DURATION = TIMEOUTS.IMPORT_SUCCESS_DURATION

export interface NetworkFormData {
  name: string
  graphqlEndpoint: string
  wsEndpoint: string
  jsonRpcEndpoint: string
  chainName: string
  chainId: string
  currencySymbol: string
  description: string
}

export const initialFormData: NetworkFormData = {
  name: '',
  graphqlEndpoint: '',
  wsEndpoint: '',
  jsonRpcEndpoint: '',
  chainName: '',
  chainId: '',
  currencySymbol: '',
  description: '',
}

export type FormErrors = Partial<Record<keyof NetworkFormData, string>>

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateFormData(data: NetworkFormData): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {}
  if (!data.name.trim()) {errors.name = 'Network name is required'}
  if (!data.graphqlEndpoint.trim()) {
    errors.graphqlEndpoint = 'GraphQL endpoint is required'
  } else if (!isValidUrl(data.graphqlEndpoint)) {
    errors.graphqlEndpoint = 'Invalid URL format'
  }
  if (!data.wsEndpoint.trim()) {
    errors.wsEndpoint = 'WebSocket endpoint is required'
  } else if (!isValidUrl(data.wsEndpoint.replace(/^ws/, 'http'))) {
    errors.wsEndpoint = 'Invalid WebSocket URL format'
  }
  if (!data.jsonRpcEndpoint.trim()) {
    errors.jsonRpcEndpoint = 'JSON-RPC endpoint is required'
  } else if (!isValidUrl(data.jsonRpcEndpoint)) {
    errors.jsonRpcEndpoint = 'Invalid URL format'
  }
  if (!data.chainName.trim()) {errors.chainName = 'Chain name is required'}
  if (!data.chainId.trim()) {
    errors.chainId = 'Chain ID is required'
  } else if (!/^\d+$/.test(data.chainId)) {
    errors.chainId = 'Chain ID must be a number'
  }
  if (!data.currencySymbol.trim()) {errors.currencySymbol = 'Currency symbol is required'}
  return { valid: Object.keys(errors).length === 0, errors }
}

export function getNetworkTypeStyle(type: NetworkType): string {
  switch (type) {
    case 'mainnet':
      return 'bg-success/10 text-success'
    case 'testnet':
      return 'bg-warning/10 text-warning'
    case 'custom':
      return 'bg-accent-blue/10 text-accent-blue'
    default:
      return 'bg-text-muted/10 text-text-muted'
  }
}
