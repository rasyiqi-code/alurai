import { Environments, Paddle, InitializePaddleOptions, initializePaddle as paddleInit, getPaddleInstance as getPaddle } from '@paddle/paddle-js';

// Paddle configuration
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
const PADDLE_ENVIRONMENT = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) || 'sandbox';
const REVENUECAT_API_KEY = process.env.REVENUECAT_SECRET_API_KEY || '';
const REVENUECAT_APP_ID = process.env.NEXT_PUBLIC_REVENUECAT_APP_ID || '';

// Initialize Paddle instance
let paddleInstance: Paddle | null = null;

export const initializePaddle = async (): Promise<Paddle | null> => {
  try {
    if (typeof window === 'undefined') {
      console.warn('Paddle can only be initialized in browser environment');
      return null;
    }

    if (!PADDLE_CLIENT_TOKEN) {
      console.warn('Paddle client token not configured');
      return null;
    }

    if (paddleInstance) {
      return paddleInstance;
    }

    const options: InitializePaddleOptions = {
      token: PADDLE_CLIENT_TOKEN,
      environment: PADDLE_ENVIRONMENT,
      checkout: {
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en'
        }
      }
    };

    console.log('Initializing Paddle with options:', {
      environment: PADDLE_ENVIRONMENT,
      hasToken: !!PADDLE_CLIENT_TOKEN,
      token: PADDLE_CLIENT_TOKEN.substring(0, 10) + '...'
    });

    // Initialize Paddle using the imported function
    paddleInstance = await paddleInit(options) || null;
    
    if (paddleInstance) {
      console.log('Paddle initialized successfully');
      return paddleInstance;
    } else {
      console.error('Paddle initialization returned null');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize Paddle:', error);
    return null;
  }
};

export const getPaddleInstance = (): Paddle | null => {
  return paddleInstance || getPaddle() || null;
};

// Subscription plans with Paddle price IDs
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
  paddlePriceId: string; // Paddle price ID
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals',
    price: '$9.99/month',
    paddlePriceId: 'pri_01gsz8x8gy4yjn3kpn31b8tjwf', // Paddle test price ID for sandbox
    features: [
      'Up to 10 forms',
      'Basic analytics',
      'Email support',
      '1,000 responses/month'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for growing businesses',
    price: '$29.99/month',
    paddlePriceId: 'pri_01gsz8x8gy4yjn3kpn31b8tjwg', // Paddle test price ID for sandbox
    features: [
      'Unlimited forms',
      'Advanced analytics',
      'Priority support',
      '10,000 responses/month',
      'Custom branding',
      'API access'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$99.99/month',
    paddlePriceId: 'pri_01gsz8x8gy4yjn3kpn31b8tjwh', // Paddle test price ID for sandbox
    features: [
      'Everything in Pro',
      'Unlimited responses',
      'Dedicated support',
      'Custom integrations',
      'SSO authentication',
      'Advanced security'
    ]
  }
];

// Open Paddle checkout
export const openPaddleCheckout = async (priceId: string, customData?: any): Promise<void> => {
  try {
    console.log('Opening Paddle checkout with priceId:', priceId);
    console.log('Custom data:', customData);
    
    // Check if we're in demo mode (invalid token or CSP issues)
    if (!PADDLE_CLIENT_TOKEN || PADDLE_CLIENT_TOKEN.startsWith('test_') || PADDLE_ENVIRONMENT === 'sandbox') {
      // Demo mode - simulate checkout
      const planName = customData?.planName || 'Selected Plan';
      
      // Show a more professional demo dialog
      const userConfirmed = window.confirm(
        `🚀 Demo Mode - Paddle Checkout\n\n` +
        `📦 Plan: ${planName}\n` +
        `💰 Price ID: ${priceId}\n\n` +
        `ℹ️  This is a demonstration of the checkout flow.\n` +
        `In production, this would process a real payment.\n\n` +
        `✅ Click OK to simulate successful payment\n` +
        `❌ Click Cancel to abort`
      );
      
      if (userConfirmed) {
        // Show processing state
        const processingDialog = window.confirm(
          `⏳ Processing payment...\n\n` +
          `This would normally take a few seconds.\n` +
          `Click OK to complete the demo transaction.`
        );
        
        if (processingDialog) {
          // Simulate successful payment
          window.location.href = '/subscription/success?demo=true&plan=' + encodeURIComponent(planName) + '&priceId=' + encodeURIComponent(priceId);
        }
      }
      return;
    }
    
    const paddle = await initializePaddle();
    if (!paddle) {
      throw new Error('Paddle not initialized');
    }

    console.log('Paddle instance ready, opening checkout...');
    
    const checkoutOptions = {
      items: [{ priceId, quantity: 1 }],
      customData: customData || {},
      settings: {
        displayMode: 'overlay' as const,
        theme: 'dark' as const,
        locale: 'en',
        successUrl: `${window.location.origin}/subscription/success`
      }
    };
    
    console.log('Checkout options:', checkoutOptions);
    
    await paddle.Checkout.open(checkoutOptions);
    console.log('Checkout opened successfully');
    
  } catch (error) {
    console.error('Failed to open Paddle checkout:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Check subscription status via RevenueCat API
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    if (!REVENUECAT_API_KEY || !REVENUECAT_APP_ID) {
      console.warn('RevenueCat API key or App ID not configured');
      return false;
    }

    const response = await fetch(`https://api.revenuecat.com/v1/apps/${REVENUECAT_APP_ID}/subscribers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // User not found, no subscription
        return false;
      }
      throw new Error(`RevenueCat API error: ${response.status}`);
    }

    const data = await response.json();
    const subscriber = data.subscriber;
    
    // Check if user has any active entitlements
    if (subscriber && subscriber.entitlements) {
      const activeEntitlements = Object.values(subscriber.entitlements).filter(
        (entitlement: any) => entitlement.expires_date === null || new Date(entitlement.expires_date) > new Date()
      );
      return activeEntitlements.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// Send Paddle transaction to RevenueCat
export const sendTransactionToRevenueCat = async (transactionData: any): Promise<void> => {
  try {
    // This will be implemented to send transaction data to RevenueCat
    // via webhook or API call
    console.log('Sending transaction to RevenueCat:', transactionData);
  } catch (error) {
    console.error('Failed to send transaction to RevenueCat:', error);
    throw error;
  }
};