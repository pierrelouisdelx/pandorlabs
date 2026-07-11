import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate Data API | PandorLabs',
  description:
    'Access 140M+ property records with ML-powered insights. Real-time MLS feeds, 94% valuation accuracy, and <50ms API response times for investment analysis.',
  keywords: [
    'real estate API',
    'property data API',
    'MLS data',
    'property valuation',
    'real estate intelligence',
    'investment analysis',
    'property records',
    'real estate market data',
    'PropTech',
    'automated underwriting',
  ],
  openGraph: {
    title: 'Real Estate Data API | PandorLabs',
    description:
      'Access 140M+ property records with ML-powered insights. Real-time MLS feeds, 94% valuation accuracy, and <50ms API response times.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL + '/products/real-estate',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate Data API | PandorLabs',
    description:
      'Access 140M+ property records with ML-powered insights. Real-time MLS feeds, 94% valuation accuracy, and <50ms API response times.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/real-estate`,
  },
}

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
