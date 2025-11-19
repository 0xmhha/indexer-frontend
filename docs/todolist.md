# Frontend Todo List

미구현 또는 개선이 필요한 항목 목록

---

## 기능 구현

### 높은 우선순위

- [ ] **WebSocket 실시간 업데이트**
  - `WebSocketProvider` 연결 구현
  - 새 블록/트랜잭션 실시간 표시
  - 연결 상태 인디케이터
  - 백엔드 WS 서버 (`ws://localhost:8080/ws`) 활성화 필요

- [ ] **Balance History Chart**
  - 주소 페이지에 잔액 히스토리 시각화
  - `GET_BALANCE_HISTORY` 쿼리 사용
  - Recharts로 시계열 차트 구현

- [ ] **Search Autocomplete**
  - 검색어 입력 시 자동완성 제안
  - 최근 검색 기록 표시
  - 입력 타입 자동 감지 (블록 번호, 해시, 주소)

### 중간 우선순위

- [ ] **Top Miners 테이블**
  - 통계 페이지에 마이너 순위 표시
  - 백엔드에 집계 쿼리 추가 필요

- [ ] **Transaction Filters 고급 기능**
  - 값 범위 필터
  - 날짜/블록 범위 필터
  - 트랜잭션 상태 필터 (성공/실패)

- [ ] **Contract Verification Status**
  - 컨트랙트 검증 상태 표시
  - 검증된 소스코드 표시

### 낮은 우선순위

- [ ] **Dark/Light Theme Toggle**
  - 테마 전환 기능
  - 시스템 설정 자동 감지

- [ ] **Token Balances 표시**
  - ERC-20/721/1155 토큰 잔액
  - 토큰 전송 내역

---

## 테스트

- [ ] **Unit Tests (Vitest)**
  - 목표: 80% 이상 커버리지
  - 유틸리티 함수 테스트
  - 훅 테스트
  - 컴포넌트 테스트

- [ ] **E2E Tests (Playwright)**
  - 블록 상세 페이지 테스트
  - 트랜잭션 상세 페이지 테스트
  - 검색 기능 테스트
  - 페이지네이션 테스트

---

## 최적화

- [ ] **Performance Optimization**
  - Code splitting 최적화
  - 대용량 리스트 가상 스크롤링 (react-window)
  - 이미지 최적화

- [ ] **Accessibility (WCAG 2.1 AA)**
  - 스크린 리더 테스트
  - 키보드 네비게이션 검증
  - 색상 대비 검증

- [ ] **SEO**
  - 메타 태그 최적화
  - Structured data 추가
  - sitemap.xml 생성

---

## 백엔드 의존성

다음 항목은 백엔드 기능 추가가 필요합니다:

- WebSocket 서버 활성화
- Top miners 집계 쿼리
- BigInt 커스텀 스칼라 등록 (현재 String으로 대체)
- Token balance 조회 API

---

Last Updated: 2024-11-19
