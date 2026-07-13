'use client'

import {
  Building2,
  Home,
  Shield,
  TrendingUp,
  Users,
  Calculator,
  LineChart,
  Map,
  Database,
  Cpu,
  Lock,
  Award,
  Activity,
  CheckCircle2,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'
import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'
import { FAQSection } from '../_components/faq-section'
import { ProductHero } from '../_components/product-hero'

const accentColor = '#46e695'

const faqs = [
  {
    question: 'Where does the property data come from?',
    answer:
      'We aggregate from licensed MLS feeds, county assessor and recorder records, public deed and permit filings, and rental listing sources across 50+ US markets. Each record carries the source and the timestamp it was last observed, so you can always trace a value back to where it came from. Where sources disagree, we surface both values rather than silently picking one.',
  },
  {
    question: 'How fresh is the data?',
    answer:
      'Active listing and price-change data refreshes on a 15-minute cycle. County-sourced records (deeds, assessments, permits) update as fast as the county publishes them, which ranges from daily to monthly depending on the jurisdiction. Every record exposes a last_updated field so you never have to guess how current a value is.',
  },
  {
    question:
      'What does the ML valuation actually predict, and how accurate is it?',
    answer:
      'The model estimates a current market value for a property from comparable sales, price history, property characteristics, and neighborhood trend signals. Reported accuracy is measured as median error against subsequent arms-length sales in covered markets; accuracy varies by market density, and every valuation ships with a confidence interval so you can decide whether to trust it for a given decision.',
  },
  {
    question: 'How do I get the data out — streamed, or in bulk?',
    answer:
      'Both, and either way we do the delivering. Webhooks push listing and price-change events to your systems as they happen, and bulk JSON, CSV, or Parquet snapshots land in S3, GCS, Azure Blob, Snowflake, or BigQuery on the schedule you set. A solutions engineer agrees the fields, cadence, and destination with you up front, so the data arrives already shaped for the models and dashboards you run.',
  },
  {
    question: 'How is it priced?',
    answer:
      'Pricing is based on the records delivered and the refresh cadence you need, with volume tiers that lower the unit price as you scale. Bulk snapshot delivery is priced per dataset. Before you commit we deliver a free sample built from your own target markets and addresses, so you can check coverage and valuation accuracy against deals you already know.',
  },
  {
    question: 'What happens when a source site or feed changes its layout?',
    answer:
      'Extraction is monitored continuously: schema validators compare each run against the expected shape of the data and alert us when field coverage or value distributions drift. Layout changes are typically repaired within hours, and in the meantime the affected fields are marked stale rather than served as if nothing happened. Silent bad data is the failure mode we work hardest to prevent.',
  },
]

export default function RealEstatePage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Real Estate Market Data',
    description:
      'Managed real estate market intelligence — property listings, pricing trends, market analytics, and investment insights, delivered to your warehouse or object storage. Real-time data for informed property decisions.',
    url: `${siteUrl}/products/real-estate`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'Real Estate Intelligence Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'Real Estate Market Data', url: `${siteUrl}/products/real-estate` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/real-estate`,
    'Real Estate Market Data',
    'Managed real estate market intelligence — property listings, pricing trends, and investment insights, delivered to your stack.',
  )

  return (
    <>
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
        product="realEstate"
        headline="Property Data, Delivered to Your Models"
        subheadline="140M+ property records with price history, comps, and market movement — normalised into one schema and refreshed on the cadence you set."
        valueProps={[
          '140M+ property records across listing portals, agency sites, and public records',
          'One schema, so a listing in Paris compares cleanly to one in Miami',
          'Refreshed as often as every 15 minutes, with change events pushed to you',
          'Delivered to S3, Snowflake, BigQuery, or a webhook — not a portal you log into',
        ]}
        primaryCTA="Request a Sample Dataset"
        secondaryCTA="Schedule a Demo"
        trustIndicators={[
          { Icon: Shield, text: 'SOC 2 Type II' },
          { Icon: Activity, text: '99.9% uptime SLA' },
          { Icon: Building2, text: '140M+ records' },
        ]}
        accentColor={accentColor}
        accentGlow="rgba(70, 230, 149, 0.15)"
        accentGradient="from-green-light/20 via-transparent to-transparent"
        visualElement={
          <div className="space-y-4">
            {[
              {
                addr: '12 Rue de Rivoli, Paris',
                price: '€1.24M',
                delta: '+3.1%',
              },
              {
                addr: '840 Ocean Dr, Miami, FL',
                price: '$2.10M',
                delta: '+5.4%',
              },
              {
                addr: '17 Cheyne Walk, London',
                price: '£3.85M',
                delta: '-1.2%',
              },
            ].map((p) => (
              <div key={p.addr} className="panel flex items-center gap-4 p-5">
                <div className="bg-green-light/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <Building2 className="text-green-light h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{p.addr}</p>
                  <p className="text-gray text-xs">
                    last sold · verified today
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{p.price}</p>
                  <p
                    className={
                      p.delta.startsWith('-')
                        ? 'text-xs text-red-400'
                        : 'text-green-light text-xs'
                    }
                  >
                    {p.delta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Vision Section - Real Estate Intelligence Advantage */}
      <section className="section section-glow">
        <div className="container">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="eyebrow">why managed property data</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Market Intelligence{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Real-Time Edge
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 lg:mx-0">
                <p>
                  Manual property research is slow, outdated comps miss market
                  shifts, and opportunities vanish while you&apos;re still
                  gathering data. Traditional real estate tools leave you flying
                  blind in fast-moving markets.
                </p>
                <p className="text-lg font-semibold text-white">
                  Get instant market intelligence with ML-powered insights.
                </p>
                <p>
                  Access 140M+ property records updated every 15 minutes from
                  real-time MLS feeds. Our machine learning models analyze 20+
                  years of transaction history to deliver predictive valuations
                  with 94% accuracy. From investment analysis to automated
                  underwriting, make data-driven decisions in milliseconds, not
                  days.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="140M+" label="Property Records" />
                <StatsCard value="<50ms" label="Feed Latency" />
                <StatsCard value="99.9%" label="Data Accuracy" />
              </div>
            </div>

            {/* Market Visualization */}
            <div className="flex w-full items-center justify-center lg:w-1/2">
              <div className="relative aspect-square w-full max-w-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-full w-full">
                    {/* Background Map Grid */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="h-full w-full" viewBox="0 0 400 400">
                        <defs>
                          <pattern
                            id="market-grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 40 0 L 0 0 0 40"
                              fill="none"
                              stroke="rgba(16,185,129,0.2)"
                              strokeWidth="1"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="400"
                          height="400"
                          fill="url(#market-grid)"
                        />
                      </svg>
                    </div>

                    {/* Animated Property Data Points */}
                    {[
                      {
                        x: '15%',
                        y: '25%',
                        price: '$450K',
                        trend: '+5.2%',
                        delay: '0s',
                      },
                      {
                        x: '65%',
                        y: '20%',
                        price: '$789K',
                        trend: '+8.1%',
                        delay: '0.5s',
                      },
                      {
                        x: '35%',
                        y: '65%',
                        price: '$1.2M',
                        trend: '+3.4%',
                        delay: '1s',
                      },
                      {
                        x: '70%',
                        y: '70%',
                        price: '$625K',
                        trend: '+6.8%',
                        delay: '1.5s',
                      },
                    ].map((point, i) => (
                      <div
                        key={i}
                        className="border-green-light/30 absolute rounded-lg border bg-white/10 p-3 backdrop-blur-sm"
                        style={{
                          left: point.x,
                          top: point.y,
                          animation: `float 3s ease-in-out infinite`,
                          animationDelay: point.delay,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="text-green-light h-5 w-5" />
                          <div>
                            <div className="text-green-light text-sm font-semibold">
                              {point.price}
                            </div>
                            <div className="text-xs text-white/60">
                              {point.trend}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pulsing Center Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-green-light/20 h-24 w-24 animate-ping rounded-full" />
                      <div className="bg-green-light/40 absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">how it works</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              From Query to Insight —{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in Milliseconds
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Our real-time data pipeline delivers property intelligence faster
              than you can refresh a listing page.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Query Property Data"
              description="Tell us the addresses, locations, price bands, or custom criteria that matter. We scope the sources and build the feed around them — no query language to learn."
            />
            <ProcessStep
              number="02"
              title="AI Enrichment & Analysis"
              description="ML models analyze comparable sales, price trends, neighborhood data, and market indicators. Predictive valuations calculated in real-time with 94% accuracy."
            />
            <ProcessStep
              number="03"
              title="Structured Response"
              description="Receive comprehensive JSON/CSV datasets with property details, valuations, market trends, and investment metrics—ready for your application."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Request
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              &lt;50ms avg
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Data Delivered
            </span>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section section-divided section-glow-center">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">real estate applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Real Estate{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Use Case
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From investment analysis to automated underwriting, our data
              powers the next generation of PropTech.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={TrendingUp}
              title="Investment Analysis"
              description="Evaluate ROI, cash flow projections, and market appreciation trends across neighborhoods and property types with ML-powered insights."
            />
            <UseCaseCard
              icon={Users}
              title="Broker & Agent Tools"
              description="Power CRM systems with instant property valuations, comparable sales, and listing intelligence for faster, data-driven deals."
            />
            <UseCaseCard
              icon={Building2}
              title="Property Management"
              description="Monitor portfolio values, rental rates, occupancy trends, and maintenance costs across multiple properties in real-time."
            />
            <UseCaseCard
              icon={Map}
              title="Market Research"
              description="Analyze neighborhood trends, demographic shifts, development patterns, and investment hotspots with comprehensive market data."
            />
            <UseCaseCard
              icon={Calculator}
              title="Mortgage & Lending"
              description="Validate appraisals, assess risk, and automate underwriting with accurate property valuations and historical market data."
            />
            <UseCaseCard
              icon={LineChart}
              title="PropTech Innovation"
              description="Build next-generation real estate applications on a managed feed of listings, valuations, and market intelligence — delivered, not integrated."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Need custom real estate data integration? Our team can help
              architect the perfect solution.
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Discuss Your Use Case →
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">technology</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Enterprise-Grade Infrastructure{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Powered by cutting-edge ML models, multi-source aggregation, and
              battle-tested infrastructure that handles billions of requests.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Database}
              title="Multi-Source Aggregation"
              description="One unified pipeline combining MLS feeds, county records, transaction data, and proprietary sources across 50+ markets with real-time synchronization."
            />
            <TechFeatureCard
              icon={Cpu}
              title="ML-Powered Valuations"
              description="Advanced machine learning models trained on 20+ years of transaction history deliver predictive valuations with industry-leading 94% accuracy."
            />
            <TechFeatureCard
              icon={Shield}
              title="Enterprise Infrastructure"
              description="SOC 2 Type II certified with 99.9% uptime SLA, sub-50ms response times, and global CDN distribution for maximum performance."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="50+" label="Data Sources" />
            <StatsCard value="94%" label="ML Accuracy" />
            <StatsCard value="15min" label="Update Frequency" />
            <StatsCard value="20yrs" label="Historical Data" />
          </div>
        </div>
      </section>

      {/* Compliance & Delivery Strip */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">compliance &amp; delivery</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Ready for Your{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Security Review
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              The questions your procurement and compliance teams will ask,
              answered before they ask them.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-6">
              <Shield className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">SOC 2 Type II</h3>
              <p className="text-gray text-sm leading-relaxed">
                Independently audited controls covering security, availability,
                and confidentiality. Report available under NDA.
              </p>
            </div>
            <div className="panel p-6">
              <Lock className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">GDPR &amp; CCPA</h3>
              <p className="text-gray text-sm leading-relaxed">
                DPA available, subprocessor list published, and deletion
                requests honored across every downstream copy of the data.
              </p>
            </div>
            <div className="panel p-6">
              <Activity className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">
                99.9% Uptime SLA
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Contractual SLA with service credits, a public status page, and
                incident postmortems for every degradation.
              </p>
            </div>
            <div className="panel p-6">
              <Globe className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">
                EU/US Data Residency
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Choose the region your data is processed and stored in.
                On-premise deployment available for regulated industries.
              </p>
            </div>
          </div>

          {/* Enterprise capability grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Award className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Custom Data Pipelines
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                Dedicated infrastructure with custom filters, webhooks, and
                real-time streaming for your enterprise workflows.
              </p>
            </div>
            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Activity className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Priority Support
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                Dedicated account management with SLA guarantees and direct
                engineering access via a shared Slack or Teams channel.
              </p>
            </div>
            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Database className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Flexible Delivery
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                Webhooks, scheduled bulk snapshots in JSON, CSV, or Parquet, and
                direct loads into Snowflake or BigQuery — delivered to the stack
                you already use.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className={buttonVariants()}>
              Schedule Demo
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline' })}
            >
              View Enterprise Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} accentColor={accentColor} />

      {/* Final CTA */}
      <section className="section section-divided section-glow">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Transform Property Intelligence Into{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Competitive Advantage
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              140M+ property records with ML-powered valuations, comps, and
              market trends, delivered to your stack. Start with a free sample
              from your own target markets.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request a Sample Dataset →
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Schedule a Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <TrustBadge icon={Shield} text="SOC 2 Type II" />
              <TrustBadge icon={CheckCircle2} text="GDPR & CCPA" />
              <TrustBadge icon={Activity} text="99.9% Uptime SLA" />
              <TrustBadge icon={Database} text="140M+ Properties" />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Real Estate Market Data',
            description:
              '140M+ property records with ML-powered insights, delivered to your stack. Real-time MLS feeds, 94% valuation accuracy, and sub-50ms feed latency for investment analysis and automated underwriting.',
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
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/real-estate`,
            },
            category: 'Real Estate Technology',
            featureList: [
              '140M+ property records',
              'Real-time MLS data feeds',
              '94% valuation accuracy',
              'Sub-50ms feed latency',
              'ML-powered predictive insights',
              '20+ years transaction history',
              'Automated underwriting',
              'Investment analysis tools',
            ],
          }),
        }}
      />
    </>
  )
}
