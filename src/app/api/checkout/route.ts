import { NextRequest, NextResponse } from 'next/server';
import { creemService } from '@/lib/creem-service';
import { SubscriptionService } from '@/lib/subscription-service';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.error('Checkout error: User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    const { planId, userEmail } = body;
    
    console.log('Checkout request:', { planId, userEmail, userId });

    if (!planId || !userEmail) {
      console.error('Checkout error: Missing required fields', { planId, userEmail });
      return NextResponse.json(
        { error: 'Missing required fields: planId, userEmail' },
        { status: 400 }
      );
    }

    // Validasi plan ID
    const validPlans = ['free', 'pro'];
    if (!validPlans.includes(planId)) {
      console.error('Checkout error: Invalid plan ID', { planId, validPlans });
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Cek apakah user sudah memiliki subscription aktif
    const currentSubscription = await SubscriptionService.getUserSubscription(userId);
    if (currentSubscription && currentSubscription.status === 'active' && currentSubscription.planId !== 'free') {
      console.error('Checkout error: User already has active subscription', { currentSubscription });
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Dapatkan product ID dari Creem berdasarkan plan
    const productId = creemService.getCreemProductId(planId);
    console.log('Product ID for plan:', { planId, productId });
    
    if (!productId) {
      console.error('Checkout error: Product not found for plan', { planId });
      return NextResponse.json(
        { error: 'Product not found for this plan' },
        { status: 400 }
      );
    }

          // Buat checkout session
          try {
            const checkoutSession = await creemService.createCheckoutSession({
              productId,
              userId,
              userEmail,
              planId,
              successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=pro`,
              cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
              webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/creem`,
            });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    } catch (creemError) {
      console.error('Creem API failed, using fallback URL:', creemError);
      
      // Fallback: gunakan direct checkout URL dari environment
      const baseFallbackUrl = process.env.CREEM_CHECKOUT_URL || `https://www.creem.io/payment/${productId}`;
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=pro`;
      const fallbackUrl = `${baseFallbackUrl}?success_url=${encodeURIComponent(successUrl)}`;
      
      return NextResponse.json({
        checkoutUrl: fallbackUrl,
        sessionId: `fallback_${Date.now()}`,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint untuk mengecek status checkout session
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const session = await creemService.getCheckoutSession(sessionId);
    
    return NextResponse.json({
      status: session.status,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error getting checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to get checkout session' },
      { status: 500 }
    );
  }
}