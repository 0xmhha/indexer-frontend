'use client'

import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo/client'
import { ReactNode } from 'react'

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
}
