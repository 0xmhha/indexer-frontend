import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Statistics | StableNet Explorer',
  description: 'Network statistics and analytics for StableNet',
}

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
