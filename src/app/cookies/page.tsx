import { Header } from '@/components/header'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="mb-6 text-gray-200">
              Cookies are small text files that are placed on your computer or mobile device 
              when you visit our website. They help us provide you with a better experience.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="mb-6 text-gray-200">
              We use cookies to understand how you use our website, remember your preferences, 
              and improve our services.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            <div className="mb-6 text-gray-200">
              <p className="mb-2"><strong>Essential Cookies:</strong> Required for the website to function properly</p>
              <p className="mb-2"><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</p>
              <p className="mb-2"><strong>Functional Cookies:</strong> Remember your preferences and settings</p>
              <p><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</p>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="mb-6 text-gray-200">
              You can control and manage cookies in your browser settings. Please note that 
              removing or blocking cookies may impact your user experience.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="mb-6 text-gray-200">
              We may use third-party services that place cookies on your device. These services 
              have their own privacy policies and cookie practices.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-200">
              If you have any questions about our use of cookies, please contact us at 
              cookies@alurai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}