import Script from 'next/script'

interface StructuredDataProps {
  data: object
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

// Website structured data for homepage
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AlurAI',
  description: 'Create beautiful, intelligent conversational forms powered by AI. Build engaging surveys, feedback forms, and data collection tools with advanced analytics.',
  url: 'https://alurai.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://alurai.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AlurAI',
    url: 'https://alurai.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://alurai.com/logo.png',
    },
  },
}

// Software Application structured data
export const softwareApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AlurAI Form Builder',
  description: 'AI-powered conversational form builder for creating engaging surveys and feedback forms',
  url: 'https://alurai.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  author: {
    '@type': 'Organization',
    name: 'AlurAI Team',
  },
}

// Organization structured data
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AlurAI',
  url: 'https://alurai.com',
  logo: 'https://alurai.com/logo.png',
  description: 'Leading AI-powered form builder platform for creating conversational surveys and feedback forms',
  foundingDate: '2024',
  sameAs: [
    'https://twitter.com/alurai',
    'https://linkedin.com/company/alurai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@alurai.com',
  },
}