'use client'

import {
  Activity,
  Award,
  Bot,
  CheckCircle2,
  Code,
  Database,
  Globe,
  Lock,
  MessageSquare,
  Radio,
  Search,
  Share2,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

import { FAQSection } from '../_components/faq-section'
import { FeaturesGrid } from '../_components/features-grid'
import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'
import { SOCIAL_SOURCES } from '@/lib/social-sources'
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

const heroData = {
  product: 'socialMedia' as const,
  headline: 'Social Media Data for Market Intelligence',
  subheadline:
    'We monitor 10+ platforms for you and deliver the mentions, metrics, and sentiment straight into your stack. Track brands, competitors, and trends without building a single scraper.',
  valueProps: [
    'Real-time data from Instagram, TikTok, Twitter/X, and 7+ platforms',
    'Sub-60-second latency for instant brand monitoring',
    'One unified schema, 200+ engagement metrics, sentiment scored',
    'GDPR-compliant with enterprise security and privacy controls',
  ],
  trustIndicators: [
    { Icon: Zap, text: '<100ms Response' },
    { Icon: Activity, text: 'Real-time Data' },
    { Icon: TrendingUp, text: '99.9% Uptime' },
  ],
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
      'Instagram, TikTok, Twitter/X, Facebook, LinkedIn, YouTube, Pinterest, Reddit, and Snapchat arrive in one standardized schema, so a post from any network lands with the same field names.',
    metrics: '10+ Platforms',
  },
  {
    Icon: Radio,
    title: 'Real-Time Streaming',
    description:
      'Track social media activity with sub-60-second data latency. Webhooks push brand mentions, trending content, and competitive moves into your systems the moment they land.',
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
    title: 'Delivered to Your Stack',
    description:
      'We push JSON, CSV, or Parquet to S3, GCS, Snowflake, BigQuery, or your webhooks on the cadence you set. A solutions engineer configures the schema and destination with you — there is nothing for your team to build.',
  },
]

const complianceItems = [
  {
    Icon: Shield,
    title: 'SOC 2 Type II',
    description:
      'Audited controls for security, availability, and confidentiality. Report available under NDA.',
  },
  {
    Icon: Lock,
    title: 'GDPR & CCPA',
    description:
      'Public data only, with data subject request handling, retention limits, and deletion propagation.',
  },
  {
    Icon: Activity,
    title: '99.9% Uptime SLA',
    description:
      'Contractual availability target, public status page, and service credits when we miss it.',
  },
  {
    Icon: Globe,
    title: 'EU / US Data Residency',
    description:
      'Choose the region where your social data is stored and processed. Private VPC delivery available.',
  },
]

const faqs = [
  {
    question:
      'Which platforms do you cover, and how deep does the coverage go?',
    answer:
      'We cover Instagram, TikTok, Twitter/X, Facebook, LinkedIn, YouTube, Pinterest, Reddit, and Snapchat behind a single schema, so a post from any of them arrives with the same field names. For each post you get the content, timestamps, author handle, and the full engagement envelope — likes, comments, shares, views where the platform exposes them — plus comment threads on the platforms that allow it. Coverage depth varies by platform because each one exposes a different surface, so during scoping we confirm in writing exactly which fields you can rely on for each network you care about.',
  },
  {
    question: 'How fresh is the data, and how often does it refresh?',
    answer:
      'Tracked keywords, handles, and hashtags refresh continuously, with new matching posts typically available within 60 seconds of publication. Webhooks fire on the same clock, so a mention spike reaches your systems while it is still actionable rather than in tomorrow’s report. Historical backfill goes back 12+ months and is delivered in the same schema as the live feed, so trend analysis and real-time alerting read from one consistent dataset rather than two.',
  },
  {
    question: 'Is this legal, and how do you handle platform terms of service?',
    answer:
      'We collect public data only — posts, profiles, and engagement counts that any logged-out visitor can see. We do not access private accounts, direct messages, or content behind a login, and we do not resell personal data or attempt to deanonymize users. Where a platform offers an official API we use it under its terms; where we collect publicly available pages, we respect robots directives and rate limits, and we do not circumvent authentication.',
  },
  {
    question: 'How do you handle personal data and GDPR requests?',
    answer:
      'Social posts can contain personal data, so we treat them as such: data is stored in your chosen region, retention windows are configurable, and we honor deletion and access requests within the statutory window. When a user deletes a post or an account on the source platform, that deletion propagates through our pipeline and the records drop out of your subsequent pulls. Our DPA covers the processor relationship and is available before you sign.',
  },
  {
    question:
      'What formats do you deliver in, and what does integration look like?',
    answer:
      'We deliver JSON, CSV, or Parquet into S3, GCS, Azure Blob, Snowflake, or BigQuery, and push webhooks for real-time alerting — whichever fits the pipeline you already run. Integration means telling a solutions engineer where the data should land and how often; we handle the collection, normalization, and delivery. The schema is stable across platforms, so a dashboard built on Instagram data works on TikTok data without a rewrite.',
  },
  {
    question: 'What happens when a platform changes its layout or API?',
    answer:
      'Platform changes are our problem, not yours. Our extractors are monitored continuously, and when a source changes its structure our team patches the extractor while the unified schema we deliver to you stays exactly the same. If a change causes a gap in coverage, we tell you which platform and which window were affected rather than silently returning fewer results.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Pricing is scoped per engagement, driven by the platforms you monitor, the number of tracked keywords and handles, refresh cadence, and delivery destinations — not per seat. Before you commit to anything we run a sample against your actual brand terms and hand back the dataset, so you can judge the data on your own terms. Enterprise engagements add dedicated infrastructure, custom filters, and SLA-backed support.',
  },
]

