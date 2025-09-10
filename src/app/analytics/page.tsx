import { getFormsAction, getAnalyticsOverviewAction, getFormAnalyticsAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFlowData } from '@/lib/types';
import { BarChart, Eye, MessageSquare, FileText, Star, TrendingUp, Clock, Users, Target, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';
import { generateMetadata as generateSEOMetadata, metaDescriptions, metaKeywords } from '@/lib/seo-utils';
import type { Metadata } from 'next';
import { stackServerApp } from '@/stack';
import { redirect } from 'next/navigation';
import { SubscriptionService } from '@/lib/subscription-service';
import { AnalyticsWrapper } from '@/components/analytics/AnalyticsWrapper';
import { FormAnalyticsCard } from '@/components/analytics/FormAnalyticsCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Analytics Dashboard',
  description: metaDescriptions.analytics,
  keywords: metaKeywords.analytics,
  path: '/analytics',
  ogImage: '/og-analytics.png',
  twitterImage: '/twitter-analytics.png',
});

export default async function AnalyticsDashboardPage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user subscription for premium features
  const subscription = await SubscriptionService.getUserSubscription(user.id);
  
  const formsResult = await getFormsAction();
  const overviewResult = await getAnalyticsOverviewAction();

  if ('error' in formsResult || 'error' in overviewResult) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{'error' in formsResult ? formsResult.error : 'error' in overviewResult ? overviewResult.error : 'An unknown error occurred'}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
  }

  const forms: FormFlowData[] = formsResult;
  const { 
    totalForms, 
    totalSubmissions, 
    totalViews,
    totalCompletions,
    avgConversionRate,
    avgCompletionRate,
    avgBounceRate,
    mostSubmittedForm,
    trends,
    deviceBreakdown,
    countryBreakdown,
    hourlyActivity
  } = overviewResult;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Analytics & Insights</h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        {forms.length > 0 ? (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalForms}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className={trends.views.change >= 0 ? "text-green-600" : "text-red-600"}>
                                {trends.views.change >= 0 ? "+" : ""}{trends.views.change.toFixed(1)}%
                            </span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className={trends.submissions.change >= 0 ? "text-green-600" : "text-red-600"}>
                                {trends.submissions.change >= 0 ? "+" : ""}{trends.submissions.change.toFixed(1)}%
                            </span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className={trends.conversion.change >= 0 ? "text-green-600" : "text-red-600"}>
                                {trends.conversion.change >= 0 ? "+" : ""}{trends.conversion.change.toFixed(1)}%
                            </span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4m</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600">+0.3m</span> from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Insights */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Submission Trends
                        </CardTitle>
                        <CardDescription>
                            Submission activity in the last 7 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(hourlyActivity).length > 0 ? (
                                Object.entries(hourlyActivity)
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .slice(0, 7)
                                    .map(([hour, count]) => {
                                        const maxCount = Math.max(...Object.values(hourlyActivity));
                                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                        const dayIndex = parseInt(hour) % 7;
                                        return (
                                            <div key={hour} className="flex items-center gap-3">
                                                <div className="w-16 text-sm text-muted-foreground">{dayNames[dayIndex]}</div>
                                                <div className="flex-1 bg-secondary rounded-full h-2">
                                                    <div 
                                                        className="bg-primary h-2 rounded-full transition-all" 
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-8 text-sm font-medium">{count}</div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    No activity data available yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Form Performance
                        </CardTitle>
                        <CardDescription>
                            Performance analysis based on engagement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Completion Rate</p>
                                    <p className="text-xs text-muted-foreground">Percentage of forms completed</p>
                                </div>
                                <div className="text-2xl font-bold text-green-600">{avgCompletionRate.toFixed(1)}%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Bounce Rate</p>
                                    <p className="text-xs text-muted-foreground">Visitors who leave immediately</p>
                                </div>
                                <div className="text-2xl font-bold text-red-600">{avgBounceRate.toFixed(1)}%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Total Views</p>
                                    <p className="text-xs text-muted-foreground">Total form views</p>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {mostSubmittedForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Most Popular Form</CardTitle>
                        <CardDescription>
                            This form has received the most submissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Star className="h-8 w-8 text-yellow-400" />
                            <div>
                                <p className="text-xl font-semibold font-headline">{mostSubmittedForm.title}</p>
                                <p className="text-muted-foreground">{mostSubmittedForm.count} submissions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Form Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Form Analytics Detail
                    </CardTitle>
                    <CardDescription>
                        In-depth analysis for each form
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {forms.map(form => (
                            <FormAnalyticsCard key={form.id} form={form} />
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                 <BarChart className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">No Forms Found</CardTitle>
                 <CardDescription>
                    You haven't created any forms yet. Once you create and share forms, their analytics will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Create Your First Form</Link>
                </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Advanced Analytics Section - TEMPORARILY UNLOCKED FOR TESTING */}
        <div className="mt-8">
          <AnalyticsWrapper 
            isPremium={true} // TEMPORARILY UNLOCKED FOR TESTING - Change back to subscription check when done
          />
        </div>
      </main>
    </div>
  );
}
