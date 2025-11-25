# Backend API Requirements

> 프론트엔드 개발을 위해 백엔드에서 구현이 필요한 API 목록

**작성일**: 2025-11-24
**프론트엔드 버전**: v1.0.0
**상태**: 요청 대기

---

## 📋 요청 개요

프론트엔드에서 완전한 기능 구현을 위해 다음 4개의 GraphQL API 구현이 필요합니다.

| API | 우선순위 | 예상 소요 | 영향도 | 상태 |
|-----|---------|-----------|--------|------|
| Search API | 🔴 높음 | 1-2주 | Header 검색 기능 | ⏳ 대기 |
| Top Miners API | 🟡 중간 | 3-5일 | Stats 페이지 | ⏳ 대기 |
| Token Balance API | 🟡 중간 | 1주 | Address 페이지 | ⏳ 대기 |
| Contract Verification API | 🟢 낮음 | 2-3주 | Contract 페이지 | ⏳ 대기 |

---

## 1. Search API (🔴 우선순위: 높음)

### 개요
통합 검색 기능을 위한 API입니다. 블록 번호, 트랜잭션 해시, 주소, 컨트랙트 등을 통합 검색할 수 있어야 합니다.

### 사용 위치
- **컴포넌트**: `components/layout/SearchBar.tsx`
- **페이지**: 모든 페이지 (Header에 위치)

### 현재 상태
- Mock 데이터로 UI만 구현됨
- 실제 검색 기능은 동작하지 않음

### GraphQL Schema

```graphql
type SearchResult {
  type: String!           # "block", "transaction", "address", "contract"
  value: String!          # 검색된 값 (해시, 주소 등)
  label: String           # 표시할 레이블 (optional)
  metadata: String        # JSON string with additional info
}

type Query {
  search(
    query: String!        # 검색어
    types: [String!]      # 필터링할 타입 (optional)
    limit: Int = 10       # 결과 제한 (default: 10)
  ): [SearchResult!]!
}
```

### 예상 사용 시나리오

**1. 블록 번호 검색**
```graphql
query {
  search(query: "12345", types: ["block"]) {
    type
    value
    label
    metadata
  }
}
```

**응답 예시**:
```json
[
  {
    "type": "block",
    "value": "12345",
    "label": "Block #12345",
    "metadata": "{\"timestamp\": \"2024-01-15T10:30:00Z\", \"txCount\": 15}"
  }
]
```

**2. 트랜잭션 해시 검색**
```graphql
query {
  search(query: "0xabc123...", types: ["transaction"]) {
    type
    value
    label
    metadata
  }
}
```

**3. 주소 검색**
```graphql
query {
  search(query: "0x742d35...", types: ["address", "contract"]) {
    type
    value
    label
    metadata
  }
}
```

**4. 통합 검색 (타입 필터 없음)**
```graphql
query {
  search(query: "0x123...", limit: 20) {
    type
    value
    label
    metadata
  }
}
```

### 구현 요구사항

1. **검색 대상**
   - 블록 번호 (숫자)
   - 블록 해시 (0x로 시작하는 66자 해시)
   - 트랜잭션 해시 (0x로 시작하는 66자 해시)
   - 주소 (0x로 시작하는 42자 주소)
   - 컨트랙트 주소 (컨트랙트인 경우 구분)

2. **검색 로직**
   - 부분 일치 지원 (최소 4자 이상)
   - 대소문자 구분 없음
   - 0x 접두사 선택적 (있어도 되고 없어도 됨)

3. **성능 요구사항**
   - 응답 시간: < 500ms
   - 인덱싱 필요 (block number, hash, address 등)

4. **메타데이터 포함 정보** (JSON string)
   - 블록: `timestamp`, `txCount`, `miner`
   - 트랜잭션: `blockNumber`, `from`, `to`, `value`
   - 주소: `balance`, `txCount`, `isContract`
   - 컨트랙트: `name`, `symbol`, `isVerified`

---

## 2. Top Miners API (🟡 우선순위: 중간)

### 개요
Stats 페이지에서 상위 채굴자(Miner) 통계를 표시하기 위한 집계 API입니다.

### 사용 위치
- **페이지**: `/stats`
- **섹션**: Top Miners 카드

### 현재 상태
- UI는 구현되었으나 데이터가 없어 표시되지 않음
- Mock 데이터로 테스트 필요

