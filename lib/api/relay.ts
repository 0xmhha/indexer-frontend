/**
 * API Relay - GraphQL Client Wrapper for Server-Side
 * Provides direct GraphQL queries without React hooks
 */

import { ApolloClient, InMemoryCache, HttpLink, DocumentNode, NormalizedCacheObject } from '@apollo/client'
import { env } from '@/lib/config/env'
import { IndexerConnectionError, IndexerQueryError } from './errors'

/**
 * Timeout duration for GraphQL queries (ms)
 */
const QUERY_TIMEOUT = 10000

/**
 * Create a server-side Apollo Client instance
 * This is used for API routes where React hooks are not available
 */
function createServerClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({
      uri: env.graphqlEndpoint,
      fetch: async (uri, options) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT)

        try {
          const response = await fetch(uri, {
            ...options,
            signal: controller.signal,
          })
          return response
        } finally {
          clearTimeout(timeoutId)
        }
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  })
}

// Singleton server client
let serverClient: ApolloClient<NormalizedCacheObject> | null = null

function getServerClient(): ApolloClient<NormalizedCacheObject> {
  if (!serverClient) {
    serverClient = createServerClient()
  }
  return serverClient
}

/**
 * Execute a GraphQL query against the Indexer Server
 *
 * @param query - GraphQL document node
 * @param variables - Query variables
 * @returns Query result data
 * @throws IndexerConnectionError on network failures
 * @throws IndexerQueryError on GraphQL errors
 */
export async function queryIndexer<T>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = getServerClient()

  try {
    const { data, errors } = await client.query({
      query,
      variables: variables || {},
      fetchPolicy: 'network-only',
    })

    if (errors && errors.length > 0) {
      // Filter out "not supported" errors and throw if any real errors remain
      const realErrors = errors.filter(
        (e) =>
          !e.message.includes('does not support address indexing') &&
          !e.message.includes('does not support consensus operations')
      )

      const firstError = realErrors[0]
      if (firstError) {
        throw new IndexerQueryError(firstError.message)
      }
    }

    return data as T
  } catch (error) {
    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new IndexerConnectionError(new Error('Request timeout'))
    }

    // Handle network errors
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('network')
      ) {
        throw new IndexerConnectionError(error)
      }
    }

    // Re-throw IndexerQueryError as-is
    if (error instanceof IndexerQueryError) {
      throw error
    }

    // Wrap unknown errors
    if (error instanceof Error) {
      throw new IndexerQueryError(error.message)
    }

    throw new IndexerQueryError('Unknown error occurred')
  }
}

/**
 * Execute multiple GraphQL queries in parallel
 *
 * @param queries - Array of query configs
 * @returns Array of results in same order as queries
 */
export async function queryIndexerParallel<T extends unknown[]>(
  queries: Array<{ query: DocumentNode; variables?: Record<string, unknown> }>
): Promise<T> {
  const results = await Promise.all(
    queries.map(({ query, variables }) => queryIndexer(query, variables))
  )
  return results as T
}