export default function SocialMediaPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Social Media Data',
    description:
      'Managed social media data from 10+ platforms including Instagram, TikTok, Twitter/X, and more, delivered to your warehouse or webhooks. Engagement metrics, sentiment analysis, brand monitoring, and influencer analytics with sub-60-second latency.',
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
    { name: 'Social Media Data', url: `${siteUrl}/products/social-media` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/social-media`,
    'Social Media Data for Market Intelligence',
    'Managed social media data from 10+ platforms, delivered to your stack. Monitor brand mentions, track competitors, and analyze trends with comprehensive metrics.',
  )

  return (
    <div className="bg-primary min-h-screen">
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

      {/* Vision — first section, no divider */}
      <section className="section section-glow">
        <div className="relative z-10 container">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="eyebrow">why managed social data</p>
                <h1 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Social Intelligence{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Real-Time Edge
                  </span>
                </h1>
                <p className="text-gray mt-4 text-lg">{heroData.subheadline}</p>
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
      </section>

      {/* How It Works */}
      <section className="section section-divided section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">how it works</p>
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
              description="Tell us the platforms, brand keywords, competitor handles, and hashtags to track. We cover Instagram, TikTok, Twitter/X, LinkedIn, and 7+ networks."
            />
            <ProcessStep
              number="02"
              title="Real-Time Data Streaming"
              description="AI models analyze engagement metrics, sentiment scores, influencer activity, and viral patterns with sub-60-second latency. Webhooks alert you to spikes."
            />
            <ProcessStep
              number="03"
              title="Actionable Insights"
              description="Structured JSON, CSV, or Parquet lands in your warehouse, bucket, or webhook with 200+ metrics, ready for your dashboard, BI tools, or CRM."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Post published
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              &lt;60s latency
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Social Intelligence
            </span>
          </div>
        </div>
      </section>

      {/* Capability grid */}
      <FeaturesGrid
        title="Everything You Need to Read the Social Layer"
        subtitle="One schema, ten platforms, delivered to your stack — from raw posts to sentiment-scored intelligence."
        features={features}
        accentColor={accentColor}
        accentGlow={accentGlow}
      />

      {/* Use Cases */}
      <section className="section section-divided section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">social media applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Social Intelligence{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Use Case
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From brand monitoring to influencer analytics, our data powers the
              next generation of social listening applications.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Radio}
              title="Brand Reputation Monitoring"
              description="Track brand mentions, sentiment trends, and crisis signals across all platforms. Respond to negative sentiment before it goes viral."
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
      </section>

      {/* Technology */}
      <section className="section section-divided section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">technology</p>
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
              description="One unified pipeline combining official platform APIs and public-data collection across Instagram, TikTok, Twitter/X, LinkedIn, and 7+ platforms with real-time sync."
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
      </section>

      {/* Compliance & delivery */}
      <section className="section section-divided section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">compliance & delivery</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Public Data Only,{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Collected Responsibly
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              We collect what a logged-out visitor can see — never private
              accounts, never direct messages, never content behind a login. The
              controls below are contract terms, not aspirations.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {complianceItems.map(({ Icon, title, description }) => (
              <div key={title} className="panel p-7">
                <div className="bg-green-light/10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Icon className="text-green-light h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="text-gray text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* Enterprise capabilities */}
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
                real-time streaming shaped around your monitoring workflows.
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
                engineering access over Slack or Teams for critical monitoring.
              </p>
            </div>

            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <CheckCircle2 className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Schema Stability
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                When a platform changes its layout, we patch the extractor. The
                schema we deliver to you does not move.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className={buttonVariants()}>
              Schedule a Demo
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline' })}
            >
              Get an Enterprise Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Per-platform pages — each covers the objects, fields, and legal
          scope that are specific to that network. */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">by platform</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Coverage,{' '}
              <span className="bg-linear-to-l from-violet-400 to-violet-600 bg-clip-text text-transparent">
                platform by platform
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Every network exposes a different surface. These pages set out
              exactly which objects and fields you can rely on for each one.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {SOCIAL_SOURCES.map((source) => (
              <Link
                key={source.slug}
                href={`/products/social-media/${source.slug}`}
                className="panel group p-6 transition-colors hover:border-white/20"
              >
                <h3 className="mb-2 font-semibold text-white">{source.name}</h3>
                <p className="text-gray text-sm">{source.tagline}</p>
                <p className="text-gray/70 mt-3 text-xs">
                  {source.objectTypes.slice(0, 3).join(' · ')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — emits FAQPage JSON-LD */}
      <FAQSection faqs={faqs} accentColor={accentColor} />

      {/* Final CTA */}
      <section className="section section-divided section-glow">
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Transform Social Intelligence Into{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Competitive Advantage
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              We monitor 10+ platforms and deliver the results into your stack,
              so you can act on social data while it still matters. Start with a
              free sample dataset built from your own brand terms.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request a Sample Dataset
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Schedule a Demo
              </Link>
            </div>

            {/* Product-specific trust badges */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <TrustBadge icon={Radio} text="10+ Platforms" />
              <TrustBadge icon={Activity} text="Real-Time Monitoring" />
              <TrustBadge icon={Shield} text="SOC 2 Type II Certified" />
              <TrustBadge icon={TrendingUp} text="200+ Metrics" />
            </div>

            <div className="text-gray mb-4 space-y-1 text-sm">
              <p>✓ Free sample dataset from your own brand terms</p>
              <p>✓ Delivery configured with a solutions engineer</p>
              <p>✓ No long-term lock-in — cancel at the end of any term</p>
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
