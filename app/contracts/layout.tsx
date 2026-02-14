import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contracts | StableNet Explorer',
  description: 'Browse verified smart contracts on StableNet',
}

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
