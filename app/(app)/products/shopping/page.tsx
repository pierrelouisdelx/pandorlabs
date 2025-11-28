import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'
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
} from 'lucide-react'

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
      <div className="from-primary via-primary/95 to-background relative -mt-24 flex min-h-screen items-center overflow-hidden bg-linear-to-b pt-24">
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
                    href="/request"
                    className={buttonVariants({ size: 'lg' })}
                  >
                    Start Free Trial →
                  </Link>
                  <Link
                    href="/demo"
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                    })}
                  >
                    View Documentation
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-20">
                  <p className="mb-8 text-center text-lg font-semibold text-white/90 uppercase lg:text-left">
                    Trusted by Leading E-commerce Brands
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
                          <stop
                            offset="100%"
                            stopColor="rgba(245,158,11,0)"
                          />
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
                      style={{ left: '62.5%', top: '30%', animationDelay: '1s' }}
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
                      <span className="text-xs text-white/60">
                        Competitors
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full">
              <div className="mb-10 text-center">
                <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                  WHY PRICE MONITORING
                </p>
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
      </div>

      {/* How It Works Section */}
      <div className="from-background to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 opacity-30"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              HOW IT WORKS
            </p>
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
      </div>

      {/* Use Cases Section */}
      <div className="from-background to-primary/20 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              PRICING INTELLIGENCE APPLICATIONS
            </p>
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
      </div>

      {/* Technology Section */}
      <div className="from-primary/20 to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/5 via-transparent to-amber-500/5"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              TECHNOLOGY
            </p>
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
              description="Monitor Amazon, eBay, Walmart, Shopify, and 50+ marketplaces from a single dashboard. Unified API access means one integration gives you complete market visibility across all channels."
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
      </div>

      {/* Enterprise Section */}
      <div className="from-background to-primary/10 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              FOR BUSINESSES AT SCALE
            </p>
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
                <Link href="/demo" className={buttonVariants()}>
                  See Platform Demo
                </Link>
                <Link
                  href="/pricing"
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
      </div>

      {/* Testimonials Section */}
      <div className="from-primary/10 to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              CUSTOMER SUCCESS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                E-commerce Leaders
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-amber-400">🛒</div>
                <h4 className="mb-1 font-semibold text-white">
                  E-commerce Brand Manager
                </h4>
                <p className="text-gray/80 text-sm">
                  Mid-Market Consumer Electronics
                </p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;We increased our profit margins by 18% in the first
                quarter using PandorLabs. Real-time competitor tracking lets us
                price optimally while protecting our brand positioning.&quot;
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-amber-400">📦</div>
                <h4 className="mb-1 font-semibold text-white">
                  Marketplace Operations Director
                </h4>
                <p className="text-gray/80 text-sm">Fortune 500 Retailer</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;Before PandorLabs, we had 5 analysts manually tracking
                prices. Now we monitor 50K+ SKUs in real-time and our team
                focuses on strategy, not spreadsheets.&quot;
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-amber-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-amber-400">💰</div>
                <h4 className="mb-1 font-semibold text-white">
                  Pricing Strategy Lead
                </h4>
                <p className="text-gray/80 text-sm">DTC Fashion Brand</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;The MAP violation alerts saved our brand. We caught
                unauthorized sellers within hours instead of weeks, protecting
                millions in brand equity.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="from-primary/10 to-primary relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent"></div>
        <div className="relative z-10 container">
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
              Start your free trial—get your first competitive insights in the
              next 15 minutes.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/request" className={buttonVariants({ size: 'lg' })}>
                Start Free Trial →
              </Link>
              <Link
                href="/demo"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                See 2-Minute Demo
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
                <p>✓ Free 14-day trial—no credit card required</p>
                <p>✓ Setup in 15 minutes or less</p>
                <p>✓ Cancel anytime, no questions asked</p>
              </div>
            </div>

            <p className="text-gray text-sm">
              Trusted by 500+ e-commerce brands and retailers worldwide
            </p>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'E-commerce Price Monitoring API',
            description:
              'Monitor 30.7M+ stores with real-time price tracking. Detect MAP violations, track competitor pricing, and optimize dynamic pricing strategies across all major marketplaces and retailers.',
            brand: {
              '@type': 'Brand',
              name: 'PandorLabs',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/shopping`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '134',
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
