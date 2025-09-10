'use client';

import { useMemo } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Crown, Zap, Star, ArrowUp, Settings } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useQuota, useMultipleQuotas } from '@/hooks/use-quota';
import { subscriptionPlans } from '@/lib/subscription-plans';
import { UsageAction } from '@/lib/usage-tracker';
import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface SubscriptionStatusProps {
  variant?: 'header' | 'dashboard';
  showProgress?: boolean;
}

export function SubscriptionStatus({ 
  variant = 'header', 
  showProgress = false 
}: SubscriptionStatusProps) {
  const { subscription, loading } = useSubscription();
  const user = useUser();

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
  
  // Memoize actions array to prevent unnecessary re-fetches
  const actions = useMemo(() => ['forms', 'responses', 'storage', 'apiCalls', 'aiGenerations'] as UsageAction[], []);
  const { quotas, loading: quotaLoading, error } = useMultipleQuotas(actions);
  
  // Create usage object from quota data
  const usage = quotas ? {
    forms: quotas.forms?.currentUsage || 0,
    responses: quotas.responses?.currentUsage || 0,
    storage: quotas.storage?.currentUsage || 0,
    apiCalls: quotas.apiCalls?.currentUsage || 0,
    aiGenerations: quotas.aiGenerations?.currentUsage || 0
  } : null;
  
  // Create quota object for backward compatibility
  const quota = quotas?.forms ? {
    forms: quotas.forms.limit,
    responses: quotas.responses?.limit || 0,
    storage: quotas.storage?.limit || 0,
    apiCalls: quotas.apiCalls?.limit || 0,
    aiGenerations: quotas.aiGenerations?.limit || 0
  } : null;

  if (loading || quotaLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-16 bg-muted rounded-full"></div>
      </div>
    );
  }

  const currentPlan = subscription?.planId 
    ? subscriptionPlans.find(plan => plan.id === subscription.planId) 
    : subscriptionPlans[0]; // Default to Free plan

  const tierColors = {
    free: 'bg-gray-100 text-gray-800 border-gray-200',
    pro: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const tierIcons = {
    free: null,
    pro: <Crown className="h-3 w-3" />
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (variant === 'header') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${tierColors[currentPlan?.id as keyof typeof tierColors] || tierColors.free} 
                         flex items-center gap-1 text-xs font-medium border cursor-pointer
                         hover:opacity-80 transition-opacity`}
            >
              {tierIcons[currentPlan?.id as keyof typeof tierIcons]}
              {currentPlan?.name || 'Free'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3 max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold text-sm">
                {currentPlan?.name || 'Free'} Plan
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Forms:</span>
                  <span>
                    {usage?.forms || 0} / {quota?.forms === -1 ? '∞' : quota?.forms || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Responses:</span>
                  <span>
                    {formatNumber(usage?.responses || 0)} / {quota?.responses === -1 ? '∞' : formatNumber(quota?.responses || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span>
                    {formatNumber(usage?.storage || 0)}MB / {quota?.storage === -1 ? '∞' : formatNumber(quota?.storage || 0)}MB
                  </span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Dashboard variant with detailed view
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`${tierColors[currentPlan?.id as keyof typeof tierColors] || tierColors.free} 
                       flex items-center gap-1 text-sm font-medium border`}
          >
            {tierIcons[currentPlan?.id as keyof typeof tierIcons]}
            {currentPlan?.name || 'Free'} Plan
          </Badge>
          {currentPlan?.price && (
            <span className="text-sm text-muted-foreground">
              ${currentPlan.price}/month
            </span>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Forms Used</span>
              <span>{usage?.forms || 0} / {quota?.forms === -1 ? '∞' : quota?.forms || 0}</span>
            </div>
            {quota?.forms !== -1 && (
              <Progress 
                value={getUsagePercentage(usage?.forms || 0, quota?.forms || 0)} 
                className="h-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Responses</span>
              <span>{formatNumber(usage?.responses || 0)} / {quota?.responses === -1 ? '∞' : formatNumber(quota?.responses || 0)}</span>
            </div>
            {quota?.responses !== -1 && (
              <Progress 
                value={getUsagePercentage(usage?.responses || 0, quota?.responses || 0)} 
                className="h-2"
              />
            )}
          </div>



          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>AI Generations</span>
              <span>{formatNumber(usage?.aiGenerations || 0)} / {quota?.aiGenerations === -1 ? '∞' : formatNumber(quota?.aiGenerations || 0)}</span>
            </div>
            {quota?.aiGenerations !== -1 && (
              <Progress 
                value={getUsagePercentage(usage?.aiGenerations || 0, quota?.aiGenerations || 0)} 
                className="h-2"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        {currentPlan?.tier === 'free' ? (
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={handleUpgrade}
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        ) : (
          <Link href="/billing">
            <Button size="sm" variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}