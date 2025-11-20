import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/lib/providers/Providers'
import { WebSiteJsonLd } from '@/components/seo/JsonLd'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Stable-One Explorer'
const siteDescription = 'Real-time blockchain explorer for Stable-One chain. View blocks, transactions, addresses, and smart contracts.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Blockchain Indexer`,
    template: `%s | ${siteName}`,
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${siteName} | Blockchain Indexer`,
    description:
      'Real-time blockchain explorer for Stable-One chain. View blocks, transactions, addresses, and smart contracts.',
    siteName: siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | Blockchain Indexer`,
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <WebSiteJsonLd
          name={siteName}
          url={siteUrl}
          description={siteDescription}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-bg-primary font-sans text-text-primary antialiased">
        {/* Skip Navigation Link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent-blue focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-bg-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
        >
          Skip to main content
        </a>
        <Providers>
          <Header />
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
