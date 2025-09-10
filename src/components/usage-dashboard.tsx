'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, MessageSquare, Crown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { UserSubscription, UsageStats, SubscriptionPlan } from '@/lib/types'
import { SubscriptionService } from '@/lib/subscription-service'
import { getSubscriptionPlan } from '@/lib/subscription-plans'
import { useUser } from '@stackframe/stack'

interface UsageDashboardProps {
  userId: string;
}

export function UsageDashboard({ userId }: UsageDashboardProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useUser()

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId: 'pro',
          userEmail: user?.primaryEmail || 'user@example.com'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          alert('Failed to get checkout URL');
        }
      } else {
        const error = await response.json();
        alert(`Upgrade failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Error upgrading subscription');
    }
  };

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      const [userSubscription, userUsage] = await Promise.all([
        SubscriptionService.getUserSubscription(userId),
        SubscriptionService.getUserUsage(userId)
      ])
      
      setSubscription(userSubscription)
      setUsage(userUsage)
      
      if (userSubscription) {
        const subscriptionPlan = getSubscriptionPlan(userSubscription.planId)
        setPlan(subscriptionPlan || null)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (used: number, limit: number | string | -1): number => {
    if (limit === 'unlimited' || limit === -1 || typeof limit === 'string') return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }



  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-48 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl animate-pulse"></div>
        <div>
          <div className="h-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!subscription || !usage || !plan) {
    return (
      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load subscription data</h3>
            <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usageItems = [
    {
      icon: FileText,
      label: 'Forms Created',
      used: usage.formsCreated,
      limit: plan.limits.forms,
      color: 'blue',
      formatter: (value: number) => value.toLocaleString()
    },
    {
      icon: MessageSquare,
      label: 'Responses',
      used: usage.responsesReceived,
      limit: plan.limits.responses,
      color: 'green',
      formatter: (value: number) => value.toLocaleString()
    }
  ]

  return (
    <div className="space-y-8">
      {/* Subscription Overview */}
      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                {plan.tier === 'free' ? (
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                )}
                {plan.name} Plan
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-gray-600 dark:text-gray-300">{plan.description}</CardDescription>
            </div>
            <div className="text-right">
              <Badge 
                variant={subscription.status === 'active' ? 'default' : 'destructive'}
                className="text-sm px-3 py-1"
              >
                {subscription.status}
              </Badge>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">
                {plan.price === 0 ? 'Free Forever' : plan.priceDisplay}
              </p>
            </div>
          </div>
        </CardHeader>
        {plan.tier === 'free' && (
          <CardContent>
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xl mb-2">🚀 Upgrade to unlock more features</h4>
                  <p className="text-blue-100">Get unlimited forms, advanced analytics, and more</p>
                </div>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 font-semibold"
                  onClick={handleUpgrade}
                >
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Usage Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageItems.map((item) => {
            const percentage = getUsagePercentage(item.used, item.limit)
            const isUnlimited = item.limit === 'unlimited' || item.limit === -1 || typeof item.limit === 'string'
            
            return (
              <Card key={item.label} className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${
                        item.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        item.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        item.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        item.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                        'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Current usage</p>
                      </div>
                    </div>
                    <Badge 
                      variant={isUnlimited ? "default" : percentage >= 90 ? "destructive" : percentage >= 75 ? "secondary" : "outline"} 
                      className="text-sm px-3 py-1"
                    >
                      {isUnlimited ? 'Unlimited' : `${item.used}/${item.limit}`}
                    </Badge>
                  </div>
                  
                  {!isUnlimited && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-3"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.formatter(item.used)} of{' '}
                        {typeof item.limit === 'number' 
                          ? item.formatter(item.limit) 
                          : item.limit} used
                      </p>
                    </div>
                  )}
                  
                  {isUnlimited && (
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {item.formatter ? item.formatter(item.used) : item.used}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total used</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Information */}
      {subscription.status === 'active' && plan.price > 0 && (
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">💳 Billing Information</CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">Your subscription details and billing cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Period</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Next Billing Date</p>
                <p className="text-lg text-gray-900 dark:text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Your subscription will be cancelled at the end of the current billing period.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UsageDashboard