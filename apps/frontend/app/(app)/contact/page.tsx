import helper from '@/lib/helper'
import { ArrowUpRight } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us | PandorLabs',
  description:
    'Get in touch with PandorLabs to discuss your web intelligence and data extraction challenges. Our team specializes in solving complex automation problems.',
  keywords: [
    'contact PandorLabs',
    'web intelligence',
    'data extraction',
    'automation',
    'web scraping support',
    'contact sales',
    'technical support',
    'data challenges',
  ],
  openGraph: {
    ...helper.openGraphData,
    title: 'Contact Us | PandorLabs',
    description:
      'Get in touch with PandorLabs to discuss your web intelligence and data extraction challenges. Our team specializes in solving complex automation problems.',
    url: process.env.NEXT_PUBLIC_APP_URL + '/contact',
    type: 'website',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | PandorLabs',
    description:
      'Get in touch with PandorLabs to discuss your web intelligence and data extraction challenges.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
  },
}
export default function ContactUs() {
  return (
    <>
      <div className="container mt-10 flex flex-col items-start gap-16 pt-20 lg:flex-row lg:gap-24 xl:max-w-(--breakpoint-xl)">
        <div className="w-full max-w-xl">
          <div>
            <h1 className="mb-3 text-[26px]/8 font-semibold sm:text-3xl lg:mb-5 lg:text-5xl/[60px]">
              Let&apos;s Solve Your <br />
              <span className="to-green-light bg-linear-to-l from-green-100/50 bg-clip-text text-transparent">
                Data Challenges
              </span>
            </h1>
            <p className="text-gray">
              Whether you&apos;re facing anti-bot systems, dynamic content, or
              &ldquo;unscrappable&rdquo; data sources—our team specializes in
              solving the impossible. Reach out to discuss your web intelligence
              needs.
            </p>
          </div>
          <div className="mt-10 space-y-7">
            <div className="space-y-2 lg:space-y-3">
              <h3 className="text-green-light/70 text-base tracking-[3px] uppercase">
                email us
              </h3>
              <Link
                href="mailto:info@pandorlabs.com"
                className="border-gray/20 after:bg-green relative flex items-center justify-between gap-3 border-b pb-2.5 text-xl after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:duration-300 hover:after:w-full lg:pb-4"
              >
                <span className="grow">info@pandorlabs.com</span>
                <ArrowUpRight className="ml-auto size-8 shrink-0 duration-300" />
              </Link>
              <p className="pt-1 text-sm text-white/50">
                Response within 24 hours
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-full grow rounded-2xl bg-white/5 shadow-xl lg:-mt-10">
          <div className="relative z-1 h-full px-6 py-8 backdrop-blur-[lg] xl:p-10">
            <h3 className="mb-8 text-xl font-semibold tracking-widest">
              Contact Us
            </h3>
            <ContactForm />
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
                "@context": "https://schema.org",
                "@type": "ContactPage",
                "name": "Contact Us | PandorLabs",
                "url": "${process.env.NEXT_PUBLIC_APP_URL}/contact",
                "description": "Get in touch with PandorLabs to discuss your web intelligence and data extraction challenges. Our team specializes in solving complex automation problems.",
                "inLanguage": "en",
                "image": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                "mainEntity": {
                    "@type": "Organization",
                    "name": "PandorLabs",
                    "url": "${process.env.NEXT_PUBLIC_APP_URL}",
                    "logo": "${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg",
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "Sales",
                        "email": "info@pandorlabs.com",
                        "availableLanguage": ["English"],
                        "areaServed": "Worldwide"
                    }
                },
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
                        "name": "Contact Us",
                        "item": "${process.env.NEXT_PUBLIC_APP_URL}/contact"
                    }]
                }
            }`,
        }}
      />
    </>
  )
}
