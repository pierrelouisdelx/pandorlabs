import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Training Datasets API | PandorLabs',
  description:
    'Access 100,000+ high-quality AI training datasets with 99% accuracy. Computer vision, NLP, and synthetic data for machine learning model development.',
  keywords: [
    'AI training data',
    'machine learning datasets',
    'computer vision datasets',
    'NLP datasets',
    'synthetic data',
    'AI datasets API',
    'training data API',
    'annotation services',
    'labeled data',
    'ML model training',
  ],
  openGraph: {
    title: 'AI Training Datasets API | PandorLabs',
    description:
      'Access 100,000+ high-quality AI training datasets with 99% accuracy. Computer vision, NLP, and synthetic data for machine learning.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL + '/products/ai-datasets',
    siteName: 'PandorLabs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Training Datasets API | PandorLabs',
    description:
      'Access 100,000+ high-quality AI training datasets with 99% accuracy. Computer vision, NLP, and synthetic data for machine learning.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/og-image.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/ai-datasets`,
  },
}

export default function AIDatasetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
