# Frontend Development Status

마지막 업데이트: 2025-11-21

---

## 📊 현재 상태

### 구현된 페이지 (18개)
1. `/` - Home (Dashboard)
2. `/blocks` - 블록 목록
3. `/block/[numberOrHash]` - 블록 상세
4. `/txs` - 트랜잭션 목록
5. `/tx/[hash]` - 트랜잭션 상세
6. `/address/[address]` - 주소 상세
   - 일반 트랜잭션
   - 내부 트랜잭션
   - ERC20 토큰 전송
   - ERC721 NFT 전송
   - 컨트랙트 생성 정보
7. `/stats` - 통계
8. `/gas` - Gas Tools
9. `/contract` - Contract 조회
10. `/system-contracts` - System Contracts
11. `/governance` - Governance 대시보드
12. `/governance/[contract]/[proposalId]` - Proposal 상세
13. `/validators` - Validators
14. `/wbft` - WBFT Consensus
15. `/settings` - 설정
16. `/robots.txt` - SEO
17. `/sitemap.xml` - SEO
18. `/_not-found` - 404 페이지

### GraphQL Hooks (10개)
1. `useBlocks` - 블록 목록 조회
2. `useBlock` - 블록 상세 조회
3. `useTransactions` - 트랜잭션 목록 조회
4. `useTransaction` - 트랜잭션 상세 조회
5. `useAnalytics` - 통계 데이터 조회
6. `useSubscriptions` - WebSocket 실시간 구독 (블록, 트랜잭션, 로그)
7. `useSystemContracts` - System Contracts 데이터
8. `useGovernance` - Governance 데이터
9. `useWBFT` - WBFT 및 Validator 데이터
10. `useAddressIndexing` - Address Indexing (컨트랙트, 내부 TX, ERC20/721)

### 빌드 정보
- 빌드 상태: ✅ 성공
- TypeScript: ✅ 타입 체크 통과
- ESLint: ✅ Lint 통과
- 번들 크기:
  - First Load JS: 87.7 kB (공통)
  - 최대 페이지: 247 kB (/)
  - 최소 페이지: 96.2 kB (/settings)

---

## 🔄 백엔드 API 요청 사항

다음 API가 백엔드에 추가되면 프론트엔드 기능을 확장할 수 있습니다:

### 1. Search API (우선순위: 높)
통합 검색 기능을 위해 필요합니다.

```graphql
type SearchResult {
  type: String!           # "block", "transaction", "address", "contract"
  value: String!
  label: String
  metadata: String        # JSON string with additional info
}

type Query {
  search(
    query: String!
    types: [String!]      # Filter by type
    limit: Int = 10
  ): [SearchResult!]!
}
```

**사용 위치**: Header의 SearchBar 컴포넌트

### 2. Top Miners 집계 쿼리 (우선순위: 중)
현재 Stats 페이지의 Top Miners 섹션 구현을 위해 필요합니다.

```graphql
type MinerStats {
  address: Address!
  blockCount: Int!
  lastBlockNumber: BigInt!
  lastBlockTime: String!
  percentage: Float!
  totalRewards: BigInt
}

type Query {
  topMiners(
    limit: Int = 10
    offset: Int = 0
    timeRange: String  # "24h", "7d", "30d", "all"
  ): TopMinersResult!
}

type TopMinersResult {
  miners: [MinerStats!]!
  totalBlocks: Int!
  timeRange: String!
}
```

**사용 위치**: `/stats` 페이지

### 3. Token Balance API (우선순위: 중)
주소 페이지에서 토큰 잔액 표시를 위해 필요합니다.

```graphql
type TokenBalance {
  contractAddress: Address!
  tokenType: String!        # "ERC20", "ERC721", "ERC1155"
  balance: BigInt!
  name: String
  symbol: String
  decimals: Int
  tokenId: String          # For NFTs
  metadata: String         # For NFTs
}

type Query {
  tokenBalances(
    address: Address!
    tokenType: String       # Filter by type
  ): [TokenBalance!]!
}
```

**사용 위치**: `/address/[address]` 페이지

### 4. Contract Verification API (우선순위: 낮)
Contract 페이지의 소스 코드 검증 기능을 위해 필요합니다.

```graphql
type ContractVerification {
  address: Address!
  isVerified: Boolean!
  name: String
  compilerVersion: String
  optimizationEnabled: Boolean
  sourceCode: String
  abi: String
  constructorArguments: String
  verifiedAt: String
}

type Query {
  contractVerification(address: Address!): ContractVerification
}

type Mutation {
  verifyContract(
    address: Address!
    sourceCode: String!
    compilerVersion: String!
    optimizationEnabled: Boolean!
    constructorArguments: String
  ): ContractVerification!
}
```

**사용 위치**: `/contract` 페이지

---

## 🎯 향후 개선 사항 (선택적)

### UI/UX 개선
- [ ] 페이지네이션 컴포넌트 통합
- [ ] 무한 스크롤 옵션 추가
- [ ] 고급 차트 라이브러리 통합 (Chart.js, Recharts)
- [ ] 데이터 내보내기 기능 (CSV, JSON)
- [ ] 즐겨찾기/북마크 기능
- [ ] 사용자 프리퍼런스 저장 (localStorage)

### 성능 최적화
- [ ] React Query로 마이그레이션 (Apollo Client 대체)
- [ ] 이미지 최적화 (next/image)
- [ ] 코드 스플리팅 최적화
- [ ] 번들 크기 최적화
- [ ] Service Worker 추가 (PWA)

### 테스트
- [ ] Unit Tests (Vitest)
- [ ] Integration Tests
- [ ] E2E Tests (Playwright)
- [ ] Visual Regression Tests

### 접근성
- [ ] ARIA 레이블 개선
- [ ] 키보드 내비게이션 강화
- [ ] 스크린 리더 테스트
- [ ] WCAG 2.1 AA 준수 검증

### 문서화
- [ ] Storybook 설정
- [ ] 컴포넌트 문서
- [ ] API 문서
- [ ] 사용자 가이드

---

## 📝 기술 스택

### Core
- Next.js 14.2.33
- React 18
- TypeScript 5
- Apollo Client 3.11.10

### UI/Styling
- Tailwind CSS 3.4.17
- Radix UI (Dialog, Dropdown Menu, Tabs)
- Lucide Icons

### State Management
- Apollo Client Cache
- React Context (Notifications, Theme)

### Development Tools
- ESLint 9
- Prettier
- TypeScript
- Vitest (Testing Framework)
- Playwright (E2E Testing)

### Build & Deploy
- Next.js Build
- pnpm Package Manager

---

## 📚 참고 문서

### 프로젝트 문서
- `/CLAUDE.md` - AI Assistant 가이드
- `/README.md` - 프로젝트 개요
- `/docs/todolist.md` - 이 문서

### 외부 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
