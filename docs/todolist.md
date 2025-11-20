# Frontend Todo List

백엔드 API 구현 대기 중인 항목

---

## 백엔드 요청 사항

다음 API가 백엔드에 필요합니다:

1. **Top Miners 집계 쿼리**
   ```graphql
   type MinerStats {
     address: Address!
     blockCount: Int!
     lastBlockNumber: BigInt!
     percentage: Float!
   }

   type Query {
     topMiners(limit: Int): [MinerStats!]!
   }
   ```

2. **Token Balance API**
   ```graphql
   type TokenBalance {
     contractAddress: Address!
     tokenType: String!
     balance: BigInt!
     name: String
     symbol: String
     decimals: Int
   }

   type Query {
     tokenBalances(address: Address!): [TokenBalance!]!
   }
   ```

---

Last Updated: 2025-11-20
