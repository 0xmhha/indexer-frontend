/**
 * Event Log Decoder Utility
 * Decodes known event signatures (ERC20, ERC721, etc.) on the frontend
 * as a fallback when backend doesn't provide decoded logs
 */

import { ABI, FORMATTING } from '@/lib/config/constants'

// ============================================================================
// Types
// ============================================================================

export interface DecodedParam {
  name: string
  type: string
  value: string
  indexed: boolean
}

export interface DecodedLog {
  eventName: string
  eventSignature: string
  params: DecodedParam[]
}

interface EventInput {
  name: string
  type: 'address' | 'uint256' | 'int256' | 'bool' | 'bytes32' | 'bytes' | 'string'
  indexed: boolean
}

interface KnownEvent {
  name: string
  signature: string
  inputs: EventInput[]
}

// ============================================================================
// Known Event Signatures
// ============================================================================

/**
 * Map of event signature hashes to their definitions
 * These are the most common events that can be decoded without ABI
 */
const KNOWN_EVENTS: Record<string, KnownEvent> = {
  // ERC20 Transfer(address indexed from, address indexed to, uint256 value)
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': {
    name: 'Transfer',
    signature: 'Transfer(address,address,uint256)',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
  // ERC20 Approval(address indexed owner, address indexed spender, uint256 value)
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': {
    name: 'Approval',
    signature: 'Approval(address,address,uint256)',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
  // ERC721 ApprovalForAll(address indexed owner, address indexed operator, bool approved)
  '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31': {
    name: 'ApprovalForAll',
    signature: 'ApprovalForAll(address,address,bool)',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'approved', type: 'bool', indexed: false },
    ],
  },
  // Deposit(address indexed dst, uint256 wad) - WETH style
  '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c': {
    name: 'Deposit',
    signature: 'Deposit(address,uint256)',
    inputs: [
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
  },
  // Withdrawal(address indexed src, uint256 wad) - WETH style
  '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65': {
    name: 'Withdrawal',
    signature: 'Withdrawal(address,uint256)',
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
  },
  // OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
  '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0': {
    name: 'OwnershipTransferred',
    signature: 'OwnershipTransferred(address,address)',
    inputs: [
      { name: 'previousOwner', type: 'address', indexed: true },
      { name: 'newOwner', type: 'address', indexed: true },
    ],
  },
}

// ERC721 Transfer has same signature but tokenId is indexed (4 topics)
const ERC721_TRANSFER: KnownEvent = {
  name: 'Transfer',
  signature: 'Transfer(address,address,uint256)',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'tokenId', type: 'uint256', indexed: true },
  ],
}

// ERC721 Approval has same signature but tokenId is indexed (4 topics)
const ERC721_APPROVAL: KnownEvent = {
  name: 'Approval',
  signature: 'Approval(address,address,uint256)',
  inputs: [
    { name: 'owner', type: 'address', indexed: true },
    { name: 'approved', type: 'address', indexed: true },
    { name: 'tokenId', type: 'uint256', indexed: true },
  ],
}

// ============================================================================
// Decoding Functions
// ============================================================================

/**
 * Extract address from 32-byte hex string (last 20 bytes)
 */
function decodeAddress(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  // Take last 40 characters (20 bytes)
  const addressHex = cleaned.slice(ABI.ADDRESS_OFFSET)
  return toChecksumAddress(`0x${addressHex}`)
}

/**
 * Convert address to checksum format
 */
function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '')
  // Simple checksum - for full implementation use keccak256
  // This is a simplified version that just returns lowercase with 0x prefix
  return `0x${addr}`
}

/**
 * Decode uint256 from 32-byte hex string
 */
function decodeUint256(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  // Remove leading zeros and convert to decimal
  const trimmed = cleaned.replace(/^0+/, '') || '0'
  try {
    return BigInt(`0x${trimmed}`).toString(10)
  } catch {
    return '0'
  }
}

/**
 * Decode int256 from 32-byte hex string (two's complement)
 */
function decodeInt256(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  const value = BigInt(`0x${cleaned}`)
  // Check if negative (first bit is 1)
  const maxPositive = BigInt(2) ** BigInt(ABI.UINT8_MAX) - BigInt(1)
  if (value > maxPositive) {
    // Two's complement for negative numbers
    return (value - BigInt(2) ** BigInt(ABI.UINT256_SIZE)).toString(10)
  }
  return value.toString(10)
}

/**
 * Decode bool from 32-byte hex string
 */
function decodeBool(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex
  const lastByte = cleaned.slice(ABI.BYTE_EXTRACT_OFFSET)
  return lastByte === '01' ? 'true' : 'false'
}

/**
 * Decode bytes32 - return as-is
 */
function decodeBytes32(hex: string): string {
  return hex.startsWith('0x') ? hex : `0x${hex}`
}

