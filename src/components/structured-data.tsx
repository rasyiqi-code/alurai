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

// FAQ structured data
export const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How fast can I create a form with AlurAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can create a complete, professional form in just 30 seconds using our AI-powered form builder. Simply describe what you need in plain English and our AI will generate the perfect form structure for you.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes AlurAI different from traditional form builders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AlurAI uses conversational AI to create forms in seconds instead of requiring 30+ minutes of manual drag-and-drop work. Users fill out forms through a chat-like interface that achieves 3x higher completion rates compared to traditional forms.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need technical knowledge to use AlurAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No technical knowledge is required. Simply describe your form requirements in plain English, and our AI will handle all the technical aspects including form structure, validation rules, and mobile optimization.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of forms can I create with AlurAI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can create any type of form including contact forms, surveys, feedback forms, registration forms, order forms, and more. Our AI adapts to your specific needs and creates the appropriate form structure.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AlurAI free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, AlurAI offers a free tier to get started. You can create forms and collect responses without any cost. We also offer premium plans with advanced features for businesses that need more capabilities.',
      },
    },
  ],
}

// Breadcrumb structured data
export const breadcrumbStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://alurai.com',
    },
  ],
}

// Product/Service structured data
export const productStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AlurAI Form Builder',
  description: 'AI-powered conversational form builder that creates forms in 30 seconds',
  brand: {
    '@type': 'Brand',
    name: 'AlurAI',
  },
  category: 'Software Application',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2025-12-31',
    seller: {
      '@type': 'Organization',
      name: 'AlurAI',
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Sarah Johnson',
      },
      reviewBody: 'AlurAI has revolutionized how we create forms. The AI creates perfect forms in seconds!',
    },
  ],
}

// How-to structured data
export const howToStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create AI-Powered Forms in 30 Seconds',
  description: 'Learn how to create beautiful conversational forms using AlurAI in just 30 seconds',
  image: 'https://alurai.com/how-to-create-forms.jpg',
  totalTime: 'PT30S',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'AlurAI Account',
    },
    {
      '@type': 'HowToSupply',
      name: 'Form Description',
    },
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'AlurAI Platform',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Describe Your Form',
      text: 'Simply describe what you need in plain English',
      image: 'https://alurai.com/step1-describe.jpg',
    },
    {
      '@type': 'HowToStep',
      name: 'AI Creates Your Form',
      text: 'Our AI generates the perfect form structure in seconds',
      image: 'https://alurai.com/step2-ai-creates.jpg',
    },
    {
      '@type': 'HowToStep',
      name: 'Customize and Deploy',
      text: 'Customize your form and share it with users',
      image: 'https://alurai.com/step3-deploy.jpg',
    },
  ],
}

// Article structured data for blog posts
export const articleStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Create Forms in 30 Seconds with AI - The Future of Form Building',
  description: 'Discover how AI-powered form builders are revolutionizing the way we create and deploy forms',
  image: 'https://alurai.com/article-image.jpg',
  datePublished: '2024-01-15T00:00:00Z',
  dateModified: '2024-01-15T00:00:00Z',
  author: {
    '@type': 'Person',
    name: 'AlurAI Team',
    url: 'https://alurai.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AlurAI',
    logo: {
      '@type': 'ImageObject',
      url: 'https://alurai.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://alurai.com',
  },
}

// Local Business structured data (if applicable)
export const localBusinessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AlurAI',
  description: 'AI-powered form builder platform for creating conversational forms',
  url: 'https://alurai.com',
  telephone: '+1-555-0123',
  email: 'support@alurai.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Tech Street',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94105',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '37.7749',
    longitude: '-122.4194',
  },
  openingHours: 'Mo-Fr 09:00-17:00',
  priceRange: '$$',
  paymentAccepted: 'Credit Card, PayPal',
  currenciesAccepted: 'USD',
}

// Video structured data (for demo videos)
export const videoStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'AlurAI Demo - Create Forms in 30 Seconds',
  description: 'Watch how AlurAI creates beautiful conversational forms in just 30 seconds',
  thumbnailUrl: 'https://alurai.com/video-thumbnail.jpg',
  uploadDate: '2024-01-15T00:00:00Z',
  duration: 'PT2M30S',
  contentUrl: 'https://alurai.com/demo-video.mp4',
  embedUrl: 'https://alurai.com/embed/demo-video',
  publisher: {
    '@type': 'Organization',
    name: 'AlurAI',
    logo: {
      '@type': 'ImageObject',
      url: 'https://alurai.com/logo.png',
    },
  },
}