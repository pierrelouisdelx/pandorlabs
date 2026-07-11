import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cryptocurrency Data API | PandorLabs',
  description:
    'Real-time crypto market data from 400+ exchanges with <50ms latency. Track prices, trading volumes, and blockchain metrics across all major cryptocurrencies.',
  keywords: [
    'cryptocurrency API',
    'crypto market data',
    'crypto prices API',
    'trading API',
    'blockchain data',
    'DeFi API',
    'crypto exchange data',
    'real-time crypto prices',
    'cryptocurrency analytics',
    'trading platforms API',
  ],
  openGraph: {
    title: 'Cryptocurrency Data API | PandorLabs',
    description:
      'Real-time crypto market data from 400+ exchanges with <50ms latency. Track prices, trading volumes, and blockchain metrics.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL + '/products/crypto',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptocurrency Data API | PandorLabs',
    description:
      'Real-time crypto market data from 400+ exchanges with <50ms latency. Track prices, trading volumes, and blockchain metrics.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/crypto`,
  },
}

export default function CryptoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
