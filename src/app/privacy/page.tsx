import { Header } from '@/components/header'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-6 text-gray-200">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-6 text-gray-200">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, and communicate with you.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="mb-6 text-gray-200">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="mb-6 text-gray-200">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-200">
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@alurai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}