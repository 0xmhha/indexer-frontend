'use client'

import { gql, useQuery } from '@apollo/client'

// Query for WBFT block metadata
const GET_WBFT_BLOCK = gql`
  query GetWBFTBlock($number: String!) {
    wbftBlock(number: $number) {
      number
      round
      step
      proposer
      lockRound
      lockHash
      commitRound
      commitHash
      validatorSet
      voterBitmap
      timestamp
    }
  }
`

// Query for current epoch information
const GET_CURRENT_EPOCH = gql`
  query GetCurrentEpoch {
    currentEpoch {
      epochNumber
      startBlock
      endBlock
      startTime
      endTime
      validatorCount
      totalStake
      status
    }
  }
`

// Query for specific epoch by number
const GET_EPOCH_BY_NUMBER = gql`
  query GetEpochByNumber($epochNumber: String!) {
    epochByNumber(epochNumber: $epochNumber) {
      epochNumber
      startBlock
      endBlock
      startTime
      endTime
      validatorCount
      totalStake
      status
      validators {
        address
        stake
        votingPower
      }
    }
  }
`

// Query for validator signing statistics
const GET_VALIDATOR_SIGNING_STATS = gql`
  query GetValidatorSigningStats(
    $validator: Address
    $epochNumber: String
    $limit: Int
    $offset: Int
  ) {
    validatorSigningStats(
      filter: { validator: $validator, epochNumber: $epochNumber }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        validator
        epochNumber
        totalBlocks
        signedBlocks
        missedBlocks
        signingRate
        startBlock
        endBlock
        lastSignedBlock
        lastMissedBlock
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Query for block signers
const GET_BLOCK_SIGNERS = gql`
  query GetBlockSigners($blockNumber: String!) {
    blockSigners(blockNumber: $blockNumber) {
      blockNumber
      signers
      bitmap
      timestamp
    }
  }
`

// Query for validator list with pagination
const GET_VALIDATORS = gql`
  query GetValidators($epochNumber: String, $limit: Int, $offset: Int) {
    validators(
      filter: { epochNumber: $epochNumber }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        address
        stake
        votingPower
        isActive
        joinedEpoch
        lastActiveEpoch
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Types
export interface WBFTBlock {
  number: string
  round: number
  step: string
  proposer: string
  lockRound?: number
  lockHash?: string
  commitRound: number
  commitHash: string
  validatorSet: string[]
  voterBitmap: string
  timestamp: string
}

export interface Epoch {
  epochNumber: string
  startBlock: string
  endBlock: string
  startTime: string
  endTime?: string
  validatorCount: number
  totalStake: string
  status: string
  validators?: ValidatorInEpoch[]
}

export interface ValidatorInEpoch {
  address: string
  stake: string
  votingPower: number
}

export interface ValidatorSigningStats {
  validator: string
  epochNumber: string
  totalBlocks: number
  signedBlocks: number
  missedBlocks: number
  signingRate: number
  startBlock: string
  endBlock: string
  lastSignedBlock?: string
  lastMissedBlock?: string
}

export interface BlockSigners {
  blockNumber: string
  signers: string[]
  bitmap: string
  timestamp: string
}

export interface Validator {
  address: string
  stake: string
  votingPower: number
  isActive: boolean
  joinedEpoch: string
  lastActiveEpoch: string
}

/**
 * Hook to fetch WBFT block metadata
 */
export function useWBFTBlock(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_WBFT_BLOCK, {
    variables: { number: blockNumber },
    returnPartialData: true,
    skip: !blockNumber,
  })

  const effectiveData = data ?? previousData
  const wbftBlock: WBFTBlock | null = effectiveData?.wbftBlock ?? null

  return {
    wbftBlock,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch current epoch information
 */
export function useCurrentEpoch() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_CURRENT_EPOCH, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const currentEpoch: Epoch | null = effectiveData?.currentEpoch ?? null

  return {
    currentEpoch,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch epoch by number
 */
export function useEpochByNumber(epochNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_EPOCH_BY_NUMBER, {
    variables: { epochNumber },
    returnPartialData: true,
    skip: !epochNumber,
  })

  const effectiveData = data ?? previousData
  const epoch: Epoch | null = effectiveData?.epochByNumber ?? null

  return {
    epoch,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch validator signing statistics
 */
export function useValidatorSigningStats(
  params: {
    validator?: string
    epochNumber?: string
    limit?: number
    offset?: number
  } = {}
) {
  const { validator, epochNumber, limit = 20, offset = 0 } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_VALIDATOR_SIGNING_STATS,
    {
      variables: {
        ...(validator && { validator }),
        ...(epochNumber && { epochNumber }),
        limit,
        offset,
      },
      returnPartialData: true,
    }
  )

  const effectiveData = data ?? previousData
  const stats: ValidatorSigningStats[] = effectiveData?.validatorSigningStats?.nodes ?? []
  const totalCount = effectiveData?.validatorSigningStats?.totalCount ?? 0
  const pageInfo = effectiveData?.validatorSigningStats?.pageInfo

  return {
    stats,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch block signers
 */
export function useBlockSigners(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLOCK_SIGNERS, {
    variables: { blockNumber },
    returnPartialData: true,
    skip: !blockNumber,
  })

  const effectiveData = data ?? previousData
  const blockSigners: BlockSigners | null = effectiveData?.blockSigners ?? null

  return {
    blockSigners,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to fetch validators list
 */
export function useValidators(
  params: {
    epochNumber?: string
    limit?: number
    offset?: number
  } = {}
) {
  const { epochNumber, limit = 20, offset = 0 } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_VALIDATORS, {
    variables: {
      ...(epochNumber && { epochNumber }),
      limit,
      offset,
    },
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const validators: Validator[] = effectiveData?.validators?.nodes ?? []
  const totalCount = effectiveData?.validators?.totalCount ?? 0
  const pageInfo = effectiveData?.validators?.pageInfo

  return {
    validators,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}
