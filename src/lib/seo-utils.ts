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
  home: 'Create forms in 30 seconds with AI! AlurAI transforms your plain English descriptions into beautiful conversational forms. Users fill them out like chatting with a friend - 3x higher completion rates guaranteed.',
  analytics: 'View comprehensive analytics and insights for your AI-powered forms. Track submissions, engagement rates, completion rates, and performance metrics in real-time.',
  submissions: 'Manage and view all form submissions from your AI-powered conversational forms. Access detailed responses, export data, and analyze user feedback patterns.',
  create: 'Create beautiful AI-powered conversational forms in 30 seconds. Just describe what you need in plain English and our AI builds the perfect form structure for you.',
  forms: 'Manage all your AI-powered conversational forms in one place. View, edit, analyze performance, and optimize your forms for maximum engagement.',
  pricing: 'Choose the perfect plan for your form building needs. Start free with AlurAI and scale with AI-powered conversational forms that users love to complete.',
  login: 'Sign in to your AlurAI account to access your AI-powered conversational forms, analytics dashboard, and form management tools.',
  feedback: 'Share your feedback and help us improve AlurAI. Your input helps us build better AI-powered form experiences and new features.',
  privacy: 'Learn about how AlurAI protects your privacy and data. Read our comprehensive privacy policy and data handling practices for complete transparency.',
  terms: 'Review the terms of service for using AlurAI. Understand your rights and responsibilities when using our AI-powered form building platform.',
  dashboard: 'Access your AlurAI dashboard to manage forms, view analytics, and track performance. Create, edit, and optimize your AI-powered conversational forms.',
  billing: 'Manage your AlurAI subscription and billing. Upgrade your plan to unlock advanced features and higher form limits.',
  branding: 'Customize your forms with white-label branding. Add your logo, colors, and domain to create professional, branded form experiences.',
}

// Dynamic keywords based on page type
export const metaKeywords = {
  home: ['AI form builder', 'create forms in 30 seconds', 'conversational forms', 'chat interface forms', 'AI form generator', 'lightning fast forms', 'form completion rates', 'smart forms', 'AI questionnaire', 'interactive forms', 'form automation'],
  analytics: ['form analytics', 'survey insights', 'form metrics', 'data analytics', 'submission tracking', 'completion rates', 'form performance', 'user engagement'],
  submissions: ['form submissions', 'survey responses', 'form data', 'submission management', 'response tracking', 'form results', 'data export'],
  create: ['create forms', 'form builder', 'AI form creator', 'survey builder', 'conversational form maker', '30 seconds form creation', 'AI form generator'],
  forms: ['form management', 'form dashboard', 'survey management', 'form organization', 'form library', 'form editor', 'form optimization'],
  pricing: ['form builder pricing', 'AI form plans', 'survey tool pricing', 'form software cost', 'AlurAI pricing', 'form builder subscription'],
  login: ['sign in', 'login', 'account access', 'user authentication', 'AlurAI login', 'form builder login'],
  feedback: ['user feedback', 'product feedback', 'feature requests', 'bug reports', 'AlurAI feedback', 'form builder feedback'],
  privacy: ['privacy policy', 'data protection', 'user privacy', 'data security', 'AlurAI privacy', 'form data privacy'],
  terms: ['terms of service', 'user agreement', 'platform terms', 'service conditions', 'AlurAI terms', 'form builder terms'],
  dashboard: ['form dashboard', 'AlurAI dashboard', 'form management', 'analytics dashboard', 'form overview'],
  billing: ['AlurAI billing', 'form builder billing', 'subscription management', 'payment', 'upgrade plan'],
  branding: ['white label forms', 'custom branding', 'form customization', 'branded forms', 'logo forms'],
}