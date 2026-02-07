/**
 * Network Client
 * WebSocket 설정
 *
 * 이 모듈은 백엔드와의 통신을 위한 클라이언트를 제공합니다.
 * - WebSocket: 실시간 데이터 구독
 *
 * Apollo Client는 NetworkProvider를 통해 동적으로 관리됩니다.
 * 사용 방법: const client = useApolloClientForNetwork(networkId)
 */

// WebSocket service exports
export {
  getWebSocketClient,
  type WebSocketClient,
  type WebSocketMessage,
  type WebSocketSubscription,
} from '@/lib/services/websocket'
