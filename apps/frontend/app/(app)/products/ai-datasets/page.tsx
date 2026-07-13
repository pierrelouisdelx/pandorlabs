'use client'

import {
  Brain,
  Code2,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  Database,
  Image as ImageIcon,
  FileText,
  Mic,
  Layers,
  Users,
  CheckCircle2,
  Activity,
  Lock,
  Bot,
  Globe,
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

import { FAQSection } from '../_components/faq-section'
import { ProductHero } from '../_components/product-hero'
import StatsCard from '@/components/custom/stats-card'
import ProcessStep from '@/components/custom/process-step'
import UseCaseCard from '@/components/custom/use-case-card'
import TechFeatureCard from '@/components/custom/tech-feature-card'
import TrustBadge from '@/components/custom/trust-badge'
import { buttonVariants } from '@/components/ui/button'

const accentColor = '#46e695'
const accentGlow = 'rgba(70, 230, 149, 0.15)'
const accentGradient = 'linear-gradient(135deg, #46e695 0%, #46e695 100%)'

const modalitySummary = [
  { type: 'Images', samples: '820K samples' },
  { type: 'Text', samples: '640K samples' },
  { type: 'Audio', samples: '310K samples' },
]

const complianceItems = [
  {
    Icon: Shield,
    title: 'SOC 2 Type II',
    description:
      'Audited controls covering security, availability, and confidentiality. Report available under NDA.',
  },
  {
    Icon: Lock,
    title: 'GDPR & CCPA',
    description:
      'Lawful basis documented per dataset, with data subject request handling and deletion propagation.',
  },
  {
    Icon: Activity,
    title: '99.9% Uptime SLA',
    description:
      'Contractual availability target for scheduled dataset delivery, with status page and incident credits.',
  },
  {
    Icon: Globe,
    title: 'EU / US Data Residency',
    description:
      'Choose where datasets are stored and processed. Self-hosted delivery available for regulated workloads.',
  },
]

const faqs = [
  {
    question: 'What sources do the datasets come from, and how are they built?',
    answer:
      'Datasets are assembled from three streams: licensed corpora acquired directly from rights holders, public and open-licensed data collected from sources that permit it, and data we generate or annotate ourselves through our labeling teams. Every dataset carries a provenance record naming the source, the license, and the collection date. If a dataset mixes streams, the record breaks the mix down per split so you can exclude anything your legal team is not comfortable with.',
  },
  {
    question: 'How fresh is the data, and how often are datasets refreshed?',
    answer:
      'Static benchmark datasets are versioned and immutable once released, so your training runs stay reproducible. Living datasets — the ones tracking a changing source — are refreshed on a schedule that ranges from daily to quarterly depending on how fast the underlying source moves. Each refresh ships as a new version with a changelog and a diff, and older versions stay pinned and downloadable so you can reproduce any past run.',
  },
  {
    question: 'Is the data collection legal, and can I use it to train models?',
    answer:
      'We only collect from sources whose terms permit it, and we do not collect personal data unless there is a documented lawful basis for it. Licensing for model training is explicit rather than assumed: each dataset states whether commercial training, fine-tuning, and redistribution of model weights are permitted, and those rights are passed through in your contract. Where a source requires consent — for example, voice or likeness data — we hold the consent records and can produce them for your audit.',
  },
  {
    question: 'What happens to my training rights if a dataset is withdrawn?',
    answer:
      'If a rights holder withdraws a license or a data subject exercises deletion rights, we notify you, remove the affected records from future versions, and tell you exactly which records were affected. Models you already trained under a valid license at the time of training are not retroactively invalidated by that removal, and the license terms in your contract spell this out. We keep the audit trail so you can evidence what you trained on and when.',
  },
  {
    question:
      'What formats do you deliver in, and how does it fit my pipeline?',
    answer:
      'Datasets are delivered as JSONL, Parquet, WebDataset shards, or CSV, plus images and audio in their native encodings with sidecar annotation files. We land them in an S3 or GCS bucket you own, or in Snowflake or BigQuery, so they sit one step away from your data loaders rather than behind an integration. Annotation schemas follow COCO, YOLO, and CoNLL conventions where those standards apply, so most teams do not have to write a converter. A solutions engineer agrees the format, split layout, and destination with you before the first delivery.',
  },
  {
    question: 'How does pricing work?',
    answer:
      'Pricing is per dataset licence rather than metered by usage, so training runs and re-downloads do not meter against you. Before you commit we deliver free sample splits with the full schema and provenance blocks, so you can evaluate quality against your own benchmarks. Custom annotation and dataset creation work is quoted separately based on volume, modality, and the level of domain expertise the labeling requires.',
  },
]

export default function AIDataPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'

  const serviceSchema = generateServiceSchema({
    name: 'AI Training Datasets',
    description:
      '100,000+ production-ready datasets with 99% annotation accuracy and ethical sourcing, delivered to your bucket or warehouse. Text, vision, audio datasets with synthetic data generation for edge cases.',
    url: `${siteUrl}/products/ai-datasets`,
    provider: {
      name: 'Pandor Labs',
      url: siteUrl,
    },
    serviceType: 'AI Training Data Service',
    areaServed: 'Worldwide',
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    { name: 'AI Training Datasets', url: `${siteUrl}/products/ai-datasets` },
  ])

  const webPageSchema = generateWebPageSchema(
    `${siteUrl}/products/ai-datasets`,
    'AI Training Datasets',
    '100,000+ production-ready datasets with 99% annotation accuracy and ethical sourcing, delivered to your stack',
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
      {/* Hero */}
      <div className="bg-primary relative">
        <ProductHero
          product="aiDatasets"
          headline="AI Training Datasets, Delivered"
          subheadline="100,000+ production-ready datasets with 99% annotation accuracy and ethical sourcing, landed straight in your bucket or warehouse"
          valueProps={[
            '100,000+ curated datasets across text, vision, audio',
            '99% annotation accuracy with human verification',
            'Ethical sourcing with full data provenance',
            'Synthetic data generation for edge cases',
          ]}
          primaryCTA="Request Sample Splits"
          secondaryCTA="Schedule a Demo"
          trustIndicators={[
            { Icon: Zap, text: '99% Accuracy' },
            { Icon: Shield, text: 'Ethical Sourcing' },
            { Icon: TrendingUp, text: 'Production Ready' },
          ]}
          accentColor={accentColor}
          accentGlow={accentGlow}
          accentGradient={accentGradient}
          visualElement={
            <div className="relative aspect-square w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 400 400">
                  <defs>
                    <radialGradient id="nodeGradient">
                      <stop offset="0%" stopColor="rgba(70,230,149,0.6)" />
                      <stop offset="100%" stopColor="rgba(70,230,149,0)" />
                    </radialGradient>
                  </defs>
                  {[
                    { x1: 100, y1: 100, x2: 200, y2: 200 },
                    { x1: 100, y1: 200, x2: 200, y2: 200 },
                    { x1: 100, y1: 300, x2: 200, y2: 200 },
                    { x1: 200, y1: 200, x2: 300, y2: 150 },
                    { x1: 200, y1: 200, x2: 300, y2: 250 },
                  ].map((line, i) => (
                    <line
                      key={i}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="rgba(70,230,149,0.3)"
                      strokeWidth="2"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                  {[
                    { x: 100, y: 100 },
                    { x: 100, y: 200 },
                    { x: 100, y: 300 },
                    { x: 200, y: 200 },
                    { x: 300, y: 150 },
                    { x: 300, y: 250 },
                  ].map((node, i) => (
                    <g key={i}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="8"
                        fill="url(#nodeGradient)"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="4"
                        fill="rgba(70,230,149,1)"
                      />
                    </g>
                  ))}
                </svg>
              </div>
              <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
                {modalitySummary.map((item, i) => (
                  <div
                    key={item.type}
                    className="border-green-light/30 bg-green-light/20 rounded-lg border px-4 py-2 backdrop-blur-sm"
                    style={{
                      animation: `slideIn 1s ease-out ${i * 0.2}s both`,
                    }}
                  >
                    <div className="text-green-light text-sm font-medium">
                      {item.type}
                    </div>
                    <div className="text-xs text-white/60">{item.samples}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* Partner logos */}
        <div className="absolute right-0 bottom-10 left-0 z-20">
          <div className="container">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              <Image
                src="/images/companies/nvidia.svg"
                alt="NVIDIA"
                width={120}
                height={48}
                className="opacity-70 transition-opacity hover:opacity-100"
              />
              <Image
                src="/images/companies/siemens-healthineers.svg"
                alt="SIEMENS Healthineers"
                width={120}
                height={48}
                className="opacity-70 transition-opacity hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why AI Datasets — first section after the hero, no divider */}
      <section className="section section-glow">
        <div className="container">
          <div className="flex flex-col gap-20 lg:flex-row">
            <div className="w-full lg:w-1/2">
              <div className="mb-10 text-center lg:text-left">
                <p className="eyebrow">why ai datasets</p>
                <h2 className="mb-6 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                  Your AI Training Data{' '}
                  <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                    Advantage
                  </span>
                </h2>
              </div>

              <div className="text-gray mx-auto mb-12 max-w-4xl space-y-4 text-center lg:text-left">
                <p>
                  AI models are only as good as their training data. Manual
                  dataset curation takes months, annotation quality varies
                  wildly, and data licensing is a legal minefield.
                </p>
                <p className="text-lg font-semibold text-white">
                  What if you could access production-ready datasets with
                  verified quality—instantly?
                </p>
                <p>
                  PandorLabs AI Datasets delivers 100,000+ curated datasets with
                  99% annotation accuracy. From computer vision to NLP to audio,
                  get the training data you need to accelerate model development
                  by 10x.
                </p>
                <p>
                  No manual labeling. No quality concerns. No legal risks. Just
                  production-ready datasets that power better AI models, faster
                  than your competitors.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <StatsCard value="100K+" label="Curated Datasets" />
                <StatsCard value="99%" label="Annotation Accuracy" />
                <StatsCard value="10x" label="Faster Development" />
              </div>
            </div>

            {/* Visualization */}
            <div className="hidden w-full items-center justify-center lg:flex lg:w-1/2">
              <div className="relative h-[400px] w-[400px]">
                <div className="bg-green-light/10 absolute inset-0 rounded-full blur-3xl"></div>
                <div className="relative flex h-full items-center justify-center">
                  <div className="grid grid-cols-3 gap-4">
                    {[ImageIcon, FileText, Mic, Database, Brain, Code2].map(
                      (Icon, i) => (
                        <div
                          key={i}
                          className="border-green-light/30 bg-green-light/10 hover:border-green-light/60 hover:bg-green-light/20 flex h-20 w-20 items-center justify-center rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-110"
                          style={{
                            animation: `float 3s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        >
                          <Icon className="text-green-light h-8 w-8" />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
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
              From Search to Training —{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                in Minutes
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              No complex setup. No manual labeling. Just three simple steps to
              get production-ready training data.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <ProcessStep
              number="01"
              title="Search & Discover"
              description="Browse 100,000+ datasets by domain (computer vision, NLP, audio), modality, or specific use case. Advanced filtering helps you find exactly what you need."
            />
            <ProcessStep
              number="02"
              title="Quality Verification"
              description="Every dataset undergoes multi-stage quality control with human verification and AI validation. Review sample data, annotation quality, and metadata before commitment."
            />
            <ProcessStep
              number="03"
              title="Delivered & Training-Ready"
              description="We land the dataset in your bucket or warehouse in the format your loaders already read — JSONL, Parquet, WebDataset, or CSV. Point your pipeline at it and start training."
            />
          </div>

          {/* Timeline */}
          <div className="text-gray mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Start
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="to-green-light bg-green-light/10 rounded-full bg-linear-to-l from-green-100 bg-clip-text px-5 py-2.5 font-semibold text-transparent">
              Minutes to model training
            </span>
            <div className="bg-green-light/30 shadow-green-light/20 h-1 w-20 rounded-full shadow-lg"></div>
            <span className="rounded-full bg-white/5 px-4 py-2 font-medium transition-all duration-300 hover:bg-white/10">
              Data Ready
            </span>
          </div>
        </div>
      </section>

      {/* Dataset Categories */}
      <section className="section section-divided section-glow-center">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">dataset library</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Every AI Modality.{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                One Platform
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              From computer vision to natural language processing, access
              production-ready datasets across all AI domains.
            </p>
          </div>

          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={ImageIcon}
              title="Computer Vision Datasets"
              description="Object detection, semantic segmentation, facial recognition, pose estimation, and more. High-resolution images with pixel-perfect annotations for production vision models."
            />
            <UseCaseCard
              icon={FileText}
              title="Natural Language Processing"
              description="Text classification, sentiment analysis, named entity recognition, question answering, and translation. Multi-language datasets with linguistic annotations for NLP excellence."
            />
            <UseCaseCard
              icon={Mic}
              title="Speech & Audio"
              description="Speech recognition, speaker identification, audio classification, and voice synthesis. Professional-grade audio datasets with transcriptions and acoustic annotations."
            />
            <UseCaseCard
              icon={Layers}
              title="Multimodal AI"
              description="Cross-modal learning, image captioning, visual question answering, and audio-visual fusion. Aligned datasets for building sophisticated multimodal models."
            />
            <UseCaseCard
              icon={Sparkles}
              title="Synthetic Data Generation"
              description="AI-powered synthetic data creation for edge cases, rare events, and privacy-preserving scenarios. Balance datasets and augment training with high-fidelity synthetic samples."
            />
            <UseCaseCard
              icon={Users}
              title="Custom Labeling Services"
              description="Professional annotation teams with industry-specific expertise. Custom dataset creation with quality guarantees and domain expert verification for your unique use cases."
            />
          </div>

          <div className="text-center">
            <p className="text-gray mb-4">
              Need a specific dataset type? Our team can source or create custom
              datasets for your requirements.
            </p>
            <Link href="/contact" className={buttonVariants()}>
              Request Custom Dataset →
            </Link>
          </div>
        </div>
      </section>

      {/* Quality & Technology */}
      <section className="section section-divided section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">quality & technology</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Built for{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Production AI Models
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              When your AI models depend on training data quality, you
              can&apos;t afford errors, bias, or legal risks. PandorLabs
              datasets are built to production standards.
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <TechFeatureCard
              icon={Shield}
              title="Multi-Stage Quality Control"
              description="Human verification combined with AI validation ensures 99% annotation accuracy. Every dataset undergoes rigorous quality checks before release."
            />
            <TechFeatureCard
              icon={Lock}
              title="Ethical Data Sourcing"
              description="Full provenance tracking and consent documentation for every dataset. GDPR and CCPA compliant with transparent data licensing and usage rights."
            />
            <TechFeatureCard
              icon={Bot}
              title="Version Control & Updates"
              description="Incremental dataset updates with backward compatibility. Track data versions, maintain reproducibility, and evolve datasets as your models improve."
            />
          </div>

          {/* Tech Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard value="99%" label="Accuracy" />
            <StatsCard value="100K+" label="Datasets" />
            <StatsCard value="10M+" label="Samples" />
            <StatsCard value="50+" label="Domains" />
          </div>
        </div>
      </section>

      {/* Compliance & Delivery */}
      <section className="section section-divided section-glow-right">
        <div className="relative z-10 container">
          <div className="mb-12 text-center">
            <p className="eyebrow">compliance & delivery</p>
            <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
              Training Data Your Legal Team{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Can Sign Off On
              </span>
            </h2>
            <p className="text-gray mx-auto max-w-2xl">
              Provenance, licensing, and residency are contract terms here — not
              footnotes. Every dataset ships with the paperwork that proves
              where it came from and what you are allowed to do with it.
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
                  <Database className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Custom Dataset Creation
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                Need something unique? Our annotation teams create custom
                datasets tailored to your specific requirements, with quality
                guarantees and domain expert review.
              </p>
            </div>

            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Activity className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Dedicated Support & SLAs
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                Enterprise support with guaranteed response times and direct
                access to the data science team that builds and maintains your
                datasets.
              </p>
            </div>

            <div className="panel p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-green-light/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <CheckCircle2 className="text-green-light h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  On-Premise Deployment
                </h3>
              </div>
              <p className="text-gray leading-relaxed">
                HIPAA-ready, self-hosted delivery for organizations with strict
                data residency requirements. Datasets never leave your
                environment.
              </p>
            </div>
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
              Start Building Better AI Models{' '}
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                Today
              </span>
            </h2>
            <p className="text-gray mb-8 text-lg">
              While your competitors spend months curating datasets, you could
              be training production models with verified, high-quality data.
              Start with free sample splits from the datasets you actually need.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className={buttonVariants({ size: 'lg' })}>
                Request Sample Splits →
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
                <p>✓ Free sample splits before you license anything</p>
                <p>✓ Delivery configured with a solutions engineer</p>
                <p>✓ Per-dataset licensing, no long-term contracts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'AI Training Datasets',
            description:
              '100,000+ high-quality AI training datasets with 99% accuracy, delivered to your bucket or warehouse. Computer vision, NLP, synthetic data, and annotation services for machine learning model development and training.',
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
              url: `${siteUrl}/products/ai-datasets`,
            },
            category: 'Artificial Intelligence',
            featureList: [
              '100,000+ datasets available',
              '99% data accuracy',
              'Computer vision datasets',
              'NLP training data',
              'Synthetic data generation',
              'Annotation services',
              'Custom dataset creation',
              'ML model training support',
            ],
          }),
        }}
      />
    </div>
  )
}
