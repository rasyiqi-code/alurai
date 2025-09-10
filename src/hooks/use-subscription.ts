'use client'

import { useState, useEffect } from 'react'
import { UserSubscription, UsageStats } from '@/lib/types'

interface SubscriptionData {
  subscription: UserSubscription | null
  usage: UsageStats | null
  loading: boolean
  error: string | null
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData>({
    subscription: null,
    usage: null,
    loading: true,
    error: null
  })

  const fetchSubscriptionData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/subscription')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data')
      }
      
      const result = await response.json()
      
      setData({
        subscription: result.subscription,
        usage: result.usage,
        loading: false,
        error: null
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  const createSubscription = async (planId: string) => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      // Untuk plan berbayar, buat checkout session Creem
      if (planId !== 'free') {
        const response = await fetch('/api/checkout/creem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const result = await response.json();
        
        // Redirect ke halaman checkout Creem
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return result;
        }
      } else {
        // Untuk plan free, langsung buat subscription
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'create', planId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create subscription');
        }

        const result = await response.json();
        await fetchSubscriptionData(); // Refresh data
        return result.subscription;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setData(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'cancel'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }
      
      // Refresh data after canceling subscription
      await fetchSubscriptionData()
    } catch (error) {
      throw error
    }
  }

  const updateUsage = async (
    type: 'forms' | 'responses' | 'storage' | 'apiCalls',
    amount: number = 1
  ) => {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          amount
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        if (result.code === 'LIMIT_EXCEEDED') {
          throw new Error('Usage limit exceeded. Please upgrade your plan.')
        }
        throw new Error(result.error || 'Failed to update usage')
      }
      
      // Update local usage data
      setData(prev => ({
        ...prev,
        usage: result.usage
      }))
      
      return result.usage
    } catch (error) {
      throw error
    }
  }

  const checkUsageLimit = async (
    type: 'forms' | 'responses' | 'storage' | 'apiCalls',
    amount: number = 1
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          amount,
          checkOnly: true
        })
      })
      
      return response.ok
    } catch (error) {
      return false
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  return {
    ...data,
    refetch: fetchSubscriptionData,
    createSubscription,
    cancelSubscription,
    updateUsage,
    checkUsageLimit
  }
}

export default useSubscription