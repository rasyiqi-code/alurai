import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@stackframe/stack';
import { UsageAction } from '@/lib/usage-tracker';
import { toast } from 'sonner';

export interface QuotaStatus {
  currentUsage: number;
  limit: number | -1;
  percentage: number;
  isUnlimited: boolean;
  canPerform: boolean;
}

export interface UseQuotaResult {
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
  checkQuota: (amount?: number) => Promise<boolean>;
  trackUsage: (amount?: number) => Promise<boolean>;
  refreshQuota: () => Promise<void>;
}

/**
 * Hook to manage quota checking and usage tracking
 */
export function useQuota(action: UsageAction): UseQuotaResult {
  const user = useUser();
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${user.id}:${action}`;
    const cached = singleQuotaCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < QUOTA_CACHE_TTL) {
      setQuota(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/quota/check?action=${action}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quota information');
      }

      const data = await response.json();
      
      const isUnlimited = data.limit === -1;
      const percentage = isUnlimited ? 0 : Math.round((data.currentUsage / data.limit) * 100);
      
      const quotaData = {
        currentUsage: data.currentUsage,
        limit: data.limit,
        percentage,
        isUnlimited,
        canPerform: data.allowed
      };
      
      setQuota(quotaData);
      
      // Cache the result
      singleQuotaCache.set(cacheKey, {
        data: quotaData,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn('Error fetching quota:', err);
      // Set fallback quota on error
      setQuota({
        currentUsage: 0,
        limit: -1,
        percentage: 0,
        isUnlimited: true,
        canPerform: true
      });
      setError(null); // Don't show error to user, use fallback instead
    } finally {
      setLoading(false);
    }
  }, [user, action]);

  const checkQuota = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/quota/check?action=${action}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to check quota');
      }

      const data = await response.json();
      return data.allowed;
    } catch (error) {
      console.warn('Error checking quota:', error);
      return true; // Allow on error for better UX
    }
  }, [user, action]);

  const trackUsage = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/quota/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error(errorData.message || 'Quota exceeded');
        }
        return false;
      }

      // Refresh quota after tracking
      await fetchQuota();
      return true;
    } catch (err) {
      console.error('Error tracking usage:', err);
      toast.error('Failed to track usage');
      return false;
    }
  }, [user, action, fetchQuota]);

  const refreshQuota = useCallback(async () => {
    await fetchQuota();
  }, [fetchQuota]);

  useEffect(() => {
    fetchQuota();
  }, [user, action]);

  return {
    quota,
    loading,
    error,
    checkQuota,
    trackUsage,
    refreshQuota,
  };
}

/**
 * Hook to manage multiple quotas at once
 */
// Cache for quota data to reduce API calls
const quotaCache = new Map<string, { data: Record<UsageAction, QuotaStatus>; timestamp: number }>();
const singleQuotaCache = new Map<string, { data: QuotaStatus; timestamp: number }>();
const QUOTA_CACHE_TTL = 30 * 1000; // 30 seconds cache

export function useMultipleQuotas(actions: UsageAction[]) {
  const user = useUser();
  const [quotas, setQuotas] = useState<Record<UsageAction, QuotaStatus>>({} as Record<UsageAction, QuotaStatus>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize actions array to prevent unnecessary re-fetches
  const memoizedActions = useMemo(() => [...actions].sort(), [actions.join(',')]);

  const fetchQuotas = useCallback(async () => {
    if (!user || memoizedActions.length === 0) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${user.id}:${memoizedActions.join(',')}`;
    const cached = quotaCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < QUOTA_CACHE_TTL) {
      setQuotas(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const promises = memoizedActions.map(async (action) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`/api/quota/check?action=${action}`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch quota for ${action}`);
          }
          const data = await response.json();
          
          const isUnlimited = data.limit === -1;
          const percentage = isUnlimited ? 0 : Math.round((data.currentUsage / data.limit) * 100);
          
          return {
            action,
            quota: {
              currentUsage: data.currentUsage,
              limit: data.limit,
              percentage,
              isUnlimited,
              canPerform: data.allowed
            }
          };
        } catch (error) {
          console.warn(`Failed to fetch quota for ${action}:`, error);
          // Return fallback data on error
          return {
            action,
            quota: {
              currentUsage: 0,
              limit: -1,
              percentage: 0,
              isUnlimited: true,
              canPerform: true
            }
          };
        }
      });

      const results = await Promise.all(promises);
      const quotaMap = results.reduce((acc, { action, quota }) => {
        acc[action] = quota;
        return acc;
      }, {} as Record<UsageAction, QuotaStatus>);

      setQuotas(quotaMap);
      
      // Cache the results
      quotaCache.set(cacheKey, {
        data: quotaMap,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching quotas:', err);
    } finally {
      setLoading(false);
    }
  }, [user, memoizedActions]);

  useEffect(() => {
    fetchQuotas();
  }, [user, memoizedActions]);

  return {
    quotas,
    loading,
    error,
    refreshQuotas: fetchQuotas,
  };
}

/**
 * Hook to show quota warnings when approaching limits
 */
export function useQuotaWarnings(action: UsageAction, warningThreshold: number = 80) {
  const { quota } = useQuota(action);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    if (quota && !quota.isUnlimited && quota.percentage >= warningThreshold && !hasShownWarning) {
      toast.warning(
        `You're approaching your ${action} limit (${quota.percentage}% used)`,
        {
          duration: 5000,
        }
      );
      setHasShownWarning(true);
    }

    // Reset warning when usage drops below threshold
    if (quota && quota.percentage < warningThreshold) {
      setHasShownWarning(false);
    }
  }, [quota, warningThreshold, hasShownWarning, action]);

  return quota;
}