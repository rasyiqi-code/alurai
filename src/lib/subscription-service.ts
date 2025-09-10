import { UserSubscription, UsageStats, SubscriptionTier } from './types';
import { getSubscriptionPlan, getFreePlan } from './subscription-plans';
import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

export class SubscriptionService {
  
  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionSnap = await getDoc(subscriptionRef);
      
      if (subscriptionSnap.exists()) {
        const data = subscriptionSnap.data();
        return {
          id: subscriptionSnap.id,
          userId: data.userId,
          planId: data.planId,
          tier: data.tier,
          status: data.status,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripeCustomerId: data.stripeCustomerId,
          creemSubscriptionId: data.creemSubscriptionId,
          creemCustomerId: data.creemCustomerId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }
      
      // If no subscription found, create a free plan subscription
      const freePlan = getFreePlan();
      const defaultSubscription: UserSubscription = {
        id: userId,
        userId,
        planId: freePlan.id,
        tier: freePlan.tier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save default subscription to Firebase
      await setDoc(subscriptionRef, defaultSubscription);
      return defaultSubscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  // Get user's usage statistics
  static async getUserUsage(userId: string): Promise<UsageStats> {
    try {
      const usageRef = doc(db, 'usage', userId);
      const usageSnap = await getDoc(usageRef);
      
      if (usageSnap.exists()) {
        const data = usageSnap.data();
        return {
          userId: data.userId,
          formsCreated: data.formsCreated || 0,
          responsesReceived: data.responsesReceived || 0,
          storageUsed: data.storageUsed || 0,
          apiCallsUsed: data.apiCallsUsed || 0,
          aiGenerationsUsed: data.aiGenerationsUsed || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          period: data.period
        };
      }
      
      // If no usage found, create initial usage record
      const initialUsage: UsageStats = {
        userId,
        formsCreated: 0,
        responsesReceived: 0,
        storageUsed: 0,
        apiCallsUsed: 0,
        aiGenerationsUsed: 0,
        lastUpdated: new Date().toISOString()
      };
      
      // Save initial usage to Firebase
      await setDoc(usageRef, initialUsage);
      return initialUsage;
    } catch (error) {
      console.error('Error getting user usage:', error);
      // Return default usage on error
      return {
        userId,
        formsCreated: 0,
        responsesReceived: 0,
        storageUsed: 0,
        apiCallsUsed: 0,
        aiGenerationsUsed: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Check if user can perform an action based on their plan limits
  static async canPerformAction(
    userId: string, 
    action: 'create_form' | 'receive_response' | 'use_storage' | 'api_call',
    amount: number = 1
  ): Promise<{ 
    allowed: boolean; 
    reason?: string;
    currentUsage: number;
    limit: number | -1;
    planId: string;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getUserUsage(userId);
    
    if (!subscription) {
      return { 
        allowed: false, 
        reason: 'No active subscription found',
        currentUsage: 0,
        limit: 0,
        planId: 'free'
      };
    }

    const plan = getSubscriptionPlan(subscription.planId);
    if (!plan) {
      return { 
        allowed: false, 
        reason: 'Invalid subscription plan',
        currentUsage: 0,
        limit: 0,
        planId: subscription.planId
      };
    }

    switch (action) {
      case 'create_form':
        const formsLimit = plan.limits.forms === 'unlimited' ? -1 : plan.limits.forms;
        if (plan.limits.forms === 'unlimited') {
          return { 
            allowed: true,
            currentUsage: usage.formsCreated,
            limit: -1,
            planId: subscription.planId
          };
        }
        if (usage.formsCreated + amount > plan.limits.forms) {
          return { 
            allowed: false, 
            reason: `Form limit exceeded. Your ${plan.name} plan allows ${plan.limits.forms} forms.`,
            currentUsage: usage.formsCreated,
            limit: formsLimit,
            planId: subscription.planId
          };
        }
        return {
          allowed: true,
          currentUsage: usage.formsCreated,
          limit: formsLimit,
          planId: subscription.planId
        };

      case 'receive_response':
        const responsesLimit = plan.limits.responses === 'unlimited' ? -1 : plan.limits.responses;
        if (plan.limits.responses === 'unlimited') {
          return { 
            allowed: true,
            currentUsage: usage.responsesReceived,
            limit: -1,
            planId: subscription.planId
          };
        }
        if (usage.responsesReceived + amount > plan.limits.responses) {
          return { 
            allowed: false, 
            reason: `Response limit exceeded. Your ${plan.name} plan allows ${plan.limits.responses} responses per month.`,
            currentUsage: usage.responsesReceived,
            limit: responsesLimit,
            planId: subscription.planId
          };
        }
        return {
          allowed: true,
          currentUsage: usage.responsesReceived,
          limit: responsesLimit,
          planId: subscription.planId
        };

      case 'api_call':
        const apiCallsLimit = plan.limits.apiCalls === 'unlimited' ? -1 : plan.limits.apiCalls;
        if (plan.limits.apiCalls === 'unlimited') {
          return { 
            allowed: true,
            currentUsage: usage.apiCallsUsed,
            limit: -1,
            planId: subscription.planId
          };
        }
        if (usage.apiCallsUsed + amount > plan.limits.apiCalls) {
          return { 
            allowed: false, 
            reason: `API call limit exceeded. Your ${plan.name} plan allows ${plan.limits.apiCalls} API calls per month.`,
            currentUsage: usage.apiCallsUsed,
            limit: apiCallsLimit,
            planId: subscription.planId
          };
        }
        return {
          allowed: true,
          currentUsage: usage.apiCallsUsed,
          limit: apiCallsLimit,
          planId: subscription.planId
        };

      default:
        return { 
          allowed: true,
          currentUsage: 0,
          limit: -1,
          planId: subscription.planId
        };
    }
  }

  // Update usage statistics
  static async updateUsage(
    userId: string,
    updates: Partial<Omit<UsageStats, 'userId' | 'lastUpdated'>>
  ): Promise<void> {
    try {
      const usageRef = doc(db, 'usage', userId);
      
      // Prepare increment updates
      const incrementUpdates: any = {
        lastUpdated: new Date().toISOString()
      };
      
      // Convert updates to increment operations
      if (updates.formsCreated !== undefined) {
        incrementUpdates.formsCreated = increment(updates.formsCreated);
      }
      if (updates.responsesReceived !== undefined) {
        incrementUpdates.responsesReceived = increment(updates.responsesReceived);
      }
      if (updates.storageUsed !== undefined) {
        incrementUpdates.storageUsed = increment(updates.storageUsed);
      }
      if (updates.apiCallsUsed !== undefined) {
        incrementUpdates.apiCallsUsed = increment(updates.apiCallsUsed);
      }
      if (updates.aiGenerationsUsed !== undefined) {
        incrementUpdates.aiGenerationsUsed = increment(updates.aiGenerationsUsed);
      }
      
      // Check if document exists, if not create it first
      const usageSnap = await getDoc(usageRef);
      if (!usageSnap.exists()) {
        await setDoc(usageRef, {
          userId,
          formsCreated: 0,
          responsesReceived: 0,
          storageUsed: 0,
          apiCallsUsed: 0,
          aiGenerationsUsed: 0,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Update with increments
      await updateDoc(usageRef, incrementUpdates);
    } catch (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
  }

  // Set usage to specific amount
  static async setUsage(
    userId: string, 
    type: 'forms' | 'responses' | 'storage' | 'apiCalls', 
    amount: number
  ): Promise<void> {
    try {
      const usageRef = doc(db, 'usage', userId);
      
      // Map type to field name
      const fieldMap = {
        forms: 'formsCreated',
        responses: 'responsesReceived',
        storage: 'storageUsed',
        apiCalls: 'apiCallsUsed'
      };
      
      const fieldName = fieldMap[type];
      
      // Check if document exists, if not create it first
      const usageSnap = await getDoc(usageRef);
      if (!usageSnap.exists()) {
        await setDoc(usageRef, {
          userId,
          formsCreated: 0,
          responsesReceived: 0,
          storageUsed: 0,
          apiCallsUsed: 0,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Update specific field
      await updateDoc(usageRef, {
        [fieldName]: amount,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error setting usage:', error);
      throw error;
    }
  }

  // Create or update subscription
  static async createSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string,
    creemSubscriptionId?: string,
    creemCustomerId?: string
  ): Promise<UserSubscription> {
    try {
      const plan = getSubscriptionPlan(planId);
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      const subscription: UserSubscription = {
        id: userId,
        userId,
        planId,
        tier: plan.tier,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId,
        stripeCustomerId,
        creemSubscriptionId,
        creemCustomerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firebase
      const subscriptionRef = doc(db, 'subscriptions', userId);
      await setDoc(subscriptionRef, subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Update subscription
  static async updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      
      // Add updatedAt timestamp
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(subscriptionRef, updateData);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      
      const updateData: Partial<UserSubscription> = {
        cancelAtPeriodEnd,
        updatedAt: new Date().toISOString()
      };
      
      // If immediate cancellation, set status to cancelled
      if (!cancelAtPeriodEnd) {
        updateData.status = 'cancelled';
      }
      
      await updateDoc(subscriptionRef, updateData);
      
      // TODO: Add Stripe/Creem cancellation logic here
      // This would involve calling the respective payment provider's API
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }



  // Get subscription tier for user
  static async getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.tier || 'free';
  }

  // Check if user has access to premium features
  static async hasPremiumAccess(userId: string): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    return ['pro', 'enterprise'].includes(tier);
  }

  // Check if user has enterprise features
  static async hasEnterpriseAccess(userId: string): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    return tier === 'enterprise';
  }

  // Create billing portal session (simplified implementation)
  static async createBillingPortalSession(userId: string): Promise<string> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        throw new Error('No subscription found');
      }

      // For now, return the billing page URL
      // In a real implementation, this would create a session with the payment provider
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return `${baseUrl}/billing`;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }
}