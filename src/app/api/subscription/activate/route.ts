import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
  try {
    console.log('Subscription activate API: Starting activation process')
    
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.log('Subscription activate API: No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Subscription activate API: User found:', user.id)

    const body = await request.json();
    const { planId, sessionId, checkoutId } = body;
    
    console.log('Subscription activate API: Request data:', { planId, sessionId, checkoutId })

    if (!planId) {
      console.log('Subscription activate API: Missing planId')
      return NextResponse.json(
        { error: 'Missing planId' },
        { status: 400 }
      );
    }

    console.log('Subscription activate API: Activating subscription for user:', user.id, 'plan:', planId)

    // Activate subscription after successful payment
    await SubscriptionService.updateSubscription(user.id, {
      planId: planId,
      status: 'active',
      creemSubscriptionId: sessionId || checkoutId || `activated_${Date.now()}`,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    console.log('Subscription activate API: Subscription updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      planId: planId
    });

  } catch (error) {
    console.error('Subscription activate API: Error activating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
