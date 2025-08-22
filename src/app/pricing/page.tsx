import { Header } from '@/components/header'
import { Pricing } from '@/components/pricing'
import { generateMetadata as generateSEOMetadata, metaDescriptions, metaKeywords } from '@/lib/seo-utils'
import type { Metadata } from 'next'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Pricing Plans',
  description: metaDescriptions.pricing,
  keywords: metaKeywords.pricing,
  path: '/pricing',
  ogImage: '/og-pricing.png',
  twitterImage: '/twitter-pricing.png',
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      <Pricing />
      
      {/* FAQ Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-300">
                All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}