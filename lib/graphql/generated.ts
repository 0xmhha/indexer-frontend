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
  DateTime: { input: string; output: string; }
  Hash: { input: string; output: string; }
  JSON: { input: string; output: string; }
};

export type AccessListEntry = {
  __typename?: 'AccessListEntry';
  address: Scalars['Address']['output'];
  storageKeys: Array<Scalars['Hash']['output']>;
};

export type AddressOverview = {
  __typename?: 'AddressOverview';
  address: Scalars['Address']['output'];
  balance: Scalars['BigInt']['output'];
  contractInfo?: Maybe<ContractCreation>;
  erc20TokenCount: Scalars['Int']['output'];
  erc721TokenCount: Scalars['Int']['output'];
  firstSeen?: Maybe<Scalars['BigInt']['output']>;
  internalTxCount: Scalars['Int']['output'];
  isContract: Scalars['Boolean']['output'];
  lastSeen?: Maybe<Scalars['BigInt']['output']>;
  receivedCount: Scalars['Int']['output'];
  sentCount: Scalars['Int']['output'];
  transactionCount: Scalars['Int']['output'];
  verificationInfo?: Maybe<ContractVerification>;
};

export type AddressSetCodeInfo = {
  __typename?: 'AddressSetCodeInfo';
  address: Scalars['Address']['output'];
  asAuthorityCount: Scalars['Int']['output'];
  asTargetCount: Scalars['Int']['output'];
  delegationTarget?: Maybe<Scalars['Address']['output']>;
  hasDelegation: Scalars['Boolean']['output'];
  lastActivityBlock?: Maybe<Scalars['BigInt']['output']>;
  lastActivityTimestamp?: Maybe<Scalars['BigInt']['output']>;
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

export type BlacklistEvent = {
  __typename?: 'BlacklistEvent';
  account: Scalars['Address']['output'];
  action: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  proposalId?: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
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

export type BlockParticipation = {
  __typename?: 'BlockParticipation';
  blockNumber: Scalars['BigInt']['output'];
  round: Scalars['Int']['output'];
  signedCommit: Scalars['Boolean']['output'];
  signedPrepare: Scalars['Boolean']['output'];
  wasProposer: Scalars['Boolean']['output'];
};

export type BlockRangeResult = {
  __typename?: 'BlockRangeResult';
  blocks: Array<Block>;
  count: Scalars['Int']['output'];
  endNumber: Scalars['BigInt']['output'];
  hasMore: Scalars['Boolean']['output'];
  latestHeight: Scalars['BigInt']['output'];
  startNumber: Scalars['BigInt']['output'];
};

export type BlockSigners = {
  __typename?: 'BlockSigners';
  blockNumber: Scalars['BigInt']['output'];
  committers: Array<Scalars['Address']['output']>;
  preparers: Array<Scalars['Address']['output']>;
};

export type BlockWithChain = {
  __typename?: 'BlockWithChain';
  block: Block;
  chainId: Scalars['String']['output'];
};

export type BurnEvent = {
  __typename?: 'BurnEvent';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  burner: Scalars['Address']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
  withdrawalId?: Maybe<Scalars['String']['output']>;
};

export type BurnEventConnection = {
  __typename?: 'BurnEventConnection';
  nodes: Array<BurnEvent>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Candidate = {
  __typename?: 'Candidate';
  address: Scalars['Address']['output'];
  diligence: Scalars['BigInt']['output'];
};

export type CandidateInfo = {
  __typename?: 'CandidateInfo';
  address: Scalars['Address']['output'];
  diligence: Scalars['BigInt']['output'];
};

export type Chain = {
  __typename?: 'Chain';
  adapterType: Scalars['String']['output'];
  chainId: Scalars['BigInt']['output'];
  enabled: Scalars['Boolean']['output'];
  health?: Maybe<HealthStatus>;
  id: Scalars['ID']['output'];
  latestHeight?: Maybe<Scalars['BigInt']['output']>;
  name: Scalars['String']['output'];
  registeredAt: Scalars['DateTime']['output'];
  rpcEndpoint: Scalars['String']['output'];
  startHeight: Scalars['BigInt']['output'];
  status: ChainStatus;
  syncProgress?: Maybe<SyncProgress>;
  wsEndpoint?: Maybe<Scalars['String']['output']>;
};

export type ChainConnection = {
  __typename?: 'ChainConnection';
  nodes: Array<Chain>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum ChainStatus {
  Active = 'ACTIVE',
  Error = 'ERROR',
  Registered = 'REGISTERED',
  Starting = 'STARTING',
  Stopped = 'STOPPED',
  Stopping = 'STOPPING',
  Syncing = 'SYNCING'
}

export type ConsensusBlockSub = {
  __typename?: 'ConsensusBlockSub';
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  commitCount: Scalars['Int']['output'];
  epochNumber?: Maybe<Scalars['BigInt']['output']>;
  epochValidators?: Maybe<Array<Scalars['Address']['output']>>;
  isEpochBoundary: Scalars['Boolean']['output'];
  missedValidatorRate: Scalars['Float']['output'];
  participationRate: Scalars['Float']['output'];
  prepareCount: Scalars['Int']['output'];
  prevRound: Scalars['Int']['output'];
  proposer: Scalars['Address']['output'];
  round: Scalars['Int']['output'];
  roundChanged: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  validatorCount: Scalars['Int']['output'];
};

export type ConsensusData = {
  __typename?: 'ConsensusData';
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  commitCount: Scalars['Int']['output'];
  commitSigners: Array<Scalars['Address']['output']>;
  epochInfo?: Maybe<EpochData>;
  gasTip?: Maybe<Scalars['BigInt']['output']>;
  isEpochBoundary: Scalars['Boolean']['output'];
  isHealthy: Scalars['Boolean']['output'];
  missedCommit: Array<Scalars['Address']['output']>;
  missedPrepare: Array<Scalars['Address']['output']>;
  participationRate: Scalars['Float']['output'];
  prepareCount: Scalars['Int']['output'];
  prepareSigners: Array<Scalars['Address']['output']>;
  prevRound: Scalars['Int']['output'];
  proposer: Scalars['Address']['output'];
  randaoReveal?: Maybe<Scalars['Bytes']['output']>;
  round: Scalars['Int']['output'];
  roundChanged: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  validators: Array<Scalars['Address']['output']>;
  vanityData?: Maybe<Scalars['Bytes']['output']>;
};

export type ConsensusErrorSub = {
  __typename?: 'ConsensusErrorSub';
  actualSigners: Scalars['Int']['output'];
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  consensusImpacted: Scalars['Boolean']['output'];
  errorDetails?: Maybe<Scalars['String']['output']>;
  errorMessage: Scalars['String']['output'];
  errorType: Scalars['String']['output'];
  expectedValidators: Scalars['Int']['output'];
  missedValidators?: Maybe<Array<Scalars['Address']['output']>>;
  participationRate: Scalars['Float']['output'];
  recoveryTime: Scalars['BigInt']['output'];
  round: Scalars['Int']['output'];
  severity: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type ConsensusForkSub = {
  __typename?: 'ConsensusForkSub';
  chain1Hash: Scalars['Hash']['output'];
  chain1Height: Scalars['BigInt']['output'];
  chain1Weight: Scalars['String']['output'];
  chain2Hash: Scalars['Hash']['output'];
  chain2Height: Scalars['BigInt']['output'];
  chain2Weight: Scalars['String']['output'];
  detectedAt: Scalars['BigInt']['output'];
  detectionLag: Scalars['BigInt']['output'];
  forkBlockHash: Scalars['Hash']['output'];
  forkBlockNumber: Scalars['BigInt']['output'];
  resolved: Scalars['Boolean']['output'];
  winningChain: Scalars['Int']['output'];
};

export type ConsensusValidatorChangeSub = {
  __typename?: 'ConsensusValidatorChangeSub';
  addedValidators?: Maybe<Array<Scalars['Address']['output']>>;
  additionalInfo?: Maybe<Scalars['String']['output']>;
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  changeType: Scalars['String']['output'];
  epochNumber: Scalars['BigInt']['output'];
  isEpochBoundary: Scalars['Boolean']['output'];
  newValidatorCount: Scalars['Int']['output'];
  previousValidatorCount: Scalars['Int']['output'];
  removedValidators?: Maybe<Array<Scalars['Address']['output']>>;
  timestamp: Scalars['BigInt']['output'];
  validatorSet?: Maybe<Array<Scalars['Address']['output']>>;
};

export type ContractCallResult = {
  __typename?: 'ContractCallResult';
  decoded: Scalars['Boolean']['output'];
  rawResult: Scalars['String']['output'];
  result?: Maybe<Scalars['String']['output']>;
};

export type ContractCreation = {
  __typename?: 'ContractCreation';
  blockNumber: Scalars['BigInt']['output'];
  bytecodeSize: Scalars['Int']['output'];
  contractAddress: Scalars['Address']['output'];
  creator: Scalars['Address']['output'];
  name?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type ContractCreationConnection = {
  __typename?: 'ContractCreationConnection';
  nodes: Array<ContractCreation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ContractVerification = {
  __typename?: 'ContractVerification';
  abi?: Maybe<Scalars['String']['output']>;
  address: Scalars['Address']['output'];
  compilerVersion?: Maybe<Scalars['String']['output']>;
  constructorArguments?: Maybe<Scalars['String']['output']>;
  isVerified: Scalars['Boolean']['output'];
  licenseType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  optimizationEnabled?: Maybe<Scalars['Boolean']['output']>;
  optimizationRuns?: Maybe<Scalars['Int']['output']>;
  sourceCode?: Maybe<Scalars['String']['output']>;
  verifiedAt?: Maybe<Scalars['String']['output']>;
};

export type DepositMintProposal = {
  __typename?: 'DepositMintProposal';
  amount: Scalars['BigInt']['output'];
  bankReference: Scalars['String']['output'];
  beneficiary: Scalars['Address']['output'];
  blockNumber: Scalars['BigInt']['output'];
  depositId: Scalars['String']['output'];
  proposalId: Scalars['BigInt']['output'];
  requester: Scalars['Address']['output'];
  status: ProposalStatus;
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type DynamicContractEvent = {
  __typename?: 'DynamicContractEvent';
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  contractName: Scalars['String']['output'];
  data: Scalars['String']['output'];
  eventName: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Hash']['output'];
};

export type DynamicContractEventFilter = {
  contract?: InputMaybe<Scalars['Address']['input']>;
  eventNames?: InputMaybe<Array<Scalars['String']['input']>>;
  fromBlock?: InputMaybe<Scalars['BigInt']['input']>;
  toBlock?: InputMaybe<Scalars['BigInt']['input']>;
};

export type DynamicContractSubscriptionFilter = {
  contract?: InputMaybe<Scalars['Address']['input']>;
  eventNames?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Erc20Transfer = {
  __typename?: 'ERC20Transfer';
  blockNumber: Scalars['BigInt']['output'];
  contractAddress: Scalars['Address']['output'];
  from: Scalars['Address']['output'];
  logIndex: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  to: Scalars['Address']['output'];
  transactionHash: Scalars['Hash']['output'];
  value: Scalars['BigInt']['output'];
};

export type Erc20TransferConnection = {
  __typename?: 'ERC20TransferConnection';
  nodes: Array<Erc20Transfer>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Erc721Transfer = {
  __typename?: 'ERC721Transfer';
  blockNumber: Scalars['BigInt']['output'];
  contractAddress: Scalars['Address']['output'];
  from: Scalars['Address']['output'];
  logIndex: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  to: Scalars['Address']['output'];
  tokenId: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type Erc721TransferConnection = {
  __typename?: 'ERC721TransferConnection';
  nodes: Array<Erc721Transfer>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type EmergencyPauseEvent = {
  __typename?: 'EmergencyPauseEvent';
  action: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  proposalId?: Maybe<Scalars['BigInt']['output']>;
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type EpochData = {
  __typename?: 'EpochData';
  candidateCount: Scalars['Int']['output'];
  candidates: Array<CandidateInfo>;
  epochNumber: Scalars['BigInt']['output'];
  validatorCount: Scalars['Int']['output'];
  validators: Array<ValidatorInfoDetailed>;
};

export type EpochInfo = {
  __typename?: 'EpochInfo';
  blockNumber: Scalars['BigInt']['output'];
  blsPublicKeys: Array<Scalars['Bytes']['output']>;
  candidates: Array<Candidate>;
  epochNumber: Scalars['BigInt']['output'];
  validators: Array<Scalars['Int']['output']>;
};

export type FeeDelegationStats = {
  __typename?: 'FeeDelegationStats';
  adoptionRate: Scalars['Float']['output'];
  avgFeeSaved: Scalars['BigInt']['output'];
  totalFeeDelegatedTxs: Scalars['BigInt']['output'];
  totalFeesSaved: Scalars['BigInt']['output'];
};

export type FeePayerSignature = {
  __typename?: 'FeePayerSignature';
  r: Scalars['Bytes']['output'];
  s: Scalars['Bytes']['output'];
  v: Scalars['BigInt']['output'];
};

export type FeePayerStats = {
  __typename?: 'FeePayerStats';
  address: Scalars['Address']['output'];
  percentage: Scalars['Float']['output'];
  totalFeesPaid: Scalars['BigInt']['output'];
  txCount: Scalars['BigInt']['output'];
};

export type GasTipUpdateEvent = {
  __typename?: 'GasTipUpdateEvent';
  blockNumber: Scalars['BigInt']['output'];
  newTip: Scalars['BigInt']['output'];
  oldTip: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
  updater: Scalars['Address']['output'];
};

export type HealthStatus = {
  __typename?: 'HealthStatus';
  consecutiveFailures: Scalars['Int']['output'];
  isHealthy: Scalars['Boolean']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastHeartbeat?: Maybe<Scalars['DateTime']['output']>;
  latencyMs?: Maybe<Scalars['BigInt']['output']>;
  uptimePercentage: Scalars['Float']['output'];
};

export type HistoricalTransactionFilter = {
  fromBlock: Scalars['BigInt']['input'];
  maxValue?: InputMaybe<Scalars['BigInt']['input']>;
  minValue?: InputMaybe<Scalars['BigInt']['input']>;
  successOnly?: InputMaybe<Scalars['Boolean']['input']>;
  toBlock: Scalars['BigInt']['input'];
  txType?: InputMaybe<Scalars['Int']['input']>;
};

export type InternalTransaction = {
  __typename?: 'InternalTransaction';
  blockNumber: Scalars['BigInt']['output'];
  depth: Scalars['Int']['output'];
  error?: Maybe<Scalars['String']['output']>;
  from: Scalars['Address']['output'];
  gas: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  index: Scalars['Int']['output'];
  input: Scalars['Bytes']['output'];
  output: Scalars['Bytes']['output'];
  to: Scalars['Address']['output'];
  transactionHash: Scalars['Hash']['output'];
  type: Scalars['String']['output'];
  value: Scalars['BigInt']['output'];
};

export type InternalTransactionConnection = {
  __typename?: 'InternalTransactionConnection';
  nodes: Array<InternalTransaction>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InternalTransactionRpc = {
  __typename?: 'InternalTransactionRPC';
  depth: Scalars['Int']['output'];
  error?: Maybe<Scalars['String']['output']>;
  from: Scalars['Address']['output'];
  gas: Scalars['BigInt']['output'];
  gasUsed: Scalars['BigInt']['output'];
  input: Scalars['String']['output'];
  output: Scalars['String']['output'];
  to: Scalars['Address']['output'];
  traceAddress: Array<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  value: Scalars['BigInt']['output'];
};

export type InternalTransactionsRpcResult = {
  __typename?: 'InternalTransactionsRPCResult';
  internalTransactions: Array<InternalTransactionRpc>;
  totalCount: Scalars['Int']['output'];
  txHash: Scalars['Hash']['output'];
};

export type LiveBalanceResult = {
  __typename?: 'LiveBalanceResult';
  address: Scalars['Address']['output'];
  balance: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
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

export type MaxProposalsUpdateEvent = {
  __typename?: 'MaxProposalsUpdateEvent';
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  newMax: Scalars['BigInt']['output'];
  oldMax: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type MemberChangeEvent = {
  __typename?: 'MemberChangeEvent';
  action: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  member: Scalars['Address']['output'];
  newQuorum: Scalars['Int']['output'];
  oldMember?: Maybe<Scalars['Address']['output']>;
  timestamp: Scalars['BigInt']['output'];
  totalMembers: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type MinerStats = {
  __typename?: 'MinerStats';
  address: Scalars['Address']['output'];
  blockCount: Scalars['BigInt']['output'];
  lastBlockNumber: Scalars['BigInt']['output'];
  lastBlockTime: Scalars['BigInt']['output'];
  percentage: Scalars['Float']['output'];
  totalRewards: Scalars['BigInt']['output'];
};

export type MintEvent = {
  __typename?: 'MintEvent';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  minter: Scalars['Address']['output'];
  timestamp: Scalars['BigInt']['output'];
  to: Scalars['Address']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type MintEventConnection = {
  __typename?: 'MintEventConnection';
  nodes: Array<MintEvent>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MinterConfigEvent = {
  __typename?: 'MinterConfigEvent';
  action: Scalars['String']['output'];
  allowance: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  minter: Scalars['Address']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type MinterInfo = {
  __typename?: 'MinterInfo';
  address: Scalars['Address']['output'];
  allowance: Scalars['BigInt']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  registerChain: Chain;
  registerContract: RegisteredContract;
  startChain: Chain;
  stopChain: Chain;
  unregisterChain: Scalars['Boolean']['output'];
  unregisterContract: Scalars['Boolean']['output'];
  unwatchAddress: Scalars['Boolean']['output'];
  updateWatchFilter: WatchedAddress;
  verifyContract: ContractVerification;
  watchAddress: WatchedAddress;
};


export type MutationRegisterChainArgs = {
  input: RegisterChainInput;
};


export type MutationRegisterContractArgs = {
  input: RegisterContractInput;
};


export type MutationStartChainArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStopChainArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnregisterChainArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnregisterContractArgs = {
  address: Scalars['Address']['input'];
};


export type MutationUnwatchAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateWatchFilterArgs = {
  filter: WatchFilterInput;
  id: Scalars['ID']['input'];
};


export type MutationVerifyContractArgs = {
  address: Scalars['Address']['input'];
  compilerVersion: Scalars['String']['input'];
  constructorArguments?: InputMaybe<Scalars['String']['input']>;
  contractName?: InputMaybe<Scalars['String']['input']>;
  licenseType?: InputMaybe<Scalars['String']['input']>;
  optimizationEnabled: Scalars['Boolean']['input'];
  optimizationRuns?: InputMaybe<Scalars['Int']['input']>;
  sourceCode: Scalars['String']['input'];
};


export type MutationWatchAddressArgs = {
  input: WatchAddressInput;
};

export type NftOwnership = {
  __typename?: 'NFTOwnership';
  contractAddress: Scalars['Address']['output'];
  owner: Scalars['Address']['output'];
  tokenId: Scalars['BigInt']['output'];
};

export type NftOwnershipConnection = {
  __typename?: 'NFTOwnershipConnection';
  nodes: Array<NftOwnership>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
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

export type Proposal = {
  __typename?: 'Proposal';
  actionType: Scalars['Bytes']['output'];
  approved: Scalars['Int']['output'];
  blockNumber: Scalars['BigInt']['output'];
  callData: Scalars['Bytes']['output'];
  contract: Scalars['Address']['output'];
  createdAt: Scalars['BigInt']['output'];
  executedAt?: Maybe<Scalars['BigInt']['output']>;
  memberVersion: Scalars['BigInt']['output'];
  proposalId: Scalars['BigInt']['output'];
  proposer: Scalars['Address']['output'];
  rejected: Scalars['Int']['output'];
  requiredApprovals: Scalars['Int']['output'];
  status: ProposalStatus;
  transactionHash: Scalars['Hash']['output'];
};

export type ProposalConnection = {
  __typename?: 'ProposalConnection';
  nodes: Array<Proposal>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProposalExecutionSkippedEvent = {
  __typename?: 'ProposalExecutionSkippedEvent';
  account: Scalars['Address']['output'];
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  proposalId: Scalars['BigInt']['output'];
  reason: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type ProposalFilter = {
  contract: Scalars['Address']['input'];
  proposer?: InputMaybe<Scalars['Address']['input']>;
  status?: InputMaybe<ProposalStatus>;
};

export enum ProposalStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Executed = 'EXECUTED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  None = 'NONE',
  Rejected = 'REJECTED',
  Voting = 'VOTING'
}

export type ProposalVote = {
  __typename?: 'ProposalVote';
  approval: Scalars['Boolean']['output'];
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  proposalId: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
  voter: Scalars['Address']['output'];
};

export type ProposalVoteConnection = {
  __typename?: 'ProposalVoteConnection';
  nodes: Array<ProposalVote>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeMinters: Array<MinterInfo>;
  activeValidators: Array<ValidatorInfo>;
  addressBalance: Scalars['BigInt']['output'];
  addressOverview: AddressOverview;
  addressSetCodeInfo: AddressSetCodeInfo;
  allValidatorsSigningStats: ValidatorSigningStatsConnection;
  balanceHistory: BalanceHistoryConnection;
  blacklistHistory: Array<BlacklistEvent>;
  blacklistedAddresses: Array<Scalars['Address']['output']>;
  block?: Maybe<Block>;
  blockByHash?: Maybe<Block>;
  blockByTimestamp?: Maybe<Block>;
  blockCount: Scalars['BigInt']['output'];
  blockSigners?: Maybe<BlockSigners>;
  blocks: BlockConnection;
  blocksByTimeRange: BlockConnection;
  blocksRange: BlockRangeResult;
  burnEvents: BurnEventConnection;
  chain?: Maybe<Chain>;
  chainHealth?: Maybe<HealthStatus>;
  chains: Array<Chain>;
  contractCall: ContractCallResult;
  contractCreation?: Maybe<ContractCreation>;
  contractVerification?: Maybe<ContractVerification>;
  contracts: ContractCreationConnection;
  contractsByCreator: ContractCreationConnection;
  depositMintProposals: Array<DepositMintProposal>;
  dynamicContractEvents: Array<DynamicContractEvent>;
  emergencyPauseHistory: Array<EmergencyPauseEvent>;
  epochInfo?: Maybe<EpochInfo>;
  erc20Transfer?: Maybe<Erc20Transfer>;
  erc20TransfersByAddress: Erc20TransferConnection;
  erc20TransfersByToken: Erc20TransferConnection;
  erc721Owner?: Maybe<Scalars['Address']['output']>;
  erc721Transfer?: Maybe<Erc721Transfer>;
  erc721TransfersByAddress: Erc721TransferConnection;
  erc721TransfersByToken: Erc721TransferConnection;
  feeDelegationStats: FeeDelegationStats;
  feePayerStats: FeePayerStats;
  gasTipHistory: Array<GasTipUpdateEvent>;
  internalTransactions: Array<InternalTransaction>;
  internalTransactionsByAddress: InternalTransactionConnection;
  internalTransactionsRPC: InternalTransactionsRpcResult;
  latestEpochInfo?: Maybe<EpochInfo>;
  latestHeight: Scalars['BigInt']['output'];
  liveBalance: LiveBalanceResult;
  logs: LogConnection;
  maxProposalsUpdateHistory: Array<MaxProposalsUpdateEvent>;
  memberHistory: Array<MemberChangeEvent>;
  mintEvents: MintEventConnection;
  minterAllowance: Scalars['BigInt']['output'];
  minterHistory: Array<MinterConfigEvent>;
  nftsByOwner: NftOwnershipConnection;
  proposal?: Maybe<Proposal>;
  proposalExecutionSkippedEvents: Array<ProposalExecutionSkippedEvent>;
  proposalVotes: Array<ProposalVote>;
  proposals: ProposalConnection;
  receipt?: Maybe<Receipt>;
  receiptsByBlock: Array<Receipt>;
  recentSetCodeTransactions: Array<Transaction>;
  registeredContract?: Maybe<RegisteredContract>;
  registeredContracts: Array<RegisteredContract>;
  rpcProxyMetrics: RpcProxyMetrics;
  searchTokens: Array<TokenMetadata>;
  setCodeAuthorization?: Maybe<SetCodeAuthorizationWithTx>;
  setCodeAuthorizationsByAuthority: SetCodeAuthorizationConnection;
  setCodeAuthorizationsByTarget: SetCodeAuthorizationConnection;
  setCodeAuthorizationsByTx: Array<SetCodeAuthorizationWithTx>;
  setCodeTransactionCount: Scalars['Int']['output'];
  setCodeTransactionsInBlock: Array<Transaction>;
  tokenBalances: Array<TokenBalance>;
  tokenCount: Scalars['Int']['output'];
  tokenMetadata?: Maybe<TokenMetadata>;
  tokens: TokenMetadataConnection;
  topFeePayers: TopFeePayersResult;
  topMiners: Array<MinerStats>;
  totalSupply: Scalars['BigInt']['output'];
  transaction?: Maybe<Transaction>;
  transactionCount: Scalars['BigInt']['output'];
  transactionStatus: TransactionStatusResult;
  transactions: TransactionConnection;
  transactionsByAddress: TransactionConnection;
  transactionsByAddressFiltered: TransactionConnection;
  validatorHistory: Array<ValidatorChangeEvent>;
  validatorSigningActivity: ValidatorSigningActivityConnection;
  validatorSigningStats?: Maybe<ValidatorSigningStats>;
  watchEvents: Array<WatchEvent>;
  watchedAddress?: Maybe<WatchedAddress>;
  watchedAddresses: Array<WatchedAddress>;
  wbftBlockExtra?: Maybe<WbftBlockExtra>;
  wbftBlockExtraByHash?: Maybe<WbftBlockExtra>;
};


export type QueryAddressBalanceArgs = {
  address: Scalars['Address']['input'];
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryAddressOverviewArgs = {
  address: Scalars['Address']['input'];
};


export type QueryAddressSetCodeInfoArgs = {
  address: Scalars['Address']['input'];
};


export type QueryAllValidatorsSigningStatsArgs = {
  fromBlock: Scalars['BigInt']['input'];
  pagination?: InputMaybe<PaginationInput>;
  toBlock: Scalars['BigInt']['input'];
};


export type QueryBalanceHistoryArgs = {
  address: Scalars['Address']['input'];
  fromBlock: Scalars['BigInt']['input'];
  pagination?: InputMaybe<PaginationInput>;
  toBlock: Scalars['BigInt']['input'];
};


export type QueryBlacklistHistoryArgs = {
  address: Scalars['Address']['input'];
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


export type QueryBlockSignersArgs = {
  blockNumber: Scalars['BigInt']['input'];
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


export type QueryBlocksRangeArgs = {
  endNumber: Scalars['BigInt']['input'];
  includeReceipts?: InputMaybe<Scalars['Boolean']['input']>;
  includeTransactions?: InputMaybe<Scalars['Boolean']['input']>;
  startNumber: Scalars['BigInt']['input'];
};


export type QueryBurnEventsArgs = {
  filter: SystemContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryChainArgs = {
  id: Scalars['ID']['input'];
};


export type QueryChainHealthArgs = {
  id: Scalars['ID']['input'];
};


export type QueryContractCallArgs = {
  abi?: InputMaybe<Scalars['String']['input']>;
  address: Scalars['Address']['input'];
  method: Scalars['String']['input'];
  params?: InputMaybe<Scalars['String']['input']>;
};


export type QueryContractCreationArgs = {
  address: Scalars['Address']['input'];
};


export type QueryContractVerificationArgs = {
  address: Scalars['Address']['input'];
};


export type QueryContractsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryContractsByCreatorArgs = {
  creator: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryDepositMintProposalsArgs = {
  filter: SystemContractEventFilter;
  status?: InputMaybe<ProposalStatus>;
};


export type QueryDynamicContractEventsArgs = {
  filter: DynamicContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryEmergencyPauseHistoryArgs = {
  contract: Scalars['Address']['input'];
};


export type QueryEpochInfoArgs = {
  epochNumber: Scalars['BigInt']['input'];
};


export type QueryErc20TransferArgs = {
  logIndex: Scalars['Int']['input'];
  txHash: Scalars['Hash']['input'];
};


export type QueryErc20TransfersByAddressArgs = {
  address: Scalars['Address']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryErc20TransfersByTokenArgs = {
  pagination?: InputMaybe<PaginationInput>;
  token: Scalars['Address']['input'];
};


export type QueryErc721OwnerArgs = {
  token: Scalars['Address']['input'];
  tokenId: Scalars['BigInt']['input'];
};


export type QueryErc721TransferArgs = {
  logIndex: Scalars['Int']['input'];
  txHash: Scalars['Hash']['input'];
};


export type QueryErc721TransfersByAddressArgs = {
  address: Scalars['Address']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryErc721TransfersByTokenArgs = {
  pagination?: InputMaybe<PaginationInput>;
  token: Scalars['Address']['input'];
};


export type QueryFeeDelegationStatsArgs = {
  fromBlock?: InputMaybe<Scalars['BigInt']['input']>;
  toBlock?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryFeePayerStatsArgs = {
  address: Scalars['Address']['input'];
  fromBlock?: InputMaybe<Scalars['BigInt']['input']>;
  toBlock?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryGasTipHistoryArgs = {
  filter: SystemContractEventFilter;
};


export type QueryInternalTransactionsArgs = {
  txHash: Scalars['Hash']['input'];
};


export type QueryInternalTransactionsByAddressArgs = {
  address: Scalars['Address']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryInternalTransactionsRpcArgs = {
  txHash: Scalars['Hash']['input'];
};


export type QueryLiveBalanceArgs = {
  address: Scalars['Address']['input'];
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryLogsArgs = {
  filter: LogFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMaxProposalsUpdateHistoryArgs = {
  contract: Scalars['Address']['input'];
};


export type QueryMemberHistoryArgs = {
  contract: Scalars['Address']['input'];
};


export type QueryMintEventsArgs = {
  filter: SystemContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMinterAllowanceArgs = {
  minter: Scalars['Address']['input'];
};


export type QueryMinterHistoryArgs = {
  minter: Scalars['Address']['input'];
};


export type QueryNftsByOwnerArgs = {
  owner: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryProposalArgs = {
  contract: Scalars['Address']['input'];
  proposalId: Scalars['BigInt']['input'];
};


export type QueryProposalExecutionSkippedEventsArgs = {
  contract: Scalars['Address']['input'];
  proposalId?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryProposalVotesArgs = {
  contract: Scalars['Address']['input'];
  proposalId: Scalars['BigInt']['input'];
};


export type QueryProposalsArgs = {
  filter: ProposalFilter;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryReceiptArgs = {
  transactionHash: Scalars['Hash']['input'];
};


export type QueryReceiptsByBlockArgs = {
  blockNumber: Scalars['BigInt']['input'];
};


export type QueryRecentSetCodeTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRegisteredContractArgs = {
  address: Scalars['Address']['input'];
};


export type QuerySearchTokensArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySetCodeAuthorizationArgs = {
  authIndex: Scalars['Int']['input'];
  txHash: Scalars['Hash']['input'];
};


export type QuerySetCodeAuthorizationsByAuthorityArgs = {
  authority: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySetCodeAuthorizationsByTargetArgs = {
  pagination?: InputMaybe<PaginationInput>;
  target: Scalars['Address']['input'];
};


export type QuerySetCodeAuthorizationsByTxArgs = {
  txHash: Scalars['Hash']['input'];
};


export type QuerySetCodeTransactionsInBlockArgs = {
  blockNumber: Scalars['BigInt']['input'];
};


export type QueryTokenBalancesArgs = {
  address: Scalars['Address']['input'];
  tokenType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTokenCountArgs = {
  standard?: InputMaybe<TokenStandard>;
};


export type QueryTokenMetadataArgs = {
  address: Scalars['Address']['input'];
};


export type QueryTokensArgs = {
  pagination?: InputMaybe<PaginationInput>;
  standard?: InputMaybe<TokenStandard>;
};


export type QueryTopFeePayersArgs = {
  fromBlock?: InputMaybe<Scalars['BigInt']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toBlock?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryTopMinersArgs = {
  fromBlock?: InputMaybe<Scalars['BigInt']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toBlock?: InputMaybe<Scalars['BigInt']['input']>;
};


export type QueryTransactionArgs = {
  hash: Scalars['Hash']['input'];
};


export type QueryTransactionStatusArgs = {
  txHash: Scalars['Hash']['input'];
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


export type QueryValidatorHistoryArgs = {
  validator: Scalars['Address']['input'];
};


export type QueryValidatorSigningActivityArgs = {
  fromBlock: Scalars['BigInt']['input'];
  pagination?: InputMaybe<PaginationInput>;
  toBlock: Scalars['BigInt']['input'];
  validatorAddress: Scalars['Address']['input'];
};


export type QueryValidatorSigningStatsArgs = {
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
  validatorAddress: Scalars['Address']['input'];
};


export type QueryWatchEventsArgs = {
  addressId?: InputMaybe<Scalars['ID']['input']>;
  chainId?: InputMaybe<Scalars['String']['input']>;
  eventType?: InputMaybe<WatchEventType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWatchedAddressArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWatchedAddressesArgs = {
  chainId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWbftBlockExtraArgs = {
  blockNumber: Scalars['BigInt']['input'];
};


export type QueryWbftBlockExtraByHashArgs = {
  blockHash: Scalars['Hash']['input'];
};

export type RpcProxyMetrics = {
  __typename?: 'RPCProxyMetrics';
  activeWorkers: Scalars['Int']['output'];
  averageLatency: Scalars['BigInt']['output'];
  cacheHits: Scalars['BigInt']['output'];
  cacheMisses: Scalars['BigInt']['output'];
  circuitState: Scalars['String']['output'];
  failedRequests: Scalars['BigInt']['output'];
  queueDepth: Scalars['Int']['output'];
  successfulRequests: Scalars['BigInt']['output'];
  totalRequests: Scalars['BigInt']['output'];
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

export type RegisterChainInput = {
  adapterType?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['BigInt']['input'];
  name: Scalars['String']['input'];
  rpcEndpoint: Scalars['String']['input'];
  startHeight?: InputMaybe<Scalars['BigInt']['input']>;
  wsEndpoint?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterContractInput = {
  abi: Scalars['String']['input'];
  address: Scalars['Address']['input'];
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  name: Scalars['String']['input'];
};

export type RegisteredContract = {
  __typename?: 'RegisteredContract';
  abi: Scalars['String']['output'];
  address: Scalars['Address']['output'];
  blockNumber: Scalars['BigInt']['output'];
  events: Array<Scalars['String']['output']>;
  isVerified: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  registeredAt: Scalars['BigInt']['output'];
};

export type RoundAnalysis = {
  __typename?: 'RoundAnalysis';
  averageRound: Scalars['Float']['output'];
  blocksWithRoundChange: Scalars['BigInt']['output'];
  endBlock: Scalars['BigInt']['output'];
  maxRound: Scalars['Int']['output'];
  roundChangeRate: Scalars['Float']['output'];
  roundDistribution: Array<RoundDistribution>;
  startBlock: Scalars['BigInt']['output'];
  totalBlocks: Scalars['BigInt']['output'];
};

export type RoundDistribution = {
  __typename?: 'RoundDistribution';
  count: Scalars['BigInt']['output'];
  percentage: Scalars['Float']['output'];
  round: Scalars['Int']['output'];
};

export type SetCodeAuthorization = {
  __typename?: 'SetCodeAuthorization';
  address: Scalars['Address']['output'];
  authority?: Maybe<Scalars['Address']['output']>;
  chainId: Scalars['BigInt']['output'];
  nonce: Scalars['BigInt']['output'];
  r: Scalars['Bytes']['output'];
  s: Scalars['Bytes']['output'];
  yParity: Scalars['Int']['output'];
};

export type SetCodeAuthorizationConnection = {
  __typename?: 'SetCodeAuthorizationConnection';
  nodes: Array<SetCodeAuthorizationWithTx>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SetCodeAuthorizationWithTx = {
  __typename?: 'SetCodeAuthorizationWithTx';
  address: Scalars['Address']['output'];
  applied: Scalars['Boolean']['output'];
  authority?: Maybe<Scalars['Address']['output']>;
  authorizationIndex: Scalars['Int']['output'];
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  chainId: Scalars['BigInt']['output'];
  error?: Maybe<Scalars['String']['output']>;
  nonce: Scalars['BigInt']['output'];
  r: Scalars['Bytes']['output'];
  s: Scalars['Bytes']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionIndex: Scalars['Int']['output'];
  txHash: Scalars['Hash']['output'];
  yParity: Scalars['Int']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  chainStatus: Chain;
  consensusBlock: ConsensusBlockSub;
  consensusError: ConsensusErrorSub;
  consensusFork: ConsensusForkSub;
  consensusValidatorChange: ConsensusValidatorChangeSub;
  dynamicContractEvents: DynamicContractEvent;
  logs: Log;
  newBlock: Block;
  newBlockMultiChain: BlockWithChain;
  newPendingTransactions: Transaction;
  newTransaction: Transaction;
  systemContractEvents: SystemContractEventMessage;
  watchedAddressEvents: WatchEvent;
  watchedAddressEventsByChain: WatchEvent;
};


export type SubscriptionChainStatusArgs = {
  chainId: Scalars['ID']['input'];
};


export type SubscriptionConsensusBlockArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionConsensusErrorArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionConsensusForkArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionConsensusValidatorChangeArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionDynamicContractEventsArgs = {
  filter?: InputMaybe<DynamicContractSubscriptionFilter>;
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionLogsArgs = {
  filter: LogFilter;
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionNewBlockArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionNewBlockMultiChainArgs = {
  chainIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type SubscriptionNewPendingTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionNewTransactionArgs = {
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionSystemContractEventsArgs = {
  filter?: InputMaybe<SystemContractSubscriptionFilter>;
  replayLast?: InputMaybe<Scalars['Int']['input']>;
};


export type SubscriptionWatchedAddressEventsArgs = {
  addressId: Scalars['ID']['input'];
};


export type SubscriptionWatchedAddressEventsByChainArgs = {
  chainId: Scalars['String']['input'];
};

export type SyncProgress = {
  __typename?: 'SyncProgress';
  blocksPerSecond: Scalars['Float']['output'];
  currentBlock: Scalars['BigInt']['output'];
  estimatedTimeRemaining?: Maybe<Scalars['BigInt']['output']>;
  isSynced: Scalars['Boolean']['output'];
  percentage: Scalars['Float']['output'];
  targetBlock: Scalars['BigInt']['output'];
};

export type SystemContractEventFilter = {
  address?: InputMaybe<Scalars['Address']['input']>;
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
};

export type SystemContractEventMessage = {
  __typename?: 'SystemContractEventMessage';
  blockNumber: Scalars['BigInt']['output'];
  contract: Scalars['Address']['output'];
  data: Scalars['String']['output'];
  eventName: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
};

export type SystemContractSubscriptionFilter = {
  contract?: InputMaybe<Scalars['Address']['input']>;
  eventTypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type TokenBalance = {
  __typename?: 'TokenBalance';
  address: Scalars['Address']['output'];
  balance: Scalars['BigInt']['output'];
  decimals?: Maybe<Scalars['Int']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  tokenId?: Maybe<Scalars['BigInt']['output']>;
  tokenType: Scalars['String']['output'];
};

export type TokenMetadata = {
  __typename?: 'TokenMetadata';
  address: Scalars['Address']['output'];
  baseURI?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  decimals: Scalars['Int']['output'];
  detectedAt: Scalars['BigInt']['output'];
  name?: Maybe<Scalars['String']['output']>;
  standard: TokenStandard;
  supportsERC165: Scalars['Boolean']['output'];
  supportsEnumerable?: Maybe<Scalars['Boolean']['output']>;
  supportsMetadata: Scalars['Boolean']['output'];
  symbol?: Maybe<Scalars['String']['output']>;
  totalSupply?: Maybe<Scalars['BigInt']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TokenMetadataConnection = {
  __typename?: 'TokenMetadataConnection';
  nodes: Array<TokenMetadata>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum TokenStandard {
  Erc20 = 'ERC20',
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155',
  Unknown = 'UNKNOWN'
}

export type TopFeePayersResult = {
  __typename?: 'TopFeePayersResult';
  nodes: Array<FeePayerStats>;
  totalCount: Scalars['BigInt']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  accessList?: Maybe<Array<AccessListEntry>>;
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

export type TransactionStatusResult = {
  __typename?: 'TransactionStatusResult';
  blockHash?: Maybe<Scalars['Hash']['output']>;
  blockNumber?: Maybe<Scalars['BigInt']['output']>;
  confirmations: Scalars['BigInt']['output'];
  gasUsed?: Maybe<Scalars['BigInt']['output']>;
  status: Scalars['String']['output'];
  txHash: Scalars['Hash']['output'];
};

export type ValidatorActivity = {
  __typename?: 'ValidatorActivity';
  address: Scalars['Address']['output'];
  blocksAgo: Scalars['BigInt']['output'];
  currentStreak: Scalars['BigInt']['output'];
  isActive: Scalars['Boolean']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastSeen: Scalars['BigInt']['output'];
};

export type ValidatorChange = {
  __typename?: 'ValidatorChange';
  addedValidators: Array<Scalars['Address']['output']>;
  blockNumber: Scalars['BigInt']['output'];
  epochNumber: Scalars['BigInt']['output'];
  newValidators: Array<Scalars['Address']['output']>;
  previousValidators: Array<Scalars['Address']['output']>;
  removedValidators: Array<Scalars['Address']['output']>;
};

export type ValidatorChangeEvent = {
  __typename?: 'ValidatorChangeEvent';
  action: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  oldValidator?: Maybe<Scalars['Address']['output']>;
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['Hash']['output'];
  validator: Scalars['Address']['output'];
};

export type ValidatorInfo = {
  __typename?: 'ValidatorInfo';
  address: Scalars['Address']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type ValidatorInfoDetailed = {
  __typename?: 'ValidatorInfoDetailed';
  address: Scalars['Address']['output'];
  blsPubKey?: Maybe<Scalars['Bytes']['output']>;
  index: Scalars['Int']['output'];
};

export type ValidatorParticipation = {
  __typename?: 'ValidatorParticipation';
  address: Scalars['Address']['output'];
  blocks: Array<BlockParticipation>;
  blocksCommitted: Scalars['BigInt']['output'];
  blocksMissed: Scalars['BigInt']['output'];
  blocksProposed: Scalars['BigInt']['output'];
  endBlock: Scalars['BigInt']['output'];
  participationRate: Scalars['Float']['output'];
  startBlock: Scalars['BigInt']['output'];
  totalBlocks: Scalars['BigInt']['output'];
};

export type ValidatorSet = {
  __typename?: 'ValidatorSet';
  blockNumber: Scalars['BigInt']['output'];
  count: Scalars['Int']['output'];
  epochNumber?: Maybe<Scalars['BigInt']['output']>;
  validators: Array<Scalars['Address']['output']>;
};

export type ValidatorSigningActivity = {
  __typename?: 'ValidatorSigningActivity';
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  round: Scalars['Int']['output'];
  signedCommit: Scalars['Boolean']['output'];
  signedPrepare: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  validatorAddress: Scalars['Address']['output'];
  validatorIndex: Scalars['Int']['output'];
};

export type ValidatorSigningActivityConnection = {
  __typename?: 'ValidatorSigningActivityConnection';
  nodes: Array<ValidatorSigningActivity>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ValidatorSigningStats = {
  __typename?: 'ValidatorSigningStats';
  commitMissCount: Scalars['BigInt']['output'];
  commitSignCount: Scalars['BigInt']['output'];
  fromBlock: Scalars['BigInt']['output'];
  prepareMissCount: Scalars['BigInt']['output'];
  prepareSignCount: Scalars['BigInt']['output'];
  signingRate: Scalars['Float']['output'];
  toBlock: Scalars['BigInt']['output'];
  validatorAddress: Scalars['Address']['output'];
  validatorIndex: Scalars['Int']['output'];
};

export type ValidatorSigningStatsConnection = {
  __typename?: 'ValidatorSigningStatsConnection';
  nodes: Array<ValidatorSigningStats>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ValidatorStats = {
  __typename?: 'ValidatorStats';
  address: Scalars['Address']['output'];
  blocksProposed: Scalars['BigInt']['output'];
  commitsMissed: Scalars['BigInt']['output'];
  commitsSigned: Scalars['BigInt']['output'];
  lastCommittedBlock?: Maybe<Scalars['BigInt']['output']>;
  lastProposedBlock?: Maybe<Scalars['BigInt']['output']>;
  lastSeenBlock?: Maybe<Scalars['BigInt']['output']>;
  participationRate: Scalars['Float']['output'];
  preparesMissed: Scalars['BigInt']['output'];
  preparesSigned: Scalars['BigInt']['output'];
  totalBlocks: Scalars['BigInt']['output'];
};

export type WbftAggregatedSeal = {
  __typename?: 'WBFTAggregatedSeal';
  sealers: Scalars['Bytes']['output'];
  signature: Scalars['Bytes']['output'];
};

export type WbftBlockExtra = {
  __typename?: 'WBFTBlockExtra';
  blockHash: Scalars['Hash']['output'];
  blockNumber: Scalars['BigInt']['output'];
  committedSeal?: Maybe<WbftAggregatedSeal>;
  epochInfo?: Maybe<EpochInfo>;
  gasTip?: Maybe<Scalars['BigInt']['output']>;
  preparedSeal?: Maybe<WbftAggregatedSeal>;
  prevCommittedSeal?: Maybe<WbftAggregatedSeal>;
  prevPreparedSeal?: Maybe<WbftAggregatedSeal>;
  prevRound: Scalars['Int']['output'];
  randaoReveal: Scalars['Bytes']['output'];
  round: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type WatchAddressInput = {
  address: Scalars['Address']['input'];
  chainId: Scalars['String']['input'];
  filter: WatchFilterInput;
  label?: InputMaybe<Scalars['String']['input']>;
};

export type WatchEvent = {
  __typename?: 'WatchEvent';
  addressId: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  chainId: Scalars['String']['output'];
  data: Scalars['JSON']['output'];
  eventType: WatchEventType;
  id: Scalars['ID']['output'];
  logIndex?: Maybe<Scalars['Int']['output']>;
  timestamp: Scalars['DateTime']['output'];
  txHash: Scalars['Hash']['output'];
};

export type WatchEventConnection = {
  __typename?: 'WatchEventConnection';
  nodes: Array<WatchEvent>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum WatchEventType {
  Erc20Transfer = 'ERC20_TRANSFER',
  Erc721Transfer = 'ERC721_TRANSFER',
  Log = 'LOG',
  TxFrom = 'TX_FROM',
  TxTo = 'TX_TO'
}

export type WatchFilter = {
  __typename?: 'WatchFilter';
  erc20: Scalars['Boolean']['output'];
  erc721: Scalars['Boolean']['output'];
  logs: Scalars['Boolean']['output'];
  minValue?: Maybe<Scalars['BigInt']['output']>;
  txFrom: Scalars['Boolean']['output'];
  txTo: Scalars['Boolean']['output'];
};

export type WatchFilterInput = {
  erc20: Scalars['Boolean']['input'];
  erc721: Scalars['Boolean']['input'];
  logs: Scalars['Boolean']['input'];
  minValue?: InputMaybe<Scalars['BigInt']['input']>;
  txFrom: Scalars['Boolean']['input'];
  txTo: Scalars['Boolean']['input'];
};

export type WatchStats = {
  __typename?: 'WatchStats';
  eventsLast24h: Scalars['BigInt']['output'];
  lastEventAt?: Maybe<Scalars['DateTime']['output']>;
  totalEvents: Scalars['BigInt']['output'];
};

export type WatchedAddress = {
  __typename?: 'WatchedAddress';
  address: Scalars['Address']['output'];
  chainId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  filter: WatchFilter;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  recentEvents: Array<WatchEvent>;
  stats?: Maybe<WatchStats>;
};


export type WatchedAddressRecentEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type WatchedAddressConnection = {
  __typename?: 'WatchedAddressConnection';
  nodes: Array<WatchedAddress>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GetTokenInfoQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetTokenInfoQuery = { __typename?: 'Query', logs: { __typename?: 'LogConnection', totalCount: number } };

export type GetTokenLogsRelayQueryVariables = Exact<{
  address: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTokenLogsRelayQuery = { __typename?: 'Query', logs: { __typename?: 'LogConnection', totalCount: number, nodes: Array<{ __typename?: 'Log', transactionHash: string, blockNumber: string, topics: Array<string>, data: string }> } };

export type GetLatestHeightQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestHeightQuery = { __typename?: 'Query', latestHeight: string };

export type GetBlockQueryVariables = Exact<{
  number: Scalars['String']['input'];
}>;


export type GetBlockQuery = { __typename?: 'Query', block?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null, withdrawalsRoot?: string | null, blobGasUsed?: string | null, excessBlobGas?: string | null, transactions: Array<{ __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, type: number, nonce: string }> } | null };

export type GetBlockByHashQueryVariables = Exact<{
  hash: Scalars['String']['input'];
}>;


export type GetBlockByHashQuery = { __typename?: 'Query', blockByHash?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null, withdrawalsRoot?: string | null, blobGasUsed?: string | null, excessBlobGas?: string | null, transactions: Array<{ __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string }> } | null };

export type GetTransactionQueryVariables = Exact<{
  hash: Scalars['String']['input'];
}>;


export type GetTransactionQuery = { __typename?: 'Query', transaction?: { __typename?: 'Transaction', hash: string, blockNumber: string, blockHash: string, transactionIndex: number, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, type: number, input: string, nonce: string, v: string, r: string, s: string, chainId?: string | null, feePayer?: string | null, feePayerSignatures?: Array<{ __typename?: 'FeePayerSignature', v: string, r: string, s: string }> | null, receipt?: { __typename?: 'Receipt', status: number, gasUsed: string, cumulativeGasUsed: string, effectiveGasPrice: string, contractAddress?: string | null, logs: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, logIndex: number }> } | null } | null };

export type GetTransactionsByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTransactionsByAddressQuery = { __typename?: 'Query', transactionsByAddress: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, from: string, to?: string | null, value: string, gas: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetAddressBalanceQueryVariables = Exact<{
  address: Scalars['String']['input'];
  blockNumber?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAddressBalanceQuery = { __typename?: 'Query', addressBalance: string };

export type GetAddressOverviewQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetAddressOverviewQuery = { __typename?: 'Query', addressOverview: { __typename?: 'AddressOverview', address: string, isContract: boolean, balance: string, transactionCount: number, sentCount: number, receivedCount: number, internalTxCount: number, erc20TokenCount: number, erc721TokenCount: number, firstSeen?: string | null, lastSeen?: string | null } };

export type GetLiveBalanceQueryVariables = Exact<{
  address: Scalars['String']['input'];
  blockNumber?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLiveBalanceQuery = { __typename?: 'Query', liveBalance: { __typename?: 'LiveBalanceResult', address: string, balance: string, blockNumber: string } };

export type GetBalanceHistoryQueryVariables = Exact<{
  address: Scalars['String']['input'];
  fromBlock: Scalars['String']['input'];
  toBlock: Scalars['String']['input'];
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

export type GetBlockCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlockCountQuery = { __typename?: 'Query', blockCount: string };

export type GetTransactionCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTransactionCountQuery = { __typename?: 'Query', transactionCount: string };

export type GetReceiptQueryVariables = Exact<{
  txHash: Scalars['String']['input'];
}>;


export type GetReceiptQuery = { __typename?: 'Query', receipt?: { __typename?: 'Receipt', transactionHash: string, blockNumber: string, blockHash: string, transactionIndex: number, status: number, gasUsed: string, cumulativeGasUsed: string, effectiveGasPrice: string, contractAddress?: string | null, logsBloom: string, logs: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, logIndex: number, blockNumber: string, transactionHash: string }> } | null };

export type GetReceiptsByBlockQueryVariables = Exact<{
  blockNumber: Scalars['String']['input'];
}>;


export type GetReceiptsByBlockQuery = { __typename?: 'Query', receiptsByBlock: Array<{ __typename?: 'Receipt', transactionHash: string, blockNumber: string, blockHash: string, transactionIndex: number, status: number, gasUsed: string, cumulativeGasUsed: string, effectiveGasPrice: string, contractAddress?: string | null, logs: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, logIndex: number }> }> };

export type NewBlockSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NewBlockSubscription = { __typename?: 'Subscription', newBlock: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, transactionCount: number } };

export type NewTransactionSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NewTransactionSubscription = { __typename?: 'Subscription', newTransaction: { __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, nonce: string, gas: string, type: number, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, blockNumber: string, blockHash: string, transactionIndex: number, feePayer?: string | null } };

export type NewPendingTransactionsSubscriptionVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NewPendingTransactionsSubscription = { __typename?: 'Subscription', newPendingTransactions: { __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, nonce: string, gas: string, type: number, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, feePayer?: string | null } };

export type LogsSubscriptionVariables = Exact<{
  filter: LogFilter;
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type LogsSubscription = { __typename?: 'Subscription', logs: { __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, blockHash: string, transactionHash: string, transactionIndex: number, logIndex: number, removed: boolean } };

export type ChainConfigSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ChainConfigSubscription = { __typename?: 'Subscription' };

export type ValidatorSetSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ValidatorSetSubscription = { __typename?: 'Subscription' };

export type GetTokenBalancesQueryVariables = Exact<{
  address: Scalars['String']['input'];
  tokenType?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTokenBalancesQuery = { __typename?: 'Query', tokenBalances: Array<{ __typename?: 'TokenBalance', address: string, tokenType: string, balance: string, tokenId?: string | null, name?: string | null, symbol?: string | null, decimals?: number | null, metadata?: string | null }> };

export type OnConsensusBlockSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnConsensusBlockSubscription = { __typename?: 'Subscription', consensusBlock: { __typename?: 'ConsensusBlockSub', blockNumber: string, blockHash: string, timestamp: string, round: number, prevRound: number, roundChanged: boolean, proposer: string, validatorCount: number, prepareCount: number, commitCount: number, participationRate: number, missedValidatorRate: number, isEpochBoundary: boolean, epochNumber?: string | null, epochValidators?: Array<string> | null } };

export type OnConsensusForkSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnConsensusForkSubscription = { __typename?: 'Subscription', consensusFork: { __typename?: 'ConsensusForkSub', forkBlockNumber: string, forkBlockHash: string, chain1Hash: string, chain1Height: string, chain1Weight: string, chain2Hash: string, chain2Height: string, chain2Weight: string, resolved: boolean, winningChain: number, detectedAt: string, detectionLag: string } };

export type OnValidatorChangeSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnValidatorChangeSubscription = { __typename?: 'Subscription', consensusValidatorChange: { __typename?: 'ConsensusValidatorChangeSub', blockNumber: string, blockHash: string, timestamp: string, epochNumber: string, isEpochBoundary: boolean, changeType: string, previousValidatorCount: number, newValidatorCount: number, addedValidators?: Array<string> | null, removedValidators?: Array<string> | null, validatorSet?: Array<string> | null, additionalInfo?: string | null } };

export type OnConsensusErrorSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnConsensusErrorSubscription = { __typename?: 'Subscription', consensusError: { __typename?: 'ConsensusErrorSub', blockNumber: string, blockHash: string, timestamp: string, errorType: string, severity: string, errorMessage: string, round: number, expectedValidators: number, actualSigners: number, participationRate: number, missedValidators?: Array<string> | null, consensusImpacted: boolean, recoveryTime: string, errorDetails?: string | null } };

export type GetFeeDelegationStatsQueryVariables = Exact<{
  fromBlock?: InputMaybe<Scalars['String']['input']>;
  toBlock?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFeeDelegationStatsQuery = { __typename?: 'Query', feeDelegationStats: { __typename?: 'FeeDelegationStats', totalFeeDelegatedTxs: string, totalFeesSaved: string, adoptionRate: number, avgFeeSaved: string } };

export type GetTopFeePayersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  fromBlock?: InputMaybe<Scalars['String']['input']>;
  toBlock?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTopFeePayersQuery = { __typename?: 'Query', topFeePayers: { __typename?: 'TopFeePayersResult', totalCount: string, nodes: Array<{ __typename?: 'FeePayerStats', address: string, txCount: string, totalFeesPaid: string, percentage: number }> } };

export type GetFeePayerStatsQueryVariables = Exact<{
  address: Scalars['String']['input'];
  fromBlock?: InputMaybe<Scalars['String']['input']>;
  toBlock?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFeePayerStatsQuery = { __typename?: 'Query', feePayerStats: { __typename?: 'FeePayerStats', address: string, txCount: string, totalFeesPaid: string, percentage: number } };

export type GetSetCodeTransactionsQueryVariables = Exact<{
  address: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetSetCodeTransactionsQuery = { __typename?: 'Query', transactionsByAddress: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, from: string, to?: string | null, type: number }> } };

export type GetContractCreationQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetContractCreationQuery = { __typename?: 'Query', contractCreation?: { __typename?: 'ContractCreation', contractAddress: string, name?: string | null, creator: string, transactionHash: string, blockNumber: string, timestamp: string, bytecodeSize: number } | null };

export type GetContractsByCreatorQueryVariables = Exact<{
  creator: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetContractsByCreatorQuery = { __typename?: 'Query', contractsByCreator: { __typename?: 'ContractCreationConnection', totalCount: number, nodes: Array<{ __typename?: 'ContractCreation', contractAddress: string, name?: string | null, creator: string, transactionHash: string, blockNumber: string, timestamp: string, bytecodeSize: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetContractsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetContractsQuery = { __typename?: 'Query', contracts: { __typename?: 'ContractCreationConnection', totalCount: number, nodes: Array<{ __typename?: 'ContractCreation', contractAddress: string, name?: string | null, creator: string, transactionHash: string, blockNumber: string, timestamp: string, bytecodeSize: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetInternalTransactionsByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetInternalTransactionsByAddressQuery = { __typename?: 'Query', internalTransactionsByAddress: { __typename?: 'InternalTransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'InternalTransaction', transactionHash: string, type: string, from: string, to: string, value: string, input: string, output: string, error?: string | null, blockNumber: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetErc20TransferQueryVariables = Exact<{
  txHash: Scalars['Hash']['input'];
  logIndex: Scalars['Int']['input'];
}>;


export type GetErc20TransferQuery = { __typename?: 'Query', erc20Transfer?: { __typename?: 'ERC20Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, value: string, blockNumber: string } | null };

export type GetErc20TransfersByTokenQueryVariables = Exact<{
  token: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetErc20TransfersByTokenQuery = { __typename?: 'Query', erc20TransfersByToken: { __typename?: 'ERC20TransferConnection', totalCount: number, nodes: Array<{ __typename?: 'ERC20Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, value: string, blockNumber: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetErc20TransfersByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetErc20TransfersByAddressQuery = { __typename?: 'Query', erc20TransfersByAddress: { __typename?: 'ERC20TransferConnection', totalCount: number, nodes: Array<{ __typename?: 'ERC20Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, value: string, blockNumber: string, timestamp: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetErc721TransferQueryVariables = Exact<{
  txHash: Scalars['Hash']['input'];
  logIndex: Scalars['Int']['input'];
}>;


export type GetErc721TransferQuery = { __typename?: 'Query', erc721Transfer?: { __typename?: 'ERC721Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, tokenId: string, blockNumber: string } | null };

export type GetErc721TransfersByTokenQueryVariables = Exact<{
  token: Scalars['Address']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetErc721TransfersByTokenQuery = { __typename?: 'Query', erc721TransfersByToken: { __typename?: 'ERC721TransferConnection', totalCount: number, nodes: Array<{ __typename?: 'ERC721Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, tokenId: string, blockNumber: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetErc721TransfersByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
  isFrom: Scalars['Boolean']['input'];
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetErc721TransfersByAddressQuery = { __typename?: 'Query', erc721TransfersByAddress: { __typename?: 'ERC721TransferConnection', totalCount: number, nodes: Array<{ __typename?: 'ERC721Transfer', transactionHash: string, logIndex: number, contractAddress: string, from: string, to: string, tokenId: string, blockNumber: string, timestamp: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetErc721OwnerQueryVariables = Exact<{
  token: Scalars['Address']['input'];
  tokenId: Scalars['BigInt']['input'];
}>;


export type GetErc721OwnerQuery = { __typename?: 'Query', erc721Owner?: string | null };

export type GetWbftBlockExtraQueryVariables = Exact<{
  blockNumber: Scalars['BigInt']['input'];
}>;


export type GetWbftBlockExtraQuery = { __typename?: 'Query', wbftBlockExtra?: { __typename?: 'WBFTBlockExtra', blockNumber: string, blockHash: string, randaoReveal: string, prevRound: number, round: number, gasTip?: string | null, timestamp: string, preparedSeal?: { __typename?: 'WBFTAggregatedSeal', sealers: string, signature: string } | null, committedSeal?: { __typename?: 'WBFTAggregatedSeal', sealers: string, signature: string } | null, epochInfo?: { __typename?: 'EpochInfo', epochNumber: string, blockNumber: string, validators: Array<number>, blsPublicKeys: Array<string>, candidates: Array<{ __typename?: 'Candidate', address: string, diligence: string }> } | null } | null };

export type GetWbftBlockExtraByHashQueryVariables = Exact<{
  blockHash: Scalars['Hash']['input'];
}>;


export type GetWbftBlockExtraByHashQuery = { __typename?: 'Query', wbftBlockExtraByHash?: { __typename?: 'WBFTBlockExtra', blockNumber: string, blockHash: string, randaoReveal: string, prevRound: number, round: number, gasTip?: string | null, timestamp: string, preparedSeal?: { __typename?: 'WBFTAggregatedSeal', sealers: string, signature: string } | null, committedSeal?: { __typename?: 'WBFTAggregatedSeal', sealers: string, signature: string } | null, epochInfo?: { __typename?: 'EpochInfo', epochNumber: string, blockNumber: string, validators: Array<number>, blsPublicKeys: Array<string>, candidates: Array<{ __typename?: 'Candidate', address: string, diligence: string }> } | null } | null };

export type GetEpochInfoQueryVariables = Exact<{
  epochNumber: Scalars['BigInt']['input'];
}>;


export type GetEpochInfoQuery = { __typename?: 'Query', epochInfo?: { __typename?: 'EpochInfo', epochNumber: string, blockNumber: string, validators: Array<number>, blsPublicKeys: Array<string>, candidates: Array<{ __typename?: 'Candidate', address: string, diligence: string }> } | null };

export type GetLatestEpochInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestEpochInfoQuery = { __typename?: 'Query', latestEpochInfo?: { __typename?: 'EpochInfo', epochNumber: string, blockNumber: string, validators: Array<number>, blsPublicKeys: Array<string>, candidates: Array<{ __typename?: 'Candidate', address: string, diligence: string }> } | null };

export type GetValidatorSigningStatsQueryVariables = Exact<{
  validatorAddress: Scalars['Address']['input'];
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
}>;


export type GetValidatorSigningStatsQuery = { __typename?: 'Query', validatorSigningStats?: { __typename?: 'ValidatorSigningStats', validatorAddress: string, validatorIndex: number, prepareSignCount: string, prepareMissCount: string, commitSignCount: string, commitMissCount: string, fromBlock: string, toBlock: string, signingRate: number } | null };

export type GetAllValidatorsSigningStatsQueryVariables = Exact<{
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllValidatorsSigningStatsQuery = { __typename?: 'Query', allValidatorsSigningStats: { __typename?: 'ValidatorSigningStatsConnection', totalCount: number, nodes: Array<{ __typename?: 'ValidatorSigningStats', validatorAddress: string, validatorIndex: number, prepareSignCount: string, prepareMissCount: string, commitSignCount: string, commitMissCount: string, fromBlock: string, toBlock: string, signingRate: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetValidatorSigningActivityQueryVariables = Exact<{
  validatorAddress: Scalars['Address']['input'];
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetValidatorSigningActivityQuery = { __typename?: 'Query', validatorSigningActivity: { __typename?: 'ValidatorSigningActivityConnection', totalCount: number, nodes: Array<{ __typename?: 'ValidatorSigningActivity', blockNumber: string, blockHash: string, validatorAddress: string, validatorIndex: number, signedPrepare: boolean, signedCommit: boolean, round: number, timestamp: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetBlockSignersQueryVariables = Exact<{
  blockNumber: Scalars['BigInt']['input'];
}>;


export type GetBlockSignersQuery = { __typename?: 'Query', blockSigners?: { __typename?: 'BlockSigners', blockNumber: string, preparers: Array<string>, committers: Array<string> } | null };

export type GetContractVerificationQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetContractVerificationQuery = { __typename?: 'Query', contractVerification?: { __typename?: 'ContractVerification', address: string, isVerified: boolean, name?: string | null, compilerVersion?: string | null, optimizationEnabled?: boolean | null, optimizationRuns?: number | null, sourceCode?: string | null, abi?: string | null, constructorArguments?: string | null, verifiedAt?: string | null, licenseType?: string | null } | null };

export type VerifyContractMutationVariables = Exact<{
  address: Scalars['String']['input'];
  sourceCode: Scalars['String']['input'];
  compilerVersion: Scalars['String']['input'];
  optimizationEnabled: Scalars['Boolean']['input'];
  optimizationRuns?: InputMaybe<Scalars['Int']['input']>;
  constructorArguments?: InputMaybe<Scalars['String']['input']>;
  contractName?: InputMaybe<Scalars['String']['input']>;
  licenseType?: InputMaybe<Scalars['String']['input']>;
}>;


export type VerifyContractMutation = { __typename?: 'Mutation', verifyContract: { __typename?: 'ContractVerification', address: string, isVerified: boolean, verifiedAt?: string | null } };

export type GetAddressBalanceRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetAddressBalanceRelayQuery = { __typename?: 'Query', addressBalance: string };

export type GetTokenBalancesRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetTokenBalancesRelayQuery = { __typename?: 'Query', tokenBalances: Array<{ __typename?: 'TokenBalance', address: string, balance: string, tokenId?: string | null, tokenType: string }> };

export type GetTransactionsByAddressRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTransactionsByAddressRelayQuery = { __typename?: 'Query', transactionsByAddress: { __typename?: 'TransactionConnection', totalCount: number, nodes: Array<{ __typename?: 'Transaction', hash: string, blockNumber: string, blockHash: string, transactionIndex: number, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, type: number, input: string, nonce: string, receipt?: { __typename?: 'Receipt', status: number, gasUsed: string, contractAddress?: string | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetLogsByAddressRelayQueryVariables = Exact<{
  address?: InputMaybe<Scalars['Address']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLogsByAddressRelayQuery = { __typename?: 'Query', logs: { __typename?: 'LogConnection', totalCount: number, nodes: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, blockHash: string, transactionHash: string, transactionIndex: number, logIndex: number }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetBlockTimestampQueryVariables = Exact<{
  number: Scalars['BigInt']['input'];
}>;


export type GetBlockTimestampQuery = { __typename?: 'Query', block?: { __typename?: 'Block', number: string, timestamp: string } | null };

export type GetLatestHeightRelayQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestHeightRelayQuery = { __typename?: 'Query', latestHeight: string };

export type GetContractCreationRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetContractCreationRelayQuery = { __typename?: 'Query', contractCreation?: { __typename?: 'ContractCreation', contractAddress: string, creator: string, transactionHash: string, blockNumber: string, timestamp: string } | null };

export type GetContractVerificationRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetContractVerificationRelayQuery = { __typename?: 'Query', contractVerification?: { __typename?: 'ContractVerification', address: string, isVerified: boolean, name?: string | null, compilerVersion?: string | null, optimizationEnabled?: boolean | null, optimizationRuns?: number | null, sourceCode?: string | null, abi?: string | null, constructorArguments?: string | null, verifiedAt?: string | null, licenseType?: string | null } | null };

export type GetActiveValidatorsRelayQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveValidatorsRelayQuery = { __typename?: 'Query', activeValidators: Array<{ __typename?: 'ValidatorInfo', address: string, isActive: boolean }> };

export type GetBlockByNumberRelayQueryVariables = Exact<{
  number: Scalars['BigInt']['input'];
}>;


export type GetBlockByNumberRelayQuery = { __typename?: 'Query', block?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null } | null };

export type GetBlockByHashRelayQueryVariables = Exact<{
  hash: Scalars['Hash']['input'];
}>;


export type GetBlockByHashRelayQuery = { __typename?: 'Query', blockByHash?: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasUsed: string, gasLimit: string, size: string, transactionCount: number, baseFeePerGas?: string | null } | null };

export type GetTransactionRelayQueryVariables = Exact<{
  hash: Scalars['Hash']['input'];
}>;


export type GetTransactionRelayQuery = { __typename?: 'Query', transaction?: { __typename?: 'Transaction', hash: string, blockNumber: string, blockHash: string, transactionIndex: number, from: string, to?: string | null, value: string, gas: string, gasPrice?: string | null, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, type: number, input: string, nonce: string, receipt?: { __typename?: 'Receipt', status: number, gasUsed: string, cumulativeGasUsed: string, effectiveGasPrice: string, contractAddress?: string | null, logs: Array<{ __typename?: 'Log', address: string, topics: Array<string>, data: string, logIndex: number }> } | null } | null };

export type GetAccountTxCountRelayQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetAccountTxCountRelayQuery = { __typename?: 'Query', transactionsByAddress: { __typename?: 'TransactionConnection', totalCount: number } };

export type GetRecentTransactionsRelayQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
}>;


export type GetRecentTransactionsRelayQuery = { __typename?: 'Query', transactions: { __typename?: 'TransactionConnection', nodes: Array<{ __typename?: 'Transaction', gasPrice?: string | null, receipt?: { __typename?: 'Receipt', gasUsed: string } | null }> } };

export type ContractCallQueryVariables = Exact<{
  address: Scalars['Address']['input'];
  method: Scalars['String']['input'];
  params?: InputMaybe<Scalars['String']['input']>;
  abi?: InputMaybe<Scalars['String']['input']>;
}>;


export type ContractCallQuery = { __typename?: 'Query', contractCall: { __typename?: 'ContractCallResult', result?: string | null, rawResult: string, decoded: boolean } };

export type TransactionStatusQueryVariables = Exact<{
  txHash: Scalars['Hash']['input'];
}>;


export type TransactionStatusQuery = { __typename?: 'Query', transactionStatus: { __typename?: 'TransactionStatusResult', txHash: string, status: string, blockNumber?: string | null, blockHash?: string | null, confirmations: string, gasUsed?: string | null } };

export type InternalTransactionsRpcQueryVariables = Exact<{
  txHash: Scalars['Hash']['input'];
}>;


export type InternalTransactionsRpcQuery = { __typename?: 'Query', internalTransactionsRPC: { __typename?: 'InternalTransactionsRPCResult', txHash: string, totalCount: number, internalTransactions: Array<{ __typename?: 'InternalTransactionRPC', type: string, from: string, to: string, value: string, gas: string, gasUsed: string, input: string, output: string, error?: string | null, depth: number, traceAddress: Array<number> }> } };

export type RpcProxyMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type RpcProxyMetricsQuery = { __typename?: 'Query', rpcProxyMetrics: { __typename?: 'RPCProxyMetrics', totalRequests: string, successfulRequests: string, failedRequests: string, cacheHits: string, cacheMisses: string, averageLatency: string, queueDepth: number, activeWorkers: number, circuitState: string } };

export type SearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
  types?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchQuery = { __typename?: 'Query' };

export type SearchAutocompleteQueryVariables = Exact<{
  query: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchAutocompleteQuery = { __typename?: 'Query' };

export type GetTopMinersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  fromBlock?: InputMaybe<Scalars['String']['input']>;
  toBlock?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTopMinersQuery = { __typename?: 'Query', topMiners: Array<{ __typename?: 'MinerStats', address: string, blockCount: string, percentage: number, totalRewards: string, lastBlockNumber: string, lastBlockTime: string }> };

export type GetNetworkStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNetworkStatsQuery = { __typename?: 'Query' };

export type GetTotalSupplyQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTotalSupplyQuery = { __typename?: 'Query', totalSupply: string };

export type GetActiveMintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveMintersQuery = { __typename?: 'Query', activeMinters: Array<{ __typename?: 'MinterInfo', address: string, allowance: string, isActive: boolean }> };

export type GetMinterAllowanceQueryVariables = Exact<{
  minter: Scalars['Address']['input'];
}>;


export type GetMinterAllowanceQuery = { __typename?: 'Query', minterAllowance: string };

export type GetMintEventsQueryVariables = Exact<{
  filter: SystemContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetMintEventsQuery = { __typename?: 'Query', mintEvents: { __typename?: 'MintEventConnection', totalCount: number, nodes: Array<{ __typename?: 'MintEvent', blockNumber: string, transactionHash: string, minter: string, to: string, amount: string, timestamp: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetBurnEventsQueryVariables = Exact<{
  filter: SystemContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetBurnEventsQuery = { __typename?: 'Query', burnEvents: { __typename?: 'BurnEventConnection', totalCount: number, nodes: Array<{ __typename?: 'BurnEvent', blockNumber: string, transactionHash: string, burner: string, amount: string, timestamp: string, withdrawalId?: string | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetProposalsQueryVariables = Exact<{
  filter: ProposalFilter;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetProposalsQuery = { __typename?: 'Query', proposals: { __typename?: 'ProposalConnection', totalCount: number, nodes: Array<{ __typename?: 'Proposal', contract: string, proposalId: string, proposer: string, actionType: string, callData: string, memberVersion: string, requiredApprovals: number, approved: number, rejected: number, status: ProposalStatus, createdAt: string, executedAt?: string | null, blockNumber: string, transactionHash: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetProposalQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
  proposalId: Scalars['BigInt']['input'];
}>;


export type GetProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', contract: string, proposalId: string, proposer: string, actionType: string, callData: string, memberVersion: string, requiredApprovals: number, approved: number, rejected: number, status: ProposalStatus, createdAt: string, executedAt?: string | null, blockNumber: string, transactionHash: string } | null };

export type GetProposalVotesQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
  proposalId: Scalars['BigInt']['input'];
}>;


export type GetProposalVotesQuery = { __typename?: 'Query', proposalVotes: Array<{ __typename?: 'ProposalVote', contract: string, proposalId: string, voter: string, approval: boolean, blockNumber: string, transactionHash: string, timestamp: string }> };

export type GetActiveValidatorsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveValidatorsQuery = { __typename?: 'Query', activeValidators: Array<{ __typename?: 'ValidatorInfo', address: string, isActive: boolean }> };

export type GetBlacklistedAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlacklistedAddressesQuery = { __typename?: 'Query', blacklistedAddresses: Array<string> };

export type GetDepositMintProposalsQueryVariables = Exact<{
  filter: SystemContractEventFilter;
  status?: InputMaybe<ProposalStatus>;
}>;


export type GetDepositMintProposalsQuery = { __typename?: 'Query', depositMintProposals: Array<{ __typename?: 'DepositMintProposal', proposalId: string, requester: string, beneficiary: string, amount: string, depositId: string, bankReference: string, status: ProposalStatus, blockNumber: string, transactionHash: string, timestamp: string }> };

export type GetMaxProposalsUpdateHistoryQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
}>;


export type GetMaxProposalsUpdateHistoryQuery = { __typename?: 'Query', maxProposalsUpdateHistory: Array<{ __typename?: 'MaxProposalsUpdateEvent', contract: string, blockNumber: string, transactionHash: string, oldMax: string, newMax: string, timestamp: string }> };

export type GetProposalExecutionSkippedEventsQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
  proposalId?: InputMaybe<Scalars['BigInt']['input']>;
}>;


export type GetProposalExecutionSkippedEventsQuery = { __typename?: 'Query', proposalExecutionSkippedEvents: Array<{ __typename?: 'ProposalExecutionSkippedEvent', contract: string, blockNumber: string, transactionHash: string, account: string, proposalId: string, reason: string, timestamp: string }> };

export type SystemContractEventsSubscriptionVariables = Exact<{
  filter?: InputMaybe<SystemContractSubscriptionFilter>;
}>;


export type SystemContractEventsSubscription = { __typename?: 'Subscription', systemContractEvents: { __typename?: 'SystemContractEventMessage', contract: string, eventName: string, blockNumber: string, transactionHash: string, logIndex: number, data: string, timestamp: string } };

export type RegisterContractMutationVariables = Exact<{
  input: RegisterContractInput;
}>;


export type RegisterContractMutation = { __typename?: 'Mutation', registerContract: { __typename?: 'RegisteredContract', address: string, name: string, abi: string, registeredAt: string, blockNumber: string, isVerified: boolean, events: Array<string> } };

export type UnregisterContractMutationVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type UnregisterContractMutation = { __typename?: 'Mutation', unregisterContract: boolean };

export type GetRegisteredContractsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegisteredContractsQuery = { __typename?: 'Query', registeredContracts: Array<{ __typename?: 'RegisteredContract', address: string, name: string, events: Array<string>, isVerified: boolean, registeredAt: string }> };

export type GetRegisteredContractQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetRegisteredContractQuery = { __typename?: 'Query', registeredContract?: { __typename?: 'RegisteredContract', address: string, name: string, abi: string, events: Array<string>, isVerified: boolean, registeredAt: string } | null };

export type DynamicContractEventsSubscriptionVariables = Exact<{
  filter?: InputMaybe<DynamicContractSubscriptionFilter>;
}>;


export type DynamicContractEventsSubscription = { __typename?: 'Subscription', dynamicContractEvents: { __typename?: 'DynamicContractEvent', contract: string, contractName: string, eventName: string, blockNumber: string, txHash: string, logIndex: number, data: string, timestamp: string } };

export type OnNewBlockSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnNewBlockSubscription = { __typename?: 'Subscription', newBlock: { __typename?: 'Block', number: string, hash: string, parentHash: string, timestamp: string, miner: string, gasLimit: string, gasUsed: string, difficulty: string, totalDifficulty?: string | null, size: string, transactionCount: number, baseFeePerGas?: string | null, withdrawalsRoot?: string | null, blobGasUsed?: string | null, excessBlobGas?: string | null } };

export type OnNewTransactionSubscriptionVariables = Exact<{
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnNewTransactionSubscription = { __typename?: 'Subscription', newTransaction: { __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, nonce: string, gas: string, gasPrice?: string | null, input: string, type: number, blockNumber: string, blockHash: string, transactionIndex: number, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, feePayer?: string | null } };

export type OnNewPendingTransactionsSubscriptionVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnNewPendingTransactionsSubscription = { __typename?: 'Subscription', newPendingTransactions: { __typename?: 'Transaction', hash: string, from: string, to?: string | null, value: string, nonce: string, gas: string, gasPrice?: string | null, input: string, type: number, maxFeePerGas?: string | null, maxPriorityFeePerGas?: string | null, feePayer?: string | null } };

export type OnLogsSubscriptionVariables = Exact<{
  filter: LogFilter;
  replayLast?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OnLogsSubscription = { __typename?: 'Subscription', logs: { __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, transactionHash: string, transactionIndex: number, logIndex: number, removed: boolean } };

export type OnLogsByAddressSubscriptionVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type OnLogsByAddressSubscription = { __typename?: 'Subscription', logs: { __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, transactionHash: string, transactionIndex: number, logIndex: number, removed: boolean } };

export type OnLogsByTopicsSubscriptionVariables = Exact<{
  topics?: InputMaybe<Array<Scalars['Hash']['input']> | Scalars['Hash']['input']>;
}>;


export type OnLogsByTopicsSubscription = { __typename?: 'Subscription', logs: { __typename?: 'Log', address: string, topics: Array<string>, data: string, blockNumber: string, transactionHash: string, transactionIndex: number, logIndex: number, removed: boolean } };

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

export type GetMinterHistoryLocalQueryVariables = Exact<{
  minter: Scalars['Address']['input'];
}>;


export type GetMinterHistoryLocalQuery = { __typename?: 'Query', minterHistory: Array<{ __typename?: 'MinterConfigEvent', blockNumber: string, transactionHash: string, minter: string, allowance: string, action: string, timestamp: string }> };

export type GetGasTipHistoryLocalQueryVariables = Exact<{
  fromBlock: Scalars['BigInt']['input'];
  toBlock: Scalars['BigInt']['input'];
}>;


export type GetGasTipHistoryLocalQuery = { __typename?: 'Query', gasTipHistory: Array<{ __typename?: 'GasTipUpdateEvent', blockNumber: string, transactionHash: string, oldTip: string, newTip: string, updater: string, timestamp: string }> };

export type GetValidatorHistoryLocalQueryVariables = Exact<{
  validator: Scalars['Address']['input'];
}>;


export type GetValidatorHistoryLocalQuery = { __typename?: 'Query', validatorHistory: Array<{ __typename?: 'ValidatorChangeEvent', blockNumber: string, transactionHash: string, validator: string, action: string, oldValidator?: string | null, timestamp: string }> };

export type GetEmergencyPauseHistoryLocalQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
}>;


export type GetEmergencyPauseHistoryLocalQuery = { __typename?: 'Query', emergencyPauseHistory: Array<{ __typename?: 'EmergencyPauseEvent', contract: string, blockNumber: string, transactionHash: string, proposalId?: string | null, action: string, timestamp: string }> };

export type GetBurnHistoryLocalQueryVariables = Exact<{
  filter: SystemContractEventFilter;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetBurnHistoryLocalQuery = { __typename?: 'Query', burnEvents: { __typename?: 'BurnEventConnection', totalCount: number, nodes: Array<{ __typename?: 'BurnEvent', blockNumber: string, transactionHash: string, burner: string, amount: string, withdrawalId?: string | null, timestamp: string }> } };

export type GetBlacklistHistoryLocalQueryVariables = Exact<{
  address: Scalars['Address']['input'];
}>;


export type GetBlacklistHistoryLocalQuery = { __typename?: 'Query', blacklistHistory: Array<{ __typename?: 'BlacklistEvent', blockNumber: string, transactionHash: string, account: string, action: string, proposalId?: string | null, timestamp: string }> };

export type GetProposalsLocalQueryVariables = Exact<{
  filter: ProposalFilter;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetProposalsLocalQuery = { __typename?: 'Query', proposals: { __typename?: 'ProposalConnection', totalCount: number, nodes: Array<{ __typename?: 'Proposal', proposalId: string, contract: string, proposer: string, actionType: string, callData: string, memberVersion: string, requiredApprovals: number, approved: number, rejected: number, status: ProposalStatus, createdAt: string, executedAt?: string | null, blockNumber: string, transactionHash: string }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetProposalVotesLocalQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
  proposalId: Scalars['BigInt']['input'];
}>;


export type GetProposalVotesLocalQuery = { __typename?: 'Query', proposalVotes: Array<{ __typename?: 'ProposalVote', contract: string, proposalId: string, voter: string, approval: boolean, blockNumber: string, transactionHash: string, timestamp: string }> };

export type GetMemberHistoryLocalQueryVariables = Exact<{
  contract: Scalars['Address']['input'];
}>;


export type GetMemberHistoryLocalQuery = { __typename?: 'Query', memberHistory: Array<{ __typename?: 'MemberChangeEvent', contract: string, blockNumber: string, transactionHash: string, member: string, action: string, oldMember?: string | null, totalMembers: string, newQuorum: number, timestamp: string }> };

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


export const GetTokenInfoDocument = gql`
    query GetTokenInfo($address: String!) {
  logs(filter: {address: $address}, pagination: {limit: 1}) {
    totalCount
  }
}
    `;

/**
 * __useGetTokenInfoQuery__
 *
 * To run a query within a React component, call `useGetTokenInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenInfoQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetTokenInfoQuery(baseOptions: Apollo.QueryHookOptions<GetTokenInfoQuery, GetTokenInfoQueryVariables> & ({ variables: GetTokenInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTokenInfoQuery, GetTokenInfoQueryVariables>(GetTokenInfoDocument, options);
      }
export function useGetTokenInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTokenInfoQuery, GetTokenInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTokenInfoQuery, GetTokenInfoQueryVariables>(GetTokenInfoDocument, options);
        }
export function useGetTokenInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTokenInfoQuery, GetTokenInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTokenInfoQuery, GetTokenInfoQueryVariables>(GetTokenInfoDocument, options);
        }
export type GetTokenInfoQueryHookResult = ReturnType<typeof useGetTokenInfoQuery>;
export type GetTokenInfoLazyQueryHookResult = ReturnType<typeof useGetTokenInfoLazyQuery>;
export type GetTokenInfoSuspenseQueryHookResult = ReturnType<typeof useGetTokenInfoSuspenseQuery>;
export type GetTokenInfoQueryResult = Apollo.QueryResult<GetTokenInfoQuery, GetTokenInfoQueryVariables>;
export const GetTokenLogsRelayDocument = gql`
    query GetTokenLogsRelay($address: String!, $limit: Int, $offset: Int) {
  logs(
    filter: {address: $address, topics: [""]}
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      transactionHash
      blockNumber
      topics
      data
    }
    totalCount
  }
}
    `;

/**
 * __useGetTokenLogsRelayQuery__
 *
 * To run a query within a React component, call `useGetTokenLogsRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenLogsRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenLogsRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetTokenLogsRelayQuery(baseOptions: Apollo.QueryHookOptions<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables> & ({ variables: GetTokenLogsRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>(GetTokenLogsRelayDocument, options);
      }
export function useGetTokenLogsRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>(GetTokenLogsRelayDocument, options);
        }
export function useGetTokenLogsRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>(GetTokenLogsRelayDocument, options);
        }
export type GetTokenLogsRelayQueryHookResult = ReturnType<typeof useGetTokenLogsRelayQuery>;
export type GetTokenLogsRelayLazyQueryHookResult = ReturnType<typeof useGetTokenLogsRelayLazyQuery>;
export type GetTokenLogsRelaySuspenseQueryHookResult = ReturnType<typeof useGetTokenLogsRelaySuspenseQuery>;
export type GetTokenLogsRelayQueryResult = Apollo.QueryResult<GetTokenLogsRelayQuery, GetTokenLogsRelayQueryVariables>;
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
    query GetBlock($number: String!) {
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
    query GetBlockByHash($hash: String!) {
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
    query GetTransaction($hash: String!) {
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
        decoded {
          eventName
          eventSignature
          params {
            name
            type
            value
            indexed
          }
        }
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
    query GetTransactionsByAddress($address: String!, $limit: Int, $offset: Int) {
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
    query GetAddressBalance($address: String!, $blockNumber: String) {
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
export const GetAddressOverviewDocument = gql`
    query GetAddressOverview($address: String!) {
  addressOverview(address: $address) {
    address
    isContract
    balance
    transactionCount
    sentCount
    receivedCount
    internalTxCount
    erc20TokenCount
    erc721TokenCount
    firstSeen
    lastSeen
  }
}
    `;

/**
 * __useGetAddressOverviewQuery__
 *
 * To run a query within a React component, call `useGetAddressOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressOverviewQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetAddressOverviewQuery(baseOptions: Apollo.QueryHookOptions<GetAddressOverviewQuery, GetAddressOverviewQueryVariables> & ({ variables: GetAddressOverviewQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>(GetAddressOverviewDocument, options);
      }
export function useGetAddressOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>(GetAddressOverviewDocument, options);
        }
export function useGetAddressOverviewSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>(GetAddressOverviewDocument, options);
        }
export type GetAddressOverviewQueryHookResult = ReturnType<typeof useGetAddressOverviewQuery>;
export type GetAddressOverviewLazyQueryHookResult = ReturnType<typeof useGetAddressOverviewLazyQuery>;
export type GetAddressOverviewSuspenseQueryHookResult = ReturnType<typeof useGetAddressOverviewSuspenseQuery>;
export type GetAddressOverviewQueryResult = Apollo.QueryResult<GetAddressOverviewQuery, GetAddressOverviewQueryVariables>;
export const GetLiveBalanceDocument = gql`
    query GetLiveBalance($address: String!, $blockNumber: String) {
  liveBalance(address: $address, blockNumber: $blockNumber) {
    address
    balance
    blockNumber
  }
}
    `;

/**
 * __useGetLiveBalanceQuery__
 *
 * To run a query within a React component, call `useGetLiveBalanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiveBalanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiveBalanceQuery({
 *   variables: {
 *      address: // value for 'address'
 *      blockNumber: // value for 'blockNumber'
 *   },
 * });
 */
export function useGetLiveBalanceQuery(baseOptions: Apollo.QueryHookOptions<GetLiveBalanceQuery, GetLiveBalanceQueryVariables> & ({ variables: GetLiveBalanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>(GetLiveBalanceDocument, options);
      }
export function useGetLiveBalanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>(GetLiveBalanceDocument, options);
        }
export function useGetLiveBalanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>(GetLiveBalanceDocument, options);
        }
export type GetLiveBalanceQueryHookResult = ReturnType<typeof useGetLiveBalanceQuery>;
export type GetLiveBalanceLazyQueryHookResult = ReturnType<typeof useGetLiveBalanceLazyQuery>;
export type GetLiveBalanceSuspenseQueryHookResult = ReturnType<typeof useGetLiveBalanceSuspenseQuery>;
export type GetLiveBalanceQueryResult = Apollo.QueryResult<GetLiveBalanceQuery, GetLiveBalanceQueryVariables>;
export const GetBalanceHistoryDocument = gql`
    query GetBalanceHistory($address: String!, $fromBlock: String!, $toBlock: String!, $limit: Int, $offset: Int) {
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
export const GetBlockCountDocument = gql`
    query GetBlockCount {
  blockCount
}
    `;

/**
 * __useGetBlockCountQuery__
 *
 * To run a query within a React component, call `useGetBlockCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBlockCountQuery(baseOptions?: Apollo.QueryHookOptions<GetBlockCountQuery, GetBlockCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockCountQuery, GetBlockCountQueryVariables>(GetBlockCountDocument, options);
      }
export function useGetBlockCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockCountQuery, GetBlockCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockCountQuery, GetBlockCountQueryVariables>(GetBlockCountDocument, options);
        }
export function useGetBlockCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockCountQuery, GetBlockCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockCountQuery, GetBlockCountQueryVariables>(GetBlockCountDocument, options);
        }
export type GetBlockCountQueryHookResult = ReturnType<typeof useGetBlockCountQuery>;
export type GetBlockCountLazyQueryHookResult = ReturnType<typeof useGetBlockCountLazyQuery>;
export type GetBlockCountSuspenseQueryHookResult = ReturnType<typeof useGetBlockCountSuspenseQuery>;
export type GetBlockCountQueryResult = Apollo.QueryResult<GetBlockCountQuery, GetBlockCountQueryVariables>;
export const GetTransactionCountDocument = gql`
    query GetTransactionCount {
  transactionCount
}
    `;

/**
 * __useGetTransactionCountQuery__
 *
 * To run a query within a React component, call `useGetTransactionCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTransactionCountQuery(baseOptions?: Apollo.QueryHookOptions<GetTransactionCountQuery, GetTransactionCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionCountQuery, GetTransactionCountQueryVariables>(GetTransactionCountDocument, options);
      }
export function useGetTransactionCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionCountQuery, GetTransactionCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionCountQuery, GetTransactionCountQueryVariables>(GetTransactionCountDocument, options);
        }
export function useGetTransactionCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionCountQuery, GetTransactionCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionCountQuery, GetTransactionCountQueryVariables>(GetTransactionCountDocument, options);
        }
export type GetTransactionCountQueryHookResult = ReturnType<typeof useGetTransactionCountQuery>;
export type GetTransactionCountLazyQueryHookResult = ReturnType<typeof useGetTransactionCountLazyQuery>;
export type GetTransactionCountSuspenseQueryHookResult = ReturnType<typeof useGetTransactionCountSuspenseQuery>;
export type GetTransactionCountQueryResult = Apollo.QueryResult<GetTransactionCountQuery, GetTransactionCountQueryVariables>;
export const GetReceiptDocument = gql`
    query GetReceipt($txHash: String!) {
  receipt(transactionHash: $txHash) {
    transactionHash
    blockNumber
    blockHash
    transactionIndex
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
      blockNumber
      transactionHash
      decoded {
        eventName
        eventSignature
        params {
          name
          type
          value
          indexed
        }
      }
    }
    logsBloom
  }
}
    `;

/**
 * __useGetReceiptQuery__
 *
 * To run a query within a React component, call `useGetReceiptQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReceiptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReceiptQuery({
 *   variables: {
 *      txHash: // value for 'txHash'
 *   },
 * });
 */
export function useGetReceiptQuery(baseOptions: Apollo.QueryHookOptions<GetReceiptQuery, GetReceiptQueryVariables> & ({ variables: GetReceiptQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReceiptQuery, GetReceiptQueryVariables>(GetReceiptDocument, options);
      }
export function useGetReceiptLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReceiptQuery, GetReceiptQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReceiptQuery, GetReceiptQueryVariables>(GetReceiptDocument, options);
        }
export function useGetReceiptSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReceiptQuery, GetReceiptQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReceiptQuery, GetReceiptQueryVariables>(GetReceiptDocument, options);
        }
export type GetReceiptQueryHookResult = ReturnType<typeof useGetReceiptQuery>;
export type GetReceiptLazyQueryHookResult = ReturnType<typeof useGetReceiptLazyQuery>;
export type GetReceiptSuspenseQueryHookResult = ReturnType<typeof useGetReceiptSuspenseQuery>;
export type GetReceiptQueryResult = Apollo.QueryResult<GetReceiptQuery, GetReceiptQueryVariables>;
export const GetReceiptsByBlockDocument = gql`
    query GetReceiptsByBlock($blockNumber: String!) {
  receiptsByBlock(blockNumber: $blockNumber) {
    transactionHash
    blockNumber
    blockHash
    transactionIndex
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
      decoded {
        eventName
        eventSignature
        params {
          name
          type
          value
          indexed
        }
      }
    }
  }
}
    `;

/**
 * __useGetReceiptsByBlockQuery__
 *
 * To run a query within a React component, call `useGetReceiptsByBlockQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReceiptsByBlockQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReceiptsByBlockQuery({
 *   variables: {
 *      blockNumber: // value for 'blockNumber'
 *   },
 * });
 */
export function useGetReceiptsByBlockQuery(baseOptions: Apollo.QueryHookOptions<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables> & ({ variables: GetReceiptsByBlockQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>(GetReceiptsByBlockDocument, options);
      }
export function useGetReceiptsByBlockLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>(GetReceiptsByBlockDocument, options);
        }
export function useGetReceiptsByBlockSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>(GetReceiptsByBlockDocument, options);
        }
export type GetReceiptsByBlockQueryHookResult = ReturnType<typeof useGetReceiptsByBlockQuery>;
export type GetReceiptsByBlockLazyQueryHookResult = ReturnType<typeof useGetReceiptsByBlockLazyQuery>;
export type GetReceiptsByBlockSuspenseQueryHookResult = ReturnType<typeof useGetReceiptsByBlockSuspenseQuery>;
export type GetReceiptsByBlockQueryResult = Apollo.QueryResult<GetReceiptsByBlockQuery, GetReceiptsByBlockQueryVariables>;
export const NewBlockDocument = gql`
    subscription NewBlock($replayLast: Int) {
  newBlock(replayLast: $replayLast) {
    number
    hash
    parentHash
    timestamp
    miner
    transactionCount
  }
}
    `;

/**
 * __useNewBlockSubscription__
 *
 * To run a query within a React component, call `useNewBlockSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewBlockSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewBlockSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useNewBlockSubscription(baseOptions?: Apollo.SubscriptionHookOptions<NewBlockSubscription, NewBlockSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NewBlockSubscription, NewBlockSubscriptionVariables>(NewBlockDocument, options);
      }
export type NewBlockSubscriptionHookResult = ReturnType<typeof useNewBlockSubscription>;
export type NewBlockSubscriptionResult = Apollo.SubscriptionResult<NewBlockSubscription>;
export const NewTransactionDocument = gql`
    subscription NewTransaction($replayLast: Int) {
  newTransaction(replayLast: $replayLast) {
    hash
    from
    to
    value
    nonce
    gas
    type
    gasPrice
    maxFeePerGas
    maxPriorityFeePerGas
    blockNumber
    blockHash
    transactionIndex
    feePayer
  }
}
    `;

/**
 * __useNewTransactionSubscription__
 *
 * To run a query within a React component, call `useNewTransactionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewTransactionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewTransactionSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useNewTransactionSubscription(baseOptions?: Apollo.SubscriptionHookOptions<NewTransactionSubscription, NewTransactionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NewTransactionSubscription, NewTransactionSubscriptionVariables>(NewTransactionDocument, options);
      }
export type NewTransactionSubscriptionHookResult = ReturnType<typeof useNewTransactionSubscription>;
export type NewTransactionSubscriptionResult = Apollo.SubscriptionResult<NewTransactionSubscription>;
export const NewPendingTransactionsDocument = gql`
    subscription NewPendingTransactions($limit: Int) {
  newPendingTransactions(limit: $limit) {
    hash
    from
    to
    value
    nonce
    gas
    type
    gasPrice
    maxFeePerGas
    maxPriorityFeePerGas
    feePayer
  }
}
    `;

/**
 * __useNewPendingTransactionsSubscription__
 *
 * To run a query within a React component, call `useNewPendingTransactionsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewPendingTransactionsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewPendingTransactionsSubscription({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useNewPendingTransactionsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<NewPendingTransactionsSubscription, NewPendingTransactionsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NewPendingTransactionsSubscription, NewPendingTransactionsSubscriptionVariables>(NewPendingTransactionsDocument, options);
      }
export type NewPendingTransactionsSubscriptionHookResult = ReturnType<typeof useNewPendingTransactionsSubscription>;
export type NewPendingTransactionsSubscriptionResult = Apollo.SubscriptionResult<NewPendingTransactionsSubscription>;
export const LogsDocument = gql`
    subscription Logs($filter: LogFilter!, $replayLast: Int) {
  logs(filter: $filter, replayLast: $replayLast) {
    address
    topics
    data
    blockNumber
    blockHash
    transactionHash
    transactionIndex
    logIndex
    removed
  }
}
    `;

/**
 * __useLogsSubscription__
 *
 * To run a query within a React component, call `useLogsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLogsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLogsSubscription({
 *   variables: {
 *      filter: // value for 'filter'
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useLogsSubscription(baseOptions: Apollo.SubscriptionHookOptions<LogsSubscription, LogsSubscriptionVariables> & ({ variables: LogsSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<LogsSubscription, LogsSubscriptionVariables>(LogsDocument, options);
      }
export type LogsSubscriptionHookResult = ReturnType<typeof useLogsSubscription>;
export type LogsSubscriptionResult = Apollo.SubscriptionResult<LogsSubscription>;
export const ChainConfigDocument = gql`
    subscription ChainConfig($replayLast: Int) {
  chainConfig(replayLast: $replayLast) {
    blockNumber
    blockHash
    parameter
    oldValue
    newValue
  }
}
    `;

/**
 * __useChainConfigSubscription__
 *
 * To run a query within a React component, call `useChainConfigSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChainConfigSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChainConfigSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useChainConfigSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ChainConfigSubscription, ChainConfigSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChainConfigSubscription, ChainConfigSubscriptionVariables>(ChainConfigDocument, options);
      }
export type ChainConfigSubscriptionHookResult = ReturnType<typeof useChainConfigSubscription>;
export type ChainConfigSubscriptionResult = Apollo.SubscriptionResult<ChainConfigSubscription>;
export const ValidatorSetDocument = gql`
    subscription ValidatorSet($replayLast: Int) {
  validatorSet(replayLast: $replayLast) {
    blockNumber
    blockHash
    changeType
    validator
    validatorSetSize
    validatorInfo
  }
}
    `;

/**
 * __useValidatorSetSubscription__
 *
 * To run a query within a React component, call `useValidatorSetSubscription` and pass it any options that fit your needs.
 * When your component renders, `useValidatorSetSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatorSetSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useValidatorSetSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ValidatorSetSubscription, ValidatorSetSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ValidatorSetSubscription, ValidatorSetSubscriptionVariables>(ValidatorSetDocument, options);
      }
export type ValidatorSetSubscriptionHookResult = ReturnType<typeof useValidatorSetSubscription>;
export type ValidatorSetSubscriptionResult = Apollo.SubscriptionResult<ValidatorSetSubscription>;
export const GetTokenBalancesDocument = gql`
    query GetTokenBalances($address: String!, $tokenType: String) {
  tokenBalances(address: $address, tokenType: $tokenType) {
    address
    tokenType
    balance
    tokenId
    name
    symbol
    decimals
    metadata
  }
}
    `;

/**
 * __useGetTokenBalancesQuery__
 *
 * To run a query within a React component, call `useGetTokenBalancesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenBalancesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenBalancesQuery({
 *   variables: {
 *      address: // value for 'address'
 *      tokenType: // value for 'tokenType'
 *   },
 * });
 */
export function useGetTokenBalancesQuery(baseOptions: Apollo.QueryHookOptions<GetTokenBalancesQuery, GetTokenBalancesQueryVariables> & ({ variables: GetTokenBalancesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>(GetTokenBalancesDocument, options);
      }
export function useGetTokenBalancesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>(GetTokenBalancesDocument, options);
        }
export function useGetTokenBalancesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>(GetTokenBalancesDocument, options);
        }
export type GetTokenBalancesQueryHookResult = ReturnType<typeof useGetTokenBalancesQuery>;
export type GetTokenBalancesLazyQueryHookResult = ReturnType<typeof useGetTokenBalancesLazyQuery>;
export type GetTokenBalancesSuspenseQueryHookResult = ReturnType<typeof useGetTokenBalancesSuspenseQuery>;
export type GetTokenBalancesQueryResult = Apollo.QueryResult<GetTokenBalancesQuery, GetTokenBalancesQueryVariables>;
export const OnConsensusBlockDocument = gql`
    subscription OnConsensusBlock($replayLast: Int) {
  consensusBlock(replayLast: $replayLast) {
    blockNumber
    blockHash
    timestamp
    round
    prevRound
    roundChanged
    proposer
    validatorCount
    prepareCount
    commitCount
    participationRate
    missedValidatorRate
    isEpochBoundary
    epochNumber
    epochValidators
  }
}
    `;

/**
 * __useOnConsensusBlockSubscription__
 *
 * To run a query within a React component, call `useOnConsensusBlockSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnConsensusBlockSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnConsensusBlockSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnConsensusBlockSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnConsensusBlockSubscription, OnConsensusBlockSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnConsensusBlockSubscription, OnConsensusBlockSubscriptionVariables>(OnConsensusBlockDocument, options);
      }
export type OnConsensusBlockSubscriptionHookResult = ReturnType<typeof useOnConsensusBlockSubscription>;
export type OnConsensusBlockSubscriptionResult = Apollo.SubscriptionResult<OnConsensusBlockSubscription>;
export const OnConsensusForkDocument = gql`
    subscription OnConsensusFork($replayLast: Int) {
  consensusFork(replayLast: $replayLast) {
    forkBlockNumber
    forkBlockHash
    chain1Hash
    chain1Height
    chain1Weight
    chain2Hash
    chain2Height
    chain2Weight
    resolved
    winningChain
    detectedAt
    detectionLag
  }
}
    `;

/**
 * __useOnConsensusForkSubscription__
 *
 * To run a query within a React component, call `useOnConsensusForkSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnConsensusForkSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnConsensusForkSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnConsensusForkSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnConsensusForkSubscription, OnConsensusForkSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnConsensusForkSubscription, OnConsensusForkSubscriptionVariables>(OnConsensusForkDocument, options);
      }
export type OnConsensusForkSubscriptionHookResult = ReturnType<typeof useOnConsensusForkSubscription>;
export type OnConsensusForkSubscriptionResult = Apollo.SubscriptionResult<OnConsensusForkSubscription>;
export const OnValidatorChangeDocument = gql`
    subscription OnValidatorChange($replayLast: Int) {
  consensusValidatorChange(replayLast: $replayLast) {
    blockNumber
    blockHash
    timestamp
    epochNumber
    isEpochBoundary
    changeType
    previousValidatorCount
    newValidatorCount
    addedValidators
    removedValidators
    validatorSet
    additionalInfo
  }
}
    `;

/**
 * __useOnValidatorChangeSubscription__
 *
 * To run a query within a React component, call `useOnValidatorChangeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnValidatorChangeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnValidatorChangeSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnValidatorChangeSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnValidatorChangeSubscription, OnValidatorChangeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnValidatorChangeSubscription, OnValidatorChangeSubscriptionVariables>(OnValidatorChangeDocument, options);
      }
export type OnValidatorChangeSubscriptionHookResult = ReturnType<typeof useOnValidatorChangeSubscription>;
export type OnValidatorChangeSubscriptionResult = Apollo.SubscriptionResult<OnValidatorChangeSubscription>;
export const OnConsensusErrorDocument = gql`
    subscription OnConsensusError($replayLast: Int) {
  consensusError(replayLast: $replayLast) {
    blockNumber
    blockHash
    timestamp
    errorType
    severity
    errorMessage
    round
    expectedValidators
    actualSigners
    participationRate
    missedValidators
    consensusImpacted
    recoveryTime
    errorDetails
  }
}
    `;

/**
 * __useOnConsensusErrorSubscription__
 *
 * To run a query within a React component, call `useOnConsensusErrorSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnConsensusErrorSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnConsensusErrorSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnConsensusErrorSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnConsensusErrorSubscription, OnConsensusErrorSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnConsensusErrorSubscription, OnConsensusErrorSubscriptionVariables>(OnConsensusErrorDocument, options);
      }
export type OnConsensusErrorSubscriptionHookResult = ReturnType<typeof useOnConsensusErrorSubscription>;
export type OnConsensusErrorSubscriptionResult = Apollo.SubscriptionResult<OnConsensusErrorSubscription>;
export const GetFeeDelegationStatsDocument = gql`
    query GetFeeDelegationStats($fromBlock: String, $toBlock: String) {
  feeDelegationStats(fromBlock: $fromBlock, toBlock: $toBlock) {
    totalFeeDelegatedTxs
    totalFeesSaved
    adoptionRate
    avgFeeSaved
  }
}
    `;

/**
 * __useGetFeeDelegationStatsQuery__
 *
 * To run a query within a React component, call `useGetFeeDelegationStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeeDelegationStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeeDelegationStatsQuery({
 *   variables: {
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetFeeDelegationStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>(GetFeeDelegationStatsDocument, options);
      }
export function useGetFeeDelegationStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>(GetFeeDelegationStatsDocument, options);
        }
export function useGetFeeDelegationStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>(GetFeeDelegationStatsDocument, options);
        }
export type GetFeeDelegationStatsQueryHookResult = ReturnType<typeof useGetFeeDelegationStatsQuery>;
export type GetFeeDelegationStatsLazyQueryHookResult = ReturnType<typeof useGetFeeDelegationStatsLazyQuery>;
export type GetFeeDelegationStatsSuspenseQueryHookResult = ReturnType<typeof useGetFeeDelegationStatsSuspenseQuery>;
export type GetFeeDelegationStatsQueryResult = Apollo.QueryResult<GetFeeDelegationStatsQuery, GetFeeDelegationStatsQueryVariables>;
export const GetTopFeePayersDocument = gql`
    query GetTopFeePayers($limit: Int, $fromBlock: String, $toBlock: String) {
  topFeePayers(limit: $limit, fromBlock: $fromBlock, toBlock: $toBlock) {
    nodes {
      address
      txCount
      totalFeesPaid
      percentage
    }
    totalCount
  }
}
    `;

/**
 * __useGetTopFeePayersQuery__
 *
 * To run a query within a React component, call `useGetTopFeePayersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopFeePayersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopFeePayersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetTopFeePayersQuery(baseOptions?: Apollo.QueryHookOptions<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>(GetTopFeePayersDocument, options);
      }
export function useGetTopFeePayersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>(GetTopFeePayersDocument, options);
        }
export function useGetTopFeePayersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>(GetTopFeePayersDocument, options);
        }
export type GetTopFeePayersQueryHookResult = ReturnType<typeof useGetTopFeePayersQuery>;
export type GetTopFeePayersLazyQueryHookResult = ReturnType<typeof useGetTopFeePayersLazyQuery>;
export type GetTopFeePayersSuspenseQueryHookResult = ReturnType<typeof useGetTopFeePayersSuspenseQuery>;
export type GetTopFeePayersQueryResult = Apollo.QueryResult<GetTopFeePayersQuery, GetTopFeePayersQueryVariables>;
export const GetFeePayerStatsDocument = gql`
    query GetFeePayerStats($address: String!, $fromBlock: String, $toBlock: String) {
  feePayerStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) {
    address
    txCount
    totalFeesPaid
    percentage
  }
}
    `;

/**
 * __useGetFeePayerStatsQuery__
 *
 * To run a query within a React component, call `useGetFeePayerStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeePayerStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeePayerStatsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetFeePayerStatsQuery(baseOptions: Apollo.QueryHookOptions<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables> & ({ variables: GetFeePayerStatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>(GetFeePayerStatsDocument, options);
      }
export function useGetFeePayerStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>(GetFeePayerStatsDocument, options);
        }
export function useGetFeePayerStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>(GetFeePayerStatsDocument, options);
        }
export type GetFeePayerStatsQueryHookResult = ReturnType<typeof useGetFeePayerStatsQuery>;
export type GetFeePayerStatsLazyQueryHookResult = ReturnType<typeof useGetFeePayerStatsLazyQuery>;
export type GetFeePayerStatsSuspenseQueryHookResult = ReturnType<typeof useGetFeePayerStatsSuspenseQuery>;
export type GetFeePayerStatsQueryResult = Apollo.QueryResult<GetFeePayerStatsQuery, GetFeePayerStatsQueryVariables>;
export const GetSetCodeTransactionsDocument = gql`
    query GetSetCodeTransactions($address: String!, $limit: Int, $offset: Int) {
  transactionsByAddress(
    address: $address
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      hash
      blockNumber
      from
      to
      type
    }
    totalCount
  }
}
    `;

/**
 * __useGetSetCodeTransactionsQuery__
 *
 * To run a query within a React component, call `useGetSetCodeTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSetCodeTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSetCodeTransactionsQuery({
 *   variables: {
 *      address: // value for 'address'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetSetCodeTransactionsQuery(baseOptions: Apollo.QueryHookOptions<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables> & ({ variables: GetSetCodeTransactionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>(GetSetCodeTransactionsDocument, options);
      }
export function useGetSetCodeTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>(GetSetCodeTransactionsDocument, options);
        }
export function useGetSetCodeTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>(GetSetCodeTransactionsDocument, options);
        }
export type GetSetCodeTransactionsQueryHookResult = ReturnType<typeof useGetSetCodeTransactionsQuery>;
export type GetSetCodeTransactionsLazyQueryHookResult = ReturnType<typeof useGetSetCodeTransactionsLazyQuery>;
export type GetSetCodeTransactionsSuspenseQueryHookResult = ReturnType<typeof useGetSetCodeTransactionsSuspenseQuery>;
export type GetSetCodeTransactionsQueryResult = Apollo.QueryResult<GetSetCodeTransactionsQuery, GetSetCodeTransactionsQueryVariables>;
export const GetContractCreationDocument = gql`
    query GetContractCreation($address: String!) {
  contractCreation(address: $address) {
    contractAddress
    name
    creator
    transactionHash
    blockNumber
    timestamp
    bytecodeSize
  }
}
    `;

/**
 * __useGetContractCreationQuery__
 *
 * To run a query within a React component, call `useGetContractCreationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractCreationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractCreationQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetContractCreationQuery(baseOptions: Apollo.QueryHookOptions<GetContractCreationQuery, GetContractCreationQueryVariables> & ({ variables: GetContractCreationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractCreationQuery, GetContractCreationQueryVariables>(GetContractCreationDocument, options);
      }
export function useGetContractCreationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractCreationQuery, GetContractCreationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractCreationQuery, GetContractCreationQueryVariables>(GetContractCreationDocument, options);
        }
export function useGetContractCreationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractCreationQuery, GetContractCreationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractCreationQuery, GetContractCreationQueryVariables>(GetContractCreationDocument, options);
        }
export type GetContractCreationQueryHookResult = ReturnType<typeof useGetContractCreationQuery>;
export type GetContractCreationLazyQueryHookResult = ReturnType<typeof useGetContractCreationLazyQuery>;
export type GetContractCreationSuspenseQueryHookResult = ReturnType<typeof useGetContractCreationSuspenseQuery>;
export type GetContractCreationQueryResult = Apollo.QueryResult<GetContractCreationQuery, GetContractCreationQueryVariables>;
export const GetContractsByCreatorDocument = gql`
    query GetContractsByCreator($creator: String!, $pagination: PaginationInput) {
  contractsByCreator(creator: $creator, pagination: $pagination) {
    nodes {
      contractAddress
      name
      creator
      transactionHash
      blockNumber
      timestamp
      bytecodeSize
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
 * __useGetContractsByCreatorQuery__
 *
 * To run a query within a React component, call `useGetContractsByCreatorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractsByCreatorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractsByCreatorQuery({
 *   variables: {
 *      creator: // value for 'creator'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetContractsByCreatorQuery(baseOptions: Apollo.QueryHookOptions<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables> & ({ variables: GetContractsByCreatorQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>(GetContractsByCreatorDocument, options);
      }
export function useGetContractsByCreatorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>(GetContractsByCreatorDocument, options);
        }
export function useGetContractsByCreatorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>(GetContractsByCreatorDocument, options);
        }
export type GetContractsByCreatorQueryHookResult = ReturnType<typeof useGetContractsByCreatorQuery>;
export type GetContractsByCreatorLazyQueryHookResult = ReturnType<typeof useGetContractsByCreatorLazyQuery>;
export type GetContractsByCreatorSuspenseQueryHookResult = ReturnType<typeof useGetContractsByCreatorSuspenseQuery>;
export type GetContractsByCreatorQueryResult = Apollo.QueryResult<GetContractsByCreatorQuery, GetContractsByCreatorQueryVariables>;
export const GetContractsDocument = gql`
    query GetContracts($pagination: PaginationInput) {
  contracts(pagination: $pagination) {
    nodes {
      contractAddress
      name
      creator
      transactionHash
      blockNumber
      timestamp
      bytecodeSize
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
 * __useGetContractsQuery__
 *
 * To run a query within a React component, call `useGetContractsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetContractsQuery(baseOptions?: Apollo.QueryHookOptions<GetContractsQuery, GetContractsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractsQuery, GetContractsQueryVariables>(GetContractsDocument, options);
      }
export function useGetContractsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractsQuery, GetContractsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractsQuery, GetContractsQueryVariables>(GetContractsDocument, options);
        }
export function useGetContractsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractsQuery, GetContractsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractsQuery, GetContractsQueryVariables>(GetContractsDocument, options);
        }
export type GetContractsQueryHookResult = ReturnType<typeof useGetContractsQuery>;
export type GetContractsLazyQueryHookResult = ReturnType<typeof useGetContractsLazyQuery>;
export type GetContractsSuspenseQueryHookResult = ReturnType<typeof useGetContractsSuspenseQuery>;
export type GetContractsQueryResult = Apollo.QueryResult<GetContractsQuery, GetContractsQueryVariables>;
export const GetInternalTransactionsByAddressDocument = gql`
    query GetInternalTransactionsByAddress($address: String!, $isFrom: Boolean!, $pagination: PaginationInput) {
  internalTransactionsByAddress(
    address: $address
    isFrom: $isFrom
    pagination: $pagination
  ) {
    nodes {
      transactionHash
      type
      from
      to
      value
      input
      output
      error
      blockNumber
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
 * __useGetInternalTransactionsByAddressQuery__
 *
 * To run a query within a React component, call `useGetInternalTransactionsByAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInternalTransactionsByAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInternalTransactionsByAddressQuery({
 *   variables: {
 *      address: // value for 'address'
 *      isFrom: // value for 'isFrom'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetInternalTransactionsByAddressQuery(baseOptions: Apollo.QueryHookOptions<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables> & ({ variables: GetInternalTransactionsByAddressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>(GetInternalTransactionsByAddressDocument, options);
      }
export function useGetInternalTransactionsByAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>(GetInternalTransactionsByAddressDocument, options);
        }
export function useGetInternalTransactionsByAddressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>(GetInternalTransactionsByAddressDocument, options);
        }
export type GetInternalTransactionsByAddressQueryHookResult = ReturnType<typeof useGetInternalTransactionsByAddressQuery>;
export type GetInternalTransactionsByAddressLazyQueryHookResult = ReturnType<typeof useGetInternalTransactionsByAddressLazyQuery>;
export type GetInternalTransactionsByAddressSuspenseQueryHookResult = ReturnType<typeof useGetInternalTransactionsByAddressSuspenseQuery>;
export type GetInternalTransactionsByAddressQueryResult = Apollo.QueryResult<GetInternalTransactionsByAddressQuery, GetInternalTransactionsByAddressQueryVariables>;
export const GetErc20TransferDocument = gql`
    query GetERC20Transfer($txHash: Hash!, $logIndex: Int!) {
  erc20Transfer(txHash: $txHash, logIndex: $logIndex) {
    transactionHash
    logIndex
    contractAddress
    from
    to
    value
    blockNumber
  }
}
    `;

/**
 * __useGetErc20TransferQuery__
 *
 * To run a query within a React component, call `useGetErc20TransferQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc20TransferQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc20TransferQuery({
 *   variables: {
 *      txHash: // value for 'txHash'
 *      logIndex: // value for 'logIndex'
 *   },
 * });
 */
export function useGetErc20TransferQuery(baseOptions: Apollo.QueryHookOptions<GetErc20TransferQuery, GetErc20TransferQueryVariables> & ({ variables: GetErc20TransferQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc20TransferQuery, GetErc20TransferQueryVariables>(GetErc20TransferDocument, options);
      }
export function useGetErc20TransferLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc20TransferQuery, GetErc20TransferQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc20TransferQuery, GetErc20TransferQueryVariables>(GetErc20TransferDocument, options);
        }
export function useGetErc20TransferSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc20TransferQuery, GetErc20TransferQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc20TransferQuery, GetErc20TransferQueryVariables>(GetErc20TransferDocument, options);
        }
export type GetErc20TransferQueryHookResult = ReturnType<typeof useGetErc20TransferQuery>;
export type GetErc20TransferLazyQueryHookResult = ReturnType<typeof useGetErc20TransferLazyQuery>;
export type GetErc20TransferSuspenseQueryHookResult = ReturnType<typeof useGetErc20TransferSuspenseQuery>;
export type GetErc20TransferQueryResult = Apollo.QueryResult<GetErc20TransferQuery, GetErc20TransferQueryVariables>;
export const GetErc20TransfersByTokenDocument = gql`
    query GetERC20TransfersByToken($token: Address!, $pagination: PaginationInput) {
  erc20TransfersByToken(token: $token, pagination: $pagination) {
    nodes {
      transactionHash
      logIndex
      contractAddress
      from
      to
      value
      blockNumber
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
 * __useGetErc20TransfersByTokenQuery__
 *
 * To run a query within a React component, call `useGetErc20TransfersByTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc20TransfersByTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc20TransfersByTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetErc20TransfersByTokenQuery(baseOptions: Apollo.QueryHookOptions<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables> & ({ variables: GetErc20TransfersByTokenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>(GetErc20TransfersByTokenDocument, options);
      }
export function useGetErc20TransfersByTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>(GetErc20TransfersByTokenDocument, options);
        }
export function useGetErc20TransfersByTokenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>(GetErc20TransfersByTokenDocument, options);
        }
export type GetErc20TransfersByTokenQueryHookResult = ReturnType<typeof useGetErc20TransfersByTokenQuery>;
export type GetErc20TransfersByTokenLazyQueryHookResult = ReturnType<typeof useGetErc20TransfersByTokenLazyQuery>;
export type GetErc20TransfersByTokenSuspenseQueryHookResult = ReturnType<typeof useGetErc20TransfersByTokenSuspenseQuery>;
export type GetErc20TransfersByTokenQueryResult = Apollo.QueryResult<GetErc20TransfersByTokenQuery, GetErc20TransfersByTokenQueryVariables>;
export const GetErc20TransfersByAddressDocument = gql`
    query GetERC20TransfersByAddress($address: String!, $isFrom: Boolean!, $pagination: PaginationInput) {
  erc20TransfersByAddress(
    address: $address
    isFrom: $isFrom
    pagination: $pagination
  ) {
    nodes {
      transactionHash
      logIndex
      contractAddress
      from
      to
      value
      blockNumber
      timestamp
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
 * __useGetErc20TransfersByAddressQuery__
 *
 * To run a query within a React component, call `useGetErc20TransfersByAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc20TransfersByAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc20TransfersByAddressQuery({
 *   variables: {
 *      address: // value for 'address'
 *      isFrom: // value for 'isFrom'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetErc20TransfersByAddressQuery(baseOptions: Apollo.QueryHookOptions<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables> & ({ variables: GetErc20TransfersByAddressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>(GetErc20TransfersByAddressDocument, options);
      }
export function useGetErc20TransfersByAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>(GetErc20TransfersByAddressDocument, options);
        }
export function useGetErc20TransfersByAddressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>(GetErc20TransfersByAddressDocument, options);
        }
export type GetErc20TransfersByAddressQueryHookResult = ReturnType<typeof useGetErc20TransfersByAddressQuery>;
export type GetErc20TransfersByAddressLazyQueryHookResult = ReturnType<typeof useGetErc20TransfersByAddressLazyQuery>;
export type GetErc20TransfersByAddressSuspenseQueryHookResult = ReturnType<typeof useGetErc20TransfersByAddressSuspenseQuery>;
export type GetErc20TransfersByAddressQueryResult = Apollo.QueryResult<GetErc20TransfersByAddressQuery, GetErc20TransfersByAddressQueryVariables>;
export const GetErc721TransferDocument = gql`
    query GetERC721Transfer($txHash: Hash!, $logIndex: Int!) {
  erc721Transfer(txHash: $txHash, logIndex: $logIndex) {
    transactionHash
    logIndex
    contractAddress
    from
    to
    tokenId
    blockNumber
  }
}
    `;

/**
 * __useGetErc721TransferQuery__
 *
 * To run a query within a React component, call `useGetErc721TransferQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc721TransferQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc721TransferQuery({
 *   variables: {
 *      txHash: // value for 'txHash'
 *      logIndex: // value for 'logIndex'
 *   },
 * });
 */
export function useGetErc721TransferQuery(baseOptions: Apollo.QueryHookOptions<GetErc721TransferQuery, GetErc721TransferQueryVariables> & ({ variables: GetErc721TransferQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc721TransferQuery, GetErc721TransferQueryVariables>(GetErc721TransferDocument, options);
      }
export function useGetErc721TransferLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc721TransferQuery, GetErc721TransferQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc721TransferQuery, GetErc721TransferQueryVariables>(GetErc721TransferDocument, options);
        }
export function useGetErc721TransferSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc721TransferQuery, GetErc721TransferQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc721TransferQuery, GetErc721TransferQueryVariables>(GetErc721TransferDocument, options);
        }
export type GetErc721TransferQueryHookResult = ReturnType<typeof useGetErc721TransferQuery>;
export type GetErc721TransferLazyQueryHookResult = ReturnType<typeof useGetErc721TransferLazyQuery>;
export type GetErc721TransferSuspenseQueryHookResult = ReturnType<typeof useGetErc721TransferSuspenseQuery>;
export type GetErc721TransferQueryResult = Apollo.QueryResult<GetErc721TransferQuery, GetErc721TransferQueryVariables>;
export const GetErc721TransfersByTokenDocument = gql`
    query GetERC721TransfersByToken($token: Address!, $pagination: PaginationInput) {
  erc721TransfersByToken(token: $token, pagination: $pagination) {
    nodes {
      transactionHash
      logIndex
      contractAddress
      from
      to
      tokenId
      blockNumber
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
 * __useGetErc721TransfersByTokenQuery__
 *
 * To run a query within a React component, call `useGetErc721TransfersByTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc721TransfersByTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc721TransfersByTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetErc721TransfersByTokenQuery(baseOptions: Apollo.QueryHookOptions<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables> & ({ variables: GetErc721TransfersByTokenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>(GetErc721TransfersByTokenDocument, options);
      }
export function useGetErc721TransfersByTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>(GetErc721TransfersByTokenDocument, options);
        }
export function useGetErc721TransfersByTokenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>(GetErc721TransfersByTokenDocument, options);
        }
export type GetErc721TransfersByTokenQueryHookResult = ReturnType<typeof useGetErc721TransfersByTokenQuery>;
export type GetErc721TransfersByTokenLazyQueryHookResult = ReturnType<typeof useGetErc721TransfersByTokenLazyQuery>;
export type GetErc721TransfersByTokenSuspenseQueryHookResult = ReturnType<typeof useGetErc721TransfersByTokenSuspenseQuery>;
export type GetErc721TransfersByTokenQueryResult = Apollo.QueryResult<GetErc721TransfersByTokenQuery, GetErc721TransfersByTokenQueryVariables>;
export const GetErc721TransfersByAddressDocument = gql`
    query GetERC721TransfersByAddress($address: String!, $isFrom: Boolean!, $pagination: PaginationInput) {
  erc721TransfersByAddress(
    address: $address
    isFrom: $isFrom
    pagination: $pagination
  ) {
    nodes {
      transactionHash
      logIndex
      contractAddress
      from
      to
      tokenId
      blockNumber
      timestamp
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
 * __useGetErc721TransfersByAddressQuery__
 *
 * To run a query within a React component, call `useGetErc721TransfersByAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc721TransfersByAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc721TransfersByAddressQuery({
 *   variables: {
 *      address: // value for 'address'
 *      isFrom: // value for 'isFrom'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetErc721TransfersByAddressQuery(baseOptions: Apollo.QueryHookOptions<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables> & ({ variables: GetErc721TransfersByAddressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>(GetErc721TransfersByAddressDocument, options);
      }
export function useGetErc721TransfersByAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>(GetErc721TransfersByAddressDocument, options);
        }
export function useGetErc721TransfersByAddressSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>(GetErc721TransfersByAddressDocument, options);
        }
export type GetErc721TransfersByAddressQueryHookResult = ReturnType<typeof useGetErc721TransfersByAddressQuery>;
export type GetErc721TransfersByAddressLazyQueryHookResult = ReturnType<typeof useGetErc721TransfersByAddressLazyQuery>;
export type GetErc721TransfersByAddressSuspenseQueryHookResult = ReturnType<typeof useGetErc721TransfersByAddressSuspenseQuery>;
export type GetErc721TransfersByAddressQueryResult = Apollo.QueryResult<GetErc721TransfersByAddressQuery, GetErc721TransfersByAddressQueryVariables>;
export const GetErc721OwnerDocument = gql`
    query GetERC721Owner($token: Address!, $tokenId: BigInt!) {
  erc721Owner(token: $token, tokenId: $tokenId)
}
    `;

/**
 * __useGetErc721OwnerQuery__
 *
 * To run a query within a React component, call `useGetErc721OwnerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetErc721OwnerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetErc721OwnerQuery({
 *   variables: {
 *      token: // value for 'token'
 *      tokenId: // value for 'tokenId'
 *   },
 * });
 */
export function useGetErc721OwnerQuery(baseOptions: Apollo.QueryHookOptions<GetErc721OwnerQuery, GetErc721OwnerQueryVariables> & ({ variables: GetErc721OwnerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>(GetErc721OwnerDocument, options);
      }
export function useGetErc721OwnerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>(GetErc721OwnerDocument, options);
        }
export function useGetErc721OwnerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>(GetErc721OwnerDocument, options);
        }
export type GetErc721OwnerQueryHookResult = ReturnType<typeof useGetErc721OwnerQuery>;
export type GetErc721OwnerLazyQueryHookResult = ReturnType<typeof useGetErc721OwnerLazyQuery>;
export type GetErc721OwnerSuspenseQueryHookResult = ReturnType<typeof useGetErc721OwnerSuspenseQuery>;
export type GetErc721OwnerQueryResult = Apollo.QueryResult<GetErc721OwnerQuery, GetErc721OwnerQueryVariables>;
export const GetWbftBlockExtraDocument = gql`
    query GetWbftBlockExtra($blockNumber: BigInt!) {
  wbftBlockExtra(blockNumber: $blockNumber) {
    blockNumber
    blockHash
    randaoReveal
    prevRound
    round
    preparedSeal {
      sealers
      signature
    }
    committedSeal {
      sealers
      signature
    }
    gasTip
    epochInfo {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
    timestamp
  }
}
    `;

/**
 * __useGetWbftBlockExtraQuery__
 *
 * To run a query within a React component, call `useGetWbftBlockExtraQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWbftBlockExtraQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWbftBlockExtraQuery({
 *   variables: {
 *      blockNumber: // value for 'blockNumber'
 *   },
 * });
 */
export function useGetWbftBlockExtraQuery(baseOptions: Apollo.QueryHookOptions<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables> & ({ variables: GetWbftBlockExtraQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>(GetWbftBlockExtraDocument, options);
      }
export function useGetWbftBlockExtraLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>(GetWbftBlockExtraDocument, options);
        }
export function useGetWbftBlockExtraSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>(GetWbftBlockExtraDocument, options);
        }
export type GetWbftBlockExtraQueryHookResult = ReturnType<typeof useGetWbftBlockExtraQuery>;
export type GetWbftBlockExtraLazyQueryHookResult = ReturnType<typeof useGetWbftBlockExtraLazyQuery>;
export type GetWbftBlockExtraSuspenseQueryHookResult = ReturnType<typeof useGetWbftBlockExtraSuspenseQuery>;
export type GetWbftBlockExtraQueryResult = Apollo.QueryResult<GetWbftBlockExtraQuery, GetWbftBlockExtraQueryVariables>;
export const GetWbftBlockExtraByHashDocument = gql`
    query GetWbftBlockExtraByHash($blockHash: Hash!) {
  wbftBlockExtraByHash(blockHash: $blockHash) {
    blockNumber
    blockHash
    randaoReveal
    prevRound
    round
    preparedSeal {
      sealers
      signature
    }
    committedSeal {
      sealers
      signature
    }
    gasTip
    epochInfo {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
    timestamp
  }
}
    `;

/**
 * __useGetWbftBlockExtraByHashQuery__
 *
 * To run a query within a React component, call `useGetWbftBlockExtraByHashQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWbftBlockExtraByHashQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWbftBlockExtraByHashQuery({
 *   variables: {
 *      blockHash: // value for 'blockHash'
 *   },
 * });
 */
export function useGetWbftBlockExtraByHashQuery(baseOptions: Apollo.QueryHookOptions<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables> & ({ variables: GetWbftBlockExtraByHashQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>(GetWbftBlockExtraByHashDocument, options);
      }
export function useGetWbftBlockExtraByHashLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>(GetWbftBlockExtraByHashDocument, options);
        }
export function useGetWbftBlockExtraByHashSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>(GetWbftBlockExtraByHashDocument, options);
        }
export type GetWbftBlockExtraByHashQueryHookResult = ReturnType<typeof useGetWbftBlockExtraByHashQuery>;
export type GetWbftBlockExtraByHashLazyQueryHookResult = ReturnType<typeof useGetWbftBlockExtraByHashLazyQuery>;
export type GetWbftBlockExtraByHashSuspenseQueryHookResult = ReturnType<typeof useGetWbftBlockExtraByHashSuspenseQuery>;
export type GetWbftBlockExtraByHashQueryResult = Apollo.QueryResult<GetWbftBlockExtraByHashQuery, GetWbftBlockExtraByHashQueryVariables>;
export const GetEpochInfoDocument = gql`
    query GetEpochInfo($epochNumber: BigInt!) {
  epochInfo(epochNumber: $epochNumber) {
    epochNumber
    blockNumber
    candidates {
      address
      diligence
    }
    validators
    blsPublicKeys
  }
}
    `;

/**
 * __useGetEpochInfoQuery__
 *
 * To run a query within a React component, call `useGetEpochInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEpochInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEpochInfoQuery({
 *   variables: {
 *      epochNumber: // value for 'epochNumber'
 *   },
 * });
 */
export function useGetEpochInfoQuery(baseOptions: Apollo.QueryHookOptions<GetEpochInfoQuery, GetEpochInfoQueryVariables> & ({ variables: GetEpochInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEpochInfoQuery, GetEpochInfoQueryVariables>(GetEpochInfoDocument, options);
      }
export function useGetEpochInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEpochInfoQuery, GetEpochInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEpochInfoQuery, GetEpochInfoQueryVariables>(GetEpochInfoDocument, options);
        }
export function useGetEpochInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEpochInfoQuery, GetEpochInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEpochInfoQuery, GetEpochInfoQueryVariables>(GetEpochInfoDocument, options);
        }
export type GetEpochInfoQueryHookResult = ReturnType<typeof useGetEpochInfoQuery>;
export type GetEpochInfoLazyQueryHookResult = ReturnType<typeof useGetEpochInfoLazyQuery>;
export type GetEpochInfoSuspenseQueryHookResult = ReturnType<typeof useGetEpochInfoSuspenseQuery>;
export type GetEpochInfoQueryResult = Apollo.QueryResult<GetEpochInfoQuery, GetEpochInfoQueryVariables>;
export const GetLatestEpochInfoDocument = gql`
    query GetLatestEpochInfo {
  latestEpochInfo {
    epochNumber
    blockNumber
    candidates {
      address
      diligence
    }
    validators
    blsPublicKeys
  }
}
    `;

/**
 * __useGetLatestEpochInfoQuery__
 *
 * To run a query within a React component, call `useGetLatestEpochInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestEpochInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestEpochInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestEpochInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>(GetLatestEpochInfoDocument, options);
      }
export function useGetLatestEpochInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>(GetLatestEpochInfoDocument, options);
        }
export function useGetLatestEpochInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>(GetLatestEpochInfoDocument, options);
        }
export type GetLatestEpochInfoQueryHookResult = ReturnType<typeof useGetLatestEpochInfoQuery>;
export type GetLatestEpochInfoLazyQueryHookResult = ReturnType<typeof useGetLatestEpochInfoLazyQuery>;
export type GetLatestEpochInfoSuspenseQueryHookResult = ReturnType<typeof useGetLatestEpochInfoSuspenseQuery>;
export type GetLatestEpochInfoQueryResult = Apollo.QueryResult<GetLatestEpochInfoQuery, GetLatestEpochInfoQueryVariables>;
export const GetValidatorSigningStatsDocument = gql`
    query GetValidatorSigningStats($validatorAddress: Address!, $fromBlock: BigInt!, $toBlock: BigInt!) {
  validatorSigningStats(
    validatorAddress: $validatorAddress
    fromBlock: $fromBlock
    toBlock: $toBlock
  ) {
    validatorAddress
    validatorIndex
    prepareSignCount
    prepareMissCount
    commitSignCount
    commitMissCount
    fromBlock
    toBlock
    signingRate
  }
}
    `;

/**
 * __useGetValidatorSigningStatsQuery__
 *
 * To run a query within a React component, call `useGetValidatorSigningStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidatorSigningStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidatorSigningStatsQuery({
 *   variables: {
 *      validatorAddress: // value for 'validatorAddress'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetValidatorSigningStatsQuery(baseOptions: Apollo.QueryHookOptions<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables> & ({ variables: GetValidatorSigningStatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>(GetValidatorSigningStatsDocument, options);
      }
export function useGetValidatorSigningStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>(GetValidatorSigningStatsDocument, options);
        }
export function useGetValidatorSigningStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>(GetValidatorSigningStatsDocument, options);
        }
export type GetValidatorSigningStatsQueryHookResult = ReturnType<typeof useGetValidatorSigningStatsQuery>;
export type GetValidatorSigningStatsLazyQueryHookResult = ReturnType<typeof useGetValidatorSigningStatsLazyQuery>;
export type GetValidatorSigningStatsSuspenseQueryHookResult = ReturnType<typeof useGetValidatorSigningStatsSuspenseQuery>;
export type GetValidatorSigningStatsQueryResult = Apollo.QueryResult<GetValidatorSigningStatsQuery, GetValidatorSigningStatsQueryVariables>;
export const GetAllValidatorsSigningStatsDocument = gql`
    query GetAllValidatorsSigningStats($fromBlock: BigInt!, $toBlock: BigInt!, $limit: Int, $offset: Int) {
  allValidatorsSigningStats(
    fromBlock: $fromBlock
    toBlock: $toBlock
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      validatorAddress
      validatorIndex
      prepareSignCount
      prepareMissCount
      commitSignCount
      commitMissCount
      fromBlock
      toBlock
      signingRate
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
 * __useGetAllValidatorsSigningStatsQuery__
 *
 * To run a query within a React component, call `useGetAllValidatorsSigningStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllValidatorsSigningStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllValidatorsSigningStatsQuery({
 *   variables: {
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetAllValidatorsSigningStatsQuery(baseOptions: Apollo.QueryHookOptions<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables> & ({ variables: GetAllValidatorsSigningStatsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>(GetAllValidatorsSigningStatsDocument, options);
      }
export function useGetAllValidatorsSigningStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>(GetAllValidatorsSigningStatsDocument, options);
        }
export function useGetAllValidatorsSigningStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>(GetAllValidatorsSigningStatsDocument, options);
        }
export type GetAllValidatorsSigningStatsQueryHookResult = ReturnType<typeof useGetAllValidatorsSigningStatsQuery>;
export type GetAllValidatorsSigningStatsLazyQueryHookResult = ReturnType<typeof useGetAllValidatorsSigningStatsLazyQuery>;
export type GetAllValidatorsSigningStatsSuspenseQueryHookResult = ReturnType<typeof useGetAllValidatorsSigningStatsSuspenseQuery>;
export type GetAllValidatorsSigningStatsQueryResult = Apollo.QueryResult<GetAllValidatorsSigningStatsQuery, GetAllValidatorsSigningStatsQueryVariables>;
export const GetValidatorSigningActivityDocument = gql`
    query GetValidatorSigningActivity($validatorAddress: Address!, $fromBlock: BigInt!, $toBlock: BigInt!, $limit: Int, $offset: Int) {
  validatorSigningActivity(
    validatorAddress: $validatorAddress
    fromBlock: $fromBlock
    toBlock: $toBlock
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
      blockNumber
      blockHash
      validatorAddress
      validatorIndex
      signedPrepare
      signedCommit
      round
      timestamp
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
 * __useGetValidatorSigningActivityQuery__
 *
 * To run a query within a React component, call `useGetValidatorSigningActivityQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidatorSigningActivityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidatorSigningActivityQuery({
 *   variables: {
 *      validatorAddress: // value for 'validatorAddress'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetValidatorSigningActivityQuery(baseOptions: Apollo.QueryHookOptions<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables> & ({ variables: GetValidatorSigningActivityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>(GetValidatorSigningActivityDocument, options);
      }
export function useGetValidatorSigningActivityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>(GetValidatorSigningActivityDocument, options);
        }
export function useGetValidatorSigningActivitySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>(GetValidatorSigningActivityDocument, options);
        }
export type GetValidatorSigningActivityQueryHookResult = ReturnType<typeof useGetValidatorSigningActivityQuery>;
export type GetValidatorSigningActivityLazyQueryHookResult = ReturnType<typeof useGetValidatorSigningActivityLazyQuery>;
export type GetValidatorSigningActivitySuspenseQueryHookResult = ReturnType<typeof useGetValidatorSigningActivitySuspenseQuery>;
export type GetValidatorSigningActivityQueryResult = Apollo.QueryResult<GetValidatorSigningActivityQuery, GetValidatorSigningActivityQueryVariables>;
export const GetBlockSignersDocument = gql`
    query GetBlockSigners($blockNumber: BigInt!) {
  blockSigners(blockNumber: $blockNumber) {
    blockNumber
    preparers
    committers
  }
}
    `;

/**
 * __useGetBlockSignersQuery__
 *
 * To run a query within a React component, call `useGetBlockSignersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockSignersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockSignersQuery({
 *   variables: {
 *      blockNumber: // value for 'blockNumber'
 *   },
 * });
 */
export function useGetBlockSignersQuery(baseOptions: Apollo.QueryHookOptions<GetBlockSignersQuery, GetBlockSignersQueryVariables> & ({ variables: GetBlockSignersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockSignersQuery, GetBlockSignersQueryVariables>(GetBlockSignersDocument, options);
      }
export function useGetBlockSignersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockSignersQuery, GetBlockSignersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockSignersQuery, GetBlockSignersQueryVariables>(GetBlockSignersDocument, options);
        }
export function useGetBlockSignersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockSignersQuery, GetBlockSignersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockSignersQuery, GetBlockSignersQueryVariables>(GetBlockSignersDocument, options);
        }
export type GetBlockSignersQueryHookResult = ReturnType<typeof useGetBlockSignersQuery>;
export type GetBlockSignersLazyQueryHookResult = ReturnType<typeof useGetBlockSignersLazyQuery>;
export type GetBlockSignersSuspenseQueryHookResult = ReturnType<typeof useGetBlockSignersSuspenseQuery>;
export type GetBlockSignersQueryResult = Apollo.QueryResult<GetBlockSignersQuery, GetBlockSignersQueryVariables>;
export const GetContractVerificationDocument = gql`
    query GetContractVerification($address: String!) {
  contractVerification(address: $address) {
    address
    isVerified
    name
    compilerVersion
    optimizationEnabled
    optimizationRuns
    sourceCode
    abi
    constructorArguments
    verifiedAt
    licenseType
  }
}
    `;

/**
 * __useGetContractVerificationQuery__
 *
 * To run a query within a React component, call `useGetContractVerificationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractVerificationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractVerificationQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetContractVerificationQuery(baseOptions: Apollo.QueryHookOptions<GetContractVerificationQuery, GetContractVerificationQueryVariables> & ({ variables: GetContractVerificationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractVerificationQuery, GetContractVerificationQueryVariables>(GetContractVerificationDocument, options);
      }
export function useGetContractVerificationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractVerificationQuery, GetContractVerificationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractVerificationQuery, GetContractVerificationQueryVariables>(GetContractVerificationDocument, options);
        }
export function useGetContractVerificationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractVerificationQuery, GetContractVerificationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractVerificationQuery, GetContractVerificationQueryVariables>(GetContractVerificationDocument, options);
        }
export type GetContractVerificationQueryHookResult = ReturnType<typeof useGetContractVerificationQuery>;
export type GetContractVerificationLazyQueryHookResult = ReturnType<typeof useGetContractVerificationLazyQuery>;
export type GetContractVerificationSuspenseQueryHookResult = ReturnType<typeof useGetContractVerificationSuspenseQuery>;
export type GetContractVerificationQueryResult = Apollo.QueryResult<GetContractVerificationQuery, GetContractVerificationQueryVariables>;
export const VerifyContractDocument = gql`
    mutation VerifyContract($address: String!, $sourceCode: String!, $compilerVersion: String!, $optimizationEnabled: Boolean!, $optimizationRuns: Int, $constructorArguments: String, $contractName: String, $licenseType: String) {
  verifyContract(
    address: $address
    sourceCode: $sourceCode
    compilerVersion: $compilerVersion
    optimizationEnabled: $optimizationEnabled
    optimizationRuns: $optimizationRuns
    constructorArguments: $constructorArguments
    contractName: $contractName
    licenseType: $licenseType
  ) {
    address
    isVerified
    verifiedAt
  }
}
    `;
export type VerifyContractMutationFn = Apollo.MutationFunction<VerifyContractMutation, VerifyContractMutationVariables>;

/**
 * __useVerifyContractMutation__
 *
 * To run a mutation, you first call `useVerifyContractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyContractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyContractMutation, { data, loading, error }] = useVerifyContractMutation({
 *   variables: {
 *      address: // value for 'address'
 *      sourceCode: // value for 'sourceCode'
 *      compilerVersion: // value for 'compilerVersion'
 *      optimizationEnabled: // value for 'optimizationEnabled'
 *      optimizationRuns: // value for 'optimizationRuns'
 *      constructorArguments: // value for 'constructorArguments'
 *      contractName: // value for 'contractName'
 *      licenseType: // value for 'licenseType'
 *   },
 * });
 */
export function useVerifyContractMutation(baseOptions?: Apollo.MutationHookOptions<VerifyContractMutation, VerifyContractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyContractMutation, VerifyContractMutationVariables>(VerifyContractDocument, options);
      }
export type VerifyContractMutationHookResult = ReturnType<typeof useVerifyContractMutation>;
export type VerifyContractMutationResult = Apollo.MutationResult<VerifyContractMutation>;
export type VerifyContractMutationOptions = Apollo.BaseMutationOptions<VerifyContractMutation, VerifyContractMutationVariables>;
export const GetAddressBalanceRelayDocument = gql`
    query GetAddressBalanceRelay($address: Address!) {
  addressBalance(address: $address)
}
    `;

/**
 * __useGetAddressBalanceRelayQuery__
 *
 * To run a query within a React component, call `useGetAddressBalanceRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressBalanceRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressBalanceRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetAddressBalanceRelayQuery(baseOptions: Apollo.QueryHookOptions<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables> & ({ variables: GetAddressBalanceRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>(GetAddressBalanceRelayDocument, options);
      }
export function useGetAddressBalanceRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>(GetAddressBalanceRelayDocument, options);
        }
export function useGetAddressBalanceRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>(GetAddressBalanceRelayDocument, options);
        }
export type GetAddressBalanceRelayQueryHookResult = ReturnType<typeof useGetAddressBalanceRelayQuery>;
export type GetAddressBalanceRelayLazyQueryHookResult = ReturnType<typeof useGetAddressBalanceRelayLazyQuery>;
export type GetAddressBalanceRelaySuspenseQueryHookResult = ReturnType<typeof useGetAddressBalanceRelaySuspenseQuery>;
export type GetAddressBalanceRelayQueryResult = Apollo.QueryResult<GetAddressBalanceRelayQuery, GetAddressBalanceRelayQueryVariables>;
export const GetTokenBalancesRelayDocument = gql`
    query GetTokenBalancesRelay($address: Address!) {
  tokenBalances(address: $address) {
    address
    balance
    tokenId
    tokenType
  }
}
    `;

/**
 * __useGetTokenBalancesRelayQuery__
 *
 * To run a query within a React component, call `useGetTokenBalancesRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTokenBalancesRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTokenBalancesRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetTokenBalancesRelayQuery(baseOptions: Apollo.QueryHookOptions<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables> & ({ variables: GetTokenBalancesRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>(GetTokenBalancesRelayDocument, options);
      }
export function useGetTokenBalancesRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>(GetTokenBalancesRelayDocument, options);
        }
export function useGetTokenBalancesRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>(GetTokenBalancesRelayDocument, options);
        }
export type GetTokenBalancesRelayQueryHookResult = ReturnType<typeof useGetTokenBalancesRelayQuery>;
export type GetTokenBalancesRelayLazyQueryHookResult = ReturnType<typeof useGetTokenBalancesRelayLazyQuery>;
export type GetTokenBalancesRelaySuspenseQueryHookResult = ReturnType<typeof useGetTokenBalancesRelaySuspenseQuery>;
export type GetTokenBalancesRelayQueryResult = Apollo.QueryResult<GetTokenBalancesRelayQuery, GetTokenBalancesRelayQueryVariables>;
export const GetTransactionsByAddressRelayDocument = gql`
    query GetTransactionsByAddressRelay($address: Address!, $limit: Int, $offset: Int) {
  transactionsByAddress(
    address: $address
    pagination: {limit: $limit, offset: $offset}
  ) {
    nodes {
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
      receipt {
        status
        gasUsed
        contractAddress
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    `;

/**
 * __useGetTransactionsByAddressRelayQuery__
 *
 * To run a query within a React component, call `useGetTransactionsByAddressRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsByAddressRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsByAddressRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetTransactionsByAddressRelayQuery(baseOptions: Apollo.QueryHookOptions<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables> & ({ variables: GetTransactionsByAddressRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>(GetTransactionsByAddressRelayDocument, options);
      }
export function useGetTransactionsByAddressRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>(GetTransactionsByAddressRelayDocument, options);
        }
export function useGetTransactionsByAddressRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>(GetTransactionsByAddressRelayDocument, options);
        }
export type GetTransactionsByAddressRelayQueryHookResult = ReturnType<typeof useGetTransactionsByAddressRelayQuery>;
export type GetTransactionsByAddressRelayLazyQueryHookResult = ReturnType<typeof useGetTransactionsByAddressRelayLazyQuery>;
export type GetTransactionsByAddressRelaySuspenseQueryHookResult = ReturnType<typeof useGetTransactionsByAddressRelaySuspenseQuery>;
export type GetTransactionsByAddressRelayQueryResult = Apollo.QueryResult<GetTransactionsByAddressRelayQuery, GetTransactionsByAddressRelayQueryVariables>;
export const GetLogsByAddressRelayDocument = gql`
    query GetLogsByAddressRelay($address: Address, $limit: Int, $offset: Int) {
  logs(filter: {address: $address}, pagination: {limit: $limit, offset: $offset}) {
    nodes {
      address
      topics
      data
      blockNumber
      blockHash
      transactionHash
      transactionIndex
      logIndex
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
    `;

/**
 * __useGetLogsByAddressRelayQuery__
 *
 * To run a query within a React component, call `useGetLogsByAddressRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLogsByAddressRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLogsByAddressRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetLogsByAddressRelayQuery(baseOptions?: Apollo.QueryHookOptions<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>(GetLogsByAddressRelayDocument, options);
      }
export function useGetLogsByAddressRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>(GetLogsByAddressRelayDocument, options);
        }
export function useGetLogsByAddressRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>(GetLogsByAddressRelayDocument, options);
        }
export type GetLogsByAddressRelayQueryHookResult = ReturnType<typeof useGetLogsByAddressRelayQuery>;
export type GetLogsByAddressRelayLazyQueryHookResult = ReturnType<typeof useGetLogsByAddressRelayLazyQuery>;
export type GetLogsByAddressRelaySuspenseQueryHookResult = ReturnType<typeof useGetLogsByAddressRelaySuspenseQuery>;
export type GetLogsByAddressRelayQueryResult = Apollo.QueryResult<GetLogsByAddressRelayQuery, GetLogsByAddressRelayQueryVariables>;
export const GetBlockTimestampDocument = gql`
    query GetBlockTimestamp($number: BigInt!) {
  block(number: $number) {
    number
    timestamp
  }
}
    `;

/**
 * __useGetBlockTimestampQuery__
 *
 * To run a query within a React component, call `useGetBlockTimestampQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockTimestampQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockTimestampQuery({
 *   variables: {
 *      number: // value for 'number'
 *   },
 * });
 */
export function useGetBlockTimestampQuery(baseOptions: Apollo.QueryHookOptions<GetBlockTimestampQuery, GetBlockTimestampQueryVariables> & ({ variables: GetBlockTimestampQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>(GetBlockTimestampDocument, options);
      }
export function useGetBlockTimestampLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>(GetBlockTimestampDocument, options);
        }
export function useGetBlockTimestampSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>(GetBlockTimestampDocument, options);
        }
export type GetBlockTimestampQueryHookResult = ReturnType<typeof useGetBlockTimestampQuery>;
export type GetBlockTimestampLazyQueryHookResult = ReturnType<typeof useGetBlockTimestampLazyQuery>;
export type GetBlockTimestampSuspenseQueryHookResult = ReturnType<typeof useGetBlockTimestampSuspenseQuery>;
export type GetBlockTimestampQueryResult = Apollo.QueryResult<GetBlockTimestampQuery, GetBlockTimestampQueryVariables>;
export const GetLatestHeightRelayDocument = gql`
    query GetLatestHeightRelay {
  latestHeight
}
    `;

/**
 * __useGetLatestHeightRelayQuery__
 *
 * To run a query within a React component, call `useGetLatestHeightRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestHeightRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestHeightRelayQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestHeightRelayQuery(baseOptions?: Apollo.QueryHookOptions<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>(GetLatestHeightRelayDocument, options);
      }
export function useGetLatestHeightRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>(GetLatestHeightRelayDocument, options);
        }
export function useGetLatestHeightRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>(GetLatestHeightRelayDocument, options);
        }
export type GetLatestHeightRelayQueryHookResult = ReturnType<typeof useGetLatestHeightRelayQuery>;
export type GetLatestHeightRelayLazyQueryHookResult = ReturnType<typeof useGetLatestHeightRelayLazyQuery>;
export type GetLatestHeightRelaySuspenseQueryHookResult = ReturnType<typeof useGetLatestHeightRelaySuspenseQuery>;
export type GetLatestHeightRelayQueryResult = Apollo.QueryResult<GetLatestHeightRelayQuery, GetLatestHeightRelayQueryVariables>;
export const GetContractCreationRelayDocument = gql`
    query GetContractCreationRelay($address: Address!) {
  contractCreation(address: $address) {
    contractAddress
    creator
    transactionHash
    blockNumber
    timestamp
  }
}
    `;

/**
 * __useGetContractCreationRelayQuery__
 *
 * To run a query within a React component, call `useGetContractCreationRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractCreationRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractCreationRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetContractCreationRelayQuery(baseOptions: Apollo.QueryHookOptions<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables> & ({ variables: GetContractCreationRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>(GetContractCreationRelayDocument, options);
      }
export function useGetContractCreationRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>(GetContractCreationRelayDocument, options);
        }
export function useGetContractCreationRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>(GetContractCreationRelayDocument, options);
        }
export type GetContractCreationRelayQueryHookResult = ReturnType<typeof useGetContractCreationRelayQuery>;
export type GetContractCreationRelayLazyQueryHookResult = ReturnType<typeof useGetContractCreationRelayLazyQuery>;
export type GetContractCreationRelaySuspenseQueryHookResult = ReturnType<typeof useGetContractCreationRelaySuspenseQuery>;
export type GetContractCreationRelayQueryResult = Apollo.QueryResult<GetContractCreationRelayQuery, GetContractCreationRelayQueryVariables>;
export const GetContractVerificationRelayDocument = gql`
    query GetContractVerificationRelay($address: Address!) {
  contractVerification(address: $address) {
    address
    isVerified
    name
    compilerVersion
    optimizationEnabled
    optimizationRuns
    sourceCode
    abi
    constructorArguments
    verifiedAt
    licenseType
  }
}
    `;

/**
 * __useGetContractVerificationRelayQuery__
 *
 * To run a query within a React component, call `useGetContractVerificationRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractVerificationRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractVerificationRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetContractVerificationRelayQuery(baseOptions: Apollo.QueryHookOptions<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables> & ({ variables: GetContractVerificationRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>(GetContractVerificationRelayDocument, options);
      }
export function useGetContractVerificationRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>(GetContractVerificationRelayDocument, options);
        }
export function useGetContractVerificationRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>(GetContractVerificationRelayDocument, options);
        }
export type GetContractVerificationRelayQueryHookResult = ReturnType<typeof useGetContractVerificationRelayQuery>;
export type GetContractVerificationRelayLazyQueryHookResult = ReturnType<typeof useGetContractVerificationRelayLazyQuery>;
export type GetContractVerificationRelaySuspenseQueryHookResult = ReturnType<typeof useGetContractVerificationRelaySuspenseQuery>;
export type GetContractVerificationRelayQueryResult = Apollo.QueryResult<GetContractVerificationRelayQuery, GetContractVerificationRelayQueryVariables>;
export const GetActiveValidatorsRelayDocument = gql`
    query GetActiveValidatorsRelay {
  activeValidators {
    address
    isActive
  }
}
    `;

/**
 * __useGetActiveValidatorsRelayQuery__
 *
 * To run a query within a React component, call `useGetActiveValidatorsRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveValidatorsRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveValidatorsRelayQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveValidatorsRelayQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>(GetActiveValidatorsRelayDocument, options);
      }
export function useGetActiveValidatorsRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>(GetActiveValidatorsRelayDocument, options);
        }
export function useGetActiveValidatorsRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>(GetActiveValidatorsRelayDocument, options);
        }
export type GetActiveValidatorsRelayQueryHookResult = ReturnType<typeof useGetActiveValidatorsRelayQuery>;
export type GetActiveValidatorsRelayLazyQueryHookResult = ReturnType<typeof useGetActiveValidatorsRelayLazyQuery>;
export type GetActiveValidatorsRelaySuspenseQueryHookResult = ReturnType<typeof useGetActiveValidatorsRelaySuspenseQuery>;
export type GetActiveValidatorsRelayQueryResult = Apollo.QueryResult<GetActiveValidatorsRelayQuery, GetActiveValidatorsRelayQueryVariables>;
export const GetBlockByNumberRelayDocument = gql`
    query GetBlockByNumberRelay($number: BigInt!) {
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
  }
}
    `;

/**
 * __useGetBlockByNumberRelayQuery__
 *
 * To run a query within a React component, call `useGetBlockByNumberRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockByNumberRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockByNumberRelayQuery({
 *   variables: {
 *      number: // value for 'number'
 *   },
 * });
 */
export function useGetBlockByNumberRelayQuery(baseOptions: Apollo.QueryHookOptions<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables> & ({ variables: GetBlockByNumberRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>(GetBlockByNumberRelayDocument, options);
      }
export function useGetBlockByNumberRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>(GetBlockByNumberRelayDocument, options);
        }
export function useGetBlockByNumberRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>(GetBlockByNumberRelayDocument, options);
        }
export type GetBlockByNumberRelayQueryHookResult = ReturnType<typeof useGetBlockByNumberRelayQuery>;
export type GetBlockByNumberRelayLazyQueryHookResult = ReturnType<typeof useGetBlockByNumberRelayLazyQuery>;
export type GetBlockByNumberRelaySuspenseQueryHookResult = ReturnType<typeof useGetBlockByNumberRelaySuspenseQuery>;
export type GetBlockByNumberRelayQueryResult = Apollo.QueryResult<GetBlockByNumberRelayQuery, GetBlockByNumberRelayQueryVariables>;
export const GetBlockByHashRelayDocument = gql`
    query GetBlockByHashRelay($hash: Hash!) {
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
  }
}
    `;

/**
 * __useGetBlockByHashRelayQuery__
 *
 * To run a query within a React component, call `useGetBlockByHashRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlockByHashRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlockByHashRelayQuery({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useGetBlockByHashRelayQuery(baseOptions: Apollo.QueryHookOptions<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables> & ({ variables: GetBlockByHashRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>(GetBlockByHashRelayDocument, options);
      }
export function useGetBlockByHashRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>(GetBlockByHashRelayDocument, options);
        }
export function useGetBlockByHashRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>(GetBlockByHashRelayDocument, options);
        }
export type GetBlockByHashRelayQueryHookResult = ReturnType<typeof useGetBlockByHashRelayQuery>;
export type GetBlockByHashRelayLazyQueryHookResult = ReturnType<typeof useGetBlockByHashRelayLazyQuery>;
export type GetBlockByHashRelaySuspenseQueryHookResult = ReturnType<typeof useGetBlockByHashRelaySuspenseQuery>;
export type GetBlockByHashRelayQueryResult = Apollo.QueryResult<GetBlockByHashRelayQuery, GetBlockByHashRelayQueryVariables>;
export const GetTransactionRelayDocument = gql`
    query GetTransactionRelay($hash: Hash!) {
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
 * __useGetTransactionRelayQuery__
 *
 * To run a query within a React component, call `useGetTransactionRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionRelayQuery({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useGetTransactionRelayQuery(baseOptions: Apollo.QueryHookOptions<GetTransactionRelayQuery, GetTransactionRelayQueryVariables> & ({ variables: GetTransactionRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>(GetTransactionRelayDocument, options);
      }
export function useGetTransactionRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>(GetTransactionRelayDocument, options);
        }
export function useGetTransactionRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>(GetTransactionRelayDocument, options);
        }
export type GetTransactionRelayQueryHookResult = ReturnType<typeof useGetTransactionRelayQuery>;
export type GetTransactionRelayLazyQueryHookResult = ReturnType<typeof useGetTransactionRelayLazyQuery>;
export type GetTransactionRelaySuspenseQueryHookResult = ReturnType<typeof useGetTransactionRelaySuspenseQuery>;
export type GetTransactionRelayQueryResult = Apollo.QueryResult<GetTransactionRelayQuery, GetTransactionRelayQueryVariables>;
export const GetAccountTxCountRelayDocument = gql`
    query GetAccountTxCountRelay($address: Address!) {
  transactionsByAddress(address: $address, pagination: {limit: 1}) {
    totalCount
  }
}
    `;

/**
 * __useGetAccountTxCountRelayQuery__
 *
 * To run a query within a React component, call `useGetAccountTxCountRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAccountTxCountRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAccountTxCountRelayQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetAccountTxCountRelayQuery(baseOptions: Apollo.QueryHookOptions<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables> & ({ variables: GetAccountTxCountRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>(GetAccountTxCountRelayDocument, options);
      }
export function useGetAccountTxCountRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>(GetAccountTxCountRelayDocument, options);
        }
export function useGetAccountTxCountRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>(GetAccountTxCountRelayDocument, options);
        }
export type GetAccountTxCountRelayQueryHookResult = ReturnType<typeof useGetAccountTxCountRelayQuery>;
export type GetAccountTxCountRelayLazyQueryHookResult = ReturnType<typeof useGetAccountTxCountRelayLazyQuery>;
export type GetAccountTxCountRelaySuspenseQueryHookResult = ReturnType<typeof useGetAccountTxCountRelaySuspenseQuery>;
export type GetAccountTxCountRelayQueryResult = Apollo.QueryResult<GetAccountTxCountRelayQuery, GetAccountTxCountRelayQueryVariables>;
export const GetRecentTransactionsRelayDocument = gql`
    query GetRecentTransactionsRelay($limit: Int!) {
  transactions(pagination: {limit: $limit}) {
    nodes {
      gasPrice
      receipt {
        gasUsed
      }
    }
  }
}
    `;

/**
 * __useGetRecentTransactionsRelayQuery__
 *
 * To run a query within a React component, call `useGetRecentTransactionsRelayQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentTransactionsRelayQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentTransactionsRelayQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetRecentTransactionsRelayQuery(baseOptions: Apollo.QueryHookOptions<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables> & ({ variables: GetRecentTransactionsRelayQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>(GetRecentTransactionsRelayDocument, options);
      }
export function useGetRecentTransactionsRelayLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>(GetRecentTransactionsRelayDocument, options);
        }
export function useGetRecentTransactionsRelaySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>(GetRecentTransactionsRelayDocument, options);
        }
export type GetRecentTransactionsRelayQueryHookResult = ReturnType<typeof useGetRecentTransactionsRelayQuery>;
export type GetRecentTransactionsRelayLazyQueryHookResult = ReturnType<typeof useGetRecentTransactionsRelayLazyQuery>;
export type GetRecentTransactionsRelaySuspenseQueryHookResult = ReturnType<typeof useGetRecentTransactionsRelaySuspenseQuery>;
export type GetRecentTransactionsRelayQueryResult = Apollo.QueryResult<GetRecentTransactionsRelayQuery, GetRecentTransactionsRelayQueryVariables>;
export const ContractCallDocument = gql`
    query ContractCall($address: Address!, $method: String!, $params: String, $abi: String) {
  contractCall(address: $address, method: $method, params: $params, abi: $abi) {
    result
    rawResult
    decoded
  }
}
    `;

/**
 * __useContractCallQuery__
 *
 * To run a query within a React component, call `useContractCallQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractCallQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractCallQuery({
 *   variables: {
 *      address: // value for 'address'
 *      method: // value for 'method'
 *      params: // value for 'params'
 *      abi: // value for 'abi'
 *   },
 * });
 */
export function useContractCallQuery(baseOptions: Apollo.QueryHookOptions<ContractCallQuery, ContractCallQueryVariables> & ({ variables: ContractCallQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContractCallQuery, ContractCallQueryVariables>(ContractCallDocument, options);
      }
export function useContractCallLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContractCallQuery, ContractCallQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContractCallQuery, ContractCallQueryVariables>(ContractCallDocument, options);
        }
export function useContractCallSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ContractCallQuery, ContractCallQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ContractCallQuery, ContractCallQueryVariables>(ContractCallDocument, options);
        }
export type ContractCallQueryHookResult = ReturnType<typeof useContractCallQuery>;
export type ContractCallLazyQueryHookResult = ReturnType<typeof useContractCallLazyQuery>;
export type ContractCallSuspenseQueryHookResult = ReturnType<typeof useContractCallSuspenseQuery>;
export type ContractCallQueryResult = Apollo.QueryResult<ContractCallQuery, ContractCallQueryVariables>;
export const TransactionStatusDocument = gql`
    query TransactionStatus($txHash: Hash!) {
  transactionStatus(txHash: $txHash) {
    txHash
    status
    blockNumber
    blockHash
    confirmations
    gasUsed
  }
}
    `;

/**
 * __useTransactionStatusQuery__
 *
 * To run a query within a React component, call `useTransactionStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransactionStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionStatusQuery({
 *   variables: {
 *      txHash: // value for 'txHash'
 *   },
 * });
 */
export function useTransactionStatusQuery(baseOptions: Apollo.QueryHookOptions<TransactionStatusQuery, TransactionStatusQueryVariables> & ({ variables: TransactionStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TransactionStatusQuery, TransactionStatusQueryVariables>(TransactionStatusDocument, options);
      }
export function useTransactionStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TransactionStatusQuery, TransactionStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TransactionStatusQuery, TransactionStatusQueryVariables>(TransactionStatusDocument, options);
        }
export function useTransactionStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TransactionStatusQuery, TransactionStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TransactionStatusQuery, TransactionStatusQueryVariables>(TransactionStatusDocument, options);
        }
export type TransactionStatusQueryHookResult = ReturnType<typeof useTransactionStatusQuery>;
export type TransactionStatusLazyQueryHookResult = ReturnType<typeof useTransactionStatusLazyQuery>;
export type TransactionStatusSuspenseQueryHookResult = ReturnType<typeof useTransactionStatusSuspenseQuery>;
export type TransactionStatusQueryResult = Apollo.QueryResult<TransactionStatusQuery, TransactionStatusQueryVariables>;
export const InternalTransactionsRpcDocument = gql`
    query InternalTransactionsRPC($txHash: Hash!) {
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
    `;

/**
 * __useInternalTransactionsRpcQuery__
 *
 * To run a query within a React component, call `useInternalTransactionsRpcQuery` and pass it any options that fit your needs.
 * When your component renders, `useInternalTransactionsRpcQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInternalTransactionsRpcQuery({
 *   variables: {
 *      txHash: // value for 'txHash'
 *   },
 * });
 */
export function useInternalTransactionsRpcQuery(baseOptions: Apollo.QueryHookOptions<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables> & ({ variables: InternalTransactionsRpcQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>(InternalTransactionsRpcDocument, options);
      }
export function useInternalTransactionsRpcLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>(InternalTransactionsRpcDocument, options);
        }
export function useInternalTransactionsRpcSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>(InternalTransactionsRpcDocument, options);
        }
export type InternalTransactionsRpcQueryHookResult = ReturnType<typeof useInternalTransactionsRpcQuery>;
export type InternalTransactionsRpcLazyQueryHookResult = ReturnType<typeof useInternalTransactionsRpcLazyQuery>;
export type InternalTransactionsRpcSuspenseQueryHookResult = ReturnType<typeof useInternalTransactionsRpcSuspenseQuery>;
export type InternalTransactionsRpcQueryResult = Apollo.QueryResult<InternalTransactionsRpcQuery, InternalTransactionsRpcQueryVariables>;
export const RpcProxyMetricsDocument = gql`
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
    `;

/**
 * __useRpcProxyMetricsQuery__
 *
 * To run a query within a React component, call `useRpcProxyMetricsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRpcProxyMetricsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRpcProxyMetricsQuery({
 *   variables: {
 *   },
 * });
 */
export function useRpcProxyMetricsQuery(baseOptions?: Apollo.QueryHookOptions<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>(RpcProxyMetricsDocument, options);
      }
export function useRpcProxyMetricsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>(RpcProxyMetricsDocument, options);
        }
export function useRpcProxyMetricsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>(RpcProxyMetricsDocument, options);
        }
export type RpcProxyMetricsQueryHookResult = ReturnType<typeof useRpcProxyMetricsQuery>;
export type RpcProxyMetricsLazyQueryHookResult = ReturnType<typeof useRpcProxyMetricsLazyQuery>;
export type RpcProxyMetricsSuspenseQueryHookResult = ReturnType<typeof useRpcProxyMetricsSuspenseQuery>;
export type RpcProxyMetricsQueryResult = Apollo.QueryResult<RpcProxyMetricsQuery, RpcProxyMetricsQueryVariables>;
export const SearchDocument = gql`
    query Search($query: String!, $types: [String], $limit: Int = 10) {
  search(query: $query, types: $types, limit: $limit) {
    type
    value
    label
    metadata
  }
}
    `;

/**
 * __useSearchQuery__
 *
 * To run a query within a React component, call `useSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchQuery({
 *   variables: {
 *      query: // value for 'query'
 *      types: // value for 'types'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchQuery(baseOptions: Apollo.QueryHookOptions<SearchQuery, SearchQueryVariables> & ({ variables: SearchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchQuery, SearchQueryVariables>(SearchDocument, options);
      }
export function useSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchQuery, SearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument, options);
        }
export function useSearchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchQuery, SearchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchQuery, SearchQueryVariables>(SearchDocument, options);
        }
export type SearchQueryHookResult = ReturnType<typeof useSearchQuery>;
export type SearchLazyQueryHookResult = ReturnType<typeof useSearchLazyQuery>;
export type SearchSuspenseQueryHookResult = ReturnType<typeof useSearchSuspenseQuery>;
export type SearchQueryResult = Apollo.QueryResult<SearchQuery, SearchQueryVariables>;
export const SearchAutocompleteDocument = gql`
    query SearchAutocomplete($query: String!, $limit: Int = 5) {
  search(query: $query, limit: $limit) {
    type
    value
    label
    metadata
  }
}
    `;

/**
 * __useSearchAutocompleteQuery__
 *
 * To run a query within a React component, call `useSearchAutocompleteQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchAutocompleteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchAutocompleteQuery({
 *   variables: {
 *      query: // value for 'query'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchAutocompleteQuery(baseOptions: Apollo.QueryHookOptions<SearchAutocompleteQuery, SearchAutocompleteQueryVariables> & ({ variables: SearchAutocompleteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>(SearchAutocompleteDocument, options);
      }
export function useSearchAutocompleteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>(SearchAutocompleteDocument, options);
        }
export function useSearchAutocompleteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>(SearchAutocompleteDocument, options);
        }
export type SearchAutocompleteQueryHookResult = ReturnType<typeof useSearchAutocompleteQuery>;
export type SearchAutocompleteLazyQueryHookResult = ReturnType<typeof useSearchAutocompleteLazyQuery>;
export type SearchAutocompleteSuspenseQueryHookResult = ReturnType<typeof useSearchAutocompleteSuspenseQuery>;
export type SearchAutocompleteQueryResult = Apollo.QueryResult<SearchAutocompleteQuery, SearchAutocompleteQueryVariables>;
export const GetTopMinersDocument = gql`
    query GetTopMiners($limit: Int, $fromBlock: String, $toBlock: String) {
  topMiners(limit: $limit, fromBlock: $fromBlock, toBlock: $toBlock) {
    address
    blockCount
    percentage
    totalRewards
    lastBlockNumber
    lastBlockTime
  }
}
    `;

/**
 * __useGetTopMinersQuery__
 *
 * To run a query within a React component, call `useGetTopMinersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopMinersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopMinersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetTopMinersQuery(baseOptions?: Apollo.QueryHookOptions<GetTopMinersQuery, GetTopMinersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTopMinersQuery, GetTopMinersQueryVariables>(GetTopMinersDocument, options);
      }
export function useGetTopMinersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopMinersQuery, GetTopMinersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTopMinersQuery, GetTopMinersQueryVariables>(GetTopMinersDocument, options);
        }
export function useGetTopMinersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTopMinersQuery, GetTopMinersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTopMinersQuery, GetTopMinersQueryVariables>(GetTopMinersDocument, options);
        }
export type GetTopMinersQueryHookResult = ReturnType<typeof useGetTopMinersQuery>;
export type GetTopMinersLazyQueryHookResult = ReturnType<typeof useGetTopMinersLazyQuery>;
export type GetTopMinersSuspenseQueryHookResult = ReturnType<typeof useGetTopMinersSuspenseQuery>;
export type GetTopMinersQueryResult = Apollo.QueryResult<GetTopMinersQuery, GetTopMinersQueryVariables>;
export const GetNetworkStatsDocument = gql`
    query GetNetworkStats {
  networkStats {
    latestBlock
    totalTransactions
    totalAddresses
    avgBlockTime
    hashRate
  }
}
    `;

/**
 * __useGetNetworkStatsQuery__
 *
 * To run a query within a React component, call `useGetNetworkStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNetworkStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNetworkStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetNetworkStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>(GetNetworkStatsDocument, options);
      }
export function useGetNetworkStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>(GetNetworkStatsDocument, options);
        }
export function useGetNetworkStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>(GetNetworkStatsDocument, options);
        }
export type GetNetworkStatsQueryHookResult = ReturnType<typeof useGetNetworkStatsQuery>;
export type GetNetworkStatsLazyQueryHookResult = ReturnType<typeof useGetNetworkStatsLazyQuery>;
export type GetNetworkStatsSuspenseQueryHookResult = ReturnType<typeof useGetNetworkStatsSuspenseQuery>;
export type GetNetworkStatsQueryResult = Apollo.QueryResult<GetNetworkStatsQuery, GetNetworkStatsQueryVariables>;
export const GetTotalSupplyDocument = gql`
    query GetTotalSupply {
  totalSupply
}
    `;

/**
 * __useGetTotalSupplyQuery__
 *
 * To run a query within a React component, call `useGetTotalSupplyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTotalSupplyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTotalSupplyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTotalSupplyQuery(baseOptions?: Apollo.QueryHookOptions<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>(GetTotalSupplyDocument, options);
      }
export function useGetTotalSupplyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>(GetTotalSupplyDocument, options);
        }
export function useGetTotalSupplySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>(GetTotalSupplyDocument, options);
        }
export type GetTotalSupplyQueryHookResult = ReturnType<typeof useGetTotalSupplyQuery>;
export type GetTotalSupplyLazyQueryHookResult = ReturnType<typeof useGetTotalSupplyLazyQuery>;
export type GetTotalSupplySuspenseQueryHookResult = ReturnType<typeof useGetTotalSupplySuspenseQuery>;
export type GetTotalSupplyQueryResult = Apollo.QueryResult<GetTotalSupplyQuery, GetTotalSupplyQueryVariables>;
export const GetActiveMintersDocument = gql`
    query GetActiveMinters {
  activeMinters {
    address
    allowance
    isActive
  }
}
    `;

/**
 * __useGetActiveMintersQuery__
 *
 * To run a query within a React component, call `useGetActiveMintersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveMintersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveMintersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveMintersQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveMintersQuery, GetActiveMintersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveMintersQuery, GetActiveMintersQueryVariables>(GetActiveMintersDocument, options);
      }
export function useGetActiveMintersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveMintersQuery, GetActiveMintersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveMintersQuery, GetActiveMintersQueryVariables>(GetActiveMintersDocument, options);
        }
export function useGetActiveMintersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveMintersQuery, GetActiveMintersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveMintersQuery, GetActiveMintersQueryVariables>(GetActiveMintersDocument, options);
        }
export type GetActiveMintersQueryHookResult = ReturnType<typeof useGetActiveMintersQuery>;
export type GetActiveMintersLazyQueryHookResult = ReturnType<typeof useGetActiveMintersLazyQuery>;
export type GetActiveMintersSuspenseQueryHookResult = ReturnType<typeof useGetActiveMintersSuspenseQuery>;
export type GetActiveMintersQueryResult = Apollo.QueryResult<GetActiveMintersQuery, GetActiveMintersQueryVariables>;
export const GetMinterAllowanceDocument = gql`
    query GetMinterAllowance($minter: Address!) {
  minterAllowance(minter: $minter)
}
    `;

/**
 * __useGetMinterAllowanceQuery__
 *
 * To run a query within a React component, call `useGetMinterAllowanceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMinterAllowanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMinterAllowanceQuery({
 *   variables: {
 *      minter: // value for 'minter'
 *   },
 * });
 */
export function useGetMinterAllowanceQuery(baseOptions: Apollo.QueryHookOptions<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables> & ({ variables: GetMinterAllowanceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>(GetMinterAllowanceDocument, options);
      }
export function useGetMinterAllowanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>(GetMinterAllowanceDocument, options);
        }
export function useGetMinterAllowanceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>(GetMinterAllowanceDocument, options);
        }
export type GetMinterAllowanceQueryHookResult = ReturnType<typeof useGetMinterAllowanceQuery>;
export type GetMinterAllowanceLazyQueryHookResult = ReturnType<typeof useGetMinterAllowanceLazyQuery>;
export type GetMinterAllowanceSuspenseQueryHookResult = ReturnType<typeof useGetMinterAllowanceSuspenseQuery>;
export type GetMinterAllowanceQueryResult = Apollo.QueryResult<GetMinterAllowanceQuery, GetMinterAllowanceQueryVariables>;
export const GetMintEventsDocument = gql`
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
    `;

/**
 * __useGetMintEventsQuery__
 *
 * To run a query within a React component, call `useGetMintEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMintEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMintEventsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetMintEventsQuery(baseOptions: Apollo.QueryHookOptions<GetMintEventsQuery, GetMintEventsQueryVariables> & ({ variables: GetMintEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMintEventsQuery, GetMintEventsQueryVariables>(GetMintEventsDocument, options);
      }
export function useGetMintEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMintEventsQuery, GetMintEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMintEventsQuery, GetMintEventsQueryVariables>(GetMintEventsDocument, options);
        }
export function useGetMintEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMintEventsQuery, GetMintEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMintEventsQuery, GetMintEventsQueryVariables>(GetMintEventsDocument, options);
        }
export type GetMintEventsQueryHookResult = ReturnType<typeof useGetMintEventsQuery>;
export type GetMintEventsLazyQueryHookResult = ReturnType<typeof useGetMintEventsLazyQuery>;
export type GetMintEventsSuspenseQueryHookResult = ReturnType<typeof useGetMintEventsSuspenseQuery>;
export type GetMintEventsQueryResult = Apollo.QueryResult<GetMintEventsQuery, GetMintEventsQueryVariables>;
export const GetBurnEventsDocument = gql`
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
    `;

/**
 * __useGetBurnEventsQuery__
 *
 * To run a query within a React component, call `useGetBurnEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBurnEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBurnEventsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetBurnEventsQuery(baseOptions: Apollo.QueryHookOptions<GetBurnEventsQuery, GetBurnEventsQueryVariables> & ({ variables: GetBurnEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBurnEventsQuery, GetBurnEventsQueryVariables>(GetBurnEventsDocument, options);
      }
export function useGetBurnEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBurnEventsQuery, GetBurnEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBurnEventsQuery, GetBurnEventsQueryVariables>(GetBurnEventsDocument, options);
        }
export function useGetBurnEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBurnEventsQuery, GetBurnEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBurnEventsQuery, GetBurnEventsQueryVariables>(GetBurnEventsDocument, options);
        }
export type GetBurnEventsQueryHookResult = ReturnType<typeof useGetBurnEventsQuery>;
export type GetBurnEventsLazyQueryHookResult = ReturnType<typeof useGetBurnEventsLazyQuery>;
export type GetBurnEventsSuspenseQueryHookResult = ReturnType<typeof useGetBurnEventsSuspenseQuery>;
export type GetBurnEventsQueryResult = Apollo.QueryResult<GetBurnEventsQuery, GetBurnEventsQueryVariables>;
export const GetProposalsDocument = gql`
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
    `;

/**
 * __useGetProposalsQuery__
 *
 * To run a query within a React component, call `useGetProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetProposalsQuery(baseOptions: Apollo.QueryHookOptions<GetProposalsQuery, GetProposalsQueryVariables> & ({ variables: GetProposalsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalsQuery, GetProposalsQueryVariables>(GetProposalsDocument, options);
      }
export function useGetProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalsQuery, GetProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalsQuery, GetProposalsQueryVariables>(GetProposalsDocument, options);
        }
export function useGetProposalsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalsQuery, GetProposalsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalsQuery, GetProposalsQueryVariables>(GetProposalsDocument, options);
        }
export type GetProposalsQueryHookResult = ReturnType<typeof useGetProposalsQuery>;
export type GetProposalsLazyQueryHookResult = ReturnType<typeof useGetProposalsLazyQuery>;
export type GetProposalsSuspenseQueryHookResult = ReturnType<typeof useGetProposalsSuspenseQuery>;
export type GetProposalsQueryResult = Apollo.QueryResult<GetProposalsQuery, GetProposalsQueryVariables>;
export const GetProposalDocument = gql`
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
    `;

/**
 * __useGetProposalQuery__
 *
 * To run a query within a React component, call `useGetProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useGetProposalQuery(baseOptions: Apollo.QueryHookOptions<GetProposalQuery, GetProposalQueryVariables> & ({ variables: GetProposalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalQuery, GetProposalQueryVariables>(GetProposalDocument, options);
      }
export function useGetProposalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalQuery, GetProposalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalQuery, GetProposalQueryVariables>(GetProposalDocument, options);
        }
export function useGetProposalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalQuery, GetProposalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalQuery, GetProposalQueryVariables>(GetProposalDocument, options);
        }
export type GetProposalQueryHookResult = ReturnType<typeof useGetProposalQuery>;
export type GetProposalLazyQueryHookResult = ReturnType<typeof useGetProposalLazyQuery>;
export type GetProposalSuspenseQueryHookResult = ReturnType<typeof useGetProposalSuspenseQuery>;
export type GetProposalQueryResult = Apollo.QueryResult<GetProposalQuery, GetProposalQueryVariables>;
export const GetProposalVotesDocument = gql`
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
    `;

/**
 * __useGetProposalVotesQuery__
 *
 * To run a query within a React component, call `useGetProposalVotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalVotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalVotesQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useGetProposalVotesQuery(baseOptions: Apollo.QueryHookOptions<GetProposalVotesQuery, GetProposalVotesQueryVariables> & ({ variables: GetProposalVotesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalVotesQuery, GetProposalVotesQueryVariables>(GetProposalVotesDocument, options);
      }
export function useGetProposalVotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalVotesQuery, GetProposalVotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalVotesQuery, GetProposalVotesQueryVariables>(GetProposalVotesDocument, options);
        }
export function useGetProposalVotesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalVotesQuery, GetProposalVotesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalVotesQuery, GetProposalVotesQueryVariables>(GetProposalVotesDocument, options);
        }
export type GetProposalVotesQueryHookResult = ReturnType<typeof useGetProposalVotesQuery>;
export type GetProposalVotesLazyQueryHookResult = ReturnType<typeof useGetProposalVotesLazyQuery>;
export type GetProposalVotesSuspenseQueryHookResult = ReturnType<typeof useGetProposalVotesSuspenseQuery>;
export type GetProposalVotesQueryResult = Apollo.QueryResult<GetProposalVotesQuery, GetProposalVotesQueryVariables>;
export const GetActiveValidatorsDocument = gql`
    query GetActiveValidators {
  activeValidators {
    address
    isActive
  }
}
    `;

/**
 * __useGetActiveValidatorsQuery__
 *
 * To run a query within a React component, call `useGetActiveValidatorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveValidatorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveValidatorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveValidatorsQuery(baseOptions?: Apollo.QueryHookOptions<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>(GetActiveValidatorsDocument, options);
      }
export function useGetActiveValidatorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>(GetActiveValidatorsDocument, options);
        }
export function useGetActiveValidatorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>(GetActiveValidatorsDocument, options);
        }
export type GetActiveValidatorsQueryHookResult = ReturnType<typeof useGetActiveValidatorsQuery>;
export type GetActiveValidatorsLazyQueryHookResult = ReturnType<typeof useGetActiveValidatorsLazyQuery>;
export type GetActiveValidatorsSuspenseQueryHookResult = ReturnType<typeof useGetActiveValidatorsSuspenseQuery>;
export type GetActiveValidatorsQueryResult = Apollo.QueryResult<GetActiveValidatorsQuery, GetActiveValidatorsQueryVariables>;
export const GetBlacklistedAddressesDocument = gql`
    query GetBlacklistedAddresses {
  blacklistedAddresses
}
    `;

/**
 * __useGetBlacklistedAddressesQuery__
 *
 * To run a query within a React component, call `useGetBlacklistedAddressesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlacklistedAddressesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlacklistedAddressesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBlacklistedAddressesQuery(baseOptions?: Apollo.QueryHookOptions<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>(GetBlacklistedAddressesDocument, options);
      }
export function useGetBlacklistedAddressesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>(GetBlacklistedAddressesDocument, options);
        }
export function useGetBlacklistedAddressesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>(GetBlacklistedAddressesDocument, options);
        }
export type GetBlacklistedAddressesQueryHookResult = ReturnType<typeof useGetBlacklistedAddressesQuery>;
export type GetBlacklistedAddressesLazyQueryHookResult = ReturnType<typeof useGetBlacklistedAddressesLazyQuery>;
export type GetBlacklistedAddressesSuspenseQueryHookResult = ReturnType<typeof useGetBlacklistedAddressesSuspenseQuery>;
export type GetBlacklistedAddressesQueryResult = Apollo.QueryResult<GetBlacklistedAddressesQuery, GetBlacklistedAddressesQueryVariables>;
export const GetDepositMintProposalsDocument = gql`
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
    `;

/**
 * __useGetDepositMintProposalsQuery__
 *
 * To run a query within a React component, call `useGetDepositMintProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDepositMintProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDepositMintProposalsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetDepositMintProposalsQuery(baseOptions: Apollo.QueryHookOptions<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables> & ({ variables: GetDepositMintProposalsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>(GetDepositMintProposalsDocument, options);
      }
export function useGetDepositMintProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>(GetDepositMintProposalsDocument, options);
        }
export function useGetDepositMintProposalsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>(GetDepositMintProposalsDocument, options);
        }
export type GetDepositMintProposalsQueryHookResult = ReturnType<typeof useGetDepositMintProposalsQuery>;
export type GetDepositMintProposalsLazyQueryHookResult = ReturnType<typeof useGetDepositMintProposalsLazyQuery>;
export type GetDepositMintProposalsSuspenseQueryHookResult = ReturnType<typeof useGetDepositMintProposalsSuspenseQuery>;
export type GetDepositMintProposalsQueryResult = Apollo.QueryResult<GetDepositMintProposalsQuery, GetDepositMintProposalsQueryVariables>;
export const GetMaxProposalsUpdateHistoryDocument = gql`
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
    `;

/**
 * __useGetMaxProposalsUpdateHistoryQuery__
 *
 * To run a query within a React component, call `useGetMaxProposalsUpdateHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaxProposalsUpdateHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaxProposalsUpdateHistoryQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *   },
 * });
 */
export function useGetMaxProposalsUpdateHistoryQuery(baseOptions: Apollo.QueryHookOptions<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables> & ({ variables: GetMaxProposalsUpdateHistoryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>(GetMaxProposalsUpdateHistoryDocument, options);
      }
export function useGetMaxProposalsUpdateHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>(GetMaxProposalsUpdateHistoryDocument, options);
        }
export function useGetMaxProposalsUpdateHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>(GetMaxProposalsUpdateHistoryDocument, options);
        }
export type GetMaxProposalsUpdateHistoryQueryHookResult = ReturnType<typeof useGetMaxProposalsUpdateHistoryQuery>;
export type GetMaxProposalsUpdateHistoryLazyQueryHookResult = ReturnType<typeof useGetMaxProposalsUpdateHistoryLazyQuery>;
export type GetMaxProposalsUpdateHistorySuspenseQueryHookResult = ReturnType<typeof useGetMaxProposalsUpdateHistorySuspenseQuery>;
export type GetMaxProposalsUpdateHistoryQueryResult = Apollo.QueryResult<GetMaxProposalsUpdateHistoryQuery, GetMaxProposalsUpdateHistoryQueryVariables>;
export const GetProposalExecutionSkippedEventsDocument = gql`
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
    `;

/**
 * __useGetProposalExecutionSkippedEventsQuery__
 *
 * To run a query within a React component, call `useGetProposalExecutionSkippedEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalExecutionSkippedEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalExecutionSkippedEventsQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useGetProposalExecutionSkippedEventsQuery(baseOptions: Apollo.QueryHookOptions<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables> & ({ variables: GetProposalExecutionSkippedEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>(GetProposalExecutionSkippedEventsDocument, options);
      }
export function useGetProposalExecutionSkippedEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>(GetProposalExecutionSkippedEventsDocument, options);
        }
export function useGetProposalExecutionSkippedEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>(GetProposalExecutionSkippedEventsDocument, options);
        }
export type GetProposalExecutionSkippedEventsQueryHookResult = ReturnType<typeof useGetProposalExecutionSkippedEventsQuery>;
export type GetProposalExecutionSkippedEventsLazyQueryHookResult = ReturnType<typeof useGetProposalExecutionSkippedEventsLazyQuery>;
export type GetProposalExecutionSkippedEventsSuspenseQueryHookResult = ReturnType<typeof useGetProposalExecutionSkippedEventsSuspenseQuery>;
export type GetProposalExecutionSkippedEventsQueryResult = Apollo.QueryResult<GetProposalExecutionSkippedEventsQuery, GetProposalExecutionSkippedEventsQueryVariables>;
export const SystemContractEventsDocument = gql`
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
    `;

/**
 * __useSystemContractEventsSubscription__
 *
 * To run a query within a React component, call `useSystemContractEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSystemContractEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSystemContractEventsSubscription({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useSystemContractEventsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SystemContractEventsSubscription, SystemContractEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SystemContractEventsSubscription, SystemContractEventsSubscriptionVariables>(SystemContractEventsDocument, options);
      }
export type SystemContractEventsSubscriptionHookResult = ReturnType<typeof useSystemContractEventsSubscription>;
export type SystemContractEventsSubscriptionResult = Apollo.SubscriptionResult<SystemContractEventsSubscription>;
export const RegisterContractDocument = gql`
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
    `;
export type RegisterContractMutationFn = Apollo.MutationFunction<RegisterContractMutation, RegisterContractMutationVariables>;

/**
 * __useRegisterContractMutation__
 *
 * To run a mutation, you first call `useRegisterContractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterContractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerContractMutation, { data, loading, error }] = useRegisterContractMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterContractMutation(baseOptions?: Apollo.MutationHookOptions<RegisterContractMutation, RegisterContractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterContractMutation, RegisterContractMutationVariables>(RegisterContractDocument, options);
      }
export type RegisterContractMutationHookResult = ReturnType<typeof useRegisterContractMutation>;
export type RegisterContractMutationResult = Apollo.MutationResult<RegisterContractMutation>;
export type RegisterContractMutationOptions = Apollo.BaseMutationOptions<RegisterContractMutation, RegisterContractMutationVariables>;
export const UnregisterContractDocument = gql`
    mutation UnregisterContract($address: Address!) {
  unregisterContract(address: $address)
}
    `;
export type UnregisterContractMutationFn = Apollo.MutationFunction<UnregisterContractMutation, UnregisterContractMutationVariables>;

/**
 * __useUnregisterContractMutation__
 *
 * To run a mutation, you first call `useUnregisterContractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnregisterContractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unregisterContractMutation, { data, loading, error }] = useUnregisterContractMutation({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useUnregisterContractMutation(baseOptions?: Apollo.MutationHookOptions<UnregisterContractMutation, UnregisterContractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnregisterContractMutation, UnregisterContractMutationVariables>(UnregisterContractDocument, options);
      }
export type UnregisterContractMutationHookResult = ReturnType<typeof useUnregisterContractMutation>;
export type UnregisterContractMutationResult = Apollo.MutationResult<UnregisterContractMutation>;
export type UnregisterContractMutationOptions = Apollo.BaseMutationOptions<UnregisterContractMutation, UnregisterContractMutationVariables>;
export const GetRegisteredContractsDocument = gql`
    query GetRegisteredContracts {
  registeredContracts {
    address
    name
    events
    isVerified
    registeredAt
  }
}
    `;

/**
 * __useGetRegisteredContractsQuery__
 *
 * To run a query within a React component, call `useGetRegisteredContractsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegisteredContractsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegisteredContractsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRegisteredContractsQuery(baseOptions?: Apollo.QueryHookOptions<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>(GetRegisteredContractsDocument, options);
      }
export function useGetRegisteredContractsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>(GetRegisteredContractsDocument, options);
        }
export function useGetRegisteredContractsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>(GetRegisteredContractsDocument, options);
        }
export type GetRegisteredContractsQueryHookResult = ReturnType<typeof useGetRegisteredContractsQuery>;
export type GetRegisteredContractsLazyQueryHookResult = ReturnType<typeof useGetRegisteredContractsLazyQuery>;
export type GetRegisteredContractsSuspenseQueryHookResult = ReturnType<typeof useGetRegisteredContractsSuspenseQuery>;
export type GetRegisteredContractsQueryResult = Apollo.QueryResult<GetRegisteredContractsQuery, GetRegisteredContractsQueryVariables>;
export const GetRegisteredContractDocument = gql`
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
    `;

/**
 * __useGetRegisteredContractQuery__
 *
 * To run a query within a React component, call `useGetRegisteredContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegisteredContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegisteredContractQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetRegisteredContractQuery(baseOptions: Apollo.QueryHookOptions<GetRegisteredContractQuery, GetRegisteredContractQueryVariables> & ({ variables: GetRegisteredContractQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>(GetRegisteredContractDocument, options);
      }
export function useGetRegisteredContractLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>(GetRegisteredContractDocument, options);
        }
export function useGetRegisteredContractSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>(GetRegisteredContractDocument, options);
        }
export type GetRegisteredContractQueryHookResult = ReturnType<typeof useGetRegisteredContractQuery>;
export type GetRegisteredContractLazyQueryHookResult = ReturnType<typeof useGetRegisteredContractLazyQuery>;
export type GetRegisteredContractSuspenseQueryHookResult = ReturnType<typeof useGetRegisteredContractSuspenseQuery>;
export type GetRegisteredContractQueryResult = Apollo.QueryResult<GetRegisteredContractQuery, GetRegisteredContractQueryVariables>;
export const DynamicContractEventsDocument = gql`
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
    `;

/**
 * __useDynamicContractEventsSubscription__
 *
 * To run a query within a React component, call `useDynamicContractEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useDynamicContractEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDynamicContractEventsSubscription({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useDynamicContractEventsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<DynamicContractEventsSubscription, DynamicContractEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<DynamicContractEventsSubscription, DynamicContractEventsSubscriptionVariables>(DynamicContractEventsDocument, options);
      }
export type DynamicContractEventsSubscriptionHookResult = ReturnType<typeof useDynamicContractEventsSubscription>;
export type DynamicContractEventsSubscriptionResult = Apollo.SubscriptionResult<DynamicContractEventsSubscription>;
export const OnNewBlockDocument = gql`
    subscription OnNewBlock {
  newBlock {
    number
    hash
    parentHash
    timestamp
    miner
    gasLimit
    gasUsed
    difficulty
    totalDifficulty
    size
    transactionCount
    baseFeePerGas
    withdrawalsRoot
    blobGasUsed
    excessBlobGas
  }
}
    `;

/**
 * __useOnNewBlockSubscription__
 *
 * To run a query within a React component, call `useOnNewBlockSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnNewBlockSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnNewBlockSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnNewBlockSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnNewBlockSubscription, OnNewBlockSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnNewBlockSubscription, OnNewBlockSubscriptionVariables>(OnNewBlockDocument, options);
      }
export type OnNewBlockSubscriptionHookResult = ReturnType<typeof useOnNewBlockSubscription>;
export type OnNewBlockSubscriptionResult = Apollo.SubscriptionResult<OnNewBlockSubscription>;
export const OnNewTransactionDocument = gql`
    subscription OnNewTransaction($replayLast: Int) {
  newTransaction(replayLast: $replayLast) {
    hash
    from
    to
    value
    nonce
    gas
    gasPrice
    input
    type
    blockNumber
    blockHash
    transactionIndex
    maxFeePerGas
    maxPriorityFeePerGas
    feePayer
  }
}
    `;

/**
 * __useOnNewTransactionSubscription__
 *
 * To run a query within a React component, call `useOnNewTransactionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnNewTransactionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnNewTransactionSubscription({
 *   variables: {
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnNewTransactionSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnNewTransactionSubscription, OnNewTransactionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnNewTransactionSubscription, OnNewTransactionSubscriptionVariables>(OnNewTransactionDocument, options);
      }
export type OnNewTransactionSubscriptionHookResult = ReturnType<typeof useOnNewTransactionSubscription>;
export type OnNewTransactionSubscriptionResult = Apollo.SubscriptionResult<OnNewTransactionSubscription>;
export const OnNewPendingTransactionsDocument = gql`
    subscription OnNewPendingTransactions($limit: Int) {
  newPendingTransactions(limit: $limit) {
    hash
    from
    to
    value
    nonce
    gas
    gasPrice
    input
    type
    maxFeePerGas
    maxPriorityFeePerGas
    feePayer
  }
}
    `;

/**
 * __useOnNewPendingTransactionsSubscription__
 *
 * To run a query within a React component, call `useOnNewPendingTransactionsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnNewPendingTransactionsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnNewPendingTransactionsSubscription({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useOnNewPendingTransactionsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnNewPendingTransactionsSubscription, OnNewPendingTransactionsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnNewPendingTransactionsSubscription, OnNewPendingTransactionsSubscriptionVariables>(OnNewPendingTransactionsDocument, options);
      }
export type OnNewPendingTransactionsSubscriptionHookResult = ReturnType<typeof useOnNewPendingTransactionsSubscription>;
export type OnNewPendingTransactionsSubscriptionResult = Apollo.SubscriptionResult<OnNewPendingTransactionsSubscription>;
export const OnLogsDocument = gql`
    subscription OnLogs($filter: LogFilter!, $replayLast: Int) {
  logs(filter: $filter, replayLast: $replayLast) {
    address
    topics
    data
    blockNumber
    transactionHash
    transactionIndex
    logIndex
    removed
  }
}
    `;

/**
 * __useOnLogsSubscription__
 *
 * To run a query within a React component, call `useOnLogsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnLogsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnLogsSubscription({
 *   variables: {
 *      filter: // value for 'filter'
 *      replayLast: // value for 'replayLast'
 *   },
 * });
 */
export function useOnLogsSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnLogsSubscription, OnLogsSubscriptionVariables> & ({ variables: OnLogsSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnLogsSubscription, OnLogsSubscriptionVariables>(OnLogsDocument, options);
      }
export type OnLogsSubscriptionHookResult = ReturnType<typeof useOnLogsSubscription>;
export type OnLogsSubscriptionResult = Apollo.SubscriptionResult<OnLogsSubscription>;
export const OnLogsByAddressDocument = gql`
    subscription OnLogsByAddress($address: Address!) {
  logs(filter: {address: $address}) {
    address
    topics
    data
    blockNumber
    transactionHash
    transactionIndex
    logIndex
    removed
  }
}
    `;

/**
 * __useOnLogsByAddressSubscription__
 *
 * To run a query within a React component, call `useOnLogsByAddressSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnLogsByAddressSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnLogsByAddressSubscription({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useOnLogsByAddressSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnLogsByAddressSubscription, OnLogsByAddressSubscriptionVariables> & ({ variables: OnLogsByAddressSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnLogsByAddressSubscription, OnLogsByAddressSubscriptionVariables>(OnLogsByAddressDocument, options);
      }
export type OnLogsByAddressSubscriptionHookResult = ReturnType<typeof useOnLogsByAddressSubscription>;
export type OnLogsByAddressSubscriptionResult = Apollo.SubscriptionResult<OnLogsByAddressSubscription>;
export const OnLogsByTopicsDocument = gql`
    subscription OnLogsByTopics($topics: [Hash!]) {
  logs(filter: {topics: $topics}) {
    address
    topics
    data
    blockNumber
    transactionHash
    transactionIndex
    logIndex
    removed
  }
}
    `;

/**
 * __useOnLogsByTopicsSubscription__
 *
 * To run a query within a React component, call `useOnLogsByTopicsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnLogsByTopicsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnLogsByTopicsSubscription({
 *   variables: {
 *      topics: // value for 'topics'
 *   },
 * });
 */
export function useOnLogsByTopicsSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnLogsByTopicsSubscription, OnLogsByTopicsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnLogsByTopicsSubscription, OnLogsByTopicsSubscriptionVariables>(OnLogsByTopicsDocument, options);
      }
export type OnLogsByTopicsSubscriptionHookResult = ReturnType<typeof useOnLogsByTopicsSubscription>;
export type OnLogsByTopicsSubscriptionResult = Apollo.SubscriptionResult<OnLogsByTopicsSubscription>;
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
export const GetMinterHistoryLocalDocument = gql`
    query GetMinterHistoryLocal($minter: Address!) {
  minterHistory(minter: $minter) {
    blockNumber
    transactionHash
    minter
    allowance
    action
    timestamp
  }
}
    `;

/**
 * __useGetMinterHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetMinterHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMinterHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMinterHistoryLocalQuery({
 *   variables: {
 *      minter: // value for 'minter'
 *   },
 * });
 */
export function useGetMinterHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables> & ({ variables: GetMinterHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>(GetMinterHistoryLocalDocument, options);
      }
export function useGetMinterHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>(GetMinterHistoryLocalDocument, options);
        }
export function useGetMinterHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>(GetMinterHistoryLocalDocument, options);
        }
export type GetMinterHistoryLocalQueryHookResult = ReturnType<typeof useGetMinterHistoryLocalQuery>;
export type GetMinterHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetMinterHistoryLocalLazyQuery>;
export type GetMinterHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetMinterHistoryLocalSuspenseQuery>;
export type GetMinterHistoryLocalQueryResult = Apollo.QueryResult<GetMinterHistoryLocalQuery, GetMinterHistoryLocalQueryVariables>;
export const GetGasTipHistoryLocalDocument = gql`
    query GetGasTipHistoryLocal($fromBlock: BigInt!, $toBlock: BigInt!) {
  gasTipHistory(filter: {fromBlock: $fromBlock, toBlock: $toBlock}) {
    blockNumber
    transactionHash
    oldTip
    newTip
    updater
    timestamp
  }
}
    `;

/**
 * __useGetGasTipHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetGasTipHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGasTipHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGasTipHistoryLocalQuery({
 *   variables: {
 *      fromBlock: // value for 'fromBlock'
 *      toBlock: // value for 'toBlock'
 *   },
 * });
 */
export function useGetGasTipHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables> & ({ variables: GetGasTipHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>(GetGasTipHistoryLocalDocument, options);
      }
export function useGetGasTipHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>(GetGasTipHistoryLocalDocument, options);
        }
export function useGetGasTipHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>(GetGasTipHistoryLocalDocument, options);
        }
export type GetGasTipHistoryLocalQueryHookResult = ReturnType<typeof useGetGasTipHistoryLocalQuery>;
export type GetGasTipHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetGasTipHistoryLocalLazyQuery>;
export type GetGasTipHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetGasTipHistoryLocalSuspenseQuery>;
export type GetGasTipHistoryLocalQueryResult = Apollo.QueryResult<GetGasTipHistoryLocalQuery, GetGasTipHistoryLocalQueryVariables>;
export const GetValidatorHistoryLocalDocument = gql`
    query GetValidatorHistoryLocal($validator: Address!) {
  validatorHistory(validator: $validator) {
    blockNumber
    transactionHash
    validator
    action
    oldValidator
    timestamp
  }
}
    `;

/**
 * __useGetValidatorHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetValidatorHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidatorHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidatorHistoryLocalQuery({
 *   variables: {
 *      validator: // value for 'validator'
 *   },
 * });
 */
export function useGetValidatorHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables> & ({ variables: GetValidatorHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>(GetValidatorHistoryLocalDocument, options);
      }
export function useGetValidatorHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>(GetValidatorHistoryLocalDocument, options);
        }
export function useGetValidatorHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>(GetValidatorHistoryLocalDocument, options);
        }
export type GetValidatorHistoryLocalQueryHookResult = ReturnType<typeof useGetValidatorHistoryLocalQuery>;
export type GetValidatorHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetValidatorHistoryLocalLazyQuery>;
export type GetValidatorHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetValidatorHistoryLocalSuspenseQuery>;
export type GetValidatorHistoryLocalQueryResult = Apollo.QueryResult<GetValidatorHistoryLocalQuery, GetValidatorHistoryLocalQueryVariables>;
export const GetEmergencyPauseHistoryLocalDocument = gql`
    query GetEmergencyPauseHistoryLocal($contract: Address!) {
  emergencyPauseHistory(contract: $contract) {
    contract
    blockNumber
    transactionHash
    proposalId
    action
    timestamp
  }
}
    `;

/**
 * __useGetEmergencyPauseHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetEmergencyPauseHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmergencyPauseHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmergencyPauseHistoryLocalQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *   },
 * });
 */
export function useGetEmergencyPauseHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables> & ({ variables: GetEmergencyPauseHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>(GetEmergencyPauseHistoryLocalDocument, options);
      }
export function useGetEmergencyPauseHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>(GetEmergencyPauseHistoryLocalDocument, options);
        }
export function useGetEmergencyPauseHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>(GetEmergencyPauseHistoryLocalDocument, options);
        }
export type GetEmergencyPauseHistoryLocalQueryHookResult = ReturnType<typeof useGetEmergencyPauseHistoryLocalQuery>;
export type GetEmergencyPauseHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetEmergencyPauseHistoryLocalLazyQuery>;
export type GetEmergencyPauseHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetEmergencyPauseHistoryLocalSuspenseQuery>;
export type GetEmergencyPauseHistoryLocalQueryResult = Apollo.QueryResult<GetEmergencyPauseHistoryLocalQuery, GetEmergencyPauseHistoryLocalQueryVariables>;
export const GetBurnHistoryLocalDocument = gql`
    query GetBurnHistoryLocal($filter: SystemContractEventFilter!, $pagination: PaginationInput) {
  burnEvents(filter: $filter, pagination: $pagination) {
    nodes {
      blockNumber
      transactionHash
      burner
      amount
      withdrawalId
      timestamp
    }
    totalCount
  }
}
    `;

/**
 * __useGetBurnHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetBurnHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBurnHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBurnHistoryLocalQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetBurnHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables> & ({ variables: GetBurnHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>(GetBurnHistoryLocalDocument, options);
      }
export function useGetBurnHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>(GetBurnHistoryLocalDocument, options);
        }
export function useGetBurnHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>(GetBurnHistoryLocalDocument, options);
        }
export type GetBurnHistoryLocalQueryHookResult = ReturnType<typeof useGetBurnHistoryLocalQuery>;
export type GetBurnHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetBurnHistoryLocalLazyQuery>;
export type GetBurnHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetBurnHistoryLocalSuspenseQuery>;
export type GetBurnHistoryLocalQueryResult = Apollo.QueryResult<GetBurnHistoryLocalQuery, GetBurnHistoryLocalQueryVariables>;
export const GetBlacklistHistoryLocalDocument = gql`
    query GetBlacklistHistoryLocal($address: Address!) {
  blacklistHistory(address: $address) {
    blockNumber
    transactionHash
    account
    action
    proposalId
    timestamp
  }
}
    `;

/**
 * __useGetBlacklistHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetBlacklistHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBlacklistHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBlacklistHistoryLocalQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetBlacklistHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables> & ({ variables: GetBlacklistHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>(GetBlacklistHistoryLocalDocument, options);
      }
export function useGetBlacklistHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>(GetBlacklistHistoryLocalDocument, options);
        }
export function useGetBlacklistHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>(GetBlacklistHistoryLocalDocument, options);
        }
export type GetBlacklistHistoryLocalQueryHookResult = ReturnType<typeof useGetBlacklistHistoryLocalQuery>;
export type GetBlacklistHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetBlacklistHistoryLocalLazyQuery>;
export type GetBlacklistHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetBlacklistHistoryLocalSuspenseQuery>;
export type GetBlacklistHistoryLocalQueryResult = Apollo.QueryResult<GetBlacklistHistoryLocalQuery, GetBlacklistHistoryLocalQueryVariables>;
export const GetProposalsLocalDocument = gql`
    query GetProposalsLocal($filter: ProposalFilter!, $pagination: PaginationInput) {
  proposals(filter: $filter, pagination: $pagination) {
    nodes {
      proposalId
      contract
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
    `;

/**
 * __useGetProposalsLocalQuery__
 *
 * To run a query within a React component, call `useGetProposalsLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalsLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalsLocalQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetProposalsLocalQuery(baseOptions: Apollo.QueryHookOptions<GetProposalsLocalQuery, GetProposalsLocalQueryVariables> & ({ variables: GetProposalsLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>(GetProposalsLocalDocument, options);
      }
export function useGetProposalsLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>(GetProposalsLocalDocument, options);
        }
export function useGetProposalsLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>(GetProposalsLocalDocument, options);
        }
export type GetProposalsLocalQueryHookResult = ReturnType<typeof useGetProposalsLocalQuery>;
export type GetProposalsLocalLazyQueryHookResult = ReturnType<typeof useGetProposalsLocalLazyQuery>;
export type GetProposalsLocalSuspenseQueryHookResult = ReturnType<typeof useGetProposalsLocalSuspenseQuery>;
export type GetProposalsLocalQueryResult = Apollo.QueryResult<GetProposalsLocalQuery, GetProposalsLocalQueryVariables>;
export const GetProposalVotesLocalDocument = gql`
    query GetProposalVotesLocal($contract: Address!, $proposalId: BigInt!) {
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
    `;

/**
 * __useGetProposalVotesLocalQuery__
 *
 * To run a query within a React component, call `useGetProposalVotesLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProposalVotesLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProposalVotesLocalQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useGetProposalVotesLocalQuery(baseOptions: Apollo.QueryHookOptions<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables> & ({ variables: GetProposalVotesLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>(GetProposalVotesLocalDocument, options);
      }
export function useGetProposalVotesLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>(GetProposalVotesLocalDocument, options);
        }
export function useGetProposalVotesLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>(GetProposalVotesLocalDocument, options);
        }
export type GetProposalVotesLocalQueryHookResult = ReturnType<typeof useGetProposalVotesLocalQuery>;
export type GetProposalVotesLocalLazyQueryHookResult = ReturnType<typeof useGetProposalVotesLocalLazyQuery>;
export type GetProposalVotesLocalSuspenseQueryHookResult = ReturnType<typeof useGetProposalVotesLocalSuspenseQuery>;
export type GetProposalVotesLocalQueryResult = Apollo.QueryResult<GetProposalVotesLocalQuery, GetProposalVotesLocalQueryVariables>;
export const GetMemberHistoryLocalDocument = gql`
    query GetMemberHistoryLocal($contract: Address!) {
  memberHistory(contract: $contract) {
    contract
    blockNumber
    transactionHash
    member
    action
    oldMember
    totalMembers
    newQuorum
    timestamp
  }
}
    `;

/**
 * __useGetMemberHistoryLocalQuery__
 *
 * To run a query within a React component, call `useGetMemberHistoryLocalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMemberHistoryLocalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMemberHistoryLocalQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *   },
 * });
 */
export function useGetMemberHistoryLocalQuery(baseOptions: Apollo.QueryHookOptions<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables> & ({ variables: GetMemberHistoryLocalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>(GetMemberHistoryLocalDocument, options);
      }
export function useGetMemberHistoryLocalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>(GetMemberHistoryLocalDocument, options);
        }
export function useGetMemberHistoryLocalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>(GetMemberHistoryLocalDocument, options);
        }
export type GetMemberHistoryLocalQueryHookResult = ReturnType<typeof useGetMemberHistoryLocalQuery>;
export type GetMemberHistoryLocalLazyQueryHookResult = ReturnType<typeof useGetMemberHistoryLocalLazyQuery>;
export type GetMemberHistoryLocalSuspenseQueryHookResult = ReturnType<typeof useGetMemberHistoryLocalSuspenseQuery>;
export type GetMemberHistoryLocalQueryResult = Apollo.QueryResult<GetMemberHistoryLocalQuery, GetMemberHistoryLocalQueryVariables>;
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