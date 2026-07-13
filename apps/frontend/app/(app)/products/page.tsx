import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  Building2,
  Users,
  ShoppingCart,
  Bitcoin,
  Brain,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  Scale,
  Activity,
  Globe,
} from 'lucide-react'

import helper from '@/lib/helper'
import { buttonVariants } from '@/components/ui/button'
import StatsCard from '@/components/custom/stats-card'
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

export const metadata: Metadata = {
  title: 'Products | Web Scraping & Web Data APIs | PandorLabs',
  description:
    'Ready-to-use web data products: real estate, lead generation, e-commerce price monitoring, crypto market data, AI training datasets, and social media intelligence. Delivered as clean datasets or APIs.',
  keywords: [
    'web scraping api',
    'web data api',
    'data extraction products',
    'real estate data api',
    'lead generation api',
    'price monitoring api',
    'crypto data api',
    'ai training datasets',
    'social media data api',
    'web scraping service',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'Products | Web Scraping & Web Data APIs | PandorLabs',
    description:
      'Ready-to-use web data products across real estate, lead generation, e-commerce, crypto, AI datasets, and social media — delivered as clean datasets or APIs.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | Web Scraping & Web Data APIs | PandorLabs',
    description:
      'Ready-to-use web data products across real estate, lead generation, e-commerce, crypto, AI datasets, and social media.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
  },
}

const products = [
  {
    icon: Building2,
    title: 'Real Estate Data',
    href: '/products/real-estate',
    tagline: 'Listings, valuations, and market movement',
    description:
      'Property listings, price history, and market trends from portals and agency sites — normalised into one schema so a listing in Paris and a listing in Miami compare cleanly.',
  },
  {
    icon: Users,
    title: 'Lead Generation',
    href: '/products/lead-generation',
    tagline: 'Verified B2B contacts and firmographics',
    description:
      'Company and decision-maker data with verified emails, enriched in real time and filtered against suppression lists. GDPR and CCPA handling built into the pipeline.',
  },
  {
    icon: ShoppingCart,
    title: 'Shopping & Price Monitoring',
    href: '/products/shopping',
    tagline: 'Competitor pricing, stock, and reviews',
    description:
      'Track SKUs, prices, availability, and reviews across marketplaces and retail sites. Get alerted the hour a competitor moves, not at the end of the month.',
  },
  {
    icon: Bitcoin,
    title: 'Crypto Data',
    href: '/products/crypto',
    tagline: 'Exchange prices and on-chain analytics',
    description:
      'Real-time prices, order books, and multi-chain analytics from hundreds of exchanges, with the latency and uptime a trading system actually needs.',
  },
  {
    icon: Brain,
    title: 'AI Datasets',
    href: '/products/ai-datasets',
    tagline: 'Training corpora, built to your spec',
    description:
      'Custom text, vision, and structured datasets assembled from public sources — deduplicated, filtered, and documented with provenance for every record.',
  },
  {
    icon: Megaphone,
    title: 'Social Media Data',
    href: '/products/social-media',
    tagline: 'Public posts, engagement, and trends',
    description:
      'Brand mentions, engagement metrics, and trend signals from public social content, delivered as a stream or a scheduled dataset drop.',
  },
]

const guarantees = [
  {
    icon: ShieldCheck,
    title: 'SOC 2 Type II',
    description: 'Audited annually. Security review packet available up front.',
  },
  {
    icon: Scale,
    title: 'GDPR & CCPA',
    description:
      'Public data only, documented provenance, DPA signed before delivery.',
  },
  {
    icon: Activity,
    title: '99.9% uptime SLA',
    description:
      'Credit-backed, with self-repairing extractors when a source changes.',
  },
  {
    icon: Globe,
    title: 'Any delivery target',
    description:
      'REST API, webhooks, S3, GCS, Snowflake, BigQuery. JSON, CSV, or Parquet.',
  },
]

export default function ProductsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products`,
    'Products | Web Scraping & Web Data APIs | PandorLabs',
    'Ready-to-use web data products across real estate, lead generation, e-commerce, crypto, AI datasets, and social media.',
  )

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PandorLabs web data products',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      description: product.description,
      url: `${siteUrl}${product.href}`,
    })),
  }

  return (
    <>
      <Script
        id="products-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbSchema) }}
      />
      <Script
        id="products-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(webPageSchema) }}
      />
      <Script
        id="products-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListSchema) }}
      />

      {/* Hero */}
      <section className="section -mt-24 flex min-h-[70vh] items-center pt-40 lg:pt-48">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[140px]"
          style={{ backgroundColor: 'var(--color-green-light)' }}
        />
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">products</p>
            <h1 className="mb-6 text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-6xl/tight">
              Web Data,{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Already Solved
              </span>
            </h1>
            <p className="text-gray mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Six domains where we have already done the hard part — the
              sources, the schema, the anti-bot work, the maintenance. Pick the
              one that matches your problem, or bring us a source we have never
              seen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request a sample dataset
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Talk to a solutions engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="section section-divided section-glow">
        <div className="relative z-10 container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map(({ icon: Icon, title, href, tagline, description }) => (
              <Link key={href} href={href} className="panel group flex flex-col p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                  <Icon className="text-green-light h-7 w-7" />
                </div>
                <h2 className="group-hover:text-green-light mb-2 text-lg font-semibold text-white transition-colors duration-300">
                  {title}
                </h2>
                <p className="text-green-light/80 mb-3 text-sm">{tagline}</p>
                <p className="text-gray mb-6 flex-1 text-sm leading-relaxed">
                  {description}
                </p>
                <span className="text-green-light inline-flex items-center gap-2 text-sm font-medium">
                  Explore {title}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What every product includes */}
      <section className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">included with every product</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              The Same Guarantees,{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Whatever You Extract
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              The product changes. The compliance posture, the reliability, and
              the delivery options do not.
            </p>
          </div>

          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map(({ icon: Icon, title, description }) => (
              <div key={title} className="panel group p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                  <Icon className="text-green-light h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-gray text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard value="99.7%" label="Extraction success rate" />
            <StatsCard value="<2s" label="Median response" />
            <StatsCard value="Any site" label="Source coverage" />
            <StatsCard value="10K+" label="Datasets per month" />
          </div>
        </div>
      </section>

      {/* Custom source CTA */}
      <section className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Your Source Isn&apos;t on This Page?{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                That&apos;s the Normal Case.
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              These six are the ones we have productised. The engine underneath
              is source-agnostic — send us the sites you care about and the
              fields you need, and we will come back with a sample extracted
              from the real thing.
            </p>
            <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
              Describe your data request
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
