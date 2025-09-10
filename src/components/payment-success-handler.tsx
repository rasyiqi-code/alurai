'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const payment = searchParams.get('payment')
      const plan = searchParams.get('plan')
      
      console.log('PaymentSuccessHandler: Checking payment status', { payment, plan })
      
      if (payment === 'success' && plan) {
        console.log('PaymentSuccessHandler: Payment successful, activating subscription for plan:', plan)
        try {
          // Activate subscription
          const response = await fetch('/api/subscription/activate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              planId: plan,
              sessionId: searchParams.get('session_id'),
              checkoutId: searchParams.get('checkout_id')
            }),
          })

          console.log('PaymentSuccessHandler: Activation response status:', response.status)
          
          if (response.ok) {
            console.log('PaymentSuccessHandler: Subscription activated successfully')
            // Remove URL parameters and refresh
            const url = new URL(window.location.href)
            url.searchParams.delete('payment')
            url.searchParams.delete('plan')
            url.searchParams.delete('session_id')
            url.searchParams.delete('checkout_id')
            window.history.replaceState({}, '', url.toString())
            
            // Refresh page to show updated subscription
            window.location.reload()
          } else {
            const errorData = await response.json()
            console.error('PaymentSuccessHandler: Activation failed:', errorData)
          }
        } catch (error) {
          console.error('PaymentSuccessHandler: Error activating subscription:', error)
        }
      }
    }

    handlePaymentSuccess()
  }, [searchParams])

  return null // This component doesn't render anything
}
