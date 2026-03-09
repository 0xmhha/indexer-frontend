/**
 * AA (Account Abstraction) Data Transform Utilities
 *
 * Transforms string-based GraphQL responses to proper TypeScript types.
 * Handles field name mapping: txHash→bundleTxHash, timestamp→blockTimestamp
 * Handles zero address → null for paymaster field.
 */

import { toBigInt, toNumber, toDate } from './graphql-transforms'
import { ZERO_ADDRESS } from '@/types/aa'
import type {
  RawUserOperation,
  UserOperation,
  RawUserOperationListItem,
  UserOperationListItem,
  RawBundlerStats,
  BundlerStats,
  RawPaymasterStats,
  PaymasterStats,
  RawAccountDeployment,
  AccountDeployment,
  RawUserOpRevert,
  UserOpRevert,
  RawBundleUserOp,
  BundleUserOp,
} from '@/types/aa'

/** Convert zero address to null for paymaster display */
function normalizePaymaster(address: string): string | null {
  return address === ZERO_ADDRESS ? null : address
}

// ============================================================================
// UserOperation Transforms
// ============================================================================

/** Transform full UserOp detail (from `userOp` query) */
export function transformUserOperation(raw: RawUserOperation): UserOperation {
  return {
    userOpHash: raw.userOpHash,
    bundleTxHash: raw.txHash,
    blockNumber: toNumber(raw.blockNumber),
    blockHash: raw.blockHash,
    txIndex: toNumber(raw.txIndex),
    logIndex: toNumber(raw.logIndex),
    sender: raw.sender,
    paymaster: normalizePaymaster(raw.paymaster),
    nonce: toBigInt(raw.nonce),
    success: raw.success,
    actualGasCost: toBigInt(raw.actualGasCost),
    actualUserOpFeePerGas: toBigInt(raw.actualUserOpFeePerGas),
    bundler: raw.bundler,
    entryPoint: raw.entryPoint,
    blockTimestamp: toDate(raw.timestamp),
  }
}

/** Transform list item from paginated queries */
export function transformUserOperationListItem(raw: RawUserOperationListItem): UserOperationListItem {
  return {
    userOpHash: raw.userOpHash,
    sender: raw.sender,
    success: raw.success,
    paymaster: normalizePaymaster(raw.paymaster),
    bundler: raw.bundler,
    blockNumber: toNumber(raw.blockNumber),
    blockTimestamp: toDate(raw.timestamp),
    actualGasCost: toBigInt(raw.actualGasCost),
    entryPoint: raw.entryPoint,
  }
}

export function transformUserOperationListItems(raws: RawUserOperationListItem[]): UserOperationListItem[] {
  return raws.map(transformUserOperationListItem)
}

// ============================================================================
// Bundler / Paymaster Stats Transforms
// ============================================================================

export function transformBundlerStats(raw: RawBundlerStats): BundlerStats {
  return {
    address: raw.address,
    totalOps: toNumber(raw.totalOps),
    successfulOps: toNumber(raw.successfulOps),
    failedOps: toNumber(raw.failedOps),
    totalGasSponsored: toBigInt(raw.totalGasSponsored),
    lastActivityBlock: toNumber(raw.lastActivityBlock),
    lastActivityTime: toDate(raw.lastActivityTime),
  }
}

export function transformPaymasterStats(raw: RawPaymasterStats): PaymasterStats {
  return {
    address: raw.address,
    totalOps: toNumber(raw.totalOps),
    successfulOps: toNumber(raw.successfulOps),
    failedOps: toNumber(raw.failedOps),
    totalGasSponsored: toBigInt(raw.totalGasSponsored),
    lastActivityBlock: toNumber(raw.lastActivityBlock),
    lastActivityTime: toDate(raw.lastActivityTime),
  }
}

// ============================================================================
// Account Deployment Transforms
// ============================================================================

export function transformAccountDeployment(raw: RawAccountDeployment): AccountDeployment {
  return {
    userOpHash: raw.userOpHash,
    sender: raw.sender,
    factory: raw.factory,
    paymaster: normalizePaymaster(raw.paymaster),
    txHash: raw.txHash,
    blockNumber: toNumber(raw.blockNumber),
    logIndex: toNumber(raw.logIndex),
    timestamp: toDate(raw.timestamp),
  }
}

// ============================================================================
// Revert Reason Transforms
// ============================================================================

export function transformUserOpRevert(raw: RawUserOpRevert): UserOpRevert {
  return {
    userOpHash: raw.userOpHash,
    sender: raw.sender,
    nonce: toBigInt(raw.nonce),
    revertReason: raw.revertReason,
    txHash: raw.txHash,
    blockNumber: toNumber(raw.blockNumber),
    logIndex: toNumber(raw.logIndex),
    revertType: raw.revertType,
    timestamp: toDate(raw.timestamp),
  }
}

// ============================================================================
// Bundle (UserOps in Transaction) Transforms
// ============================================================================

export function transformBundleUserOp(raw: RawBundleUserOp): BundleUserOp {
  return {
    userOpHash: raw.userOpHash,
    sender: raw.sender,
    paymaster: normalizePaymaster(raw.paymaster),
    success: raw.success,
    actualGasCost: toBigInt(raw.actualGasCost),
    bundler: raw.bundler,
    entryPoint: raw.entryPoint,
  }
}

export function transformBundleUserOps(raws: RawBundleUserOp[]): BundleUserOp[] {
  return raws.map(transformBundleUserOp)
}
