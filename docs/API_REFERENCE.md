# API Reference

> **Version**: 1.0.0
> **Base URL**: `/api/v1`
> **Last Updated**: 2025-02-04

## Overview

This document provides a complete reference for all available REST API endpoints in the Indexer Frontend API Relay.

---

## Response Format

All endpoints return JSON responses in the following format:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_ADDRESS` | 400 | Invalid Ethereum address format |
| `INVALID_HASH` | 400 | Invalid transaction/block hash format |
| `INVALID_PAGINATION` | 400 | Invalid pagination parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INDEXER_CONNECTION_ERROR` | 503 | Cannot connect to indexer backend |
| `INDEXER_QUERY_ERROR` | 500 | GraphQL query failed |

---

## Endpoints

### Stats APIs

#### GET /api/v1/stats
Returns network statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "latestBlock": 6841,
    "totalTransactions": 1000,
    "totalAddresses": 500,
    "totalContracts": 50,
    "avgBlockTime": 2,
    "tps": 10.5
  }
}
```

---

#### GET /api/v1/stats/gas
Returns current gas price estimates.

**Response:**
```json
{
  "status": "success",
  "data": {
    "slow": {
      "gasPrice": "20000000000",
      "estimatedTime": "5 min"
    },
    "standard": {
      "gasPrice": "25000000000",
      "estimatedTime": "2 min"
    },
    "fast": {
      "gasPrice": "30000000000",
      "estimatedTime": "30 sec"
    }
  }
}
```

---

### Block APIs

#### GET /api/v1/block/latest
Returns the latest block information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "number": 6841,
    "hash": "0x...",
    "parentHash": "0x...",
    "timestamp": "1770169757",
    "miner": "0x...",
    "gasUsed": "21000",
    "gasLimit": "105000000",
    "transactionCount": 5,
    "baseFeePerGas": "20000000000"
  }
}
```

---

#### GET /api/v1/block/{numberOrHash}
Returns block information by number or hash.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `numberOrHash` | string | Block number (decimal) or block hash (0x...) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "number": 1,
    "hash": "0x...",
    "parentHash": "0x...",
    "timestamp": "1770162827",
    "miner": "0x...",
    "gasUsed": "0",
    "gasLimit": "105000000",
    "transactionCount": 0,
    "baseFeePerGas": "20000000000"
  }
}
```

---

### Transaction APIs

#### GET /api/v1/tx/{hash}
Returns transaction information by hash.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `hash` | string | Transaction hash (0x..., 64 hex chars) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "hash": "0x...",
    "blockNumber": 100,
    "blockHash": "0x...",
    "timestamp": null,
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000",
    "gas": "21000",
    "gasPrice": "20000000000",
    "gasUsed": "21000",
    "nonce": 0,
    "transactionIndex": 0,
    "status": "success",
    "type": 0,
    "input": "0x",
    "decodedInput": null
  }
}
```

---

#### GET /api/v1/tx/{hash}/logs
Returns transaction logs.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `hash` | string | Transaction hash (0x..., 64 hex chars) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "address": "0x...",
        "topics": ["0x...", "0x..."],
        "data": "0x...",
        "logIndex": 0,
        "decoded": null
      }
    ]
  }
}
```

---

### Account APIs

#### GET /api/v1/account/{address}
Returns account summary information.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address (0x..., 40 hex chars) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "balance": "10000000000000000000",
    "transactionCount": 100,
    "isContract": false,
    "firstSeen": "2025-01-01T00:00:00Z",
    "lastSeen": "2025-02-04T00:00:00Z"
  }
}
```

---

