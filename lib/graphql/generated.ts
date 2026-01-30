import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Address: { input: string; output: string; }
  BigInt: { input: string; output: string; }
  Bytes: { input: string; output: string; }
  Hash: { input: string; output: string; }
};

export type AccessListEntry = {
  __typename?: 'AccessListEntry';
  address: Scalars['Address']['output'];
  storageKeys: Array<Scalars['Hash']['output']>;
};

export type BalanceHistoryConnection = {
  __typename?: 'BalanceHistoryConnection';
  nodes: Array<BalanceSnapshot>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BalanceSnapshot = {
  __typename?: 'BalanceSnapshot';
  balance: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  delta: Scalars['BigInt']['output'];
  transactionHash?: Maybe<Scalars['Hash']['output']>;
};

export type Block = {
  __typename?: 'Block';
  baseFeePerGas?: Maybe<Scalars['BigInt']['output']>;
  blobGasUsed?: Maybe<Scalars['BigInt']['output']>;
  difficulty: Scalars['BigInt']['output'];
  excessBlobGas?: Maybe<Scalars['BigInt']['output']>;
  extraData: Scalars['Bytes']['output'];
  gasLimit: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  hash: Scalars['Hash']['output'];
  miner: Scalars['Address']['output'];
  nonce: Scalars['Bytes']['output'];
  number: Scalars['BigInt']['output'];
  parentHash: Scalars['Hash']['output'];
  size: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  totalDifficulty?: Maybe<Scalars['BigInt']['output']>;
  transactionCount: Scalars['Int']['output'];
  transactions: Array<Transaction>;
  uncles: Array<Scalars['Hash']['output']>;
  withdrawalsRoot?: Maybe<Scalars['Hash']['output']>;
};

export type BlockConnection = {
  __typename?: 'BlockConnection';
  nodes: Array<Block>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BlockFilter = {
  miner?: InputMaybe<Scalars['Address']['input']>;
  numberFrom?: InputMaybe<Scalars['BigInt']['input']>;
  numberTo?: InputMaybe<Scalars['BigInt']['input']>;
  timestampFrom?: InputMaybe<Scalars['BigInt']['input']>;
  timestampTo?: InputMaybe<Scalars['BigInt']['input']>;
};

export type FeePayerSignature = {
  __typename?: 'FeePayerSignature';
  r: Scalars['Bytes']['output'];
  s: Scalars['Bytes']['output'];
  v: Scalars['BigInt']['output'];
};

export type HistoricalTransactionFilter = {
  fromBlock: Scalars['BigInt']['input'];
  maxValue?: InputMaybe<Scalars['BigInt']['input']>;
  minValue?: InputMaybe<Scalars['BigInt']['input']>;
  successOnly?: InputMaybe<Scalars['Boolean']['input']>;
  toBlock: Scalars['BigInt']['input'];
  txType?: InputMaybe<Scalars['Int']['input']>;
};

export type Log = {
  __typename?: 'Log';
  address: Scalars['Address']['output'];
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  data: Scalars['Bytes']['output'];
  logIndex: Scalars['Int']['output'];
  removed: Scalars['Boolean']['output'];
  topics: Array<Scalars['Hash']['output']>;
  transactionHash: Scalars['Hash']['output'];
  transactionIndex: Scalars['Int']['output'];
};

export type LogConnection = {
  __typename?: 'LogConnection';
  nodes: Array<Log>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type LogFilter = {
  address?: InputMaybe<Scalars['Address']['input']>;
  blockNumberFrom?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumberTo?: InputMaybe<Scalars['BigInt']['input']>;
  topics?: InputMaybe<Array<Scalars['Hash']['input']>>;
};

export type MinerStats = {
  __typename?: 'MinerStats';
  address: Scalars['Address']['output'];
  blockCount: Scalars['BigInt']['output'];
  lastBlockNumber: Scalars['BigInt']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  addressBalance: Scalars['BigInt']['output'];
  balanceHistory: BalanceHistoryConnection;
  block?: Maybe<Block>;
  blockByHash?: Maybe<Block>;
  blockByTimestamp?: Maybe<Block>;
  blockCount: Scalars['BigInt']['output'];
  blocks: BlockConnection;
  blocksByTimeRange: BlockConnection;
  latestHeight: Scalars['BigInt']['output'];
  logs: LogConnection;
  receipt?: Maybe<Receipt>;
  receiptsByBlock: Array<Receipt>;
  tokenBalances: Array<TokenBalance>;
  topMiners: Array<MinerStats>;
  transaction?: Maybe<Transaction>;
  transactionCount: Scalars['BigInt']['output'];
  transactions: TransactionConnection;
  transactionsByAddress: TransactionConnection;
  transactionsByAddressFiltered: TransactionConnection;
};


export type QueryAddressBalanceArgs = {
  address: Scalars['Address']['input'];
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryBalanceHistoryArgs = {
  address: Scalars['Address']['input'];
  fromBlock: Scalars['BigInt']['input'];
  pagination?: InputMaybe<PaginationInput>;
  toBlock: Scalars['BigInt']['input'];
};


export type QueryBlockArgs = {
  number: Scalars['BigInt']['input'];
};


export type QueryBlockByHashArgs = {
  hash: Scalars['Hash']['input'];
};


export type QueryBlockByTimestampArgs = {
  timestamp: Scalars['BigInt']['input'];
};


export type QueryBlocksArgs = {
  filter?: InputMaybe<BlockFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryBlocksByTimeRangeArgs = {
  fromTime: Scalars['BigInt']['input'];
  pagination?: InputMaybe<PaginationInput>;
  toTime: Scalars['BigInt']['input'];
};


export type QueryLogsArgs = {
  filter: LogFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryReceiptArgs = {
  transactionHash: Scalars['Hash']['input'];
};


export type QueryReceiptsByBlockArgs = {
  blockNumber: Scalars['BigInt']['input'];
};


export type QueryTokenBalancesArgs = {
  address: Scalars['Address']['input'];
};


export type QueryTopMinersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTransactionArgs = {
  hash: Scalars['Hash']['input'];
};


export type QueryTransactionsArgs = {
  filter?: InputMaybe<TransactionFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryTransactionsByAddressArgs = {
  address: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryTransactionsByAddressFilteredArgs = {
  address: Scalars['Address']['input'];
  filter: HistoricalTransactionFilter;
  pagination?: InputMaybe<PaginationInput>;
};

export type Receipt = {
  __typename?: 'Receipt';
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  contractAddress?: Maybe<Scalars['Address']['output']>;
  cumulativeGasUsed: Scalars['BigInt']['output'];
  effectiveGasPrice: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  logs: Array<Log>;
  logsBloom: Scalars['Bytes']['output'];
  status: Scalars['Int']['output'];
  transactionHash: Scalars['Hash']['output'];
  transactionIndex: Scalars['Int']['output'];
};

export type TokenBalance = {
  __typename?: 'TokenBalance';
  balance: Scalars['BigInt']['output'];
  contractAddress: Scalars['Address']['output'];
  tokenId?: Maybe<Scalars['BigInt']['output']>;
  tokenType: Scalars['String']['output'];
};

/**
 * EIP-7702 SetCode Authorization
 * Used in SetCodeTxType (0x04) transactions
 */
export type SetCodeAuthorization = {
  __typename?: 'SetCodeAuthorization';
  /** Chain ID for the authorization */
  chainId: Scalars['BigInt']['output'];
  /** Target contract address to delegate code from */
  address: Scalars['Address']['output'];
  /** Nonce of the authorization */
  nonce: Scalars['BigInt']['output'];
  /** Y parity of the signature (0 or 1) */
  yParity: Scalars['Int']['output'];
  /** R component of the signature */
  r: Scalars['Bytes']['output'];
  /** S component of the signature */
  s: Scalars['Bytes']['output'];
  /** Derived authority address (signer of the authorization) */
  authority?: Maybe<Scalars['Address']['output']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  accessList?: Maybe<Array<AccessListEntry>>;
  /** EIP-7702 authorization list for SetCode transactions (type 0x04) */
  authorizationList?: Maybe<Array<SetCodeAuthorization>>;
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  chainId?: Maybe<Scalars['BigInt']['output']>;
  feePayer?: Maybe<Scalars['Address']['output']>;
  feePayerSignatures?: Maybe<Array<FeePayerSignature>>;
  from: Scalars['Address']['output'];
  gas: Scalars['BigInt']['output'];
  gasPrice?: Maybe<Scalars['BigInt']['output']>;
  hash: Scalars['Hash']['output'];
  input: Scalars['Bytes']['output'];
  maxFeePerGas?: Maybe<Scalars['BigInt']['output']>;
  maxPriorityFeePerGas?: Maybe<Scalars['BigInt']['output']>;
  nonce: Scalars['BigInt']['output'];
  r: Scalars['Bytes']['output'];
  receipt?: Maybe<Receipt>;
  s: Scalars['Bytes']['output'];
  to?: Maybe<Scalars['Address']['output']>;
  transactionIndex: Scalars['Int']['output'];
  type: Scalars['Int']['output'];
  v: Scalars['BigInt']['output'];
  value: Scalars['BigInt']['output'];
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  nodes: Array<Transaction>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TransactionFilter = {
  blockNumberFrom?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumberTo?: InputMaybe<Scalars['BigInt']['input']>;
  from?: InputMaybe<Scalars['Address']['input']>;
  to?: InputMaybe<Scalars['Address']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
};

export type GetLatestHeightQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestHeightQuery = { __typename?: 'Query', latestHeight: string };

export type GetBlockQueryVariables = Exact<{
  number: Scalars['BigInt']['input'];
}>;


export type GetBlockQuery = { __typename?: 'Query', block?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null, withdrawalsRoot?: string | null, blobGasUsed?: string | null, excessBlobGas?: string | null, transactions: Array<{ __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, type: number, nonce: string }> } | null };

export type GetBlockByHashQueryVariables = Exact<{
  hash: Scalars['Hash']['input'];
}>;


export type GetBlockByHashQuery = { __typename?: 'Query', blockByHash?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null, withdrawalsRoot?: string | null, blobGasUsed?: string | null, excessBlobGas?: string | null, transactions: Array<{ __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string }> } | null };

export type GetTransactionQueryVariables = Exact<{
  hash: Scalars['Hash']['input'];
}>;


export type GetTransactionQuery = { __typename?: 'Query', transaction?: { __typename?: 'Transaction', hash: string, blockNumber: string, blockHash: string, transactionIndex: number, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, type: number, input: string, nonce: string, v: string, r: string, s: string, chainId?: string | null, feePayer?: string | null, feePayerSignatures?: Array<{ __typename?: 'FeePayerSignature', v: string, r: string, s: string }> | null, receipt?: { __typename?: 'Receipt', status: number, gasUsed: string, cumulativeGasUsed: string, effectiveGasPrice: string, contractAddress?: string | null, logs: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, logIndex: number }> } | null } | null };

export type GetTransactionsByAddressQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTransactionsByAddressQuery = { __typename?: 'Query', transactionsByAddress: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, from: string, to?: string | null, value: string, gas: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAddressBalanceQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
}>;


export type GetAddressBalanceQuery = { __typename?: 'Query', addressBalance: string };

export type GetBalanceHistoryQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetBalanceHistoryQuery = { __typename?: 'Query', balanceHistory: { __typename?: 'BalanceHistoryConnection', totalCount: number, nodes: Array<{ __typename?: 'BalanceSnapshot', blockNumber: string, balance: string, delta: string, transactionHash?: string | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetLogsQueryVariables = Exact<{
  address?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  blockNumberFrom?: InputMaybe<Scalars['String']['input']>;
  blockNumberTo?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLogsQuery = { __typename?: 'Query', logs: { __typename?: 'LogConnection', totalCount: number, nodes: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, transactionHash: string, logIndex: number }> } };

export type GetBlocksByTimeRangeQueryVariables = Exact<{
  fromTime: Scalars['String']['input'];
  toTime: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetBlocksByTimeRangeQuery = { __typename?: 'Query', blocksByTimeRange: { __typename?: 'BlockConnection', totalCount: number, nodes: Array<{ __typename?: 'Block', number: string, hash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, transactionCount: number }> } };

export type GetNetworkMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNetworkMetricsQuery = { __typename?: 'Query', blockCount: string, transactionCount: string };

export type GetBlocksQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  numberFrom?: InputMaybe<Scalars['String']['input']>;
  numberTo?: InputMaybe<Scalars['String']['input']>;
  miner?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetBlocksQuery = { __typename?: 'Query', blocks: { __typename?: 'BlockConnection', totalCount: number, nodes: Array<{ __typename?: 'Block', number: string, hash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetFilteredTransactionsQueryVariables = Exact<{
  address: Scalars['String']['input'];
  fromBlock: Scalars['String']['input'];
  toBlock: Scalars['String']['input'];
  minValue?: InputMaybe<Scalars['String']['input']>;
  maxValue?: InputMaybe<Scalars['String']['input']>;
  txType?: InputMaybe<Scalars['Int']['input']>;
  successOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetFilteredTransactionsQuery = { __typename?: 'Query', transactionsByAddressFiltered: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, type: number, receipt?: { __typename?: 'Receipt', status: number, gasUsed: string } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetTransactionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  blockNumberFrom?: InputMaybe<Scalars['String']['input']>;
  blockNumberTo?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTransactionsQuery = { __typename?: 'Query', transactions: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, type: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };


export const GetLatestHeightDocument = gql`
    query GetLatestHeight {
  latestHeight
}
    `;

/**
 * __useGetLatestHeightQuery__
 *
 * To run a query within a React component, call `useGetLatestHeightQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestHeightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestHeightQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestHeightQuery(baseOptions?: Apollo.QueryHookOptions<GetLatestHeightQuery, GetLatestHeightQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLatestHeightQuery, GetLatestHeightQueryVariables>(GetLatestHeightDocument, options);
      }
export function useGetLatestHeightLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLatestHeightQuery, GetLatestHeightQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLatestHeightQuery, GetLatestHeightQueryVariables>(GetLatestHeightDocument, options);
        }
export function useGetLatestHeightSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLatestHeightQuery, GetLatestHeightQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLatestHeightQuery, GetLatestHeightQueryVariables>(GetLatestHeightDocument, options);
        }
export type GetLatestHeightQueryHookResult = ReturnType<typeof useGetLatestHeightQuery>;
export type GetLatestHeightLazyQueryHookResult = ReturnType<typeof useGetLatestHeightLazyQuery>;
export type GetLatestHeightSuspenseQueryHookResult = ReturnType<typeof useGetLatestHeightSuspenseQuery>;
export type GetLatestHeightQueryResult = Apollo.QueryResult<GetLatestHeightQuery, GetLatestHeightQueryVariables>;
export const GetBlockDocument = gql`
    query GetBlock($number: BigInt!) {
  block(number: $number) {
    number
    hash
    parentHash
    timestamp
    miner
    gasUsed
    gasLimit
    size
    transactionCount
    baseFeePerGas
    withdrawalsRoot
    blobGasUsed
    excessBlobGas
    transactions {
      hash
      from
      to
      value
      gas
      gasPrice
      type
      nonce
    }
  }
}
    `;

/**
 * __useGetBlockQuery__
 *
 * To run a query within a React component, call `useGetBlockQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockQuery({
 *   variables: {
 *      number: // value for 'number'
 *   },
 * });
 */
export function useGetBlockQuery(baseOptions: Apollo.QueryHookOptions<GetBlockQuery, GetBlockQueryVariables> & ({ variables: GetBlockQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockQuery, GetBlockQueryVariables>(GetBlockDocument, options);
      }
export function useGetBlockLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockQuery, GetBlockQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockQuery, GetBlockQueryVariables>(GetBlockDocument, options);
        }
export function useGetBlockSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockQuery, GetBlockQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockQuery, GetBlockQueryVariables>(GetBlockDocument, options);
        }
export type GetBlockQueryHookResult = ReturnType<typeof useGetBlockQuery>;
export type GetBlockLazyQueryHookResult = ReturnType<typeof useGetBlockLazyQuery>;
export type GetBlockSuspenseQueryHookResult = ReturnType<typeof useGetBlockSuspenseQuery>;
export type GetBlockQueryResult = Apollo.QueryResult<GetBlockQuery, GetBlockQueryVariables>;
export const GetBlockByHashDocument = gql`
    query GetBlockByHash($hash: Hash!) {
  blockByHash(hash: $hash) {
    number
    hash
    parentHash
    timestamp
    miner
    gasUsed
    gasLimit
    size
    transactionCount
    baseFeePerGas
    withdrawalsRoot
    blobGasUsed
    excessBlobGas
    transactions {
      hash
      from
      to
      value
    }
  }
}
    `;

/**
 * __useGetBlockByHashQuery__
 *
 * To run a query within a React component, call `useGetBlockByHashQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockByHashQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockByHashQuery({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useGetBlockByHashQuery(baseOptions: Apollo.QueryHookOptions<GetBlockByHashQuery, GetBlockByHashQueryVariables> & ({ variables: GetBlockByHashQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockByHashQuery, GetBlockByHashQueryVariables>(GetBlockByHashDocument, options);
      }
export function useGetBlockByHashLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockByHashQuery, GetBlockByHashQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockByHashQuery, GetBlockByHashQueryVariables>(GetBlockByHashDocument, options);
        }
export function useGetBlockByHashSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockByHashQuery, GetBlockByHashQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockByHashQuery, GetBlockByHashQueryVariables>(GetBlockByHashDocument, options);
        }
export type GetBlockByHashQueryHookResult = ReturnType<typeof useGetBlockByHashQuery>;
export type GetBlockByHashLazyQueryHookResult = ReturnType<typeof useGetBlockByHashLazyQuery>;
export type GetBlockByHashSuspenseQueryHookResult = ReturnType<typeof useGetBlockByHashSuspenseQuery>;
export type GetBlockByHashQueryResult = Apollo.QueryResult<GetBlockByHashQuery, GetBlockByHashQueryVariables>;
export const GetTransactionDocument = gql`
    query GetTransaction($hash: Hash!) {
  transaction(hash: $hash) {
    hash
    blockNumber
    blockHash
    transactionIndex
    from
    to
    value
    gas
    gasPrice
    maxFeePerGas
    maxPriorityFeePerGas
    type
    input
    nonce
    v
    r
    s
    chainId
    feePayer
    feePayerSignatures {
      v
      r
      s
    }
    receipt {
      status
      gasUsed
      cumulativeGasUsed
      effectiveGasPrice
      contractAddress
      logs {
        address
        topics
        data
        logIndex
      }
    }
  }
}
    `;

/**
 * __useGetTransactionQuery__
 *
 * To run a query within a React component, call `useGetTransactionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionQuery({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useGetTransactionQuery(baseOptions: Apollo.QueryHookOptions<GetTransactionQuery, GetTransactionQueryVariables> & ({ variables: GetTransactionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionQuery, GetTransactionQueryVariables>(GetTransactionDocument, options);
      }
export function useGetTransactionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionQuery, GetTransactionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionQuery, GetTransactionQueryVariables>(GetTransactionDocument, options);
        }
export function useGetTransactionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionQuery, GetTransactionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionQuery, GetTransactionQueryVariables>(GetTransactionDocument, options);
        }
export type GetTransactionQueryHookResult = ReturnType<typeof useGetTransactionQuery>;
export type GetTransactionLazyQueryHookResult = ReturnType<typeof useGetTransactionLazyQuery>;
export type GetTransactionSuspenseQueryHookResult = ReturnType<typeof useGetTransactionSuspenseQuery>;
export type GetTransactionQueryResult = Apollo.QueryResult<GetTransactionQuery, GetTransactionQueryVariables>;
export const GetTransactionsByAddressDocument = gql`
    query GetTransactionsByAddress($address: Address!, $limit: Int, $offset: Int) {
  transactionsByAddress(
    address: $address
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      hash
      blockNumber
      from
      to
      value
      gas
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetTransactionsByAddressQuery__
 *
 * To run a query within a React component, call `useGetTransactionsByAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsByAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsByAddressQuery({
 *   variables: {
 *      address: // value for 'address'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetTransactionsByAddressQuery(baseOptions: Apollo.QueryHookOptions<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables> & ({ variables: GetTransactionsByAddressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>(GetTransactionsByAddressDocument, options);
      }
export function useGetTransactionsByAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>(GetTransactionsByAddressDocument, options);
        }
export function useGetTransactionsByAddressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>(GetTransactionsByAddressDocument, options);
        }
export type GetTransactionsByAddressQueryHookResult = ReturnType<typeof useGetTransactionsByAddressQuery>;
export type GetTransactionsByAddressLazyQueryHookResult = ReturnType<typeof useGetTransactionsByAddressLazyQuery>;
export type GetTransactionsByAddressSuspenseQueryHookResult = ReturnType<typeof useGetTransactionsByAddressSuspenseQuery>;
export type GetTransactionsByAddressQueryResult = Apollo.QueryResult<GetTransactionsByAddressQuery, GetTransactionsByAddressQueryVariables>;
export const GetAddressBalanceDocument = gql`
    query GetAddressBalance($address: Address!, $blockNumber: BigInt) {
  addressBalance(address: $address, blockNumber: $blockNumber)
}
    `;

/**
 * __useGetAddressBalanceQuery__
 *
 * To run a query within a React component, call `useGetAddressBalanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressBalanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressBalanceQuery({
 *   variables: {
 *      address: // value for 'address'
 *      blockNumber: // value for 'blockNumber'
 *   },
 * });
 */
export function useGetAddressBalanceQuery(baseOptions: Apollo.QueryHookOptions<GetAddressBalanceQuery, GetAddressBalanceQueryVariables> & ({ variables: GetAddressBalanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>(GetAddressBalanceDocument, options);
      }
export function useGetAddressBalanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>(GetAddressBalanceDocument, options);
        }
export function useGetAddressBalanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>(GetAddressBalanceDocument, options);
        }
export type GetAddressBalanceQueryHookResult = ReturnType<typeof useGetAddressBalanceQuery>;
export type GetAddressBalanceLazyQueryHookResult = ReturnType<typeof useGetAddressBalanceLazyQuery>;
export type GetAddressBalanceSuspenseQueryHookResult = ReturnType<typeof useGetAddressBalanceSuspenseQuery>;
export type GetAddressBalanceQueryResult = Apollo.QueryResult<GetAddressBalanceQuery, GetAddressBalanceQueryVariables>;
export const GetBalanceHistoryDocument = gql`
    query GetBalanceHistory($address: Address!, $fromBlock: BigInt!, $toBlock: BigInt!, $limit: Int, $offset: Int) {
  balanceHistory(
    address: $address
    fromBlock: $fromBlock
    toBlock: $toBlock
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      blockNumber
      balance
      delta
      transactionHash
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetBalanceHistoryQuery__
 *
 * To run a query within a React component, call `useGetBalanceHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBalanceHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBalanceHistoryQuery({
 *   variables: {
 *      address: // value for 'address'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetBalanceHistoryQuery(baseOptions: Apollo.QueryHookOptions<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables> & ({ variables: GetBalanceHistoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>(GetBalanceHistoryDocument, options);
      }
export function useGetBalanceHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>(GetBalanceHistoryDocument, options);
        }
export function useGetBalanceHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>(GetBalanceHistoryDocument, options);
        }
export type GetBalanceHistoryQueryHookResult = ReturnType<typeof useGetBalanceHistoryQuery>;
export type GetBalanceHistoryLazyQueryHookResult = ReturnType<typeof useGetBalanceHistoryLazyQuery>;
export type GetBalanceHistorySuspenseQueryHookResult = ReturnType<typeof useGetBalanceHistorySuspenseQuery>;
export type GetBalanceHistoryQueryResult = Apollo.QueryResult<GetBalanceHistoryQuery, GetBalanceHistoryQueryVariables>;
export const GetLogsDocument = gql`
    query GetLogs($address: String, $topics: [String!], $blockNumberFrom: String, $blockNumberTo: String, $limit: Int, $offset: Int) {
  logs(
    filter: {address: $address, topics: $topics, blockNumberFrom: $blockNumberFrom, blockNumberTo: $blockNumberTo}
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      address
      topics
      data
      blockNumber
      transactionHash
      logIndex
    }
    totalCount
  }
}
    `;

/**
 * __useGetLogsQuery__
 *
 * To run a query within a React component, call `useGetLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      topics: // value for 'topics'
 *      blockNumberFrom: // value for 'blockNumberFrom'
 *      blockNumberTo: // value for 'blockNumberTo'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetLogsQuery(baseOptions?: Apollo.QueryHookOptions<GetLogsQuery, GetLogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLogsQuery, GetLogsQueryVariables>(GetLogsDocument, options);
      }
export function useGetLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLogsQuery, GetLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLogsQuery, GetLogsQueryVariables>(GetLogsDocument, options);
        }
export function useGetLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLogsQuery, GetLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLogsQuery, GetLogsQueryVariables>(GetLogsDocument, options);
        }
export type GetLogsQueryHookResult = ReturnType<typeof useGetLogsQuery>;
export type GetLogsLazyQueryHookResult = ReturnType<typeof useGetLogsLazyQuery>;
export type GetLogsSuspenseQueryHookResult = ReturnType<typeof useGetLogsSuspenseQuery>;
export type GetLogsQueryResult = Apollo.QueryResult<GetLogsQuery, GetLogsQueryVariables>;
export const GetBlocksByTimeRangeDocument = gql`
    query GetBlocksByTimeRange($fromTime: String!, $toTime: String!, $limit: Int) {
  blocksByTimeRange(
    fromTime: $fromTime
    toTime: $toTime
    pagination: {limit: $limit}
  ) {
    nodes {
      number
      hash
      timestamp
      miner
      gasUsed
      gasLimit
      transactionCount
    }
    totalCount
  }
}
    `;

/**
 * __useGetBlocksByTimeRangeQuery__
 *
 * To run a query within a React component, call `useGetBlocksByTimeRangeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlocksByTimeRangeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlocksByTimeRangeQuery({
 *   variables: {
 *      fromTime: // value for 'fromTime'
 *      toTime: // value for 'toTime'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetBlocksByTimeRangeQuery(baseOptions: Apollo.QueryHookOptions<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables> & ({ variables: GetBlocksByTimeRangeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>(GetBlocksByTimeRangeDocument, options);
      }
export function useGetBlocksByTimeRangeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>(GetBlocksByTimeRangeDocument, options);
        }
export function useGetBlocksByTimeRangeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>(GetBlocksByTimeRangeDocument, options);
        }
export type GetBlocksByTimeRangeQueryHookResult = ReturnType<typeof useGetBlocksByTimeRangeQuery>;
export type GetBlocksByTimeRangeLazyQueryHookResult = ReturnType<typeof useGetBlocksByTimeRangeLazyQuery>;
export type GetBlocksByTimeRangeSuspenseQueryHookResult = ReturnType<typeof useGetBlocksByTimeRangeSuspenseQuery>;
export type GetBlocksByTimeRangeQueryResult = Apollo.QueryResult<GetBlocksByTimeRangeQuery, GetBlocksByTimeRangeQueryVariables>;
export const GetNetworkMetricsDocument = gql`
    query GetNetworkMetrics {
  blockCount
  transactionCount
}
    `;

/**
 * __useGetNetworkMetricsQuery__
 *
 * To run a query within a React component, call `useGetNetworkMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNetworkMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNetworkMetricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNetworkMetricsQuery(baseOptions?: Apollo.QueryHookOptions<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>(GetNetworkMetricsDocument, options);
      }
export function useGetNetworkMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>(GetNetworkMetricsDocument, options);
        }
export function useGetNetworkMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>(GetNetworkMetricsDocument, options);
        }
export type GetNetworkMetricsQueryHookResult = ReturnType<typeof useGetNetworkMetricsQuery>;
export type GetNetworkMetricsLazyQueryHookResult = ReturnType<typeof useGetNetworkMetricsLazyQuery>;
export type GetNetworkMetricsSuspenseQueryHookResult = ReturnType<typeof useGetNetworkMetricsSuspenseQuery>;
export type GetNetworkMetricsQueryResult = Apollo.QueryResult<GetNetworkMetricsQuery, GetNetworkMetricsQueryVariables>;
export const GetBlocksDocument = gql`
    query GetBlocks($limit: Int, $offset: Int, $numberFrom: String, $numberTo: String, $miner: String) {
  blocks(
    pagination: {limit: $limit, offset: $offset}
    filter: {numberFrom: $numberFrom, numberTo: $numberTo, miner: $miner}
  ) {
    nodes {
      number
      hash
      timestamp
      miner
      gasUsed
      gasLimit
      size
      transactionCount
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetBlocksQuery__
 *
 * To run a query within a React component, call `useGetBlocksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlocksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlocksQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      numberFrom: // value for 'numberFrom'
 *      numberTo: // value for 'numberTo'
 *      miner: // value for 'miner'
 *   },
 * });
 */
export function useGetBlocksQuery(baseOptions?: Apollo.QueryHookOptions<GetBlocksQuery, GetBlocksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlocksQuery, GetBlocksQueryVariables>(GetBlocksDocument, options);
      }
export function useGetBlocksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlocksQuery, GetBlocksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlocksQuery, GetBlocksQueryVariables>(GetBlocksDocument, options);
        }
export function useGetBlocksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlocksQuery, GetBlocksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlocksQuery, GetBlocksQueryVariables>(GetBlocksDocument, options);
        }
export type GetBlocksQueryHookResult = ReturnType<typeof useGetBlocksQuery>;
export type GetBlocksLazyQueryHookResult = ReturnType<typeof useGetBlocksLazyQuery>;
export type GetBlocksSuspenseQueryHookResult = ReturnType<typeof useGetBlocksSuspenseQuery>;
export type GetBlocksQueryResult = Apollo.QueryResult<GetBlocksQuery, GetBlocksQueryVariables>;
export const GetFilteredTransactionsDocument = gql`
    query GetFilteredTransactions($address: String!, $fromBlock: String!, $toBlock: String!, $minValue: String, $maxValue: String, $txType: Int, $successOnly: Boolean, $limit: Int, $offset: Int) {
  transactionsByAddressFiltered(
    address: $address
    filter: {fromBlock: $fromBlock, toBlock: $toBlock, minValue: $minValue, maxValue: $maxValue, txType: $txType, successOnly: $successOnly}
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      hash
      blockNumber
      from
      to
      value
      gas
      gasPrice
      type
      receipt {
        status
        gasUsed
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetFilteredTransactionsQuery__
 *
 * To run a query within a React component, call `useGetFilteredTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFilteredTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFilteredTransactionsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *      minValue: // value for 'minValue'
 *      maxValue: // value for 'maxValue'
 *      txType: // value for 'txType'
 *      successOnly: // value for 'successOnly'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetFilteredTransactionsQuery(baseOptions: Apollo.QueryHookOptions<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables> & ({ variables: GetFilteredTransactionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>(GetFilteredTransactionsDocument, options);
      }
export function useGetFilteredTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>(GetFilteredTransactionsDocument, options);
        }
export function useGetFilteredTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>(GetFilteredTransactionsDocument, options);
        }
export type GetFilteredTransactionsQueryHookResult = ReturnType<typeof useGetFilteredTransactionsQuery>;
export type GetFilteredTransactionsLazyQueryHookResult = ReturnType<typeof useGetFilteredTransactionsLazyQuery>;
export type GetFilteredTransactionsSuspenseQueryHookResult = ReturnType<typeof useGetFilteredTransactionsSuspenseQuery>;
export type GetFilteredTransactionsQueryResult = Apollo.QueryResult<GetFilteredTransactionsQuery, GetFilteredTransactionsQueryVariables>;
export const GetTransactionsDocument = gql`
    query GetTransactions($limit: Int, $offset: Int, $blockNumberFrom: String, $blockNumberTo: String, $from: String, $to: String, $type: Int) {
  transactions(
    pagination: {limit: $limit, offset: $offset}
    filter: {blockNumberFrom: $blockNumberFrom, blockNumberTo: $blockNumberTo, from: $from, to: $to, type: $type}
  ) {
    nodes {
      hash
      blockNumber
      from
      to
      value
      gas
      gasPrice
      type
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetTransactionsQuery__
 *
 * To run a query within a React component, call `useGetTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      blockNumberFrom: // value for 'blockNumberFrom'
 *      blockNumberTo: // value for 'blockNumberTo'
 *      from: // value for 'from'
 *      to: // value for 'to'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetTransactionsQuery(baseOptions?: Apollo.QueryHookOptions<GetTransactionsQuery, GetTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionsQuery, GetTransactionsQueryVariables>(GetTransactionsDocument, options);
      }
export function useGetTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionsQuery, GetTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionsQuery, GetTransactionsQueryVariables>(GetTransactionsDocument, options);
        }
export function useGetTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionsQuery, GetTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionsQuery, GetTransactionsQueryVariables>(GetTransactionsDocument, options);
        }
export type GetTransactionsQueryHookResult = ReturnType<typeof useGetTransactionsQuery>;
export type GetTransactionsLazyQueryHookResult = ReturnType<typeof useGetTransactionsLazyQuery>;
export type GetTransactionsSuspenseQueryHookResult = ReturnType<typeof useGetTransactionsSuspenseQuery>;
export type GetTransactionsQueryResult = Apollo.QueryResult<GetTransactionsQuery, GetTransactionsQueryVariables>;