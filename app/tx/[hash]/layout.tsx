import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transaction Details | StableNet Explorer',
  description: 'View transaction details and status on StableNet',
}

export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
