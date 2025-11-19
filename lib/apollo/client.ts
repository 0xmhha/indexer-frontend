import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
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
 * Apollo Client instance with error handling and caching
 */
export const apolloClient = new ApolloClient({
  link: from([errorLink, loggingLink, httpLink]),
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
