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

// ============================================================================
// Deposit Mint Proposal (GovMinter)
// ============================================================================

export interface RawDepositMintProposal {
  proposalId: string
  requester: string
  beneficiary: string
  amount: string
  depositId: string
  bankReference: string
  status: string
  blockNumber: string
  transactionHash: string
  timestamp: string
}

export interface DepositMintProposal {
  proposalId: bigint
  requester: string
  beneficiary: string
  amount: bigint
  depositId: string
  bankReference: string
  status: ProposalStatus
  blockNumber: bigint
  transactionHash: string
  timestamp: bigint
}

// ============================================================================
// MaxProposalsUpdate Event (GovBase 공통)
// ============================================================================

export interface RawMaxProposalsUpdateEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  oldMax: string
  newMax: string
  timestamp: string
}

export interface MaxProposalsUpdateEvent {
  contract: string
  blockNumber: bigint
  transactionHash: string
  oldMax: bigint
  newMax: bigint
  timestamp: bigint
}

// ============================================================================
// ProposalExecutionSkipped Event (GovCouncil)
// ============================================================================

export interface RawProposalExecutionSkippedEvent {
  contract: string
  blockNumber: string
  transactionHash: string
  account: string
  proposalId: string
  reason: string
  timestamp: string
}

export interface ProposalExecutionSkippedEvent {
  contract: string
  blockNumber: bigint
  transactionHash: string
  account: string
  proposalId: bigint
  reason: string
  timestamp: bigint
}

/**
 * Possible reason values for ProposalExecutionSkippedEvent:
 * - ALREADY_BLACKLISTED: 이미 블랙리스트에 있음
 * - NOT_IN_BLACKLIST: 블랙리스트에 없음
 * - ALREADY_AUTHORIZED: 이미 인가됨
 * - NOT_AUTHORIZED: 인가되지 않음
 * - GovCouncil: blacklist call failed: 블랙리스트 호출 실패
 * - GovCouncil: authorize call failed: 인가 호출 실패
 */
export type ProposalExecutionSkippedReason =
  | 'ALREADY_BLACKLISTED'
  | 'NOT_IN_BLACKLIST'
  | 'ALREADY_AUTHORIZED'
  | 'NOT_AUTHORIZED'
  | 'GovCouncil: blacklist call failed'
  | 'GovCouncil: authorize call failed'

// ============================================================================
// System Contract Event Subscription (WebSocket)
// ============================================================================

/**
 * Filter for system contract event subscriptions
 */
export interface SystemContractSubscriptionFilter {
  /** Filter by specific contract address (optional) */
  contract?: string
  /** Filter by specific event types (optional) */
  eventTypes?: string[]
}

/**
 * System contract event message received via WebSocket subscription
 */
export interface SystemContractEventMessage {
  /** Contract address where the event occurred */
  contract: string
  /** Event name (e.g., 'Mint', 'Burn', 'ProposalCreated') */
  eventName: string
  /** Block number where the event was emitted */
  blockNumber: string
  /** Transaction hash */
  transactionHash: string
  /** Log index within the transaction */
  logIndex: number
  /** Event data as JSON string - needs JSON.parse() */
  data: string
  /** Event timestamp */
  timestamp: string
}

/**
 * Parsed system contract event with typed data
 */
export interface ParsedSystemContractEvent<T = Record<string, unknown>> {
  contract: string
  eventName: SystemContractEventName
  blockNumber: bigint
  transactionHash: string
  logIndex: number
  data: T
  timestamp: bigint
}

// ============================================================================
// System Contract Event Types
// ============================================================================

/**
 * All supported system contract event names
 */
export type SystemContractEventName =
  // NativeCoinAdapter events
  | 'Mint'
  | 'Burn'
  | 'MinterConfigured'
  | 'MinterRemoved'
  | 'MasterMinterChanged'
  | 'Transfer'
  | 'Approval'
  // GovBase common events
  | 'ProposalCreated'
  | 'ProposalVoted'
  | 'ProposalApproved'
  | 'ProposalRejected'
  | 'ProposalExecuted'
  | 'ProposalFailed'
  | 'ProposalExpired'
  | 'ProposalCancelled'
  | 'MemberAdded'
  | 'MemberRemoved'
  | 'MemberChanged'
  | 'QuorumUpdated'
  | 'MaxProposalsPerMemberUpdated'
  // GovValidator events
  | 'GasTipUpdated'
  // GovMasterMinter events
  | 'MaxMinterAllowanceUpdated'
  | 'EmergencyPaused'
  | 'EmergencyUnpaused'
  // GovMinter events
  | 'DepositMintProposed'
  | 'BurnPrepaid'
  | 'BurnExecuted'
  // GovCouncil events
  | 'AddressBlacklisted'
  | 'AddressUnblacklisted'
  | 'AuthorizedAccountAdded'
  | 'AuthorizedAccountRemoved'
  | 'ProposalExecutionSkipped'

// ============================================================================
// Event Data Types (parsed from JSON data field)
// ============================================================================

/** Mint event data */
export interface MintEventData {
  minter: string
  to: string
  amount: string
}

/** Burn event data */
export interface BurnEventData {
  burner: string
  amount: string
  withdrawalId?: string
}

/** MinterConfigured event data */
export interface MinterConfiguredEventData {
  minter: string
  allowance: string
}

