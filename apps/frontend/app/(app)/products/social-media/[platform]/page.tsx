import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowUpRight,
  Clock,
  Database,
  FileJson,
  Globe,
  Layers,
  Lock,
  MessagesSquare,
  Shield,
} from 'lucide-react'

import { FAQSection } from '../../_components/faq-section'
import { FinalCTASection } from '../../_components/final-cta-section'
import StatsCard from '@/components/custom/stats-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import UseCaseCard from '@/components/custom/use-case-card'
import { buttonVariants } from '@/components/ui/button'
import {
  SOCIAL_SOURCES,
  SOCIAL_SOURCES_BY_SLUG,
  relatedSocialSources,
  type SocialSource,
} from '@/lib/social-sources'
import { BRANDS } from '@/lib/brands'
import { accentTextGradient, accentTokens } from '@/lib/accent'
import {
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.pandorlabs.com'
}

function pageUrl(source: SocialSource) {
  return `${siteUrl()}/products/social-media/${source.slug}`
}

function metaDescription(source: SocialSource) {
  return `Structured ${source.name} data — ${source.objectTypes
    .slice(0, 3)
    .join(', ')
    .toLowerCase()} and engagement metrics from ${
    source.domain
  } — normalised and delivered to your warehouse, object storage, or webhooks.`
}

function sharedFaqs(source: SocialSource) {
  return [
    {
      question: `How is ${source.name} data delivered?`,
      answer: `Into the systems you already run. Normalised records land as JSON, CSV, or Parquet in S3, GCS, or Azure Blob, or straight into Snowflake or BigQuery, on whatever cadence you set. Webhooks push matches to your endpoints as they are detected, which is how most customers wire alerting. A solutions engineer sets the schema, cadence, and destination with you during onboarding.`,
    },
    {
      question: `What happens when ${source.domain} changes?`,
      answer: `Keeping the collector working is our responsibility. Extractors are monitored continuously, and when the platform changes its structure we patch upstream while the schema we deliver to you stays fixed. If a change causes a coverage gap we tell you which window was affected rather than quietly returning fewer records.`,
    },
    {
      question: `How does pricing work for a ${source.name} feed?`,
      answer: `Pricing is scoped per engagement — the number of tracked terms, handles, or communities, the refresh cadence, and the delivery destinations involved. Historical backfill is quoted separately. Every engagement starts with a free sample run against your own brand terms, so you can judge the data before committing.`,
    },
  ]
}

