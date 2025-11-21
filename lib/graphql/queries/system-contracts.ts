import { gql } from '@apollo/client'

// ============================================================================
// Native Coin Adapter Queries
// ============================================================================

export const GET_TOTAL_SUPPLY = gql`
  query GetTotalSupply {
    totalSupply
  }
`

export const GET_ACTIVE_MINTERS = gql`
  query GetActiveMinters {
    activeMinters {
      address
      allowance
      isActive
    }
  }
`

export const GET_MINTER_ALLOWANCE = gql`
  query GetMinterAllowance($minter: Address!) {
    minterAllowance(minter: $minter)
  }
`

export const GET_MINT_EVENTS = gql`
  query GetMintEvents($filter: SystemContractEventFilter!, $pagination: PaginationInput) {
    mintEvents(filter: $filter, pagination: $pagination) {
      nodes {
        blockNumber
        transactionHash
        minter
        to
        amount
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_BURN_EVENTS = gql`
  query GetBurnEvents($filter: SystemContractEventFilter!, $pagination: PaginationInput) {
    burnEvents(filter: $filter, pagination: $pagination) {
      nodes {
        blockNumber
        transactionHash
        burner
        amount
        timestamp
        withdrawalId
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// ============================================================================
// Governance Queries
// ============================================================================

export const GET_PROPOSALS = gql`
  query GetProposals($filter: ProposalFilter!, $pagination: PaginationInput) {
    proposals(filter: $filter, pagination: $pagination) {
      nodes {
        contract
        proposalId
        proposer
        actionType
        callData
        memberVersion
        requiredApprovals
        approved
        rejected
        status
        createdAt
        executedAt
        blockNumber
        transactionHash
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_PROPOSAL = gql`
  query GetProposal($contract: Address!, $proposalId: BigInt!) {
    proposal(contract: $contract, proposalId: $proposalId) {
      contract
      proposalId
      proposer
      actionType
      callData
      memberVersion
      requiredApprovals
      approved
      rejected
      status
      createdAt
      executedAt
      blockNumber
      transactionHash
    }
  }
`

export const GET_PROPOSAL_VOTES = gql`
  query GetProposalVotes($contract: Address!, $proposalId: BigInt!) {
    proposalVotes(contract: $contract, proposalId: $proposalId) {
      contract
      proposalId
      voter
      approval
      blockNumber
      transactionHash
      timestamp
    }
  }
`

export const GET_ACTIVE_VALIDATORS = gql`
  query GetActiveValidators {
    activeValidators {
      address
      isActive
    }
  }
`

export const GET_BLACKLISTED_ADDRESSES = gql`
  query GetBlacklistedAddresses {
    blacklistedAddresses
  }
`
