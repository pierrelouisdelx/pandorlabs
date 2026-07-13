import {
  Award,
  BookOpen,
  Microscope,
  ShieldCheck,
  Scale,
  FileCheck,
  Bot,
  Radar,
  GitBranch,
  Building2,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import helper from '@/lib/helper'
import StatsCard from '@/components/custom/stats-card'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us | PandorLabs',
  description:
    'PandorLabs builds compliant, AI-powered web data infrastructure. Founded by former AI researchers from NVIDIA, Siemens and Palantir, with 10+ years of web scraping and reverse engineering experience.',
  keywords: [
    'about pandorlabs',
    'web scraping company',
    'web data infrastructure',
    'compliant web scraping',
    'ethical data collection',
    'GDPR web scraping',
    'AI researchers',
    'data extraction platform',
    'enterprise web data',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'About Us | PandorLabs',
    description:
      'Compliant, AI-powered web data infrastructure. Built by former AI researchers from NVIDIA, Siemens and Palantir with 10+ years of web scraping experience.',
    url: process.env.NEXT_PUBLIC_APP_URL + '/about',
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | PandorLabs',
    description:
      'Compliant, AI-powered web data infrastructure. Built by former AI researchers from NVIDIA, Siemens and Palantir.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
  },
}

const principles = [
  {
    icon: Scale,
    title: 'Publicly available data only',
    description:
      'We collect data that is publicly accessible without authentication. We do not bypass logins, and we do not touch data a site has placed behind a paywall or an account.',
  },
  {
    icon: ShieldCheck,
    title: 'Lawful basis, documented',
    description:
      'Every dataset we deliver comes with a record of where it came from and when. For personal data we operate under GDPR and CCPA, honour deletion requests, and sign a DPA before the first record moves.',
  },
  {
    icon: FileCheck,
    title: 'Polite by default',
    description:
      'We rate-limit, respect crawl directives, and cache aggressively so that a source site is never destabilised by our traffic. Extracting data should cost the publisher nothing.',
  },
  {
    icon: Building2,
    title: 'Reviewed before we start',
    description:
      'Unusual sources go through a legal and ethical review before we write a line of code. If a project fails that review, we say no — and tell you why.',
  },
]

const howWeWork = [
  {
    icon: Radar,
    title: 'We find the source',
    description:
      'Most teams already know what they want to know; they just cannot say which pages hold it. Our agents map the source landscape first, so extraction starts from the right place.',
  },
  {
    icon: Bot,
    title: 'Agents write the extractor',
    description:
      'Instead of a human writing brittle selectors, an agent reads the page, infers its structure, and produces an extractor validated against your schema. What took a sprint takes an afternoon.',
  },
  {
    icon: GitBranch,
    title: 'The pipeline repairs itself',
    description:
      'Sites change. Our monitors catch the drift, the agent rewrites the extractor, and the data keeps flowing — usually before anyone notices a field went missing.',
  },
]

