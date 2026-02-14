import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Address Details | StableNet Explorer',
  description:
    'View address details, balance, and transaction history on StableNet',
}

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
