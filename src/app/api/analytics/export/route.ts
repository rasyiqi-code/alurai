import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { SubscriptionService } from '@/lib/subscription-service';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has premium subscription
    const subscription = await SubscriptionService.getUserSubscription(user.id);
    if (!subscription || subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const range = searchParams.get('range') || '7d';

    // Get analytics data (reuse logic from advanced route)
    const analyticsData = await getAnalyticsDataForExport(user.id, range);

    if (format === 'csv') {
      const csvData = generateCSV(analyticsData);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${range}.csv"`
        }
      });
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePDF(analyticsData, range);
      
      return new NextResponse(pdfBuffer as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-${range}.pdf"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use csv or pdf' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}

async function getAnalyticsDataForExport(userId: string, range: string) {
  // Mock data for export - in real implementation, this would fetch from database
  return {
    summary: {
      totalViews: 1225,
      totalSubmissions: 495,
      conversionRate: 40.4,
      activeUsers: 67,
      period: range
    },
    formViews: [
      { date: '2024-01-01', views: 120, submissions: 45 },
      { date: '2024-01-02', views: 150, submissions: 62 },
      { date: '2024-01-03', views: 180, submissions: 71 },
      { date: '2024-01-04', views: 200, submissions: 89 },
      { date: '2024-01-05', views: 165, submissions: 55 },
      { date: '2024-01-06', views: 190, submissions: 78 },
      { date: '2024-01-07', views: 220, submissions: 95 }
    ],
    responseAnalytics: [
      { formId: '1', formTitle: 'Contact Form', responses: 234, conversionRate: 45.2 },
      { formId: '2', formTitle: 'Survey Form', responses: 189, conversionRate: 38.7 },
      { formId: '3', formTitle: 'Registration Form', responses: 156, conversionRate: 52.1 },
      { formId: '4', formTitle: 'Feedback Form', responses: 98, conversionRate: 29.3 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', count: 456, percentage: 52.3 },
      { device: 'Mobile', count: 321, percentage: 36.8 },
      { device: 'Tablet', count: 95, percentage: 10.9 }
    ],
    geographicData: [
      { country: 'Indonesia', users: 234, percentage: 45.2 },
      { country: 'Malaysia', users: 123, percentage: 23.8 },
      { country: 'Singapore', users: 89, percentage: 17.2 },
      { country: 'Thailand', users: 45, percentage: 8.7 },
      { country: 'Others', users: 27, percentage: 5.1 }
    ]
  };
}

function generateCSV(data: any): string {
  const lines: string[] = [];
  
  // Summary section
  lines.push('ANALYTICS SUMMARY');
  lines.push(`Period,${data.summary.period}`);
  lines.push(`Total Views,${data.summary.totalViews}`);
  lines.push(`Total Submissions,${data.summary.totalSubmissions}`);
  lines.push(`Conversion Rate,${data.summary.conversionRate}%`);
  lines.push(`Active Users,${data.summary.activeUsers}`);
  lines.push('');
  
  // Daily views and submissions
  lines.push('DAILY PERFORMANCE');
  lines.push('Date,Views,Submissions');
  data.formViews.forEach((row: any) => {
    lines.push(`${row.date},${row.views},${row.submissions}`);
  });
  lines.push('');
  
  // Form performance
  lines.push('FORM PERFORMANCE');
  lines.push('Form ID,Form Title,Responses,Conversion Rate');
  data.responseAnalytics.forEach((row: any) => {
    lines.push(`${row.formId},"${row.formTitle}",${row.responses},${row.conversionRate}%`);
  });
  lines.push('');
  
  // Device breakdown
  lines.push('DEVICE BREAKDOWN');
  lines.push('Device,Count,Percentage');
  data.deviceBreakdown.forEach((row: any) => {
    lines.push(`${row.device},${row.count},${row.percentage}%`);
  });
  lines.push('');
  
  // Geographic data
  lines.push('GEOGRAPHIC DISTRIBUTION');
  lines.push('Country,Users,Percentage');
  data.geographicData.forEach((row: any) => {
    lines.push(`${row.country},${row.users},${row.percentage}%`);
  });
  
  return lines.join('\n');
}

async function generatePDF(data: any, range: string): Promise<Buffer> {
  // For a real implementation, you would use a PDF library like puppeteer, jsPDF, or PDFKit
  // This is a simplified mock implementation
  
  const pdfContent = `
ANALYTICS REPORT
Period: ${range}

SUMMARY:
- Total Views: ${data.summary.totalViews}
- Total Submissions: ${data.summary.totalSubmissions}
- Conversion Rate: ${data.summary.conversionRate}%
- Active Users: ${data.summary.activeUsers}

DAILY PERFORMANCE:
${data.formViews.map((row: any) => `${row.date}: ${row.views} views, ${row.submissions} submissions`).join('\n')}

FORM PERFORMANCE:
${data.responseAnalytics.map((row: any) => `${row.formTitle}: ${row.responses} responses (${row.conversionRate}%)`).join('\n')}

DEVICE BREAKDOWN:
${data.deviceBreakdown.map((row: any) => `${row.device}: ${row.count} (${row.percentage}%)`).join('\n')}

GEOGRAPHIC DISTRIBUTION:
${data.geographicData.map((row: any) => `${row.country}: ${row.users} users (${row.percentage}%)`).join('\n')}
  `;
  
  // Convert text to buffer (in real implementation, this would be actual PDF generation)
  return Buffer.from(pdfContent, 'utf-8');
}