### GraphQL Schema

```graphql
type MinerStats {
  address: Address!       # 채굴자 주소
  blockCount: Int!        # 채굴한 블록 수
  lastBlockNumber: BigInt! # 마지막 채굴 블록 번호
  lastBlockTime: String!  # 마지막 채굴 시간 (ISO 8601)
  percentage: Float!      # 전체 대비 비율 (0.0 ~ 100.0)
  totalRewards: BigInt    # 총 보상 (optional)
}

type TopMinersResult {
  miners: [MinerStats!]!  # 상위 채굴자 리스트
  totalBlocks: Int!       # 총 블록 수
  timeRange: String!      # 집계 기간
}

type Query {
  topMiners(
    limit: Int = 10       # 결과 제한 (default: 10)
    offset: Int = 0       # 오프셋
    timeRange: String     # "24h", "7d", "30d", "all"
  ): TopMinersResult!
}
```

### 예상 사용 시나리오

**최근 24시간 Top 10 채굴자**
```graphql
query {
  topMiners(limit: 10, timeRange: "24h") {
    miners {
      address
      blockCount
      lastBlockNumber
      lastBlockTime
      percentage
      totalRewards
    }
    totalBlocks
    timeRange
  }
}
```

**응답 예시**:
```json
{
  "miners": [
    {
      "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb5",
      "blockCount": 1250,
      "lastBlockNumber": "123456",
      "lastBlockTime": "2024-01-15T14:30:00Z",
      "percentage": 12.5,
      "totalRewards": "1250000000000000000000"
    }
  ],
  "totalBlocks": 10000,
  "timeRange": "24h"
}
```

### 구현 요구사항

1. **집계 로직**
   - 블록의 `miner` 필드 기준으로 집계
   - 시간 범위별 필터링 지원
   - 내림차순 정렬 (blockCount 기준)

2. **시간 범위 옵션**
   - `24h`: 최근 24시간
   - `7d`: 최근 7일
   - `30d`: 최근 30일
   - `all`: 전체 기간

3. **성능 요구사항**
   - 응답 시간: < 1초
   - 사전 집계 또는 캐싱 권장
   - 10분마다 갱신 권장

4. **percentage 계산**
   - `(minerBlockCount / totalBlocks) * 100`
   - 소수점 2자리까지 반올림

---

## 3. Token Balance API (🟡 우선순위: 중간)

### 개요
특정 주소가 보유한 토큰(ERC20, ERC721, ERC1155) 잔액을 조회하는 API입니다.

### 사용 위치
- **페이지**: `/address/[address]`
- **섹션**: Token Holdings 탭 (새로 추가 예정)

### 현재 상태
- UI 미구현
- API 연동 후 UI 개발 예정

### GraphQL Schema

```graphql
type TokenBalance {
  contractAddress: Address!  # 토큰 컨트랙트 주소
  tokenType: String!         # "ERC20", "ERC721", "ERC1155"
  balance: BigInt!           # 잔액 (ERC20: amount, NFT: count)
  name: String               # 토큰 이름
  symbol: String             # 토큰 심볼
  decimals: Int              # ERC20 decimals (NFT의 경우 null)
  tokenId: String            # NFT token ID (ERC721/1155)
  metadata: String           # NFT 메타데이터 JSON
}

type Query {
  tokenBalances(
    address: Address!        # 조회할 주소
    tokenType: String        # 필터: "ERC20", "ERC721", "ERC1155"
  ): [TokenBalance!]!
}
```

### 예상 사용 시나리오

**특정 주소의 모든 토큰 잔액 조회**
```graphql
query {
  tokenBalances(address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb5") {
    contractAddress
    tokenType
    balance
    name
    symbol
    decimals
    tokenId
    metadata
  }
}
```

**ERC20 토큰만 조회**
```graphql
query {
  tokenBalances(
    address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb5",
    tokenType: "ERC20"
  ) {
    contractAddress
    balance
    name
    symbol
    decimals
  }
}
```

