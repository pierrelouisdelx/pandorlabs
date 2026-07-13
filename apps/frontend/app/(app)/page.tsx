import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import DashboardPreview from '@/components/custom/dashboard-preview'
import { buttonVariants } from '@/components/ui/button'
import HeroSearchInput from '@/components/custom/hero-search-input'
import helper from '@/lib/helper'
import { Metadata } from 'next'
import CompanyLogoMarquee from '@/components/custom/company-logo-marquee'
import Link from 'next/link'
import Script from 'next/script'
import {
  generateSoftwareApplicationSchema,
  generateWebPageSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'
import {
  Shield,
  Target,
  Users,
  Scale,
  Radio,
  Bot,
  Lock,
  Zap,
  Award,
  CheckCircle2,
  Activity,
  Building2,
  Bitcoin,
  Megaphone,
  Brain,
  ScanLine,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'PandorLabs | Market Intelligence Platform',
  description:
    'Get competitive intelligence and market data without hiring analysts or waiting weeks. Access real-time business insights from any source in minutes. Trusted by Fortune 500 companies.',
  keywords: [
    'market intelligence',
    'competitive intelligence',
    'business data',
    'real-time insights',
    'market research',
    'data extraction',
    'web scraping',
    'business decisions',
    'Fortune 500',
    'competitive analysis',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'PandorLabs | Market Intelligence Platform',
    description:
      'Get the competitive intelligence and market data you need—without hiring analysts, building tools, or waiting weeks. Real-time insights in minutes.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PandorLabs | Market Intelligence Platform',
    description:
      'Get competitive intelligence and market data without hiring analysts or waiting weeks. Real-time insights in minutes.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const softwareAppSchema = generateSoftwareApplicationSchema(
    siteUrl,
    'PandorLabs',
    'Market Intelligence Platform that delivers competitive intelligence and real-time business insights without hiring analysts or waiting weeks. Trusted by Fortune 500 companies for faster, smarter business decisions.',
  )

  const webPageSchema = generateWebPageSchema(
    siteUrl,
    'PandorLabs | Market Intelligence Platform',
    'Get competitive intelligence and market data without hiring analysts or waiting weeks. Access real-time business insights from any source in minutes.',
  )

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="software-app-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(softwareAppSchema),
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
      <div className="relative -mt-24 flex min-h-screen items-center bg-[url(/images/hero-section.png)] bg-cover bg-center bg-no-repeat pt-24">
        <span className="from-primary to-primary/20 absolute inset-0 z-5 bg-linear-to-t"></span>
        <div className="cursor-effect-section relative z-5 container w-full py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="relative mb-6 text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-7xl/tight">
              Make Faster, Smarter <br />
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent drop-shadow-lg">
                Business Decisions
              </span>
            </h1>
            <p className="text-gray mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Get the competitive intelligence and market data you need—without
              hiring analysts, building tools, or waiting weeks
            </p>

            <HeroSearchInput />

            {/* Trust Badges */}
            <div className="mt-20">
              <p className="mb-8 text-center text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
                trusted by industry leaders
              </p>
              <CompanyLogoMarquee />
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="section section-glow">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center">
                <p className="eyebrow">why pandorlabs</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Competitive Intelligence{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Advantage
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 text-center">
                <p>
                  Every day, critical business intelligence is locked away on
                  competitor websites, industry forums, and market databases.
                  Your team spends weeks manually collecting data, only to find
                  it&apos;s outdated by the time they analyze it.
                </p>
                <p className="text-lg font-semibold text-white">
                  What if you could access any data source instantly—with the
                  accuracy of a dedicated research team and the speed of
                  automation?
                </p>
                <p>
                  PandorLabs delivers market intelligence on demand. Simply ask
                  for the data you need in plain language. Our platform handles
                  the rest—from finding the right sources to delivering clean,
                  analysis-ready datasets.
                </p>
                <p>
                  No data engineers. No maintenance. No delays. Just the
                  insights you need to make better decisions, faster than your
                  competitors.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="99.9%" label="Always-On Intelligence" />
                <StatsCard value="<2s" label="Real-Time Insights" />
                <StatsCard value="24/7" label="Never Miss an Opportunity" />
              </div>
            </div>
            <div className="hidden w-1/2 items-center justify-center lg:flex">
              <div className="relative h-[500px] w-[500px]">
                <div className="bg-green-light/20 absolute inset-0 animate-pulse rounded-full blur-3xl" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <ScanLine className="text-green-light h-64 w-64 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">how it works</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              From Question to Dataset —{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in Minutes
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              No technical setup. No complicated processes. Just three simple
              steps to get the market intelligence you need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Tell Us What You Need"
              description="No coding. No technical setup. Just describe your business question: 'What are my competitors charging?' or 'Which companies are hiring in my market?' or 'What products are trending on Amazon?'"
            />
            <ProcessStep
              number="02"
              title="We Find and Verify the Data"
              description="Our AI agents locate the right sources, navigate complex websites, and validate data quality—automatically. What used to take your team weeks happens in minutes."
            />
            <ProcessStep
              number="03"
              title="Receive Ready-to-Use Insights"
              description="Get clean, organized data delivered to your preferred tools—Excel, Google Sheets, your CRM, or BI platform. Start analyzing immediately, not next quarter."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Start
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 animate-pulse rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              Minutes, not weeks
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Data Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">limitless applications</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              One Engine.{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Infinite Use Cases
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Our AI agents adapt to any applications across any industry.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Building2}
              title="Real Estate Market Intelligence"
              description="Find the best properties for sale in any market. Our AI agents analyze market trends, property values, and sales data to help you make the best investment decisions."
            />
            <UseCaseCard
              icon={Users}
              title="Lead Generation That Scales"
              description="Generate qualified leads 10x faster than manual research. Our clients fill their pipeline with decision-makers while competitors waste time on spreadsheets. Reduce cost-per-lead by 60% and accelerate sales cycles by 40%."
            />
            <UseCaseCard
              icon={Scale}
              title="E-commerce & Product Research"
              description="Track competitor products, pricing, and reviews across all major retailers. Identify trending products and pricing opportunities before your competition. Merchants increase profit margins by 18% on average."
            />
            <UseCaseCard
              icon={Bitcoin}
              title="Crypto Data Intelligence"
              description="Track the latest news and insights about the crypto market. Our AI agents analyze market trends, price movements, and news to help you make the best investment decisions."
            />
            <UseCaseCard
              icon={Brain}
              title="AI Datasets"
              description="Create custom AI datasets from millions of sources. Our AI agents help you find the right sources and create the perfect dataset for your use case."
            />
            <UseCaseCard
              icon={Megaphone}
              title="Social Media Intelligence"
              description="Get real-time insights from social media. Our AI agents analyze social media posts, comments, and trends to help you make the best decisions."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Don&apos;t see your use case? Our AI agents can handle custom data
              extraction from any source.
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Start Your First Data Request →
            </Link>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="section section-divided section-glow section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">technology</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Business-Critical Decisions
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              When your strategy depends on accurate data, you can&apos;t afford
              downtime, errors, or security risks. PandorLabs is built to
              enterprise standards because your decisions deserve enterprise
              reliability.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Bot}
              title="Set It and Forget It"
              description="No maintenance teams. No broken workflows. Our intelligent system adapts when websites change—so your data never stops flowing. Eliminate the $50K-$150K annual cost of maintaining custom data tools."
            />
            <TechFeatureCard
              icon={Lock}
              title="Your Data Stays Secure"
              description="Bank-level security that passes your compliance team's review. SOC 2 Type II certified. Full GDPR/CCPA compliance. Your competitive intelligence stays confidential. Deploy without lengthy security reviews."
            />
            <TechFeatureCard
              icon={Zap}
              title="Scales With Your Business"
              description="From 100 records to 10 million—our platform grows with you. 99.9% uptime means your insights are always available when you need them. Support enterprise-scale decisions without enterprise costs."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="99.7%" label="Success Rate" />
            <StatsCard value="<2s" label="Avg. Response" />
            <StatsCard value="Any Site" label="Works With" />
            <StatsCard value="10K+" label="Datasets/Month" />
          </div>
        </div>
      </div>

      {/* Enterprise Section */}
      <div className="section section-divided section-glow section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">for teams at scale</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Enterprise Web Data,{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Without the Enterprise Overhead
              </span>
            </h2>
            <p className="text-gray mx-auto mb-8 max-w-2xl">
              Dedicated pipelines, contractual guarantees, and a named team
              behind every dataset — so legal, security, and procurement can say
              yes on the first review.
            </p>
          </div>

          {/* Compliance strip */}
          <div className="mb-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, label: 'SOC 2 Type II', sub: 'Audited annually' },
              { icon: Scale, label: 'GDPR & CCPA', sub: 'DPA on request' },
              { icon: Activity, label: '99.9% uptime SLA', sub: 'Credit-backed' },
              { icon: Lock, label: 'Data residency', sub: 'EU & US regions' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="bg-primary flex items-center gap-4 px-6 py-6"
              >
                <Icon className="text-green-light h-6 w-6 shrink-0" />
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-gray text-sm">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="panel group p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                    <Target className="text-green-light h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Dedicated Extraction Pipelines
                  </h3>
                </div>
                <p className="text-gray leading-relaxed">
                  Isolated infrastructure with reserved throughput and a proxy
                  pool that is yours alone. Your crawls are never queued behind
                  another customer&apos;s, and volume spikes don&apos;t degrade
                  your latency.
                </p>
              </div>

              <div className="panel group p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                    <Radio className="text-green-light h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Delivered Into Your Stack
                  </h3>
                </div>
                <p className="text-gray leading-relaxed">
                  Push clean records straight to S3, GCS, Snowflake, BigQuery,
                  or a webhook — as JSON, CSV, or Parquet, on the schedule you
                  set. Schema changes are versioned, never silent.
                </p>
              </div>

              <div className="panel group p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                    <CheckCircle2 className="text-green-light h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Monitored Data Quality
                  </h3>
                </div>
                <p className="text-gray leading-relaxed">
                  Every run is validated against your schema, with coverage and
                  freshness checks on each field. When a source changes layout,
                  our agents repair the extractor and we tell you before you
                  find a gap in your dashboard.
                </p>
              </div>

              <div className="panel group p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                    <Award className="text-green-light h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    A Named Team, Not a Ticket Queue
                  </h3>
                </div>
                <p className="text-gray leading-relaxed">
                  A solutions engineer scopes your sources, designs the schema,
                  and stays in a shared Slack or Teams channel. Security reviews,
                  DPAs, and custom contracts handled by people, not a help
                  center.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className={buttonVariants()}>
                  Talk to a Solutions Engineer
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Request a Sample Dataset
                </Link>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div>
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Join the Companies Making{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Smarter Decisions, Faster
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              While your competitors spend weeks gathering data by hand, you
              could be deciding on evidence. Send us the sources you care about
              and the fields you need — we&apos;ll come back with a sample
              dataset extracted from the real sites, before you commit to
              anything.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request Your Free Sample Dataset →
              </Link>
              <Link
                href="/products"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Browse the Products
              </Link>
            </div>

            <p className="text-gray text-sm">
              No credit card, no commitment — just a solutions engineer and your
              data request.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
