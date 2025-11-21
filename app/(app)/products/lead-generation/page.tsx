import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'
import { Metadata } from 'next'
import Image from 'next/image'
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
  Award,
  Mail,
  Database,
  BarChart3,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lead Generation Data API | PandorLabs',
  description:
    'Access 321M+ verified B2B contacts with 95% email accuracy and GDPR compliance. Scale your sales pipeline with real-time lead enrichment and AI-powered scoring.',
}

export default function LeadGenerationPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'Lead Generation Data API',
    description:
      'Access 321M+ verified B2B contacts with 95% email accuracy and GDPR compliance. Scale your sales pipeline with real-time lead enrichment and AI-powered scoring.',
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
    { name: 'Lead Generation API', url: `${siteUrl}/products/lead-generation` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/lead-generation`,
    'Lead Generation Data API | PandorLabs',
    'Access 321M+ verified B2B contacts with 95% email accuracy and GDPR compliance. Scale your sales pipeline with real-time lead enrichment.'
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
      {/* Vision Section */}
      <div className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="container">
          <div className="flex gap-20">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                  WHY LEAD GENERATION API
                </p>
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
                  Our Lead Generation API delivers verified contacts on demand.
                  321M+ business professionals with direct dials, verified
                  emails, and enriched profiles. AI-powered scoring helps you
                  prioritize the best opportunities.
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
            <div className="relative hidden w-1/2 lg:block">
              <div className="flex flex-col gap-8">
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
                ].map((stage, i) => (
                  <div
                    key={i}
                    className="relative flex items-center justify-between rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-transparent p-4 transition-all duration-500 hover:border-emerald-500/50 hover:from-emerald-500/30"
                    style={{
                      width: stage.width,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <stage.Icon className="h-6 w-6 text-emerald-400" />
                      <span className="font-semibold text-white">
                        {stage.label}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {stage.count}
                    </span>
                  </div>
                ))}
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
              From Query to Qualified Leads —{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Simple API integration. Real-time verification. Instant lead
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
              description="Get clean, organized contact data with verified emails, direct dials, LinkedIn profiles, and company intelligence. Integrate directly with your CRM or sales tools."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              API Request
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 animate-pulse rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              Seconds, not hours
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Qualified Leads
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
              COMPREHENSIVE SOLUTIONS
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Power Every Stage of Your{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Sales Cycle
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From prospecting to deal closure, our Lead Generation API provides
              the verified contacts and intelligence your team needs to win.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Users}
              title="Verified Contact Database"
              description="Access 321M+ business contacts with direct dial phones, verified emails, and social profiles across all industries. Real-time email verification with 95% accuracy guarantee reduces bounces and protects sender reputation."
            />
            <UseCaseCard
              icon={Mail}
              title="Email Verification & Validation"
              description="Ensure deliverability with real-time email verification. Our multi-step validation checks syntax, domain validity, mailbox existence, and risk scoring to guarantee 95%+ accuracy on every contact."
            />
            <UseCaseCard
              icon={TrendingUp}
              title="AI Lead Scoring & Prioritization"
              description="Machine learning models analyze firmographics, technographics, and intent signals to prioritize your best opportunities. Focus your team's efforts on leads most likely to convert."
            />
            <UseCaseCard
              icon={Database}
              title="Real-Time Data Enrichment"
              description="Instantly enrich partial contact data with 40+ attributes including job title, seniority, company size, revenue, technologies used, funding status, and growth signals."
            />
            <UseCaseCard
              icon={UserCheck}
              title="Company Intelligence & Insights"
              description="Deep firmographic data including funding rounds, technologies used, employee count, growth trends, and competitive intelligence. Make informed decisions about which accounts to target."
            />
            <UseCaseCard
              icon={BarChart3}
              title="CRM Integration & Automation"
              description="Seamlessly integrate with Salesforce, HubSpot, Pipedrive, and other CRMs. Automatically enrich existing contacts, identify new opportunities, and keep your database up-to-date."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Ready to transform your sales pipeline with verified B2B contacts?
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Start Your Free Trial →
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
              ENTERPRISE-GRADE TECHNOLOGY
            </p>
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
            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                <Zap className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                Real-Time Processing
              </h3>
              <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                Sub-second response times for contact lookups and enrichment.
                99.9% uptime means your sales team always has access to the data
                they need.
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                <Shield className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                GDPR & CCPA Compliant
              </h3>
              <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                All data sourced through compliant methods with consent tracking
                and right-to-erasure support. Bank-level security that passes
                your compliance team&apos;s review.
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                <Target className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                Intelligent Accuracy
              </h3>
              <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                95% email accuracy with continuous verification. AI-powered
                scoring and enrichment ensures you&apos;re targeting the right
                prospects with the right data.
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
      </div>

      {/* Testimonials Section */}
      <div className="from-background to-primary/10 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="text-gray mb-3 text-sm tracking-wider uppercase">
              CUSTOMER SUCCESS STORIES
            </p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Trusted by Sales Teams That{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Need to Hit Quota
              </span>
            </h2>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">📈</div>
                <h4 className="mb-1 font-semibold text-white">
                  Enterprise Sales Team
                </h4>
                <p className="text-gray/80 text-sm">SaaS Company, Series C</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;Reduced cost-per-lead by 60% and increased pipeline
                velocity by 40%. Our SDR team is now 3x more productive with
                verified contacts.&quot;
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">🎯</div>
                <h4 className="mb-1 font-semibold text-white">
                  Marketing Agency
                </h4>
                <p className="text-gray/80 text-sm">B2B Lead Generation Firm</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;We replaced 3 data vendors with PandorLabs. Better
                accuracy, lower costs, and our clients see 25% higher email open
                rates.&quot;
              </p>
            </div>

            <div className="group hover:border-green-light/50 hover:shadow-green-light/20 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="mb-4">
                <div className="text-green-light mb-2 text-2xl">🚀</div>
                <h4 className="mb-1 font-semibold text-white">
                  Growth Startup
                </h4>
                <p className="text-gray/80 text-sm">FinTech, Seed Stage</p>
              </div>
              <p className="text-gray leading-relaxed">
                &quot;Built a 50K contact database in weeks instead of months.
                The AI scoring helps us focus on leads that actually
                convert.&quot;
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
            <Link href="/demo" className={buttonVariants()}>
              See How It Works
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: 'outline' })}
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="from-primary/10 to-primary relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
        <div className="relative z-10 container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Start Generating Qualified Leads{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in the Next 15 Minutes
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              Stop wasting time on unverified contacts and dead-end leads. Get
              instant access to 321M+ verified B2B contacts with AI-powered
              enrichment. Start free. No credit card required.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/request" className={buttonVariants({ size: 'lg' })}>
                Start Free Trial →
              </Link>
              <Link
                href="/demo"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                See a 2-Minute Demo
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
                <p>✓ Free trial—no credit card required</p>
                <p>✓ 321M+ verified contacts</p>
                <p>✓ 95% email accuracy guarantee</p>
              </div>
            </div>

            <p className="text-gray text-sm">
              Join 500+ sales teams using PandorLabs to accelerate their
              pipeline
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
            name: 'Lead Generation Data API',
            description:
              'Access 321M+ verified B2B contacts with 95% email accuracy. Enrich CRM data, build sales pipelines, and accelerate outreach with real-time verification and comprehensive contact intelligence.',
            brand: {
              '@type': 'Brand',
              name: 'PandorLabs',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/products/lead-generation`,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '201',
            },
            category: 'Sales Technology',
            featureList: [
              '321M+ verified contacts',
              '95% email accuracy guarantee',
              'Real-time email verification',
              'CRM enrichment',
              'Sales pipeline building',
              'Contact intelligence',
              'B2B lead generation',
              'Automated outreach support',
            ],
          }),
        }}
      />
    </>
  )
}
