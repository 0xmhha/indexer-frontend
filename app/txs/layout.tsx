import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transactions | StableNet Explorer',
  description: 'Browse all transactions on the StableNet blockchain',
}

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
