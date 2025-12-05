/**
 * Network Layer
 * 백엔드와의 통신을 담당하는 레이어
 *
 * 구조:
 * - client/: Apollo Client, WebSocket 설정
 * - api/: async API 함수들
 * - schemas/: GraphQL 쿼리/뮤테이션/서브스크립션
 */

// Client exports (Apollo, WebSocket)
export * from './client'

// Schema exports는 네이밍 충돌 방지를 위해 namespace로 제공
// import { schemas } from '@/lib/network' 형태로 사용
export * as schemas from './schemas'

// API functions (향후 구현 예정)
// export * from './api'
