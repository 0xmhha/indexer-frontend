import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gas Tracker | StableNet Explorer',
  description: 'Track gas prices and fee estimation on StableNet',
}

export default function GasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
