import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { SubscriptionService } from '@/lib/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create billing portal session
    const portalUrl = await SubscriptionService.createBillingPortalSession(user.id);

    return NextResponse.json({
      url: portalUrl
    });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}