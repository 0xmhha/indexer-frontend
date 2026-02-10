import type { TransformedFeePayerSignature, Log } from '@/types/graphql'

export interface TransactionData {
  hash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  type: number
  nonce: number
  chainId?: number | null
  input: string
  feePayer?: string | null
  feePayerSignatures?: TransformedFeePayerSignature[] | null
  receipt?: {
    status: number | string
    gasUsed: string
    contractAddress?: string | null
    logs?: Log[]
  } | null
}

export interface ParsedReceipt {
  gasUsed: string
  gasUsedNumber: number
  effectiveGasPrice: string
  effectiveGasPriceBigInt: bigint
  txCostWei: bigint
  cumulativeGasUsed: string
}

export interface FullReceipt extends ParsedReceipt {
  transactionHash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  status: number
  contractAddress: string | null
  isSuccess: boolean
  isFailed: boolean
  logsBloom?: string
}

export interface SetCodeAuthorization {
  chainId: string | bigint
  address: string
  nonce: string | bigint
  yParity: number
  r: string
  s: string
  authority?: string | null
}
