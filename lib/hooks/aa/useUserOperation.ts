/**
 * Hook to fetch a single UserOperation by hash
 *
 * Uses three queries:
 * 1. GET_USER_OP — main UserOp data
 * 2. GET_USER_OP_REVERT — revert reason (only if UserOp failed)
 * 3. GET_ACCOUNT_DEPLOYMENT — deployment info (factory, etc.)
 */

'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_USER_OP, GET_USER_OP_REVERT, GET_ACCOUNT_DEPLOYMENT } from '@/lib/apollo/queries/aa'
import { transformUserOperation } from '@/lib/utils/aa-transforms'
import type {
  UserOperation,
  RawUserOperation,
  RawUserOpRevert,
  RawAccountDeployment,
  UserOpRevert,
  AccountDeployment,
} from '@/types/aa'
import { transformUserOpRevert, transformAccountDeployment } from '@/lib/utils/aa-transforms'

interface UseUserOperationResult {
  userOp: UserOperation | null
  revertInfo: UserOpRevert | null
  deploymentInfo: AccountDeployment | null
  loading: boolean
  error: Error | null
}

export function useUserOperation(hash: string | null): UseUserOperationResult {
  const {
    data: opData,
    loading: opLoading,
    error: opError,
  } = useQuery(GET_USER_OP, {
    variables: { hash },
    skip: !hash,
    fetchPolicy: 'cache-and-network',
  })

  const rawOp = (opData?.userOp as RawUserOperation | null) ?? null
  const isFailed = rawOp ? !rawOp.success : false

  // Only fetch revert reason if the UserOp failed
  const {
    data: revertData,
    loading: revertLoading,
  } = useQuery(GET_USER_OP_REVERT, {
    variables: { hash },
    skip: !hash || !isFailed,
    fetchPolicy: 'cache-and-network',
  })

  // Fetch deployment info (may or may not exist)
  const {
    data: deployData,
    loading: deployLoading,
  } = useQuery(GET_ACCOUNT_DEPLOYMENT, {
    variables: { hash },
    skip: !hash,
    fetchPolicy: 'cache-and-network',
  })

  const userOp = useMemo(() => {
    if (!rawOp) { return null }
    return transformUserOperation(rawOp)
  }, [rawOp])

  const revertInfo = useMemo(() => {
    const raw = (revertData?.userOpRevert as RawUserOpRevert | null) ?? null
    if (!raw) { return null }
    return transformUserOpRevert(raw)
  }, [revertData])

  const deploymentInfo = useMemo(() => {
    const raw = (deployData?.accountDeployment as RawAccountDeployment | null) ?? null
    if (!raw) { return null }
    return transformAccountDeployment(raw)
  }, [deployData])

  return {
    userOp,
    revertInfo,
    deploymentInfo,
    loading: opLoading || (isFailed && revertLoading) || deployLoading,
    error: opError ?? null,
  }
}
