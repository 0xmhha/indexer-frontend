import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contract Interaction | StableNet Explorer',
  description: 'Read and write to smart contracts on StableNet',
}

export default function ContractLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
