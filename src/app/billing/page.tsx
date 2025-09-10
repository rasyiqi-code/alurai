import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { stackServerApp } from '@/stack';
import { SubscriptionService } from '@/lib/subscription-service';
import { BillingDashboard } from '@/components/billing/BillingDashboard';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Billing & Subscription - ALU FormAI',
  description: 'Manage your subscription, view usage statistics, and billing information.',
};

export default async function BillingPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  let subscription = null;
  let usage = {
    formsUsed: 0,
    responsesUsed: 0,
    storageUsed: 0,
    apiCallsUsed: 0,
    aiGenerationsUsed: 0,
    period: 'month' as const
  };

  try {
    // Get user subscription
    subscription = await SubscriptionService.getUserSubscription(user.id);
    
    // Get usage statistics
    const usageStats = await SubscriptionService.getUserUsage(user.id);
    
    // Map UsageStats to expected format
    usage = {
      formsUsed: usageStats.formsCreated || 0,
      responsesUsed: usageStats.responsesReceived || 0,
      storageUsed: usageStats.storageUsed || 0,
      apiCallsUsed: usageStats.apiCallsUsed || 0,
      aiGenerationsUsed: usageStats.aiGenerationsUsed || 0,
      period: 'month' as const
    };
  } catch (error) {
    console.error('Error fetching billing data:', error);
    // Continue with default values
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, view usage statistics, and billing information.
          </p>
        </div>
        
        <BillingDashboard 
          subscription={subscription}
          usage={usage}
        />
      </div>
    </div>
  );
}