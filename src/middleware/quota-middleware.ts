import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { UsageTracker, UsageAction } from '@/lib/usage-tracker';

export interface QuotaConfig {
  action: UsageAction;
  amount?: number;
  skipPaths?: string[];
  onlyPaths?: string[];
}

/**
 * Middleware to enforce quota limits on API routes
 */
export function createQuotaMiddleware(config: QuotaConfig) {
  return async function quotaMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const { pathname } = request.nextUrl;
      
      // Check if path should be skipped
      if (config.skipPaths?.some(path => pathname.includes(path))) {
        return handler(request);
      }
      
      // Check if path is in only paths (if specified)
      if (config.onlyPaths && !config.onlyPaths.some(path => pathname.includes(path))) {
        return handler(request);
      }

      // Get user from request
      const user = await stackServerApp.getUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check quota
      const result = await UsageTracker.trackUsage(
        user.id,
        config.action,
        config.amount || 1
      );

      if (!result.success || result.quotaExceeded) {
        return NextResponse.json(
          {
            error: 'Quota exceeded',
            message: result.message,
            currentUsage: result.currentUsage,
            limit: result.limit,
            quotaType: config.action
          },
          { status: 429 }
        );
      }

      // Add usage info to response headers
      const response = await handler(request);
      response.headers.set('X-Usage-Current', result.currentUsage.toString());
      response.headers.set('X-Usage-Limit', result.limit.toString());
      response.headers.set('X-Usage-Action', config.action);

      return response;
    } catch (error) {
      console.error('Quota middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Higher-order function to wrap API route handlers with quota checking
 */
export function withQuota(config: QuotaConfig) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: any[]) => {
      const middleware = createQuotaMiddleware(config);
      return middleware(request, () => handler(request, ...args));
    }) as T;
  };
}

/**
 * Predefined quota configurations for common actions
 */
export const QuotaConfigs = {
  formCreation: {
    action: 'forms' as UsageAction,
    amount: 1
  },
  formResponse: {
    action: 'responses' as UsageAction,
    amount: 1
  },
  apiCall: {
    action: 'apiCalls' as UsageAction,
    amount: 1
  },
  aiGeneration: {
    action: 'aiGenerations' as UsageAction,
    amount: 1
  },
  fileUpload: (sizeInMB: number) => ({
    action: 'storage' as UsageAction,
    amount: sizeInMB
  }),
  teamMemberInvite: {
    action: 'teamMembers' as UsageAction,
    amount: 1
  }
};

/**
 * Utility function to check quota without tracking usage
 */
export async function checkQuota(
  userId: string,
  action: UsageAction,
  amount: number = 1
): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number | -1;
  message?: string;
}> {
  try {
    // For now, return optimistic defaults to avoid performance issues
    // This allows users to use the app while we fix the underlying issues
    console.log(`Using optimistic quota check for ${userId}:${action}`);
    
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1, // Unlimited for now
      message: undefined
    };
  } catch (error) {
    console.error('Error checking quota:', error);
    // Return safe defaults on error
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1,
      message: undefined
    };
  }
}