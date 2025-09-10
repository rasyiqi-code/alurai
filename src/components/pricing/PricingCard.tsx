'use client';

import React from 'react';
import { Check, Star } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/types';
import { SubscriptionPlanUtils } from '@/lib/subscription-plans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  isLoading?: boolean;
  onSelectPlan: (planId: string) => void;
  showAnnualSavings?: boolean;
}

export function PricingCard({ 
  plan, 
  currentPlan, 
  isLoading = false, 
  onSelectPlan,
  showAnnualSavings = false 
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const isFreePlan = plan.id === 'free';
  const canUpgrade = currentPlan && SubscriptionPlanUtils.isUpgrade(currentPlan, plan.id);
  const canDowngrade = currentPlan && SubscriptionPlanUtils.isDowngrade(currentPlan, plan.id);
  
  const annualSavings = showAnnualSavings && plan.price > 0 
    ? SubscriptionPlanUtils.getAnnualSavings(plan.price)
    : null;

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isFreePlan) return 'Get Started';
    if (canUpgrade) return 'Upgrade';
    if (canDowngrade) return 'Downgrade';
    return 'Choose Plan';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    if (plan.popular) return 'default';
    return 'outline';
  };

  return (
    <Card className={`relative h-full flex flex-col ${
      plan.popular ? 'border-primary shadow-lg scale-105' : ''
    } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {plan.description}
        </CardDescription>
        
        <div className="mt-4">
          {isFreePlan ? (
            <div className="text-4xl font-bold">Free</div>
          ) : (
            <div className="space-y-2">
              {/* Show original price if available (for Decoy Effect) */}
              {plan.originalPrice && (
                <div className="text-lg text-muted-foreground line-through">
                  ${plan.originalPrice}/month
                </div>
              )}
              
              <div className="text-4xl font-bold">
                {plan.priceDisplay}
              </div>
              
              {plan.originalPrice && (
                <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Save ${plan.originalPrice - plan.price}/month
                </div>
              )}
              
              {!isFreePlan && <p className="text-muted-foreground text-sm">per month, billed monthly</p>}
              
              {annualSavings && (
                <div className="text-sm text-muted-foreground">
                  <div className="line-through">${plan.price * 12}/year</div>
                  <div className="text-green-600 font-medium">
                    ${annualSavings.annualPrice}/year 
                    <span className="text-xs">({annualSavings.savingsPercent}% off)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Usage Limits Display */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Usage Limits</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Forms:</span>
              <span>{typeof plan.limits.forms === 'number' ? plan.limits.forms : 'Unlimited'}</span>
            </div>
            <div className="flex justify-between">
              <span>Responses:</span>
              <span>{typeof plan.limits.responses === 'number' ? plan.limits.responses.toLocaleString() : 'Unlimited'}</span>
            </div>
            <div className="flex justify-between">
              <span>API Calls:</span>
              <span>{typeof plan.limits.apiCalls === 'number' ? plan.limits.apiCalls.toLocaleString() : 'Unlimited'}</span>
            </div>
            {plan.limits.aiGenerations && (
              <div className="flex justify-between">
                <span>AI Generations:</span>
                <span>{typeof plan.limits.aiGenerations === 'number' ? plan.limits.aiGenerations.toLocaleString() : 'Unlimited'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Storage:</span>
              <span>{plan.limits.storage}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          variant={getButtonVariant()}
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSelectPlan(plan.id)}
        >
          {isLoading ? 'Processing...' : getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PricingCard;