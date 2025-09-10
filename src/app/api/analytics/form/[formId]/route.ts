import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { stackServerApp } from '@/stack';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const resolvedParams = await params;
    const formAnalytics = await AnalyticsService.getFormAnalytics(resolvedParams.formId, days);
    
    if (!formAnalytics) {
      return NextResponse.json({ error: 'No analytics data found for this form' }, { status: 404 });
    }

    return NextResponse.json(formAnalytics);
  } catch (error) {
    console.error('Error getting form analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
