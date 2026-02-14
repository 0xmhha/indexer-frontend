import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Epoch Details | StableNet Explorer',
  description: 'View epoch details and validator participation on StableNet',
}

export default function EpochLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
