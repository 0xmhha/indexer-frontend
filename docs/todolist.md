# Frontend Todo List

미구현 또는 개선이 필요한 항목 목록

---

## 기능 구현

### 백엔드 의존성 있음

- [ ] **Top Miners 테이블**
  - 통계 페이지에 마이너 순위 표시
  - 백엔드에 집계 쿼리 추가 필요
  - 필요 쿼리: `topMiners(limit: Int): [MinerStats!]!`

- [ ] **Token Balances 표시**
  - ERC-20/721/1155 토큰 잔액
  - 토큰 전송 내역
  - 필요 API: `tokenBalances(address: Address!): [TokenBalance!]!`

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