**응답 예시**:
```json
[
  {
    "contractAddress": "0xabc123...",
    "tokenType": "ERC20",
    "balance": "1000000000000000000000",
    "name": "Test Token",
    "symbol": "TEST",
    "decimals": 18,
    "tokenId": null,
    "metadata": null
  },
  {
    "contractAddress": "0xdef456...",
    "tokenType": "ERC721",
    "balance": "3",
    "name": "Test NFT",
    "symbol": "TNFT",
    "decimals": null,
    "tokenId": "42",
    "metadata": "{\"image\": \"ipfs://...\", \"name\": \"NFT #42\"}"
  }
]
```

### 구현 요구사항

1. **토큰 타입별 처리**
   - ERC20: `balance`는 wei 단위, `decimals` 필수
   - ERC721: `balance`는 보유 NFT 개수, `tokenId` 리스트
   - ERC1155: `balance`는 각 tokenId별 수량

2. **데이터 수집**
   - ERC20 Transfer 이벤트 추적
   - ERC721 Transfer 이벤트 추적
   - ERC1155 TransferSingle/TransferBatch 이벤트 추적
   - 실시간 잔액 계산 또는 인덱싱

3. **성능 요구사항**
   - 응답 시간: < 1초
   - 인덱싱 필수 (주소별 토큰 잔액)
   - 페이지네이션 지원 권장 (많은 토큰 보유 시)

4. **메타데이터 처리**
   - NFT 메타데이터는 IPFS 또는 HTTP URL에서 가져오기
   - 메타데이터 캐싱 권장
   - 실패 시 null 반환

---

## 4. Contract Verification API (🟢 우선순위: 낮음)

### 개요
스마트 컨트랙트 소스 코드 검증 및 조회 API입니다.

### 사용 위치
- **페이지**: `/contract`
- **컴포넌트**: `components/contract/ContractVerificationStatus.tsx`

### 현재 상태
- Mock 데이터로 UI 구현됨
- 실제 검증 기능은 동작하지 않음

### GraphQL Schema

```graphql
type ContractVerification {
  address: Address!           # 컨트랙트 주소
  isVerified: Boolean!        # 검증 여부
  name: String                # 컨트랙트 이름
  compilerVersion: String     # 컴파일러 버전 (e.g., "0.8.20")
  optimizationEnabled: Boolean # 최적화 여부
  optimizationRuns: Int       # 최적화 실행 횟수
  sourceCode: String          # 소스 코드
  abi: String                 # ABI (JSON string)
  constructorArguments: String # 생성자 인자 (encoded)
  verifiedAt: String          # 검증 시간 (ISO 8601)
  licenseType: String         # 라이센스 타입
}

type Query {
  contractVerification(
    address: Address!         # 조회할 컨트랙트 주소
  ): ContractVerification
}

type Mutation {
  verifyContract(
    address: Address!
    sourceCode: String!
    compilerVersion: String!
    optimizationEnabled: Boolean!
    optimizationRuns: Int = 200
    constructorArguments: String
    contractName: String
    licenseType: String
  ): ContractVerification!
}
```

### 예상 사용 시나리오

**1. 컨트랙트 검증 정보 조회**
```graphql
query {
  contractVerification(address: "0xabc123...") {
    address
    isVerified
    name
    compilerVersion
    optimizationEnabled
    sourceCode
    abi
    verifiedAt
  }
}
```

**응답 예시 (검증됨)**:
```json
{
  "address": "0xabc123...",
  "isVerified": true,
  "name": "MyToken",
  "compilerVersion": "0.8.20",
  "optimizationEnabled": true,
  "optimizationRuns": 200,
  "sourceCode": "pragma solidity ^0.8.20; contract MyToken { ... }",
  "abi": "[{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
  "constructorArguments": "0x0000...",
  "verifiedAt": "2024-01-15T10:30:00Z",
  "licenseType": "MIT"
}
```

**응답 예시 (미검증)**:
```json
{
  "address": "0xdef456...",
  "isVerified": false,
  "name": null,
  "compilerVersion": null,
  "optimizationEnabled": null,
  "sourceCode": null,
  "abi": null,
  "verifiedAt": null
}
```

**2. 컨트랙트 검증 제출**
```graphql
mutation {
  verifyContract(
    address: "0xabc123..."
    sourceCode: "pragma solidity ^0.8.20; contract MyToken { ... }"
    compilerVersion: "0.8.20"
    optimizationEnabled: true
    optimizationRuns: 200
    constructorArguments: "0x0000..."
    contractName: "MyToken"
    licenseType: "MIT"
  ) {
    address
    isVerified
    verifiedAt
  }
}
```

