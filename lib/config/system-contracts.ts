/**
 * System Contract Addresses for Stable-One Chain
 */
export const SYSTEM_CONTRACTS = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

/**
 * Proposal Status enum
 */
export enum ProposalStatus {
  NONE = 'none',
  VOTING = 'voting',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

/**
 * Status color mapping for UI
 */
export const PROPOSAL_STATUS_COLORS = {
  [ProposalStatus.VOTING]: '#3B82F6', // Blue
  [ProposalStatus.APPROVED]: '#10B981', // Green
  [ProposalStatus.EXECUTED]: '#6B7280', // Gray
  [ProposalStatus.REJECTED]: '#EF4444', // Red
  [ProposalStatus.CANCELLED]: '#6B7280', // Gray
  [ProposalStatus.EXPIRED]: '#F59E0B', // Orange
  [ProposalStatus.FAILED]: '#DC2626', // Dark Red
  [ProposalStatus.NONE]: '#6B7280', // Gray
} as const
