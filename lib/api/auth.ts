/**
 * API Key Authentication (Optional)
 *
 * Simple API key validation for protected endpoints.
 * API keys can be passed via header or query parameter.
 *
 * @example
 * ```typescript
 * // In API route
 * import { validateApiKey, UnauthorizedError } from '@/lib/api'
 *
 * const authResult = validateApiKey(request)
 * if (!authResult.valid) {
 *   return apiErrorResponse(new UnauthorizedError())
 * }
 * ```
 */

// Re-export UnauthorizedError for convenience
export { UnauthorizedError } from './errors'

/**
 * API key validation result
 */
export interface ApiKeyValidationResult {
  valid: boolean
  key?: string
  tier?: 'free' | 'standard' | 'premium'
  rateLimit?: number
}

/**
 * API key configuration
 */
interface ApiKeyConfig {
  /** Header name for API key */
  headerName: string
  /** Query parameter name for API key */
  queryParamName: string
  /** Whether API key is required */
  required: boolean
  /** Valid API keys (in production, use database or external service) */
  validKeys?: Map<string, { tier: 'free' | 'standard' | 'premium'; rateLimit: number }>
}

const DEFAULT_CONFIG: ApiKeyConfig = {
  headerName: 'X-API-Key',
  queryParamName: 'api_key',
  required: false, // API key is optional by default
  validKeys: new Map(),
}

/**
 * Extract API key from request
 */
export function extractApiKey(
  request: Request,
  config: Partial<ApiKeyConfig> = {}
): string | null {
  const { headerName, queryParamName } = { ...DEFAULT_CONFIG, ...config }

  // Try header first
  const headerKey = request.headers.get(headerName)
  if (headerKey) {
    return headerKey
  }

  // Try query parameter
  const url = new URL(request.url)
  const queryKey = url.searchParams.get(queryParamName)
  if (queryKey) {
    return queryKey
  }

  return null
}

/**
 * Validate API key
 */
export function validateApiKey(
  request: Request,
  config: Partial<ApiKeyConfig> = {}
): ApiKeyValidationResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const apiKey = extractApiKey(request, mergedConfig)

  // If API key is not required and not provided, allow access
  if (!mergedConfig.required && !apiKey) {
    return { valid: true, tier: 'free', rateLimit: 100 }
  }

  // If API key is required but not provided
  if (mergedConfig.required && !apiKey) {
    return { valid: false }
  }

  // If API key is provided, validate it
  if (apiKey) {
    // Check against valid keys
    const keyConfig = mergedConfig.validKeys?.get(apiKey)
    if (keyConfig) {
      return {
        valid: true,
        key: apiKey,
        tier: keyConfig.tier,
        rateLimit: keyConfig.rateLimit,
      }
    }

    // Check environment variable for master key
    const masterKey = process.env.API_MASTER_KEY
    if (masterKey && apiKey === masterKey) {
      return {
        valid: true,
        key: apiKey,
        tier: 'premium',
        rateLimit: 10000,
      }
    }

    // Invalid key provided
    return { valid: false, key: apiKey }
  }

  return { valid: true, tier: 'free', rateLimit: 100 }
}

/**
 * Rate limit by tier
 */
export const TIER_RATE_LIMITS = {
  free: 100, // 100 requests per minute
  standard: 500, // 500 requests per minute
  premium: 2000, // 2000 requests per minute
} as const

/**
 * Check if API key authentication is enabled
 */
export function isApiKeyAuthEnabled(): boolean {
  return process.env.API_KEY_AUTH_ENABLED === 'true'
}

/**
 * Middleware helper for API key validation
 */
export function requireApiKey(request: Request): ApiKeyValidationResult {
  if (!isApiKeyAuthEnabled()) {
    return { valid: true, tier: 'free', rateLimit: TIER_RATE_LIMITS.free }
  }

  return validateApiKey(request, { required: true })
}

/**
 * Optional API key validation (enhances rate limits if provided)
 */
export function optionalApiKey(request: Request): ApiKeyValidationResult {
  return validateApiKey(request, { required: false })
}
