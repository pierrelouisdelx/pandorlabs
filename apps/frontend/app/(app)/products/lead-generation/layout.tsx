import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lead Generation Data API | PandorLabs',
  description:
    'Access 321M+ verified B2B contacts with 95% email accuracy, GDPR-compliant sourcing, and real-time enrichment. Scale your sales pipeline with AI-powered lead scoring.',
  keywords: [
    'lead generation API',
    'B2B contact data API',
    'sales prospecting API',
    'email verification API',
    'contact enrichment API',
    'CRM enrichment',
    'B2B data provider',
    'lead scoring API',
    'firmographic data',
    'GDPR compliant B2B data',
  ],
  openGraph: {
    title: 'Lead Generation Data API | PandorLabs',
    description:
      'Access 321M+ verified B2B contacts with 95% email accuracy and GDPR-compliant sourcing. Real-time enrichment and AI-powered lead scoring.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL + '/products/lead-generation',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lead Generation Data API | PandorLabs',
    description:
      'Access 321M+ verified B2B contacts with 95% email accuracy and GDPR-compliant sourcing. Real-time enrichment and AI-powered lead scoring.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/lead-generation`,
  },
}

export default function LeadGenerationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