/**
 * Decode a single value based on type
 */
function decodeValue(hex: string, type: EventInput['type']): string {
  switch (type) {
    case 'address':
      return decodeAddress(hex)
    case 'uint256':
      return decodeUint256(hex)
    case 'int256':
      return decodeInt256(hex)
    case 'bool':
      return decodeBool(hex)
    case 'bytes32':
      return decodeBytes32(hex)
    default:
      return hex
  }
}

/**
 * Get known event definition, handling ERC20 vs ERC721 disambiguation
 */
function getKnownEvent(topics: string[]): KnownEvent | null {
  if (topics.length === 0 || !topics[0]) {return null}

  const sigHash = topics[0].toLowerCase()
  const event = KNOWN_EVENTS[sigHash]

  if (!event) {return null}

  // Handle ERC20 vs ERC721 Transfer/Approval disambiguation
  // ERC721 has tokenId indexed, so 4 topics; ERC20 has 3 topics
  if (sigHash === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
    // Transfer event
    if (topics.length === ABI.ERC721_TOPICS_COUNT) {
      return ERC721_TRANSFER
    }
    return event // ERC20 Transfer
  }

  if (sigHash === '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925') {
    // Approval event
    if (topics.length === ABI.ERC721_TOPICS_COUNT) {
      return ERC721_APPROVAL
    }
    return event // ERC20 Approval
  }

  return event
}

// ============================================================================
// Main Decoder
// ============================================================================

/**
 * Decode an event log using known signatures
 * Returns null if the event is not recognized
 */
export function decodeEventLog(
  topics: string[],
  data: string
): DecodedLog | null {
  const event = getKnownEvent(topics)
  if (!event) {return null}

  const params: DecodedParam[] = []
  let topicIndex = 1 // topics[0] is the event signature
  let dataOffset = 0

  // Clean data - remove 0x prefix for easier slicing
  const cleanData = data.startsWith('0x') ? data.slice(2) : data

  for (const input of event.inputs) {
    let value: string

    if (input.indexed) {
      // Indexed parameters are in topics
      const topic = topics[topicIndex]
      if (topicIndex < topics.length && topic) {
        value = decodeValue(topic, input.type)
        topicIndex++
      } else {
        value = '0x0'
      }
    } else {
      // Non-indexed parameters are in data
      // Each parameter is 32 bytes (64 hex chars)
      const chunk = cleanData.slice(dataOffset, dataOffset + ABI.WORD_SIZE)
      value = chunk ? decodeValue(`0x${chunk}`, input.type) : '0'
      dataOffset += ABI.WORD_SIZE
    }

    params.push({
      name: input.name,
      type: input.type,
      value,
      indexed: input.indexed,
    })
  }

  return {
    eventName: event.name,
    eventSignature: event.signature,
    params,
  }
}

/**
 * Get event name from signature hash
 * Returns null if not recognized
 */
export function getEventName(sigHash: string): string | null {
  const normalized = sigHash.toLowerCase()
  return KNOWN_EVENTS[normalized]?.name ?? null
}

/**
 * Format decoded value for display
 * Handles large numbers, addresses, etc.
 */
export function formatDecodedValue(value: string, type: string): string {
  if (type === 'address') {
    // Truncate address for display
    if (value.length > ABI.DECIMALS_DISPLAY_LENGTH) {
      return `${value.slice(0, FORMATTING.ADDRESS_START_CHARS)}...${value.slice(-FORMATTING.ADDRESS_END_CHARS)}`
    }
    return value
  }

  if (type === 'uint256' || type === 'int256') {
    // Format large numbers with commas
    try {
      const num = BigInt(value)
      return num.toLocaleString()
    } catch {
      return value
    }
  }

  return value
}

/**
 * Check if a value looks like a token amount (has many zeros)
 * Useful for suggesting decimal formatting
 */
export function isLikelyTokenAmount(value: string): boolean {
  try {
    const num = BigInt(value)
    // Check if divisible by 10^15 (likely has decimals)
    const tokenThreshold = BigInt(10) ** BigInt(ABI.BOOL_NUMERIC_MAX_LENGTH)
    return num >= tokenThreshold && num % tokenThreshold === BigInt(0)
  } catch {
    return false
  }
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(value: string, decimals: number = FORMATTING.DEFAULT_DECIMALS): string {
  try {
    const num = BigInt(value)
    const divisor = BigInt(10) ** BigInt(decimals)
    const integerPart = num / divisor
    const fractionalPart = num % divisor

    if (fractionalPart === BigInt(0)) {
      return integerPart.toLocaleString()
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    const trimmedFractional = fractionalStr.replace(/0+$/, '').slice(0, FORMATTING.ADDRESS_START_CHARS)

    return `${integerPart.toLocaleString()}.${trimmedFractional}`
  } catch {
    return value
  }
}
