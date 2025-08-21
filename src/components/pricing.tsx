'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Star } from 'lucide-react'

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals',
    price: '$9.99/month',
    features: [
      'Up to 10 forms',
      'Basic analytics',
      'Email support',
      '1,000 responses/month'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for growing businesses',
    price: '$29.99/month',
    features: [
      'Unlimited forms',
      'Advanced analytics',
      'Priority support',
      '10,000 responses/month',
      'Custom branding',
      'API access'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$99.99/month',
    features: [
      'Everything in Pro',
      'Unlimited responses',
      'Dedicated support',
      'Custom integrations',
      'SSO authentication',
      'Advanced security'
    ]
  }
];

interface PricingProps {
  userId?: string;
}

export function Pricing({ userId }: PricingProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (plan: SubscriptionPlan) => {
    setLoading(true);
    
    try {
      // Placeholder untuk implementasi pembayaran di masa depan
      alert(`Fitur pembayaran untuk paket ${plan.name} akan segera tersedia!`);
      console.log(`Selected plan: ${plan.name}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
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
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => {
            
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
                  disabled={loading}
                  className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
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