import { FAQSection } from '../_components/faq-section'
import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'
import { BRANDS } from '@/lib/brands'
import Link from 'next/link'
import Script from 'next/script'
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'
import {
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Lock,
  Bot,
  Activity,
  CheckCircle2,
  Award,
  Bell,
  Package,
  Database,
} from 'lucide-react'

const accentColor = '#F59E0B'

const shoppingFaqs = [
  {
    question: 'Which marketplaces and regions do you cover?',
    answer:
      'We monitor 30.7M+ storefronts across 50+ marketplaces, including Amazon, Walmart, eBay, Target, and the long tail of Shopify and BigCommerce merchants, in every major retail region. Coverage is by marketplace and locale, so the same product can be tracked separately in each country you sell in. If a marketplace you care about is not yet supported, adding it is part of standard onboarding.',
  },
  {
    question:
      'How often is pricing refreshed, and how accurate is the matching?',
    answer:
      'Tracked products refresh every 15 minutes by default, and high-priority SKUs can be pushed to a faster cadence. Product matching runs on a combination of computer vision and NLP over titles, images, and specifications, resolving to 98% accuracy against our benchmark set. Every matched offer returns a confidence score so you can gate automated repricing on the threshold you trust.',
  },
  {
    question: 'Is this data collection legal and compliant?',
    answer:
      'We collect only publicly visible listing data — prices, sellers, availability, and product attributes shown to any shopper without logging in. We do not bypass authentication, we do not collect personal data, and we honour rate limits so target sites are not disrupted. Our infrastructure is SOC 2 Type II certified, our processing is GDPR and CCPA compliant, and we sign DPAs as part of procurement.',
  },
  {
    question: 'How is the data delivered, and what does it integrate with?',
    answer:
      'We deliver into the systems you already run. Webhooks push price changes, stockouts, and MAP violations to your endpoints the moment they are detected, and scheduled JSON, CSV, or Parquet exports land in S3, GCS, Azure Blob, Snowflake, or BigQuery on the cadence you set. Native connectors cover Shopify and BigCommerce, and a solutions engineer maps the feed to your ERP or BI stack during onboarding so nothing needs building on your side.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Pricing is based on the number of tracked SKU-per-marketplace combinations and how frequently they refresh, with volume tiers that lower the unit cost as your catalogue grows. Historical backfill and dedicated crawl capacity are quoted separately. Before you commit, we run a free sample against your own catalogue and hand back the matched dataset, so you can validate matching accuracy on SKUs you actually sell.',
  },
  {
    question: 'What happens when a retailer changes its page layout?',
    answer:
      'Maintaining extractors is our responsibility, not yours. Layout changes are detected automatically by validation checks that compare each field against expected types and historical ranges, and broken extractors are quarantined rather than allowed to emit bad prices. Our team repairs them upstream, so the schema we deliver stays identical and you never reprice off a parsing error.',
  },
]

