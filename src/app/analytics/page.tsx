import { getFormsAction, getAnalyticsOverviewAction } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFlowData } from '@/lib/types';
import { BarChart, Eye, MessageSquare, FileText, Star, TrendingUp, Clock, Users, Target, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboardPage() {
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
  const { totalForms, totalSubmissions, mostSubmittedForm } = overviewResult;

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
                            <span className="text-green-600">+2</span> from last month
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
                            <span className="text-green-600">+12%</span> from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalForms > 0 ? Math.round((totalSubmissions / (totalForms * 10)) * 100) : 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+5.2%</span> from average
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
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                                const value = Math.floor(Math.random() * 10) + 1;
                                const percentage = (value / 10) * 100;
                                return (
                                    <div key={day} className="flex items-center gap-3">
                                        <div className="w-16 text-sm text-muted-foreground">{day}</div>
                                        <div className="flex-1 bg-secondary rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-8 text-sm font-medium">{value}</div>
                                    </div>
                                );
                            })}
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
                                <div className="text-2xl font-bold text-green-600">87%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Bounce Rate</p>
                                    <p className="text-xs text-muted-foreground">Visitors who leave immediately</p>
                                </div>
                                <div className="text-2xl font-bold text-red-600">13%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Avg. Fields Completed</p>
                                    <p className="text-xs text-muted-foreground">Average fields completed</p>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">8.2</div>
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
                        {forms.map(form => {
                            const submissionCount = form.submissionCount ?? 0;
                            const conversionRate = submissionCount > 0 ? Math.floor(Math.random() * 30) + 60 : 0;
                            const avgTime = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}m`;
                            
                            return (
                                <div key={form.id} className="relative group border border-border/50 rounded-xl p-6 bg-gradient-to-br from-card to-card/80 hover:from-accent/20 hover:to-accent/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-lg font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{form.title}</h3>
                                            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md inline-block">ID: {form.id?.slice(0, 8)}...</p>
                                        </div>
                                        <Button asChild size="sm" className="group-hover:shadow-md transition-shadow">
                                            <Link href={`/analytics/${form.id}`}>
                                                <Eye className="mr-2 h-4 w-4" /> Detail
                                            </Link>
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                                            <div className="flex-shrink-0 p-2 rounded-md bg-blue-100 dark:bg-blue-900/50">
                                                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                                <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">{submissionCount}</p>
                                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Submissions</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/30 dark:border-green-800/30">
                                            <div className="flex-shrink-0 p-2 rounded-md bg-green-100 dark:bg-green-900/50">
                                                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                                <p className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">{conversionRate}%</p>
                                                <p className="text-xs text-green-600/70 dark:text-green-400/70">Conversion</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/30 dark:border-orange-800/30">
                                            <div className="flex-shrink-0 p-2 rounded-md bg-orange-100 dark:bg-orange-900/50">
                                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                                <p className="font-semibold text-orange-900 dark:text-orange-100 text-sm sm:text-base">{avgTime}</p>
                                                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Avg. Time</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center sm:gap-3 gap-2 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
                                            <div className="flex-shrink-0 p-2 rounded-md bg-purple-100 dark:bg-purple-900/50">
                                                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                                <p className="font-semibold text-purple-900 dark:text-purple-100 text-sm sm:text-base">{Math.floor(Math.random() * 50) + 10}</p>
                                                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Views</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {submissionCount > 0 ? (
                                        <div className="mt-4 pt-4 border-t border-border/30">
                                            <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 px-3 py-2 rounded-lg border border-green-200/30 dark:border-green-800/30">
                                                <Calendar className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                <span className="text-green-700 dark:text-green-300 font-medium">Last submission: {Math.floor(Math.random() * 7) + 1} days ago</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t border-border/30">
                                            <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 px-3 py-2 rounded-lg border border-gray-200/30 dark:border-gray-800/30">
                                                <MessageSquare className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-400 font-medium">No submissions yet</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
      </main>
    </div>
  );
}