/** MinterRemoved event data */
export interface MinterRemovedEventData {
  minter: string
}

/** MasterMinterChanged event data */
export interface MasterMinterChangedEventData {
  newMasterMinter: string
}

/** ProposalCreated event data */
export interface ProposalCreatedEventData {
  proposalId: string
  proposer: string
  actionType: string
  memberVersion: string
  requiredApprovals: string
  callData: string
}

/** ProposalVoted event data */
export interface ProposalVotedEventData {
  proposalId: string
  voter: string
  approval: boolean
  approved: string
  rejected: string
}

/** ProposalApproved event data */
export interface ProposalApprovedEventData {
  proposalId: string
  approver: string
}

/** ProposalRejected event data */
export interface ProposalRejectedEventData {
  proposalId: string
  rejector: string
}

/** ProposalExecuted event data */
export interface ProposalExecutedEventData {
  proposalId: string
  executor: string
  success: boolean
}

/** ProposalFailed/Expired/Cancelled event data */
export interface ProposalStatusChangeEventData {
  proposalId: string
  executor?: string
  canceller?: string
}

/** MemberAdded event data */
export interface MemberAddedEventData {
  member: string
  totalMembers: number
  newQuorum: number
}

/** MemberRemoved event data */
export interface MemberRemovedEventData {
  member: string
  totalMembers: number
  newQuorum: number
}

/** MemberChanged event data */
export interface MemberChangedEventData {
  oldMember: string
  newMember: string
}

/** QuorumUpdated event data */
export interface QuorumUpdatedEventData {
  oldQuorum: number
  newQuorum: number
}

/** MaxProposalsPerMemberUpdated event data */
export interface MaxProposalsPerMemberUpdatedEventData {
  oldMax: number
  newMax: number
}

/** GasTipUpdated event data */
export interface GasTipUpdatedEventData {
  oldTip: string
  newTip: string
  updater: string
}

/** MaxMinterAllowanceUpdated event data */
export interface MaxMinterAllowanceUpdatedEventData {
  oldLimit: string
  newLimit: string
}

/** EmergencyPaused/Unpaused event data */
export interface EmergencyPauseEventData {
  proposalId: string
}

/** DepositMintProposed event data */
export interface DepositMintProposedEventData {
  proposalId: string
  depositId: string
  requester: string
  beneficiary: string
  amount: string
  bankReference: string
}

/** BurnPrepaid event data */
export interface BurnPrepaidEventData {
  user: string
  amount: string
}

/** BurnExecuted event data */
export interface BurnExecutedEventData {
  from: string
  amount: string
  withdrawalId: string
}

/** AddressBlacklisted/Unblacklisted event data */
export interface BlacklistEventData {
  account: string
  proposalId: string
}

/** AuthorizedAccountAdded/Removed event data */
export interface AuthorizedAccountEventData {
  account: string
  proposalId: string
}

/** ProposalExecutionSkipped event data */
export interface ProposalExecutionSkippedEventData {
  account: string
  proposalId: string
  reason: ProposalExecutionSkippedReason
}

/** Transfer event data (ERC20) */
export interface TransferEventData {
  from: string
  to: string
  value: string
}

/** Approval event data (ERC20) */
export interface ApprovalEventData {
  owner: string
  spender: string
  value: string
}

// ============================================================================
// Dynamic Contract Registration
// ============================================================================

/**
 * Input for registering a dynamic contract
 */
export interface RegisterContractInput {
  /** Contract address to register */
  address: string
  /** Contract name */
  name: string
  /** Contract ABI as JSON string */
  abi: string
  /** Optional starting block number (defaults to current block) */
  blockNumber?: string
}

/**
 * Registered contract information
 */
export interface RegisteredContract {
  /** Contract address */
  address: string
  /** Contract name */
  name: string
  /** Contract ABI as JSON string */
  abi: string
  /** Block number from which events are being indexed */
  blockNumber: string
  /** Whether the contract is verified */
  isVerified: boolean
  /** Registration timestamp */
  registeredAt: string
  /** Event names that can be emitted */
  events: string[]
}

/**
 * Parsed registered contract with proper types
 */
export interface ParsedRegisteredContract {
  address: string
  name: string
  abi: string
  blockNumber: bigint
  isVerified: boolean
  registeredAt: bigint
  events: string[]
}

/**
 * Filter for dynamic contract event subscriptions
 */
export interface DynamicContractSubscriptionFilter {
  /** Filter by specific contract address (optional) */
  contract?: string
  /** Filter by specific event names (optional) */
  eventNames?: string[]
}

/**
 * Dynamic contract event message received via WebSocket subscription
 */
export interface DynamicContractEventMessage {
  /** Contract address where the event occurred */
  contract: string
  /** Contract name */
  contractName: string
  /** Event name */
  eventName: string
  /** Block number where the event was emitted */
  blockNumber: string
  /** Transaction hash */
  txHash: string
  /** Log index within the transaction */
  logIndex: number
  /** Event data as JSON string - needs JSON.parse() */
  data: string
  /** Event timestamp */
  timestamp: string
}

/**
 * Parsed dynamic contract event with typed data
 */
export interface ParsedDynamicContractEvent<T = Record<string, unknown>> {
  contract: string
  contractName: string
  eventName: string
  blockNumber: bigint
  txHash: string
  logIndex: number
  data: T
  timestamp: bigint
}
