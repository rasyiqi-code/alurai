import type { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  path?: string
  ogImage?: string
  twitterImage?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = 'https://alurai.com'
  const canonicalUrl = config.path ? `${baseUrl}${config.path}` : baseUrl
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title ? `${config.title} - AlurAI` : 'AlurAI',
      description: config.description,
      url: canonicalUrl,
      images: config.ogImage ? [
        {
          url: config.ogImage,
          width: 1200,
          height: 630,
          alt: config.title || 'AlurAI',
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title ? `${config.title} - AlurAI` : 'AlurAI',
      description: config.description,
      images: config.twitterImage ? [config.twitterImage] : undefined,
    },
  }
}

// Dynamic meta descriptions based on page type
export const metaDescriptions = {
  home: 'Transform your data collection with AI-powered conversational forms. Create engaging surveys, feedback forms, and questionnaires that feel like natural conversations.',
  analytics: 'View comprehensive analytics and insights for your AI-powered forms. Track submissions, engagement rates, and performance metrics.',
  submissions: 'Manage and view all form submissions from your AI-powered conversational forms. Access detailed responses and export data.',
  create: 'Create beautiful AI-powered conversational forms in minutes. Build engaging surveys and feedback forms with our intuitive form builder.',
  forms: 'Manage all your AI-powered conversational forms in one place. View, edit, and analyze your form performance.',
  pricing: 'Choose the perfect plan for your form building needs. Start free and scale with AI-powered conversational forms.',
  templates: 'Browse our collection of pre-built form templates. Get started quickly with professionally designed conversational forms.',
  login: 'Sign in to your AlurAI account to access your AI-powered conversational forms and analytics dashboard.',
  feedback: 'Share your feedback and help us improve AlurAI. Your input helps us build better AI-powered form experiences.',
  privacy: 'Learn about how AlurAI protects your privacy and data. Read our comprehensive privacy policy and data handling practices.',
  terms: 'Review the terms of service for using AlurAI. Understand your rights and responsibilities when using our platform.',
}

// Dynamic keywords based on page type
export const metaKeywords = {
  home: ['AI form builder', 'conversational surveys', 'smart forms', 'AI questionnaire', 'interactive forms', 'form automation'],
  analytics: ['form analytics', 'survey insights', 'form metrics', 'data analytics', 'submission tracking'],
  submissions: ['form submissions', 'survey responses', 'form data', 'submission management', 'response tracking'],
  create: ['create forms', 'form builder', 'AI form creator', 'survey builder', 'conversational form maker'],
  forms: ['form management', 'form dashboard', 'survey management', 'form organization', 'form library'],
  pricing: ['form builder pricing', 'AI form plans', 'survey tool pricing', 'form software cost'],
  templates: ['form templates', 'survey templates', 'pre-built forms', 'form examples', 'questionnaire templates'],
  login: ['sign in', 'login', 'account access', 'user authentication'],
  feedback: ['user feedback', 'product feedback', 'feature requests', 'bug reports'],
  privacy: ['privacy policy', 'data protection', 'user privacy', 'data security'],
  terms: ['terms of service', 'user agreement', 'platform terms', 'service conditions'],
}