import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-commerce Price Monitoring API | PandorLabs',
  description:
    'Monitor 30.7M+ stores with real-time price tracking. Detect MAP violations, track competitor pricing, and optimize dynamic pricing strategies across all marketplaces.',
  keywords: [
    'price monitoring API',
    'e-commerce intelligence',
    'MAP violation detection',
    'competitor pricing',
    'dynamic pricing',
    'marketplace monitoring',
    'price tracking',
    'e-commerce data API',
    'retail intelligence',
    'product price API',
  ],
  openGraph: {
    title: 'E-commerce Price Monitoring API | PandorLabs',
    description:
      'Monitor 30.7M+ stores with real-time price tracking. Detect MAP violations, track competitor pricing, and optimize dynamic pricing strategies.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL + '/products/shopping',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-commerce Price Monitoring API | PandorLabs',
    description:
      'Monitor 30.7M+ stores with real-time price tracking. Detect MAP violations, track competitor pricing, and optimize dynamic pricing strategies.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/shopping`,
  },
}

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
