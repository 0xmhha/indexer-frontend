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

// ============================================================================
// Deposit Mint Proposal Queries (GovMinter)
// ============================================================================

export const GET_DEPOSIT_MINT_PROPOSALS = gql`
  query GetDepositMintProposals($filter: SystemContractEventFilter!, $status: ProposalStatus) {
    depositMintProposals(filter: $filter, status: $status) {
      proposalId
      requester
      beneficiary
      amount
      depositId
      bankReference
      status
      blockNumber
      transactionHash
      timestamp
    }
  }
`

// ============================================================================
// MaxProposalsUpdate Queries (GovBase 공통)
// ============================================================================

export const GET_MAX_PROPOSALS_UPDATE_HISTORY = gql`
  query GetMaxProposalsUpdateHistory($contract: Address!) {
    maxProposalsUpdateHistory(contract: $contract) {
      contract
      blockNumber
      transactionHash
      oldMax
      newMax
      timestamp
    }
  }
`

// ============================================================================
// ProposalExecutionSkipped Queries (GovCouncil)
// ============================================================================

export const GET_PROPOSAL_EXECUTION_SKIPPED = gql`
  query GetProposalExecutionSkippedEvents($contract: Address!, $proposalId: BigInt) {
    proposalExecutionSkippedEvents(contract: $contract, proposalId: $proposalId) {
      contract
      blockNumber
      transactionHash
      account
      proposalId
      reason
      timestamp
    }
  }
`

// ============================================================================
// System Contract Event Subscriptions (WebSocket)
// ============================================================================

/**
 * Subscribe to all system contract events
 * Filter by contract address and/or event types
 */
export const SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION = gql`
  subscription SystemContractEvents($filter: SystemContractSubscriptionFilter) {
    systemContractEvents(filter: $filter) {
      contract
      eventName
      blockNumber
      transactionHash
      logIndex
      data
      timestamp
    }
  }
`

// ============================================================================
// Dynamic Contract Registration
// ============================================================================

/**
 * Register a new contract for event indexing
 */
export const REGISTER_CONTRACT = gql`
  mutation RegisterContract($input: RegisterContractInput!) {
    registerContract(input: $input) {
      address
      name
      abi
      registeredAt
      blockNumber
      isVerified
      events
    }
  }
`

/**
 * Unregister a contract from event indexing
 */
export const UNREGISTER_CONTRACT = gql`
  mutation UnregisterContract($address: Address!) {
    unregisterContract(address: $address)
  }
`

/**
 * Get all registered contracts
 */
export const GET_REGISTERED_CONTRACTS = gql`
  query GetRegisteredContracts {
    registeredContracts {
      address
      name
      events
      isVerified
      registeredAt
    }
  }
`

/**
 * Get a specific registered contract by address
 */
export const GET_REGISTERED_CONTRACT = gql`
  query GetRegisteredContract($address: Address!) {
    registeredContract(address: $address) {
      address
      name
      abi
      events
      isVerified
      registeredAt
    }
  }
`

// ============================================================================
// Dynamic Contract Event Subscriptions (WebSocket)
// ============================================================================

/**
 * Subscribe to events from dynamically registered contracts
 * Filter by contract address and/or event names
 */
export const DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION = gql`
  subscription DynamicContractEvents($filter: DynamicContractSubscriptionFilter) {
    dynamicContractEvents(filter: $filter) {
      contract
      contractName
      eventName
      blockNumber
      txHash
      logIndex
      data
      timestamp
    }
  }
`
