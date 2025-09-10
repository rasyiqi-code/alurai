import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SubscriptionService } from '@/lib/subscription-service';
import { Header } from '@/components/header';
import { stackServerApp } from '@/stack';
import { BrandingWrapper } from '@/components/branding/BrandingWrapper';

export const metadata: Metadata = {
  title: 'White-Label Branding - AluForm',
  description: 'Customize your forms with white-label branding options',
};

export default async function BrandingPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user subscription to determine tier and premium status
  const subscription = await SubscriptionService.getUserSubscription(user.id);
  const isPremium = subscription?.tier === 'pro' || subscription?.tier === 'enterprise';
  const currentTier = subscription?.tier || 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              White-Label Branding
            </h1>
            <p className="text-gray-600">
              Customize your forms with your own branding and styling.
            </p>
          </div>
          
          <BrandingWrapper 
            isPremium={isPremium}
            currentTier={currentTier as 'free' | 'pro' | 'enterprise'}
          />
        </div>
      </main>
    </div>
  );
}