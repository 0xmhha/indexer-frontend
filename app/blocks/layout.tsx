import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blocks | StableNet Explorer',
  description: 'Browse all blocks on the StableNet blockchain',
}

export default function BlocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
