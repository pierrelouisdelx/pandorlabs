'use client'

import {
  Activity,
  Award,
  Bot,
  Code,
  Database,
  Lock,
  MessageSquare,
  Radio,
  Search,
  Share2,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

import { FeaturesGrid } from '../_components/features-grid'
import { FinalCTASection } from '../_components/final-cta-section'
import { ProductHero } from '../_components/product-hero'
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

const accentColor = '#8B5CF6'
const accentGlow = 'rgba(139, 92, 246, 0.15)'
const accentGradient = 'from-purple-500/20 via-fuchsia-500/20 to-pink-500/20'

const heroData = {
  product: 'socialMedia' as const,
  headline: 'Social Media Data API for Market Intelligence',
  subheadline:
    'Access real-time social media data from 10+ platforms through a single API. Monitor brand mentions, track competitors, and analyze trends with comprehensive metrics.',
  valueProps: [
    'Real-time data from Instagram, TikTok, Twitter/X, and 7+ platforms',
    'Sub-60-second latency for instant brand monitoring',
    'Unified API with 200+ engagement metrics and sentiment analysis',
    'GDPR-compliant with enterprise security and privacy controls',
  ],
  primaryCTA: 'Start Free Trial',
  secondaryCTA: 'View Documentation',
  trustIndicators: [
    { Icon: Zap, text: '<100ms Response' },
    { Icon: Activity, text: 'Real-time Data' },
    { Icon: TrendingUp, text: '99.9% Uptime' },
  ],
  accentColor,
  accentGlow,
  accentGradient,
  visualElement: (
    <div className="relative aspect-square w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 100%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />

          {/* Floating Social Media Post Cards */}
          {[
            {
              x: '5%',
              y: '15%',
              platform: '📘',
              likes: '2.4K',
              comments: '89',
              delay: '0s',
            },
            {
              x: '55%',
              y: '10%',
              platform: '📸',
              likes: '5.8K',
              comments: '234',
              delay: '0.7s',
            },
            {
              x: '25%',
              y: '55%',
              platform: '🎵',
              likes: '12K',
              comments: '567',
              delay: '1.4s',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="group absolute cursor-pointer rounded-xl border border-purple-500/30 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-purple-400/50 hover:bg-white/10"
              style={{
                left: card.x,
                top: card.y,
                animation: `float 4s ease-in-out infinite`,
                animationDelay: card.delay,
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl">{card.platform}</span>
                  <Activity className="h-4 w-4 animate-pulse text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <TrendingUp className="h-3 w-3 text-purple-400" />
                    <span className="font-semibold">{card.likes}</span>
                    <span className="text-white/50">likes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <MessageSquare className="h-3 w-3 text-pink-400" />
                    <span className="font-semibold">{card.comments}</span>
                    <span className="text-white/50">comments</span>
                  </div>
                </div>
              </div>
              {/* Engagement trend indicator */}
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{
                      width: `${60 + i * 15}%`,
                      animation: 'slideIn 2s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Platform Icons constellation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48">
              {[
                { icon: '📸', angle: 0 },
                { icon: '🐦', angle: 45 },
                { icon: '📘', angle: 90 },
                { icon: '💼', angle: 135 },
                { icon: '▶️', angle: 180 },
                { icon: '🎵', angle: 225 },
                { icon: '📍', angle: 270 },
                { icon: '🤝', angle: 315 },
              ].map((item, i) => {
                const radius = 100
                const x =
                  radius * Math.cos((item.angle * Math.PI) / 180) + radius
                const y =
                  radius * Math.sin((item.angle * Math.PI) / 180) + radius
                return (
                  <div
                    key={i}
                    className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm"
                    style={{
                      left: `${x - 20}px`,
                      top: `${y - 20}px`,
                      animation: `pulse 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    <span className="text-sm">{item.icon}</span>
                  </div>
                )
              })}
              {/* Center glow */}
              <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

const features = [
  {
    Icon: Share2,
    title: 'Multi-Platform Coverage',
    description:
      'Access unified data from Instagram, TikTok, Twitter/X, Facebook, LinkedIn, YouTube, Pinterest, Reddit, and Snapchat through a single API endpoint with standardized schemas.',
    metrics: '10+ Platforms',
  },
  {
    Icon: Radio,
    title: 'Real-Time Streaming',
    description:
      'Track social media activity with sub-60-second data latency. Get instant webhook notifications for brand mentions, trending content, and competitive moves.',
    metrics: '<60s Latency',
  },
  {
    Icon: TrendingUp,
    title: 'Engagement Analytics',
    description:
      'Deep engagement analysis with 200+ metrics including sentiment scores, influencer identification, audience demographics, share of voice, and viral coefficient tracking.',
    metrics: '200+ Metrics',
  },
  {
    Icon: Users,
    title: 'Audience Insights',
    description:
      'Extract actionable insights from follower demographics, growth patterns, engagement velocity, and behavioral analytics to inform strategic decisions.',
  },
  {
    Icon: Search,
    title: 'Content Discovery',
    description:
      'Find and analyze trending content, hashtag performance, content categorization, and viral patterns across all platforms with advanced filtering and search.',
  },
  {
    Icon: Database,
    title: 'Historical Data',
    description:
      '12+ months of historical social media data for trend analysis, performance benchmarking, and predictive insights with full data export capabilities.',
  },
  {
    Icon: MessageSquare,
    title: 'Sentiment Analysis',
    description:
      'AI-powered sentiment analysis of comments, posts, and brand mentions with emotion detection, tone classification, and crisis alert capabilities.',
  },
  {
    Icon: Code,
    title: 'Developer-First API',
    description:
      'Comprehensive REST API with SDKs for Python, JavaScript, PHP, and Ruby. Interactive playground, detailed docs, and 24/7 technical support for seamless integration.',
  },
]

export default function SocialMediaPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Social Media Data API',
    description:
      'Access real-time social media data from 10+ platforms including Instagram, TikTok, Twitter/X, and more. Comprehensive engagement metrics, sentiment analysis, brand monitoring, and influencer analytics with sub-60-second latency.',
    url: `${siteUrl}/products/social-media`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'Social Media Intelligence Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'Social Media Data API', url: `${siteUrl}/products/social-media` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/social-media`,
    'Social Media Data API for Market Intelligence',
    'Access real-time social media data from 10+ platforms through a single API. Monitor brand mentions, track competitors, and analyze trends with comprehensive metrics.'
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
      {/* Vision Section */}
      <div className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="container">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                  WHY SOCIAL MEDIA DATA API
                </p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Social Intelligence{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Real-Time Edge
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 lg:mx-0">
                <p>
                  Manual social monitoring can&apos;t scale. By the time you
                  compile brand mentions, analyze sentiment, and track
                  competitors, viral moments have passed and crises have
                  escalated.
                </p>
                <p className="text-lg font-semibold text-white">
                  Get instant social intelligence across all platforms with
                  AI-powered insights.
                </p>
                <p>
                  Access real-time data from 10+ social platforms with
                  sub-60-second latency. Our AI models analyze 200+ engagement
                  metrics and sentiment patterns to deliver actionable
                  insights—from brand monitoring to influencer analytics.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="10+" label="Platforms" />
                <StatsCard value="<60s" label="Data Latency" />
                <StatsCard value="200+" label="Metrics Tracked" />
              </div>
            </div>

            {/* Visual Element */}
            <div className="flex w-full items-center justify-center lg:w-1/2">
              {heroData.visualElement}
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
                in Under 60 Seconds
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Our real-time social data pipeline delivers brand intelligence
              faster than you can refresh your feed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Configure Social Monitoring"
              description="Select platforms, brand keywords, competitor handles, and hashtags to track. Our API supports Instagram, TikTok, Twitter/X, LinkedIn, and 7+ networks."
            />
            <ProcessStep
              number="02"
              title="Real-Time Data Streaming"
              description="AI models analyze engagement metrics, sentiment scores, influencer activity, and viral patterns with sub-60-second latency. Webhooks alert you to spikes."
            />
            <ProcessStep
              number="03"
              title="Actionable Insights"
              description="Receive structured JSON/CSV with 200+ metrics ready for your dashboard, BI tools, or CRM. Make data-driven social decisions in real-time."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              API Request
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 animate-pulse rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              &lt;60s latency
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Social Intelligence
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
              SOCIAL MEDIA APPLICATIONS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Social Intelligence{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Use Case
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From brand monitoring to influencer analytics, our API powers the
              next generation of social listening applications.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Radio}
              title="Brand Reputation Monitoring"
              description="Track brand mentions, sentiment trends, and crisis signals across all platforms. Respond to negative sentiment before it goes viral. Teams report 60% faster crisis response."
            />
            <UseCaseCard
              icon={Users}
              title="Influencer & Creator Analytics"
              description="Identify micro-influencers, track campaign performance, and measure ROI with engagement rate analysis and audience authenticity scoring."
            />
            <UseCaseCard
              icon={TrendingUp}
              title="Competitor Intelligence"
              description="Monitor competitor social strategies, content performance, and audience growth. Stay ahead with real-time competitive benchmarking."
            />
            <UseCaseCard
              icon={MessageSquare}
              title="Campaign Performance"
              description="Track hashtag performance, content engagement, and campaign reach across platforms. Optimize campaigns in real-time based on engagement data."
            />
            <UseCaseCard
              icon={Search}
              title="Trend Discovery"
              description="Identify emerging trends, viral content patterns, and audience interests. Capitalize on trending topics before competitors."
            />
            <UseCaseCard
              icon={Shield}
              title="Crisis Management"
              description="Automated monitoring for brand safety and crisis detection. Receive instant alerts for sentiment spikes and negative viral content."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Need custom social monitoring integration? Our team can help
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
              Enterprise-Grade Social Intelligence{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Powered by advanced AI models, multi-platform aggregation, and
              battle-tested infrastructure that handles millions of social posts
              daily.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Radio}
              title="Multi-Platform Aggregation"
              description="Unified API combining official APIs and proprietary data sources across Instagram, TikTok, Twitter/X, LinkedIn, and 7+ platforms with real-time sync."
            />
            <TechFeatureCard
              icon={Bot}
              title="AI Sentiment Analysis"
              description="Advanced NLP models detect sentiment, emotion, and tone across 30+ languages with context-aware crisis detection and trend prediction algorithms."
            />
            <TechFeatureCard
              icon={Shield}
              title="Enterprise Infrastructure"
              description="SOC 2 Type II certified with 99.9% uptime SLA, sub-60s data latency, and GDPR-compliant data handling for maximum reliability and compliance."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="10+" label="Platforms" />
            <StatsCard value="<60s" label="Data Latency" />
            <StatsCard value="200+" label="Metrics" />
            <StatsCard value="99.9%" label="Uptime SLA" />
          </div>
        </div>
      </div>

      {/* Enterprise/Social Proof Section */}
      <div className="from-background to-primary/10 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              TRUSTED BY LEADING BRANDS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Enterprise Scale
              </span>
            </h2>
            <p className="text-gray mx-auto mb-12 max-w-2xl">
              Whether you&apos;re a social media agency or a global brand, we
              provide the infrastructure and support for mission-critical social
              intelligence.
            </p>
          </div>

          {/* Testimonials */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">📱</div>
                <h4 className="mb-1 font-semibold text-white">
                  Social Media Agencies
                </h4>
                <p className="text-gray/80 text-sm">
                  Leading Digital Marketing Firm
                </p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;We replaced 5 social listening tools with PandorLabs. Now
                we get better data, faster—and save $3K/month on tool
                subscriptions.&quot;
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">🏢</div>
                <h4 className="mb-1 font-semibold text-white">
                  Enterprise Brands
                </h4>
                <p className="text-gray/80 text-sm">
                  Fortune 500 Consumer Company
                </p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;Real-time crisis detection saved our brand reputation
                during a viral moment. We responded in minutes, not hours.&quot;
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">📊</div>
                <h4 className="mb-1 font-semibold text-white">
                  Marketing Analytics
                </h4>
                <p className="text-gray/80 text-sm">Series B Marketing SaaS</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;PandorLabs gives us social data our competitors don&apos;t
                have access to. It&apos;s a competitive moat for our
                platform.&quot;
              </p>
            </div>
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
                  real-time streaming for your enterprise social monitoring
                  workflows.
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
                  engineering access via Slack/Teams integration for critical
                  social monitoring.
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
                  GDPR/CCPA compliant, SOC 2 Type II certified. Secure handling
                  of social data with platform-compliant API usage.
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
                  <code className="text-purple-400">{`GET /api/v1/social?
  platforms=instagram,tiktok,twitter&
  keywords=brand_name,competitor&
  metrics=engagement,sentiment&
  real_time=true&
  webhooks=true`}</code>
                </pre>
                <div className="text-gray mt-4 text-xs">
                  <span className="text-green-400">200 OK</span> - 12,458 posts
                  analyzed in 42ms
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
              Transform Social Intelligence Into{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Competitive Advantage
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              Join 200+ brands leveraging real-time social data to make faster,
              smarter marketing decisions. Monitor 10+ platforms with a single
              API.
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

            {/* Product-specific trust badges */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <TrustBadge icon={Radio} text="10+ Platforms" />
              <TrustBadge icon={Activity} text="Real-Time Monitoring" />
              <TrustBadge icon={Shield} text="SOC 2 Certified" />
              <TrustBadge icon={TrendingUp} text="200+ Metrics" />
            </div>

            <div className="text-gray mb-4 space-y-1 text-sm">
              <p>✓ Free first 1,000 API calls—no credit card required</p>
              <p>✓ Setup in 5 minutes with comprehensive docs</p>
              <p>✓ Cancel anytime, no questions asked</p>
            </div>

            <p className="text-gray text-sm">
              Trusted by leading social media agencies and enterprise brands
              worldwide
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
            transform: translateY(-15px);
          }
        }

        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: var(--final-width);
          }
        }
      `}</style>
    </div>
  )
}
