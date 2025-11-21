import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { onError } from '@apollo/client/link/error'
import { createClient } from 'graphql-ws'
import { env } from '@/lib/config/env'

/**
 * Error handling link for Apollo Client
 * Logs GraphQL and network errors
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
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
 * Converts http/https URLs to ws/wss for WebSocket connection
 */
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: env.graphqlEndpoint.replace(/^http/, 'ws'),
          connectionParams: {
            // Add authentication headers if needed
          },
          on: {
            connected: () => {
              if (env.isDevelopment) {
                console.log('[WebSocket]: Connected')
              }
            },
            closed: () => {
              if (env.isDevelopment) {
                console.log('[WebSocket]: Closed')
              }
            },
            error: (error) => {
              console.error('[WebSocket Error]:', error)
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
 */
const loggingLink = new ApolloLink((operation, forward) => {
  if (env.isDevelopment) {
    const variables = operation.variables
    const hasVariables = Object.keys(variables).length > 0
    const variablesStr = hasVariables ? JSON.stringify(variables, null, 2) : '(no variables)'
    console.log(`[GraphQL Request]: ${operation.operationName}`, variablesStr)
  }
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
    },
  }),
  defaultOptions: {
    watchQuery: {
      // Use cache-first to prevent flickering, data shows immediately from cache
      // Components can override with refetch() when needed
      fetchPolicy: 'cache-first',
      // Don't notify on network status changes to prevent loading state flicker
      notifyOnNetworkStatusChange: false,
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})
