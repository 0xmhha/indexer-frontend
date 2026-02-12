/**
 * Network Layer
 *
 * - client/: Apollo Client, WebSocket 설정
 * - schemas/: GraphQL 쿼리/뮤테이션/서브스크립션
 */

// Client exports (Apollo, WebSocket)
export * from './client'

// Schema exports는 네이밍 충돌 방지를 위해 namespace로 제공
export * as schemas from './schemas'
