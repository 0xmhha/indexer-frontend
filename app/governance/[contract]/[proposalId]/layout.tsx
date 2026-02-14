import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proposal Details | StableNet Explorer',
  description:
    'View governance proposal details and voting status on StableNet',
}

export default function ProposalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
