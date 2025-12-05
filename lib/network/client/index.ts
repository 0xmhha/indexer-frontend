/**
 * Network Client
 * Apollo Client 및 WebSocket 설정
 *
 * 이 모듈은 백엔드와의 통신을 위한 클라이언트를 제공합니다.
 * - apolloClient: GraphQL 쿼리/뮤테이션/서브스크립션 처리
 * - WebSocket: 실시간 데이터 구독
 */

// Apollo Client export
export { apolloClient } from '@/lib/apollo/client'

// WebSocket service exports
export {
  getWebSocketClient,
  type WebSocketClient,
  type WebSocketMessage,
  type WebSocketSubscription,
} from '@/lib/services/websocket'
