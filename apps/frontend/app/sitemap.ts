import type { MetadataRoute } from 'next'

import { BRANDS } from '@/lib/brands'
import { SOCIAL_SOURCES } from '@/lib/social-sources'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.pandorlabs.com'
  const now = new Date()

  // Static pages with appropriate priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const products = [
    'ai-datasets',
    'crypto',
    'lead-generation',
    'real-estate',
    'shopping',
    'social-media',
  ]

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Hub listing every fashion source. Sits above the individual brand pages in
  // priority because it is the page that distributes crawl budget to them.
  const sourcesHub: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products/shopping/sources`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // One page per dedicated retail collector.
  const brandPages: MetadataRoute.Sitemap = BRANDS.map((brand) => ({
    url: `${baseUrl}/products/shopping/${brand.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // One page per social platform source.
  const socialSourcePages: MetadataRoute.Sitemap = SOCIAL_SOURCES.map(
    (source) => ({
      url: `${baseUrl}/products/social-media/${source.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }),
  )

  return [
    ...staticPages,
    ...productPages,
    ...sourcesHub,
    ...brandPages,
    ...socialSourcePages,
  ]
}
