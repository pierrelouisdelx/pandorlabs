'use client'

import {
  Bitcoin,
  Shield,
  TrendingUp,
  Zap,
  Lock,
  Activity,
  Database,
} from 'lucide-react'

import { FAQSection } from '../_components/faq-section'
import { FinalCTASection } from '../_components/final-cta-section'
import { ProductHero } from '../_components/product-hero'
import StatsCard from '@/components/custom/stats-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import UseCaseCard from '@/components/custom/use-case-card'
import Link from 'next/link'
import Script from 'next/script'
import { buttonVariants } from '@/components/ui/button'
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

const accentColor = '#8B5CF6'
const accentGlow = 'rgba(139, 92, 246, 0.15)'

const cryptoFaqs = [
  {
    question: 'Which exchanges, chains and assets are covered?',
    answer:
      'We aggregate spot and derivatives markets from 400+ centralized exchanges and the major decentralized venues, covering more than 10,000 assets across 50+ blockchain networks. Every price is normalized into a single symbol scheme (BTC-USD, ETH-USD) so you do not have to reconcile each venue’s ticker format yourself. If a venue or chain you need is missing, we can usually add it — coverage requests are part of the standard onboarding.',
  },
  {
    question:
      'How fresh is the data, and what does “<50ms latency” actually mean?',
    answer:
      'Latency is measured from the moment an update is received from the venue to the moment it leaves our pipeline. Push deliveries — a webhook or a stream wired into your systems during onboarding — typically land in under 50ms. Scheduled deliveries to your warehouse or object storage run on whatever cadence you pick, from continuous to daily, and historical backfills go back multiple years at trade-level granularity for backtesting.',
  },
  {
    question: 'Is the data collection legal and compliant?',
    answer:
      'We only collect publicly available market data — public exchange APIs, public order books, and public on-chain state. We do not scrape logged-in areas, we do not bypass authentication, and we do not collect personal data. Our infrastructure is SOC 2 Type II certified, and our processing is GDPR and CCPA compliant. We can sign a DPA and provide our security documentation during procurement.',
  },
  {
    question: 'What delivery formats and integrations do you support?',
    answer:
      'We deliver into the stack you already run rather than asking you to integrate against ours. Normalized market data lands as JSON, CSV, or Parquet in S3, GCS, or Azure Blob, or straight into Snowflake and BigQuery, on a schedule you choose. Webhooks can push threshold and event alerts to your systems as they fire. A solutions engineer sets the schema, cadence, and destination up with you during onboarding, so the first delivery arrives already shaped for your pipeline.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Pricing is scoped per engagement, driven by the venues and symbols you track, the refresh cadence, and the delivery destinations you need. Historical backfills and dedicated infrastructure are quoted separately. Every engagement starts with a sample dataset pulled from your actual target venues, at no cost and before you commit, so you can evaluate the data quality against your own benchmarks. Downtime that breaches the SLA is credited back.',
  },
  {
    question:
      'What happens when an exchange changes its API or a source goes down?',
    answer:
      'Connector maintenance is our job, not yours. We monitor every venue continuously and repair schema or endpoint changes upstream, so the schema we deliver to you never moves. When a venue degrades or goes offline, we fail over to redundant feeds automatically and flag the affected source in the record metadata, so you can always see exactly which venue contributed each price.',
  },
]

