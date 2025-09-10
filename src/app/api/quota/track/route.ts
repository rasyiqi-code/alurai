import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { UsageTracker, UsageAction } from '@/lib/usage-tracker';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, amount = 1 } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions: UsageAction[] = ['forms', 'responses', 'storage', 'apiCalls', 'aiGenerations', 'teamMembers'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const result = await UsageTracker.trackUsage(user.id, action, amount);

    if (!result.success || result.quotaExceeded) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          message: result.message,
          currentUsage: result.currentUsage,
          limit: result.limit,
          quotaType: action
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      currentUsage: result.currentUsage,
      limit: result.limit,
      action,
      amount
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}