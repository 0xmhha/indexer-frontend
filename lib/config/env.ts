/**
 * Environment configuration
 * Centralized access to environment variables with type safety
 */
import appConfig from '@/config/app.config.json'

interface ApiConfig {
  graphqlEndpoint?: string
  wsEndpoint?: string
  jsonRpcEndpoint?: string
}

interface ChainConfig {
  name?: string
  id?: string
  currencySymbol?: string
}

const { api = {} as ApiConfig, chain = {} as ChainConfig } = appConfig as {
  api?: ApiConfig
  chain?: ChainConfig
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export const env = {
  // API Endpoints
  graphqlEndpoint: getEnvVar('NEXT_PUBLIC_GRAPHQL_ENDPOINT', api.graphqlEndpoint),
  wsEndpoint: getEnvVar('NEXT_PUBLIC_WS_ENDPOINT', api.wsEndpoint),
  jsonRpcEndpoint: getEnvVar('NEXT_PUBLIC_JSONRPC_ENDPOINT', api.jsonRpcEndpoint),

  // Chain Configuration
  chainName: getEnvVar('NEXT_PUBLIC_CHAIN_NAME', chain.name),
  chainId: getEnvVar('NEXT_PUBLIC_CHAIN_ID', chain.id),
  currencySymbol: getEnvVar('NEXT_PUBLIC_CURRENCY_SYMBOL', chain.currencySymbol),

  // Optional APIs
  priceApiUrl: process.env.NEXT_PUBLIC_PRICE_API_URL,

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

// Validate environment on module load
if (typeof window === 'undefined') {
  // Only validate on server
  try {
    Object.entries(env).forEach(([key, value]) => {
      if (value === undefined && !key.startsWith('price')) {
        throw new Error(`Required environment variable for ${key} is missing`)
      }
    })
  } catch (error) {
    console.error('Environment validation failed:', error)
  }
}
