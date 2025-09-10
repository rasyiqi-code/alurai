import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, count = 10 } = body;

    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }

    // Generate sample analytics data
    const sampleData = [];
    
    for (let i = 0; i < count; i++) {
      // Generate sample form view
      await AnalyticsService.trackFormView({
        formId,
        sessionId: `sample-session-${i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        device: i % 3 === 0 ? 'desktop' : i % 3 === 1 ? 'mobile' : 'tablet',
        browser: i % 4 === 0 ? 'Chrome' : i % 4 === 1 ? 'Firefox' : i % 4 === 2 ? 'Safari' : 'Edge',
        os: i % 3 === 0 ? 'Windows' : i % 3 === 1 ? 'macOS' : 'Linux',
        country: i % 5 === 0 ? 'Indonesia' : i % 5 === 1 ? 'Malaysia' : i % 5 === 2 ? 'Singapore' : i % 5 === 3 ? 'Thailand' : 'Others'
      });

      // Generate sample form interaction
      await AnalyticsService.trackFormInteraction({
        formId,
        sessionId: `sample-session-${i}`,
        action: 'start'
      });

      // Generate sample submission (70% completion rate)
      if (i % 10 < 7) {
        await AnalyticsService.trackFormSubmission({
          formId,
          sessionId: `sample-session-${i}`,
          completionTime: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          fieldsCompleted: Math.floor(Math.random() * 8) + 3, // 3-10 fields
          totalFields: 10,
          isComplete: true,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          device: i % 3 === 0 ? 'desktop' : i % 3 === 1 ? 'mobile' : 'tablet',
          country: i % 5 === 0 ? 'Indonesia' : i % 5 === 1 ? 'Malaysia' : i % 5 === 2 ? 'Singapore' : i % 5 === 3 ? 'Thailand' : 'Others'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${count} sample analytics records for form ${formId}` 
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
