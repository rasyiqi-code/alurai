import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Paddle webhook secret from environment
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';
const REVENUECAT_API_KEY = process.env.REVENUECAT_SECRET_API_KEY || '';
const REVENUECAT_APP_ID = process.env.NEXT_PUBLIC_REVENUECAT_APP_ID || '';

// Verify Paddle webhook signature
function verifyPaddleSignature(body: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying Paddle signature:', error);
    return false;
  }
}

// Send transaction to RevenueCat
async function sendToRevenueCat(transactionData: any): Promise<void> {
  try {
    const revenueCatPayload = {
      app_user_id: transactionData.custom_data?.userId || transactionData.customer_id,
      fetch_token: transactionData.subscription_id || transactionData.transaction_id,
      product_id: transactionData.custom_data?.planId || 'unknown',
      price: transactionData.unit_price?.amount || 0,
      currency: transactionData.unit_price?.currency_code || 'USD',
      payment_processor: 'paddle',
      introductory_price: null,
      is_restore: false
    };

    const response = await fetch(`https://api.revenuecat.com/v1/apps/${REVENUECAT_APP_ID}/receipts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Platform': 'web'
      },
      body: JSON.stringify(revenueCatPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RevenueCat API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Successfully sent transaction to RevenueCat:', result);
  } catch (error) {
    console.error('Failed to send transaction to RevenueCat:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature') || '';

    // Verify webhook signature
    if (!verifyPaddleSignature(body, signature, PADDLE_WEBHOOK_SECRET)) {
      console.error('Invalid Paddle webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log('Received Paddle webhook:', event.event_type);

    // Handle different Paddle events
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'transaction.completed':
        // Send successful transactions to RevenueCat
        if (event.data) {
          await sendToRevenueCat(event.data);
        }
        break;

      case 'subscription.canceled':
      case 'subscription.paused':
        // Handle subscription cancellations/pauses
        console.log('Subscription canceled/paused:', event.data?.subscription_id);
        // You might want to update user status in your database here
        break;

      case 'transaction.payment_failed':
        // Handle failed payments
        console.log('Payment failed:', event.data?.transaction_id);
        break;

      default:
        console.log('Unhandled Paddle event type:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ message: 'Paddle webhook endpoint is active' });
}