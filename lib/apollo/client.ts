import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink, split, NormalizedCacheObject } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { onError } from '@apollo/client/link/error'
import { createClient, Client as WsClient } from 'graphql-ws'
import { REALTIME } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'
import type { NetworkEndpoints } from '@/lib/config/networks.types'

/**
 * Known error messages that should be silently ignored
 * These are expected errors from features that may not be enabled on the backend
 */
const SUPPRESSED_ERROR_PATTERNS = [
  'does not support address indexing', // Address indexing feature not enabled
  'does not support consensus operations', // Consensus/epoch data feature not enabled
]

/**
 * Check if an error message should be suppressed from console logging
 */
function shouldSuppressError(message: string): boolean {
  return SUPPRESSED_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

/**
 * Apollo Client instance with cleanup function
 */
export interface ApolloClientInstance {
  client: ApolloClient<NormalizedCacheObject>
  wsClient: WsClient | null
  dispose: () => void
}

/**
 * Create error handling link for Apollo Client
 */
function createErrorLink() {
  return onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        // Skip logging for known suppressed errors
        if (shouldSuppressError(message)) {
          return
        }
        errorLogger.error(new Error(message), {
          component: 'ApolloClient',
          action: 'graphql-error',
          metadata: { locations, path, operation: operation.operationName },
        })
      })
    }

    if (networkError) {
      errorLogger.error(networkError, {
        component: 'ApolloClient',
        action: 'network-error',
        metadata: { operation: operation.operationName },
      })
    }
  })
}

/**
 * Create request logging link (development only)
 */
function createLoggingLink() {
  return new ApolloLink((operation, forward) => {
    // Uncomment to enable verbose GraphQL request logging
    // if (env.isDevelopment) {
    //   const variables = operation.variables
    //   const hasVariables = Object.keys(variables).length > 0
    //   const variablesStr = hasVariables ? JSON.stringify(variables, null, 2) : '(no variables)'
    //   console.log(`[GraphQL Request]: ${operation.operationName}`, variablesStr)
    // }
    return forward(operation)
  })
}

/**
 * Create cache instance with type policies
 */
function createCache() {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Pagination field policy
          transactionsByAddress: {
            keyArgs: ['address'],
            merge(existing, incoming, { args }) {
              if (!args?.pagination?.offset) {
                return incoming
              }
              const merged = existing ? { ...existing } : { nodes: [], totalCount: 0, pageInfo: {} }
              merged.nodes = [...(existing?.nodes ?? []), ...(incoming?.nodes ?? [])]
              merged.totalCount = incoming.totalCount
              merged.pageInfo = incoming.pageInfo
              return merged
            },
          },
          balanceHistory: {
            keyArgs: ['address', 'fromBlock', 'toBlock'],
            merge(existing, incoming, { args }) {
              if (!args?.pagination?.offset) {
                return incoming
              }
              const merged = existing ? { ...existing } : { nodes: [], totalCount: 0, pageInfo: {} }
              merged.nodes = [...(existing?.nodes ?? []), ...(incoming?.nodes ?? [])]
              merged.totalCount = incoming.totalCount
              merged.pageInfo = incoming.pageInfo
              return merged
            },
          },
        },
      },
      // Subscription type - don't cache subscription data
      Subscription: {
        fields: {},
      },
    },
  })
}

/**
 * Create Apollo Client default options
 */
function createDefaultOptions() {
  return {
    watchQuery: {
      // Use cache-and-network to get fresh data while showing cached data immediately
      // This ensures pages stay up-to-date without manual refresh
      fetchPolicy: 'cache-and-network' as const,
      // Enable network status notifications for better real-time updates
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all' as const,
    },
    query: {
      fetchPolicy: 'network-only' as const,
      errorPolicy: 'all' as const,
    },
    mutate: {
      errorPolicy: 'all' as const,
    },
  }
}

/**
 * Create WebSocket client for subscriptions
 */
function createWsClient(wsEndpoint: string): WsClient | null {
  if (typeof window === 'undefined') {
    return null
  }

  return createClient({
    url: wsEndpoint,
    connectionParams: {
      // Add authentication headers if needed
    },
    lazy: true, // Connect only when subscriptions are needed
    keepAlive: REALTIME.WS_KEEPALIVE_INTERVAL, // Send ping every 10 seconds to keep connection alive
    retryAttempts: REALTIME.WS_RETRY_ATTEMPTS, // Reduce retry attempts to fail faster
    retryWait: async (retries) => {
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** retries, REALTIME.WS_RETRY_MAX_WAIT))
      )
    },
    shouldRetry: (errOrCloseEvent) => {
      // Only retry on certain close codes (not on authentication failures)
      if (errOrCloseEvent && typeof errOrCloseEvent === 'object' && 'code' in errOrCloseEvent) {
        const code = (errOrCloseEvent as CloseEvent).code
        // Don't retry on normal closure or going away
        return code !== REALTIME.WS_CLOSE_NORMAL && code !== REALTIME.WS_CLOSE_GOING_AWAY
      }
      return true
    },
    on: {
      error: (wsError) => {
        errorLogger.error(wsError, { component: 'ApolloClient', action: 'websocket-error' })
      },
    },
  })
}

/**
 * Create Apollo Client instance with dynamic network endpoints
 *
 * Factory function that creates a new Apollo Client for a given network.
 * Returns a dispose function to clean up WebSocket connections.
 *
 * @param endpoints - Network endpoints configuration
 * @returns Apollo Client instance with cleanup function
 */
export function createApolloClient(endpoints: NetworkEndpoints): ApolloClientInstance {
  const errorLink = createErrorLink()
  const loggingLink = createLoggingLink()

  // HTTP link for queries/mutations
  const httpLink = new HttpLink({
    uri: endpoints.graphqlEndpoint,
    credentials: 'same-origin',
  })

  // WebSocket link for subscriptions (client-side only)
  const wsClient = createWsClient(endpoints.wsEndpoint)
  const wsLink = wsClient ? new GraphQLWsLink(wsClient) : null

  // Split link: use WebSocket for subscriptions, HTTP for queries/mutations
  const splitLink =
    typeof window !== 'undefined' && wsLink
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query)
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          },
          wsLink,
          httpLink
        )
      : httpLink

  // Create Apollo Client
  const client = new ApolloClient({
    link: from([errorLink, loggingLink, splitLink]),
    cache: createCache(),
    defaultOptions: createDefaultOptions(),
  })

  // Return client with dispose function
  return {
    client,
    wsClient,
    dispose: () => {
      // Clean up WebSocket connection
      if (wsClient) {
        wsClient.dispose()
      }
      // Stop all active queries
      client.stop()
      // Clear cache
      client.clearStore().catch((err) => errorLogger.error(err, { component: 'ApolloClient', action: 'clearStore' }))
    },
  }
}