### 구현 요구사항

1. **검증 프로세스**
   - 제출된 소스 코드를 지정된 컴파일러로 컴파일
   - 생성된 바이트코드를 온체인 바이트코드와 비교
   - 일치하면 검증 완료, 저장

2. **지원 컴파일러**
   - Solidity 0.4.x ~ 0.8.x
   - 컴파일러 바이너리 관리 필요
   - 버전별 캐싱

3. **보안 고려사항**
   - 소스 코드 실행 금지 (컴파일만)
   - 타임아웃 설정 (컴파일 시간 제한)
   - Rate limiting (검증 요청 제한)

4. **저장소**
   - 검증된 소스 코드 DB 저장
   - ABI JSON 파싱 및 저장
   - 검색 인덱싱 (컨트랙트 이름, 주소)

---

## 📊 우선순위 및 일정 제안

### Phase 1: 핵심 기능 (2주)
1. **Search API** - 1-2주
   - 가장 높은 우선순위
   - 사용자 경험에 직접적 영향

### Phase 2: 통계 및 토큰 (2주)
2. **Top Miners API** - 3-5일
3. **Token Balance API** - 1주

### Phase 3: 고급 기능 (3주)
4. **Contract Verification API** - 2-3주
   - 낮은 우선순위이나 구현 복잡도 높음

**총 예상 기간**: 7-8주

---

## 🔧 기술 스펙

### GraphQL Server
- **권장**: Apollo Server, GraphQL Yoga
- **언어**: TypeScript/JavaScript, Python, Go 등

### 데이터베이스
- **주 DB**: PostgreSQL (인덱서 데이터)
- **캐시**: Redis (집계 데이터, 메타데이터)
- **검색**: Elasticsearch (optional, Search API 성능 향상)

### 성능 목표
- API 응답 시간: < 1초 (95 percentile)
- 동시 요청 처리: 100+ RPS
- 캐싱 전략: 자주 조회되는 데이터 캐싱

---

## 📝 프론트엔드 대응 계획

### Search API 연동 후
- [ ] SearchBar 컴포넌트 실제 API 연동
- [ ] 검색 결과 페이지 구현
- [ ] 검색 히스토리 기능 추가

### Top Miners API 연동 후
- [ ] Stats 페이지 Top Miners 섹션 활성화
- [ ] 시간 범위 필터 UI 추가
- [ ] 차트 시각화 추가

### Token Balance API 연동 후
- [ ] Address 페이지에 Token Holdings 탭 추가
- [ ] ERC20/ERC721/ERC1155 별도 표시
- [ ] NFT 메타데이터 렌더링

### Contract Verification API 연동 후
- [ ] Contract 페이지 Mock 데이터 제거
- [ ] 검증 제출 폼 구현
- [ ] 소스 코드 뷰어 개선

---

## 📞 문의 및 협업

### 프론트엔드 담당자
- **역할**: Frontend Developer
- **연락**: 이 문서를 통한 비동기 커뮤니케이션

### 협업 프로세스
1. 백엔드팀에서 API 개발 시작 시 이슈 생성
2. API 개발 완료 시 Staging 환경 배포
3. 프론트엔드팀에서 통합 테스트
4. 피드백 및 수정사항 공유
5. Production 배포

### 테스트 환경
- **Staging**: 백엔드 API 테스트 환경 필요
- **Mock Server**: 개발 중 Mock GraphQL 서버 사용 중

---

## ✅ 체크리스트

백엔드 API 개발 시 확인 사항:

- [ ] GraphQL Schema가 이 문서와 일치하는지 확인
- [ ] 모든 필드의 타입이 정확한지 검증
- [ ] 에러 처리 (존재하지 않는 데이터, 잘못된 입력 등)
- [ ] 페이지네이션 지원 (필요한 경우)
- [ ] Rate Limiting 설정
- [ ] CORS 설정 (프론트엔드 도메인 허용)
- [ ] API 문서 작성 (GraphQL Playground)
- [ ] 성능 테스트 (부하 테스트)
- [ ] 로깅 및 모니터링 설정

---

**문서 버전**: 1.0
**최종 수정**: 2025-11-24
**다음 리뷰**: 백엔드 개발 시작 시
