'use client'

import { Bitcoin, Shield, TrendingUp, Zap, Lock, Activity } from 'lucide-react'

import { FinalCTASection } from '../_components/final-cta-section'
import { ProductHero } from '../_components/product-hero'
import StatsCard from '@/components/custom/stats-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import UseCaseCard from '@/components/custom/use-case-card'
import Script from 'next/script'
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

const accentColor = '#8B5CF6'
const accentGlow = 'rgba(139, 92, 246, 0.15)'

export default function CryptoDataPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Cryptocurrency Market Data API',
    description:
      'Access real-time crypto prices from 400+ exchanges with <50ms latency. Track 10,000+ cryptocurrencies with institutional-grade reliability, WebSocket support, and unified multi-chain blockchain analytics.',
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
    { name: 'Cryptocurrency Data API', url: `${siteUrl}/products/crypto` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/crypto`,
    'Cryptocurrency Market Data API',
    'Access real-time crypto prices from 400+ exchanges with <50ms latency and institutional-grade reliability.'
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
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
        headline="Cryptocurrency Market Data API"
        subheadline="Access real-time crypto prices from 400+ exchanges with <50ms latency and institutional-grade reliability"
        valueProps={[
          '10,000+ cryptocurrencies across 400+ exchanges',
          '<50ms latency with WebSocket support',
          'SOC 2 certified institutional infrastructure',
          'Unified multi-chain blockchain analytics',
        ]}
        primaryCTA="Start Free Trial"
        secondaryCTA="View Documentation"
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

      {/* Why Crypto Data API Section */}
      <div className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center">
                <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                  WHY CRYPTO DATA API
                </p>
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
                  Our Crypto Data API delivers real-time prices, order book
                  depth, and historical data from 400+ exchanges with sub-50ms
                  latency. SOC 2 certified infrastructure ensures your trading
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
                <StatsCard value="99.99%" label="API Uptime" />
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
      </div>

      {/* Technology Section */}
      <div className="from-background to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 opacity-30" />
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              ENTERPRISE INFRASTRUCTURE
            </p>
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
              description="Global CDN and WebSocket connections deliver sub-50ms response times. Colocation options available for high-frequency trading applications."
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
            <StatsCard value="1M+" label="Requests/Second" />
            <StatsCard value="50+" label="Blockchain Networks" />
            <StatsCard value="24/7" label="Support Available" />
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="from-background to-primary/20 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              APPLICATIONS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Your{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Crypto Applications
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From trading platforms to portfolio trackers, our API powers the
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
              description="Generate regulatory reports, track transactions, and maintain audit trails with comprehensive historical data and API logs."
            />
          </div>
        </div>
      </div>

      {/* Social Proof / Testimonials Section */}
      <div className="from-primary/20 to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-violet-500/5" />
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              TRUSTED BY PROFESSIONALS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Crypto Professionals
              </span>
            </h2>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-violet-400">🏢</div>
                <h4 className="mb-1 font-semibold text-white">
                  Trading Platforms
                </h4>
                <p className="text-gray/80 text-sm">Major Crypto Exchange</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;The API reliability and data quality are unmatched.
                We&apos;ve built our entire trading infrastructure on this data
                with zero regrets.&quot;
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-violet-400">📊</div>
                <h4 className="mb-1 font-semibold text-white">
                  Institutional Traders
                </h4>
                <p className="text-gray/80 text-sm">Hedge Fund</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;Sub-50ms latency is critical for our trading strategies.
                This API delivers consistently and has become essential to our
                operations.&quot;
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="mb-4">
                <div className="mb-2 text-2xl text-violet-400">🚀</div>
                <h4 className="mb-1 font-semibold text-white">DeFi Startups</h4>
                <p className="text-gray/80 text-sm">Portfolio Analytics</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;We needed multi-chain data that just works. The
                comprehensive coverage and reliability let us focus on building
                great products.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      <FinalCTASection accentColor={accentColor} accentGlow={accentGlow} />

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
            name: 'Cryptocurrency Market Data API',
            description:
              'Real-time crypto market data from 400+ exchanges with sub-50ms latency. Track prices, trading volumes, and blockchain metrics across 10,000+ cryptocurrencies with institutional-grade reliability.',
            brand: {
              '@type': 'Brand',
              name: 'PandorLabs',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/crypto`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '92',
            },
            category: 'Cryptocurrency Technology',
            featureList: [
              '10,000+ cryptocurrencies tracked',
              '400+ exchange integrations',
              'Sub-50ms API latency',
              'WebSocket real-time streams',
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
