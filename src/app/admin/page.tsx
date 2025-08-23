'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { getAdminOverviewAction, getGeminiUsageAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Send, TrendingUp, Zap, Activity } from 'lucide-react';
import Link from 'next/link';

interface OverviewData {
  totalUsers: number;
  totalForms: number;
  totalSubmissions: number;
  recentForms: Array<{
    id: string;
    title?: string;
    status?: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  }>;
}

interface GeminiUsageData {
  totalTokensUsed: number;
  requestsCount: number;
  lastUpdated: string;
  quotaLimit?: number;
  costEstimate?: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [geminiUsage, setGeminiUsage] = useState<GeminiUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewResult, usageResult] = await Promise.all([
          getAdminOverviewAction(),
          getGeminiUsageAction()
        ]);
        
        if ('error' in overviewResult) {
          setError(overviewResult.error || 'An error occurred');
        } else {
          setData(overviewResult as OverviewData);
        }
        
        if ('usage' in usageResult && usageResult.usage) {
          setGeminiUsage(usageResult.usage);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard...</div>
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all platform activity and statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalForms || 0}</div>
              <p className="text-xs text-muted-foreground">
                Forms created by all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Submissions across all forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Submissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.totalForms && data?.totalForms > 0 
                  ? Math.round((data?.totalSubmissions || 0) / data.totalForms * 10) / 10
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Per form average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {geminiUsage ? Math.round(geminiUsage.totalTokensUsed / 1000) : 0}K
              </div>
              <p className="text-xs text-muted-foreground">
                Tokens used this month
              </p>
              {geminiUsage && geminiUsage.quotaLimit && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Usage</span>
                    <span>{Math.round((geminiUsage.totalTokensUsed / geminiUsage.quotaLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((geminiUsage.totalTokensUsed / geminiUsage.quotaLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>
              Latest forms created across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentForms && data.recentForms.length > 0 ? (
              <div className="space-y-4">
                {data.recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{form.title || 'Untitled Form'}</h3>
                        <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                          {form.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(form.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/forms/${form.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No forms found
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Usage Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>API Usage Details</span>
            </CardTitle>
            <CardDescription>
              Detailed information about Gemini API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {geminiUsage ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{geminiUsage.totalTokensUsed.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Requests Count</p>
                  <p className="text-2xl font-bold">{geminiUsage.requestsCount.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Cost Estimate</p>
                  <p className="text-2xl font-bold">${geminiUsage.costEstimate?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{new Date(geminiUsage.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Loading API usage data...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href="/admin/users">
              <CardHeader>
                <CardTitle className="text-lg">Manage Users</CardTitle>
                <CardDescription>
                  View and manage all platform users
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href="/admin/forms">
              <CardHeader>
                <CardTitle className="text-lg">Manage Forms</CardTitle>
                <CardDescription>
                  View and manage all forms across the platform
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href="/admin/analytics">
              <CardHeader>
                <CardTitle className="text-lg">Global Analytics</CardTitle>
                <CardDescription>
                  View platform-wide analytics and insights
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}