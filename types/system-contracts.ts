/**
 * System Contracts & Governance TypeScript Types
 */

import { ProposalStatus } from '@/lib/config/system-contracts'

// ============================================================================
// Native Coin Adapter (Token Minting/Burning)
// ============================================================================

export interface MinterInfo {
  address: string
  allowance: bigint
  isActive: boolean
}

export interface MintEvent {
  blockNumber: bigint
  transactionHash: string
  minter: string
  to: string
  amount: bigint
  timestamp: bigint
}

export interface BurnEvent {
  blockNumber: bigint
  transactionHash: string
  burner: string
  amount: bigint
  timestamp: bigint
  withdrawalId: string | null
}

export interface SystemContractEventFilter {
  fromBlock?: bigint
  toBlock?: bigint
  minter?: string
  burner?: string
}

export interface PaginationInput {
  limit: number
  offset: number
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface MintEventsResponse {
  nodes: MintEvent[]
  totalCount: number
  pageInfo: PageInfo
}

export interface BurnEventsResponse {
  nodes: BurnEvent[]
  totalCount: number
  pageInfo: PageInfo
}

// ============================================================================
// Governance (Proposals & Voting)
// ============================================================================

export interface Proposal {
  contract: string
  proposalId: bigint
  proposer: string
  actionType: string
  callData: string
  memberVersion: bigint
  requiredApprovals: number
  approved: number
  rejected: number
  status: ProposalStatus
  createdAt: bigint
  executedAt: bigint | null
  blockNumber: bigint
  transactionHash: string
}

export interface ProposalVote {
  contract: string
  proposalId: bigint
  voter: string
  approval: boolean
  blockNumber: bigint
  transactionHash: string
  timestamp: bigint
}

export interface ProposalFilter {
  contract?: string
  status?: ProposalStatus
  proposer?: string
  fromBlock?: bigint
  toBlock?: bigint
}

export interface ProposalsResponse {
  nodes: Proposal[]
  totalCount: number
  pageInfo: PageInfo
}

export interface ValidatorInfo {
  address: string
  isActive: boolean
}

// ============================================================================
// GraphQL Response Types (Raw)
// ============================================================================

export interface RawMinterInfo {
  address: string
  allowance: string
  isActive: boolean
}

export interface RawMintEvent {
  blockNumber: string
  transactionHash: string
  minter: string
  to: string
  amount: string
  timestamp: string
}

export interface RawBurnEvent {
  blockNumber: string
  transactionHash: string
  burner: string
  amount: string
  timestamp: string
  withdrawalId: string | null
}

export interface RawProposal {
  contract: string
  proposalId: string
  proposer: string
  actionType: string
  callData: string
  memberVersion: string
  requiredApprovals: number
  approved: number
  rejected: number
  status: string
  createdAt: string
  executedAt: string | null
  blockNumber: string
  transactionHash: string
}

export interface RawProposalVote {
  contract: string
  proposalId: string
  voter: string
  approval: boolean
  blockNumber: string
  transactionHash: string
  timestamp: string
}
