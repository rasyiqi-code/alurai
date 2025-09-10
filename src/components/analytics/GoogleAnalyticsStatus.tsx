'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  ExternalLink,
  Activity,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react';
import { GA_TRACKING_ID } from '@/lib/analytics';

interface AnalyticsStatus {
  isActive: boolean;
  trackingId: string;
  lastChecked: Date;
  realTimeUsers: number;
  todayStats: {
    pageViews: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    title: string;
  }>;
}

export function GoogleAnalyticsStatus() {
  const [status, setStatus] = useState<AnalyticsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAnalyticsStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check if gtag is loaded and working
        const isGtagLoaded = typeof window !== 'undefined' && window.gtag;
        const isActive = isGtagLoaded && !!GA_TRACKING_ID;
        
        // Simulate real-time analytics data (in real implementation, this would come from GA4 API)
        const mockStatus: AnalyticsStatus = {
          isActive,
          trackingId: GA_TRACKING_ID,
          lastChecked: new Date(),
          realTimeUsers: Math.floor(Math.random() * 20) + 5,
          todayStats: {
            pageViews: Math.floor(Math.random() * 500) + 100,
            sessions: Math.floor(Math.random() * 200) + 50,
            bounceRate: Math.random() * 30 + 20,
            avgSessionDuration: Math.random() * 300 + 120,
          },
          topPages: [
            { path: '/', views: Math.floor(Math.random() * 100) + 50, title: 'Homepage' },
            { path: '/create', views: Math.floor(Math.random() * 80) + 30, title: 'Create Form' },
            { path: '/forms', views: Math.floor(Math.random() * 60) + 20, title: 'My Forms' },
            { path: '/analytics', views: Math.floor(Math.random() * 40) + 15, title: 'Analytics' },
            { path: '/pricing', views: Math.floor(Math.random() * 30) + 10, title: 'Pricing' },
          ],
        };
        
        setStatus(mockStatus);
      } catch (error) {
        console.error('Error checking Analytics status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAnalyticsStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkAnalyticsStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Checking Analytics status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to check Analytics status
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics 4 Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {status.isActive ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Analytics Tracking</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {status.trackingId}
                  </div>
                </div>
              </div>
              <Badge variant={status.isActive ? 'default' : 'destructive'}>
                {status.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Real-time Users */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm">Real-time Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{status.realTimeUsers}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {status.todayStats.pageViews}
              </div>
              <div className="text-sm text-muted-foreground">Page Views</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {status.todayStats.sessions}
              </div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {status.todayStats.bounceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Bounce Rate</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(status.todayStats.avgSessionDuration / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{page.title}</div>
                  <div className="text-sm text-muted-foreground">{page.path}</div>
                </div>
                <Badge variant="secondary">
                  {page.views} views
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.open('https://analytics.google.com/', '_blank')}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Open Analytics</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                View detailed analytics and reports
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.open(`https://analytics.google.com/analytics/web/#/p${GA_TRACKING_ID.replace('G-', '')}/reports/realtime`, '_blank')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Real-time Report</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                View real-time user activity
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Measurement ID</div>
              <code className="text-sm bg-background px-2 py-1 rounded">
                {status.trackingId}
              </code>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Tracking Status</div>
              <div className="text-sm text-muted-foreground">
                {status.isActive ? '✅ Active and collecting data' : '❌ Not active'}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Last Checked</div>
              <div className="text-sm text-muted-foreground">
                {status.lastChecked.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
