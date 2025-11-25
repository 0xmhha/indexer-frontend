# Backend 작업 요청서

> **작성일**: 2025-11-24
> **우선순위**: HIGH (Issue #1), MEDIUM (Issue #2)
> **요청자**: Frontend Team
> **상태**: 🔴 OPEN

---

## 📋 작업 요청 개요

Frontend에서 Backend GraphQL API 통합 중 2개의 스키마 이슈가 발견되었습니다.
프론트엔드에서 임시 우회 처리를 완료했으나, 근본적인 해결을 위해 백엔드 수정이 필요합니다.

---

## 🚨 Issue #1: `addressBalance` 쿼리가 큰 잔액 값에 대해 "0" 반환

### 우선순위: HIGH

### 문제 상황

**GraphQL 쿼리**:
```graphql
query GetAddressBalance($address: String!) {
  addressBalance(address: $address)
}
```

**Variables**:
```json
{
  "address": "0x8eB79036Bc0f3ABa136eF18B3A2Fb8C1188939A6"
}
```

**현재 응답** (❌ WRONG):
```json
{
  "data": {
    "addressBalance": "0"
  }
}
```

**기대 응답** (✅ CORRECT):
```json
{
  "data": {
    "addressBalance": "90462569716653277674664832038037428010367175520031690655826237506182132531200000000000000000000"
  }
}
```

**Node 직접 조회 시 실제 값**:
```javascript
// eth.getBalance() 결과
9.04625697166532776746648320380374280103671755200316906558262375061821325312e+74

// Wei 단위 (string):
"90462569716653277674664832038037428010367175520031690655826237506182132531200000000000000000000"
```

### 근본 원인 분석

Ethereum Wei 값은 매우 큰 정수(10^18 이상)이므로, Number/Int64 타입으로 변환 시 오버플로우 발생:

- **JavaScript Number.MAX_SAFE_INTEGER**: 9,007,199,254,740,991 (2^53-1)
- **Go int64 MAX**: 9,223,372,036,854,775,807 (2^63-1)
- **Ethereum Wei 값**: ~10^26 이상 가능
- **결과**: 오버플로우로 인해 `0` 또는 잘못된 값 반환

### 수정 방안

#### Option 1: Go (go-ethereum 사용 시)

```go
import (
    "context"
    "math/big"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func GetAddressBalance(address string, blockNumber *string) (string, error) {
    client, err := ethclient.Dial(nodeURL)
    if err != nil {
        return "", err
    }
    defer client.Close()

    addr := common.HexToAddress(address)

    var balance *big.Int
    if blockNumber != nil && *blockNumber != "" {
        // Query at specific block
        blockNum := new(big.Int)
        blockNum.SetString(*blockNumber, 10)
        balance, err = client.BalanceAt(context.Background(), addr, blockNum)
    } else {
        // Query latest balance
        balance, err = client.BalanceAt(context.Background(), addr, nil)
    }

    if err != nil {
        return "", err
    }

    // ✅ CORRECT - Return as string
    return balance.String(), nil
}
```

**주요 변경사항**:
- ❌ `balance.Int64()` 사용 금지 (오버플로우 발생)
- ✅ `balance.String()` 사용 (정확한 문자열 반환)
- GraphQL에서 `String` 타입으로 반환

#### Option 2: Node.js (web3.js 사용 시)

```javascript
const Web3 = require('web3');
const web3 = new Web3(nodeURL);

async function getAddressBalance(address, blockNumber = 'latest') {
    try {
        const balance = await web3.eth.getBalance(address, blockNumber);

        // ✅ CORRECT - Return as string
        return balance.toString();
    } catch (error) {
        throw new Error(`Failed to get balance: ${error.message}`);
    }
}
```

**주요 변경사항**:
- ❌ `parseInt(balance)` 또는 `Number(balance)` 사용 금지
- ✅ `balance.toString()` 사용

#### Option 3: Node.js (ethers.js 사용 시)

```javascript
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(nodeURL);

async function getAddressBalance(address, blockNumber = 'latest') {
    try {
        const balance = await provider.getBalance(address, blockNumber);

        // ✅ CORRECT - Return as string
        return balance.toString();
    } catch (error) {
        throw new Error(`Failed to get balance: ${error.message}`);
    }
}
```

### GraphQL 스키마 확인

현재 스키마가 다음과 같은지 확인:

```graphql
type Query {
  addressBalance(address: String!, blockNumber: String): String!
}
```

**중요**: 반환 타입이 `String!`이어야 하며, `Int`, `BigInt`, `Float` 등 숫자 타입 사용 불가

### 테스트 케이스

#### Test Case 1: 큰 잔액 값
```graphql
query {
  addressBalance(address: "0x8eB79036Bc0f3ABa136eF18B3A2Fb8C1188939A6")
}

# Expected:
# "90462569716653277674664832038037428010367175520031690655826237506182132531200000000000000000000"
```

#### Test Case 2: 0 잔액
```graphql
query {
  addressBalance(address: "0x0000000000000000000000000000000000000000")
}

# Expected: "0"
```

#### Test Case 3: 1 Wei
```graphql
# Expected: "1"
```

#### Test Case 4: 1 ETH
```graphql
# Expected: "1000000000000000000" (1 ETH = 10^18 Wei)
```

#### Test Case 5: 특정 블록 높이
```graphql
query {
  addressBalance(address: "0x8eB79036Bc0f3ABa136eF18B3A2Fb8C1188939A6", blockNumber: "1000")
}

# Expected: 해당 블록 높이에서의 정확한 잔액 (문자열)
```

### 영향도

- **Severity**: HIGH
- **영향받는 기능**:
  - Address 상세 페이지 잔액 표시
  - Balance History 차트
  - Transaction 상세 페이지의 잔액 변경
  - 모든 Wei 값 표시 (value, gas, gasPrice 등)
- **사용자 영향**: 사용자가 정확한 잔액 정보를 볼 수 없음
- **Frontend 우회 처리**: `balance === "0"` 일 때 로딩 표시를 유지하고 있으나 근본 해결 필요

### 검증 체크리스트

수정 후 다음 항목을 검증해주세요:

- [ ] 큰 잔액 값(10^26 이상)이 정확한 문자열로 반환되는지 확인
- [ ] 0 잔액이 "0"으로 반환되는지 확인
- [ ] 1 Wei가 "1"로 반환되는지 확인
- [ ] 1 ETH가 "1000000000000000000"으로 반환되는지 확인
- [ ] `blockNumber` 파라미터가 정상 동작하는지 확인
- [ ] 존재하지 않는 주소에 대한 에러 처리 확인
- [ ] 성능 저하가 없는지 확인 (string 변환 오버헤드 최소)
- [ ] 기존 테스트 통과 확인

---

## ⚠️ Issue #2: `ContractCreation` 타입에 `address` 필드 누락

### 우선순위: MEDIUM

### 문제 상황

**GraphQL 쿼리**:
```graphql
query GetContractsByCreator($creator: String!, $pagination: PaginationInput) {
  contractsByCreator(creator: $creator, pagination: $pagination) {
    nodes {
      address       # ❌ 이 필드가 스키마에 없음
      creator
      transactionHash
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
```

**에러 메시지**:
```
[GraphQL error]: Message: Cannot query field "address" on type "ContractCreation"
```

### 현재 스키마 (추정)

```graphql
type ContractCreation {
  creator: String!
  transactionHash: String!
  blockNumber: String!
  timestamp: String!
  # address 필드 누락
}
```

### 기대 스키마

```graphql
type ContractCreation {
  address: String!          # 생성된 Contract의 주소
  creator: String!          # Contract를 생성한 계정 주소
  transactionHash: String!  # Contract 생성 트랜잭션 해시
  blockNumber: String!      # Contract 생성 블록 번호
  timestamp: String!        # Contract 생성 시간
}
```

### 왜 필요한가?

Contract 생성 정보를 조회할 때, **생성된 Contract의 주소**가 가장 중요한 정보입니다:

1. **사용 사례**: 특정 주소가 생성한 모든 Contract 목록 표시
2. **UI 표시**: 각 Contract로 이동할 수 있는 링크 제공 필요
3. **데이터 완성도**: Contract 주소 없이는 생성 정보가 불완전함

### 수정 방안

#### Contract 주소 획득 방법

Contract 생성 트랜잭션의 Receipt에서 `contractAddress` 필드를 사용:

```go
// Go (go-ethereum)
receipt, err := client.TransactionReceipt(ctx, txHash)
if err != nil {
    return nil, err
}

contractAddress := receipt.ContractAddress.Hex()  // 생성된 Contract 주소
```

```javascript
// Node.js (web3.js)
const receipt = await web3.eth.getTransactionReceipt(txHash);
const contractAddress = receipt.contractAddress;  // 생성된 Contract 주소
```

#### 데이터베이스 스키마 확인

`contract_creation` 또는 유사한 테이블에 `contract_address` 컬럼이 있는지 확인:

```sql
-- 예시 스키마
CREATE TABLE contract_creations (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,  -- 생성된 Contract 주소
    creator_address VARCHAR(42) NOT NULL,   -- 생성자 주소
    transaction_hash VARCHAR(66) NOT NULL,  -- 생성 트랜잭션
    block_number BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    INDEX idx_creator (creator_address),
    INDEX idx_contract (contract_address)
);
```

만약 컬럼이 없다면 추가 필요:

```sql
ALTER TABLE contract_creations
ADD COLUMN contract_address VARCHAR(42);

-- 기존 데이터 마이그레이션
UPDATE contract_creations
SET contract_address = (
    SELECT contract_address
    FROM transaction_receipts
    WHERE transaction_receipts.transaction_hash = contract_creations.transaction_hash
);
```

#### GraphQL Resolver 수정

```go
// Go (gqlgen 사용 시)
func (r *queryResolver) ContractsByCreator(
    ctx context.Context,
    creator string,
    pagination *PaginationInput,
) (*ContractCreationsResponse, error) {
    contracts, err := r.db.GetContractsByCreator(creator, pagination)
    if err != nil {
        return nil, err
    }

    nodes := make([]*ContractCreation, len(contracts))
    for i, c := range contracts {
        nodes[i] = &ContractCreation{
            Address:         c.ContractAddress,  // ✅ 추가
            Creator:         c.CreatorAddress,
            TransactionHash: c.TransactionHash,
            BlockNumber:     c.BlockNumber.String(),
            Timestamp:       c.Timestamp.String(),
        }
    }

    return &ContractCreationsResponse{
        Nodes:      nodes,
        TotalCount: totalCount,
        PageInfo:   pageInfo,
    }, nil
}
```

### 영향받는 쿼리

다음 쿼리들에 `address` 필드 추가 필요:

1. **`contractCreation(address: String!)`** - 단일 Contract 생성 정보 조회
2. **`contractsByCreator(creator: String!)`** - 특정 주소가 생성한 Contract 목록

### 테스트 케이스

#### Test Case 1: 단일 Contract 생성 정보
```graphql
query {
  contractCreation(address: "0x123...") {
    address         # 생성된 Contract 주소
    creator         # 생성자 주소
    transactionHash
    blockNumber
    timestamp
  }
}
```

#### Test Case 2: 생성자별 Contract 목록
```graphql
query {
  contractsByCreator(creator: "0xabc...", pagination: { limit: 10, offset: 0 }) {
    nodes {
      address         # 각 Contract의 주소
      creator
      transactionHash
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
```

### 영향도

- **Severity**: MEDIUM
- **영향받는 기능**:
  - Address 상세 페이지의 "Contracts Created" 섹션
  - Contract 생성 정보 표시
- **사용자 영향**: Contract 주소 정보 없이 목록만 표시됨 (클릭 불가)
- **Frontend 우회 처리**:
  - 임시로 "CONTRACT ADDRESS" 컬럼을 "CREATOR" 컬럼으로 변경
  - Contract 주소로 이동하는 링크 제거
  - 백엔드 수정 시 프론트엔드도 복원 필요

### 검증 체크리스트

수정 후 다음 항목을 검증해주세요:

- [ ] `contractCreation` 쿼리에서 `address` 필드 반환 확인
- [ ] `contractsByCreator` 쿼리에서 모든 Contract의 `address` 필드 반환 확인
- [ ] Contract 주소가 유효한 Ethereum 주소 형식인지 확인 (0x + 40 hex chars)
- [ ] 존재하지 않는 주소 조회 시 적절한 null 처리 확인
- [ ] 성능 저하가 없는지 확인
- [ ] 기존 테스트 통과 확인

---

## 📊 전체 영향도 평가

### Critical Path

```
Issue #1 (addressBalance) → HIGH Priority
  ↓
모든 Wei 값 표시 기능에 영향
  ↓
사용자가 정확한 금액 정보를 볼 수 없음
  ↓
신뢰성 문제 발생

Issue #2 (ContractCreation.address) → MEDIUM Priority
  ↓
Contract 생성 정보 불완전
  ↓
Contract 주소로 이동 불가
  ↓
UX 저하
```

### 작업 순서 권장

1. **Issue #1 먼저 수정** (HIGH Priority)
   - 더 많은 기능에 영향
   - 데이터 정확성 문제
   - 수정이 상대적으로 간단 (String 변환만)

2. **Issue #2 이후 수정** (MEDIUM Priority)
   - 특정 기능에만 영향
   - UX 문제이지만 기능은 작동
   - DB 마이그레이션이 필요할 수 있음

---

## 📞 연락 및 피드백

**Frontend Team 담당자**: Frontend Developer
**Slack Channel**: #backend-support
**이슈 추적**: `docs/backend-work-request.md`

### 작업 완료 시 알림 사항

다음 정보를 포함하여 알려주세요:

1. **수정 완료 일시**
2. **배포 환경** (Development/Staging/Production)
3. **GraphQL Endpoint 변경사항** (있다면)
4. **Breaking Changes** (있다면)
5. **테스트 결과 요약**

Frontend 팀에서 다음 작업을 진행합니다:

- Issue #1 수정 후: Balance 표시 로직 정상화 확인
- Issue #2 수정 후: Contract 주소 표시 컬럼 복원

---

## 📚 참고 자료

### Ethereum Wei Values
- 1 ETH = 1,000,000,000,000,000,000 Wei (10^18)
- Maximum ETH supply: ~120,000,000 ETH
- Maximum Wei value: ~1.2 × 10^26

### Safe Integer Limits
- JavaScript `Number.MAX_SAFE_INTEGER`: 9,007,199,254,740,991 (2^53 - 1)
- Go `int64` max: 9,223,372,036,854,775,807 (2^63 - 1)
- **Both are insufficient for Wei values!**

### Documentation
- [Ethereum Units](https://ethereum.org/en/developers/docs/intro-to-ether/#denominations)
- [Go math/big Package](https://pkg.go.dev/math/big)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**최종 업데이트**: 2025-11-24
**상태**: 🔴 OPEN - 백엔드 작업 대기 중
