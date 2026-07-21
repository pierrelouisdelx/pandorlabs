import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowUpRight,
  Boxes,
  Clock,
  Database,
  FileJson,
  Globe,
  Layers,
  Lock,
  Shield,
  Tags,
} from 'lucide-react'

import { FAQSection } from '../../_components/faq-section'
import { FinalCTASection } from '../../_components/final-cta-section'
import StatsCard from '@/components/custom/stats-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import { buttonVariants } from '@/components/ui/button'
import {
  BRANDS,
  BRANDS_BY_SLUG,
  BRAND_SEGMENT_LABELS,
  relatedBrands,
  type Brand,
} from '@/lib/brands'
import { accentTextGradient, accentTokens } from '@/lib/accent'
import {
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

/**
 * Fields every fashion collector normalises to, regardless of source. Listed
 * per page because "what will I actually get back" is the question these pages
 * exist to answer.
 */
const SHARED_FIELDS = [
  'Product name, brand, and source URL',
  'Current price, original price, and currency',
  'Category and subcategory as the source classifies them',
  'Colour, size, and variant availability',
  'Product images, deduplicated across variants',
  'Description, composition, and care text',
  'Collection timestamp on every record',
]

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.pandorlabs.com'
}

function pageUrl(brand: Brand) {
  return `${siteUrl()}/products/shopping/${brand.slug}`
}

function metaDescription(brand: Brand) {
  return `Structured ${brand.name} product data — prices, variants, availability, and images from ${brand.domain} — normalised and delivered to your warehouse, object storage, or webhooks on the cadence you choose.`
}

/** Generic questions, worded per brand so the answers stay specific. */
function sharedFaqs(brand: Brand) {
  return [
    {
      question: `How is ${brand.name} data delivered?`,
      answer: `Into the systems you already run, rather than through an API you have to integrate against. Normalised records land as JSON, CSV, or Parquet in S3, GCS, or Azure Blob, or straight into Snowflake or BigQuery, on whatever cadence you set. Webhooks can push price and availability changes as they are detected. A solutions engineer fixes the schema, cadence, and destination with you during onboarding, so the first delivery already matches your pipeline.`,
    },
    {
      question: `What happens when ${brand.domain} changes its site?`,
      answer: `Maintaining the collector is our job, not yours. Every field is validated against expected types and historical ranges on each run, and a collector that starts producing anomalies is quarantined rather than allowed to emit bad records. We repair it upstream, and the schema we deliver to you does not move — which is the entire reason to buy this rather than run a scraper in-house.`,
    },
    {
      question: `Is collecting ${brand.name} product data legal?`,
      answer: `We collect only publicly visible catalogue data — the prices, descriptions, images, and availability any shopper sees without logging in. We do not bypass authentication, we do not collect personal data, and we honour rate limits so the source is never disrupted. Our infrastructure is SOC 2 Type II certified, our processing is GDPR and CCPA compliant, and we sign DPAs as part of procurement.`,
    },
    {
      question: `How much does a ${brand.name} feed cost?`,
      answer: `Pricing is scoped per engagement, driven by catalogue size, refresh cadence, the number of locales you need, and the delivery destinations involved. Historical backfill is quoted separately. Every engagement starts with a free sample pulled from the live ${brand.domain} catalogue, so you can check the data against your own benchmarks before committing to anything.`,
    },
  ]
}

