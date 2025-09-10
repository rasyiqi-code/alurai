'use client';

import React, { useState } from 'react';
import { subscriptionPlans, SubscriptionPlanUtils } from '@/lib/subscription-plans';
import { SubscriptionPlan } from '@/lib/types';
import PricingCard from './PricingCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { toast } from 'sonner';

interface PricingTableProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string) => void;
}

export function PricingTable({ currentPlan, onPlanSelect }: PricingTableProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const user = useUser();

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      router.push('/sign-in');
      return;
    }

    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }

    setIsLoading(true);
    
    try {
      if (planId === 'free') {
        // Handle downgrade to free
        if (currentPlan && currentPlan !== 'free') {
          const response = await fetch('/api/subscription', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: 'free' }),
          });

          if (!response.ok) {
            throw new Error('Failed to downgrade to free plan');
          }

          toast.success('Successfully downgraded to free plan');
          router.refresh();
        } else {
          toast.info('You are already on the free plan');
        }
      } else {
        // Handle upgrade to paid plan
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            planId,
            billingInterval: isAnnual ? 'year' : 'month'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { checkoutUrl } = await response.json();
        
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to process plan selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayPlans = (): SubscriptionPlan[] => {
    if (!isAnnual) {
      return subscriptionPlans;
    }

    // Calculate annual pricing
    return subscriptionPlans.map(plan => {
      if (plan.price === 0) return plan;
      
      const annualSavings = SubscriptionPlanUtils.getAnnualSavings(plan.price);
      return {
        ...plan,
        price: Math.round(annualSavings.annualPrice / 12), // Monthly equivalent
        priceDisplay: `$${Math.round(annualSavings.annualPrice / 12)}/month`,
      };
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Start free and scale as you grow. Upgrade or downgrade at any time.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-medium' : undefined}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle" className={isAnnual ? 'font-medium' : undefined}>
            Annual
            <span className="ml-1 text-sm text-green-600 font-medium">
              (Save 17%)
            </span>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {getDisplayPlans().map((plan) => {
          const isFree = plan.tier === 'free';
          const isPro = plan.tier === 'pro';
          
          return (
            <div
              key={plan.id}
              className={`relative transition-all duration-300 hover:scale-105 ${
                isPro 
                  ? 'transform scale-105' 
                  : ''
              }`}
            >
              <PricingCard
                plan={plan}
                currentPlan={currentPlan}
                isLoading={isLoading}
                onSelectPlan={handlePlanSelect}
                showAnnualSavings={isAnnual}
              />
              
              {/* Additional value proposition for Pro */}
              {isPro && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">
                    🚀 Most popular choice for growing businesses
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your data is always safe. If you exceed the limits of your new plan, you'll be notified to upgrade or remove excess data.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Our free plan is generous and permanent. You can also try any paid plan with our 30-day money-back guarantee.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Need a custom plan?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our sales team for custom enterprise solutions with dedicated support and custom integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center">
        <div className="bg-muted rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@aluformai.com" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Contact Sales
            </a>
            <a 
              href="/docs" 
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingTable;