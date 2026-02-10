'use client'

/**
 * Governance Hooks - Re-exports from domain-specific files
 * All governance-related hooks for system contracts (0x1001-0x1004)
 */

// Re-export SYSTEM_CONTRACTS from subscriptions
export { SYSTEM_CONTRACTS } from './useContractSubscriptions'

// Proposals
export {
  ProposalStatus,
  type BackendProposalStatus,
  type ProposalStatusFilter,
  type Proposal,
  type ProposalVote,
  isAddressBlacklisted,
  filterToBackendStatus,
  getProposalStatusLabel,
  getProposalStatusColor,
  useProposals,
  useProposal,
  useProposalVotes,
} from './useGovernanceProposals'

// Validator + Minter + Common
export {
  type Validator,
  type ValidatorInfo,
  type GasTipUpdateEvent,
  type ValidatorChangeEvent,
  type ValidatorHistoryEvent,
  type EmergencyPauseEvent,
  type DepositMintProposal,
  type BurnHistoryEvent,
  type MemberChangeEvent,
  type MemberHistoryEvent,
  type MaxProposalsUpdateEvent,
  type ProposalExecutionSkippedEvent,
  type ProposalExecutionSkippedReason,
  useActiveValidators,
  useGasTipHistory,
  useValidatorHistory,
  useMinterConfigHistory,
  useEmergencyPauseHistory,
  useDepositMintProposals,
  useBurnHistory,
  useMemberHistory,
  useMaxProposalsUpdateHistory,
  useProposalExecutionSkipped,
} from './useValidatorGovernance'

// Blacklist
export {
  type BlacklistEvent,
  type BlacklistHistoryEvent,
  useBlacklistedAddresses,
  useBlacklistHistory,
  useAuthorizedAccounts,
} from './useGovernanceBlacklist'