export function generateStaticParams() {
  return SOCIAL_SOURCES.map((source) => ({ platform: source.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>
}): Promise<Metadata> {
  const { platform } = await params
  const source = SOCIAL_SOURCES_BY_SLUG[platform]
  if (!source) return {}

  const title = `${source.name} Data API & Monitoring | PandorLabs`
  const description = metaDescription(source)
  const url = pageUrl(source)

  return {
    title,
    description,
    keywords: [
      `${source.name} data`,
      `${source.name} API`,
      `${source.name} scraper`,
      `${source.name} monitoring`,
      `${source.name} data extraction`,
      `${source.domain} data feed`,
      'social media data',
      'social listening data',
      'brand monitoring',
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

export default async function SocialSourcePage({
  params,
}: {
  params: Promise<{ platform: string }>
}) {
  const { platform } = await params
  const source = SOCIAL_SOURCES_BY_SLUG[platform]
  if (!source) notFound()

  const url = pageUrl(source)
  const accent = accentTokens(source.accent)
  const headlineGradient = accentTextGradient(accent)
  const related = relatedSocialSources(source)
  const faqs = [...source.faqs, ...sharedFaqs(source)]

  const serviceSchema = generateServiceSchema({
    name: `${source.name} Data Feed`,
    description: metaDescription(source),
    url,
    provider: { name: 'Pandor Labs', url: siteUrl() },
    serviceType: 'Social Media Data Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl() },
    { name: 'Products', url: `${siteUrl()}/products` },
    { name: 'Social Media Data', url: `${siteUrl()}/products/social-media` },
    { name: `${source.name} Data`, url },
  ])

  const webPageSchema = generateWebPageSchema(
    url,
    `${source.name} Data`,
    metaDescription(source),
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
            <Link href="/products/social-media" className="hover:text-white">
              Social Media Data
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{source.name}</span>
          </nav>

          <div className="grid items-start gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent.text }}
                />
                <span className="text-sm text-white/70">{source.tagline}</span>
              </div>

              <h1 className="text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-6xl/tight">
                {source.name}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: headlineGradient }}
                >
                  Data, Delivered
                </span>
              </h1>

              <p className="text-xl leading-relaxed text-white/70 md:text-2xl">
                Public {source.name} content and engagement metrics, normalised
                to the same schema as every other platform we cover and pushed
                into your stack. Nothing to build, nothing to maintain.
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
                  Request a {source.name} sample
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 px-8 py-4 text-center font-semibold transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  Schedule a demo
                </Link>
              </div>
            </div>

            <div className="panel p-8">
              <p className="eyebrow mb-6">source specification</p>
              <dl className="space-y-5 text-sm">
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Source
                  </dt>
                  <dd className="text-right font-medium text-white">
                    {source.domain}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4" /> Objects
                  </dt>
                  <dd className="max-w-[60%] text-right font-medium text-white">
                    {source.objectTypes.join(', ')}
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
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                  <dt className="text-gray flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Refresh
                  </dt>
                  <dd className="text-right font-medium text-white">
                    Continuous to daily
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-6">
                  <dt className="text-gray flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Scope
                  </dt>
                  <dd className="text-right font-medium text-white">
                    Public content only
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* About + why */}
      <section className="section section-divided">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <p className="eyebrow">about the platform</p>
              <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
                What makes {source.name} different
              </h2>
              <p className="text-gray leading-relaxed">{source.intro}</p>
            </div>
            <div>
              <p className="eyebrow">why teams track it</p>
              <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-4xl/[52px]">
                Why {source.name} data is worth having
              </h2>
              <p className="text-gray mb-8 leading-relaxed">
                {source.whyItMatters}
              </p>
              <Link
                href={source.siteUrl}
                rel="nofollow noopener"
                target="_blank"
                className="text-gray inline-flex items-center gap-2 text-sm hover:text-white"
              >
                Visit {source.domain}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
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
            <p className="eyebrow">applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              What teams build on{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: headlineGradient }}
              >
                {source.name} data
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {source.useCases.map((useCase) => (
              <UseCaseCard
                key={useCase.title}
                icon={MessagesSquare}
                title={useCase.title}
                description={useCase.description}
              />
            ))}
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
                {source.name} feed
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Platform-specific detail on top of the unified social schema, so a
              dashboard built on one platform works on the next without a
              rewrite.
            </p>
          </div>

          <div className="panel mx-auto max-w-3xl p-8">
            <ul className="space-y-3">
              {source.notableFields.map((field) => (
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

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Database}
              title="Public surfaces only"
              description="We collect what a logged-out visitor can see. No authentication is bypassed, no private content is touched, and no attempt is made to deanonymise anyone."
            />
            <TechFeatureCard
              icon={Layers}
              title="One schema across platforms"
              description="A post from any network arrives with the same field names, so adding a platform does not mean rewriting anything downstream."
            />
            <TechFeatureCard
              icon={Lock}
              title="Deletion propagates"
              description="When content is removed at source it drops out of subsequent deliveries, and retention windows on delivered data are configurable per engagement."
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <StatsCard value="10+" label="Platforms covered" />
            <StatsCard value="<60s" label="Detection latency" />
            <StatsCard value="3" label="Delivery formats" />
            <StatsCard value="99.9%" label="Uptime SLA" />
          </div>
        </div>
      </section>

      {/* Related sources */}
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
                {source.name}
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              One platform is a partial view. These deliver on the same schema,
              so combining them is a configuration change rather than a project.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/products/social-media/${other.slug}`}
                className="panel group p-6 transition-colors hover:border-white/20"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{other.name}</h3>
                  <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="text-gray text-sm">{other.tagline}</p>
              </Link>
            ))}

            <Link
              href="/products/social-media"
              className="panel group p-6 transition-colors hover:border-white/20"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">All platforms</h3>
                <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-gray text-sm">
                Instagram, TikTok, X, YouTube and more
              </p>
            </Link>

            <Link
              href="/products/shopping/sources"
              className="panel group p-6 transition-colors hover:border-white/20"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">
                  {BRANDS.length} retail sources
                </h3>
                <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-gray text-sm">
                Pair social signal with catalogue and price data
              </p>
            </Link>

            <Link
              href="/products/ai-datasets"
              className="panel group p-6 transition-colors hover:border-white/20"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">AI datasets</h3>
                <ArrowUpRight className="text-gray h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-gray text-sm">
                Use this feed as model training data
              </p>
            </Link>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className={buttonVariants({ variant: 'outline' })}
            >
              See every data product
            </Link>
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
