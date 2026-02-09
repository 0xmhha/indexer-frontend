import { gql } from '@apollo/client'

// ============================================================================
// RPC Proxy Queries
// These queries use the backend RPC Proxy service instead of direct RPC calls
// ============================================================================

/**
 * Contract Call - Read-only contract method call via RPC Proxy
 */
export const CONTRACT_CALL = gql`
  query ContractCall(
    $address: String!
    $method: String!
    $params: String
    $abi: String
  ) {
    contractCall(
      address: $address
      method: $method
      params: $params
      abi: $abi
    ) {
      result
      rawResult
      decoded
    }
  }
`

/**
 * Transaction Status - Real-time transaction status via RPC Proxy
 */
export const TRANSACTION_STATUS = gql`
  query TransactionStatus($txHash: String!) {
    transactionStatus(txHash: $txHash) {
      txHash
      status
      blockNumber
      blockHash
      confirmations
      gasUsed
    }
  }
`

/**
 * Internal Transactions via debug_traceTransaction RPC
 */
export const INTERNAL_TRANSACTIONS_RPC = gql`
  query InternalTransactionsRPC($txHash: String!) {
    internalTransactionsRPC(txHash: $txHash) {
      txHash
      totalCount
      internalTransactions {
        type
        from
        to
        value
        gas
        gasUsed
        input
        output
        error
        depth
        traceAddress
      }
    }
  }
`

/**
 * RPC Proxy Metrics - Service health and performance metrics
 */
export const RPC_PROXY_METRICS = gql`
  query RPCProxyMetrics {
    rpcProxyMetrics {
      totalRequests
      successfulRequests
      failedRequests
      cacheHits
      cacheMisses
      averageLatency
      queueDepth
      activeWorkers
      circuitState
    }
  }
`

/**
 * Native Balance - Get native coin balance via eth_getBalance RPC
 * Returns the balance in wei as a string
 * NOTE: ethGetBalance query not available in current schema
 * TODO: Use addressBalance query or liveBalance subscription instead
 */
// export const ETH_GET_BALANCE = gql`
//   query EthGetBalance($address: String!, $blockNumber: BigInt) {
//     ethGetBalance(address: $address, blockNumber: $blockNumber)
//   }
// `
