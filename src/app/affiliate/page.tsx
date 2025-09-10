import { Metadata } from 'next';
import { stackServerApp } from '@/stack';
import { redirect } from 'next/navigation';
import { SubscriptionService } from '@/lib/subscription-service';
import { Header } from '@/components/header';
import { AffiliateProgram } from '@/components/affiliate/AffiliateProgram';

export const metadata: Metadata = {
  title: 'Affiliate Program - AluForm',
  description: 'Join our affiliate program and earn 30% commission for every referral',
};

export default async function AffiliatePage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user subscription to pass to component
  const subscription = await SubscriptionService.getUserSubscription(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Affiliate Program
            </h1>
            <p className="text-gray-600">
              Earn 30% commission for every successful referral to AluForm.
            </p>
          </div>
          
          <AffiliateProgram subscription={subscription} />
        </div>
      </main>
    </div>
  );
}