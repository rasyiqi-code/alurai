import axios from 'axios';
import crypto from 'crypto';
import { SubscriptionPlan } from './types';

interface CreemCheckoutSession {
  id: string;
  url: string;
  status: string;
  metadata?: Record<string, any>;
}

interface CreemWebhookEvent {
  id: string;
  eventType: string;
  created_at: number;
  object: {
    id: string;
    subscription?: {
      id: string;
      status: string;
      customer: string;
      product: string;
      metadata?: Record<string, any>;
    };
    customer?: {
      id: string;
      email: string;
      name: string;
    };
    metadata?: Record<string, any>;
  };
}

class CreemService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CREEM_API_KEY || '';
    this.baseUrl = process.env.CREEM_BASE_URL || '';
  }

  private getHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Membuat checkout session untuk subscription
   */
  async createCheckoutSession({
    productId,
    userId,
    userEmail,
    planId,
    successUrl,
    cancelUrl,
    webhookUrl,
  }: {
    productId: string;
    userId: string;
    userEmail: string;
    planId: string;
    successUrl?: string;
    cancelUrl?: string;
    webhookUrl?: string;
  }): Promise<CreemCheckoutSession> {
    try {
      console.log('Creating checkout session with:', {
        url: `${this.baseUrl}/v1/checkouts`,
        baseUrl: this.baseUrl,
        productId,
        userId,
        userEmail,
        planId,
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT_SET',
        mode: this.apiKey.includes('test') ? 'TEST' : 'PRODUCTION'
      });
      
      const response = await axios.post(
        `${this.baseUrl}/v1/checkouts`,
        {
          product_id: productId,
          customer_email: userEmail,
          success_url: successUrl,
          cancel_url: cancelUrl,
          webhook_url: webhookUrl,
          metadata: {
            user_id: userId,
            plan_id: planId
          }
        },
        {
          headers: this.getHeaders(),
        }
      );

      console.log('Checkout session created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Creem checkout session:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
      }
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Mendapatkan detail checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<CreemCheckoutSession> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/checkouts/${sessionId}`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting Creem checkout session:', error);
      throw new Error('Failed to get checkout session');
    }
  }

  /**
   * Mendapatkan subscription berdasarkan ID
   */
  async getSubscription(subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/subscriptions/${subscriptionId}`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting Creem subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  /**
   * Membatalkan subscription
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/subscriptions/${subscriptionId}/cancel`,
        {},
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error canceling Creem subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Memverifikasi webhook signature menggunakan HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET || '';
    
    if (!webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    try {
      // Creem menggunakan HMAC-SHA256 untuk signature verification
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');
      
      // Signature biasanya dalam format "sha256=<hash>"
      const providedSignature = signature.startsWith('sha256=') 
        ? signature.slice(7) 
        : signature;
      
      // Gunakan crypto.timingSafeEqual untuk mencegah timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Memproses webhook event
   */
  processWebhookEvent(event: CreemWebhookEvent) {
    switch (event.eventType) {
      case 'checkout.completed':
        return this.handleCheckoutCompleted(event);
      case 'subscription.created':
        return this.handleSubscriptionCreated(event);
      case 'subscription.updated':
        return this.handleSubscriptionUpdated(event);
      case 'subscription.canceled':
        return this.handleSubscriptionCanceled(event);
      default:
        console.log(`Unhandled webhook event type: ${event.eventType}`);
        return null;
    }
  }

  private handleCheckoutCompleted(event: CreemWebhookEvent) {
    const { subscription, customer, metadata } = event.object;
    
    return {
      type: 'checkout_completed',
      userId: metadata?.userId,
      subscriptionId: subscription?.id,
      customerId: customer?.id,
      planId: metadata?.planId,
    };
  }

  private handleSubscriptionCreated(event: CreemWebhookEvent) {
    const { subscription, metadata } = event.object;
    
    return {
      type: 'subscription_created',
      userId: metadata?.userId,
      subscriptionId: subscription?.id,
      status: subscription?.status,
      planId: metadata?.planId,
    };
  }

  private handleSubscriptionUpdated(event: CreemWebhookEvent) {
    const { subscription, metadata } = event.object;
    
    return {
      type: 'subscription_updated',
      userId: metadata?.userId,
      subscriptionId: subscription?.id,
      status: subscription?.status,
      planId: metadata?.planId,
    };
  }

  private handleSubscriptionCanceled(event: CreemWebhookEvent) {
    const { subscription, metadata } = event.object;
    
    return {
      type: 'subscription_canceled',
      userId: metadata?.userId,
      subscriptionId: subscription?.id,
      planId: metadata?.planId,
    };
  }

  /**
   * Mapping plan ID internal ke product ID Creem
   */
  getCreemProductId(planId: string): string {
    const productMapping: Record<string, string> = {
      'free': '', // Free plan tidak memerlukan product ID
      'pro': process.env.CREEM_PRO_PRODUCT_ID || 'prod_pro',
    };

    return productMapping[planId] || '';
  }
}

export const creemService = new CreemService();
export type { CreemCheckoutSession, CreemWebhookEvent };