'use client'

import {
  Building2,
  Home,
  Shield,
  TrendingUp,
  Zap,
  Search,
  Users,
  Target,
  Calculator,
  LineChart,
  Map,
  Database,
  Bot,
  Cpu,
  Lock,
  Award,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
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

export default function RealEstatePage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Real Estate Market Data API',
    description:
      'Access comprehensive real estate market intelligence with property listings, pricing trends, market analytics, and investment insights. Real-time data for informed property decisions.',
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
    { name: 'Real Estate Data API', url: `${siteUrl}/products/real-estate` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/real-estate`,
    'Real Estate Market Data API',
    'Access comprehensive real estate market intelligence with property listings, pricing trends, and investment insights.'
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
      {/* Vision Section - Real Estate Intelligence Advantage */}
      <div className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="container">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                  WHY REAL ESTATE DATA API
                </p>
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
                  shifts, and opportunities vanish while you&apos;re still gathering
                  data. Traditional real estate tools leave you flying blind in
                  fast-moving markets.
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
                <StatsCard value="<50ms" label="API Response" />
                <StatsCard value="99.9%" label="Data Accuracy" />
              </div>
            </div>

            {/* Market Visualization Placeholder */}
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
      </div>

      {/* How It Works Section */}
      <div className="from-background to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="from-green-light/5 to-green-light/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-30"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              HOW IT WORKS
            </p>
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
              description="Search by address, location, price range, or custom criteria. Our API understands natural language queries and complex filters for precise results."
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
          <div className="text-gray mt-10 flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Request
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 animate-pulse rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              &lt;50ms avg
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Data Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="from-background to-primary/20 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              REAL ESTATE APPLICATIONS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Real Estate{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Use Case
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From investment analysis to automated underwriting, our API powers
              the next generation of PropTech.
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
              description="Build next-generation real estate applications with comprehensive API access to listings, valuations, and market intelligence."
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
      </div>

      {/* Technology Section */}
      <div className="from-primary/20 to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="to-green-light/5 absolute inset-0 bg-gradient-to-br from-green-100/5 via-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              TECHNOLOGY
            </p>
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
              description="Unified API combining MLS feeds, county records, transaction data, and proprietary sources across 50+ markets with real-time synchronization."
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
      </div>

      {/* Enterprise Section */}
      <div className="from-background to-primary/10 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              ENTERPRISE SOLUTIONS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Enterprise Scale
              </span>
            </h2>
            <p className="text-gray mx-auto mb-12 max-w-2xl">
              Whether you&apos;re a PropTech startup or a national brokerage, we
              provide the infrastructure and support for mission-critical real
              estate applications.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                    <Award className="text-green-light h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="group-hover:text-green-light text-lg font-semibold text-white transition-colors duration-300">
                    Custom Data Pipelines
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  Dedicated infrastructure with custom filters, webhooks, and
                  real-time streaming for your enterprise workflows.
                </p>
              </div>

              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                    <Activity className="text-green-light h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="group-hover:text-green-light text-lg font-semibold text-white transition-colors duration-300">
                    Priority Support
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  Dedicated account management with SLA guarantees. Direct
                  engineering access via Slack/Teams integration.
                </p>
              </div>

              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                    <Lock className="text-green-light h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="group-hover:text-green-light text-lg font-semibold text-white transition-colors duration-300">
                    Compliance & Security
                  </h3>
                </div>
                <p className="text-gray group-hover:text-gray/90 leading-relaxed transition-colors duration-300">
                  GDPR/CCPA compliant, SOC 2 Type II certified. On-premise
                  deployment options available for regulated industries.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/demo" className={buttonVariants()}>
                  Schedule Demo
                </Link>
                <Link
                  href="/pricing"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  View Enterprise Pricing
                </Link>
              </div>
            </div>

            {/* API Code Example */}
            <div className="flex items-center">
              <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-gray ml-3 text-sm">
                    API Request Example
                  </span>
                </div>
                <pre className="overflow-x-auto text-sm">
                  <code className="text-green-light">
                    {`GET /api/v1/properties?
  location=austin,tx&
  price_min=400000&
  price_max=600000&
  beds_min=3&
  ml_valuation=true&
  market_trends=true`}
                  </code>
                </pre>
                <div className="text-gray mt-4 text-xs">
                  <span className="text-green-400">200 OK</span> - 1,247
                  properties found in 42ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Final CTA */}
      <div className="from-primary/10 to-primary relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Transform Property Intelligence Into{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Competitive Advantage
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              Join 500+ real estate professionals leveraging AI-powered market
              data to make faster, smarter decisions.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/request" className={buttonVariants({ size: 'lg' })}>
                Start Free Trial — 1,000 API Calls
              </Link>
              <Link
                href="/demo"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Schedule Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <TrustBadge icon={Shield} text="SOC 2 Certified" />
              <TrustBadge icon={CheckCircle2} text="GDPR Compliant" />
              <TrustBadge icon={Activity} text="99.9% Uptime SLA" />
              <TrustBadge icon={Database} text="140M+ Properties" />
            </div>

            <p className="text-gray text-sm">
              Trusted by leading PropTech companies and real estate
              professionals worldwide
            </p>
          </div>
        </div>
      </div>

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
            name: 'Real Estate Data API',
            description:
              'Access 140M+ property records with ML-powered insights. Real-time MLS feeds, 94% valuation accuracy, and sub-50ms API response times for investment analysis and automated underwriting.',
            brand: {
              '@type': 'Brand',
              name: 'PandorLabs',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/real-estate`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '87',
            },
            category: 'Real Estate Technology',
            featureList: [
              '140M+ property records',
              'Real-time MLS data feeds',
              '94% valuation accuracy',
              'Sub-50ms API response',
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