export default function ShoppingMonitoringPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'E-commerce Price Intelligence',
    description:
      'Track 30.7M+ stores with 98% AI product matching and 15-minute price updates. Monitor competitive pricing, inventory, and market trends across all major e-commerce platforms.',
    url: `${siteUrl}/products/shopping`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'E-commerce Intelligence Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'E-commerce Intelligence', url: `${siteUrl}/products/shopping` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/shopping`,
    'E-commerce Price Intelligence at Scale',
    'Track 30.7M+ stores with 98% AI product matching and 15-minute price updates—without hiring analysts or waiting weeks',
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
      {/* Hero Section */}
      <div className="bg-primary relative isolate -mt-24 flex min-h-screen items-center overflow-hidden pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(245,158,11,0.10),transparent_70%)]"
        />
        <div className="container w-full py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            {/* Left Column - Content */}
            <div className="w-full lg:w-1/2">
              <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
                <h1 className="relative mb-6 text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-7xl/tight">
                  E-commerce Price <br />
                  <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
                    Intelligence at Scale
                  </span>
                </h1>
                <p className="text-gray mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl lg:mx-0">
                  Track 30.7M+ stores with 98% AI product matching and 15-minute
                  price updates—without hiring analysts or waiting weeks
                </p>

                {/* Value Props */}
                <ul className="mx-auto mb-10 max-w-2xl space-y-3 text-left lg:mx-0">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-amber-400" />
                    <span className="text-white/80">
                      30.7M+ stores monitored across 50+ marketplaces
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-amber-400" />
                    <span className="text-white/80">
                      98% AI-powered product matching accuracy
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-amber-400" />
                    <span className="text-white/80">
                      15-minute price update frequency
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-amber-400" />
                    <span className="text-white/80">
                      Automated MAP violation alerts and brand protection
                    </span>
                  </li>
                </ul>

                {/* CTA Buttons */}
                <div className="mb-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <Link
                    href="/contact"
                    className={buttonVariants({ size: 'lg' })}
                  >
                    Request a Sample Dataset →
                  </Link>
                  <Link
                    href="/contact"
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                    })}
                  >
                    Schedule a Demo
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-20">
                  <p className="eyebrow text-center lg:text-left">
                    what you get on day one
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-12 lg:justify-start lg:gap-16">
                    <div className="flex items-center gap-2 text-white/60">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <span className="font-medium">15-min Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Shield className="h-5 w-5 text-amber-400" />
                      <span className="font-medium">Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                      <span className="font-medium">Real-time Alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Price Trend Visualization */}
            <div className="flex w-full items-center justify-center lg:w-1/2">
              <div className="relative aspect-square w-full max-w-md">
                <div className="relative h-full w-full rounded-2xl border border-amber-500/20 bg-linear-to-b from-amber-500/10 to-transparent p-8">
                  {/* Chart Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-amber-400" />
                        <span className="font-semibold">
                          Real-Time Price Monitoring
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        30.7M+ Stores Tracked
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">
                        -23%
                      </div>
                      <div className="text-xs text-white/60">Avg Savings</div>
                    </div>
                  </div>

                  {/* Animated Price Chart */}
                  <div className="relative h-64">
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 400 200"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="rgba(245,158,11,0.4)" />
                          <stop offset="100%" stopColor="rgba(245,158,11,0)" />
                        </linearGradient>
                        <linearGradient
                          id="lineGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="rgba(245,158,11,0.6)" />
                          <stop offset="50%" stopColor="rgba(245,158,11,1)" />
                          <stop
                            offset="100%"
                            stopColor="rgba(245,158,11,0.6)"
                          />
                        </linearGradient>
                      </defs>

                      {/* Competitor Price Lines */}
                      <path
                        d="M 0 120 L 50 110 L 100 115 L 150 105 L 200 110 L 250 100 L 300 95 L 350 90 L 400 85 L 400 200 L 0 200 Z"
                        fill="rgba(245,158,11,0.1)"
                        className="competitor-line-1"
                      />
                      <path
                        d="M 0 120 L 50 110 L 100 115 L 150 105 L 200 110 L 250 100 L 300 95 L 350 90 L 400 85"
                        stroke="rgba(245,158,11,0.4)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />

                      {/* Your Price Line (Animated) */}
                      <path
                        d="M 0 100 L 50 80 L 100 90 L 150 70 L 200 85 L 250 60 L 300 75 L 350 50 L 400 65 L 400 200 L 0 200 Z"
                        fill="url(#chartGradient)"
                        className="price-area"
                      />
                      <path
                        d="M 0 100 L 50 80 L 100 90 L 150 70 L 200 85 L 250 60 L 300 75 L 350 50 L 400 65"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        fill="none"
                        className="price-line"
                      />

                      {/* Animated Data Points */}
                      <circle
                        cx="100"
                        cy="90"
                        r="4"
                        fill="#F59E0B"
                        className="data-point"
                        style={{ animationDelay: '0s' }}
                      />
                      <circle
                        cx="200"
                        cy="85"
                        r="4"
                        fill="#F59E0B"
                        className="data-point"
                        style={{ animationDelay: '0.5s' }}
                      />
                      <circle
                        cx="300"
                        cy="75"
                        r="4"
                        fill="#F59E0B"
                        className="data-point"
                        style={{ animationDelay: '1s' }}
                      />
                    </svg>

                    {/* Price Alert Indicators */}
                    <div
                      className="alert-pulse absolute"
                      style={{ left: '25%', top: '40%' }}
                    >
                      <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    </div>
                    <div
                      className="alert-pulse absolute"
                      style={{
                        left: '62.5%',
                        top: '30%',
                        animationDelay: '1s',
                      }}
                    >
                      <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    </div>
                  </div>

                  {/* Time Labels */}
                  <div className="mt-4 flex justify-between text-xs text-white/60">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-8 rounded-full bg-amber-400"></div>
                      <span className="text-xs text-white/60">Your Price</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-8 rounded-full border-2 border-dashed border-amber-400/40"></div>
                      <span className="text-xs text-white/60">Competitors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <section className="section">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full">
              <div className="mb-10 text-center">
                <p className="eyebrow">why price monitoring</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Competitive Pricing{' '}
                  <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                    Advantage
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 text-center">
                <p>
                  Every day, your competitors are changing prices, launching
                  promotions, and adjusting inventory. By the time you manually
                  check prices and update spreadsheets, opportunities have
                  already passed and your margins are at risk.
                </p>
                <p className="text-lg font-semibold text-white">
                  What if you could track every competitor price change in
                  real-time—with the accuracy of a dedicated team and the speed
                  of automation?
                </p>
                <p>
                  PandorLabs delivers e-commerce intelligence on demand. Our AI
                  continuously monitors 30.7M+ stores across all major
                  marketplaces, matching products with 98% accuracy and alerting
                  you to critical changes within minutes.
                </p>
                <p>
                  No price analysts. No manual tracking. No delays. Just the
                  competitive intelligence you need to optimize pricing faster
                  than your competitors.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="30.7M+" label="Stores Monitored" />
                <StatsCard value="15min" label="Update Frequency" />
                <StatsCard value="98%" label="AI Match Accuracy" />
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
              From Setup to Insights —{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                in Minutes
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              No technical setup. No complicated integrations. Just three simple
              steps to get real-time price intelligence.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Define Your Products"
              description="Upload your product catalog or provide competitor URLs. Our AI automatically identifies matching products across all marketplaces using computer vision and NLP."
            />
            <ProcessStep
              number="02"
              title="AI Tracks Competitors"
              description="Our intelligent system monitors 30.7M+ stores 24/7, tracking price changes, stock levels, and promotions. Updates every 15 minutes with 98% matching accuracy."
            />
            <ProcessStep
              number="03"
              title="Get Real-Time Alerts"
              description="Receive instant notifications for price changes, MAP violations, and competitive threats. Export data to your BI tools or use our dashboard for strategic insights."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Start
            </span>
            <div className="h-1 w-20 rounded-full bg-amber-500/30 shadow-lg shadow-amber-500/20"></div>
            <span className="animate-pulse rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              Minutes, not weeks
            </span>
            <div className="h-1 w-20 rounded-full bg-amber-500/30 shadow-lg shadow-amber-500/20"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Intelligence Ready
            </span>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section section-divided">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(245,158,11,0.10),transparent_70%)]"
        />
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">pricing intelligence applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every E-commerce{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Use Case
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From dynamic pricing to brand protection, monitor and optimize
              across all channels with real-time intelligence.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={DollarSign}
              title="Dynamic Pricing Optimization"
              description="Automatically adjust prices based on competitor movements, demand signals, and inventory levels. Increase profit margins by 15-25% with ML-powered pricing strategies that respond to market changes in real-time."
            />
            <UseCaseCard
              icon={AlertTriangle}
              title="MAP Violation Monitoring"
              description="Protect your brand with automated Minimum Advertised Price monitoring. Get instant alerts when unauthorized sellers violate pricing policies. Reduce MAP violations by 80% with proactive enforcement."
            />
            <UseCaseCard
              icon={Target}
              title="Competitive Intelligence"
              description="Track competitor pricing strategies, promotional calendars, and inventory levels. Identify market opportunities before competitors react. Sales teams report 20-30% higher win rates with real-time competitive data."
            />
            <UseCaseCard
              icon={BarChart3}
              title="Market Trend Analysis"
              description="Analyze historical price data with trend analysis, seasonality detection, and predictive insights. Forecast optimal pricing windows and identify emerging market opportunities with AI-powered analytics."
            />
            <UseCaseCard
              icon={Shield}
              title="Brand Protection & Compliance"
              description="Monitor unauthorized sellers, counterfeit listings, and trademark violations across all marketplaces. Protect brand reputation and revenue with 24/7 automated monitoring and instant enforcement alerts."
            />
            <UseCaseCard
              icon={Package}
              title="Inventory Planning Intelligence"
              description="Correlate competitor stock levels with pricing changes. Identify stockout opportunities and optimize your inventory strategy. Merchants reduce excess inventory by 30% while maintaining competitive availability."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Need custom price monitoring for your marketplace? Our AI adapts
              to any e-commerce platform.
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Start Monitoring Your Competitors →
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
              Built for{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                E-commerce Scale
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              When pricing decisions drive millions in revenue, you need
              enterprise infrastructure that never fails. Our platform handles
              billions of price checks monthly with military-grade reliability.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Bot}
              title="98% AI Product Matching"
              description="Computer vision and NLP algorithms match products across sellers with industry-leading accuracy. Our AI handles variations in titles, images, and descriptions—automatically adapting when products change."
            />
            <TechFeatureCard
              icon={Zap}
              title="Multi-Marketplace Coverage"
              description="Monitor Amazon, eBay, Walmart, Shopify, and 50+ marketplaces from a single dashboard. One managed feed, one schema — complete market visibility across every channel without a separate build per marketplace."
            />
            <TechFeatureCard
              icon={Lock}
              title="Enterprise Security & Compliance"
              description="SOC 2 Type II certified. GDPR/CCPA compliant. Bank-level encryption for your competitive data. Deploy with confidence—our security passes Fortune 500 compliance reviews."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="50+" label="Marketplaces" />
            <StatsCard value="98%" label="Match Accuracy" />
            <StatsCard value="15min" label="Update Frequency" />
            <StatsCard value="30.7M" label="Stores Tracked" />
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="section section-divided">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_85%_0%,rgba(245,158,11,0.10),transparent_70%)]"
        />
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">for businesses at scale</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Trusted by Teams That{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Can&apos;t Afford to Wait
              </span>
            </h2>
            <p className="text-gray mx-auto mb-8 max-w-2xl">
              Whether you&apos;re a fast-growing brand or an enterprise
              retailer, competitive pricing intelligence is mission-critical—and
              it needs to be instant.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                    <Award className="h-6 w-6 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-400">
                    Enterprise Solutions
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  Dedicated infrastructure, custom SLAs, and white-glove
                  onboarding for enterprise e-commerce teams. Priority support
                  and guaranteed uptime.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                    <Bell className="h-6 w-6 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-400">
                    Custom Webhooks & Integrations
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  Real-time webhooks push price changes directly to your
                  systems. Integrate with Shopify, BigCommerce, your ERP, or
                  custom BI tools.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
                    <Activity className="h-6 w-6 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-amber-400">
                    24/7 Monitoring & Support
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  Never miss a critical price change. 24/7 monitoring with
                  sub-second alerting. Direct access to engineering team via
                  Slack/Teams.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/contact" className={buttonVariants()}>
                  See Platform Demo
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Visual Element - Price Tracking Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-full rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">
                      Competitor Price Tracking
                    </span>
                  </div>
                  <div className="font-bold text-amber-400">-23%</div>
                </div>
                <svg
                  className="h-64 w-full"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="rgba(245,158,11,0.4)" />
                      <stop offset="100%" stopColor="rgba(245,158,11,0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 100 L 50 80 L 100 90 L 150 70 L 200 85 L 250 60 L 300 75 L 350 50 L 400 65 L 400 200 L 0 200 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M 0 100 L 50 80 L 100 90 L 150 70 L 200 85 L 250 60 L 300 75 L 350 50 L 400 65"
                    stroke="rgba(245,158,11,1)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                  />
                </svg>
                <div className="mt-4 flex justify-between text-sm text-white/60">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>
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
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
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
                  'Public listing data only. No personal data collected, and a DPA is available on request.',
              },
              {
                Icon: Activity,
                title: '99.9% Uptime SLA',
                description:
                  'Contractual availability with redundant crawlers, automatic retries, and a public status page.',
              },
              {
                Icon: Database,
                title: 'Data Residency',
                description:
                  'Choose EU or US processing and storage regions to match your regulatory obligations.',
              },
            ].map(({ Icon, title, description }) => (
              <div key={title} className="panel p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-400" />
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

      {/* Dedicated sources — each brand has its own page with the fields,
          method, and quirks of that specific catalogue. */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">dedicated collectors</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              {BRANDS.length} fashion sources,{' '}
              <span className="bg-linear-to-l from-amber-400 to-amber-500 bg-clip-text text-transparent">
                built one at a time
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Beyond the marketplace-wide monitoring, these brands each get a
              purpose-built collector — because the attributes that make retail
              data useful only survive extraction designed for the source.
            </p>
          </div>

          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/products/shopping/${brand.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm transition-colors hover:border-amber-500/40 hover:bg-white/10"
              >
                {brand.name}
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products/shopping/sources"
              className={buttonVariants({ variant: 'outline' })}
            >
              Browse all sources by segment
            </Link>
          </div>
        </div>
      </section>

      <FAQSection faqs={shoppingFaqs} accentColor={accentColor} />

      {/* Final CTA Section */}
      <section className="section section-divided">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(245,158,11,0.12),transparent_70%)]"
        />
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Stop Losing Revenue to{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Competitor Price Changes
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              While your competitors track prices manually with spreadsheets,
              you could be optimizing in real-time with AI-powered intelligence.
              Send us your catalogue and we will return a matched sample from
              your target marketplaces.
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

            {/* Trust Elements */}
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <TrustBadge icon={Shield} text="SOC 2 Type II Certified" />
                <TrustBadge icon={CheckCircle2} text="GDPR Compliant" />
                <TrustBadge icon={Activity} text="99.9% Uptime SLA" />
              </div>
              <div className="text-gray space-y-1 text-sm">
                <p>✓ Free sample dataset from your own catalogue</p>
                <p>✓ Delivery configured with a solutions engineer</p>
                <p>✓ No long-term lock-in — cancel at the end of any term</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'E-commerce Price Monitoring',
            description:
              'Monitor 30.7M+ stores with real-time price tracking. Detect MAP violations, track competitor pricing, and optimize dynamic pricing strategies across all major marketplaces and retailers.',
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
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/shopping`,
            },
            category: 'E-commerce Technology',
            featureList: [
              '30.7M+ store monitoring',
              'Real-time price tracking',
              'MAP violation detection',
              'Competitor pricing intelligence',
              'Dynamic pricing optimization',
              'Multi-marketplace coverage',
              'Product availability tracking',
              'Historical price analytics',
            ],
          }),
        }}
      />
    </>
  )
}