export function generateStaticParams() {
  return BRANDS.map((brand) => ({ brand: brand.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand: slug } = await params
  const brand = BRANDS_BY_SLUG[slug]
  if (!brand) return {}

  const title = `${brand.name} Product Data & Price Monitoring | PandorLabs`
  const description = metaDescription(brand)
  const url = pageUrl(brand)

  return {
    title,
    description,
    keywords: [
      `${brand.name} product data`,
      `${brand.name} price monitoring`,
      `${brand.name} scraper`,
      `${brand.name} API`,
      `${brand.name} catalog data`,
      `${brand.domain} data feed`,
      'fashion product data',
      'ecommerce price tracking',
      'retail data feed',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'PandorLabs',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl()}/images/og-image.jpg`],
    },
    alternates: { canonical: url },
  }
}

export default async function BrandDataPage({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand: slug } = await params
  const brand = BRANDS_BY_SLUG[slug]
  if (!brand) notFound()

  const url = pageUrl(brand)
  const accent = accentTokens(brand.accent)
  const headlineGradient = accentTextGradient(accent)
  const related = relatedBrands(brand)
  const faqs = [...brand.faqs, ...sharedFaqs(brand)]

  const serviceSchema = generateServiceSchema({
    name: `${brand.name} Product Data Feed`,
    description: metaDescription(brand),
    url,
    provider: { name: 'Pandor Labs', url: siteUrl() },
    serviceType: 'Retail Product Data Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl() },
    { name: 'Products', url: `${siteUrl()}/products` },
    { name: 'Shopping Monitoring', url: `${siteUrl()}/products/shopping` },
    { name: `${brand.name} Product Data`, url },
  ])

  const webPageSchema = generateWebPageSchema(
    url,
    `${brand.name} Product Data`,
    metaDescription(brand),
  )

  return (
    <div className="bg-primary">
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(serviceSchema) }}
      />
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

      {/* Hero */}
      <section className="bg-primary relative -mt-24 overflow-hidden pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,black,transparent)] bg-[size:4rem_4rem]" />
          <div
            className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
            style={{ backgroundColor: accent.glow }}
          />
        </div>

        <div className="relative z-10 container py-24 lg:py-32">
          {/* Breadcrumb — visible, not just structured data. */}
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
            <span className="text-white">{brand.name}</span>
          </nav>

          <div className="grid items-start gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent.text }}
                />
                <span className="text-sm text-white/70">
                  {BRAND_SEGMENT_LABELS[brand.segment]}
                </span>
              </div>

              <h1 className="text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-6xl/tight">
                {brand.name}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: headlineGradient }}
                >
                  Product Data
                </span>
              </h1>

              <p className="text-xl leading-relaxed text-white/70 md:text-2xl">
                Prices, variants, availability, and images from {brand.domain} —
                normalised, validated, and delivered into your stack. No
                collector to build, and none to maintain.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-full px-8 py-4 text-center font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: accent.base,
                    color: accent.on,
                    boxShadow: `0 0 60px ${accent.glow}`,
                  }}
                >
                  Request a {brand.name} sample
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 px-8 py-4 text-center font-semibold transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  Schedule a demo
                </Link>
              </div>
            </div>

            {/* Source spec panel */}
            <div className="panel p-8">
              <p className="eyebrow mb-6">source specification</p>
              <dl className="space-y-5 text-sm">
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Source
                  </dt>
                  <dd className="text-right font-medium text-white">
                    {brand.domain}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Tags className="h-4 w-4" /> Segment
                  </dt>
                  <dd className="text-right font-medium text-white">
                    {BRAND_SEGMENT_LABELS[brand.segment]}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Origin
                  </dt>
                  <dd className="max-w-[55%] text-right font-medium text-white">
                    {brand.origin}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Boxes className="h-4 w-4" /> Categories
                  </dt>
                  <dd className="max-w-[60%] text-right font-medium text-white">
                    {brand.categories.join(', ')}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <FileJson className="h-4 w-4" /> Formats
                  </dt>
                  <dd className="text-right font-medium text-white">
                    JSON · CSV · Parquet
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6">
                  <dt className="text-gray flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Refresh
                  </dt>
                  <dd className="text-right font-medium text-white">
                    Continuous to daily
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* About the brand + why the data matters */}
      <section className="section section-divided">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <p className="eyebrow">about the source</p>
              <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
                What {brand.name} sells, and how its catalogue behaves
              </h2>
              <p className="text-gray leading-relaxed">{brand.intro}</p>
            </div>
            <div>
              <p className="eyebrow">why teams track it</p>
              <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
                Why {brand.name} data is worth having
              </h2>
              <p className="text-gray mb-8 leading-relaxed">
                {brand.whyItMatters}
              </p>
              <Link
                href={brand.siteUrl}
                rel="nofollow noopener"
                target="_blank"
                className="text-gray inline-flex items-center gap-2 text-sm hover:text-white"
              >
                Visit {brand.domain}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How collection works */}
      <section className="section section-divided">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `radial-gradient(55% 45% at 50% 0%, ${accent.tint}, transparent 70%)`,
          }}
        />
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">collection method</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              How we collect{' '}
              <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: headlineGradient }}
                >
                {brand.name}
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-3xl">
              {brand.name} is collected through {brand.method}. Every source
              gets a dedicated collector rather than a generic crawler, because
              the field detail that makes this data useful only survives if the
              extraction is built for the site it runs against.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Database}
              title="Structured at the source"
              description={`Records are read from ${brand.domain}'s own structured responses wherever they exist, rather than reconstructed from page markup. That keeps the feed stable across visual redesigns.`}
            />
            <TechFeatureCard
              icon={Shield}
              title="Validated every run"
              description="Each field is checked against expected types and historical ranges. A collector producing anomalies is quarantined and repaired upstream instead of emitting bad prices into your pipeline."
            />
            <TechFeatureCard
              icon={Layers}
              title="Normalised to one schema"
              description="Every brand in the catalogue lands on the same schema, so adding a source is a configuration change on your side rather than another integration to write."
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <StatsCard value="15min" label="Fastest refresh" />
            <StatsCard value="99.9%" label="Uptime SLA" />
            <StatsCard value="3" label="Delivery formats" />
            <StatsCard value={`${BRANDS.length}+`} label="Fashion sources" />
          </div>
        </div>
      </section>

      {/* Fields */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">what you get back</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Fields in the{' '}
              <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: headlineGradient }}
                >
                {brand.name} feed
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              A normalised core that is identical across every source, plus the
              attributes that are specific to this one.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="panel p-8">
              <h3 className="mb-6 font-semibold text-white">
                Standard across every source
              </h3>
              <ul className="space-y-3">
                {SHARED_FIELDS.map((field) => (
                  <li key={field} className="text-gray flex gap-3 text-sm">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent.text }}
                    />
                    {field}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-8">
              <h3 className="mb-6 font-semibold text-white">
                Specific to {brand.name}
              </h3>
              <ul className="space-y-3">
                {brand.notableFields.map((field) => (
                  <li key={field} className="text-gray flex gap-3 text-sm">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent.text }}
                    />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products/shopping"
              className={buttonVariants({ variant: 'outline' })}
            >
              See the full shopping data product
            </Link>
            <Link
              href="/products/ai-datasets"
              className={buttonVariants({ variant: 'outline' })}
            >
              Use it as ML training data
            </Link>
          </div>
        </div>
      </section>

      {/* Related sources — the internal linking payload. */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">related sources</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Tracked alongside{' '}
              <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: headlineGradient }}
                >
                {brand.name}
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              A single brand is a data point. These are the sources customers
              most often take with it, all delivered on the same schema.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/products/shopping/${other.slug}`}
                className="panel group p-6 transition-colors hover:border-white/20"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{other.name}</h3>
                  <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="text-gray text-sm">{other.origin}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products/shopping/sources"
              className={buttonVariants({ variant: 'outline' })}
            >
              Browse all {BRANDS.length} fashion sources
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="section section-divided">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: Shield,
                title: 'SOC 2 Type II',
                description:
                  'Audited controls across security, availability, and confidentiality. Report available under NDA.',
              },
              {
                Icon: Lock,
                title: 'GDPR & CCPA',
                description:
                  'Public catalogue data only. No personal data collected, and a DPA is available on request.',
              },
              {
                Icon: Clock,
                title: '99.9% Uptime SLA',
                description:
                  'Contractual availability with monitored collectors and a public status page.',
              },
              {
                Icon: Database,
                title: 'Data residency',
                description:
                  'Choose EU or US processing and storage regions to match your obligations.',
              },
            ].map(({ Icon, title, description }) => (
              <div key={title} className="panel p-6">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accent.well }}
                >
                  <Icon className="h-5 w-5" style={{ color: accent.text }} />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-gray text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} accentColor={accent.text} />

      <FinalCTASection
        accentColor={accent.base}
        accentGlow={accent.glow}
        accentTextColor={accent.on}
      />
    </div>
  )
}
