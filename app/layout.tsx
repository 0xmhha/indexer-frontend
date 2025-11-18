import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/lib/providers/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Stable-One Explorer | Blockchain Indexer',
    template: '%s | Stable-One Explorer',
  },
  description:
    'Crystalline Infrastructure - Production-ready blockchain explorer for Stable-One (Ethereum-based) chain. Real-time blockchain data, transactions, blocks, and smart contracts.',
  keywords: [
    'blockchain',
    'explorer',
    'ethereum',
    'stable-one',
    'indexer',
    'crypto',
    'transactions',
    'blocks',
    'smart contracts',
  ],
  authors: [{ name: 'Stable-One Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://explorer.stable-one.com',
    title: 'Stable-One Explorer | Blockchain Indexer',
    description:
      'Real-time blockchain explorer for Stable-One chain. View blocks, transactions, addresses, and smart contracts.',
    siteName: 'Stable-One Explorer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stable-One Explorer | Blockchain Indexer',
    description:
      'Real-time blockchain explorer for Stable-One chain. View blocks, transactions, addresses, and smart contracts.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
