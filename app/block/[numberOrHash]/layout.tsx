import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Block Details | StableNet Explorer',
  description: 'View block details and transactions on StableNet',
}

export default function BlockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
