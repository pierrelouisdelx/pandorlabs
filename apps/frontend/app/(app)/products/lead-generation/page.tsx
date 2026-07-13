// Client component: ProductHero takes Lucide icon components as props, which
// cannot cross a server/client boundary. Metadata lives in layout.tsx.
'use client'

import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
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
  Target,
  Users,
  Zap,
  TrendingUp,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  Activity,
  Mail,
  Database,
  BarChart3,
  Globe,
  ScrollText,
  UserMinus,
  FileCheck,
} from 'lucide-react'
import { FAQSection } from '../_components/faq-section'
import { ProductHero } from '../_components/product-hero'

const accentColor = '#46e695'

const faqs = [
  {
    question: 'Where do the 321M+ contacts come from?',
    answer:
      'Records are assembled from publicly available business sources — company websites, public professional profiles, corporate registries, press releases, and job postings — plus licensed data partnerships. We do not buy scraped consumer data, and we do not source personal email addresses or personal phone numbers. Every contact is a business-context record: work email, direct dial, title, and employer.',
  },
  {
    question: 'What is your GDPR lawful basis, and how do opt-outs work?',
    answer:
      'For EU and UK records we operate on legitimate interest for B2B business-contact processing, with a documented legitimate interest assessment and a first-contact notice you can include in your outreach. Data subjects can object or request erasure through our public privacy portal, and we honor those requests across our index within 30 days. Deleted records are added to a permanent suppression list so they are never re-ingested from a downstream source.',
  },
  {
    question: 'How do suppression lists work for my own outreach?',
    answer:
      'You can upload your own suppression list of domains, addresses, and regions, and it is applied server-side to every query and every enrichment call you make — so a suppressed contact simply never comes back in a response. Global suppression (our do-not-contact registry, plus records that objected under GDPR) is always applied on top of yours. Compliance is your obligation as the sender, and the tooling is there to meet it.',
  },
  {
    question: 'What does "95% email accuracy" actually mean?',
    answer:
      'It means that across a sample of delivered work-email records, 95% or more accept mail at send time, measured by SMTP verification at the moment of delivery rather than at the moment of ingestion. Every email carries a verification status (valid, risky, catch-all, or unknown) and a verification timestamp, so you can filter to only what you are willing to send to. We do not bill for records returned as invalid.',
  },
  {
    question: 'How does the data get into my CRM and sales tools?',
    answer:
      'We deliver into it rather than making you pull from us. Native connectors push contacts and enrichment straight into Salesforce, HubSpot, and Pipedrive; webhooks fire when a contact changes jobs or a company hits a growth trigger; and scheduled JSON, CSV, or Parquet exports land in S3, GCS, Snowflake, or BigQuery for your ops and BI stack. A solutions engineer maps the fields to your CRM schema during onboarding, so records arrive in the shape your reps already work in.',
  },
  {
    question: 'How is it priced?',
    answer:
      'Pricing is based on the contacts delivered and enriched, with volume tiers that reduce the unit cost as you scale. Records that fail verification are not billed. Before you commit we run your actual ICP against the index and hand back a free sample of the matching contacts, so you can check accuracy and coverage on the segment you sell into rather than on a demo list.',
  },
]

