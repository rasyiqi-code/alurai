'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    title: string;
  }>;
  realTimeUsers: number;
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: {
    organic: number;
    direct: number;
    social: number;
    referral: number;
  };
}

export function RealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const initializeAnalytics = () => {
      setIsLoading(true);
      
      // Simulate real-time analytics data collection
      const collectAnalyticsData = (): AnalyticsData => {
        // In a real implementation, this would connect to Google Analytics API
        // or your analytics service to get live data
        
        const baseData = {
          pageViews: Math.floor(Math.random() * 1000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 500) + 200,
          bounceRate: Math.random() * 30 + 20, // 20-50%
          averageSessionDuration: Math.random() * 300 + 120, // 2-7 minutes
          realTimeUsers: Math.floor(Math.random() * 20) + 5,
          deviceTypes: {
            desktop: Math.floor(Math.random() * 60) + 30,
            mobile: Math.floor(Math.random() * 40) + 20,
            tablet: Math.floor(Math.random() * 20) + 5,
          },
          trafficSources: {
            organic: Math.floor(Math.random() * 50) + 30,
            direct: Math.floor(Math.random() * 30) + 20,
            social: Math.floor(Math.random() * 20) + 10,
            referral: Math.floor(Math.random() * 15) + 5,
          },
          topPages: [
            { path: '/', views: Math.floor(Math.random() * 200) + 100, title: 'Homepage' },
            { path: '/create', views: Math.floor(Math.random() * 150) + 75, title: 'Create Form' },
            { path: '/forms', views: Math.floor(Math.random() * 100) + 50, title: 'My Forms' },
            { path: '/analytics', views: Math.floor(Math.random() * 80) + 40, title: 'Analytics' },
            { path: '/pricing', views: Math.floor(Math.random() * 60) + 30, title: 'Pricing' },
          ],
        };

        return baseData;
      };

      const updateAnalytics = () => {
        const newData = collectAnalyticsData();
        setAnalyticsData(newData);
        setLastUpdated(new Date());
        setIsLoading(false);
      };

      // Initial data load
      updateAnalytics();

      // Set up real-time updates every 10 seconds
      const interval = setInterval(updateAnalytics, 10000);

      return () => clearInterval(interval);
    };

    const cleanup = initializeAnalytics();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading analytics data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Analytics
            <Badge variant="outline" className="ml-auto">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.pageViews.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Page Views</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.uniqueVisitors.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Unique Visitors</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <MousePointer className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.bounceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Bounce Rate</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(analyticsData.averageSessionDuration / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg. Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {analyticsData.realTimeUsers}
            </div>
            <div className="text-muted-foreground">
              Users currently on your website
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Types */}
      <Card>
        <CardHeader>
          <CardTitle>Device Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Desktop</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceTypes.desktop}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceTypes.desktop}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Mobile</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceTypes.mobile}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceTypes.mobile}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Tablet</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.deviceTypes.tablet}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analyticsData.deviceTypes.tablet}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {analyticsData.trafficSources.organic}%
              </div>
              <div className="text-sm text-muted-foreground">Organic Search</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {analyticsData.trafficSources.direct}%
              </div>
              <div className="text-sm text-muted-foreground">Direct</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {analyticsData.trafficSources.social}%
              </div>
              <div className="text-sm text-muted-foreground">Social</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-orange-600">
                {analyticsData.trafficSources.referral}%
              </div>
              <div className="text-sm text-muted-foreground">Referral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{page.title}</div>
                  <div className="text-sm text-muted-foreground">{page.path}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{page.views.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">views</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
