'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CheckCircle, Download, AlertTriangle, CreditCard, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { QuotaDashboard } from "@/components/quota/QuotaDisplay";
import { SubscriptionPlanUtils } from "@/lib/subscription-plans";
import { UsageAction } from "@/lib/usage-tracker";
import { toast } from 'sonner';
import Link from 'next/link';

interface BillingDashboardProps {
  subscription: any;
  usage: any;
}

export function BillingDashboard({ subscription, usage }: BillingDashboardProps) {
  if (!subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subscription found</p>
        <Link href="/pricing">
          <Button className="mt-4">Choose a Plan</Button>
        </Link>
      </div>
    );
  }

  const currentPlan = SubscriptionPlanUtils.getSubscriptionPlan(subscription.planId);

  if (!currentPlan) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Invalid subscription plan</p>
        <Link href="/pricing">
          <Button className="mt-4">Choose a Plan</Button>
        </Link>
      </div>
    );
  }

  const quotaActions = [
    { action: 'forms' as UsageAction, title: 'Forms', description: 'Number of forms created' },
    { action: 'responses' as UsageAction, title: 'Responses', description: 'Form responses received' },
    { action: 'aiGenerations' as UsageAction, title: 'AI Generations', description: 'AI-powered form generations' },
    { action: 'teamMembers' as UsageAction, title: 'Team Members', description: 'Team members invited' },
  ];

  const isPaidPlan = currentPlan.tier !== "free";

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const getStatusBadge = () => {
    if (!subscription || subscription.planId === 'free') {
      return <Badge variant="secondary">Free Plan</Badge>;
    }

    switch (subscription.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge variant="default" className="bg-blue-500">Trial</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground mb-4">{currentPlan.description}</p>
              <div className="text-3xl font-bold">
                {currentPlan.priceDisplay}
                {currentPlan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
              </div>
            </div>
            
            {subscription && subscription.planId !== 'free' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Next billing: {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                
                {subscription.cancelAtPeriodEnd && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription will be canceled on {formatDate(subscription.currentPeriodEnd)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          {isPaidPlan && (
            <Button onClick={handleManageSubscription} className="w-full mt-6">
              Manage Subscription
            </Button>
          )}
          
          {!isPaidPlan && (
            <Link href="/pricing">
              <Button className="w-full mt-6">
                Upgrade Plan
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Your current usage against plan limits.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuotaDashboard actions={quotaActions} />
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Features included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {subscription && subscription.planId !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              Download invoices and view payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Billing history will be available here.</p>
              <p className="text-sm mt-2">Contact support for invoice requests.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BillingDashboard;