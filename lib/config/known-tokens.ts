/**
 * Known Token Registry
 *
 * Static mapping of token contract addresses to their metadata.
 * Used as instant fallback before RPC calls for token info resolution.
 * Add deployed token addresses here for immediate rendering support.
 */

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
}

/**
 * Map of lowercase contract addresses → token metadata.
 * Update this as new tokens are deployed on the network.
 */
export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  // USD Coin
  '0x7186e5c27cb08eaf041005d193268006889083f6': {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  // Wrapped KRC (native wrapper)
  '0x0000000000000000000000000000000000001000': {
    name: 'Wrapped KRC',
    symbol: 'WKRC',
    decimals: 18,
  },
}

/**
 * Lookup token info by address (case-insensitive).
 * Returns undefined if not in the static registry.
 */
export function getKnownToken(address: string): TokenInfo | undefined {
  return KNOWN_TOKENS[address.toLowerCase()]
}
