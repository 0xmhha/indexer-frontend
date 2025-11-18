/**
 * Contract ABI types
 */

export interface AbiInput {
  name: string
  type: string
  internalType?: string
  components?: AbiInput[]
}

export interface AbiOutput {
  name: string
  type: string
  internalType?: string
  components?: AbiOutput[]
}

export interface AbiFunction {
  type: 'function' | 'constructor' | 'event' | 'fallback' | 'receive'
  name?: string
  inputs: AbiInput[]
  outputs?: AbiOutput[]
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
}

export type ContractABI = AbiFunction[]
