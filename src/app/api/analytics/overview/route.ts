import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const overview = await AnalyticsService.getAnalyticsOverview(user.id, days);
    
    if (!overview) {
      return NextResponse.json({ error: 'No analytics data found' }, { status: 404 });
    }

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error getting analytics overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