export default function AboutUs() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary relative -mt-24 flex min-h-screen items-center bg-[url(/images/hero-section.png)] bg-cover bg-center bg-no-repeat pt-24">
        <span className="from-primary to-primary/20 absolute inset-0 z-5 bg-linear-to-t"></span>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Section badge */}
            <div className="hover:border-green-light/30 mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
              <Microscope className="text-green-light h-4 w-4" />
              <span className="text-sm font-medium tracking-[0.2em] text-white/60 uppercase">
                about pandorlabs
              </span>
            </div>

            <h1 className="mb-6 text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-7xl/tight">
              The Web Is the Largest
              <br />
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent drop-shadow-lg">
                Database Nobody Can Query
              </span>
            </h1>

            <p className="text-gray mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
              We are building the infrastructure that changes that — AI agents
              that find, extract, and maintain web data at scale, without the
              engineering team you would otherwise have to hire.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants()}>
                Talk to the team
              </Link>
              <Link
                href="/products/ai-datasets"
                className={buttonVariants({ variant: 'outline' })}
              >
                See what we build
              </Link>
            </div>
          </div>
        </div>

        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="from-green-light/10 to-green-light/5 absolute top-1/2 left-1/4 h-96 w-96 animate-pulse rounded-full bg-linear-to-br blur-[120px]" />
          <div
            className="from-green-light/10 to-green-light/5 absolute top-1/3 right-1/4 h-96 w-96 animate-pulse rounded-full bg-linear-to-br blur-[120px]"
            style={{ animationDelay: '1s' }}
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="section section-glow">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="eyebrow">our mission</p>
              <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                Make Any Public Web Source{' '}
                <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                  Behave Like an API
                </span>
              </h2>
            </div>

            <div className="text-gray space-y-6 text-lg leading-relaxed">
              <p>
                Web data has always been available in theory and unreachable in
                practice. The pages exist, the numbers are right there on the
                screen — but turning them into a clean, current, trustworthy
                table takes a team of engineers, a proxy budget, and a tolerance
                for pipelines that break every time a site ships a redesign.
              </p>
              <p>
                Most companies never build that team. They settle for a stale
                report, a sample of the market, or a gut call. The information
                asymmetry that follows is expensive, and it compounds.
              </p>
              <p className="text-xl font-medium text-white">
                We think extracting a dataset from the open web should take
                minutes and a sentence — not a quarter and a headcount.
              </p>
              <p>
                So we built agents that do the work an engineer would: read the
                page, understand its structure, write the extractor, validate
                the output against a schema, and repair themselves when the
                source moves. You describe the data you need. We deliver it,
                keep it fresh, and tell you the moment something looks wrong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* By the Numbers */}
      <section className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="eyebrow">by the numbers</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built to Run{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Unattended
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              The numbers that matter to the people who put us in production.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard value="99.9%" label="Uptime SLA" />
            <StatsCard value="99.7%" label="Extraction success rate" />
            <StatsCard value="<2s" label="Median response" />
            <StatsCard value="10K+" label="Datasets per month" />
          </div>
        </div>
      </section>

      {/* Compliance Section — the category's real differentiator */}
      <section className="section section-divided section-glow section-glow-right">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="eyebrow">how we collect</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Compliance Is Not a{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Footnote
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Web data is only useful if your legal team lets you use it. We
              designed the platform around that constraint instead of
              apologising for it later.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {principles.map(({ icon: Icon, title, description }) => (
              <div key={title} className="panel group p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-green-light/10 group-hover:bg-green-light/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300">
                    <Icon className="text-green-light h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <p className="text-gray leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            {[
              { label: 'SOC 2 Type II', sub: 'Audited annually' },
              { label: 'GDPR & CCPA', sub: 'DPA available on request' },
              { label: 'EU & US regions', sub: 'Data residency on request' },
            ].map(({ label, sub }) => (
              <div key={label} className="bg-primary px-6 py-6 text-center">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-gray text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section section-divided section-glow">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="eyebrow">how we work</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Agents Do the Work{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Engineers Used to Do
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {howWeWork.map(({ icon: Icon, title, description }) => (
              <div key={title} className="panel group p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                  <Icon className="text-green-light h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-gray text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Credentials Section */}
      <section className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="eyebrow">who we are</p>
              <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                Built on{' '}
                <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                  Research Excellence
                </span>
              </h2>
              <p className="text-gray mx-auto max-w-2xl">
                We are AI researchers and reverse engineering specialists who
                spent a decade on systems where milliseconds decide the outcome.
                We build web data infrastructure the way we built inference
                engines: for the worst case, not the demo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="panel group p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Award
                    className="text-green-light h-7 w-7"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  World-record AI inference
                </h3>
                <p className="text-gray text-sm leading-relaxed">
                  Breakthrough performance in inference optimisation — the same
                  engineering that keeps our extraction agents cheap enough to
                  run on millions of pages.
                </p>
              </div>

              <div className="panel group p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <BookOpen
                    className="text-green-light h-7 w-7"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  NVIDIA, Siemens, Palantir
                </h3>
                <p className="text-gray text-sm leading-relaxed">
                  Former researchers and engineers from teams where
                  production-grade reliability was the baseline, not the goal.
                </p>
              </div>

              <div className="panel group p-7">
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Microscope
                    className="text-green-light h-7 w-7"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  10+ years of web extraction
                </h3>
                <p className="text-gray text-sm leading-relaxed">
                  From dynamic JavaScript applications to hostile anti-bot
                  stacks — we have met every layer of the modern web and know
                  what actually breaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section section-divided section-glow section-glow-center">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Tell Us What You Need to Know.{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                We&apos;ll Go Get It.
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              Send us your sources and your schema. We will come back with a
              sample dataset from your real target sites — before you commit to
              anything.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request a sample dataset
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Talk to a solutions engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
                "@context": "https://schema.org",
                "@type": "AboutPage",
                "name": "About Us | PandorLabs",
                "url": "${siteUrl}/about",
                "description": "PandorLabs builds compliant, AI-powered web data infrastructure. Founded by former AI researchers from NVIDIA, Siemens and Palantir with 10+ years of web scraping experience.",
                "inLanguage": "en",
                "image": "${siteUrl}/images/logo.svg",
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "${siteUrl}"
                    },{
                        "@type": "ListItem",
                        "position": 2,
                        "name": "About Us",
                        "item": "${siteUrl}/about"
                    }]
                },
                "mainEntity": {
                    "@type": "Organization",
                    "name": "PandorLabs",
                    "url": "${siteUrl}",
                    "logo": "${siteUrl}/images/logo.svg",
                    "description": "Compliant, AI-powered web data infrastructure. Agents that find, extract and maintain public web data at scale, delivered as clean datasets and APIs.",
                    "foundingDate": "2023",
                    "knowsAbout": ["Web Scraping", "Web Data Extraction", "Artificial Intelligence", "Machine Learning", "AI Inference Optimization", "Reverse Engineering", "GDPR Compliant Data Collection"],
                    "areaServed": "Worldwide",
                    "award": ["World-Record AI Inference Performance"],
                    "employee": [{
                        "@type": "OrganizationRole",
                        "roleName": "AI Research Team",
                        "description": "Former researchers from NVIDIA, Siemens, and Palantir specializing in AI inference, web scraping, and reverse engineering"
                    }]
                }
            }`,
        }}
      />
    </>
  )
}
