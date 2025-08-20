import { Purchases, PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '';
const REVENUECAT_APP_ID = process.env.NEXT_PUBLIC_REVENUECAT_APP_ID || '';

export const initializeRevenueCat = async (userId?: string) => {
  try {
    // Initialize RevenueCat only in browser environment
    if (typeof window !== 'undefined' && REVENUECAT_API_KEY) {
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId || undefined, // Use provided userId or let RevenueCat generate anonymous ID
        usesStoreKit2IfAvailable: false,
        useAmazon: false,
        shouldShowInAppMessagesAutomatically: true
      });
      
      console.log('RevenueCat initialized successfully with App ID:', REVENUECAT_APP_ID);
    } else {
      throw new Error('RevenueCat API key not found or not in browser environment');
    }
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

// Get current offerings
export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Failed to purchase package:', error);
    return null;
  }
};

// Get customer info
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

// Check if user has active subscription
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;
    
    // Check if user has any active entitlements
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return null;
  }
};

// Log out user
export const logOutUser = async (): Promise<void> => {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to log out user:', error);
  }
};

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'prod9410c40a94', // RevenueCat Product ID untuk Basic
    name: 'Basic',
    description: 'Perfect for individuals',
    price: '$9.99/month',
    features: [
      'Up to 10 forms',
      'Basic analytics',
      'Email support',
      '1,000 responses/month'
    ]
  },
  {
    id: 'prodb281eda28d', // RevenueCat Product ID untuk Pro
    name: 'Pro',
    description: 'Best for growing businesses',
    price: '$29.99/month',
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
    id: 'prod52457a1ec7', // RevenueCat Product ID untuk Enterprise
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$99.99/month',
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