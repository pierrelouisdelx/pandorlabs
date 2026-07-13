/**
 * JSON-LD Schema Generator Utilities
 * Generates Schema.org structured data for SEO optimization
 */

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface ServiceSchemaProps {
  name: string
  description: string
  url: string
  provider: {
    name: string
    url: string
  }
  areaServed?: string
  serviceType?: string
}

/**
 * Generates WebSite schema with search action for Google Sitelinks
 */
export function generateWebSiteSchema(siteUrl: string, siteName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generates comprehensive Organization schema
 */
export function generateOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pandor Labs',
    legalName: 'Pandor Labs',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'Advanced web scraping and data extraction solutions for e-commerce, social media, crypto, and more.',
    foundingDate: '2020',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'contact@pandorlabs.com',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      // Add social media profiles here when available
      // 'https://twitter.com/pandorlabs',
      // 'https://linkedin.com/company/pandorlabs',
      // 'https://github.com/pandorlabs',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  }
}

/**
 * Generates Service schema for product pages
 */
export function generateServiceSchema(props: ServiceSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: props.name,
    description: props.description,
    provider: {
      '@type': 'Organization',
      name: props.provider.name,
      url: props.provider.url,
    },
    serviceType: props.serviceType || 'Data Extraction Service',
    areaServed: props.areaServed || 'Worldwide',
    url: props.url,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
      },
    },
  }
}

/**
 * Generates BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generates FAQPage schema. Eligible for FAQ rich results in Google, so the
 * questions must match the ones actually rendered on the page.
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generates WebPage schema
 */
export function generateWebPageSchema(
  url: string,
  name: string,
  description: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      url: url.split('/').slice(0, 3).join('/'),
    },
  }
}

/**
 * Generates SoftwareApplication schema
 */
export function generateSoftwareApplicationSchema(
  siteUrl: string,
  appName: string,
  description: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appName,
    applicationCategory: 'BusinessApplication',
    description,
    operatingSystem: 'Web',
    // No self-serve price: engagements are quoted. Advertising price: '0' would
    // claim a free tier that does not exist.
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'Pandor Labs',
      url: siteUrl,
    },
  }
}

/**
 * Helper to safely stringify JSON-LD for Next.js Script component
 */
export function stringifyJsonLd(data: any): string {
  return JSON.stringify(data)
}