#### GET /api/v1/account/{address}/balances
Returns native and token balances for an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `include_zero` | boolean | false | Include zero-balance tokens |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "native": {
      "balance": "10000000000000000000",
      "symbol": "STABLEONE",
      "decimals": 18
    },
    "tokens": [
      {
        "contractAddress": "0x...",
        "name": "Token Name",
        "symbol": "TKN",
        "decimals": 18,
        "balance": "1000000000000000000",
        "type": "ERC20"
      }
    ]
  }
}
```

---

#### GET /api/v1/account/{address}/transactions
Returns transaction history for an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `filter` | string | all | Filter: `all`, `in`, `out`, `self` |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "hash": "0x...",
        "blockNumber": 100,
        "timestamp": "1770162827",
        "from": "0x...",
        "to": "0x...",
        "value": "1000000000000000000",
        "gasUsed": "21000",
        "gasPrice": "20000000000",
        "status": "success",
        "type": "transfer",
        "method": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

---

#### GET /api/v1/account/{address}/transfers
Returns token transfer history for an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `type` | string | all | Token type: `all`, `ERC20`, `ERC721` |
| `token` | string | - | Filter by token contract address |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "hash": "0x...",
        "blockNumber": 100,
        "timestamp": null,
        "from": "0x...",
        "to": "0x...",
        "contractAddress": "0x...",
        "value": "1000000000000000000",
        "tokenId": null,
        "type": "ERC20"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "hasMore": true
    }
  }
}
```

---

#### GET /api/v1/account/{address}/tokens
Returns token holdings for an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "contractAddress": "0x...",
        "name": "Token Name",
        "symbol": "TKN",
        "decimals": 18,
        "balance": "1000000000000000000",
        "type": "ERC20"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "hasMore": false
    }
  }
}
```

---

#### GET /api/v1/account/{address}/nfts
Returns NFT holdings for an address.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Ethereum address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "contractAddress": "0x...",
        "tokenId": "1",
        "name": "NFT Collection",
        "symbol": "NFT",
        "tokenUri": "https://...",
        "metadata": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "hasMore": false
    }
  }
}
```

---

### Token APIs

#### GET /api/v1/token/{address}
Returns token information.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Token contract address |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "name": "Token Name",
    "symbol": "TKN",
    "decimals": 18,
    "totalSupply": "1000000000000000000000000",
    "type": "ERC20",
    "holdersCount": 100,
    "transfersCount": 5000,
    "verified": true,
    "logoUrl": null
  }
}
```

---

#### GET /api/v1/token/{address}/holders
Returns token holder list.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Token contract address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "address": "0x...",
        "balance": "1000000000000000000",
        "percentage": 10.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

---

#### GET /api/v1/token/{address}/transfers
Returns token transfer history.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Token contract address |

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "hash": "0x...",
        "blockNumber": 100,
        "timestamp": null,
        "from": "0x...",
        "to": "0x...",
        "value": "1000000000000000000",
        "tokenId": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "hasMore": true
    }
  }
}
```

---

### Contract APIs

#### GET /api/v1/contract/{address}
Returns contract information.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Contract address |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "creator": "0x...",
    "creationTxHash": "0x...",
    "createdAt": 100,
    "verified": true,
    "name": "Contract Name",
    "compilerVersion": "0.8.19",
    "optimizationEnabled": true,
    "optimizationRuns": 200
  }
}
```

---

#### GET /api/v1/contract/{address}/abi
Returns contract ABI.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Contract address |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "verified": true,
    "abi": [
      {
        "type": "function",
        "name": "transfer",
        "inputs": [...],
        "outputs": [...]
      }
    ]
  }
}
```

---

#### GET /api/v1/contract/{address}/source
Returns contract source code.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `address` | string | Contract address |

**Response:**
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "verified": true,
    "name": "Contract Name",
    "sourceCode": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n...",
    "abi": [...],
    "compilerVersion": "0.8.19",
    "constructorArguments": "0x..."
  }
}
```

---

### Validators API

#### GET /api/v1/validators
Returns active validators list.

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "address": "0x...",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "hasMore": false
    }
  }
}
```

---

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## Rate Limiting

Default rate limits:
- **Free tier**: 100 requests per minute
- **Standard tier**: 500 requests per minute
- **Premium tier**: 2000 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the window resets

---

## Changelog

### v1.0.0 (2025-02-04)
- Initial release with all 19 API endpoints
- Stats, Block, Transaction, Account, Token, Contract, and Validators APIs