export default function LeadGenerationPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'B2B Lead Generation Data',
    description:
      '321M+ verified B2B contacts with 95% email accuracy and GDPR compliance, delivered into your CRM or warehouse. Scale your sales pipeline with real-time lead enrichment and AI-powered scoring.',
    url: `${siteUrl}/products/lead-generation`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'Lead Generation Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    {
      name: 'B2B Lead Generation Data',
      url: `${siteUrl}/products/lead-generation`,
    },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/lead-generation`,
    'B2B Lead Generation Data | PandorLabs',
    '321M+ verified B2B contacts with 95% email accuracy and GDPR compliance, delivered into your CRM. Scale your sales pipeline with real-time lead enrichment.',
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
        product="leadGen"
        headline="B2B Lead Data, Delivered to Your CRM"
        subheadline="321M+ verified business contacts, sourced compliantly and enriched in real time — so your reps sell instead of researching."
        valueProps={[
          '321M+ verified contacts across 40+ data attributes',
          '95% email accuracy, verified at delivery — invalid records are not billed',
          'GDPR lawful basis, suppression lists, and a signed DPA before delivery',
          'Pushed straight into Salesforce, HubSpot, or your warehouse',
        ]}
        primaryCTA="Request a Sample List"
        secondaryCTA="Schedule a Demo"
        trustIndicators={[
          { Icon: Shield, text: 'SOC 2 Type II' },
          { Icon: FileCheck, text: 'GDPR & CCPA' },
          { Icon: Zap, text: '95% email accuracy' },
        ]}
        accentColor={accentColor}
        accentGlow="rgba(70, 230, 149, 0.15)"
        accentGradient="from-green-light/20 via-transparent to-transparent"
        visualElement={
          <div className="flex flex-col gap-6">
            {[
              {
                width: '100%',
                label: 'Prospects',
                count: '10,000',
                Icon: Users,
              },
              {
                width: '70%',
                label: 'Qualified',
                count: '7,000',
                Icon: UserCheck,
              },
              {
                width: '40%',
                label: 'Engaged',
                count: '4,000',
                Icon: MessageSquare,
              },
              {
                width: '20%',
                label: 'Converted',
                count: '2,000',
                Icon: CheckCircle2,
              },
            ].map((stage) => (
              <div
                key={stage.label}
                className="border-green-light/30 from-green-light/20 relative flex items-center justify-between rounded-lg border bg-gradient-to-r to-transparent p-4"
                style={{ width: stage.width }}
              >
                <div className="flex items-center gap-3">
                  <stage.Icon className="text-green-light h-6 w-6" />
                  <span className="font-semibold text-white">
                    {stage.label}
                  </span>
                </div>
                <span className="text-green-light font-bold">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        }
      />

      {/* Vision Section */}
      <section className="section section-glow">
        <div className="container">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="eyebrow">why managed lead data</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your Sales Pipeline{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Advantage
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 lg:mx-0">
                <p>
                  Traditional lead generation is time-consuming, expensive, and
                  often delivers outdated contacts. Your sales team wastes hours
                  researching prospects, only to reach dead ends and bounce
                  emails.
                </p>
                <p className="text-lg font-semibold text-white">
                  What if you could access millions of verified B2B contacts
                  instantly—with the accuracy your team needs and the automation
                  they deserve?
                </p>
                <p>
                  We deliver verified contacts straight into your CRM. 321M+
                  business professionals with direct dials, verified emails, and
                  enriched profiles. AI-powered scoring helps you prioritize the
                  best opportunities.
                </p>
                <p>
                  No manual research. No data decay. No wasted outreach. Just
                  qualified leads ready for your sales team to convert.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="321M+" label="Verified Contacts" />
                <StatsCard value="95%" label="Email Accuracy" />
                <StatsCard value="40+" label="Data Attributes" />
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative hidden w-1/2 items-center justify-center lg:flex">
              <div className="relative h-[420px] w-[420px]">
                <div className="bg-green-light/20 absolute inset-0 animate-pulse rounded-full blur-3xl" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <Database
                    className="text-green-light h-56 w-56"
                    strokeWidth={1}
                  />
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
              From Query to Qualified Leads —{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              No integration to build. Real-time verification. Continuous lead
              enrichment. Three steps to supercharge your sales pipeline.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Define Your Ideal Customer"
              description="Specify your target criteria: industry, company size, job titles, location, technologies used, and more. Our intelligent search understands natural language queries."
            />
            <ProcessStep
              number="02"
              title="AI Finds & Verifies Contacts"
              description="Our system searches 321M+ verified contacts, validates email deliverability in real-time, enriches profiles with 40+ data points, and scores leads based on your criteria."
            />
            <ProcessStep
              number="03"
              title="Receive Ready-to-Contact Leads"
              description="Clean, organized contact data with verified emails, direct dials, and company intelligence, delivered straight into your CRM or sales tools on the cadence you choose."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              You define the ICP
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              Seconds, not hours
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Qualified Leads
            </span>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section section-divided section-glow-center">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">comprehensive solutions</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Stage of Your{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Sales Cycle
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From prospecting to deal closure, our lead data provides the
              verified contacts and intelligence your team needs to win.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Users}
              title="Verified Contact Database"
              description="Access 321M+ business contacts with direct dial phones, verified work emails, and firmographic context across all industries. Real-time verification reduces bounces and protects your sender reputation."
            />
            <UseCaseCard
              icon={Mail}
              title="Email Verification & Validation"
              description="Ensure deliverability with real-time email verification. Multi-step validation checks syntax, domain validity, mailbox existence, and risk scoring, and every address ships with a status and a timestamp."
            />
            <UseCaseCard
              icon={TrendingUp}
              title="AI Lead Scoring & Prioritization"
              description="Machine learning models analyze firmographics, technographics, and intent signals to prioritize your best opportunities. Focus your team's effort on the leads most likely to convert."
            />
            <UseCaseCard
              icon={Database}
              title="Real-Time Data Enrichment"
              description="Instantly enrich partial contact data with 40+ attributes including job title, seniority, company size, revenue band, technologies used, funding status, and growth signals."
            />
            <UseCaseCard
              icon={UserCheck}
              title="Company Intelligence & Insights"
              description="Deep firmographic data including funding rounds, tech stack, employee count, and growth trends. Make informed decisions about which accounts deserve your team's time."
            />
            <UseCaseCard
              icon={BarChart3}
              title="CRM Integration & Automation"
              description="Integrate with Salesforce, HubSpot, Pipedrive, and other CRMs. Automatically enrich existing contacts, identify new opportunities, and keep your database from decaying."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Ready to transform your sales pipeline with verified B2B contacts?
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Request a Sample List →
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="section section-divided">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">enterprise-grade technology</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Sales at Scale
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              When your revenue depends on accurate contact data, you need
              enterprise reliability, security, and compliance built in from day
              one.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="panel p-7">
              <div className="bg-green-light/10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
                <Zap className="text-green-light h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Real-Time Processing
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Sub-second response times for contact lookups and enrichment. A
                99.9% uptime SLA means your sales team always has access to the
                data they need.
              </p>
            </div>

            <div className="panel p-7">
              <div className="bg-green-light/10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
                <Shield className="text-green-light h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                GDPR &amp; CCPA Compliant
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Business-contact data sourced under documented legitimate
                interest, with objection and erasure handled through a public
                privacy portal and a permanent suppression list.
              </p>
            </div>

            <div className="panel p-7">
              <div className="bg-green-light/10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
                <Target className="text-green-light h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Intelligent Accuracy
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                95% email accuracy with verification performed at delivery time,
                not ingestion time. Every address carries a status, so you
                decide what you are willing to send to.
              </p>
            </div>
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="321M+" label="Contacts" />
            <StatsCard value="<2s" label="Response Time" />
            <StatsCard value="40+" label="Data Points" />
            <StatsCard value="99.9%" label="Uptime SLA" />
          </div>
        </div>
      </section>

      {/* Data Compliance Section */}
      <section className="section section-divided section-glow-right">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="eyebrow">data compliance</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Contact Data You Can{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Defend in a Review
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              A B2B contact database is only useful if your legal team signs off
              on it. Here is exactly how the data is sourced and governed.
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-6">
              <ScrollText className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">How We Source</h3>
              <p className="text-gray text-sm leading-relaxed">
                Publicly available business sources and licensed partnerships
                only. Work contact details in a business context — never
                personal email or personal phone numbers.
              </p>
            </div>
            <div className="panel p-6">
              <FileCheck className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">
                GDPR Lawful Basis
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Legitimate interest for B2B processing, backed by a documented
                legitimate interest assessment and a first-contact notice you
                can reuse in your outreach.
              </p>
            </div>
            <div className="panel p-6">
              <UserMinus className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">
                Opt-Out &amp; Suppression
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Objection and erasure requests honored within 30 days, then
                permanently suppressed so the record is never re-ingested. Bring
                your own suppression list too.
              </p>
            </div>
            <div className="panel p-6">
              <Globe className="text-green-light mb-4 h-6 w-6" />
              <h3 className="mb-2 font-semibold text-white">
                EU/US Data Residency
              </h3>
              <p className="text-gray text-sm leading-relaxed">
                Choose where your data is processed and stored. SOC 2 Type II
                report and DPA available under NDA for your security review.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray mb-4 text-sm">
              You remain the data controller for your outreach. We give you the
              provenance, the lawful basis documentation, and the suppression
              tooling to stay on the right side of it.
            </p>
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline' })}
            >
              Request Compliance Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} accentColor={accentColor} />

      {/* Final CTA Section */}
      <section className="section section-divided section-glow">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Start Generating Qualified Leads{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in the Next 15 Minutes
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              Stop wasting time on unverified contacts and dead-end leads. Tell
              us the segment you sell into and we will come back with a sample
              of verified, compliantly sourced contacts — before you commit to
              anything.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request a Sample List →
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Schedule a Demo
              </Link>
            </div>

            {/* Trust Elements */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <TrustBadge icon={Shield} text="SOC 2 Type II" />
                <TrustBadge icon={CheckCircle2} text="GDPR & CCPA" />
                <TrustBadge icon={Activity} text="99.9% Uptime SLA" />
              </div>
              <div className="text-gray space-y-1 text-sm">
                <p>Free sample list built from your own ICP</p>
                <p>321M+ verified business contacts</p>
                <p>Verification at delivery, not at ingestion</p>
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
            name: 'B2B Lead Generation Data',
            description:
              'Access 321M+ verified B2B contacts with 95% email accuracy. Enrich CRM data, build sales pipelines, and accelerate outreach with real-time verification and compliant sourcing.',
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
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/lead-generation`,
            },
            category: 'Sales Technology',
            featureList: [
              '321M+ verified contacts',
              '95% email accuracy',
              'Real-time email verification',
              'GDPR-compliant sourcing and suppression',
              'CRM enrichment',
              'Contact intelligence',
              'B2B lead generation',
              'Bulk and webhook delivery',
            ],
          }),
        }}
      />
    </>
  )
}
