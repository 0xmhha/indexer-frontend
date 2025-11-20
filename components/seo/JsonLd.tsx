interface WebSiteJsonLdProps {
  name: string
  url: string
  description: string
}

export function WebSiteJsonLd({ name, url, description }: WebSiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BlockJsonLdProps {
  blockNumber: string
  blockHash: string
  timestamp: string
  miner: string
  transactionCount: number
  url: string
}

export function BlockJsonLd({
  blockNumber,
  blockHash,
  timestamp,
  miner,
  transactionCount,
  url,
}: BlockJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Block #${blockNumber}`,
    description: `Blockchain block ${blockNumber} with ${transactionCount} transactions, mined by ${miner}`,
    url,
    dateCreated: timestamp,
    identifier: blockHash,
    creator: {
      '@type': 'Organization',
      name: miner,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface TransactionJsonLdProps {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber: string
  url: string
}

export function TransactionJsonLd({
  hash,
  from,
  to,
  value,
  blockNumber,
  url,
}: TransactionJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MoneyTransfer',
    identifier: hash,
    url,
    description: `Transaction from ${from} to ${to || 'Contract Creation'} in block ${blockNumber}`,
    amount: {
      '@type': 'MonetaryAmount',
      value,
      currency: 'STABLEONE',
    },
    provider: {
      '@type': 'Organization',
      name: from,
    },
    ...(to && {
      recipient: {
        '@type': 'Organization',
        name: to,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface AddressJsonLdProps {
  address: string
  balance: string
  url: string
}

export function AddressJsonLd({ address, balance, url }: AddressJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialAccount',
    identifier: address,
    url,
    description: `Blockchain address ${address}`,
    accountMinimumInflow: {
      '@type': 'MonetaryAmount',
      value: balance,
      currency: 'STABLEONE',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
