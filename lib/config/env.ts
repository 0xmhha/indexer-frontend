/**
 * Environment configuration
 * Centralized access to environment variables with type safety
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}

export const env = {
  // API Endpoints
  graphqlEndpoint: getEnvVar('NEXT_PUBLIC_GRAPHQL_ENDPOINT', 'http://localhost:8080/graphql'),
  wsEndpoint: getEnvVar('NEXT_PUBLIC_WS_ENDPOINT', 'ws://localhost:8080/ws'),
  jsonRpcEndpoint: getEnvVar('NEXT_PUBLIC_JSONRPC_ENDPOINT', 'http://localhost:8080/rpc'),

  // Chain Configuration
  chainName: getEnvVar('NEXT_PUBLIC_CHAIN_NAME', 'Stable-One'),
  chainId: getEnvVar('NEXT_PUBLIC_CHAIN_ID'),
  currencySymbol: getEnvVar('NEXT_PUBLIC_CURRENCY_SYMBOL', 'WEMIX'),

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
    // eslint-disable-next-line no-console
    console.error('Environment validation failed:', error)
  }
}