export default function CryptoDataPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Cryptocurrency Market Data',
    description:
      'Managed crypto market data from 400+ exchanges with <50ms latency, delivered to your warehouse, object storage, or webhooks. 10,000+ cryptocurrencies with institutional-grade reliability and unified multi-chain blockchain analytics.',
    url: `${siteUrl}/products/crypto`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'Cryptocurrency Data Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'Cryptocurrency Market Data', url: `${siteUrl}/products/crypto` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/crypto`,
    'Cryptocurrency Market Data',
    'Managed crypto market data from 400+ exchanges with <50ms latency, delivered to your stack with institutional-grade reliability.',
  )

  return (
    <div className="bg-primary">
      {/* JSON-LD Schemas */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(serviceSchema),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(breadcrumbSchema),
        }}
      />
      <Script
        id="webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(webPageSchema),
        }}
      />
      <ProductHero
        product="crypto"
        headline="Cryptocurrency Market Data, Delivered"
        subheadline="We aggregate real-time prices from 400+ exchanges with <50ms latency and deliver them straight into your stack — no integration to build or maintain"
        valueProps={[
          '10,000+ cryptocurrencies across 400+ exchanges',
          '<50ms latency, pushed or scheduled into your systems',
          'SOC 2 certified institutional infrastructure',
          'Unified multi-chain blockchain analytics',
        ]}
        primaryCTA="Request a Sample Dataset"
        secondaryCTA="Schedule a Demo"
        trustIndicators={[
          { Icon: Zap, text: '<50ms Latency' },
          { Icon: Shield, text: 'SOC 2 Certified' },
          { Icon: TrendingUp, text: 'Real-time Data' },
        ]}
        accentColor={accentColor}
        accentGlow={accentGlow}
        accentGradient="from-violet-500/20 via-transparent to-transparent"
        visualElement={
          <div className="relative aspect-square w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full">
                {[
                  {
                    coin: 'BTC',
                    price: '$67,234',
                    change: '+5.2%',
                    x: '20%',
                    y: '25%',
                    delay: '0s',
                  },
                  {
                    coin: 'ETH',
                    price: '$3,456',
                    change: '+3.8%',
                    x: '60%',
                    y: '20%',
                    delay: '0.3s',
                  },
                  {
                    coin: 'SOL',
                    price: '$98.50',
                    change: '+7.1%',
                    x: '40%',
                    y: '60%',
                    delay: '0.6s',
                  },
                ].map((crypto, i) => (
                  <div
                    key={i}
                    className="absolute rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-transparent p-4 backdrop-blur-sm"
                    style={{
                      left: crypto.x,
                      top: crypto.y,
                      animation: `float 3s ease-in-out infinite`,
                      animationDelay: crypto.delay,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/30">
                        <Bitcoin className="h-6 w-6 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-xs text-white/60">
                          {crypto.coin}
                        </div>
                        <div className="text-sm font-bold">{crypto.price}</div>
                        <div className="text-xs text-emerald-400">
                          {crypto.change}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* Why Managed Crypto Data Section */}
      <section className="section">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center">
                <p className="eyebrow">why managed crypto data</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  The Most Reliable{' '}
                  <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                    Crypto Market Data
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 text-center">
                <p>
                  Trading platforms and financial institutions need crypto
                  market data they can trust. Delays, inaccuracies, or downtime
                  can cost millions in missed opportunities and lost trades.
                </p>
                <p className="text-lg font-semibold text-white">
                  What if you could access institutional-grade crypto data with
                  the same reliability as traditional financial markets?
                </p>
                <p>
                  We aggregate real-time prices, order book depth, and
                  historical data from 400+ exchanges with sub-50ms latency, and
                  deliver it into your warehouse, object storage, or event
                  pipeline. SOC 2 certified infrastructure ensures your trading
                  systems never miss a beat.
                </p>
                <p>
                  No custom integrations. No maintenance overhead. No downtime.
                  Just reliable, accurate crypto data that powers better trading
                  decisions.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="400+" label="Exchanges Connected" />
                <StatsCard value="<50ms" label="Data Latency" />
                <StatsCard value="99.99%" label="Pipeline Uptime" />
              </div>
            </div>
            <div className="hidden w-1/2 items-center justify-center lg:flex">
              <div className="relative h-[500px] w-[500px]">
                <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <Bitcoin className="h-64 w-64 animate-[spin_20s_linear_infinite] text-violet-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">enterprise infrastructure</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Trading at Scale
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              When milliseconds matter and downtime isn&apos;t an option, you
              need infrastructure built to financial industry standards.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Zap}
              title="Ultra-Low Latency"
              description="Streaming ingest and a global edge move venue updates into your systems in under 50ms. Colocation options available for high-frequency trading workloads."
            />
            <TechFeatureCard
              icon={Lock}
              title="Bank-Grade Security"
              description="SOC 2 Type II certified with end-to-end encryption, DDoS protection, and 99.99% uptime SLA. Your trading infrastructure is always protected."
            />
            <TechFeatureCard
              icon={Activity}
              title="Real-Time Monitoring"
              description="24/7 system health monitoring with automatic failover and redundancy. Alert systems ensure you're always informed of any issues."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="10K+" label="Cryptocurrencies" />
            <StatsCard value="1M+" label="Updates/Second" />
            <StatsCard value="50+" label="Blockchain Networks" />
            <StatsCard value="24/7" label="Support Available" />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section section-divided">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(139,92,246,0.10),transparent_70%)]"
        />
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Your{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Crypto Applications
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From trading platforms to portfolio trackers, our data powers the
              most demanding crypto applications.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={TrendingUp}
              title="Trading Platforms"
              description="Build professional trading platforms with real-time order books, trade execution, and portfolio management. Support high-frequency trading with sub-50ms latency."
            />
            <UseCaseCard
              icon={Activity}
              title="Portfolio Trackers"
              description="Create comprehensive portfolio tracking apps with real-time valuations, P&L calculations, and performance analytics across multiple exchanges."
            />
            <UseCaseCard
              icon={Bitcoin}
              title="DeFi Applications"
              description="Power DeFi platforms with accurate on-chain data, token prices, and liquidity metrics from decentralized exchanges across 50+ blockchains."
            />
            <UseCaseCard
              icon={Shield}
              title="Risk Management"
              description="Monitor exposure, calculate VaR, and manage portfolio risk with institutional-grade data quality and real-time market feeds."
            />
            <UseCaseCard
              icon={Zap}
              title="Market Analysis"
              description="Build analytics platforms with historical data, technical indicators, and market microstructure insights for professional traders."
            />
            <UseCaseCard
              icon={Lock}
              title="Compliance & Reporting"
              description="Generate regulatory reports, track transactions, and maintain audit trails with comprehensive historical data and per-record source provenance."
            />
          </div>
        </div>
      </section>

      {/* Delivery & Compliance Section */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">delivery and compliance</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Ready for{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Procurement Review
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              The details your security, legal, and data teams will ask about
              before the first dataset changes hands.
            </p>
          </div>

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
                  'Public market data only. No personal data collected, and a DPA is available on request.',
              },
              {
                Icon: Activity,
                title: '99.9% Uptime SLA',
                description:
                  'Contractual availability with redundant feeds, automatic failover, and a public status page.',
              },
              {
                Icon: Database,
                title: 'Data Residency',
                description:
                  'Choose EU or US processing and storage regions to match your regulatory obligations.',
              },
            ].map(({ Icon, title, description }) => (
              <div key={title} className="panel p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-gray text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline' })}
            >
              Request security documentation
            </Link>
          </div>
        </div>
      </section>

      <FAQSection faqs={cryptoFaqs} accentColor={accentColor} />

      <FinalCTASection accentColor={accentColor} accentGlow={accentGlow} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Cryptocurrency Market Data',
            description:
              'Managed real-time crypto market data from 400+ exchanges with sub-50ms latency, delivered to your stack. Track prices, trading volumes, and blockchain metrics across 10,000+ cryptocurrencies with institutional-grade reliability.',
            brand: {
              '@type': 'Brand',
              name: 'PandorLabs',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'PriceSpecification',
                description:
                  'Custom quote based on sources, volume, and delivery cadence.',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/crypto`,
            },
            category: 'Cryptocurrency Technology',
            featureList: [
              '10,000+ cryptocurrencies tracked',
              '400+ exchange integrations',
              'Sub-50ms feed latency',
              'Delivery to S3, GCS, Snowflake, BigQuery, or webhooks',
              'SOC 2 Type II certified',
              'Multi-chain blockchain analytics',
              'Institutional-grade infrastructure',
              'DeFi protocol monitoring',
            ],
          }),
        }}
      />
    </div>
  )
}
