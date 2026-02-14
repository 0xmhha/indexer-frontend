import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search | StableNet Explorer',
  description:
    'Search for addresses, transactions, blocks, and contracts on StableNet',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
