import { Header } from '@/components/header'
import { generateMetadata as generateSEOMetadata, metaDescriptions, metaKeywords } from '@/lib/seo-utils'
import type { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: metaDescriptions.terms,
  keywords: metaKeywords.terms,
  path: '/terms',
  ogImage: '/og-terms.png',
  twitterImage: '/twitter-terms.png',
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-6 text-gray-200">
              By accessing and using AlurAI, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Use License</h2>
            <p className="mb-6 text-gray-200">
              Permission is granted to temporarily use AlurAI for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
            <p className="mb-6 text-gray-200">
              You are responsible for safeguarding the password and for maintaining the 
              confidentiality of your account information.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="mb-6 text-gray-200">
              You may not use our service for any illegal or unauthorized purpose nor may you, 
              in the use of the service, violate any laws in your jurisdiction.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <p className="mb-6 text-gray-200">
              We reserve the right to modify or discontinue the service at any time without notice.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-200">
              Questions about the Terms of Service should be sent to us at terms@alurai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}