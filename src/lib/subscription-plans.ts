import { SubscriptionPlan } from './types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceDisplay: 'Free',
    tier: 'free',
    features: [
      '3 forms per month',
      'Unlimited responses',
      '25 API calls per month',
      '5 AI generations per month',
      'Basic analytics',
      'Community support',
      '500MB storage'
    ],
    limits: {
      forms: 3,
      responses: 'unlimited',
      storage: '500MB',
      apiCalls: 25,
      aiGenerations: 5,
      teamMembers: 1
    },
    creemProductId: null
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Everything you need to scale',
    price: 29,
    priceDisplay: '$29/month',
    originalPrice: 49,
    originalPriceDisplay: '$49/month',
    tier: 'pro',
    popular: true,
    badge: 'BEST VALUE',
    features: [
      'Unlimited forms',
      'Unlimited responses',
      'Unlimited API calls',
      'Unlimited AI generations',
      'Advanced analytics & insights',
      'Priority email & chat support',
      'White-label branding',
      'Advanced integrations',
      'Webhook support',
      'Team collaboration (up to 10 members)',
      'Unlimited storage',
      'Custom domains',
      'Export to Excel/CSV',
      'Advanced form logic',
      'Custom CSS styling',
      'API access',
      'Zapier integration',
      'Remove AIForm branding'
    ],
    limits: {
      forms: 'unlimited',
      responses: 'unlimited',
      storage: 'unlimited',
      apiCalls: 'unlimited',
      aiGenerations: 'unlimited',
      teamMembers: 10
    },
    creemProductId: process.env.CREEM_PRO_PRODUCT_ID || 'prod_pro'
  }
];

export const getSubscriptionPlan = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === planId);
};

export const getSubscriptionPlanByTier = (tier: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.tier === tier);
};

export const getFreePlan = (): SubscriptionPlan => {
  return subscriptionPlans[0]; // Free plan is always first
};

export const getPaidPlans = (): SubscriptionPlan[] => {
  return subscriptionPlans.filter(plan => plan.price > 0);
};

/**
 * Utility class untuk subscription plans
 */
export class SubscriptionPlanUtils {
  private static planHierarchy = ['free', 'pro'];

  static getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
    return getSubscriptionPlan(planId);
  }

  /**
   * Cek apakah plan adalah upgrade dari plan saat ini
   */
  static isUpgrade(currentPlanId: string, targetPlanId: string): boolean {
    const currentIndex = this.planHierarchy.indexOf(currentPlanId);
    const targetIndex = this.planHierarchy.indexOf(targetPlanId);
    
    return targetIndex > currentIndex;
  }

  /**
   * Get the Pro plan with Decoy Effect pricing
   */
  static getProPlan(): SubscriptionPlan {
    return subscriptionPlans.find(plan => plan.id === 'pro')!;
  }

  /**
   * Check if current plan has access to unlimited features
   */
  static hasUnlimitedAccess(planId: string): boolean {
    return planId === 'pro';
  }

  /**
   * Cek apakah plan adalah downgrade dari plan saat ini
   */
  static isDowngrade(currentPlanId: string, targetPlanId: string): boolean {
    const currentIndex = this.planHierarchy.indexOf(currentPlanId);
    const targetIndex = this.planHierarchy.indexOf(targetPlanId);
    
    return targetIndex < currentIndex;
  }

  /**
   * Mendapatkan limit untuk action tertentu
   */
  static getActionLimit(planId: string, action: string): number {
    const plan = this.getSubscriptionPlan(planId);
    if (!plan) return 0;

    const actionLimitMap: Record<string, keyof typeof plan.limits> = {
      'form_creation': 'forms',
      'form_submission': 'responses',
      'api_call': 'apiCalls',
      'ai_generation': 'aiGenerations'
    };

    const limitKey = actionLimitMap[action];
    if (!limitKey) return 0;

    const limit = plan.limits[limitKey];
    if (typeof limit === 'string' && (limit === 'unlimited' || limit === 'Unlimited')) {
      return -1; // Unlimited
    }
    
    return typeof limit === 'number' ? limit : 0;
  }

  /**
   * Format harga untuk display
   */
  static formatPrice(plan: SubscriptionPlan): string {
    if (plan.price === 0) {
      return 'Free';
    }

    return `$${plan.price}/month`;
  }

  /**
   * Mendapatkan savings jika upgrade ke annual
   */
  static getAnnualSavings(monthlyPrice: number): { annualPrice: number; savings: number; savingsPercent: number } {
    const annualPrice = monthlyPrice * 10; // 2 bulan gratis
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - annualPrice;
    const savingsPercent = Math.round((savings / monthlyTotal) * 100);

    return {
      annualPrice,
      savings,
      savingsPercent
    };
  }

  /**
   * Cek apakah feature tersedia di plan
   */
  static hasFeature(planId: string, feature: string): boolean {
    const plan = this.getSubscriptionPlan(planId);
    if (!plan) return false;

    return plan.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  /**
   * Mendapatkan rekomendasi plan berdasarkan usage
   */
  static getRecommendedPlan(usage: {
    formsCreated: number;
    responsesReceived: number;
    apiCallsUsed: number;
    aiGenerationsUsed: number;
  }): SubscriptionPlan {
    const freePlan = subscriptionPlans.find(plan => plan.id === 'free')!;
    const proPlan = subscriptionPlans.find(plan => plan.id === 'pro')!;
    
    // Cek apakah free plan masih bisa menampung usage
    const freeFormsLimit = this.getActionLimit('free', 'form_creation');
    const freeResponsesLimit = this.getActionLimit('free', 'form_submission');
    const freeApiLimit = this.getActionLimit('free', 'api_call');
    const freeAiLimit = this.getActionLimit('free', 'ai_generation');
    
    const canHandleWithFree = (
      usage.formsCreated <= freeFormsLimit &&
      usage.responsesReceived <= freeResponsesLimit &&
      usage.apiCallsUsed <= freeApiLimit &&
      usage.aiGenerationsUsed <= freeAiLimit
    );
    
    // Jika free plan masih cukup, return free
    if (canHandleWithFree) {
      return freePlan;
    }
    
    // Jika tidak, recommend Pro plan (unlimited)
    return proPlan;
  }

  /**
   * Mendapatkan usage percentage untuk plan
   */
  static getUsagePercentage(planId: string, usage: Record<string, number>): Record<string, number> {
    const plan = this.getSubscriptionPlan(planId);
    if (!plan) return {};

    const percentages: Record<string, number> = {};
    
    const usageMap = {
      formsCreated: this.getActionLimit(planId, 'form_creation'),
      responsesReceived: this.getActionLimit(planId, 'form_submission'),
      apiCallsUsed: this.getActionLimit(planId, 'api_call'),
      aiGenerationsUsed: this.getActionLimit(planId, 'ai_generation')
    };

    for (const [key, limit] of Object.entries(usageMap)) {
      if (limit === -1) {
        percentages[key] = 0; // Unlimited
      } else {
        const used = usage[key] || 0;
        percentages[key] = Math.min((used / limit) * 100, 100);
      }
    }

    return percentages;
  }

  /**
   * Cek apakah user sudah mencapai limit
   */
  static isLimitReached(planId: string, action: string, currentUsage: number): boolean {
    const limit = this.getActionLimit(planId, action);
    if (limit === -1) return false; // Unlimited
    
    return currentUsage >= limit;
  }

  /**
   * Mendapatkan plan berdasarkan Creem product ID
   */
  static getPlanByCreemProductId(productId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(plan => plan.creemProductId === productId);
  }
}