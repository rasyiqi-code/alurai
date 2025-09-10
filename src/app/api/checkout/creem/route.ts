import { NextRequest, NextResponse } from 'next/server';
import { creemService } from '@/lib/creem-service';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId || planId === 'free') {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Dapatkan product ID Creem berdasarkan plan ID
    const productId = creemService.getCreemProductId(planId);
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product not found for this plan' },
        { status: 400 }
      );
    }

    // URL untuk redirect setelah pembayaran
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?payment=success&plan=${planId}`;
    const cancelUrl = `${baseUrl}/pricing?payment=canceled`;

    // Buat checkout session
    const checkoutSession = await creemService.createCheckoutSession({
      productId,
      userId: user.id,
      userEmail: user.primaryEmail || '',
      planId,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Error creating Creem checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Dapatkan detail checkout session
    const checkoutSession = await creemService.getCheckoutSession(sessionId);

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error('Error getting Creem checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to get checkout session' },
      { status: 500 }
    );
  }
}