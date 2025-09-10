import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = AnalyticsService.getDeviceInfo(userAgent);

    switch (type) {
      case 'view':
        await AnalyticsService.trackFormView({
          formId: data.formId,
          userId: data.userId,
          sessionId: data.sessionId,
          userAgent,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          referrer: request.headers.get('referer') || undefined,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          country: data.country,
          city: data.city
        });
        break;

      case 'interaction':
        await AnalyticsService.trackFormInteraction({
          formId: data.formId,
          sessionId: data.sessionId,
          action: data.action,
          fieldId: data.fieldId,
          fieldType: data.fieldType,
          timeSpent: data.timeSpent,
          progress: data.progress
        });
        break;

      case 'submission':
        await AnalyticsService.trackFormSubmission({
          formId: data.formId,
          sessionId: data.sessionId,
          completionTime: data.completionTime,
          fieldsCompleted: data.fieldsCompleted,
          totalFields: data.totalFields,
          isComplete: data.isComplete,
          userAgent,
          device: deviceInfo.device,
          country: data.country
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
