import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SocialMediaTester } from '@/components/seo/SocialMediaTester';
import { SEOMonitor } from '@/components/seo/SEOMonitor';
import { RealTimeAnalytics } from '@/components/analytics/RealTimeAnalytics';
import { GoogleSearchConsoleStatus } from '@/components/seo/GoogleSearchConsoleStatus';
import { GoogleAnalyticsStatus } from '@/components/analytics/GoogleAnalyticsStatus';
import { 
  BarChart3, 
  Search, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Zap,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO Monitoring Dashboard',
  description: 'Monitor and track SEO performance, analytics, and optimization metrics for AlurAI',
};

// Real-time data will be provided by the SEOMonitor component
// This page now uses live data instead of mock data

export default function SEOMonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your website's SEO performance and optimization metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live Monitoring Active
          </Badge>
        </div>
      </div>

      {/* Real-time SEO Monitor with all data */}
      <SEOMonitor />

      {/* Real-time Analytics */}
      <RealTimeAnalytics />

      {/* Google Search Console Status */}
      <GoogleSearchConsoleStatus />

      {/* Google Analytics Status */}
      <GoogleAnalyticsStatus />

      {/* Social Media Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Meta Tags Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <SocialMediaTester />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick SEO Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                <span className="font-medium">Google Search Console</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Monitor search performance and indexing status
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">PageSpeed Insights</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Test page speed and Core Web Vitals
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">Rich Results Test</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Test structured data and rich snippets
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
