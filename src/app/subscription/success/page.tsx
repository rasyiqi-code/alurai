'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@stackframe/stack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ArrowRight, Home, CheckCircle, Loader2 } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'

export default function SubscriptionSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()
  const { refetch: fetchSubscriptionData } = useSubscription()
  const [loading, setLoading] = useState(true)
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      // Check if this is demo mode
      const isDemo = searchParams.get('demo') === 'true'
      const planName = searchParams.get('plan')
      const priceId = searchParams.get('priceId')
      
      if (isDemo) {
        setSubscriptionDetails({
          isDemo: true,
          planName: planName || 'Pro Plan',
          priceId: priceId || 'demo_price_id',
          transactionId: 'demo_txn_' + Date.now(),
          message: 'Demo transaction - no actual payment processed'
        })
        setLoading(false)
        return
      }

      // Handle Creem payment success
      const sessionId = searchParams.get('session_id')
      const checkoutId = searchParams.get('checkout_id')
      
      if (sessionId || checkoutId) {
        if (!user) {
          setError('Pengguna tidak terautentikasi')
          setLoading(false)
          return
        }

        try {
          // Refresh subscription data untuk memastikan status terbaru
          await fetchSubscriptionData()
          setSubscriptionDetails({
            sessionId,
            checkoutId,
            planName: planName || 'Premium Plan'
          })
        } catch (error) {
          console.error('Error verifying payment:', error)
          setError('Gagal memverifikasi pembayaran')
        }
      } else {
        // Legacy support untuk parameter lama
        const transactionId = searchParams.get('_ptxn')
        const subscriptionId = searchParams.get('_psubscription')
        const legacyCheckoutId = searchParams.get('_pcheckout')
        
        if (transactionId || subscriptionId) {
          setSubscriptionDetails({
            transactionId,
            subscriptionId,
            checkoutId: legacyCheckoutId
          })
        }
      }
      
      setLoading(false)
    }

    verifyPayment()
  }, [searchParams, user, fetchSubscriptionData])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memverifikasi pembayaran...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Terjadi Kesalahan</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/pricing')} className="w-full">
              Kembali ke Halaman Harga
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          {subscriptionDetails?.isDemo ? 'Demo Checkout Successful!' : 'Subscription Successful!'}
        </h1>
        <p className="text-gray-300 mb-8">
          {subscriptionDetails?.isDemo 
            ? `Thank you for testing the checkout flow for ${subscriptionDetails.planName}! This was a demo transaction - no actual payment was processed.`
            : 'Thank you for subscribing! Your payment has been processed successfully and your subscription is now active.'
          }
        </p>

        {/* Subscription Details */}
        {subscriptionDetails && (
          <div className={`rounded-lg p-4 mb-8 text-left ${
            subscriptionDetails.isDemo ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-white/5'
          }`}>
            <h3 className="text-white font-semibold mb-3">
              {subscriptionDetails.isDemo ? 'Demo Details:' : 'Subscription Details:'}
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              {subscriptionDetails.planName && (
                 <div>
                   <span className="text-gray-400">Plan:</span>
                   <span className="ml-2 font-semibold">{subscriptionDetails.planName}</span>
                 </div>
               )}
               {subscriptionDetails.priceId && (
                 <div>
                   <span className="text-gray-400">Price ID:</span>
                   <span className="ml-2 font-mono text-sm">{subscriptionDetails.priceId}</span>
                 </div>
               )}
              {subscriptionDetails.transactionId && (
                <div>
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="ml-2 font-mono">{subscriptionDetails.transactionId}</span>
                </div>
              )}
              {subscriptionDetails.subscriptionId && (
                <div>
                  <span className="text-gray-400">Subscription ID:</span>
                  <span className="ml-2 font-mono">{subscriptionDetails.subscriptionId}</span>
                </div>
              )}
              {subscriptionDetails.message && (
                <div className="text-yellow-300 font-medium">
                  {subscriptionDetails.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-500/20 rounded-lg p-4 mb-8">
          <h3 className="text-white font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-300 space-y-1 text-left">
            {subscriptionDetails?.isDemo ? (
              <>
                <li>• This was a demo of the checkout process</li>
                <li>• In production, payment would be processed</li>
                <li>• User would gain access to premium features</li>
                <li>• Confirmation email would be sent</li>
              </>
            ) : (
              <>
                <li>• Your subscription is now active</li>
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Access all premium features in your dashboard</li>
                <li>• Manage your subscription in account settings</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-gray-400">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}