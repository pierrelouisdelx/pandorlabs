import { Award, BookOpen, Microscope } from 'lucide-react'
import { Metadata } from 'next'
import helper from '@/lib/helper'

export const metadata: Metadata = {
  title: 'About Us | PandorLabs',
  description:
    'Former AI researchers from NVIDIA, Siemens & Palantir. World-record AI inference. Expert AI agents with 10+ years web scraping mastery.',
  keywords: [
    'AI researchers',
    'NVIDIA',
    'Siemens',
    'Palantir',
    'web scraping',
    'reverse engineering',
    'AI inference',
    'data extraction',
    'machine learning',
    'automation',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'About Us | PandorLabs',
    description:
      'Former AI researchers from NVIDIA, Siemens & Palantir. World-record AI inference. Expert AI agents with 10+ years web scraping mastery.',
    url: process.env.NEXT_PUBLIC_APP_URL + '/about',
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | PandorLabs',
    description:
      'Former AI researchers from NVIDIA, Siemens & Palantir. World-record AI inference. Expert AI agents with 10+ years web scraping mastery.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
  },
}

export default function AboutUs() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative -mt-24 flex min-h-screen items-center bg-[url(/images/hero-section.png)] bg-cover bg-center bg-no-repeat pt-24">
        <span className="from-primary to-primary/20 absolute inset-0 z-5 bg-linear-to-t"></span>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Section badge */}
            <div className="hover:border-green-light/30 mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
              <Microscope className="text-green-light h-4 w-4" />
              <span className="text-sm font-medium tracking-wider text-white/60 uppercase">
                About PandorLabs
              </span>
            </div>

            <h1 className="mb-6 text-[32px]/tight font-bold tracking-tight sm:text-5xl lg:text-7xl/tight">
              Elite AI Researchers
              <br />
              <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent drop-shadow-lg">
                Building the Future
              </span>
            </h1>

            <p className="text-gray mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Former researchers from NVIDIA, Siemens, and Palantir.
              World-record AI inference. Expert AI agents. 10+ years mastering
              web scraping and reverse engineering.
            </p>
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

      {/* Story Section */}
      <section className="from-primary via-primary/95 to-background relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/5 to-green-light/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-30"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-10">
            {/* Bio text */}
            <div className="space-y-8 text-lg leading-relaxed">
              <p className="text-gray text-center">
                We are former AI researchers and reverse engineering specialists
                from NVIDIA, Siemens, and Palantir—where cutting-edge innovation
                meets production-grade excellence. Our team has worked on
                systems where milliseconds define competitive advantage and
                failure simply isn&apos;t an option.
              </p>

              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
                <div className="from-green-light/5 absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <p className="group-hover:text-green-light relative text-center text-xl font-medium text-white transition-colors duration-300 sm:text-2xl">
                  &ldquo;We achieved world records in AI inference and became
                  experts at building AI agents that solve problems others
                  consider impossible.&rdquo;
                </p>
              </div>

              <p className="text-gray text-center">
                Our breakthrough in AI inference optimization set world records
                for performance, proving that research excellence translates to
                real-world impact. We specialize in building intelligent AI
                agents that combine deep learning, reverse engineering, and
                adversarial techniques to overcome the most complex automation
                challenges.
              </p>

              <p className="text-gray text-center">
                With over 10 years dedicated to web scraping and data
                extraction, we&apos;ve mastered every layer of the modern web
                stack. From dynamic JavaScript applications to sophisticated
                anti-bot systems, our expertise in reverse engineering and
                AI-powered automation allows us to extract intelligence from
                sources others deem &ldquo;unscrappable.&rdquo; If it&apos;s on
                the web, we can reach it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="from-background to-background relative overflow-hidden bg-gradient-to-b via-white/5 py-16 lg:py-20">
        <div className="to-green-light/5 absolute inset-0 bg-gradient-to-br from-green-100/5 via-transparent"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="text-gray mb-3 text-sm tracking-wider uppercase">
                Our Foundation
              </p>
              <h2 className="mb-4 text-[26px]/8 font-semibold sm:text-3xl lg:text-5xl/[60px]">
                Built on{' '}
                <span className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-transparent">
                  Research Excellence
                </span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Credential Card 1 */}
              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl">
                <div className="from-green-light/5 absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Award
                    className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  World-Record AI Inference
                </h3>
                <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                  Achieved breakthrough performance in AI inference optimization
                </p>
              </div>

              {/* Credential Card 2 */}
              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl">
                <div className="from-green-light/5 absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <BookOpen
                    className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  Elite Industry Background
                </h3>
                <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                  Former researchers from NVIDIA, Siemens, and Palantir
                </p>
              </div>

              {/* Credential Card 3 */}
              <div className="group hover:border-green-light/50 hover:shadow-green-light/20 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl">
                <div className="from-green-light/5 absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="bg-green-light/10 group-hover:bg-green-light/20 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Microscope
                    className="text-green-light h-7 w-7 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="group-hover:text-green-light mb-3 text-lg font-semibold text-white transition-colors duration-300">
                  10+ Years Web Scraping Mastery
                </h3>
                <p className="text-gray group-hover:text-gray/90 text-sm leading-relaxed transition-colors duration-300">
                  Deep expertise in data extraction and reverse engineering
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="from-background to-primary/10 relative overflow-hidden bg-gradient-to-b py-16 lg:py-20">
        <div className="from-green-light/10 absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="group hover:border-green-light/50 hover:shadow-green-light/30 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
              <div className="from-green-light/10 absolute inset-0 -z-10 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <p className="mb-6 text-xl text-white/80 italic transition-colors duration-300 group-hover:text-white sm:text-2xl">
                &ldquo;Elite researchers from NVIDIA, Siemens, and Palantir.
                World-record AI inference. Expert AI agents. 10+ years of web
                scraping mastery. We solve the impossible.&rdquo;
              </p>
              <p className="to-green-light bg-linear-to-l from-green-100 bg-clip-text text-sm font-medium text-transparent">
                — The PandorLabs Team
              </p>
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
                "url": "${process.env.NEXT_PUBLIC_APP_URL}/about",
                "description": "Former AI researchers from NVIDIA, Siemens & Palantir. World-record AI inference. Expert AI agents with 10+ years web scraping mastery.",
                "inLanguage": "en",
                "image": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "${process.env.NEXT_PUBLIC_APP_URL}"
                    },{
                        "@type": "ListItem",
                        "position": 2,
                        "name": "About Us",
                        "item": "${process.env.NEXT_PUBLIC_APP_URL}/about"
                    }]
                },
                "mainEntity": {
                    "@type": "Organization",
                    "name": "PandorLabs",
                    "url": "${process.env.NEXT_PUBLIC_APP_URL}",
                    "logo": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                    "description": "Elite AI research team building intelligent data extraction systems. Former researchers from NVIDIA, Siemens, and Palantir with world-record AI inference and 10+ years web scraping expertise.",
                    "foundingDate": "2023",
                    "knowsAbout": ["Artificial Intelligence", "Machine Learning", "Web Scraping", "Data Extraction", "Reverse Engineering", "AI Inference Optimization"],
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
