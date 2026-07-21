import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowUpRight, Database, Layers, Shield } from 'lucide-react'

import { FinalCTASection } from '../../_components/final-cta-section'
import StatsCard from '@/components/custom/stats-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import { buttonVariants } from '@/components/ui/button'
import { BRANDS, brandsBySegment } from '@/lib/brands'
import { accentTokens } from '@/lib/accent'
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

const accentColor = '#F59E0B'
const accentGlow = 'rgba(245, 158, 11, 0.15)'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pandorlabs.com'
const pageUrl = `${siteUrl}/products/shopping/sources`

const description = `Dedicated product data feeds for ${BRANDS.length} fashion and retail sources — from Zara and H&M to Farfetch, SSENSE, and independent Italian ateliers. Prices, variants, and availability normalised to one schema.`

export const metadata: Metadata = {
  title: `Fashion & Retail Data Sources — ${BRANDS.length} Brands | PandorLabs`,
  description,
  keywords: [
    'fashion product data',
    'retail data sources',
    'ecommerce price monitoring',
    'fashion scraper',
    'apparel data feed',
    'luxury retail data',
    'product catalog API',
  ],
  openGraph: {
    title: `Fashion & Retail Data Sources | PandorLabs`,
    description,
    type: 'website',
    url: pageUrl,
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Fashion & Retail Data Sources | PandorLabs`,
    description,
    images: [`${siteUrl}/images/og-image.jpg`],
  },
  alternates: { canonical: pageUrl },
}

export default function ShoppingSourcesPage() {
  const groups = brandsBySegment()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'Shopping Monitoring', url: `${siteUrl}/products/shopping` },
    { name: 'Data Sources', url: pageUrl },
  ])

  const webPageSchema = generateWebPageSchema(
    pageUrl,
    'Fashion & Retail Data Sources',
    description,
  )

  // An ItemList makes the full source roster legible to crawlers even before
  // they follow every link.
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PandorLabs fashion and retail data sources',
    numberOfItems: BRANDS.length,
    itemListElement: BRANDS.map((brand, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${brand.name} Product Data`,
      url: `${siteUrl}/products/shopping/${brand.slug}`,
    })),
  }

  return (
    <div className="bg-primary">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbSchema) }}
      />
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(webPageSchema) }}
      />
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(itemListSchema) }}
      />

      <section className="bg-primary relative -mt-24 overflow-hidden pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,black,transparent)] bg-[size:4rem_4rem]" />
          <div
            className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
            style={{ backgroundColor: accentGlow }}
          />
        </div>

        <div className="relative z-10 container py-24 lg:py-28">
          <nav
            aria-label="Breadcrumb"
            className="text-gray mb-8 flex flex-wrap items-center gap-2 text-sm"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/products" className="hover:text-white">
              Products
            </Link>
            <span aria-hidden>/</span>
            <Link href="/products/shopping" className="hover:text-white">
              Shopping Monitoring
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">Data sources</span>
          </nav>

          <div className="max-w-4xl space-y-8">
            <h1 className="text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-6xl/tight">
              {BRANDS.length} fashion sources,{' '}
              <span className="bg-linear-to-l from-amber-400 to-amber-500 bg-clip-text text-transparent">
                one schema
              </span>
            </h1>
            <p className="text-xl leading-relaxed text-white/70 md:text-2xl">
              Every brand below has a dedicated collector, built for that
              storefront rather than crawled generically — because the
              attributes that make retail data useful only survive extraction
              that was designed for the source.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="text-primary rounded-full px-8 py-4 text-center font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 60px ${accentGlow}`,
                }}
              >
                Request a sample dataset
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/20 px-8 py-4 text-center font-semibold transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                Ask for a source we don&apos;t list
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Layers}
              title="One schema, every source"
              description="Adding a brand is a configuration change on your side, not another integration. The same fields arrive whether the source is a GraphQL API or a Wix storefront."
            />
            <TechFeatureCard
              icon={Database}
              title="Purpose-built collectors"
              description="Each source is read through its own structured layer — commerce platform APIs, GraphQL, or embedded page data — so brand-specific attributes survive rather than flattening out."
            />
            <TechFeatureCard
              icon={Shield}
              title="Maintained for you"
              description="Sites change constantly. Repairing collectors is our job, and the schema we deliver stays fixed while the extraction underneath it moves."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value={`${BRANDS.length}`} label="Dedicated collectors" />
            <StatsCard value="15min" label="Fastest refresh" />
            <StatsCard value="3" label="Delivery formats" />
            <StatsCard value="99.9%" label="Uptime SLA" />
          </div>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.segment} className="section section-divided">
          <div className="container">
            <div className="mb-10">
              <p className="eyebrow">{group.brands.length} sources</p>
              <h2 className="text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
                {group.label}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/products/shopping/${brand.slug}`}
                  className="panel group flex flex-col gap-2 p-6 transition-colors hover:border-white/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2.5 font-semibold text-white">
                      {/* Each source carries its own colour through to its
                          page, so the swatch previews where the link goes. */}
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: accentTokens(brand.accent).text,
                        }}
                      />
                      {brand.name}
                    </h3>
                    <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-gray text-sm">{brand.origin}</p>
                  <p className="text-gray/70 mt-1 text-xs">
                    {brand.categories.slice(0, 3).join(' · ')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section section-divided">
        <div className="container text-center">
          <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
            Looking for a different kind of data?
          </h2>
          <p className="text-gray mx-auto mb-10 max-w-2xl">
            The same delivery model, validation, and schema discipline runs
            across every category we cover.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products/shopping"
              className={buttonVariants({ variant: 'outline' })}
            >
              Shopping monitoring
            </Link>
            <Link
              href="/products/social-media"
              className={buttonVariants({ variant: 'outline' })}
            >
              Social media data
            </Link>
            <Link
              href="/products/real-estate"
              className={buttonVariants({ variant: 'outline' })}
            >
              Real estate data
            </Link>
            <Link
              href="/products/ai-datasets"
              className={buttonVariants({ variant: 'outline' })}
            >
              AI datasets
            </Link>
          </div>
        </div>
      </section>

      <FinalCTASection accentColor={accentColor} accentGlow={accentGlow} />
    </div>
  )
}
