import type { Metadata } from 'next'
import '@/app/globals.css'
import helper from '@/lib/helper'
import { Funnel_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import Script from 'next/script'
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  stringifyJsonLd,
} from '@/lib/schema-generator'

const font = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-funnel-display',
})

export const metadata: Metadata = {
  title: 'PandorLabs | AI Powered Web Scraping Agents Solution',
  description:
    'AI-powered web scraping agents that extract intelligence from the unstructured, dynamic, and hidden corners of the web.',
  openGraph: {
    ...helper.openGraphData,
    title: 'PandorLabs | AI Powered Web Scraping Agents Solution',
    description:
      'AI-powered web scraping agents that extract intelligence from the unstructured, dynamic, and hidden corners of the web.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    type: 'website',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pandorlabs.com'
  const websiteSchema = generateWebSiteSchema(siteUrl, 'Pandor Labs')
  const organizationSchema = generateOrganizationSchema(siteUrl)

  return (
    <html lang="en">
      <head>
        {/* WebSite Schema for Google Sitelinks */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(websiteSchema),
          }}
        />
        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(organizationSchema),
          }}
        />
      </head>
      <body
        className="bg-primary font-funnel-display flex min-h-screen flex-col text-base/6 font-normal text-white antialiased"
        style={
          {
            '--font-funnel-display': font.style.fontFamily,
          } as React.CSSProperties
        }
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
