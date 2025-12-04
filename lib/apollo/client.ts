import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { onError } from '@apollo/client/link/error'
import { createClient } from 'graphql-ws'
import { env } from '@/lib/config/env'
import { REALTIME } from '@/lib/config/constants'

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
 * Error handling link for Apollo Client
 * Logs GraphQL and network errors (except known suppressed errors)
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // Skip logging for known suppressed errors
      if (shouldSuppressError(message)) {
        return
      }
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}, Operation: ${operation.operationName}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError.message}, Operation: ${operation.operationName}`)
  }
})

/**
 * HTTP link for GraphQL endpoint
 */
const httpLink = new HttpLink({
  uri: env.graphqlEndpoint,
  credentials: 'same-origin',
})

/**
 * WebSocket link for GraphQL subscriptions
 * Uses dedicated WebSocket endpoint (env.wsEndpoint)
 */
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: env.wsEndpoint,
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
            error: (_error) => {
              console.error('[WebSocket]: Connection failed')
            },
          },
        })
      )
    : null

/**
 * Split link: use WebSocket for subscriptions, HTTP for queries/mutations
 */
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

/**
 * Request logging link (development only)
 * Disabled by default to reduce console noise
 */
const loggingLink = new ApolloLink((operation, forward) => {
  // Uncomment to enable verbose GraphQL request logging
  // if (env.isDevelopment) {
  //   const variables = operation.variables
  //   const hasVariables = Object.keys(variables).length > 0
  //   const variablesStr = hasVariables ? JSON.stringify(variables, null, 2) : '(no variables)'
  //   console.log(`[GraphQL Request]: ${operation.operationName}`, variablesStr)
  // }
  return forward(operation)
})

/**
 * Apollo Client instance with error handling, caching, and WebSocket support
 */
export const apolloClient = new ApolloClient({
  link: from([errorLink, loggingLink, splitLink]),
  cache: new InMemoryCache({
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
  }),
  defaultOptions: {
    watchQuery: {
      // Use cache-and-network to get fresh data while showing cached data immediately
      // This ensures pages stay up-to-date without manual refresh
      fetchPolicy: 'cache-and-network',
      // Enable network status notifications for better real-time updates
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
    },
    query: {
      // @ts-expect-error - Apollo Client type mismatch between WatchQueryFetchPolicy and FetchPolicy
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})
