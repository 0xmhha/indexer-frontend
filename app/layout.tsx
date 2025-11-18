import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/lib/providers/Providers'

export const metadata: Metadata = {
  title: 'Stable-One Explorer | Blockchain Indexer',
  description:
    'Crystalline Infrastructure - Production-ready blockchain explorer for Stable-One (Ethereum-based) chain',
  keywords: ['blockchain', 'explorer', 'ethereum', 'stable-one', 'indexer'],
  authors: [{ name: 'Stable-One Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-bg-primary font-sans text-text-primary antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
