'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { getGlobalAnalyticsAction } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Calendar, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AnalyticsData {
  formsByDate: { [key: string]: number };
  topForms: Array<{
    id: string;
    title: string;
    submissionCount: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const result = await getGlobalAnalyticsAction();
        if ('error' in result) {
          setError(result.error || 'An error occurred');
        } else {
          setData(result as AnalyticsData);
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getFormsByDateArray = () => {
    if (!data?.formsByDate) return [];
    
    return Object.entries(data.formsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  const getTotalFormsCreated = () => {
    if (!data?.formsByDate) return 0;
    return Object.values(data.formsByDate).reduce((sum, count) => sum + count, 0);
  };

  const getAverageFormsPerDay = () => {
    const formsArray = getFormsByDateArray();
    if (formsArray.length === 0) return 0;
    return Math.round((getTotalFormsCreated() / formsArray.length) * 10) / 10;
  };

  const getTotalSubmissions = () => {
    if (!data?.topForms) return 0;
    return data.topForms.reduce((sum, form) => sum + form.submissionCount, 0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading analytics...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Global Analytics</h1>
          <p className="text-muted-foreground">
            Platform-wide analytics and insights (Last 30 days)
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forms Created</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalFormsCreated()}</div>
              <p className="text-xs text-muted-foreground">
                In the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Forms/Day</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageFormsPerDay()}</div>
              <p className="text-xs text-muted-foreground">
                Daily average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSubmissions()}</div>
              <p className="text-xs text-muted-foreground">
                Across all forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Form</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.topForms && data.topForms.length > 0 
                  ? data.topForms[0].submissionCount 
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Most submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Forms Created Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Forms Created Over Time</CardTitle>
            <CardDescription>
              Daily form creation activity in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getFormsByDateArray().length > 0 ? (
              <div className="space-y-4">
                {/* Simple bar chart representation */}
                <div className="space-y-2">
                  {getFormsByDateArray().map(({ date, count }) => {
                    const maxCount = Math.max(...getFormsByDateArray().map(item => item.count));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={date} className="flex items-center space-x-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          {formatDate(date)}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-6 relative">
                          <div 
                            className="bg-primary rounded-full h-6 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-xs text-primary-foreground font-medium">
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No form creation data available for the last 30 days
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Forms</CardTitle>
            <CardDescription>
              Forms ranked by submission count
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topForms && data.topForms.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Form Title</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topForms.map((form, index) => {
                      const maxSubmissions = data.topForms[0]?.submissionCount || 1;
                      const percentage = (form.submissionCount / maxSubmissions) * 100;
                      
                      return (
                        <TableRow key={form.id}>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {index === 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  #{index + 1}
                                </Badge>
                              )}
                              {index === 1 && (
                                <Badge className="bg-gray-100 text-gray-800">
                                  #{index + 1}
                                </Badge>
                              )}
                              {index === 2 && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  #{index + 1}
                                </Badge>
                              )}
                              {index > 2 && (
                                <Badge variant="outline">
                                  #{index + 1}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {form.title || 'Untitled Form'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {form.id.substring(0, 8)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-lg font-semibold">
                              {form.submissionCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(percentage)}% of top performer
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No forms with submissions found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}