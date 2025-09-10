import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { UsageTracker } from '@/lib/usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usageStats = await UsageTracker.getUserUsageStats(user.id);

    return NextResponse.json({
      success: true,
      usage: usageStats
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action) {
      // Validate action
      const validActions = ['forms', 'responses', 'storage', 'apiCalls', 'aiGenerations', 'teamMembers'];
      if (!validActions.includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
      }
      
      await UsageTracker.resetUserUsage(user.id, action as any);
    } else {
      await UsageTracker.resetUserUsage(user.id);
    }

    return NextResponse.json({
      success: true,
      message: action ? `Usage reset for ${action}` : 'All usage reset'
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}