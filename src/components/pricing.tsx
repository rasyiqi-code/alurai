'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Star } from 'lucide-react'
import { 
  subscriptionPlans, 
  SubscriptionPlan,
  initializePaddle,
  openPaddleCheckout,
  checkSubscriptionStatus
} from '@/lib/paddle'

interface PricingProps {
  userId?: string;
}

export function Pricing({ userId }: PricingProps) {
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [paddleError, setPaddleError] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        const paddle = await initializePaddle();
        if (paddle) {
          setPaddleReady(true);
          setPaddleError(null);
          
          // Check subscription status if userId is provided
          if (userId) {
            const subscriptionStatus = await checkSubscriptionStatus(userId);
            setHasSubscription(subscriptionStatus);
          }
        } else {
          setPaddleError('Failed to initialize Paddle. Please check your configuration.');
        }
      } catch (error: any) {
        console.error('Paddle initialization failed:', error);
        setPaddleError('Paddle initialization failed. Please try again later.');
      }
    };

    initPaddle();
  }, [userId]);

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!paddleReady) {
      alert('Payment system is not ready. Please try again in a moment.');
      return;
    }

    setPurchasingPlan(plan.id);
    setLoading(true);

    try {
      const customData = {
        userId: userId || 'anonymous',
        planId: plan.id,
        planName: plan.name
      };

      await openPaddleCheckout(plan.paddlePriceId, customData);
      
      // Note: Actual subscription status will be updated via webhook
      // This is just for immediate UI feedback
      console.log(`Checkout opened for ${plan.name} plan`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasingPlan(null);
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered forms with our flexible pricing plans
          </p>
          {paddleError && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm">
              ⚠️ {paddleError}
            </div>
          )}
          {!paddleReady && !paddleError && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              Loading payment system...
            </div>
          )}
          {hasSubscription && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
              <Check className="w-4 h-4" />
              You have an active subscription
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const isPurchasing = purchasingPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-400 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-400 text-sm">per month</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-200">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={loading || hasSubscription || !paddleReady}
                  className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPurchasing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Opening checkout...
                    </div>
                  ) : hasSubscription ? (
                    'Current Plan'
                  ) : !paddleReady ? (
                    'Loading...'
                  ) : (
                    `Get ${plan.name}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            All plans include 14-day free trial • Cancel anytime • No setup fees
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>✓ SSL Security</span>
            <span>✓ 99.9% Uptime</span>
            <span>✓ GDPR Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}