import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';

export async function POST(request: NextRequest) {
  try {
    console.log('Creem Webhook: Received webhook');
    
    const body = await request.json();
    console.log('Creem Webhook: Payload:', JSON.stringify(body, null, 2));
    
    // Verify webhook signature (optional but recommended for production)
    const signature = request.headers.get('x-creem-signature');
    console.log('Creem Webhook: Signature:', signature);
    
    // Handle different webhook events
    const eventType = body.type || body.event_type;
    console.log('Creem Webhook: Event type:', eventType);
    
    switch (eventType) {
      case 'payment.succeeded':
      case 'checkout.completed':
        await handlePaymentSuccess(body);
        break;
        
      case 'payment.failed':
      case 'checkout.failed':
        await handlePaymentFailed(body);
        break;
        
      case 'subscription.created':
        await handleSubscriptionCreated(body);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(body);
        break;
        
      default:
        console.log('Creem Webhook: Unknown event type:', eventType);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Creem Webhook: Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: any) {
  console.log('Creem Webhook: Handling payment success');
  
  try {
    const userId = payload.metadata?.user_id || payload.customer_id;
    const planId = payload.metadata?.plan_id || 'pro';
    
    if (!userId) {
      console.error('Creem Webhook: No user ID found in payload');
      return;
    }
    
    console.log('Creem Webhook: Activating subscription for user:', userId, 'plan:', planId);
    
    await SubscriptionService.updateSubscription(userId, {
      planId: planId,
      status: 'active',
      creemSubscriptionId: payload.subscription_id || payload.checkout_id || payload.id,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancelAtPeriodEnd: false,
    });
    
    console.log('Creem Webhook: Subscription activated successfully');
    
  } catch (error) {
    console.error('Creem Webhook: Error activating subscription:', error);
  }
}

async function handlePaymentFailed(payload: any) {
  console.log('Creem Webhook: Handling payment failed');
  // Handle failed payment - maybe send notification to user
}

async function handleSubscriptionCreated(payload: any) {
  console.log('Creem Webhook: Handling subscription created');
  // Handle subscription creation
}

async function handleSubscriptionCancelled(payload: any) {
  console.log('Creem Webhook: Handling subscription cancelled');
  
  try {
    const userId = payload.metadata?.user_id || payload.customer_id;
    
    if (!userId) {
      console.error('Creem Webhook: No user ID found in payload');
      return;
    }
    
    // Downgrade to free plan
    await SubscriptionService.updateSubscription(userId, {
      planId: 'free',
      status: 'cancelled',
      creemSubscriptionId: payload.subscription_id,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      cancelAtPeriodEnd: true,
    });
    
    console.log('Creem Webhook: Subscription cancelled and downgraded to free');
    
  } catch (error) {
    console.error('Creem Webhook: Error cancelling subscription:', error);
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Creem webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}